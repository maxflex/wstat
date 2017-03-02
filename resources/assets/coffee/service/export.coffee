angular.module 'Wstat'
	.service 'ExportService', ($rootScope, FileUploader) ->
		bindArguments(this, arguments)
		this.init = (options) ->
			this.controller = options.controller
			this.FileUploader.FileSelect.prototype.isEmptyAfterSelection = ->
				true

			this.uploader = new this.FileUploader
				url: "excel/import"
				alias: 'imported_file'
				autoUpload: true
				method: 'post'
				removeAfterUpload: true
				onCompleteItem: (i, response, status) ->
					notifySuccess 'Импортировано' if status is 200
					notifyError 'Ошибка импорта' if status isnt 200
				onWhenAddingFileFailed  = (item, filter, options) ->
					if filter.name is "queueLimit"
						this.clearQueue()
						this.addToQueue(item)

		this.import = (e) ->
			e.preventDefault()
			$('#import-button').trigger 'click'
			return

		this.export = ->
			window.location = "/excel/export"
			return false
		this
