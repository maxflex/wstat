angular.module 'Wstat'
	.service 'ExportService', ($rootScope, FileUploader) ->
		bindArguments(this, arguments)
		this.init = (options) ->
			this.controller = options.controller
			this.FileUploader.FileSelect.prototype.isEmptyAfterSelection = ->
				true

			this.uploader = new this.FileUploader
				list: 				options.list
				url: 				"excel/import"
				alias: 				'imported_file'
				method: 			'post'
				autoUpload: 		true
				removeAfterUpload: 	true
				onCompleteItem: (i, response, status) ->
					if status is 200
						this.list.phrases  = response if response.length
						notifySuccess 'Импортировано'
					else
						notifyError 'Ошибка импорта'

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
			return

		this
