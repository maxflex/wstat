plurals =
  'minute': ['минуту', 'минуты', 'минут']
  'hour': ['час', 'часа', 'часов']
  'day': ['день', 'дня', 'дней']
  'phrase': ['фраза', 'фразы', 'фраз']
  'minus': ['минус слово', 'минус слова', 'минус слов']

Vue.component 'plural',
  props: ['count', 'type']
  computed:
    text: ->
      if @count % 10 is 1 and @count % 100 isnt 11
        plurals[@type][0]
      else if @count % 10 >= 2 and @count % 10 <=4 && @count % 100 < 10 or @count % 100 >= 20
        plurals[@type][1]
      else plurals[@type][2]
  template: """
    <span>{{ count }} {{ text }}</span>
  """
