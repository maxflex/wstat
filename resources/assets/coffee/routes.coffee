angular.module('Wstat')
    .config (['$routeProvider', ($routeProvider) ->
        $routeProvider.when '/',
            controller : 'MainCtrl'
            title: '–'
            templateUrl: 'pages/main'
        .when '/lists',
            templateUrl: 'pages/lists'
            title: 'Списки'
            controller : 'ListsCtrl'
    ])
