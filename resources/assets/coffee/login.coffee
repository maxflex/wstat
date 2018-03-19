angular
    .module 'Wstat', ['angular-ladda']
    .controller 'LoginCtrl', ($scope, $http) ->
        angular.element(document).ready ->
            $scope.l = Ladda.create(document.querySelector('#login-submit'))
            login_data = $.cookie("login_data")
            if login_data isnt undefined
                login_data = JSON.parse(login_data)
                $scope.login = login_data.login
                $scope.password = login_data.password
                $scope.sms_verification = true
                $scope.$apply()

        #обработка события по enter в форме логина
        $scope.enter = ($event) ->
            if $event.keyCode == 13
                $scope.checkFields()

        $scope.goLogin = ->
            ajaxStart()
            $http.post 'login',
                login: $scope.login
                password: $scope.password
                code: $scope.code
                captcha: grecaptcha.getResponse()
            .then (response) ->
                grecaptcha.reset()
                if response.data is true
                    $.removeCookie('login_data')
                    location.reload()
                else if response.data is 'sms'
                    ajaxEnd()
                    $scope.in_process = false
                    $scope.l.stop()
                    $scope.sms_verification = true
                    $.cookie("login_data", JSON.stringify({login: $scope.login, password: $scope.password}), { expires: 1 / (24 * 60) * 2, path: '/' })
                else
                    $scope.in_process = false
                    ajaxEnd()
                    $scope.l.stop()
                    notifyError "Неправильная пара логин-пароль"

        $scope.checkFields = ->
            $scope.l.start()
            $scope.in_process = true
            if grecaptcha.getResponse() is '' then grecaptcha.execute() else $scope.goLogin()