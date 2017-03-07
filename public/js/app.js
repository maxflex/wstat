(function() {
  angular.module("Wstat", ['ngRoute', 'ngSanitize', 'ngResource', 'ngAnimate', 'ui.sortable', 'ui.bootstrap', 'angular-ladda', 'angularFileUpload']).constant('DEFAULT_LIST_TITLE', 'Новый список').run(function($rootScope, List, DEFAULT_LIST_TITLE, ExportService, SmartSort) {
    $rootScope.ExportService = ExportService;
    $rootScope.SmartSort = SmartSort;
    ExportService.init();
    $rootScope.list = new List({
      title: null,
      phrases: []
    });
    if (ENV === 'local' && DEBUG_LIST_ID) {
      $rootScope.list = List.get({
        id: DEBUG_LIST_ID
      });
    }
    $rootScope.loading = false;
    $rootScope.$watch('loading', function(newVal, oldVal) {
      if (newVal === true) {
        ajaxStart();
      }
      if (newVal === false) {
        return ajaxEnd();
      }
    });
    $rootScope.formatDateTime = function(date) {
      return moment(date).format("DD.MM.YY в HH:mm");
    };
    return $rootScope.$on('$routeChangeStart', function(event, next, prev) {
      $rootScope.route = next.$$route;
      if ($rootScope.route.originalPath === '/') {
        $rootScope.route.title = $rootScope.list.title || DEFAULT_LIST_TITLE;
      }
      return ExportService.init({
        list: $rootScope.list
      });
    });
  });

}).call(this);

(function() {
  angular.module('Wstat').config([
    '$routeProvider', function($routeProvider) {
      return $routeProvider.when('/', {
        controller: 'MainCtrl',
        title: '–',
        templateUrl: 'pages/main'
      }).when('/lists', {
        templateUrl: 'pages/lists',
        title: 'Списки',
        controller: 'ListsCtrl'
      });
    }
  ]);

}).call(this);

(function() {


}).call(this);

(function() {
  angular.module('Wstat').controller('ListsCtrl', function($scope, $rootScope, $location, $timeout, List) {
    if ($scope.lists === void 0) {
      $rootScope.loading = true;
      $scope.lists = List.query(function() {
        return $rootScope.loading = false;
      });
    }
    $scope.remove = function(list) {
      $scope.lists = removeById($scope.lists, list.id);
      return List["delete"]({
        id: list.id
      });
    };
    return $scope.open = function(list) {
      $rootScope.loading = true;
      return $rootScope.list = List.get({
        id: list.id
      }, function() {
        $rootScope.loading = false;
        return $location.path('/');
      });
    };
  });

}).call(this);

