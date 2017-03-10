@ExportMixin =
  created: ->
    @columnDelimiter = ';'
    @lineDelimiter = '\n'
    @filename = 'wstat.xls'
    @fields = ['phrase', 'minus', 'original', 'frequency']

    @convertListToCSV = =>
      data = ['id' + @columnDelimiter + @fields.join(@columnDelimiter)] # headers
      @list.phrases.forEach (phrase, index) =>
        item = [index + 1]
        @fields.forEach (field) -> item.push(phrase[field])
        data.push(item.join(@columnDelimiter))
      data.join(@lineDelimiter)

  methods:
    downloadCSV: ->
      csv = @convertListToCSV()
      csv = 'data:text/xls;charset=utf-8,' + csv
      data = encodeURI(csv)
      link = document.createElement('a')
      link.setAttribute('href', data)
      link.setAttribute('download', @filename)
      link.click()
