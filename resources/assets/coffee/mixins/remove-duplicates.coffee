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
          i++ while phrases[i].phrase is phrases[i + 1].phrase
          phrases_sorted.push(phrases[i])
          i++
        catch
          break
      phrases_sorted.push(phrases[phrases.length - 1])

      @list.phrases = _.sortBy(phrases_sorted, 'id')
