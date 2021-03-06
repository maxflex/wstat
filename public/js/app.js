(function() {
  $(document).ready(function() {
    Vue.directive('sortable', {
      bind: function(el, binding) {
        var sortable;
        return sortable = $(el).sortable(binding.value);
      }
    });
    return window.app = new Vue({
      el: '#app',
      mixins: [TransformMixin, ExportMixin, SortMixin, HelpersMixin, AddFromWordstat, RemoveDuplicates],
      data: {
        page: 'list',
        saving: false,
        addwords_error: false,
        phrase_search: '',
        lists: null,
        list: {
          title: null,
          phrases: []
        },
        new_list_phrases: [],
        modal: {
          value: ''
        },
        modal_phrase: {
          frequency: null,
          phrase: '',
          minus: ''
        },
        find_phrase: null,
        replace_phrase: null,
        center_title: null,
        frequencies: [],
        loading: false
      },
      created: function() {
        this.resourse = this.$resource('api/lists{/id}');
        if (ENV === 'local' && DEBUG_LIST_ID) {
          this.openList(DEBUG_LIST_ID);
        }
        return this._getFrequencies = (function(_this) {
          return function(region_id, step) {
            var length, phrases;
            if (step == null) {
              step = 0;
            }
            phrases = _this.list.phrases.slice(step * 100, (step * 100) + 100);
            length = _this.list.phrases.length / 10 * 10 + 100;
            _this.center_title = Math.round(step / length * 10000) + '%';
            return _this.$http.post('api/getFrequencies', {
              region_id: region_id,
              phrases: _.map(phrases, function(phrase) {
                return [phrase.phrase, phrase.minus].join(' ');
              })
            }).then(function(response) {
              _this.frequencies = _this.frequencies.concat(response.data);
              if (phrases.length === 100) {
                return _this._getFrequencies(region_id, step + 1);
              } else {
                _this.list.phrases.forEach(function(phrase, index) {
                  return phrase.frequency = _this.frequencies[index];
                });
                return _this.center_title = null;
              }
            }, function(response) {
              notifyError(response.data);
              return this.center_title = null;
            });
          };
        })(this);
      },
      methods: {
        runModal: function(action, title, placeholder, value) {
          if (placeholder == null) {
            placeholder = 'список слов или фраз...';
          }
          if (value == null) {
            value = null;
          }
          this.modal = {
            value: value,
            action: action,
            title: title,
            placeholder: placeholder
          };
          return showModal('main');
        },
        addWords: function() {
          var new_phrases;
          new_phrases = [];
          this.addwords_error = false;
          this.modal.value.split('\n').forEach((function(_this) {
            return function(line, index) {
              var frequency, list_item, minus, original, parsed_line, phrase, ref;
              if (_this.addwords_error) {
                return;
              }
              if (line.trim().length) {
                parsed_line = line.split('\t');
                if (parsed_line.length > 3) {
                  return _this.addWordsError(index, line, 'некорректрое форматирование');
                }
                phrase = parsed_line[0], frequency = parsed_line[1], original = parsed_line[2];

                /* PHRASE */
                if (!phrase) {
                  return _this.addWordsError(index, line, 'отсутствует основная фраза');
                }
                ref = _this.separateMinuses(phrase), phrase = ref[0], minus = ref[1];
                list_item = {
                  phrase: phrase,
                  minus: minus,
                  original: phrase
                };

                /* FREQUENCY */
                if (frequency) {
                  if (!$.isNumeric(frequency)) {
                    return _this.addWordsError(index, line, 'частота должна быть числом');
                  }
                  list_item.frequency = parseInt(frequency);
                }

                /* ORIGINAL */
                if (original) {
                  list_item.original = original;
                }
                return new_phrases.push(list_item);
              }
            };
          })(this));
          if (this.addwords_error) {
            return;
          }
          this.list.phrases = this.list.phrases.concat(new_phrases);
          this.modal.value = '';
          return closeModal();
        },
        addWordsError: function(index, line, message) {
          this.addwords_error = true;
          notifyError(message + "<br>строка " + (index + 1) + ": <i>" + line + "</i>");
          return false;
        },
        addMinuses: function() {
          var minuses;
          minuses = [];
          this.modal.value.split('\n').forEach(function(line) {
            var words;
            if (line.trim().length) {
              words = line.trim().split(' ');
              return minuses = minuses.concat(words);
            }
          });
          minuses.forEach((function(_this) {
            return function(word) {
              if (word[0] !== '-') {
                word = "-" + word;
              }
              return _this.list.phrases.forEach(function(phrase) {
                var minus_words;
                minus_words = !phrase.minus ? [] : phrase.minus.toWords();
                minus_words.push(word);
                return phrase.minus = minus_words.toPhrase();
              });
            };
          })(this));
          this.modal.value = '';
          return closeModal();
        },
        splitPhrasesToWords: function(phrases) {
          var new_phrases;
          if (phrases == null) {
            phrases = null;
          }
          new_phrases = [];
          (phrases || this.list.phrases).forEach(function(list_item) {
            return list_item.phrase.split(' ').forEach(function(word) {
              var item;
              word = word.trim();
              if (word.length) {
                item = _.extend(_.clone(list_item), {
                  phrase: word
                });
                delete item.id;
                return new_phrases.push(item);
              }
            });
          });
          if (phrases) {
            return new_phrases;
          } else {
            return this.list.phrases = new_phrases;
          }
        },
        replace: function() {
          this.list.phrases.forEach((function(_this) {
            return function(phrase) {
              return phrase.phrase = replaceWord(phrase.phrase, _this.find_phrase, _this.replace_phrase);
            };
          })(this));
          this.find_phrase = null;
          this.replace_phrase = null;
          return closeModal('replace');
        },
        lowercase: function() {
          return this.list.phrases.forEach(function(phrase) {
            return phrase.phrase = phrase.phrase.toLowerCase();
          });
        },
        getFrequencies: function(region_id) {
          this.frequencies = [];
          return this._getFrequencies(region_id);
        },
        configureMinus: function() {
          this.removeMinuses();
          this.list.phrases.forEach((function(_this) {
            return function(phrase) {
              var words_list;
              words_list = phrase.phrase.toWords();
              return _this.list.phrases.forEach(function(phrase2) {
                var difference, words_list2;
                if (phrase.phrase !== phrase2.phrase) {
                  words_list2 = phrase2.phrase.toWords();
                  if (words_list2.length === (words_list.length + 1)) {
                    difference = _.difference(words_list2, words_list);
                    if (difference.length === 1) {
                      if (!phrase.hasOwnProperty('minuses')) {
                        phrase.minuses = [];
                      }
                      return phrase.minuses.push("-" + difference[0]);
                    }
                  }
                }
              });
            };
          })(this));
          return this.list.phrases.forEach(function(phrase) {
            var minus_list;
            if (phrase.hasOwnProperty('minuses')) {
              minus_list = !phrase.minus ? [] : phrase.minus.toWords();
              minus_list = minus_list.concat(phrase.minuses);
              phrase.minus = minus_list.toPhrase();
              return delete phrase.minuses;
            }
          });
        },
        removeMinuses: function() {
          return this.list.phrases.forEach(function(phrase) {
            return phrase.minus = '';
          });
        },
        separateMinuses: function(phrase, minus) {
          var words;
          if (minus == null) {
            minus = [];
          }
          if (!$.isArray(minus)) {
            minus = minus.split(' ');
          }
          words = [];
          phrase.split(' ').forEach(function(value) {
            if (value[0] === '-' && value.trim().length > 1) {
              return minus.push(value);
            } else {
              return words.push(value);
            }
          });
          return [words.toPhrase(), minus.toPhrase()];
        },
        convertToMinus: function(phrase) {
          var minus;
          minus = [];
          phrase.toWords().forEach(function(value) {
            if (value[0] === '-' && value.length > 1) {
              return minus.push(value);
            } else {
              return minus.push('-' + value);
            }
          });
          return minus.join(' ').trim();
        },
        removeFrequencies: function() {
          this.list.phrases.forEach(function(list_item) {
            return list_item.frequency = void 0;
          });
          return app.$forceUpdate();
        },
        removePhrase: function(phrase) {
          return this.list.phrases = _.without(this.list.phrases, phrase);
        },
        removeMinuses: function() {
          return this.list.phrases.forEach(function(phrase) {
            return phrase.minus = '';
          });
        },
        removePluses: function() {
          this.list.phrases.forEach(function(list_item) {
            var words;
            words = [];
            list_item.phrase.split(' ').forEach(function(word) {
              if (word.length > 1 && word[0] !== '+') {
                return words.push(word);
              }
            });
            return list_item.phrase = words.join(' ');
          });
          return this.removeEmptyPhrases();
        },
        removeEmptyPhrases: function(phrases) {
          var new_phrases;
          if (phrases == null) {
            phrases = null;
          }
          new_phrases = _.filter(phrases || this.list.phrases, function(phrase) {
            return phrase.phrase.trim() !== '';
          });
          if (phrases) {
            return new_phrases;
          } else {
            return this.list.phrases = new_phrases;
          }
        },
        clear: function() {
          return this.list.phrases = [];
        },
        saveAs: function() {
          this.saving = true;
          if (this.list.id) {
            this.resourse.update({
              id: this.list.id
            }, this.list).then((function(_this) {
              return function() {
                return _this.saving = false;
              };
            })(this));
          } else {
            this.resourse.save(this.list).then((function(_this) {
              return function(response) {
                console.log(response);
                _this.saving = false;
                return _this.list.id = response.data.id;
              };
            })(this));
          }
          return closeModal('save-as');
        },
        save: function() {
          this.saving = true;
          return this.resourse.update({
            id: this.list.id
          }, this.list).then((function(_this) {
            return function() {
              return _this.saving = false;
            };
          })(this));
        },
        deleteWordsInsidePhrase: function() {
          this.modal.value.split('\n').forEach((function(_this) {
            return function(textarea_phrase) {
              return _this.list.phrases.forEach(function(phrase) {
                if (phrase.phrase.match(exactMatch(textarea_phrase.trim()))) {
                  return phrase.phrase = removeDoubleSpaces(phrase.phrase.replace(exactMatch(textarea_phrase.trim()), ' ')).trim();
                }
              });
            };
          })(this));
          this.removeEmptyPhrases();
          this.modal.value = '';
          return closeModal();
        },
        deletePhrasesWithWords: function() {
          this.modal.value.split('\n').forEach((function(_this) {
            return function(textarea_phrase) {
              return _this.list.phrases = _.filter(_this.list.phrases, function(phrase) {
                return !phrase.phrase.match(exactMatch(textarea_phrase));
              });
            };
          })(this));
          this.modal.value = '';
          return closeModal();
        },
        openList: function(list_id) {
          this.saving = true;
          return this.resourse.get({
            id: list_id
          }).then((function(_this) {
            return function(response) {
              _this.list = response.data;
              _this.saving = false;
              return _this.page = 'list';
            };
          })(this));
        },
        removeList: function(list) {
          this.lists = removeById(this.lists, list.id);
          return this.resourse["delete"]({
            id: list.id
          });
        },
        startEditingPhrase: function(phrase, index) {
          this.modal_phrase = _.clone(phrase);
          _.extendOwn(this.modal_phrase, {
            index: index
          });
          showModal('edit-phrase');
          return rebindMasks();
        },
        editPhrase: function() {
          var ref;
          ref = this.separateMinuses(this.modal_phrase.phrase, this.convertToMinus(this.modal_phrase.minus)), this.modal_phrase.phrase = ref[0], this.modal_phrase.minus = ref[1];
          _.extendOwn(this.list.phrases[this.modal_phrase.index], _.clone(this.modal_phrase));
          app.$forceUpdate();
          return closeModal('edit-phrase');
        },
        addToAll: function() {
          this.list.phrases.forEach((function(_this) {
            return function(phrase) {
              return phrase.phrase += ' ' + _this.modal.value;
            };
          })(this));
          this.modal.value = '';
          return closeModal('add-to-all');
        },
        mixer: function() {
          var new_phrases;
          new_phrases = [];
          this.list.phrases.forEach((function(_this) {
            return function(phrase) {
              return _this.modal.value.split('\n').forEach(function(line) {
                var new_phrase;
                new_phrase = _.clone(phrase);
                new_phrase.phrase += ' ' + line;
                return new_phrases.push(new_phrase);
              });
            };
          })(this));
          this.list.phrases = new_phrases;
          this.modal.value = '';
          return closeModal();
        }
      },
      watch: {
        page: function(newPage) {
          if (newPage === 'open' && this.lists === null) {
            this.saving = true;
            return this.resourse.query().then((function(_this) {
              return function(response) {
                _this.lists = response.data;
                return _this.saving = false;
              };
            })(this));
          }
        }
      },
      computed: {
        filtered_phrases: function() {
          var ref;
          if (!((ref = this.list) != null ? ref.phrases.length : void 0)) {
            return [];
          }
          return this.list.phrases.filter((function(_this) {
            return function(list_item) {
              return list_item.phrase.indexOf(_this.phrase_search) !== -1;
            };
          })(this));
        }
      }
    });
  });

}).call(this);

