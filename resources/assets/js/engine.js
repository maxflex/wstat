	// angular.element(document).ready(function() {
	// 	setTimeout(function() {
	// 		// moment.locale('ru-RU')
	// 		NProgress.settings.showSpinner = false
	// 		rebindMasks()
	// 		setScope()
	// 		configurePlugins()
	// 	}, 50)
	// })
    $(document).ready(() => {
        NProgress.settings.showSpinner = false
        setTimeout(() => {
            $("#modal-value").on('keydown', function(e) {
                if (e.keyCode == 9) {
                    start = this.selectionStart
                    end = this.selectionEnd
                    $this = $(this)
                    value = $this.val()
                    $this.val(value.substring(0, start) + "\t" + value.substring(end))
                    this.selectionStart = this.selectionEnd = start + 1
                    e.preventDefault()
                }
            })
        }, 1000)
    })

    String.prototype.toWords = function() {
        if (this.trim().length) {
            return this.trim().split(' ').filter((str) => str.length)
        } else {
            return []
        }
    }

    Array.prototype.toPhrase = function() {
        return this.join(' ').trim()
    }

    // Vue.prototype.$last = function (item, list) {
    //     return item === list[list.length - 1]
    // }

	/**
	 * Remove by id
	 */
	function removeById(object, id) {
		return _.without(object, _.findWhere(object, {id: id}))
	}

	/**
	 * Find by id
	 */
	function findById(object, id) {
		return _.findWhere(object, {id: parseInt(id)})
	}

	/**
	 * Helper function for recording pagination history
	 */
	function paginate(entity, page) {
		window.history.pushState('', '', entity + '?page=' + page)
	}

	/**
	 * Helper funciton for selectpicker
	 */
	function sp(id, placeholder, multipleSeparator) {
		setTimeout(function() {
			$('#sp-' + id).selectpicker({
				noneSelectedText: placeholder,
				multipleSeparator: multipleSeparator === undefined ? ', ' : multipleSeparator,
			})
		}, 50)
	}

	function spRefresh(id) {
		setTimeout(function() {
			$('#sp-' + id).selectpicker('refresh')
		}, 50)
	}

	function spe(element, placeholder) {
		setTimeout(function() {
			$(element).selectpicker({
				noneSelectedText: placeholder
			})
		}, 50)
	}

	function speRefresh(element) {
		setTimeout(function() {
			$(element).selectpicker('refresh')
		}, 50)
	}

	/**
	 * Helper functions to start/stop ajax requests
	 */
	function ajaxStart() {
		NProgress.start()
	}

	function ajaxEnd() {
		NProgress.done()
	}

	/**
	 * Биндит аргументы контроллера ангуляра в $scope
	 */
	function bindArguments(scope, arguments) {
		function_arguments = getArguments(arguments.callee)

		for (i = 1; i < arguments.length; i++) {
			function_name = function_arguments[i]
			if (function_name[0] === '$') {
				continue
			}
			scope[function_name] = arguments[i]
		}
	}

	/**
	 * Получить аргументы функции в виде строки
	 * @link: http://stackoverflow.com/a/9924463/2274406
	 */
	var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
	var ARGUMENT_NAMES = /([^\s,]+)/g;
	function getArguments(func) {
	  var fnStr = func.toString().replace(STRIP_COMMENTS, '');
	  var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
	  if(result === null)
	     result = [];
	  return result;
	}

	/**
	 * Стандартная дата
	 */
	function convertDate(date) {
		date = date.split(".")
		date = date.reverse()
		date = date.join("-")
		return date
	}

	/**
	 * Configure plugins
	 */
	function configurePlugins() {

	}

	/**
	 * Переназначает маски для всех элементов, включая новые
	 *
	 */
	function rebindMasks(delay) {
		// Немного ждем, чтобы новые элементы успели добавиться в DOM
		setTimeout(function() {
			// $('.sp').selectpicker()
            //
			// // Дата
			// $('.bs-date').datepicker({
			// 	language	: 'ru',
			// 	orientation	: 'top left',
			// 	autoclose	: true
			// })
            //
			// // Дата, начиная с нынчашнего дня
			// $('.bs-date-now').datepicker({
			// 	language	: 'ru',
			// 	orientation	: 'top left',
			// 	startDate: '-0d',
			// 	autoclose	: true
			// })
            //
			// // Дата вверху
			// $(".bs-date-top").datepicker({
			// 	language	: 'ru',
			// 	autoclose	: true,
			// 	orientation	: 'bottom auto',
			// })
            //
			// // С очисткой даты
			// $(".bs-date-clear").datepicker({
			// 	language	: 'ru',
			// 	autoclose	: true,
			// 	orientation	: 'bottom auto',
			// 	clearBtn    : true
			// })

			// $(".bs-datetime").datetimepicker({
			// 	format: 'YYYY-MM-DD HH:mm',
			// 	locale: 'ru',
			// })
			//
			// $(".bs-date-default").datetimepicker({
			// 	format: 'YYYY-MM-DD',
			// 	locale: 'ru',
			// })

			// $(".passport-number").inputmask("Regex", {regex: "[a-zA-Z0-9]{0,12}"});
			// $(".digits-year").inputmask("Regex", {regex: "[0-9]{0,4}"});

			// REGEX для полей типа "число" и "1-5"
			$(".digits-only-float").inputmask("Regex", {regex: "[0-9]*[.]?[0-9]+"});
			$(".digits-only-minus").inputmask("Regex", {regex: "[-]?[0-9]*"});
			$(".digits-only").inputmask("Regex", {regex: "[0-9]*"});

			$.mask.definitions['H'] = "[0-2]";
		    $.mask.definitions['h'] = "[0-9]";
		    $.mask.definitions['M'] = "[0-5]";
		    $.mask.definitions['m'] = "[0-9]";
			$(".timemask").mask("Hh:Mm", {clearIfNotMatch: true});

			// Маска телефонов
			// $(".phone-masked")
			// 	.mask("+7 (999) 999-99-99", { autoclear: false })
		}, (delay === undefined ? 100 : delay)  )
	}

	/**
	 * Нотифай с сообщением об ошибке.
	 *
	 */
	function notifyError(message) {
		$.notify({'message': message, icon: "glyphicon glyphicon-remove no-margin-right"}, {
			type : "danger",
			allow_dismiss : true,
			placement: {
				from: "top",
			},
			delay: 0
		});
	}

	/**
	 * Нотифай с сообщением об успехе.
	 *
	 */
	function notifySuccess(message) {
		$.notify({'message': message, icon: "glyphicon glyphicon-ok no-margin-right"}, {
			type : "success",
			allow_dismiss : true,
			placement: {
				from: "top",
			},
			delay: 0
		});
	}

	// Установить scope
	function setScope() {
		scope = angular.element('[ng-app=Wstat]').scope()
	}


