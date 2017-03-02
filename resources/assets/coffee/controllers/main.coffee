angular
    .module 'Wstat'
    .controller 'MainCtrl', ($scope, $rootScope, $timeout, ExportService) ->
        $scope.ExportService = ExportService
        ExportService.init({list: $rootScope.list})

        # tab listener on textarea
        $scope.$on '$viewContentLoaded', ->
            $("#addwords").off('keydown').keydown (e) ->
                if e.keyCode is 9
                    start = this.selectionStart
                    end = this.selectionEnd
                    $this = $(this)
                    value = $this.val()
                    $this.val(value.substring(0, start) + "\t" + value.substring(end))
                    this.selectionStart = this.selectionEnd = start + 1
                    e.preventDefault()

        $rootScope.title = $rootScope.list.title

        $scope.addWords = ->
            $("#addwords").removeClass('has-error')
            new_phrases = []
            $scope.addwords.split('\n').forEach (line) ->
                # skip empty lines
                if line.trim().length
                    list = line.split('\t')
                    list_item = {phrase: list[0].trim()}
                    # if has tabs
                    if list.length > 1
                        frequency = list[1]
                        # if double tab or not number after tab
                        if not $.isNumeric(frequency)
                            $("#addwords").addClass('has-error')
                            $scope.list = []
                            return
                        else
                            list_item.frequency = parseInt(frequency)
                    new_phrases.push(list_item)
            $scope.addwords = null
            $rootScope.list.phrases = $rootScope.list.phrases.concat(new_phrases)
            closeModal('addwords')

        # разбить фразы на слова
        $scope.splitPhrasesToWords = ->
            new_phrases = []
            $rootScope.list.phrases.forEach (list_item) ->
                list_item.phrase.split(' ').forEach (word) ->
                    word = word.trim()
                    if word.length then new_phrases.push
                        phrase: word
                        frequency: list_item.frequency
            $rootScope.list.phrases = new_phrases

        # удалить дубликаты
        $scope.uniq = ->
            $rootScope.list.phrases = _.uniq($rootScope.list.phrases, 'phrase')

        $scope.lowercase = ->
            $rootScope.list.phrases.forEach (list_item) ->
                list_item.phrase = list_item.phrase.toLowerCase()

        $scope.removeFrequencies = ->
            $rootScope.list.phrases.forEach (list_item) ->
                list_item.frequency = undefined

        $scope.removeStartingWith = (sign) ->
            $rootScope.list.phrases.forEach (list_item) ->
                words = []
                list_item.phrase.split(' ').forEach (word) ->
                    words.push(word) if word.length and word[0] != sign
                list_item.phrase = words.join(' ')

        angular.element(document).ready ->
            console.log $scope.title
