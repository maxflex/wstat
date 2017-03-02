angular.module("Wstat", ['ngRoute', 'ngSanitize', 'ngResource', 'ngAnimate', 'ui.sortable', 'ui.bootstrap', 'angular-ladda', 'angularFileUpload'])
    .run ($rootScope) ->
        # список слов
        $rootScope.list =
            title: 'Новый список'
            phrases: []

        $rootScope.$on '$routeChangeStart', (event, next, prev) ->
            $rootScope.title = next.$$route.title
