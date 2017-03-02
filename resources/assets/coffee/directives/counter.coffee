angular.module('Wstat').directive 'ngCounter', ($timeout) ->
    restrict: 'A'
    link: ($scope, $element, $attrs) ->
        $($element).parent().append "<span class='input-counter'></span>"
        counter = $($element).parent().find('.input-counter')

        $($element).on 'keyup', -> counter.text $(@).val().length or ''

        $timeout ->
            $($element).keyup()
        , 500
