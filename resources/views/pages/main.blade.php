<div class="full-size-center" ng-show="!list.phrases.length">список пуст</div>

<div class="row" ng-show="list.phrases.length">
    <div class="col-sm-3 pull-right">
        <input class="form-control" type="text" placeholder="поиск" ng-model="phrase_search">
    </div>
</div>

<table class="table">
    <tr ng-repeat="phrase in list.phrases | filter : {phrase: phrase_search} as filtered_list_items track by $index">
        <td style='width: 45%'>
            @{{ phrase.phrase }}
        </td>
        <td style='width: 45%'>
            <span class="text-gray">@{{ phrase.original }}</span>
        </td>
        <td style='width: 10%'>
            @{{ phrase.frequency }}
        </td>
        <td style='width: 20%'>
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
                <input ng-model='list.title' class='form-control mb' placeholder="Новый список">
            </div>
            <div class="modal-footer center">
                <div class="btn btn-primary" ng-disabled="!list.title || $root.saving" ng-click="saveAs()">сохранить</div>
            </div>
        </div>
    </div>
</div>