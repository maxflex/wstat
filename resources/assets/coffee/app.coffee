angular.module("Wstat", ['ngRoute', 'ngSanitize', 'ngResource', 'ngAnimate', 'ui.sortable', 'ui.bootstrap', 'angular-ladda', 'angularFileUpload'])
    .constant('DEFAULT_LIST_TITLE', 'Новый список')
    .run ($rootScope, List, DEFAULT_LIST_TITLE, ExportService, SmartSort) ->
        $rootScope.ExportService = ExportService
        $rootScope.SmartSort = SmartSort
        ExportService.init()
        # список слов
        $rootScope.list = new List
            title: null
            phrases: []
        # $rootScope.list = List.get({id: 12}) if ENV is 'local'

        # удалить пустые слова из списка
        $rootScope.removeEmptyWords = ->
            $rootScope.list.phrases = _.filter $rootScope.list.phrases, (phrase) ->
                phrase.phrase.trim() isnt ''

        $rootScope.loading = false

        $rootScope.$watch 'loading', (newVal, oldVal) ->
            ajaxStart() if newVal is true
            ajaxEnd() if newVal is false

        $rootScope.formatDateTime = (date) ->
            moment(date).format "DD.MM.YY в HH:mm"

        $rootScope.$on '$routeChangeStart', (event, next, prev) ->
            $rootScope.route = next.$$route
            $rootScope.route.title = $rootScope.list.title or DEFAULT_LIST_TITLE if $rootScope.route.originalPath is '/'
            ExportService.init({list: $rootScope.list})
