(function() {
  var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  $(document).ready(function() {
    return window.app = new Vue({
      el: '#app',
      mixins: [TransformMixin, ExportMixin, SortMixin, HelpersMixin],
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
        modal: {},
        modal_phrase: {},
        find_phrase: null,
        replace_phrase: null,
        center_title: null,
        frequencies: []
      },
      created: function() {
        return this.resource = this.$resource('api/lists{/id}', this._getFrequencies = (function(_this) {
          return function(step) {
            var length, phrases;
            if (step == null) {
              step = 0;
            }
            phrases = _this.list.phrases.slice(step * 100, (step * 100) + 100);
            length = _this.list.phrases.length / 10 * 10 + 100;
            _this.center_title = Math.round(step / length * 10000) + '%';
            return _this.$http.post('api/getFrequencies', {
              phrases: _.pluck(phrases, 'phrase')
            }).then(function(response) {
              _this.frequencies = _this.frequencies.concat(response.data);
              if (phrases.length === 100) {
                return _this._getFrequencies(step + 1);
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
        })(this));
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
        getFrequencies: function() {
          this.frequencies = [];
          return this._getFrequencies();
        },
        configureMinus: function() {
          this.removeMinuses();
          this.list.phrases.forEach((function(_this) {
            return function(phrase) {
              var words_list;
              words_list = phrase.phrase.toWords();
              return _this.list.phrases.forEach(function(phrase2) {
                var flag, words_list2;
                if (phrase.phrase !== phrase2.phrase) {
                  words_list2 = phrase2.phrase.toWords();
                  flag = true;
                  words_list.forEach(function(word) {
                    if (indexOf.call(words_list2, word) >= 0) {
                      return words_list2[words_list2.indexOf(word)] = null;
                    } else {
                      return flag = false;
                    }
                  });
                  if (flag && words_list2.length === (words_list.length + 1)) {
                    if (!phrase.hasOwnProperty('minuses')) {
                      phrase.minuses = [];
                    }
                    return words_list2.forEach(function(word) {
                      if (word) {
                        return phrase.minuses.push("-" + word);
                      }
                    });
                  }
                }
              });
            };
          })(this));
          return this.list.phrases.forEach(function(phrase) {
            var minus_list;
            if (phrase.hasOwnProperty('minuses') && phrase.minuses.length) {
              minus_list = !phrase.minus ? [] : phrase.minus.toWords();
              minus_list = minus_list.concat(phrase.minuses);
              phrase.minus = minus_list.toPhrase();
              return phrase.minuses = [];
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
            if (value[0] === '-' && value.trim().length) {
              return minus.push(value);
            } else {
              return words.push(value);
            }
          });
          return [words.join(' '), minus.join(' ')];
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
          return minus.join(' ');
        },
        removeFrequencies: function() {
          return this.list.phrases.forEach(function(list_item) {
            return list_item.frequency = void 0;
          });
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
        removeEmptyPhrases: function() {
          return this.list.phrases = this.list.phrases.filter(function(list_item) {
            return list_item.phrase;
          });
        },
        clear: function() {
          return this.list.phrases = [];
        },
        saveAs: function() {
          this.saving = true;
          if (this.list.id) {
            this.resource.update({
              id: this.list.id
            }, this.list).then((function(_this) {
              return function() {
                return _this.saving = false;
              };
            })(this));
          } else {
            this.resource.save(this.list).then((function(_this) {
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
          return this.resource.update({
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
          return closeModal();
        },
        openList: function(list) {
          this.saving = true;
          return this.resource.get({
            id: list.id
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
          return this.resource["delete"]({
            id: list.id
          });
        }
      },
      watch: {
        page: function(newPage) {
          if (newPage === 'open' && this.lists === null) {
            this.saving = true;
            return this.resource.query().then((function(_this) {
              return function(response) {
                _this.lists = response.data;
                return _this.saving = false;
              };
            })(this));
          }
        },
        startEditingPhrase: function(phrase) {
          this.original_phrase = _.clone(phrase);
          this.modal_phrase = _.clone(phrase);
          return showModal('edit-phrase');
        },
        editPhrase: function() {
          var phrase_index, ref;
          ref = this.separateMinuses(this.modal_phrase.phrase, this.convertToMinus(this.modal_phrase.minus)), this.modal_phrase.phrase = ref[0], this.modal_phrase.minus = ref[1];
          phrase_index = _.findIndex(this.list.phrases, this.original_phrase);
          _.extendOwn(this.list.phrases[phrase_index], this.modal_phrase);
          return closeModal('edit-phrase');
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
  this.ExportMixin = {
    created: function() {
      this.columnDelimiter = ';';
      this.lineDelimiter = '\n';
      this.filename = 'wstat.xls';
      this.fields = ['phrase', 'minus', 'original', 'frequency'];
      return this.convertListToCSV = (function(_this) {
        return function() {
          var data;
          data = ['id' + _this.columnDelimiter + _this.fields.join(_this.columnDelimiter)];
          _this.list.phrases.forEach(function(phrase, index) {
            var item;
            item = [index + 1];
            _this.fields.forEach(function(field) {
              return item.push(phrase[field]);
            });
            return data.push(item.join(_this.columnDelimiter));
          });
          return data.join(_this.lineDelimiter);
        };
      })(this);
    },
    methods: {
      downloadCSV: function() {
        var csv, data, link;
        csv = this.convertListToCSV();
        csv = 'data:text/xls;charset=utf-8,' + csv;
        data = encodeURI(csv);
        link = document.createElement('a');
        link.setAttribute('href', data);
        link.setAttribute('download', this.filename);
        return link.click();
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
      selected_rows: [],
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
      selectRow: function(index) {
        if (this.selected_rows.indexOf(index) === -1) {
          return this.selected_rows.push(index);
        } else {
          return this.selected_rows.splice(this.selected_rows.indexOf(index), 1);
        }
      },
      transformAdd: function(index) {
        if (this.transform_phrases[index].words === void 0) {
          this.transform_phrases[index].words = [];
        }
        this.selected_rows.forEach((function(_this) {
          return function(position) {
            _this.transform_phrases[position].added = true;
            return _this.transform_phrases[index].words.push(_this.transform_phrases[position].phrase);
          };
        })(this));
        if (this.transform_items[index] === void 0) {
          this.transform_items[index] = [];
        }
        this.transform_items[index] = this.transform_items[index].concat(this.selected_rows);
        return this.selected_rows = [];
      },
      transformRemove: function(index) {
        this.transform_items[index].forEach((function(_this) {
          return function(position) {
            _this.transform_phrases[position].added = false;
            return _this.transform_phrases[index].words = void 0;
          };
        })(this));
        delete this.transform_items[index];
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
        this.selected_rows = [];
        return closeModal('transform');
      }
    }
  };

}).call(this);

//# sourceMappingURL=app.js.map
