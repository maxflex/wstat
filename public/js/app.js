(function() {
  angular.module("Wstat", ['ngRoute', 'ngSanitize', 'ngResource', 'ngAnimate', 'ui.sortable', 'ui.bootstrap', 'angular-ladda', 'angularFileUpload']).run(function($rootScope) {
    $rootScope.list = {
      title: 'Новый список',
      phrases: []
    };
    return $rootScope.$on('$routeChangeStart', function(event, next, prev) {
      return $rootScope.title = next.$$route.title;
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
      }).when('/wall', {
        templateUrl: 'wall.html',
        controller: 'pages/wall'
      });
    }
  ]);

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
  angular.module('Wstat').controller('MainCtrl', function($scope, $rootScope, $timeout, ExportService) {
    $scope.ExportService = ExportService;
    ExportService.init({
      controller: 'pages'
    });
    $scope.$on('$viewContentLoaded', function() {
      return $("#addwords").off('keydown').keydown(function(e) {
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
    $rootScope.title = $rootScope.list.title;
    $scope.addWords = function() {
      var new_phrases;
      $("#addwords").removeClass('has-error');
      new_phrases = [];
      $scope.addwords.split('\n').forEach(function(line) {
        var frequency, list, list_item;
        if (line.trim().length) {
          list = line.split('\t');
          list_item = {
            phrase: list[0].trim()
          };
          if (list.length > 1) {
            frequency = list[1];
            if (!$.isNumeric(frequency)) {
              $("#addwords").addClass('has-error');
              $scope.list = [];
              return;
            } else {
              list_item.frequency = parseInt(frequency);
            }
          }
          return new_phrases.push(list_item);
        }
      });
      $scope.addwords = null;
      $rootScope.list.phrases = $rootScope.list.phrases.concat(new_phrases);
      return closeModal('addwords');
    };
    $scope.splitPhrasesToWords = function() {
      var new_phrases;
      new_phrases = [];
      $rootScope.list.phrases.forEach(function(list_item) {
        return list_item.phrase.split(' ').forEach(function(word) {
          word = word.trim();
          if (word.length) {
            return new_phrases.push({
              phrase: word,
              frequency: list_item.frequency
            });
          }
        });
      });
      return $rootScope.list.phrases = new_phrases;
    };
    $scope.uniq = function() {
      return $rootScope.list.phrases = _.uniq($rootScope.list.phrases, 'phrase');
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
    $scope.removeStartingWith = function(sign) {
      return $rootScope.list.phrases.forEach(function(list_item) {
        var words;
        words = [];
        list_item.phrase.split(' ').forEach(function(word) {
          if (word.length && word[0] !== sign) {
            return words.push(word);
          }
        });
        return list_item.phrase = words.join(' ');
      });
    };
    return angular.element(document).ready(function() {
      return console.log($scope.title);
    });
  });

}).call(this);

(function() {


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
  var apiPath, countable, updatable;

  angular.module('Wstat').factory('Variable', function($resource) {
    return $resource(apiPath('variables'), {
      id: '@id'
    }, updatable());
  }).factory('Tag', function($resource) {
    return $resource(apiPath('tags'), {
      id: '@id'
    }, {
      update: {
        method: 'PUT'
      },
      autocomplete: {
        method: 'GET',
        url: apiPath('tags', 'autocomplete'),
        isArray: true
      }
    });
  }).factory('Page', function($resource) {
    return $resource(apiPath('pages'), {
      id: '@id'
    }, {
      update: {
        method: 'PUT'
      },
      checkExistance: {
        method: 'POST',
        url: apiPath('pages', 'checkExistance')
      }
    });
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
          'age': ['год', 'года', 'лет'],
          'student': ['ученик', 'ученика', 'учеников'],
          'minute': ['минуту', 'минуты', 'минут'],
          'hour': ['час', 'часа', 'часов'],
          'day': ['день', 'дня', 'дней'],
          'meeting': ['встреча', 'встречи', 'встреч'],
          'score': ['балл', 'балла', 'баллов'],
          'rubbles': ['рубль', 'рубля', 'рублей'],
          'lesson': ['занятие', 'занятия', 'занятий'],
          'client': ['клиент', 'клиента', 'клиентов'],
          'mark': ['оценки', 'оценок', 'оценок'],
          'request': ['заявка', 'заявки', 'заявок']
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
        maxLines: 2e308
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
    this.init = function(options) {
      var onWhenAddingFileFailed;
      this.controller = options.controller;
      this.FileUploader.FileSelect.prototype.isEmptyAfterSelection = function() {
        return true;
      };
      return this.uploader = new this.FileUploader({
        url: "excel/import",
        alias: 'imported_file',
        autoUpload: true,
        method: 'post',
        removeAfterUpload: true,
        onCompleteItem: function(i, response, status) {
          if (status === 200) {
            notifySuccess('Импортировано');
          }
          if (status !== 200) {
            return notifyError('Ошибка импорта');
          }
        }
      }, onWhenAddingFileFailed = function(item, filter, options) {
        if (filter.name === "queueLimit") {
          this.clearQueue();
          return this.addToQueue(item);
        }
      });
    };
    this["import"] = function(e) {
      e.preventDefault();
      $('#import-button').trigger('click');
    };
    this["export"] = function() {
      window.location = "/excel/export";
      return false;
    };
    return this;
  });

}).call(this);

//# sourceMappingURL=app.js.map