(function() {
  angular.module('Wstat').controller('LoginCtrl', function($scope, $http) {
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
  var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  angular.module('Wstat').controller('MainCtrl', function($scope, $rootScope, $http, TransformService) {
    var buildPhraseValue, getFrequencies, parsePhrases, separateMinuses;
    bindArguments($scope, arguments);
    $scope.$on('$viewContentLoaded', function() {
      return $("#modal-value").off('keydown').keydown(function(e) {
        var $this, end, start, value;
        if (e.keyCode === 9) {
          start = this.selectionStart;
          end = this.selectionEnd;
          $this = $(this);
          value = $this.val();
          $this.val(value.substring(0, start) + "\t" + value.substring(end));
          this.selectionStart = this.selectionEnd = start + 1;
          return e.preventDefault();
        }
      });
    });
    $scope.replace = function() {
      $rootScope.list.phrases.forEach(function(phrase) {
        return phrase.phrase = replaceWord(phrase.phrase, $scope.find_phrase, $scope.replace_phrase);
      });
      $scope.find_phrase = void 0;
      $scope.replace_phrase = void 0;
      return closeModal('replace');
    };
    $scope.endEditing = function() {
      var edited_phrase, phrase_index;
      edited_phrase = parsePhrases();
      if (edited_phrase.length) {
        phrase_index = _.findIndex($scope.list.phrases, $scope.editing_phrase);
        $scope.list.phrases[phrase_index] = edited_phrase[0];
      }
      return closeModal();
    };
    $scope.editPhrase = function(phrase) {
      $scope.editing_phrase = phrase;
      return $scope.runModal($scope.endEditing, 'cохранить', 'изменение записи', buildPhraseValue(phrase));
    };
    $scope.addWords = function() {
      var new_phrases;
      new_phrases = parsePhrases();
      $rootScope.list.phrases = $rootScope.list.phrases.concat(new_phrases);
      return closeModal();
    };
    parsePhrases = function() {
      var new_phrases;
      new_phrases = [];
      if ($scope.modal.value) {
        $scope.modal.value.split('\n').forEach(function(line) {
          var frequency, list, list_item, minus, phrase, ref;
          if (line.trim().length) {
            list = line.split('\t').map(function(str) {
              return str.trim();
            });
            ref = separateMinuses(list[0]), phrase = ref[0], minus = ref[1];
            if (phrase) {
              list_item = {
                phrase: phrase,
                minus: minus,
                original: list[0]
              };
              if (list.length > 1) {
                frequency = list[1];
                if ($.isNumeric(frequency)) {
                  list_item.frequency = parseInt(frequency);
                }
                if (list[2]) {
                  list_item.original = list[2].trim();
                }
              }
              return new_phrases.push(list_item);
            }
          }
        });
      }
      return new_phrases;
    };
    $scope.deleteWordsInsidePhrase = function() {
      $scope.modal.value.split('\n').forEach(function(textarea_phrase) {
        return $rootScope.list.phrases.forEach(function(phrase) {
          if (phrase.phrase.match(exactMatch(textarea_phrase))) {
            return phrase.phrase = removeDoubleSpaces(phrase.phrase.replace(exactMatch(textarea_phrase), ' ')).trim();
          }
        });
      });
      $scope.removeEmptyWords();
      return closeModal();
    };
    $scope.deletePhrasesWithWords = function() {
      $scope.modal.value.split('\n').forEach(function(textarea_phrase) {
        return $rootScope.list.phrases = _.filter($rootScope.list.phrases, function(phrase) {
          return !phrase.phrase.match(exactMatch(textarea_phrase));
        });
      });
      return closeModal();
    };
    $scope.splitPhrasesToWords = function(phrases) {
      var new_phrases;
      if (phrases == null) {
        phrases = null;
      }
      new_phrases = [];
      (phrases || $rootScope.list.phrases).forEach(function(list_item) {
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
        return $rootScope.list.phrases = new_phrases;
      }
    };
    $scope.uniq = function(phrases) {
      var new_phrases;
      if (phrases == null) {
        phrases = null;
      }
      new_phrases = _.uniq(phrases || $rootScope.list.phrases, 'phrase');
      if (phrases) {
        return new_phrases;
      } else {
        return $rootScope.list.phrases = new_phrases;
      }
    };
    $scope.lowercase = function() {
      return $rootScope.list.phrases.forEach(function(list_item) {
        return list_item.phrase = list_item.phrase.toLowerCase();
      });
    };
    $scope.removeFrequencies = function() {
      return $rootScope.list.phrases.forEach(function(list_item) {
        return list_item.frequency = void 0;
      });
    };
    $scope.removeMinuses = function() {
      return $rootScope.list.phrases.forEach(function(phrase) {
        return phrase.minus = '';
      });
    };
    $scope.removeStartingWith = function(sign, phrases) {
      if (phrases == null) {
        phrases = null;
      }
      (phrases || $rootScope.list.phrases).forEach(function(list_item, index) {
        var words;
        words = [];
        list_item.phrase.split(' ').forEach(function(word) {
          if (word.length && word[0] !== sign) {
            return words.push(word);
          }
        });
        return list_item.phrase = words.join(' ').trim();
      });
      return $scope.removeEmptyWords(phrases);
    };
    $scope.removeEmptyWords = function(phrases) {
      var new_phrases;
      if (phrases == null) {
        phrases = null;
      }
      new_phrases = _.filter(phrases || $rootScope.list.phrases, function(phrase) {
        return phrase.phrase.trim() !== '';
      });
      if (phrases) {
        return new_phrases;
      } else {
        return $rootScope.list.phrases = new_phrases;
      }
    };
    $scope.removePhrase = function(phrase) {
      return $rootScope.list.phrases = _.without($rootScope.list.phrases, phrase);
    };
    $scope.configureMinus = function() {
      $scope.removeMinuses();
      $rootScope.list.phrases.forEach(function(phrase) {
        var words_list;
        words_list = phrase.phrase.split(' ');
        return $rootScope.list.phrases.forEach(function(phrase2) {
          var flag, words_list2;
          if (phrase.phrase !== phrase2.phrase) {
            words_list2 = phrase2.phrase.split(' ');
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
      });
      return $rootScope.list.phrases.forEach(function(phrase) {
        var minus_list;
        if (phrase.hasOwnProperty('minuses') && phrase.minuses.length) {
          minus_list = phrase.minus.split(' ');
          minus_list = minus_list.concat(phrase.minuses);
          phrase.minus = minus_list.join(' ').trim();
          return phrase.minuses = [];
        }
      });
    };
    $scope.clear = function() {
      return $rootScope.list.phrases = [];
    };
    $scope.saveAs = function() {
      $rootScope.loading = true;
      $rootScope.route.title = $rootScope.list.title;
      if ($rootScope.list.id) {
        $rootScope.list.$update().then(function() {
          return $rootScope.loading = false;
        });
      } else {
        $rootScope.list.$save().then(function() {
          return $rootScope.loading = false;
        });
      }
      return closeModal('save-as');
    };
    $scope.save = function() {
      $rootScope.loading = true;
      return $rootScope.list.$update().then(function() {
        return $rootScope.loading = false;
      });
    };
    $scope.getFrequencies = function() {
      $scope.frequencies = [];
      return getFrequencies();
    };
    getFrequencies = function(step) {
      var length, phrases;
      if (step == null) {
        step = 0;
      }
      phrases = $rootScope.list.phrases.slice(step * 100, (step * 100) + 100);
      length = $rootScope.list.phrases.length / 10 * 10 + 100;
      $rootScope.center_title = Math.round(step / length * 10000) + '%';
      return $http.post('api/getFrequencies', {
        phrases: _.pluck(phrases, 'phrase')
      }).then(function(response) {
        $scope.frequencies = $scope.frequencies.concat(response.data);
        if (phrases.length === 100) {
          return getFrequencies(step + 1);
        } else {
          $rootScope.list.phrases.forEach(function(phrase, index) {
            return phrase.frequency = $scope.frequencies[index];
          });
          return $rootScope.center_title = void 0;
        }
      }, function(response) {
        return notifyError(response.data);
      });
    };
    $scope.transform = function() {
      TransformService.phrases = angular.copy($rootScope.list.phrases);
      TransformService.phrases = $scope.splitPhrasesToWords(TransformService.phrases);
      TransformService.phrases = $scope.uniq(TransformService.phrases);
      TransformService.phrases = _.sortBy(TransformService.phrases, 'phrase');
      return showModal('transform');
    };
    angular.element(document).ready(function() {
      return console.log($scope.title);
    });
    $scope.onEnter = function(func, event) {
      if (event.keyCode === 13) {
        return func();
      }
    };
    $scope.runModal = function(action, title, placeholder, value) {
      if (placeholder == null) {
        placeholder = 'список слов или фраз';
      }
      if (value == null) {
        value = null;
      }
      $scope.modal = {
        value: value,
        action: action,
        title: title,
        placeholder: placeholder
      };
      return showModal('main');
    };
    $scope.filterItems = function(value) {
      return value.phrase.match($scope.phrase_search);
    };
    separateMinuses = function(phrase) {
      var minus, words;
      minus = [];
      words = [];
      phrase.split(' ').forEach(function(value) {
        if (value[0] === '-' && value.length) {
          return minus.push(value);
        } else {
          return words.push(value);
        }
      });
      return [words.join(' '), minus.join(' ')];
    };
    return buildPhraseValue = function(phrase) {
      var result;
      result = '';
      result += phrase.phrase;
      if (phrase.minuses.length) {
        result += ' -' + phrase.minuses.join(' -');
      }
      if (phrase.frequency) {
        result += '\t' + phrase.frequency;
      }
      return result;
    };
  });

}).call(this);

(function() {
  angular.module('Wstat').value('Published', [
    {
      id: 0,
      title: 'не опубликовано'
    }, {
      id: 1,
      title: 'опубликовано'
    }
  ]).value('UpDown', [
    {
      id: 1,
      title: 'вверху'
    }, {
      id: 2,
      title: 'внизу'
    }
  ]);

}).call(this);

(function() {


}).call(this);

(function() {


}).call(this);

(function() {
  angular.module('Wstat').directive('ngCounter', function($timeout) {
    return {
      restrict: 'A',
      link: function($scope, $element, $attrs) {
        var counter;
        $($element).parent().append("<span class='input-counter'></span>");
        counter = $($element).parent().find('.input-counter');
        $($element).on('keyup', function() {
          return counter.text($(this).val().length || '');
        });
        return $timeout(function() {
          return $($element).keyup();
        }, 500);
      }
    };
  });

}).call(this);

(function() {


}).call(this);

(function() {


}).call(this);

(function() {
  angular.module('Wstat').directive('ngMulti', function() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        object: '=',
        model: '=',
        label: '@',
        noneText: '@'
      },
      templateUrl: 'directives/ngmulti',
      controller: function($scope, $element, $attrs, $timeout) {
        return $timeout(function() {
          return $($element).selectpicker({
            noneSelectedText: $scope.noneText
          });
        }, 100);
      }
    };
  });

}).call(this);

(function() {
  angular.module('Wstat').directive('orderBy', function() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        options: '='
      },
      templateUrl: 'directives/order-by',
      link: function($scope, $element, $attrs) {
        var IndexService, local_storage_key, syncIndexService;
        IndexService = $scope.$parent.IndexService;
        local_storage_key = 'sort-' + IndexService.controller;
        syncIndexService = function(sort) {
          IndexService.sort = sort;
          IndexService.current_page = 1;
          return IndexService.loadPage();
        };
        $scope.setSort = function(sort) {
          $scope.sort = sort;
          localStorage.setItem(local_storage_key, sort);
          return syncIndexService(sort);
        };
        $scope.sort = localStorage.getItem(local_storage_key);
        if ($scope.sort === null) {
          return $scope.setSort(0);
        } else {
          return syncIndexService($scope.sort);
        }
      }
    };
  });

}).call(this);

