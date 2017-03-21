@TransformMixin =
  data:
    drag:
      over: null
    transform_items: {}
    transform_phrases: {}
  methods:
    transformModal: ->
      @transform_phrases = _.clone(@list.phrases)
      @transform_phrases = @splitPhrasesToWords(@transform_phrases)
      @transform_phrases = @uniq(@transform_phrases)
      @transform_phrases = _.sortBy(@transform_phrases, 'phrase')
      showModal('transform')

    transformRemove: (word, phrase, phrase_index) ->
      index = phrase.words.indexOf(word)
      @transform_phrases[word.index].added = false
      phrase.words.splice(index, 1)
      @transform_items[phrase_index].splice(@transform_items[phrase_index].indexOf(word.index), 1)
      app.$forceUpdate()

    transform: ->
      @list.phrases.forEach (phrase) =>
        $.each @transform_items, (main_index, item_indexes) =>
          item_indexes.forEach (item_index) =>
            phrase.phrase = replaceWord(phrase.phrase, @transform_phrases[item_index].phrase, @transform_phrases[main_index].phrase)
      @transform_phrases = {}
      @transform_items = {}
      closeModal('transform')

    drop: (index) ->
      return if @drag.start is index
      # скрываем добавленное
      dragged = @transform_phrases[@drag.start]
      dragged.added = true

      # добавляем к добавленному
      dropped = @transform_phrases[index]
      dropped.words = [] if dropped.words is undefined
      dropped.words.push
        index: @drag.start
        phrase: @transform_phrases[@drag.start].phrase
      # если в dragged уже был стэк
      dropped.words = dropped.words.concat(dragged.words) if dragged.words

      # добавляем к массиву индексов
      @transform_items[index] = [] if @transform_items[index] is undefined
      @transform_items[index].push(@drag.start)
      
      # если в dragged уже был стэк
      if dragged.words
        dragged.words.forEach (word) =>
          @transform_items[index].push(word.index)
        dragged.words = []

    dragend: ->
      @drag.start = null
      @drag.over = null
      app.$forceUpdate()
