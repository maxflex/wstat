angular.module('Wstat')
    .factory 'Phrase', ($resource) ->
        $resource apiPath('phrases'), {id: '@id'},
            update:
                method: 'PUT'
            addMinus: (words) ->
                words = words.if not $.isArray(words)
                this.minus = if this.minus then this.minus.split(' ') else []
                this.minus

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