(function() {


}).call(this);

(function() {


}).call(this);

(function() {
  angular.module('Wstat').directive('plural', function() {
    return {
      restrict: 'E',
      scope: {
        count: '=',
        type: '@',
        noneText: '@'
      },
      templateUrl: 'directives/plural',
      controller: function($scope, $element, $attrs, $timeout) {
        $scope.textOnly = $attrs.hasOwnProperty('textOnly');
        $scope.hideZero = $attrs.hasOwnProperty('hideZero');
        return $scope.when = {
          'minute': ['минуту', 'минуты', 'минут'],
          'hour': ['час', 'часа', 'часов'],
          'day': ['день', 'дня', 'дней'],
          'phrase': ['фраза', 'фразы', 'фраз'],
          'minus': ['минус слово', 'минус слова', 'минус слов']
        };
      }
    };
  });

}).call(this);

(function() {


}).call(this);

(function() {
  angular.module('Wstat').directive('ngSelectNew', function() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        object: '=',
        model: '=',
        noneText: '@',
        label: '@',
        field: '@'
      },
      templateUrl: 'directives/select-new',
      controller: function($scope, $element, $attrs, $timeout) {
        var value;
        if (!$scope.noneText) {
          value = _.first(Object.keys($scope.object));
          if ($scope.field) {
            value = $scope.object[value][$scope.field];
          }
          $scope.model = value;
        }
        return $timeout(function() {
          return $($element).selectpicker();
        }, 500);
      }
    };
  });

}).call(this);

