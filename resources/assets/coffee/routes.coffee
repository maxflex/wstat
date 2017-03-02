angular.module('Wstat')
    .config (['$routeProvider', ($routeProvider) ->
        $routeProvider.when '/',
            controller : 'MainCtrl'
            title: 'Списки фраз'
            templateUrl: 'pages/main'
        .when '/wall',
            templateUrl: 'wall.html'
            controller : 'pages/wall'
    ])
