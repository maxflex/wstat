@TransformMixin =
  data:
    selected_rows: []
    transform_items: {}
    transform_phrases: {}
  methods:
    transformModal: ->
      @transform_phrases = _.clone(@list.phrases)
      @transform_phrases = @splitPhrasesToWords(@transform_phrases)
      @transform_phrases = @uniq(@transform_phrases)
      @transform_phrases = _.sortBy(@transform_phrases, 'phrase')
      showModal('transform')

    selectRow: (index) ->
      if @selected_rows.indexOf(index) is -1
        @selected_rows.push(index)
      else
        @selected_rows.splice(@selected_rows.indexOf(index), 1)

    transformAdd: (index) ->
      # скрываем добавленные и добавляем к добавленному
      @transform_phrases[index].words = [] if @transform_phrases[index].words is undefined
      @selected_rows.forEach (position) =>
        @transform_phrases[position].added = true
        @transform_phrases[index].words.push(@transform_phrases[position].phrase)
      # добавляем к массиву индексов
      @transform_items[index] = [] if @transform_items[index] is undefined
      @transform_items[index] = @transform_items[index].concat(@selected_rows)
      @selected_rows = []

    transformRemove: (index) ->
      @transform_items[index].forEach (position) =>
        @transform_phrases[position].added = false
        @transform_phrases[index].words = undefined
      delete @transform_items[index]
      app.$forceUpdate()

    transform: ->
      @list.phrases.forEach (phrase) =>
        $.each @transform_items, (main_index, item_indexes) =>
          item_indexes.forEach (item_index) =>
            phrase.phrase = replaceWord(phrase.phrase, @transform_phrases[item_index].phrase, @transform_phrases[main_index].phrase)
      @transform_phrases = {}
      @transform_items = {}
      @selected_rows = []
      closeModal('transform')
