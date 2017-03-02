<!DOCTYPE html>
<html>
  <head>
    <title>WStat</title>
    <meta charset="utf-8">
    <meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' name='viewport'>
    <meta charset="utf-8">
    <base href="{{ config('app.url') }}">
    <link href="css/app.css" rel="stylesheet" type="text/css">
    <link href="css/signin.css" rel="stylesheet" type="text/css">
    @yield('scripts')

    <script src="//maps.google.ru/maps/api/js?key=AIzaSyAXXZZwXMG5yNxFHN7yR4GYJgSe9cKKl7o&libraries=places"></script>
    <script src="{{ asset('/js/vendor.js', isProduction()) }}"></script>
    <script src="{{ asset('/js/app.js', isProduction()) }}"></script>

  </head>

  <body class="content" ng-app="Wstat" ng-controller="LoginCtrl">
      <div class="container">
            <div class="row">
              <div class="col-sm-1">
                {{-- {{ \App\Models\User::fromSession() }} --}}
              </div>
              <div class="col-sm-10">
                  @yield('content')
              </div>
          </div>
      </div>
  </body>

</html>
