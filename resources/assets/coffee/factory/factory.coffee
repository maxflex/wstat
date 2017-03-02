angular.module('Wstat')
    .value 'Published', [
        {id:0, title: 'не опубликовано'},
        {id:1, title: 'опубликовано'},
    ]
    .value 'UpDown', [
        {id: 1, title: 'вверху'},
        {id: 2, title: 'внизу'},
    ]