(function() {
  angular.module('Wstat', []).controller('LoginCtrl', function($scope, $http) {
    var loadImage;
    loadImage = function() {
      var img;
      $scope.image_loaded = false;
      img = new Image;
      img.addEventListener("load", function() {
        $('body').css({
          'background-image': "url(" + $scope.wallpaper.image_url + ")"
        });
        $scope.image_loaded = true;
        $scope.$apply();
        return setTimeout(function() {
          return $('#center').removeClass('animated').removeClass('fadeIn').removeAttr('style');
        }, 2000);
      });
      return img.src = $scope.wallpaper.image_url;
    };
    angular.element(document).ready(function() {
      var login_data;
      setScope();
      loadImage();
      $('input[autocomplete="off"]').each(function() {
        var id, input;
        input = this;
        id = $(input).attr('id');
        $(input).removeAttr('id');
        return setTimeout(function() {
          return $(input).attr('id', id);
        }, 2000);
      });
      $scope.l = Ladda.create(document.querySelector('#login-submit'));
      if ($scope.logged_user) {
        $scope.login = $scope.logged_user.email;
      }
      login_data = $.cookie("login_data");
      if (login_data !== void 0) {
        login_data = JSON.parse(login_data);
        $scope.login = login_data.login;
        $scope.password = login_data.password;
        $scope.sms_verification = true;
        return $scope.$apply();
      }
    });
    $scope.clearLogged = function() {
      $scope.logged_user = null;
      $scope.login = '';
      return $.removeCookie('logged_user');
    };
    $scope.enter = function($event) {
      if ($event.keyCode === 13) {
        return $scope.checkFields();
      }
    };
    $scope.goLogin = function() {
      if ($scope.preview) {
        return;
      }
      return $http.post('login', {
        login: $scope.login,
        password: $scope.password,
        code: $scope.code,
        captcha: grecaptcha.getResponse()
      }).then(function(response) {
        grecaptcha.reset();
        if (response.data === true) {
          $.removeCookie('login_data');
          location.reload();
        } else if (response.data === 'sms') {
          $scope.in_process = false;
          $scope.l.stop();
          $scope.sms_verification = true;
          $.cookie("login_data", JSON.stringify({
            login: $scope.login,
            password: $scope.password
          }), {
            expires: 1 / (24 * 60) * 2,
            path: '/'
          });
        } else {
          $scope.in_process = false;
          $scope.l.stop();
          $scope.error = "Неправильная пара логин-пароль";
        }
        return $scope.$apply();
      });
    };
    return $scope.checkFields = function() {
      if ($scope.preview) {
        return;
      }
      $scope.l.start();
      $scope.in_process = true;
      if (grecaptcha.getResponse() === '') {
        return grecaptcha.execute();
      } else {
        return $scope.goLogin();
      }
    };
  });

}).call(this);

