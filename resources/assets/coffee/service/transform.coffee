angular.module 'Wstat'
    .service 'TransformService', ($rootScope) ->
        this.selectRow = (index) ->
            if this.selected_row is undefined
                this.selected_row = index
            else
                # если выбираем заголовок
                if this.selected_row is index
                    this.selected_row = undefined
                else
                    this.selected_rows = [] if this.selected_rows is undefined
                    if this.selected_rows.indexOf(index) is -1
                        this.selected_rows.push(index)
                    else
                        this.selected_rows.splice(this.selected_rows.indexOf(index), 1)

        this.add = ->
            this.transform_items = {} if this.transform_items is undefined
            this.transform_items[this.selected_row] = this.selected_rows
            this.selected_row = undefined
            this.selected_rows = undefined
            console.log(this.transform_items)

        this.transform = ->
            $rootScope.list.phrases.forEach (phrase) =>
                $.each this.transform_items, (main_index, item_indexes) =>
                    item_indexes.forEach (item_index) =>
                        phrase.phrase = replaceWord(phrase.phrase, this.phrases[item_index].phrase, this.phrases[main_index].phrase)
            this.cancel()
            closeModal('transform')

        this.cancel = ->
            this.selected_row = undefined
            this.selected_rows = undefined
            this.transform_items = undefined

        this.itemsCount = ->
            Object.keys(this.transform_items).length

        this
