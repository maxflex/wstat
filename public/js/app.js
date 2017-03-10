(function() {
  $(document).ready(function() {
    var app;
    return app = new Vue({
      el: '#app',
      mixins: [sort],
      data: {
        addwords_error: false,
        phrase_search: '',
        list: {
          title: null,
          phrases: []
        },
        modal: {},
        modal_phrase: {
          phrase: null,
          frequency: null,
          minus: null
        }
      },
      methods: {
        runModal: function(action, title, placeholder, value) {
          if (placeholder == null) {
            placeholder = 'список слов или фраз';
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
        getHardIndex: function(phrase) {
          return 1 + _.findIndex(this.list.phrases, phrase);
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
  this.sort = {
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

//# sourceMappingURL=app.js.map