(function() {
  var logout_interval;

  logout_interval = false;

  window.logoutCountdownClose = function() {
    clearInterval(logout_interval);
    logout_interval = false;
    return $('#logout-modal').modal('hide');
  };

  window.logoutCountdown = function() {
    var seconds;
    seconds = 60;
    $('#logout-seconds').html(seconds);
    $('#logout-modal').modal('show');
    return logout_interval = setInterval(function() {
      seconds--;
      $('#logout-seconds').html(seconds);
      if (seconds <= 1) {
        clearInterval(logout_interval);
        return setTimeout(function() {
          return location.reload();
        }, 1000);
      }
    }, 1000);
  };

  window.continueSession = function() {
    $.get("/auth/continue-session");
    return logoutCountdownClose();
  };

  window.listenToSession = function(app_key, user_id) {
    var channel, pusher;
    pusher = new Pusher(app_key, {
      cluster: 'eu'
    });
    channel = pusher.subscribe('session.' + user_id);
    return channel.bind("App\\Events\\LogoutSignal", function(data) {
      switch (data.action) {
        case 'notify':
          return logoutCountdown();
        case 'destroy':
          return redirect('/logout');
      }
    });
  };

}).call(this);

(function() {
  Vue.component('virtual-scroller', VueVirtualScroller.VirtualScroller);

}).call(this);

