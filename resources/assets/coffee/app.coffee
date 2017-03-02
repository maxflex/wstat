angular.module("Wstat", ['ngRoute', 'ngSanitize', 'ngResource', 'ngAnimate', 'ui.sortable', 'ui.bootstrap', 'angular-ladda', 'angularFileUpload'])
    .run ($rootScope) ->
        $rootScope.$on '$routeChangeStart', (event, next, prev) ->
            $rootScope.title = next.$$route.title
