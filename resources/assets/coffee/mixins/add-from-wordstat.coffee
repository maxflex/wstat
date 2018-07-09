@AddFromWordstat =
  data:
    add_from_wordstat:
      keyphrase_text: ''
      keyphrase_list: []
      current_step: 0
      added: 0
  methods:
    addFromWordstatModal: ->
      @add_from_wordstat.keyphrase_text = ''
      showModal 'add-from-wordstat'

    addFromWordstat: ->
      return if not @add_from_wordstat.keyphrase_text
      @saving = true
      @add_from_wordstat.keyphrase_list = @add_from_wordstat.keyphrase_text.split("\n")
      this.$_addFromWordstatStep()

    $_addingFromWordstatFinished: (message, error = false) ->
      closeModal('add-from-wordstat')
      fn = if error then notifyError else notifySuccess
      fn(message)
      @add_from_wordstat.keyphrase_list = []
      @add_from_wordstat.current_step = 0
      @add_from_wordstat.added = 0
      @saving = false

    $_addFromWordstatStep: ->
      return if not @add_from_wordstat.keyphrase_list.length
      if @add_from_wordstat.current_step >= @add_from_wordstat.keyphrase_list.length
        this.$_addingFromWordstatFinished("<b>#{this.add_from_wordstat.added}</b> добавлено")
      else
        this.$http.post 'api/addFromWordstat',
          keyphrase: @add_from_wordstat.keyphrase_list[@add_from_wordstat.current_step]
        .then (response) =>
          response.data.forEach (d) =>
            @list.phrases.push
              phrase: d.phrase
              original: d.phrase
              frequency: d.number.replace(/\s/g, '')
          this.add_from_wordstat.added += response.data.length
          this.add_from_wordstat.current_step++
          # анимируем скролл, если активный элемент в середине viewport и более
          # середина на 9м элементе
          # высота одного item = 17px
          if @add_from_wordstat.current_step > 9
            $('.add-from-wordstat__items').animate
              scrollTop: (@add_from_wordstat.current_step - 9) * 17
            , 250
          this.$_addFromWordstatStep()
        , (response) ->
          this.$_addingFromWordstatFinished("Ошибка при добавлении из WordStat", true)
