<div class="full-size-center" ng-show="!list.phrases.length">список пуст</div>

<div class="row" ng-show="list.phrases.length">
    <div class="col-sm-3 pull-right">
        <input class="form-control" type="text" placeholder="поиск..." ng-model="phrase_search" ng-model-options="{debounce: 300}">
    </div>
</div>

<table class="table">
    <tr ng-repeat="phrase in list.phrases | filter : filterItems as filtered_list_items track by $index">
        <td style="width:3%">
            @{{ $index + 1 }}
        </td>
        <td style='width: 30%'>
            @{{ phrase.phrase }}
        </td>
        <td style='width: 30%'>
            <span class="text-gray">@{{ phrase.original }}</span>
        </td>
        <td style='width: 15%'>
            <span aria-label="@{{ phrase.minus }}" class="hint--bottom-right cursor-default">
                <plural count="phrase.minus.split(' ').length" type="minus" hide-zero></plural>
            </span>
        </td>
        <td style='width: 5%'>
            @{{ phrase.frequency }}
        </td>
        <td style='width: 15%'>
            <span class='pull-right link-like link-danger' ng-click='editPhrase(phrase)'>редактировать</span>
        </td>
        <td style='width: 15%'>
            <span class='pull-right link-like link-danger' ng-click='removePhrase(phrase)'>удалить</span>
        </td>
    </tr>
</table>


{{-- MODAL --}}
<div class="modal big-modal" id='main-modal' tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-body">
                <textarea class='form-control' id='modal-value' placeholder="@{{modal.placeholder}}..." ng-model='modal.value'></textarea>
                <center>
                    <div class="btn btn-primary" ng-click="(modal.action)()">@{{modal.title}}</div>
                </center>
            </div>
        </div>
    </div>
</div>

<div class="modal" id='save-as-modal' tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title">Сохранить список как...</h4>
            </div>
            <div class="modal-body">
                <input ng-model='list.title' ng-keydown="onEnter(saveAs, $event)" class='form-control mb' placeholder="Новый список">
            </div>
            <div class="modal-footer center">
                <div class="btn btn-primary" ng-disabled="!list.title || $root.saving" ng-click="saveAs()">сохранить</div>
            </div>
        </div>
    </div>
</div>

<div class="modal" id='replace-modal' tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title">Поиск и замена
                    {{-- <span class="text-gray span-in-h4">найдено 58 совпадений</span> --}}
                </h4>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <input class='form-control mb' ng-model='find_phrase' placeholder="найти">
                </div>
                <div class="form-group">
                    <input class='form-control mb' ng-model='replace_phrase' placeholder="заменить">
                </div>
            </div>
            <div class="modal-footer center">
                <div class="btn btn-primary" ng-disabled="!find_phrase || !replace_phrase" ng-click="replace()">Заменить</div>
            </div>
        </div>
    </div>
</div>

<div class="modal transform-modal" id='transform-modal' tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title">@{{ TransformService.selected_row ? 'Добавьте слова' : 'Выберите слово' }}</h4>
            </div>
            <div class="modal-body scrollable-body">
                <table class='table table-hover table-small'>
                    <tr ng-repeat='phrase in TransformService.phrases' class='pointer'
                        ng-hide='phrase.added'
                        ng-class="{
                            'row-disabled': TransformService.selected_row == $index,
                            'success': TransformService.selected_rows && TransformService.selected_rows.indexOf($index) != -1
                        }">
                        <td ng-click="TransformService.selectRow($index)" style='width: 15%'>
                            @{{ phrase.phrase }}
                        </td>
                        <td ng-click="TransformService.selectRow($index)" class='text-gray' style='width: 70%'>
                            <span ng-if-'phrase.words' ng-repeat="word in phrase.words">@{{ word }}@{{ $last ? '' : ', ' }}</span>
                        </td>
                        <td style='width: 7.5%'>
                            <span ng-show='TransformService.transform_items[$index] !== undefined'
                                class='pull-right link-like' ng-click='TransformService.remove($index)'>вернуть</span>
                        </td>
                        <td style='width: 7.5%'>
                            <span ng-show='TransformService.selected_rows !== undefined && TransformService.selected_rows.indexOf($index) === -1'
                                class='pull-right link-like' ng-click='TransformService.add($index)'>выбрать</span>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="modal-footer center">
                {{-- <div class="btn btn-primary" ng-disabled="!TransformService.selected_row && !TransformService.selected_rows && TransformService.transform_items === undefined" ng-click="cancel()">отмена</div> --}}
                {{-- <button class="btn btn-primary" ng-disabled="TransformService.selected_row === undefined || TransformService.selected_rows === undefined || !TransformService.selected_rows.length" ng-click="TransformService.add()">добавить</button> --}}
                <button class="btn btn-primary" ng-disabled="TransformService.transform_items === undefined" ng-click="TransformService.transform()">
                    трансформировать
                </button>
            </div>
        </div>
    </div>
</div>
