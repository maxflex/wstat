$(document).ready ->
  Vue.directive 'sortable',
    bind: (el, binding) -> sortable = $(el).sortable(binding.value)
  window.app = new Vue
    el: '#app'
    mixins: [TransformMixin, ExportMixin, SortMixin, HelpersMixin, AddFromWordstat, RemoveDuplicates]
    data:
      page: 'list'              # list | open
      saving: false
      addwords_error: false
      phrase_search: ''
      lists: null               # existing lists
      list:                     # current list
        title: null
        phrases: []
      new_list_phrases: []
      modal: {value: ''}
      modal_phrase: {frequency: null, phrase: '', minus: ''}
      find_phrase: null
      replace_phrase: null
      center_title: null
      frequencies: []
      loading: false
    created: ->
      @resourse = this.$resource('api/lists{/id}')
      @openList(DEBUG_LIST_ID) if ENV is 'local' and DEBUG_LIST_ID
      #                 #
      # PRIVATE METHODS #
      #                 #
      @_getFrequencies = (region_id, step = 0) =>
        phrases = @list.phrases.slice(step * 100, (step * 100) + 100)
        # для подсчета кол-ва процентов
        length = @list.phrases.length / 10 * 10 + 100
        @center_title = Math.round(step / length * 10000) + '%'
        this.$http.post 'api/getFrequencies',
          region_id: region_id
          phrases: _.map phrases, (phrase) ->
            [phrase.phrase, phrase.minus].join(' ')
        .then (response) =>
          @frequencies = @frequencies.concat(response.data)
          if phrases.length is 100
            @_getFrequencies(region_id, step + 1)
          else
            # завершено
            @list.phrases.forEach (phrase, index) =>
              phrase.frequency = @frequencies[index]
            @center_title = null
        , (response) ->
          notifyError(response.data)
          @center_title = null
    #                #
    # PUBLIC METHODS #
    #                #
    methods:
      runModal: (action, title, placeholder = 'список слов или фраз...', value = null) ->
        @modal = value: value, action: action, title: title, placeholder: placeholder
        showModal('main')

      addWords: ->
        new_phrases = []
        @addwords_error = false
        @modal.value.split('\n').forEach (line, index) =>
          return if @addwords_error # one error at a time
          # skip empty lines
          if line.trim().length
            # parse tabs
            parsed_line = line.split('\t')
            # error if more than N elements
            return @addWordsError(index, line, 'некорректрое форматирование') if parsed_line.length > 3
            [phrase, frequency, original] = parsed_line
            ### PHRASE ###
            # error if no original value
            return @addWordsError(index, line, 'отсутствует основная фраза') if not phrase
            [phrase, minus] = @separateMinuses(phrase)
            list_item = {phrase: phrase, minus: minus, original: phrase}
            ### FREQUENCY ###
            if frequency
              return @addWordsError(index, line, 'частота должна быть числом') if not $.isNumeric(frequency)
              list_item.frequency = parseInt(frequency)
            ### ORIGINAL ###
            list_item.original = original if original
            new_phrases.push(list_item)
        return if @addwords_error
        @list.phrases = @list.phrases.concat(new_phrases)
        @modal.value = ''
        closeModal()

      addWordsError: (index, line, message) ->
        @addwords_error = true
        notifyError("#{message}<br>строка #{index + 1}: <i>#{line}</i>")
        return false

      addMinuses: ->
        minuses = []
        @modal.value.split('\n').forEach (line) ->
          # skip empty lines
          if line.trim().length
            words = line.trim().split(' ')
            minuses = minuses.concat(words)
        minuses.forEach (word) =>
          word = "-#{word}" if word[0] isnt '-'
          @list.phrases.forEach (phrase) ->
            minus_words = if not phrase.minus then [] else phrase.minus.toWords()
            minus_words.push(word)
            phrase.minus = minus_words.toPhrase()
        @modal.value = ''
        closeModal()

      # разбить фразы на слова
      splitPhrasesToWords: (phrases = null) ->
        new_phrases = []
        (phrases or @list.phrases).forEach (list_item) ->
          list_item.phrase.split(' ').forEach (word) ->
            word = word.trim()
            if word.length
              item = _.extend _.clone(list_item), {phrase: word}
              delete item.id
              new_phrases.push item
        if phrases
          return new_phrases
        else
          @list.phrases = new_phrases

      replace: ->
        @list.phrases.forEach (phrase) => phrase.phrase = replaceWord(phrase.phrase, @find_phrase, @replace_phrase)
        @find_phrase = null
        @replace_phrase = null
        closeModal('replace')

      lowercase: ->
        @list.phrases.forEach (phrase) -> phrase.phrase = phrase.phrase.toLowerCase()

      # проставить частоты
      getFrequencies: (region_id)->
        @frequencies = []
        @_getFrequencies(region_id)

      # конфигурация минус-слов
      configureMinus: ->
        @removeMinuses()
        @list.phrases.forEach (phrase) =>
          words_list = phrase.phrase.toWords()
          @list.phrases.forEach (phrase2) =>
            # самого себя не проверяем
            if phrase.phrase isnt phrase2.phrase
              words_list2 = phrase2.phrase.toWords()
              # смотрим только если разница в длине в 1
              if words_list2.length is (words_list.length + 1)
                difference = _.difference(words_list2, words_list)
                # является родителем только если разница в 1 слово
                if difference.length is 1
                  phrase.minuses = [] if not phrase.hasOwnProperty('minuses')
                  phrase.minuses.push("-" + difference[0])
        @list.phrases.forEach (phrase) ->
          if phrase.hasOwnProperty('minuses')
            minus_list = if not phrase.minus then [] else phrase.minus.toWords()
            minus_list = minus_list.concat(phrase.minuses)
            phrase.minus = minus_list.toPhrase()
            delete phrase.minuses

      removeMinuses: ->
        @list.phrases.forEach (phrase) -> phrase.minus = ''

      separateMinuses: (phrase, minus = []) ->
        minus = minus.split(' ') if not $.isArray(minus)
        words = []
        phrase.split(' ').forEach (value) ->
          if value[0] is '-' and value.trim().length > 1
            minus.push(value)
          else
            words.push(value)
        [words.toPhrase(), minus.toPhrase()]

      convertToMinus: (phrase) ->
          minus = []
          phrase.toWords().forEach (value) ->
            if value[0] is '-' and value.length > 1
              minus.push value
            else
              minus.push '-' + value
          minus.join(' ').trim()

      removeFrequencies: ->
        @list.phrases.forEach (list_item) ->
          list_item.frequency = undefined
        app.$forceUpdate()

      removePhrase: (phrase) ->
        @list.phrases = _.without @list.phrases, phrase

      removeMinuses: ->
        @list.phrases.forEach (phrase) -> phrase.minus = ''

      removePluses: ->
        @list.phrases.forEach (list_item) ->
          #list_item.phrase = list_item.phrase.replace(exactMatch('\\+[\\wа-яА-Я]+'), ' ').trim()
          words = []
          list_item.phrase.split(' ').forEach (word) -> words.push(word) if word.length > 1 and word[0] != '+'
          list_item.phrase = words.join ' '
        @removeEmptyPhrases()

      removeEmptyPhrases: (phrases = null) ->
        new_phrases = _.filter (phrases or @list.phrases), (phrase) ->
          phrase.phrase.trim() isnt ''
        if phrases
          return new_phrases
        else
          @list.phrases = new_phrases

      clear: ->
        @list.phrases = []

      saveAs: ->
        @saving = true
        if @list.id
          @resourse.update({id: @list.id}, @list).then => @saving = false
        else
          @resourse.save(@list).then (response) =>
            console.log(response)
            @saving = false
            @list.id = response.data.id
        closeModal('save-as')

      save: ->
        @saving = true
        @resourse.update({id: @list.id}, @list).then => @saving = false

      deleteWordsInsidePhrase: ->
        @modal.value.split('\n').forEach (textarea_phrase) =>
          @list.phrases.forEach (phrase) =>
            if phrase.phrase.match exactMatch textarea_phrase.trim()
              phrase.phrase = removeDoubleSpaces(phrase.phrase.replace(exactMatch(textarea_phrase.trim()), ' ')).trim()
        @removeEmptyPhrases()
        @modal.value = ''
        closeModal()

      deletePhrasesWithWords: ->
        @modal.value.split('\n').forEach (textarea_phrase) =>
            @list.phrases = _.filter @list.phrases, (phrase) =>
                not phrase.phrase.match exactMatch textarea_phrase
        @modal.value = ''
        closeModal()

      openList: (list_id) ->
        @saving = true
        @resourse.get({id: list_id}).then (response) =>
          @list = response.data
          @saving = false
          @page = 'list'

      removeList: (list) ->
        @lists = removeById(@lists, list.id)
        @resourse.delete({id: list.id})

      startEditingPhrase: (phrase, index) ->
        @modal_phrase = _.clone phrase
        _.extendOwn @modal_phrase, {index: index}
        showModal 'edit-phrase'
        rebindMasks()

      editPhrase: ->
        [@modal_phrase.phrase, @modal_phrase.minus] = @separateMinuses(@modal_phrase.phrase, @convertToMinus(@modal_phrase.minus))
        _.extendOwn @list.phrases[@modal_phrase.index], _.clone(@modal_phrase)
        app.$forceUpdate()
        closeModal 'edit-phrase'

      addToAll: ->
        @list.phrases.forEach (phrase) =>
          phrase.phrase += ' ' + @modal.value
        @modal.value = ''
        closeModal('add-to-all')

      mixer: ->
        new_phrases = []
        @list.phrases.forEach (phrase) =>
          @modal.value.split('\n').forEach (line) =>
            new_phrase = _.clone(phrase)
            new_phrase.phrase += ' ' + line
            new_phrases.push(new_phrase)
        @list.phrases = new_phrases
        @modal.value = ''
        closeModal()

    watch:
      page: (newPage) ->
        if newPage is 'open' and @lists is null
          @saving = true
          @resourse.query().then (response) =>
            @lists = response.data
            @saving = false

    computed:
      filtered_phrases: ->
        return [] unless @list?.phrases.length
        @list.phrases.filter (list_item) =>
          list_item.phrase.indexOf(@phrase_search) isnt -1
