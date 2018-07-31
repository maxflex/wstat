@extends('login')
@section('content')
<center autocomplete="off" id='center' class="animated fadeIn" style='animation-duration: 1.5s'>
    <div class="g-recaptcha" data-sitekey="{{ config('captcha.site') }}" data-size="invisible" data-callback="captchaChecked"></div>
    <div class="login-logo group">
        <img src="/img/svg/logo.svg" />
    </div>
    <div class="input-groups">
        <div class="group">
            <input ng-disabled="sms_verification || logged_user" type="text" id="inputLogin" placeholder="email" autofocus ng-model="login" autocomplete="off" ng-keyup="enter($event)">
        </div>
        <div class="group">
            <input ng-disabled="sms_verification" type="password" id="inputPassword"  placeholder="пароль" ng-model="password" autocomplete="new-password" ng-keyup="enter($event)">
        </div>
        <div class="group" ng-show="sms_verification">
            <input type="text" id="sms-code" placeholder="sms code" ng-model="code" autocomplete="off" ng-keyup="enter($event)">
        </div>
        <div class="group">
            <button class="btn btn-submit ladda-button" type="submit" id="login-submit" data-style="zoom-in" ng-disabled="in_process" ng-click="checkFields()">войти</button>
        </div>
    </div>
    <div class="password-controls">
		<div>
			<a ng-click="clearLogged()" class="pointer forgot-password" ng-show="logged_user">другой пользователь</a>
		</div>
    </div>
    <div ng-show="error" class="login-errors">
			@{{ error }}
  		</div>
</center>
@stop
