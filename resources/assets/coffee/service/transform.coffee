angular.module 'Wstat'
    .service 'TransformService', ($rootScope) ->
        this.selectRow = (index) ->
            this.selected_rows = [] if this.selected_rows is undefined
            if this.selected_rows.indexOf(index) is -1
                this.selected_rows.push(index)
            else
                this.selected_rows.splice(this.selected_rows.indexOf(index), 1)

        this.add = (index) ->
            this.transform_items = {} if this.transform_items is undefined

            # скрываем добавленные и добавляем к добавленному
            this.phrases[index].words = [] if this.phrases[index].words is undefined
            this.selected_rows.forEach (position) =>
                this.phrases[position].added = true
                this.phrases[index].words.push(this.phrases[position].phrase)

            # добавляем к массиву индексов
            this.transform_items[index] = [] if this.transform_items[index] is undefined
            this.transform_items[index] = this.transform_items[index].concat(this.selected_rows)
            this.selected_rows = undefined
            console.log(this.transform_items)

        this.remove = (index) ->
            this.transform_items[index].forEach (position) =>
                this.phrases[position].added = false
                this.phrases[index].words = undefined
            this.transform_items[index] = undefined


        this.transform = ->
            $rootScope.list.phrases.forEach (phrase) =>
                $.each this.transform_items, (main_index, item_indexes) =>
                    item_indexes.forEach (item_index) =>
                        phrase.phrase = replaceWord(phrase.phrase, this.phrases[item_index].phrase, this.phrases[main_index].phrase)
            this.cancel()
            closeModal('transform')

        this.cancel = ->
            this.phrases = undefined
            this.selected_rows = undefined
            this.transform_items = undefined

        this
