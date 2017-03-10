$(document).ready ->
  app = new Vue
    el: '#app'
    mixins: [TransformMixin, ExportMixin]
    data:
      addwords_error: false
      list:
        title: null
        phrases: [{phrase: 'phrase one test'}, {phrase: 'phrase two test'}]
        # phrases: []
      modal: {}
      find_phrase: null
      replace_phrase: null
      center_title: null
      frequencies: []
    created: ->
      #                 #
      # PRIVATE METHODS #
      #                 #
      @_getFrequencies = (step = 0) =>
        phrases = @list.phrases.slice(step * 100, (step * 100) + 100)
        # для подсчета кол-ва процентов
        length = @list.phrases.length / 10 * 10 + 100
        @center_title = Math.round(step / length * 10000) + '%'
        this.$http.post 'api/getFrequencies',
          phrases: _.pluck(phrases, 'phrase')
        .then (response) =>
          @frequencies = @frequencies.concat(response.data)
          if phrases.length is 100
            @_getFrequencies(step + 1)
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
        closeModal()

      addWordsError: (index, line, message) ->
        @addwords_error = true
        notifyError("#{message}<br>строка #{index + 1}: <i>#{line}</i>")
        return false

      # удалить дубликаты
      uniq: (phrases = null) ->
        new_phrases = _.uniq((phrases or @list.phrases), 'phrase')
        if phrases
          return new_phrases
        else
          @list.phrases = new_phrases

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
      getFrequencies: ->
        @frequencies = []
        @_getFrequencies()

      # конфигурация минус-слов
      configureMinus: ->
        @removeMinuses()
        @list.phrases.forEach (phrase) =>
          words_list = phrase.phrase.toWords()
          @list.phrases.forEach (phrase2) =>
            # самого себя не проверяем
            if phrase.phrase isnt phrase2.phrase
              words_list2 = phrase2.phrase.toWords()
              flag = true
              words_list.forEach (word) ->
                if word in words_list2
                  words_list2[words_list2.indexOf(word)] = null
                else
                  flag = false
              if flag and words_list2.length is (words_list.length + 1)
                phrase.minuses = [] if not phrase.hasOwnProperty('minuses')
                words_list2.forEach (word) ->
                  phrase.minuses.push("-#{word}") if word
        @list.phrases.forEach (phrase) ->
          if phrase.hasOwnProperty('minuses') and phrase.minuses.length
            minus_list = if not phrase.minus then [] else phrase.minus.toWords()
            minus_list = minus_list.concat(phrase.minuses)
            phrase.minus = minus_list.toPhrase()
            phrase.minuses = []




      removeMinuses: ->
        @list.phrases.forEach (phrase) -> phrase.minus = ''

      separateMinuses: (phrase, minus = []) ->
        minus = minus.split(' ') if not $.isArray(minus)
        words = []
        phrase.split(' ').forEach (value) ->
          if value[0] is '-' and value.trim().length
            minus.push(value)
          else
            words.push(value)
        [words.join(' '), minus.join(' ')]
