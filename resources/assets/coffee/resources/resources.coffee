angular.module('Wstat')
    .factory 'Phrase', ($resource) ->
        $resource apiPath('phrases'), {id: '@id'}, updatable()

    .factory 'List', ($resource) ->
        $resource apiPath('lists'), {id: '@id'}, updatable()

apiPath = (entity, additional = '') ->
    "api/#{entity}/" + (if additional then additional + '/' else '') + ":id"


updatable = ->
    update:
        method: 'PUT'
countable = ->
    count:
        method: 'GET'