(function() {
  var plurals;

  plurals = {
    'minute': ['минуту', 'минуты', 'минут'],
    'hour': ['час', 'часа', 'часов'],
    'day': ['день', 'дня', 'дней'],
    'phrase': ['фраза', 'фразы', 'фраз'],
    'minus': ['минус слово', 'минус слова', 'минус слов']
  };

  Vue.component('plural', {
    props: ['count', 'type'],
    computed: {
      text: function() {
        if (this.count % 10 === 1 && this.count % 100 !== 11) {
          return plurals[this.type][0];
        } else if (this.count % 10 >= 2 && this.count % 10 <= 4 && this.count % 100 < 10 || this.count % 100 >= 20) {
          return plurals[this.type][1];
        } else {
          return plurals[this.type][2];
        }
      }
    },
    template: "<span>{{ count }} {{ text }}</span>"
  });

}).call(this);

(function() {
  Vue.directive('digits-only', {
    update: function(el) {
      return el.value = el.value.replace(/[^0-9]/g, '');
    }
  });

}).call(this);

(function() {
  this.AddFromWordstat = {
    data: {
      add_from_wordstat: {
        keyphrase_text: '',
        keyphrase_list: [],
        current_step: 0,
        added: 0
      }
    },
    methods: {
      addFromWordstatModal: function() {
        this.add_from_wordstat.keyphrase_text = '';
        return showModal('add-from-wordstat');
      },
      addFromWordstat: function() {
        if (!this.add_from_wordstat.keyphrase_text) {
          return;
        }
        this.saving = true;
        this.add_from_wordstat.keyphrase_list = this.add_from_wordstat.keyphrase_text.split("\n");
        return this.$_addFromWordstatStep();
      },
      $_addingFromWordstatFinished: function(message, error) {
        var fn;
        if (error == null) {
          error = false;
        }
        closeModal('add-from-wordstat');
        fn = error ? notifyError : notifySuccess;
        fn(message);
        this.add_from_wordstat.keyphrase_list = [];
        this.add_from_wordstat.current_step = 0;
        this.add_from_wordstat.added = 0;
        return this.saving = false;
      },
      $_addFromWordstatStep: function() {
        if (!this.add_from_wordstat.keyphrase_list.length) {
          return;
        }
        if (this.add_from_wordstat.current_step >= this.add_from_wordstat.keyphrase_list.length) {
          return this.$_addingFromWordstatFinished("<b>" + this.add_from_wordstat.added + "</b> добавлено");
        } else {
          return this.$http.post('api/addFromWordstat', {
            keyphrase: this.add_from_wordstat.keyphrase_list[this.add_from_wordstat.current_step]
          }).then((function(_this) {
            return function(response) {
              response.data.forEach(function(d) {
                return _this.list.phrases.push({
                  phrase: d.phrase,
                  original: d.phrase,
                  frequency: d.number.replace(/\s/g, '')
                });
              });
              _this.add_from_wordstat.added += response.data.length;
              _this.add_from_wordstat.current_step++;
              if (_this.add_from_wordstat.current_step > 9) {
                $('.add-from-wordstat__items').animate({
                  scrollTop: (_this.add_from_wordstat.current_step - 9) * 17
                }, 250);
              }
              return _this.$_addFromWordstatStep();
            };
          })(this), function(response) {
            return this.$_addingFromWordstatFinished("Ошибка при добавлении из WordStat", true);
          });
        }
      }
    }
  };

}).call(this);

