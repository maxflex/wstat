# angular.module('Egerep').directive 'inputComment', ->
#     restrict: 'E'
#     templateUrl: 'directives/input-comment'
#     scope:
#         entity: '='
#         commentField: '@'
#     controller: ($scope, $timeout) ->
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
#                 $(event.target).parent().children('input').focus()
#
#         $scope.endComment =  (event) ->
#             if event.keyCode is 13
#                 $(event.target).blur()
#                 return
