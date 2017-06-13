@SmartSortMixin =
  data:
    sorted_phrases: []
    priority_list: []
    sortableOptions:
      axis: 'y'
  methods:
    sort: ->
      @loading = true
      setTimeout =>
          @sorted_phrases = []
          @sortWords(@list.phrases)
          # удаляем отметку sorted из всех фраз из предыдущего шага
          @list.phrases.map (phrase) -> delete phrase.sorted
          @collapseList()
          @list.phrases = @sorted_phrases
          @loading = false
        , 100

    # получить приоритет-список
    getPriorityList: (phrases, with_weights = false) ->
      # создание массива веса слов
      weights = {}
      phrases.forEach (phrase) =>
        phrase.phrase.toWords().forEach (word) =>
          weights[word] = 0 if weights[word] is undefined
          weights[word] += parseInt(phrase.frequency) or 1
      # создание и сортировка приоритетного списка
      priority_list = Object.keys(weights)
      priority_list.sort (a, b) =>
        difference = weights[b] - weights[a]
        return if difference isnt 0 then difference else (a > b)

      if with_weights
        list_with_weights = []
        priority_list.forEach (word) ->
          list_with_weights.push
            word: word
            weight: weights[word]
        list_with_weights
      else
        priority_list

    # сортировка слов внутри фраз
    sortWords: (phrases, level = 0)->
      priority_list = @getPriorityList(phrases)
      # чтобы не бежать по уже пройденным ранее в рекурсии словам
      # если не добавлять в массив слов, то можно будет пропустить (верхний todo)
      priority_list = priority_list.slice(level, priority_list.length) if level

      # бежим по ПС
      priority_list.forEach (word) =>
        filtered_phrases = phrases.filter (phrase) ->
          !phrase.sorted && $.inArray(word, phrase.phrase.toWords()) >= level
        filtered_phrases.forEach (phrase) ->
          words = phrase.phrase.toWords()
          words = _.without(words, word)
          words.splice(level, 0, word) # insert at index
          phrase.phrase = words.toPhrase()
          # фраза считается отсортированной, если последнее слово в ней = текущему
          phrase.sorted = true if words[words.length - 1] == word

        # console.log(filtered_phrases, word, level)

        # здесь запускается рекурсия
        @sortWords(filtered_phrases, level + 1) if filtered_phrases.length > 1


    # «схлопнуть» список
    collapseList: ->
      # 1. получить фразы без детей
      phrases_without_parent = []
      @list.phrases.forEach (phrase_1, index_1) =>
        has_children = false
        @list.phrases.forEach (phrase_2, index_2) =>
          return if (has_children || index_1 is index_2) # фраза не может являться родителем самой себе
          # у фразы_1 есть дети, если фраза_2 включает в себя все слова фразы_1 и у фразы_2 больше слов
          has_children = true if isParent(phrase_1, phrase_2)
        phrases_without_parent.push(phrase_1) if not has_children

      # 2. для кадждой фразы без детей находим ближайшего родителя

      # были ли схлопывания списоков? если не было, выходим из рекурсии
      list_changed = false

      if (phrases_without_parent.length)
        phrases_without_parent.forEach (phrase_without_parent) =>
          # находим всех родителей
          parents = @list.phrases.filter (phrase) -> isParent(phrase, phrase_without_parent)

          # определяем ближайшего среди родителей
          closest_parent =
            level: 9999
            frequency: -1
            phrase: null

          if parents.length
            parents.forEach (parent) ->
              level = _.difference(phrase_without_parent.phrase.toWords(), parent.phrase.toWords()).length
              frequency = parent.frequency or 1
              if (level < closest_parent.level || (level == closest_parent.level && closest_parent.frequency < frequency))
                closest_parent =
                  level: level
                  frequency: frequency
                  phrase: parent

          # console.log("«#{phrase_without_parent.phrase}» parents", parents, closest_parent)

          # если есть родитель, схлопываем (добавляем фразу без родителя внутрь)
          if closest_parent.phrase isnt null
            closest_parent.phrase.children = [] if closest_parent.phrase.children is undefined
            closest_parent.phrase.children.push(phrase_without_parent)

            # суммарный frequency
            closest_parent.phrase.total_frequency = (closest_parent.phrase.frequency or 1) if closest_parent.phrase.total_frequency is undefined
            closest_parent.phrase.total_frequency += (phrase_without_parent.frequency or 1)

            @list.phrases = @removePhrase(phrase_without_parent)
            list_changed = true

        # если фраз без детей не осталось, выходим из рекурсии
        if list_changed then @collapseList() else @expandList(@list.phrases)

    # «развернуть» отсортированный список
    expandList: (phrases) ->
      @sortPhrases(phrases)
      phrases.forEach (phrase, index) =>
        @sorted_phrases.push(phrase)
        if (phrase.children)
          @expandList(phrase.children, index)
          # @list.phrases = @list.phrases.concat(phrase.children)
          # @list.phrases.splice.apply(@list.phrases, [index, 0].concat(phrase.children))
          # console.log('inserting at index', index)
          delete phrase.children
          delete phrase.total_frequency

    # отсортировать фразы по «frequency»
    sortPhrases: (phrases)->
      phrases.sort (phrase_1, phrase_2) ->
        phrase_1_frequency = phrase_1.total_frequency or (phrase_1.frequency or 1)
        phrase_2_frequency = phrase_2.total_frequency or (phrase_2.frequency or 1)
        difference = phrase_2_frequency - phrase_1_frequency
        return if difference isnt 0 then difference else (phrase_1.phrase > phrase_2.phrase) # или по алфавиту

    # сортировка слов внутри фраз
    sortWordsManual: ->
      words = _.pluck(@priority_list, 'word')
      @list.phrases.forEach (phrase) =>
        indexes = []
        phrase.phrase.toWords().forEach (word) -> indexes.push(words.indexOf(word))
        phrase_words_sorted = indexes.sort().map (i) -> words[i]
        phrase.phrase = phrase_words_sorted.toPhrase()

    # ручная сортировка
    sortManualModal: ->
      @priority_list = @getPriorityList(@list.phrases, true)
      showModal 'smart-sort'

    sortManual: ->
      ids = $('.ui-sortable').sortable('toArray')
      new_list = []
      ids.forEach (id) =>
        index = id.replace(/\D/g, "")
        new_list.push(@priority_list[index])
      @priority_list = new_list

      @sortWordsManual()
      closeModal 'smart-sort'

      @loading = true
      setTimeout =>
        @collapseList()
        @list.phrases = @sorted_phrases
        @loading = false
      , 100
