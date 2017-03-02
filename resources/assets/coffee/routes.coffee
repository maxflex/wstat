angular.module('Wstat')
    .config (['$routeProvider', ($routeProvider) ->
        $routeProvider.when '/',
            controller : 'MainCtrl'
            title: '–'
            templateUrl: 'pages/main'
        .when '/wall',
            templateUrl: 'wall.html'
            controller : 'pages/wall'
    ])
