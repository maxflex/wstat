@ExportMixin =
  created: ->
    @filename = 'wstat.xlsx'
    @fields = ['id', 'phrase', 'frequency', 'original', 'minus']

  mounted: ->
    clipboard = new ClipboardJS '#copy-to-clipboard',
      text: =>
        alert('Копирование...')
        text = @fields.join("\t") + "\n"
        @list.phrases.forEach (phrase) =>
          a = []
          @fields.forEach (field) =>
            a.push(phrase[field])
          text += a.join("\t") + "\n"
        return text

    clipboard.on 'success', -> notifySuccess('Скопировано в буфер')
    clipboard.on 'error', -> notifyError('Ошибка копирования в буфер')

  methods:
    copyToClipboard: ->

    generateSheetData: ->
        wsheet = {}
        range =
          s: c: 0, r: 0
          e: c: @fields.length, r: @list.phrases.length + 1 # headers included

        wsheet['!cols'] = []

        @fields.forEach (title, index) ->
          cell_ref = XLSX.utils.encode_cell c: index, r: 0
          cell = v: title, t: 's'
          wsheet[cell_ref] = cell
          wsheet['!cols'].push wch: cell.v.length

        col_width = @fields[0].length
        R = 0
        while R != @list.phrases.length
          C = 0
          while C != @fields.length
            if @fields[C] is 'id'
              cell = v: R + 1
            else
              cell = v: @list.phrases[R][@fields[C]]
            if cell.v == null
              ++C
              continue
            cell_ref = XLSX.utils.encode_cell c: C, r: R + 1
            if typeof cell.v == 'number'
              cell.t = 'n'
            else
              cell.t = 's'
              wsheet['!cols'][C].wch = cell.v.length if cell.v and cell.v.length > wsheet['!cols'][C].wch
            wsheet[cell_ref] = cell
            ++C
          ++R
        wsheet['!ref'] = XLSX.utils.encode_range range
        wsheet

    exportXls: ->
      @saving = true
      setTimeout =>
        try
          Workbook = ->
            if !(@ instanceof Workbook)
              return new Workbook
            @SheetNames = []
            @Sheets = {}
            return
          wsheet_name = @list.title || 'Новый список'
          wbook = new Workbook
          wsheet = @generateSheetData()
          wbook.SheetNames.push wsheet_name
          wbook.Sheets[wsheet_name] = wsheet
          wbookOut = XLSX.write wbook,
            bookType: 'xlsx'
            bookSST: true
            type: 'binary'
          s2ab = (s) ->
            buf = new ArrayBuffer s.length
            view = new Uint8Array(buf)
            i = 0
            while i != s.length
              view[i] = s.charCodeAt(i) & 0xFF
              ++i
            buf
          saveAs new Blob([ s2ab(wbookOut) ], type: 'application/octet-stream'), @filename
        catch err
          notifyError 'Ошибка экспорта'
        @saving = false
      , 100
