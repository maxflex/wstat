@SortMixin =
  data:
    sorted_phrases: []
    priority_list: []
    trump_words: []
    sortableOptions:
      axis: 'y'
  methods:
    # получить приоритет-список
    getPriorityList: (phrases) ->
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

      list_with_weights = []
      priority_list.forEach (word) ->
        list_with_weights.push
          word: word
          weight: weights[word]
      list_with_weights

    #
    # находим ближайших по уровню родителей
    #
    closestParents: (parents, phrase_without_parent) ->
      # сначала определяем минимальный уровень вложенности
      parents = _.sortBy parents, (parent) -> _.difference(phrase_without_parent.phrase.toWords(), parent.phrase.toWords()).length
      # минимальный уровень вложенности
      level = _.difference(phrase_without_parent.phrase.toWords(), parents[0].phrase.toWords()).length
      # оставляем только родителей с минимальным уровнем вложенности
      parents.filter (parent) -> _.difference(phrase_without_parent.phrase.toWords(), parent.phrase.toWords()).length is level


    # найти родителя
    findParent: (phrase_without_parent) ->
      # все родители
      parents = @list.phrases.filter (phrase) -> isParent(phrase, phrase_without_parent)
      # console.log("«#{phrase_without_parent.phrase}» parents are ", parents)
      if parents.length
        #
        # отсеиваем родителей по козырным словами и уровню
        #
        trump_parents = []
        highest_level_found = false # не надо отталкиваться от самого верхнего уровня, если он уже найден
        
        @trump_words.forEach (word) =>
          trump_parents = parents.filter (parent) -> $.inArray(word, parent.phrase.toWords()) isnt -1
          # если фразы с козырным словом были найдены, оставляем только самый верхний уровень фраз
          if (trump_parents.length > 1 && not highest_level_found)
            trump_parents = @closestParents(trump_parents, phrase_without_parent)
            highest_level_found = true

          if trump_parents.length
            # обрезаем родителей по козырным словам, если таковые были найдены
            parents = trump_parents

        if parents.length > 1
          # находим ближайших по уровню родителей
          parents = @closestParents(parents, phrase_without_parent) if not highest_level_found

          # если родителей больше 2х, применяем алгоритм выбора родителей
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
          # console.log("«#{phrase_without_parent.phrase}» parent", parent) if phrase_without_parent.phrase is 'репетитор английский язык'

          # если есть родитель, схлопываем (добавляем фразу без родителя внутрь)
          if parent isnt null
            parent.children = [] if parent.children is undefined
            parent.children.push(phrase_without_parent)

            # суммарный frequency
            parent.total_frequency = (parseInt(parent.frequency) or 1) if parent.total_frequency is undefined

            # добавляем frequency всех детей
            if phrase_without_parent.children
              parent.total_frequency += parseInt(phrase_without_parent.total_frequency)
            else
              parent.total_frequency += parseInt(phrase_without_parent.frequency) or 1

            @list.phrases = @removePhrase(phrase_without_parent)
            list_changed = true

        # если фраз без детей не осталось, выходим из рекурсии
        if list_changed
          @collapseList()
        else
          window.testy = JSON.parse(JSON.stringify(@list.phrases))[0]
          @sortPhraseWords(@list.phrases)
          @sortPhrases(@list.phrases)
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
        if parent.children
          parent.children.forEach (phrase) =>
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
              @trump_words.forEach (word) -> sorted_words.push(word) if $.inArray(word, words) isnt -1

              # по алфавиту оставшееся слова, которые не попали под козырные
              leftovers = words.filter (word) -> $.inArray(word, sorted_words) is -1
              leftovers.sort (word_1, word_2) -> word_1 > word_2

              words = sorted_words.concat(leftovers)

            # сначала родительская фраза, потом все остальное
            # console.log("«#{phrase.phrase}»", parent.phrase.toWords(), words)
            phrase.phrase = parent.phrase.toWords().concat(words).toPhrase()

          # сортируем так же детей
          @sortPhraseWords(parent.children)


    # «развернуть» отсортированный список
    expandList: (phrases) ->
      phrases.forEach (phrase) =>
        @sorted_phrases.push(phrase)
        if (phrase.children)
          @expandList(phrase.children)
          delete phrase.children
          delete phrase.total_frequency

    # отсортировать фразы по «frequency»
    sortPhrases: (phrases) ->
      phrases.sort (phrase_1, phrase_2) ->
        phrase_1_frequency = parseInt(phrase_1.total_frequency) or (parseInt(phrase_1.frequency) or 1)
        phrase_2_frequency = parseInt(phrase_2.total_frequency) or (parseInt(phrase_2.frequency) or 1)
        # console.log(phrase_1, phrase_2, phrase_1_frequency, phrase_2_frequency) if (phrase_1.phrase is 'репетитор язык русский 11' || phrase_2.phrase is 'репетитор язык русский 11')
        difference = phrase_2_frequency - phrase_1_frequency
        return if difference isnt 0 then difference else (phrase_1.phrase > phrase_2.phrase) # или по алфавиту

      phrases.forEach (phrase) => @sortPhrases(phrase.children) if phrase.children

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