(function() {
  this.ExportMixin = {
    created: function() {
      this.filename = 'wstat.xlsx';
      return this.fields = ['id', 'phrase', 'frequency', 'original', 'minus'];
    },
    mounted: function() {
      var clipboard;
      clipboard = new ClipboardJS('#copy-to-clipboard', {
        text: (function(_this) {
          return function() {
            var text;
            alert('Копирование...');
            text = _this.fields.join("\t") + "\n";
            _this.list.phrases.forEach(function(phrase) {
              var a;
              a = [];
              _this.fields.forEach(function(field) {
                return a.push(phrase[field]);
              });
              return text += a.join("\t") + "\n";
            });
            return text;
          };
        })(this)
      });
      clipboard.on('success', function() {
        return notifySuccess('Скопировано в буфер');
      });
      return clipboard.on('error', function() {
        return notifyError('Ошибка копирования в буфер');
      });
    },
    methods: {
      copyToClipboard: function() {},
      generateSheetData: function() {
        var C, R, cell, cell_ref, col_width, range, wsheet;
        wsheet = {};
        range = {
          s: {
            c: 0,
            r: 0
          },
          e: {
            c: this.fields.length,
            r: this.list.phrases.length + 1
          }
        };
        wsheet['!cols'] = [];
        this.fields.forEach(function(title, index) {
          var cell, cell_ref;
          cell_ref = XLSX.utils.encode_cell({
            c: index,
            r: 0
          });
          cell = {
            v: title,
            t: 's'
          };
          wsheet[cell_ref] = cell;
          return wsheet['!cols'].push({
            wch: cell.v.length
          });
        });
        col_width = this.fields[0].length;
        R = 0;
        while (R !== this.list.phrases.length) {
          C = 0;
          while (C !== this.fields.length) {
            if (this.fields[C] === 'id') {
              cell = {
                v: R + 1
              };
            } else {
              cell = {
                v: this.list.phrases[R][this.fields[C]]
              };
            }
            if (cell.v === null) {
              ++C;
              continue;
            }
            cell_ref = XLSX.utils.encode_cell({
              c: C,
              r: R + 1
            });
            if (typeof cell.v === 'number') {
              cell.t = 'n';
            } else {
              cell.t = 's';
              if (cell.v && cell.v.length > wsheet['!cols'][C].wch) {
                wsheet['!cols'][C].wch = cell.v.length;
              }
            }
            wsheet[cell_ref] = cell;
            ++C;
          }
          ++R;
        }
        wsheet['!ref'] = XLSX.utils.encode_range(range);
        return wsheet;
      },
      exportXls: function() {
        this.saving = true;
        return setTimeout((function(_this) {
          return function() {
            var Workbook, err, error, s2ab, wbook, wbookOut, wsheet, wsheet_name;
            try {
              Workbook = function() {
                if (!(this instanceof Workbook)) {
                  return new Workbook;
                }
                this.SheetNames = [];
                this.Sheets = {};
              };
              wsheet_name = _this.list.title || 'Новый список';
              wbook = new Workbook;
              wsheet = _this.generateSheetData();
              wbook.SheetNames.push(wsheet_name);
              wbook.Sheets[wsheet_name] = wsheet;
              wbookOut = XLSX.write(wbook, {
                bookType: 'xlsx',
                bookSST: true,
                type: 'binary'
              });
              s2ab = function(s) {
                var buf, i, view;
                buf = new ArrayBuffer(s.length);
                view = new Uint8Array(buf);
                i = 0;
                while (i !== s.length) {
                  view[i] = s.charCodeAt(i) & 0xFF;
                  ++i;
                }
                return buf;
              };
              saveAs(new Blob([s2ab(wbookOut)], {
                type: 'application/octet-stream'
              }), _this.filename);
            } catch (error) {
              err = error;
              notifyError('Ошибка экспорта');
            }
            return _this.saving = false;
          };
        })(this), 100);
      }
    }
  };

}).call(this);

