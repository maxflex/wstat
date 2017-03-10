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
  <body class="content">
      <div id='app'>
        <div class="row">
          <div style="margin-left: 10px" class="col-sm-2 menu-col">
              <div class="list-group main-menu">
                  @include('components.menu')
              </div>
          </div>
          <div class="col-sm-9 content-col">
            <div class="panel panel-primary">
              <div class="panel-heading panel-heading-main">
                  <div class="row" v-show="page == 'list'">
                      <div class="col-sm-4">@{{ list.title || 'Новый список' }}</div>
                      <div class="col-sm-4 center">
                          @{{ center_title }}
                      </div>
                      <div class="col-sm-4 right">
                          <span class="link-raw" v-if="filtered_phrases.length">количество фраз: @{{ filtered_phrases.length }}</span>
                      </div>
                  </div>
                  <div class="row" v-show="page == 'open'">
                      <div class="col-sm-4">Открыть список</div>
                      <div class="col-sm-4 center">
                      </div>
                      <div class="col-sm-4 right">
                          <span class='link-like' @click="page = 'list'">назад</span>
                      </div>
                  </div>
              </div>
              <div class="panel-body panel-frontend-loading">
                  @include('components.main')
              </div>
            </div>
          </div>
        </div>
    </div>
  </body>
</html>