/**
 * Инициализировать array перед push, если он не установлен, чтобы не было ошибки.
 *
 */
function initIfNotSet(arr) {
	if (!arr) {
		arr = []
	}
	return arr
}

/**
 * Инициализировать array перед push, если он не установлен, чтобы не было ошибки.
 *
 */
function initIfNotSetObject(obj) {
	if (!obj) {
		obj = {}
	}
	return obj
}


/**
 * Анимация аякса.
 *
 */
function frontendLoadingStart()
{
	$("#frontend-loading").fadeIn(300)
}
function frontendLoadingEnd()
{
	$("#frontend-loading").hide()
}

function redirect(url) {
	window.location.href = url
}

/**
 * Переместить курсор редактирования в конец content-editable.
 *
 */
function setEndOfContenteditable(contentEditableElement)
{
    var range,selection;
    if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
    {
        range = document.createRange();//Create a range (a range is a like the selection but invisible)
        range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        selection = window.getSelection();//get the selection object (allows you to change selection)
        selection.removeAllRanges();//remove any selections already made
        selection.addRange(range);//make the range you have just created the visible selection
    }
    else if(document.selection)//IE 8 and lower
    {
        range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
        range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        range.select();//Select the range (make it the visible selection
    }
}

/**
 * Показать модальное окно
 */
function showModal(id) {
    $('#' + id + '-modal').modal('show')
}
function closeModal(id) {
    if (!id) {
        id = 'main'
    }
    $('#' + id + '-modal').modal('hide')
    $("#main-modal").removeClass('has-error')
}

/**
 * Удалить двойные пробелы и пробелы в начале/конце
 */
function removeDoubleSpaces(str) {
    return str.replace('  ', ' ').trim()
}

function exactMatch(word) {
    return new RegExp('(?:^|\\s)' + word + '(?:$|\\s)', 'g')
}

function wrapWithSpace(word) {
	return ' ' + word + ' '
}

function replaceWord(str, word, replacement) {
    return removeDoubleSpaces(str.replace(exactMatch(word), wrapWithSpace(replacement)))
}

function removeDoubleSpaces(str) {
	return str.replace('  ', ' ')
}
