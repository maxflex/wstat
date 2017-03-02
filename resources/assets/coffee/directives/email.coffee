# angular.module('Egerep').directive 'email', ->
#     restrict: 'E'
#     templateUrl: 'directives/email'
#     scope:
#         entity: '='
#     controller: ($scope) ->
#         $scope.send = ->
#             $('#email-modal').modal 'show'
#     # controller: ($scope, $timeout, Email) ->
#     #     # массовая отправка?
#     #     $scope.mass = false
#     #
#     #     # подсчитать СМС
#     #     $scope.smsCount = ->
#     #         SmsCounter.count($scope.message || '').messages
#     #
#     #     # отправить
#     #     $scope.send = ->
#     #         if $scope.message
#     #             sms = new Sms
#     #                 message: $scope.message
#     #                 to: $scope.number
#     #                 mass: $scope.mass
#     #             sms.$save()
#     #
#     #     # подгружаем историю, если номер телефона меняется
#     #     $scope.$watch 'number', (newVal, oldVal) ->
#     #         console.log $scope.$parent.formatDateTime($scope.created_at)
#     #         $scope.history = Sms.query({number: newVal}) if newVal
