# #
# # Dependencies: UserService should be available in parent scope!
# #
#
# angular.module 'Egerep'
#     .directive 'userSwitch', ->
#         restrict: 'E'
#         scope:
#             entity: '='
#             resource: '='
#             userId: '@'
#         templateUrl: 'directives/user-switch'
#         controller: ($scope) ->
#             $scope.UserService = $scope.$parent.UserService