(function() {
  this.HelpersMixin = {
    methods: {
      formatDateTime: function(date) {
        return moment(date).format("DD.MM.YY в HH:mm");
      }
    },
    watch: {
      saving: function(isSaving) {
        if (isSaving) {
          return ajaxStart();
        } else {
          return ajaxEnd();
        }
      }
    }
  };

}).call(this);

(function() {
  this.RemoveDuplicates = {
    methods: {
      uniq: function(phrases) {
        var new_phrases;
        if (phrases == null) {
          phrases = null;
        }
        new_phrases = _.uniq(phrases || this.list.phrases, 'phrase');
        if (phrases) {
          return new_phrases;
        } else {
          return this.list.phrases = new_phrases;
        }
      },
      removeDuplicates: function() {
        var error, frequency_sum, i, phrases, phrases_sorted;
        phrases = _.clone(this.list.phrases);
        phrases = _.chain(phrases).sortBy('frequency').sortBy('phrase').value();
        i = 0;
        phrases_sorted = [];
        while (i < phrases.length - 1) {
          try {
            frequency_sum = phrases[i].frequency;
            while (phrases[i].phrase === phrases[i + 1].phrase) {
              i++;
              frequency_sum += phrases[i].frequency;
            }
            phrases[i].frequency = frequency_sum;
            phrases_sorted.push(phrases[i]);
            i++;
          } catch (error) {
            break;
          }
        }
        phrases_sorted.push(phrases[phrases.length - 1]);
        return this.list.phrases = _.sortBy(phrases_sorted, 'id');
      }
    }
  };

}).call(this);

