<?php
URL::forceSchema('https');

Route::group(['namespace' => 'Api', 'as' => 'api.'], function () {
    # Variables
    Route::post('variables/sync', 'VariablesController@sync');
    Route::resource('variables', 'VariablesController');

    # Pages
    Route::post('pages/checkExistance/{id?}', 'PagesController@checkExistance');
    Route::resource('pages', 'PagesController');

    # Translit
    Route::post('translit/to-url', 'TranslitController@toUrl');

    # Tags
    Route::get('tags/autocomplete', 'TagsController@autocomplete');
    Route::resource('tags', 'TagsController');
});
