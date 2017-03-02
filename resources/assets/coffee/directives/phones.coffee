# angular.module('Egerep').directive 'phones', ->
#     restrict: 'E'
#     templateUrl: 'directives/phones'
#     scope:
#         entity: '='
#     controller: ($scope, $timeout, $rootScope, PhoneService, UserService) ->
#         $scope.PhoneService = PhoneService
#         $scope.UserService  = UserService
#
#         console.log $scope.entityType
#
#         # level depth
#         $rootScope.dataLoaded.promise.then (data) ->
#             $scope.level = if $scope.entity.phones and $scope.entity.phones.length then $scope.entity.phones.length else 1
#
#         $scope.nextLevel = ->
#             $scope.level++
#
#         $scope.phoneMaskControl = (event) ->
#             el = $(event.target)
#             # grabs string phone_2 from object model.phone2
#             # so it can be accessible by key
#             phone_id = el.attr('ng-model').split('.')[1]
#             $scope.entity[phone_id] = $(event.target).val()
#
#         $scope.isFull = (number) ->
#             return false if number is undefined or number is ""
#             !number.match(/_/)
#
#         # отправить смс
#         $scope.sms = (number) ->
#             $('#sms-modal').modal 'show'
#             $rootScope.sms_number = number
#
#         # информация по api
#         $scope.info = (number) ->
#             $scope.api_number = number
#             $scope.mango_info = null
#             $('#api-phone-info').modal 'show'
#             PhoneService.info(number).then (response) ->
#                 console.log response.data
#                 $scope.mango_info = response.data
#
#         $scope.formatDateTime = (date) ->
#             moment(date).format "DD.MM.YY в HH:mm"
#
#         $scope.time = (seconds) ->
#             moment({}).seconds(seconds).format("mm:ss")
#
#         $scope.getNumberTitle = (number) ->
#             console.log number, $scope.api_number
#             return 'текущий номер' if number is PhoneService.clean($scope.api_number)
#             number
#
#         recodringLink = (recording_id) ->
#             api_key   = 'goea67jyo7i63nf4xdtjn59npnfcee5l'
#             api_salt  = 't9mp7vdltmhn0nhnq0x4vwha9ncdr8pa'
#             timestamp = moment().add(5, 'minute').unix()
#
#             sha256 = new jsSHA('SHA-256', 'TEXT')
#             sha256.update(api_key + timestamp + recording_id + api_salt)
#             sign = sha256.getHash('HEX')
#
#             return "https://app.mango-office.ru/vpbx/queries/recording/link/#{recording_id}/play/#{api_key}/#{timestamp}/#{sign}"
#
#         $scope.play = (recording_id) ->
#             $scope.audio.pause() if $scope.audio
#             $scope.audio = new Audio recodringLink(recording_id)
#             $scope.audio.play()
#             $scope.is_playing = recording_id
#
#         $scope.isPlaying = (recording_id) ->
#             $scope.is_playing is recording_id
#
#         $scope.stop = (recording_id) ->
#             $scope.is_playing = null
#             $scope.audio.pause()
#
#         $scope.disconnectReason = (data) ->
#             # return 'НБТ' if data.to_extension is '' and data.disconnect_reason is '1100'
#             data.disconnect_reason