(function() {
  this.SortMixin = {
    data: {
      sorted_phrases: [],
      priority_list: [],
      trump_words: [],
      sortableOptions: {
        axis: 'y'
      }
    },
    methods: {
      getPriorityList: function(phrases) {
        var list_with_weights, priority_list, weights;
        weights = {};
        phrases.forEach((function(_this) {
          return function(phrase) {
            return phrase.phrase.toWords().forEach(function(word) {
              if (weights[word] === void 0) {
                weights[word] = 0;
              }
              return weights[word] += parseInt(phrase.frequency) || 1;
            });
          };
        })(this));
        priority_list = Object.keys(weights);
        priority_list.sort((function(_this) {
          return function(a, b) {
            var difference;
            difference = weights[b] - weights[a];
            if (difference !== 0) {
              return difference;
            } else {
              return a > b;
            }
          };
        })(this));
        list_with_weights = [];
        priority_list.forEach(function(word) {
          return list_with_weights.push({
            word: word,
            weight: weights[word]
          });
        });
        return list_with_weights;
      },
      closestParents: function(parents, phrase_without_parent) {
        var level;
        parents = _.sortBy(parents, function(parent) {
          return _.difference(phrase_without_parent.phrase.toWords(), parent.phrase.toWords()).length;
        });
        level = _.difference(phrase_without_parent.phrase.toWords(), parents[0].phrase.toWords()).length;
        return parents.filter(function(parent) {
          return _.difference(phrase_without_parent.phrase.toWords(), parent.phrase.toWords()).length === level;
        });
      },
      findParent: function(phrase_without_parent) {
        var highest_level_found, max_level_frequency, parents, trump_parents;
        parents = this.list.phrases.filter(function(phrase) {
          return isParent(phrase, phrase_without_parent);
        });
        if (parents.length) {
          trump_parents = [];
          highest_level_found = false;
          this.trump_words.forEach((function(_this) {
            return function(word) {
              trump_parents = parents.filter(function(parent) {
                return $.inArray(word, parent.phrase.toWords()) !== -1;
              });
              if (trump_parents.length > 1 && !highest_level_found) {
                trump_parents = _this.closestParents(trump_parents, phrase_without_parent);
                highest_level_found = true;
              }
              if (trump_parents.length) {
                return parents = trump_parents;
              }
            };
          })(this));
          if (parents.length > 1) {
            if (!highest_level_found) {
              parents = this.closestParents(parents, phrase_without_parent);
            }
            if (parents.length > 1) {
              max_level_frequency = -1;
              parents.forEach((function(_this) {
                return function(parent) {
                  var level_frequency;
                  level_frequency = 0;
                  _this.list.phrases.forEach(function(phrase) {
                    if (sameLevel(parent, phrase)) {
                      return level_frequency += parseInt(phrase.frequency) || 1;
                    }
                  });
                  parent.level_frequency = level_frequency;
                  if (level_frequency > max_level_frequency) {
                    return max_level_frequency = level_frequency;
                  }
                };
              })(this));
              parents = parents.filter(function(parent) {
                var level_frequency;
                level_frequency = parent.level_frequency;
                delete parent.level_frequency;
                return level_frequency === max_level_frequency;
              });
              if (parents.length > 1) {
                parents.sort(function(phrase_1, phrase_2) {
                  return phrase_1.phrase > phrase_2.phrase;
                });
              }
            }
          }
        } else {
          return null;
        }
        return parents[0];
      },
      collapseList: function() {
        var list_changed, phrases_without_parent;
        phrases_without_parent = [];
        this.list.phrases.forEach((function(_this) {
          return function(phrase_1, index_1) {
            var has_children;
            has_children = false;
            _this.list.phrases.forEach(function(phrase_2, index_2) {
              if (has_children || index_1 === index_2) {
                return;
              }
              if (isParent(phrase_1, phrase_2)) {
                return has_children = true;
              }
            });
            if (!has_children) {
              return phrases_without_parent.push(phrase_1);
            }
          };
        })(this));
        list_changed = false;
        if (phrases_without_parent.length) {
          phrases_without_parent.forEach((function(_this) {
            return function(phrase_without_parent) {
              var parent;
              parent = _this.findParent(phrase_without_parent);
              if (parent !== null) {
                if (parent.children === void 0) {
                  parent.children = [];
                }
                parent.children.push(phrase_without_parent);
                if (parent.total_frequency === void 0) {
                  parent.total_frequency = parseInt(parent.frequency) || 1;
                }
                if (phrase_without_parent.children) {
                  parent.total_frequency += parseInt(phrase_without_parent.total_frequency);
                } else {
                  parent.total_frequency += parseInt(phrase_without_parent.frequency) || 1;
                }
                _this.list.phrases = _this.removePhrase(phrase_without_parent);
                return list_changed = true;
              }
            };
          })(this));
          if (list_changed) {
            return this.collapseList();
          } else {
            window.testy = JSON.parse(JSON.stringify(this.list.phrases))[0];
            this.sortPhraseWords(this.list.phrases);
            this.sortPhrases(this.list.phrases);
            return this.expandList(this.list.phrases);
          }
        }
      },
      sortPhraseWords: function(phrases) {
        return phrases.forEach((function(_this) {
          return function(parent) {
            if (parent.children) {
              parent.children.forEach(function(phrase) {
                var leftovers, sorted_words, words;
                words = _.difference(phrase.phrase.toWords(), parent.phrase.toWords());
                if (words.length > 1) {
                  sorted_words = [];
                  _this.trump_words.forEach(function(word) {
                    if ($.inArray(word, words) !== -1) {
                      return sorted_words.push(word);
                    }
                  });
                  leftovers = words.filter(function(word) {
                    return $.inArray(word, sorted_words) === -1;
                  });
                  leftovers.sort(function(word_1, word_2) {
                    return word_1 > word_2;
                  });
                  words = sorted_words.concat(leftovers);
                }
                return phrase.phrase = parent.phrase.toWords().concat(words).toPhrase();
              });
              return _this.sortPhraseWords(parent.children);
            }
          };
        })(this));
      },
      expandList: function(phrases) {
        return phrases.forEach((function(_this) {
          return function(phrase) {
            _this.sorted_phrases.push(phrase);
            if (phrase.children) {
              _this.expandList(phrase.children);
              delete phrase.children;
              return delete phrase.total_frequency;
            }
          };
        })(this));
      },
      sortPhrases: function(phrases) {
        phrases.sort(function(phrase_1, phrase_2) {
          var difference, phrase_1_frequency, phrase_2_frequency;
          phrase_1_frequency = parseInt(phrase_1.total_frequency) || (parseInt(phrase_1.frequency) || 1);
          phrase_2_frequency = parseInt(phrase_2.total_frequency) || (parseInt(phrase_2.frequency) || 1);
          difference = phrase_2_frequency - phrase_1_frequency;
          if (difference !== 0) {
            return difference;
          } else {
            return phrase_1.phrase > phrase_2.phrase;
          }
        });
        return phrases.forEach((function(_this) {
          return function(phrase) {
            if (phrase.children) {
              return _this.sortPhrases(phrase.children);
            }
          };
        })(this));
      },
      sortModal: function() {
        this.priority_list = this.getPriorityList(this.list.phrases, true);
        this.trump_words = [];
        return showModal('smart-sort');
      },
      sort: function() {
        var ids, trump_words;
        if (this.trump_words.length) {
          ids = $('.ui-sortable').sortable('toArray');
          trump_words = [];
          ids.forEach((function(_this) {
            return function(id) {
              var index;
              index = id.replace(/\D/g, "");
              return trump_words.push(_this.trump_words[index]);
            };
          })(this));
          this.trump_words = trump_words;
        }
        closeModal('smart-sort');
        this.loading = true;
        return setTimeout((function(_this) {
          return function() {
            _this.sorted_phrases = [];
            _this.collapseList();
            _this.list.phrases = _this.sorted_phrases;
            return _this.loading = false;
          };
        })(this), 100);
      }
    }
  };

}).call(this);

