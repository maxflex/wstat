angular.module 'Wstat'
    .service 'AceService', ->
        this.initEditor = (FormService, minLines = 30, id = 'editor') ->
            this.editor = ace.edit(id)
            this.editor.getSession().setMode("ace/mode/html")
            this.editor.getSession().setUseWrapMode(true)
            this.editor.setOptions
                minLines: minLines
                maxLines: Infinity
            this.editor.commands.addCommand
                name: 'save',
                bindKey:
                    win: 'Ctrl-S'
                    mac: 'Command-S'
                exec: (editor) ->
                    FormService.edit()
        this
