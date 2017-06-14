@SortMixin =
  data:
    sorted_phrases: []
    priority_list: []
    trump_words: []
    sortableOptions:
      axis: 'y'
  methods:
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

    # найти родителя
    findParent: (phrase_without_parent) ->
      # все родители
      parents = @list.phrases.filter (phrase) -> isParent(phrase, phrase_without_parent)
      # console.log("«#{phrase_without_parent.phrase}» parents are ", parents)
      if parents.length
        #
        # находим ближайших по уровню родителей
        #

        # сначала определяем минимальный уровень вложенности
        parents = _.sortBy parents, (parent) -> _.difference(phrase_without_parent.phrase.toWords(), parent.phrase.toWords()).length
        # минимальный уровень вложенности
        level = _.difference(phrase_without_parent.phrase.toWords(), parents[0].phrase.toWords()).length
        # оставляем только родителей с минимальным уровнем вложенности
        parents = parents.filter (parent) -> _.difference(phrase_without_parent.phrase.toWords(), parent.phrase.toWords()).length is level

        # если родителей больше 2х, применяем алгоритм выбора родителей
        if parents.length > 1
          # бежим по списку козырей
          trump_parents = []
          @trump_words.forEach (word) ->
            return if trump_parents.length
            trump_parents = parents.filter (parent) -> $.inArray(word, parent.phrase.toWords())

          # обрезаем родителей по козырным словам, если таковые были найдены
          parents = trump_parents if trump_parents.length
          # console.log('\t 1. ', parents)
          # если есть 2 и более родителей, на которых козыри не сработали,
          # то выбирается родитель с максимальной суммарной частотой уровня
          if parents.length > 1
            # находим суммарную частоту уровня родителей
            max_level_frequency = -1

            parents.forEach (parent) =>
              level_frequency = 0
              @list.phrases.forEach (phrase) =>
                level_frequency += (parseInt(phrase.frequency) or 1) if sameLevel(parent, phrase)
              parent.level_frequency = level_frequency
              max_level_frequency = level_frequency if level_frequency > max_level_frequency

            # оставляем только с максимальной частотой + удаляем атрибут level_frequency
            parents = parents.filter (parent) ->
              level_frequency = parent.level_frequency
              delete parent.level_frequency
              level_frequency is max_level_frequency

            # console.log('\t 2. ', parents)
            # алфавит. если ничего не сработало и по прежнему имеем 2
            # и более родителей, то выбираем родителя по алфавиту
            if parents.length > 1
              parents.sort (phrase_1, phrase_2) -> phrase_1.phrase > phrase_2.phrase
              # console.log('\t 3. ', parents)

      # возвращаем null, если не нашлось родителей ообще
      else return null
      # console.log("\t«#{phrase_without_parent.phrase}» parent is", parents[0].phrase)
      parents[0]


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
          # находим родителя
          parent = @findParent(phrase_without_parent)

          # если есть родитель, схлопываем (добавляем фразу без родителя внутрь)
          if parent isnt null
            parent.children = [] if parent.children is undefined
            parent.children.push(phrase_without_parent)

            # суммарный frequency
            parent.total_frequency = (parseInt(parent.frequency) or 1) if parent.total_frequency is undefined
            parent.total_frequency += parseInt(phrase_without_parent.frequency) or 1

            @list.phrases = @removePhrase(phrase_without_parent)
            list_changed = true

        # если фраз без детей не осталось, выходим из рекурсии
        if list_changed
          @collapseList()
        else
          @sortPhraseWords(@list.phrases)
          @expandList(@list.phrases)

    #
    #                           Метод сортировки слов внутри фразы
    #
    #   1.  берем фразу, соответствуем ей всех родителей, определенных в самом начале и выстраиваем
    #       слова в последовательности как они идут сначала у самого главного родителя,
    #       потом следующего родителя и т.д. по 1 слову
    #
    #   2.  если попадаются родители, разнящиеся на более чем 1 слово, то расстановка этих
    #       слов происходит сначала по принципу козырей, потом по алфавиту
    sortPhraseWords: (phrases) ->
        phrases.forEach (parent) =>
          if parent.children then parent.children.forEach (phrase) =>
            # оставшееся слова (если родительская фраза «репетитор москва»),
            # то для дитя «подготовка репетитор москва егэ» оставшееся слова
            # будут [подготовка, егэ] – их нужно будет поставить на последнее
            # место в соответствующем порядке
            words = _.difference(phrase.phrase.toWords(), parent.phrase.toWords())

            # если попадаются родители, разнящиеся на более чем 1 слово, то расстановка
            # этих слов происходит сначала по принципу козырей, потом по алфавиту
            if words.length > 1
              # отсортированные по «козырям»
              sorted_words = []
              @trump_words.forEach (word) -> sorted_words.push(word) if $.inArray(word, words)

              # по алфавиту оставшееся слова, которые не попали под козырные
              leftovers = words.filter (word) -> not $.inArray(word, sorted_words)
              leftovers.sort (word_1, word_2) -> word_1 > word_2

              words = sorted_words.concat(leftovers)

            # сначала родительская фраза, потом все остальное
            phrase.phrase = parent.phrase.toWords().concat(words).toPhrase()

            # сортируем так же детей
            @sortPhraseWords(phrase.children) if phrase.children

    # «развернуть» отсортированный список
    expandList: (phrases) ->
      @sortPhrases(phrases)
      phrases.forEach (phrase) =>
        @sorted_phrases.push(phrase)
        if (phrase.children)
          @expandList(phrase.children)
          delete phrase.children
          delete phrase.total_frequency

    # отсортировать фразы по «frequency»
    sortPhrases: (phrases)->
      phrases.sort (phrase_1, phrase_2) ->
        phrase_1_frequency = phrase_1.total_frequency or (parseInt(phrase_1.frequency) or 1)
        phrase_2_frequency = phrase_2.total_frequency or (parseInt(phrase_2.frequency) or 1)
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
    sortModal: ->
      @priority_list = @getPriorityList(@list.phrases, true)
      @trump_words = []
      showModal 'smart-sort'

    sort: ->
      # сортируем trump_words на основе drag&drop
      if @trump_words.length
        ids = $('.ui-sortable').sortable('toArray')
        trump_words = []
        ids.forEach (id) =>
          index = id.replace(/\D/g, "")
          trump_words.push(@trump_words[index])
        @trump_words = trump_words

      closeModal 'smart-sort'
      @loading = true

      setTimeout =>
          @sorted_phrases = []
          @collapseList()
          @list.phrases = @sorted_phrases
          @loading = false
        , 100