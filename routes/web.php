<?php
URL::forceSchema('https');

# Login
Route::post('login', 'LoginController@login');
Route::get('logout', 'LoginController@logout');


Route::group(['middleware' => ['login']], function () {
    # Variables
    Route::get('/', 'MainController@index');

    # Templates for angular directives
    Route::get('directives/{directive}', function($directive) {
        return view("directives.{$directive}");
    });
    # Angular pages
    Route::get('pages/{page}', function($page) {
        return view("pages.{$page}");
    });

    // Route::get('excel/export', 'ExcelController@export');
    Route::post('export', 'ExcelController@export');

    Route::get('aga', function() {
        $w = new App\Service\Wordstat;
        $response = $w->getRaw('репетитор');
        return dump($w->decode($response));
    });
});
