angular.module 'Wstat'
    .directive 'ngSelectNew', ->
        restrict: 'E'
        replace: true
        scope:
            object: '='
            model: '='
            noneText: '@'
            label: '@'
            field: '@'
        templateUrl: 'directives/select-new'
        controller: ($scope, $element, $attrs, $timeout) ->
            # выбираем первое значение по умолчанию, если нет noneText
            if not $scope.noneText
                value = _.first Object.keys($scope.object)
                value = $scope.object[value][$scope.field] if $scope.field

                $scope.model = value
            $timeout ->
                $($element).selectpicker()
            , 500
