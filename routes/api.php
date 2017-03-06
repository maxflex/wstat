<?php
URL::forceSchema('https');

Route::group(['namespace' => 'Api', 'as' => 'api.'], function () {
    Route::resource('lists', 'ListsController');
    Route::post('getFrequencies', 'DirectController@getFrequencies');
    // Route::controller('functions', 'FunctionsController');
});
