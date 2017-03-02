angular
    .module 'Wstat'
    .controller 'MainCtrl', ($scope) ->
        # tab listener on textarea
        $scope.$on '$viewContentLoaded', ->
            $("#addwords").off('keydown').keydown (e) ->
                if e.keyCode is 9
                    start = this.selectionStart
                    end = this.selectionEnd
                    $this = $(this)
                    value = $this.val()
                    $this.val(value.substring(0, start) + "\t" + value.substring(end))
                    this.selectionStart = this.selectionEnd = start + 1
                    e.preventDefault()

        # список слов
        $scope.list = []

        $scope.addWords = ->
            $("#addwords").removeClass('has-error')
            new_list = []
            $scope.addwords.split('\n').forEach (line) ->
                # skip empty lines
                if line.trim().length
                    list = line.split('\t')
                    list_item = {phrase: list[0].trim()}
                    # if has tabs
                    if list.length > 1
                        frequency = list[1]
                        # if double tab or not number after tab
                        if not $.isNumeric(frequency)
                            $("#addwords").addClass('has-error')
                            $scope.list = []
                            return
                        else
                            list_item.frequency = parseInt(frequency)
                    new_list.push(list_item)
            $scope.list = $scope.list.concat(new_list)
            closeModal('addwords')

        angular.element(document).ready ->
            console.log $scope.title
