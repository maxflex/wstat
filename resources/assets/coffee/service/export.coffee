angular.module 'Wstat'
	.service 'ExportService', ($rootScope, FileUploader) ->
		bindArguments this, arguments

		this.init = ->
			this.FileUploader.FileSelect.prototype.isEmptyAfterSelection = -> true

			this.uploader = new this.FileUploader
				url: 				"excel/import"
				alias: 				'imported_file'
				method: 			'post'
				autoUpload: 		true
				removeAfterUpload: 	true

				onBeforeUploadItem: ->
					this.url += "/#{scope.list.id}" if scope.list.id

				onCompleteItem: (i, response, status) ->
					if status is 200
						notifySuccess 'Импортировано'
						scope.list.phrases = response if response.length
					else
						notifyError 'Ошибка импорта'

				onWhenAddingFileFailed: (item, filter) ->
					if filter.name is "queueLimit"
						this.clearQueue()
						this.addToQueue(item)

		this.import = (e) ->
			e.preventDefault()
			$('#import-button').trigger 'click'
			return

		this.export = ->
			window.location = "/excel/export/#{scope.list.id}" if scope.list.id
			return

		this
