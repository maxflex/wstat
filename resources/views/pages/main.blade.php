<div class="full-size-center" ng-show="!list.phrases.length">список пуст</div>

<table class="table">
    <tr ng-repeat="phrase in list.phrases track by $index">
        <td>
            @{{ phrase.phrase }}
        </td>
        <td>
            @{{ phrase.frequency }}
        </td>
    </tr>
</table>


{{-- MODAL --}}
<div class="modal" id='addwords-modal' tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-body">
                <textarea class='form-control' id='addwords' placeholder="список фраз..." ng-model='addwords'></textarea>
                <center>
                    <div class="btn btn-primary" ng-click="addWords()">добавить</div>
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
