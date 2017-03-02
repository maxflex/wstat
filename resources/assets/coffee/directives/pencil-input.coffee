# angular.module('Egerep').directive 'pencilInput', ->
#     restrict: 'E'
#     replace: true
#     templateUrl: 'directives/pencil-input'
#     scope:
#         model: '='
#     controller: ($scope, $timeout, $element, $controller) ->
#         $scope.is_being_commented = false
#
#         $scope.blurComment = ->
#             $scope.is_being_commented = false
#
#         $scope.focusComment = ->
#             $scope.is_being_commented = true
#
#         $scope.startComment = (event) ->
#             $scope.is_being_commented = true
#             $timeout ->
#                 $(event.target).parent().children('div').focus()
#
#         $scope.watchEnter = (event) ->
#             if event.keyCode in [13, 27]
#                 # @todo: надо изменить
#                 if event.keyCode is 13
#                     $scope.model = $(event.target).parent().children('div').text()
#
#                 $(event.target).parent().children('div').text($scope.model)
#                 event.preventDefault()
#                 $(event.target).blur()
#             return
