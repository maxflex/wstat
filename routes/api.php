<?php
URL::forceSchema('https');

Route::group(['namespace' => 'Api', 'as' => 'api.'], function () {
    Route::resource('lists', 'ListsController');
    Route::post('getFrequencies', 'DirectController@getFrequencies');
    Route::post('addFromWordstat', 'DirectController@addFromWordstat');
    // Route::controller('functions', 'FunctionsController');
});
