angular.module 'Wstat'
    .directive 'orderBy', ->
        restrict: 'E'
        replace: true
        scope:
            options: '='
        templateUrl: 'directives/order-by'
        link: ($scope, $element, $attrs) ->
            IndexService = $scope.$parent.IndexService
            local_storage_key = 'sort-' + IndexService.controller

            syncIndexService = (sort) ->
                IndexService.sort = sort
                IndexService.current_page = 1
                IndexService.loadPage()

            $scope.setSort = (sort) ->
                $scope.sort = sort
                localStorage.setItem(local_storage_key, sort)
                syncIndexService(sort)

            $scope.sort = localStorage.getItem(local_storage_key)

            if $scope.sort is null
                $scope.setSort(0)
            else
                syncIndexService($scope.sort)