(function() {
  angular.module('Wstat').directive('ngSelect', function() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        object: '=',
        model: '=',
        noneText: '@',
        label: '@',
        field: '@'
      },
      templateUrl: 'directives/ngselect',
      controller: function($scope, $element, $attrs, $timeout) {
        if (!$scope.noneText) {
          if ($scope.field) {
            $scope.model = $scope.object[_.first(Object.keys($scope.object))][$scope.field];
          } else {
            $scope.model = _.first(Object.keys($scope.object));
          }
        }
        return $timeout(function() {
          return $($element).selectpicker();
        }, 150);
      }
    };
  });

}).call(this);

(function() {


}).call(this);

(function() {


}).call(this);

(function() {


}).call(this);

(function() {


}).call(this);

(function() {
  var apiPath, countable, updatable;

  angular.module('Wstat').factory('Phrase', function($resource) {
    return $resource(apiPath('phrases'), {
      id: '@id'
    }, updatable());
  }).factory('List', function($resource) {
    return $resource(apiPath('lists'), {
      id: '@id'
    }, updatable());
  });

  apiPath = function(entity, additional) {
    if (additional == null) {
      additional = '';
    }
    return ("api/" + entity + "/") + (additional ? additional + '/' : '') + ":id";
  };

  updatable = function() {
    return {
      update: {
        method: 'PUT'
      }
    };
  };

  countable = function() {
    return {
      count: {
        method: 'GET'
      }
    };
  };

}).call(this);

