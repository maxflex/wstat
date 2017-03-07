angular
    .module 'Wstat'
    .controller 'MainCtrl', ($scope, $rootScope, $http, TransformService) ->
        bindArguments($scope, arguments)

        # tab listener on textarea
        $scope.$on '$viewContentLoaded', ->
            $("#modal-value").off('keydown').keydown (e) ->
                if e.keyCode is 9
                    start = this.selectionStart
                    end = this.selectionEnd
                    $this = $(this)
                    value = $this.val()
                    $this.val(value.substring(0, start) + "\t" + value.substring(end))
                    this.selectionStart = this.selectionEnd = start + 1
                    e.preventDefault()

        $scope.replace = ->
            $rootScope.list.phrases.forEach (phrase) ->
                phrase.phrase = replaceWord(phrase.phrase, $scope.find_phrase, $scope.replace_phrase)
            $scope.find_phrase = undefined
            $scope.replace_phrase = undefined
            closeModal('replace')

        $scope.endEditing = ->
            edited_phrase = parsePhrases()
            if edited_phrase.length
                phrase_index = _.findIndex $scope.list.phrases, $scope.editing_phrase
                $scope.list.phrases[phrase_index] = edited_phrase[0]
            closeModal()

        $scope.editPhrase = (phrase) ->
            $scope.editing_phrase = phrase
            $scope.runModal $scope.endEditing, 'cохранить', 'изменение записи', buildPhraseValue phrase

        $scope.addWords = ->
            new_phrases = parsePhrases()
            $rootScope.list.phrases = $rootScope.list.phrases.concat(new_phrases)
            closeModal()

        parsePhrases = ->
            new_phrases = []
            if $scope.modal.value then $scope.modal.value.split('\n').forEach (line) ->
                # skip empty lines
                if line.trim().length
                    list = line.split('\t').map (str) -> return str.trim()
                    [phrase, minus] = separateMinuses(list[0])
                    if phrase
                        list_item = {phrase: phrase, minus: minus, original: list[0]}
                        # if has tabs
                        if list.length > 1
                            frequency = list[1]
                            # if double tab or not number after tab
                            if $.isNumeric(frequency)
                                list_item.frequency = parseInt(frequency)
                            list_item.original = list[2].trim() if list[2]
                        new_phrases.push(list_item)
            new_phrases

        # удалить слова внутри фразы
        $scope.deleteWordsInsidePhrase = ->
            $scope.modal.value.split('\n').forEach (textarea_phrase) ->
                $rootScope.list.phrases.forEach (phrase) ->
                    if phrase.phrase.match exactMatch(textarea_phrase)
                        phrase.phrase = removeDoubleSpaces(phrase.phrase.replace(exactMatch(textarea_phrase), ' ')).trim()
            $scope.removeEmptyWords()
            closeModal()

        # удалить слова, содержащие фразы
        $scope.deletePhrasesWithWords = ->
            $scope.modal.value.split('\n').forEach (textarea_phrase) ->
                $rootScope.list.phrases = _.filter $rootScope.list.phrases, (phrase) ->
                    not phrase.phrase.match exactMatch(textarea_phrase)
            closeModal()

        # разбить фразы на слова
        $scope.splitPhrasesToWords = (phrases = null) ->
            new_phrases = []
            (phrases or $rootScope.list.phrases).forEach (list_item) ->
                list_item.phrase.split(' ').forEach (word) ->
                    word = word.trim()
                    if word.length
                        item = _.extend _.clone(list_item), {phrase: word}
                        delete item.id
                        new_phrases.push item
            if phrases
                return new_phrases
            else
                $rootScope.list.phrases = new_phrases

        # удалить дубликаты
        $scope.uniq = (phrases = null) ->
            new_phrases = _.uniq((phrases or $rootScope.list.phrases), 'phrase')
            if phrases
                return new_phrases
            else
                $rootScope.list.phrases = new_phrases

        $scope.lowercase = ->
            $rootScope.list.phrases.forEach (list_item) ->
                list_item.phrase = list_item.phrase.toLowerCase()

        $scope.removeFrequencies = ->
            $rootScope.list.phrases.forEach (list_item) ->
                list_item.frequency = undefined

        $scope.removeMinuses = ->
            $rootScope.list.phrases.forEach (phrase) -> phrase.minus = ''

        $scope.removeStartingWith = (sign, phrases = null) ->
            (phrases or $rootScope.list.phrases).forEach (list_item, index) ->
                words = []
                list_item.phrase.split(' ').forEach (word) -> words.push(word) if word.length and word[0] != sign
                list_item.phrase = words.join(' ').trim()
            $scope.removeEmptyWords(phrases)

        # удалить пустые слова из списка
        $scope.removeEmptyWords = (phrases = null)->
            new_phrases = _.filter (phrases or $rootScope.list.phrases), (phrase) ->
                phrase.phrase.trim() isnt ''
            if phrases
                return new_phrases
            else
                $rootScope.list.phrases = new_phrases

        $scope.removePhrase = (phrase) ->
            $rootScope.list.phrases = _.without $rootScope.list.phrases, phrase

        # конфигурация минус-слов
        $scope.configureMinus = ->
            $scope.removeStartingWith('-')
            $rootScope.list.phrases.forEach (phrase) ->
                words_list = phrase.phrase.split(' ')
                $rootScope.list.phrases.forEach (phrase2) ->
                    # самого себя не проверяем
                    if phrase.phrase isnt phrase2.phrase
                        words_list2 = phrase2.phrase.split(' ')
                        flag = true
                        words_list.forEach (word) ->
                            if word in words_list2
                                words_list2[words_list2.indexOf(word)] = null
                            else
                                flag = false
                        if flag and words_list2.length is (words_list.length + 1)
                            phrase.minus = [] if not phrase.hasOwnProperty('minus')
                            words_list2.forEach (word) ->
                                phrase.minus.push("-#{word}") if word
            $rootScope.list.phrases.forEach (phrase) ->
                if phrase.hasOwnProperty('minus') and phrase.minus.length
                    words_list = phrase.phrase.split(' ')
                    words_list = words_list.concat(phrase.minus)
                    phrase.phrase = words_list.join(' ')
                    phrase.minus = []

        $scope.clear = ->
            $rootScope.list.phrases = []

        $scope.saveAs = ->
            $rootScope.loading = true
            $rootScope.route.title = $rootScope.list.title
            if $rootScope.list.id
                $rootScope.list.$update().then -> $rootScope.loading = false
            else
                $rootScope.list.$save().then -> $rootScope.loading = false
            closeModal('save-as')

        $scope.save = ->
            $rootScope.loading = true
            $rootScope.list.$update().then -> $rootScope.loading = false

        # проставить частоты
        $scope.getFrequencies = ->
            $scope.frequencies = []
            getFrequencies()

        getFrequencies = (step = 0) ->
            phrases = $rootScope.list.phrases.slice(step * 100, (step * 100) + 100)

            # для подсчета кол-ва процентов
            length = $rootScope.list.phrases.length / 10 * 10 + 100
            $rootScope.center_title = Math.round(step / length * 10000) + '%'

            $http.post 'api/getFrequencies',
                phrases: _.pluck(phrases, 'phrase')
            .then (response) ->
                $scope.frequencies = $scope.frequencies.concat(response.data)
                if phrases.length is 100
                    # console.log("(#{step} / #{length} * 10000)")
                    getFrequencies(step + 1)
                else
                    # завершено
                    $rootScope.list.phrases.forEach (phrase, index) ->
                        phrase.frequency = $scope.frequencies[index]
                    $rootScope.center_title = undefined
            , (response) ->
                notifyError(response.data)

        $scope.transform = ->
            TransformService.phrases = angular.copy($rootScope.list.phrases)
            TransformService.phrases = $scope.splitPhrasesToWords(TransformService.phrases)
            TransformService.phrases = $scope.uniq(TransformService.phrases)
            TransformService.phrases = _.sortBy(TransformService.phrases, 'phrase')
            TransformService.phrases = $scope.removeStartingWith('-', TransformService.phrases)
            showModal('transform')

        angular.element(document).ready ->
            console.log $scope.title

        $scope.onEnter = (func, event) ->
            func() if event.keyCode is 13

        $scope.runModal = (action, title, placeholder = 'список слов или фраз', value = null) ->
            $scope.modal = value: value, action: action, title: title, placeholder: placeholder
            showModal 'main'

        $scope.filterItems = (value) ->
            value.phrase.match $scope.phrase_search

        separateMinuses = (phrase) ->
            minus = []
            words = []
            phrase.split(' ').forEach (value) ->
                if value[0] is '-' and value.length
                    minus.push(value)
                else
                    words.push(value)
            [words.join(' '), minus.join(' ')]

        buildPhraseValue = (phrase) ->
            result = ''
            result += phrase.phrase
            result += ' -' + phrase.minuses.join(' -') if phrase.minuses.length
            result += '\t' + phrase.frequency if phrase.frequency
            result
