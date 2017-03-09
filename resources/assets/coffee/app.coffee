$(document).ready ->
  app = new Vue
    el: '#app'
    data:
      addwords_error: false
      list:
        title: null
        phrases: []
      modal: {}
    methods:
      runModal: (action, title, placeholder = 'список слов или фраз', value = null) ->
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

      separateMinuses: (phrase, minus = []) ->
        minus = minus.split(' ') if not $.isArray(minus)
        words = []
        phrase.split(' ').forEach (value) ->
          if value[0] is '-' and value.trim().length
            minus.push(value)
          else
            words.push(value)
        [words.join(' '), minus.join(' ')]
