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
            <span class="pull-right">@{{ phrase.frequency }}</span>
        </td>
    </tr>
</table>


{{-- MODAL --}}
<div class="modal big-modal" id='addwords-modal' tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-body">
                <textarea class='form-control' id='addwords' placeholder="список фраз..." ng-model='textarea'></textarea>
                <center>
                    <div class="btn btn-primary" ng-click="addWords()">добавить</div>
                </center>
            </div>
        </div>
    </div>
</div>

<div class="modal big-modal" id='words-inside-phrase-modal' tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-body">
                <textarea class='form-control' id='addwords' placeholder="список слов или фраз..." ng-model='textarea'></textarea>
                <center>
                    <div class="btn btn-primary" ng-click="deleteWordsInsidePhrase()">удалить</div>
                </center>
            </div>
        </div>
    </div>
</div>

<div class="modal big-modal" id='phrases-with-words-modal' tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-body">
                <textarea class='form-control' id='addwords' placeholder="список слов или фраз..." ng-model='textarea'></textarea>
                <center>
                    <div class="btn btn-primary" ng-click="deletePhrasesWithWords()">удалить</div>
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

<div class="modal big-modal" id='replace-phrases-modal' tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-body">
                <textarea class='form-control' id='replace-phrases' placeholder="список слов или фраз..." ng-model='textarea'></textarea>
                <center>
                    <div class="btn btn-primary" ng-click="replacePhrases()">заменить</div>
                </center>
            </div>
        </div>
    </div>
</div>
