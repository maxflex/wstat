angular
    .module 'Wstat'
    .controller 'ListsCtrl', ($scope, $rootScope, $location, $timeout, List) ->
        if $scope.lists is undefined
            $rootScope.loading = true
            $scope.lists = List.query -> $rootScope.loading = false

        $scope.remove = (list) ->
            $scope.lists = removeById($scope.lists, list.id)
            List.delete({id: list.id})

        $scope.open = (list) ->
            $rootScope.loading = true
            $rootScope.list = List.get {id: list.id}, ->
                $rootScope.loading = false
                $location.path('/')
