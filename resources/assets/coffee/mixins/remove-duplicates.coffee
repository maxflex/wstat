@RemoveDuplicates =
  methods:
    # удалить дубликаты DEPRICATED?
    uniq: (phrases = null) ->
      new_phrases = _.uniq((phrases or @list.phrases), 'phrase')
      if phrases
        return new_phrases
      else
        @list.phrases = new_phrases

    removeDuplicates: ->
      phrases = _.clone(@list.phrases)
      phrases = _.chain(phrases)
        .sortBy('frequency')
        .sortBy('phrase')
        .value()

      i = 0
      phrases_sorted = []
      while i < phrases.length - 1
        try
          frequency_sum = phrases[i].frequency
          while phrases[i].phrase is phrases[i + 1].phrase
            i++
            frequency_sum += phrases[i].frequency
          phrases[i].frequency = frequency_sum
          phrases_sorted.push(phrases[i])
          i++
        catch
          break
      phrases_sorted.push(phrases[phrases.length - 1])

      @list.phrases = _.sortBy(phrases_sorted, 'id')
