@extends('login')


@section('content')
<center ng-app="Login" ng-controller="LoginCtrl">
	<div class="form-signin" autocomplete="off">
		<input ng-disabled="sms_verification" type="text" id="inputLogin" class="form-control" placeholder="Логин" autofocus ng-model="$parent.login" autocomplete="off" ng-keyup="enter($event)">
		<input ng-disabled="sms_verification" type="password" id="inputPassword" class="form-control" placeholder="Пароль" ng-model="$parent.password" autocomplete="off" ng-keyup="enter($event)">
		<input type="password" autocomplete="passoword" style="display:none" />

		<button id="login-submit" data-style="zoom-in" ng-disabled="in_process"
			class="btn btn-lg btn-primary btn-block ladda-button" type="submit" ng-click="checkFields()">
			<span class="glyphicon glyphicon-lock"></span><span ng-show="!in_process">Войти</span>
			<span ng-show="in_process">Вход</span>
		</button>
	</div>
</center>

<div class="g-recaptcha" data-sitekey="{{ config('captcha.site') }}" data-size="invisible" data-callback="captchaChecked"></div>
<script src='https://www.google.com/recaptcha/api.js?hl=ru'></script>
<style>
    .grecaptcha-badge {
        visibility: hidden;
    }
</style>
<script>
    function captchaChecked() {
        scope.goLogin()
    }
</script>
@stop
