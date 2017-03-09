angular.module 'Wstat'
    .service 'ExportService', ($rootScope) ->
        columnDelimiter = ';'
        lineDelimiter = '\n'
        filename = 'wstat.csv'
        fields = ['phrase', 'minus', 'original', 'frequency']

        convertListToCSV = ->
            data = [fields.join(columnDelimiter)] # headers
            $rootScope.list.phrases.forEach (phrase) ->
                item = []
                fields.forEach (field) -> item.push(phrase[field])
                data.push(item.join(columnDelimiter))
            data.join(lineDelimiter)

        this.downloadCSV = ->
            csv = convertListToCSV()
            csv = 'data:text/csv;charset=utf-8,' + csv
            data = encodeURI(csv)
            link = document.createElement('a')
            link.setAttribute('href', data)
            link.setAttribute('download', filename)
            link.click()

        this
