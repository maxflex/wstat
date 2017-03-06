angular
    .module 'Wstat'
    .controller 'MainCtrl', ($scope, $rootScope, $http) ->
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

        $scope.replacePhrases = ->
            $scope.modal.value.split('\n').forEach (line) ->
                if line.trim().length
                    [key, replacement] = line.split('\t')
                    key = key.trim()
                    $scope.list.phrases.forEach (phrase) ->
                        phrase.phrase = replaceWord(phrase.phrase, key, replacement)
            closeModal()

        $scope.addWords = ->
            $("#main-modal").removeClass('has-error')
            new_phrases = []
            error = false
            $scope.modal.value.split('\n').forEach (line) ->
                # skip empty lines
                if line.trim().length
                    list = line.split('\t')
                    list_item = {phrase: list[0].trim(), original: list[0].trim()}
                    # if has tabs
                    if list.length > 1
                        frequency = list[1]
                        # if double tab or not number after tab
                        if not $.isNumeric(frequency)
                            $("#main-modal").addClass('has-error')
                            $scope.list = []
                            error = true
                            return
                        else
                            list_item.frequency = parseInt(frequency)

                        list_item.original = list[2].trim() if list[2]

                    new_phrases.push(list_item)
            return if error
            $rootScope.list.phrases = $rootScope.list.phrases.concat(new_phrases)
            closeModal()

        # удалить слова внутри фразы
        $scope.deleteWordsInsidePhrase = ->
            $scope.modal.value.split('\n').forEach (textarea_phrase) ->
                $rootScope.list.phrases.forEach (phrase) ->
                    if phrase.phrase.indexOf(textarea_phrase) isnt -1
                        phrase.phrase = removeDoubleSpaces(phrase.phrase.replace(textarea_phrase, ''))
            $rootScope.removeEmptyWords()
            closeModal()

        # удалить слова, содержащие фразы
        $scope.deletePhrasesWithWords = ->
            $scope.modal.value.split('\n').forEach (textarea_phrase) ->
                $rootScope.list.phrases = _.filter $rootScope.list.phrases, (phrase) ->
                    phrase.phrase.indexOf(textarea_phrase) is -1
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

        $scope.removeStartingWith = (sign) ->
            $rootScope.list.phrases.forEach (list_item, index) ->
                words = []
                list_item.phrase.split(' ').forEach (word) -> words.push(word) if word.length and word[0] != sign
                list_item.phrase = words.join(' ').trim()
            $rootScope.removeEmptyWords()

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

        $scope.saveAs = ->
            $rootScope.loading = true
            $rootScope.title = $rootScope.list.title
            $rootScope.list.$save().then -> $rootScope.loading = false
            closeModal('save-as')

        $scope.save = ->
            $rootScope.loading = true
            $rootScope.list.$update().then -> $rootScope.loading = false

        $scope.getFrequencies = ->
            $rootScope.loading = true
            $http.post 'api/getFrequencies',
                phrases: $rootScope.list.phrases
            .then (response) ->
                $rootScope.list.phrases.forEach (phrase, index) ->
                    console.log(response.data[index])
                    phrase.frequency = response.data[index]
                $rootScope.loading = false
            , (response) ->
                $rootScope.loading = false
                notifyError(response.data)

        $scope.transform = ->
            $scope.tmp_phrases = angular.copy($rootScope.list.phrases)
            $scope.tmp_phrases = $scope.splitPhrasesToWords($scope.tmp_phrases)
            $scope.tmp_phrases = $scope.uniq($scope.tmp_phrases)
            $scope.tmp_phrases = _.sortBy($scope.tmp_phrases, 'phrase')
            showModal('transform')

        $scope.selectRow = (index) ->
            if $scope.selected_row is undefined
                $scope.selected_row = index
            else
                # если выбираем заголовок
                if $scope.selected_row is index
                    $scope.selected_row = undefined
                else
                    $scope.selected_rows = [] if $scope.selected_rows is undefined
                    if $scope.selected_rows.indexOf(index) is -1
                        $scope.selected_rows.push(index)
                    else
                        $scope.selected_rows.splice($scope.selected_rows.indexOf(index), 1)

        $scope.addData = ->
            $scope.transform_items = {} if $scope.transform_items is undefined
            $scope.transform_items[$scope.selected_row] = $scope.selected_rows
            $scope.selected_row = undefined
            $scope.selected_rows = undefined
            console.log($scope.transform_items)

        $scope.transformGo = ->
            $rootScope.list.phrases.forEach (phrase) ->
                $.each $scope.transform_items, (main_index, item_indexes) ->
                    item_indexes.forEach (item_index) ->
                        phrase.phrase = replaceWord(phrase.phrase, scope.tmp_phrases[item_index].phrase, $scope.tmp_phrases[main_index].phrase)
            $scope.cancel()
            closeModal('transform')

        $scope.cancel = ->
            $scope.selected_row = undefined
            $scope.selected_rows = undefined
            $scope.transform_items = undefined


        angular.element(document).ready ->
            console.log $scope.title

        $scope.runModal = (action, title, placeholder = 'список слов или фраз') ->
            _.extend $scope.modal = {}, value: null, action: action, title: title, placeholder: placeholder
            showModal 'main'
