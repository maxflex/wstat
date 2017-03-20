Vue.directive 'digits-only',
  update: (el) ->
    el.value = el.value.replace /[^0-9]/g, ''
