@HelpersMixin =
  methods:
    formatDateTime: (date) ->
      moment(date).format "DD.MM.YY в HH:mm"
  watch:
    saving: (isSaving) ->
      if isSaving then ajaxStart() else ajaxEnd()
