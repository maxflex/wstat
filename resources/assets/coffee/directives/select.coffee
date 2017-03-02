angular.module 'Wstat'
    .directive 'ngSelect', ->
        restrict: 'E'
        replace: true
        scope:
            object: '='
            model: '='
            noneText: '@'
            label: '@'
            field: '@'
        templateUrl: 'directives/ngselect'
        controller: ($scope, $element, $attrs, $timeout) ->
            # выбираем первое значение по умолчанию, если нет noneText
            if not $scope.noneText
                if $scope.field
                    $scope.model = $scope.object[_.first Object.keys($scope.object)][$scope.field]
                else
                    $scope.model = _.first Object.keys($scope.object)

            $timeout ->
                $($element).selectpicker()
            , 150