(function() {
  this.TransformMixin = {
    data: {
      drag: {
        over: null
      },
      transform_items: {},
      transform_phrases: {}
    },
    methods: {
      transformModal: function() {
        this.transform_phrases = _.clone(this.list.phrases);
        this.transform_phrases = this.splitPhrasesToWords(this.transform_phrases);
        this.transform_phrases = this.uniq(this.transform_phrases);
        this.transform_phrases = _.sortBy(this.transform_phrases, 'phrase');
        return showModal('transform');
      },
      transformRemove: function(word, phrase, phrase_index) {
        var index;
        index = phrase.words.indexOf(word);
        this.transform_phrases[word.index].added = false;
        phrase.words.splice(index, 1);
        this.transform_items[phrase_index].splice(this.transform_items[phrase_index].indexOf(word.index), 1);
        return app.$forceUpdate();
      },
      transform: function() {
        this.list.phrases.forEach((function(_this) {
          return function(phrase) {
            return $.each(_this.transform_items, function(main_index, item_indexes) {
              return item_indexes.forEach(function(item_index) {
                return phrase.phrase = replaceWord(phrase.phrase, _this.transform_phrases[item_index].phrase, _this.transform_phrases[main_index].phrase);
              });
            });
          };
        })(this));
        this.transform_phrases = {};
        this.transform_items = {};
        return closeModal('transform');
      },
      drop: function(index) {
        var dragged, dropped;
        if (this.drag.start === index) {
          return;
        }
        dragged = this.transform_phrases[this.drag.start];
        dragged.added = true;
        dropped = this.transform_phrases[index];
        if (dropped.words === void 0) {
          dropped.words = [];
        }
        dropped.words.push({
          index: this.drag.start,
          phrase: this.transform_phrases[this.drag.start].phrase
        });
        if (dragged.words) {
          dropped.words = dropped.words.concat(dragged.words);
        }
        if (this.transform_items[index] === void 0) {
          this.transform_items[index] = [];
        }
        this.transform_items[index].push(this.drag.start);
        if (dragged.words) {
          dragged.words.forEach((function(_this) {
            return function(word) {
              return _this.transform_items[index].push(word.index);
            };
          })(this));
          return dragged.words = [];
        }
      },
      dragend: function() {
        this.drag.start = null;
        this.drag.over = null;
        return app.$forceUpdate();
      }
    }
  };

}).call(this);

//# sourceMappingURL=app.js.map
