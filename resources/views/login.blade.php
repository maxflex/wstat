<!DOCTYPE html>
<html>
  <head>
    <title>WSTAT | Вход</title>
    <meta charset="utf-8">
    <meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' name='viewport'>
    <meta charset="utf-8">
    <base href="{{ config('app.url') }}">
    <link href="css/app.css" rel="stylesheet" type="text/css">
    <link href="css/signin.css" rel="stylesheet" type="text/css">
    @yield('scripts')

    <script src="{{ asset('/js/vendor.js') }}"></script>
    <script src="{{ asset('/js/app.js') }}"></script>
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
  </head>

  <body class="content animated fadeIn login-ec" ng-app="Wstat" ng-controller="LoginCtrl"
    ng-init='wallpaper = {{ json_encode($wallpaper) }}; logged_user = <?= (isset($_COOKIE['logged_user']) ? $_COOKIE['logged_user'] : 'null') ?>'>
      <div ng-show="image_loaded">
          @yield('content')
      </div>
      <div ng-show="!image_loaded">
          <img src="/img/svg/tail-spin.svg" />
      </div>
  </body>
</html>
