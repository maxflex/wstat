# angular.module('Egerep').directive 'sms', ->
#     restrict: 'E'
#     templateUrl: 'directives/sms'
#     scope:
#         number: '='
#     controller: ($scope, $timeout, Sms) ->
#         # массовая отправка?
#         $scope.mass = false
#
#         # подсчитать СМС
#         $scope.smsCount = ->
#             SmsCounter.count($scope.message || '').messages
#
#         # отправить
#         $scope.send = ->
#             if $scope.message
#                 sms = new Sms
#                     message: $scope.message
#                     to: $scope.number
#                     mass: $scope.mass
#                 sms.$save()
#                     .then (data) ->
#                         $scope.history.push(data)
#                         scrollDown()
#
#         # подгружаем историю, если номер телефона меняется
#         $scope.$watch 'number', (newVal, oldVal) ->
#             console.log $scope.$parent.formatDateTime($scope.created_at)
#             $scope.history = Sms.query({number: newVal}) if newVal
#             scrollDown()
#
#         scrollDown = ->
#             $timeout ->
#                 $("#sms-history").animate({ scrollTop: $(window).height() }, "fast");
