<!DOCTYPE html>
<html>
  <head>
    <title>WStat</title>
    <meta charset="utf-8">
    <meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' name='viewport'>
    <meta charset="utf-8">
    <base href="{{ config('app.url') }}">
    <link href="css/app.css" rel="stylesheet" type="text/css">
    <link rel="shortcut icon" href="favicon.png" />
    {{-- <link href='https://fonts.googleapis.com/css?family=Ubuntu&subset=latin,cyrillic' rel='stylesheet' type='text/css'> --}}
    @yield('scripts')
    <script src="{{ asset('/js/vendor.js', isProduction()) }}"></script>
    <script src="{{ asset('/js/app.js', isProduction()) }}"></script>
    @yield('scripts_after')
    @include('server_variables')

  </head>
  <body class="content" ng-app="Wstat" ng-controller="MainCtrl"
        ng-init='user = {{ $user }};
        @if (isset($nginit))
            {{ $nginit }}
        @endif
    '>
    <div class="row">
      <div style="margin-left: 10px" class="col-sm-2">
          <div class="list-group main-menu">
              @include('_menu')
          </div>
      </div>
      <div style="padding: 0; width: 80.6%;" class="col-sm-9 content-col">
        <div class="panel panel-primary">
          <div class="panel-heading panel-heading-main">
              <div class="row">
                  <div class="col-sm-4">@{{ title }}</div>
                  <div class="col-sm-4 center">
                      @yield('title-center')
                  </div>
                  <div class="col-sm-4 right">
                      @yield('title-right')
                  </div>
              </div>

          </div>
          <div class="panel-body panel-frontend-loading">
              {{-- <div class="frontend-loading animate-fadeIn" ng-show='frontend_loading'>
                  <span>загрузка...</span>
              </div> --}}
              <div ng-view></div>
              {{-- @yield('content') --}}
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
