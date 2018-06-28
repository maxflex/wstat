@AddFromWordstat =
  data:
    add_from_wordstat_keyphrase: null
  methods:
    addFromWordstatModal: ->
      @add_from_wordstat_keyphrase = null
      showModal 'add-from-wordstat'

    addFromWordstat: ->
      return if not @add_from_wordstat_keyphrase
      @saving = true
      this.$http.post 'api/addFromWordstat',
        keyphrase: @add_from_wordstat_keyphrase
      .then (response) =>
        response.data.forEach (d) =>
          @list.phrases.push
            phrase: d.phrase
            original: d.phrase
            frequency: d.number.replace(/\s/g, '')
        notifySuccess("<b>" + response.data.length + "</b> добавлено")
        @saving = false
        closeModal('add-from-wordstat')
      , (response) ->
        @saving = false
        notifyError('Ошибка при добавлении из WordStat')
        closeModal('add-from-wordstat')
