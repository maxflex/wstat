<div class="full-size-center" ng-show="!list.phrases.length">список пуст</div>

<table class="table">
    <tr ng-repeat="phrase in list.phrases track by $index">
        <td style='width: 45%'>
            @{{ phrase.phrase }}
        </td>
        <td style='width: 45%'>
            <span class="text-gray">@{{ phrase.original }}</span>
        </td>
        <td style='width: 10%'>
            @{{ phrase.frequency }}
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
                <input ng-model='list.title' class='form-control mb' placeholder="Новый список">
            </div>
            <div class="modal-footer center">
                <div class="btn btn-primary" ng-disabled="!list.title || $root.saving" ng-click="saveAs()">сохранить</div>
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
                    <tr ng-click="TransformService.selectRow($index)" ng-repeat='phrase in TransformService.phrases' class='pointer'
                        ng-class="{
                            'row-disabled': TransformService.selected_row == $index,
                            'success': TransformService.selected_rows && TransformService.selected_rows.indexOf($index) != -1
                        }">
                        <td>
                            @{{ phrase.phrase }}
                        </td>
                    </tr>
                </table>
            </div>
            <div class="modal-footer center">
                {{-- <div class="btn btn-primary" ng-disabled="!TransformService.selected_row && !TransformService.selected_rows && TransformService.transform_items === undefined" ng-click="cancel()">отмена</div> --}}
                <button class="btn btn-primary" ng-disabled="TransformService.selected_row === undefined || TransformService.selected_rows === undefined || !TransformService.selected_rows.length" ng-click="TransformService.add()">добавить</button>
                <button class="btn btn-primary" ng-disabled="TransformService.transform_items === undefined" ng-click="TransformService.transform()">
                    трансформировать <span ng-if='TransformService.transform_items !== undefined'>(@{{ TransformService.itemsCount() }})</span>
                </button>
            </div>
        </div>
    </div>
</div>
