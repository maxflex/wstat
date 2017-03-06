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

<div class="modal transform-modal" id='transform-modal' tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title">@{{ selected_row ? 'Добавьте фразы' : 'Выберите фразу' }}</h4>
            </div>
            <div class="modal-body">
                <table class='table table-hover'>
                    <tr ng-click="selectRow($index)" ng-repeat='phrase in tmp_phrases' class='pointer'
                        ng-class="{
                            'row-disabled': selected_row == $index,
                            'success': selected_rows && selected_rows.indexOf($index) != -1
                        }">
                        <td>
                            @{{ phrase.phrase }}
                        </td>
                    </tr>
                </table>
            </div>
            <div class="modal-footer center">
                <div class="btn btn-primary" ng-disabled="!selected_row && !selected_rows && transform_items === undefined" ng-click="cancel()">отмена</div>
                <div class="btn btn-primary" ng-disabled="!selected_row || !selected_rows || !selected_rows.length" ng-click="addData()">добавить</div>
                <div class="btn btn-primary" ng-disabled="transform_items === undefined" ng-click="transformGo()">трансформировать</div>
            </div>
        </div>
    </div>
</div>