(function() {
  angular.module('Wstat').service('AceService', function() {
    this.initEditor = function(FormService, minLines, id) {
      if (minLines == null) {
        minLines = 30;
      }
      if (id == null) {
        id = 'editor';
      }
      this.editor = ace.edit(id);
      this.editor.getSession().setMode("ace/mode/html");
      this.editor.getSession().setUseWrapMode(true);
      this.editor.setOptions({
        minLines: minLines,
        maxLines: Infinity
      });
      return this.editor.commands.addCommand({
        name: 'save',
        bindKey: {
          win: 'Ctrl-S',
          mac: 'Command-S'
        },
        exec: function(editor) {
          return FormService.edit();
        }
      });
    };
    return this;
  });

}).call(this);

(function() {
  angular.module('Wstat').service('IndexService', function($rootScope) {
    this.filter = function() {
      $.cookie(this.controller, JSON.stringify(this.search), {
        expires: 365,
        path: '/'
      });
      this.current_page = 1;
      return this.pageChanged();
    };
    this.max_size = 30;
    this.init = function(Resource, current_page, attrs, load_page) {
      if (load_page == null) {
        load_page = true;
      }
      $rootScope.frontend_loading = true;
      this.Resource = Resource;
      this.current_page = parseInt(current_page);
      this.controller = attrs.ngController.toLowerCase().slice(0, -5);
      this.search = $.cookie(this.controller) ? JSON.parse($.cookie(this.controller)) : {};
      if (load_page) {
        return this.loadPage();
      }
    };
    this.loadPage = function() {
      var params;
      params = {
        page: this.current_page
      };
      if (this.sort !== void 0) {
        params.sort = this.sort;
      }
      return this.Resource.get(params, (function(_this) {
        return function(response) {
          _this.page = response;
          return $rootScope.frontend_loading = false;
        };
      })(this));
    };
    this.pageChanged = function() {
      $rootScope.frontend_loading = true;
      this.loadPage();
      return this.changeUrl();
    };
    this.changeUrl = function() {
      return window.history.pushState('', '', this.controller + '?page=' + this.current_page);
    };
    return this;
  }).service('FormService', function($rootScope, $q, $timeout) {
    var beforeSave, modelLoaded, modelName;
    this.init = function(Resource, id, model) {
      this.dataLoaded = $q.defer();
      $rootScope.frontend_loading = true;
      this.Resource = Resource;
      this.saving = false;
      if (id) {
        return this.model = Resource.get({
          id: id
        }, (function(_this) {
          return function() {
            return modelLoaded();
          };
        })(this));
      } else {
        this.model = new Resource(model);
        return modelLoaded();
      }
    };
    modelLoaded = (function(_this) {
      return function() {
        $rootScope.frontend_loading = false;
        return $timeout(function() {
          _this.dataLoaded.resolve(true);
          return $('.selectpicker').selectpicker('refresh');
        });
      };
    })(this);
    beforeSave = (function(_this) {
      return function() {
        if (_this.error_element === void 0) {
          ajaxStart();
          if (_this.beforeSave !== void 0) {
            _this.beforeSave();
          }
          _this.saving = true;
          return true;
        } else {
          $(_this.error_element).focus();
          return false;
        }
      };
    })(this);
    modelName = function() {
      var l, model_name;
      l = window.location.pathname.split('/');
      model_name = l[l.length - 2];
      if ($.isNumeric(model_name)) {
        model_name = l[l.length - 3];
      }
      return model_name;
    };
    this["delete"] = function(event) {
      return bootbox.confirm("Вы уверены, что хотите " + ($(event.target).text()) + " #" + this.model.id + "?", (function(_this) {
        return function(result) {
          if (result === true) {
            beforeSave();
            return _this.model.$delete().then(function() {
              return redirect(modelName());
            });
          }
        };
      })(this));
    };
    this.edit = function() {
      if (!beforeSave()) {
        return;
      }
      return this.model.$update().then((function(_this) {
        return function() {
          _this.saving = false;
          return ajaxEnd();
        };
      })(this));
    };
    this.create = function() {
      if (!beforeSave()) {
        return;
      }
      return this.model.$save().then((function(_this) {
        return function(response) {
          return redirect(modelName() + ("/" + response.id + "/edit"));
        };
      })(this), (function(_this) {
        return function(response) {
          _this.saving = false;
          ajaxEnd();
          return _this.onCreateError(response);
        };
      })(this));
    };
    return this;
  });

}).call(this);

