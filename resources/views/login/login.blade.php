@extends('login')


@section('content')
<center ng-app="Login" ng-controller="LoginCtrl">


	<form class="form-signin" ng-submit="checkFields()" autocomplete="off">
<!-- 		<h2 class="form-signin-heading">Вход в систему</h2> -->
		<input type="text" id="inputLogin" class="form-control" placeholder="Логин" autofocus name="login" ng-model="login" autocomplete="off">
		<input type="password" id="inputPassword" class="form-control" placeholder="Пароль" name="password" ng-model="password" autocomplete="off">
		<input type="password" autocomplete="passoword" style="display:none" />
		<button id="login-submit" data-style="zoom-in" ng-disabled="in_process" class="btn btn-lg btn-primary btn-block ladda-button" type="submit"><span class="glyphicon glyphicon-lock"></span><span ng-show="!in_process">Войти</span><span ng-show="in_process">Вход</span>
		</button>


	</form>
</center>
@stop
