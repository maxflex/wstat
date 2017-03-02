angular.module 'Wstat'
    .service 'IndexService', ($rootScope) ->
        this.filter = ->
            $.cookie(this.controller, JSON.stringify(this.search), { expires: 365, path: '/' });
            this.current_page = 1
            this.pageChanged()

        this.max_size = 30

        this.init = (Resource, current_page, attrs, load_page = true) ->
            $rootScope.frontend_loading = true
            this.Resource = Resource
            this.current_page = parseInt(current_page)
            this.controller = attrs.ngController.toLowerCase().slice(0, -5)
            this.search = if $.cookie(this.controller) then JSON.parse($.cookie(this.controller)) else {}
            this.loadPage() if load_page

        this.loadPage = ->
            params = {page: this.current_page}
            params.sort = this.sort if this.sort isnt undefined
            this.Resource.get params, (response) =>
                this.page = response
                $rootScope.frontend_loading = false

        this.pageChanged = ->
            $rootScope.frontend_loading = true
            this.loadPage()
            this.changeUrl()

        # change browser user / history push
        this.changeUrl = ->
            window.history.pushState('', '', this.controller + '?page=' + this.current_page)

        this
    .service 'FormService', ($rootScope, $q, $timeout) ->
        this.init = (Resource, id, model) ->
            this.dataLoaded = $q.defer()
            $rootScope.frontend_loading = true
            this.Resource = Resource
            this.saving = false
            if id
                this.model = Resource.get({id: id}, => modelLoaded())
            else
                this.model = new Resource(model)
                modelLoaded()


        modelLoaded = =>
            $rootScope.frontend_loading = false
            $timeout =>
                this.dataLoaded.resolve(true)
                $('.selectpicker').selectpicker 'refresh'

        beforeSave = =>
            if this.error_element is undefined
                ajaxStart()
                this.beforeSave() if this.beforeSave isnt undefined
                this.saving = true
                true
            else
                $(this.error_element).focus()
                # если нет ошибок, вернуть true и обработать в save/create
                false

        # вырезаем MODEL из url типа /website/model/create
        modelName = ->
            l = window.location.pathname.split('/')
            model_name = l[l.length - 2]
            model_name = l[l.length - 3] if $.isNumeric(model_name)
            model_name

        this.delete = (event) ->
            bootbox.confirm "Вы уверены, что хотите #{$(event.target).text()} ##{this.model.id}?", (result) =>
                if result is true
                    beforeSave()
                    this.model.$delete().then ->
                        redirect modelName()

        this.edit = ->
            return if not beforeSave()
            this.model.$update().then =>
                this.saving = false
                ajaxEnd()

        this.create = ->
            return if not beforeSave()
            this.model.$save().then (response) =>
                redirect modelName() + "/#{response.id}/edit"
            , (response) =>
                this.saving = false
                ajaxEnd()
                this.onCreateError(response)

        this