(function() {
  angular.module('Wstat').service('ExportService', function($rootScope, FileUploader) {
    bindArguments(this, arguments);
    this.init = function() {
      this.FileUploader.FileSelect.prototype.isEmptyAfterSelection = function() {
        return true;
      };
      return this.uploader = new this.FileUploader({
        url: "excel/import",
        alias: 'imported_file',
        method: 'post',
        autoUpload: true,
        removeAfterUpload: true,
        onBeforeUploadItem: function() {
          if (scope.list.id) {
            return this.url += "/" + scope.list.id;
          }
        },
        onCompleteItem: function(i, response, status) {
          if (status === 200) {
            notifySuccess('Импортировано');
            if (response.length) {
              return scope.list.phrases = response;
            }
          } else {
            return notifyError('Ошибка импорта');
          }
        },
        onWhenAddingFileFailed: function(item, filter) {
          if (filter.name === "queueLimit") {
            this.clearQueue();
            return this.addToQueue(item);
          }
        }
      });
    };
    this["import"] = function(e) {
      e.preventDefault();
      $('#import-button').trigger('click');
    };
    this["export"] = function() {
      if (scope.list.id) {
        window.location = "/excel/export/" + scope.list.id;
      }
    };
    return this;
  });

}).call(this);

(function() {
  angular.module('Wstat').service('SmartSort', function() {
    var splitBySpace;
    this.run = function(list) {
      this.list = list;
      if (!(this.list.phrases && this.list.phrases.length)) {
        return;
      }
      this.getWords();
      this.getWeights();
      return this.sortPhraseByWeight();
    };
    this.getWords = function() {
      var index, phrase, ref, results;
      this.words = [];
      ref = this.list.phrases;
      results = [];
      for (index in ref) {
        phrase = ref[index];
        results.push(this.words.push.apply(this.words, splitBySpace(phrase.phrase)));
      }
      return results;
    };
    this.getWeights = function() {
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
    };
    this.sortPhraseByWeight = function() {
      this.list.phrases.forEach((function(_this) {
        return function(phrase) {
          var phrase_weight, words, words_sorted_by_weight;
          words = splitBySpace(phrase.phrase);
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
    };
    splitBySpace = function(string) {
      return _.without(string.split(' '), '');
    };
    return this;
  });

}).call(this);

(function() {
  angular.module('Wstat').service('TransformService', function($rootScope) {
    this.selectRow = function(index) {
      if (this.selected_rows === void 0) {
        this.selected_rows = [];
      }
      if (this.selected_rows.indexOf(index) === -1) {
        return this.selected_rows.push(index);
      } else {
        return this.selected_rows.splice(this.selected_rows.indexOf(index), 1);
      }
    };
    this.add = function(index) {
      if (this.transform_items === void 0) {
        this.transform_items = {};
      }
      if (this.phrases[index].words === void 0) {
        this.phrases[index].words = [];
      }
      this.selected_rows.forEach((function(_this) {
        return function(position) {
          _this.phrases[position].added = true;
          return _this.phrases[index].words.push(_this.phrases[position].phrase);
        };
      })(this));
      if (this.transform_items[index] === void 0) {
        this.transform_items[index] = [];
      }
      this.transform_items[index] = this.transform_items[index].concat(this.selected_rows);
      this.selected_rows = void 0;
      return console.log(this.transform_items);
    };
    this.remove = function(index) {
      this.transform_items[index].forEach((function(_this) {
        return function(position) {
          _this.phrases[position].added = false;
          return _this.phrases[position].words = void 0;
        };
      })(this));
      return this.transform_items[index] = void 0;
    };
    this.transform = function() {
      $rootScope.list.phrases.forEach((function(_this) {
        return function(phrase) {
          return $.each(_this.transform_items, function(main_index, item_indexes) {
            return item_indexes.forEach(function(item_index) {
              return phrase.phrase = replaceWord(phrase.phrase, _this.phrases[item_index].phrase, _this.phrases[main_index].phrase);
            });
          });
        };
      })(this));
      this.cancel();
      return closeModal('transform');
    };
    this.cancel = function() {
      this.phrases = void 0;
      this.selected_rows = void 0;
      return this.transform_items = void 0;
    };
    return this;
  });

}).call(this);

//# sourceMappingURL=app.js.map
