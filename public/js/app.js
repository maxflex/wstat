(function() {
  $(document).ready(function() {
    return window.app = new Vue({
      el: '#app',
      mixins: [TransformMixin, ExportMixin, SmartSortMixin, HelpersMixin],
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
  angular.module('Wstat', ['angular-ladda']).controller('LoginCtrl', function($scope, $http) {
    angular.element(document).ready(function() {
      return $scope.l = Ladda.create(document.querySelector('#login-submit'));
    });
    return $scope.checkFields = function() {
      $scope.l.start();
      ajaxStart();
      $scope.in_process = true;
      return $http.post('login', {
        login: $scope.login,
        password: $scope.password
      }).then(function(response) {
        if (response.data === true) {
          return location.reload();
        } else {
          $scope.in_process = false;
          ajaxEnd();
          $scope.l.stop();
          return notifyError("Неправильная пара логин-пароль");
        }
      });
    };
  });

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
  this.ExportMixin = {
    created: function() {
      this.filename = 'wstat.xlsx';
      return this.fields = ['id', 'phrase', 'frequency', 'original', 'minus'];
    },
    methods: {
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
  this.SmartSortMixin = {
    data: {
      sorted_phrases: []
    },
    methods: {
      sort: function() {
        this.loading = true;
        return setTimeout((function(_this) {
          return function() {
            _this.sorted_phrases = [];
            _this.sortWords(_this.list.phrases);
            _this.list.phrases.map(function(phrase) {
              return delete phrase.sorted;
            });
            _this.collapseList();
            _this.list.phrases = _this.sorted_phrases;
            return _this.loading = false;
          };
        })(this), 100);
      },
      sortWords: function(phrases, level) {
        var priority_list, weights;
        if (level == null) {
          level = 0;
        }
        weights = {};
        phrases.forEach((function(_this) {
          return function(phrase) {
            return phrase.phrase.toWords().forEach(function(word) {
              if (weights[word] === void 0) {
                weights[word] = 0;
              }
              return weights[word] += phrase.frequency || 1;
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
        if (level) {
          priority_list = priority_list.slice(level, priority_list.length);
        }
        return priority_list.forEach((function(_this) {
          return function(word) {
            var filtered_phrases;
            filtered_phrases = phrases.filter(function(phrase) {
              return !phrase.sorted && $.inArray(word, phrase.phrase.toWords()) >= level;
            });
            filtered_phrases.forEach(function(phrase) {
              var words;
              words = phrase.phrase.toWords();
              words = _.without(words, word);
              words.splice(level, 0, word);
              phrase.phrase = words.toPhrase();
              if (words[words.length - 1] === word) {
                return phrase.sorted = true;
              }
            });
            if (filtered_phrases.length > 1) {
              return _this.sortWords(filtered_phrases, level + 1);
            }
          };
        })(this));
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
              var closest_parent, parents;
              parents = _this.list.phrases.filter(function(phrase) {
                return isParent(phrase, phrase_without_parent);
              });
              closest_parent = {
                level: 9999,
                frequency: -1,
                phrase: null
              };
              if (parents.length) {
                parents.forEach(function(parent) {
                  var frequency, level;
                  level = _.difference(phrase_without_parent.phrase.toWords(), parent.phrase.toWords()).length;
                  frequency = parent.frequency || 1;
                  if (level < closest_parent.level || (level === closest_parent.level && closest_parent.frequency < frequency)) {
                    return closest_parent = {
                      level: level,
                      frequency: frequency,
                      phrase: parent
                    };
                  }
                });
              }
              if (closest_parent.phrase !== null) {
                if (closest_parent.phrase.children === void 0) {
                  closest_parent.phrase.children = [];
                }
                closest_parent.phrase.children.push(phrase_without_parent);
                if (closest_parent.phrase.total_frequency === void 0) {
                  closest_parent.phrase.total_frequency = closest_parent.phrase.frequency || 1;
                }
                closest_parent.phrase.total_frequency += phrase_without_parent.frequency || 1;
                _this.list.phrases = _this.removePhrase(phrase_without_parent);
                return list_changed = true;
              }
            };
          })(this));
          if (list_changed) {
            return this.collapseList();
          } else {
            return this.expandList(this.list.phrases);
          }
        }
      },
      expandList: function(phrases) {
        this.sortPhrases(phrases);
        return phrases.forEach((function(_this) {
          return function(phrase, index) {
            _this.sorted_phrases.push(phrase);
            if (phrase.children) {
              _this.expandList(phrase.children, index);
              delete phrase.children;
              return delete phrase.total_frequency;
            }
          };
        })(this));
      },
      sortPhrases: function(phrases) {
        return phrases.sort(function(phrase_1, phrase_2) {
          var difference, phrase_1_frequency, phrase_2_frequency;
          phrase_1_frequency = phrase_1.total_frequency || (phrase_1.frequency || 1);
          phrase_2_frequency = phrase_2.total_frequency || (phrase_2.frequency || 1);
          difference = phrase_2_frequency - phrase_1_frequency;
          if (difference !== 0) {
            return difference;
          } else {
            return phrase_1.phrase > phrase_2.phrase;
          }
        });
      }
    }
  };

}).call(this);

(function() {
  this.SortMixin = {
    methods: {
      sort: function() {
        if (!(this.list.phrases && this.list.phrases.length)) {
          return;
        }
        this.getWords();
        this.getWeights();
        return this.sortPhraseByWeight();
      },
      getWords: function() {
        this.words = [];
        return this.list.phrases.forEach((function(_this) {
          return function(phrase) {
            var ref;
            return (ref = _this.words).push.apply(ref, phrase.phrase.toWords());
          };
        })(this));
      },
      getWeights: function() {
        var word_groups;
        this.word_weights = [];
        word_groups = _.chain(this.words).groupBy(function(word) {
          return word;
        }).sortBy(function(word) {
          return word.length;
        }).value();
        return _.map(word_groups, (function(_this) {
          return function(group) {
            return _this.word_weights[group[0]] = group.length;
          };
        })(this));
      },
      sortPhraseByWeight: function() {
        this.list.phrases.forEach((function(_this) {
          return function(phrase) {
            var phrase_weight, words, words_sorted_by_weight;
            words = phrase.phrase.toWords();
            words_sorted_by_weight = _.sortBy(words.sort().reverse(), (function(word) {
              return _this.word_weights[word];
            })).reverse();
            phrase_weight = [];
            words_sorted_by_weight.forEach(function(word) {
              return phrase_weight.push(_this.word_weights[word]);
            });
            phrase.phrase = words_sorted_by_weight.join(' ');
            return phrase.phrase_weight = phrase_weight;
          };
        })(this));
        return this.list.phrases.sort(function(a, b) {
          var i, j, length, min, ref;
          length = Math.min(a.phrase_weight.length, b.phrase_weight.length);
          min = false;
          for (i = j = 0, ref = length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
            if (a.phrase_weight[i] === 41 && b.phrase_weight[i] === 124) {
              debugger;
            }
            if (a.phrase_weight[i] < b.phrase_weight[i]) {
              min = -1;
            }
            if (a.phrase_weight[i] > b.phrase_weight[i]) {
              min = 1;
            }
            if (min) {
              break;
            }
          }
          if (!min) {
            min = b.phrase_weight.length - a.phrase_weight.length;
            if (min === 0) {
              if (a.phrase > b.phrase) {
                min = -1;
              }
              if (a.phrase < b.phrase) {
                min = 1;
              }
            }
          }
          return min;
        }).reverse();
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
