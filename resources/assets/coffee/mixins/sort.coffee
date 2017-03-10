@SortMixin =
    methods:
        sort: ->
            return unless @list.phrases and @list.phrases.length

            @getWords()
            @getWeights()
            @sortPhraseByWeight()


        getWords: ->
            @words = []
            @list.phrases.forEach (phrase) =>
                @words.push.apply @words, @splitBySpace phrase.phrase

        getWeights: ->
            @word_weights = []

            word_groups =  _.chain @words
            .groupBy (word) -> word
            .sortBy (word) -> word.length
            .value()

            _.map word_groups, (group) =>
                @word_weights[group[0]] = group.length

        sortPhraseByWeight: ->
            @list.phrases.forEach (phrase) =>
                words = @splitBySpace phrase.phrase

                words_sorted_by_weight = _.sortBy words.sort().reverse(), ((word) =>
                    @word_weights[word])
                .reverse()

                phrase_weight = []
                words_sorted_by_weight.forEach (word) =>
                    phrase_weight.push @word_weights[word]

                phrase.phrase        = words_sorted_by_weight.join ' '
                phrase.phrase_weight = phrase_weight

            @list.phrases.sort (a, b) ->
                length = Math.min a.phrase_weight.length, b.phrase_weight.length
                min = false
                for i in [0 .. length - 1]
                    debugger if a.phrase_weight[i] is 41 and b.phrase_weight[i] is 124
                    min = -1 if a.phrase_weight[i] < b.phrase_weight[i]
                    min = 1 if a.phrase_weight[i] > b.phrase_weight[i]
                    break if min

                if not min
                    min = b.phrase_weight.length - a.phrase_weight.length
                    if min is 0
                        min = -1 if a.phrase > b.phrase
                        min =  1 if a.phrase < b.phrase
                min
            .reverse()

        splitBySpace: (string) ->
            _.without (string.split ' '), ''
