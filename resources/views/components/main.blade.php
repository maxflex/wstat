<div v-show="page == 'list'">
    <div class="full-size-center" v-show="!list.phrases.length">список пуст</div>

    <div class="row" v-show="list.phrases.length">
        <div class="col-sm-3 pull-right">
            <input class="form-control" type="text" placeholder="поиск..." v-model="phrase_search">
        </div>
    </div>

    <table class="table">
        <tr v-for="phrase in filtered_phrases">
            <td style="width:3%" class="text-gray">
                 @{{ list.phrases.indexOf(phrase) + 1 }}.
            </td>
            <td style='width: 33%'>
                @{{ phrase.phrase }}
            </td>
            <td style='width: 33%'>
                <span class="text-gray">@{{ phrase.original }}</span>
            </td>
            <td style='width: 11%'>
                <span v-if='phrase.minus' :aria-label="phrase.minus" class="hint--bottom-right cursor-default">
                    <plural :count="phrase.minus.toWords().length" type='minus'></plural>
                </span>
            </td>
            <td style='width: 5%'>
                @{{ phrase.frequency }}
            </td>
            <td style='width: 10%'>
                <span class='link-like link-danger' @click='startEditingPhrase(phrase)'>редактировать</span>
            </td>
            <td style='width: 5%'>
                 <span class='link-like link-danger' @click='removePhrase(phrase)'>удалить</span>
            </td>
        </tr>
    </table>
</div>

<div v-show="page == 'open'">
    <div class="full-size-center" v-show="lists === null || !lists.length">нет созданных списков</div>
    <table v-if='lists !== null && lists.length' class='table'>
        <tr v-for='list in lists'>
            <td style='width: 40%'>
                <span class="link-like" @click='openList(list)'>@{{ list.title }}</span>
            </td>
            <td style='width: 20%'>
                <plural :count='list.phrases_count' type='phrase' none-text='нет фраз'></plural>
            </td>
            <td style='width: 20%'>
                @{{ formatDateTime(list.created_at) }}
            </td>
            <td style='width: 20%'>
                <span class='pull-right link-like link-danger' @click='removeList(list)'>удалить</span>
            </td>
        </tr>
    </table>
</div>

{{-- MODAL --}}
<div class="modal big-modal" id='main-modal' tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-body">
                <textarea class='form-control' id='modal-value' :placeholder="modal.placeholder" v-model='modal.value'></textarea>
                <center>
                    <button class="btn btn-primary" @click="(modal.action)()">@{{ modal.title }}</button>
                </center>
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
                    <input class='form-control mb' v-model='find_phrase' placeholder="найти">
                </div>
                <div class="form-group">
                    <input class='form-control mb' v-model='replace_phrase' placeholder="заменить">
                </div>
            </div>
            <div class="modal-footer center">
                <div class="btn btn-primary" :disabled="!find_phrase || !replace_phrase" @click="replace()">Заменить</div>
            </div>
        </div>
    </div>
</div>

<div class="modal transform-modal" id='transform-modal' tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title">Выберите слова</h4>
            </div>
            <div class="modal-body scrollable-body">
                <table class='table table-hover table-small'>
                    <tr v-for='(phrase, index) in transform_phrases' class='pointer'
                        v-show='!phrase.added'
                        :class="{
                            'success': selected_rows.length && selected_rows.indexOf(index) != -1
                        }">
                        <td @click="selectRow(index)" style='width: 15%'>
                            @{{ phrase.phrase }}
                        </td>
                        <td @click="selectRow(index)" class='text-gray' style='width: 70%'>
                            <span v-if='phrase.words' v-for="word in phrase.words">@{{ word }}@{{ word === phrase.words[phrase.words.length - 1] ? '' : ', ' }}</span>
                        </td>
                        <td style='width: 7.5%'>
                            <span v-show='transform_items[index] !== undefined'
                                class='pull-right link-like' @click='transformRemove(index)'>вернуть</span>
                        </td>
                        <td style='width: 7.5%'>
                            <span v-show='selected_rows.length && selected_rows.indexOf(index) === -1'
                                class='pull-right link-like' @click='transformAdd(index)'>выбрать</span>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="modal-footer center">
                {{-- <div class="btn btn-primary" ng-disabled="!TransformService.selected_row && !TransformService.selected_rows && TransformService.transform_items === undefined" ng-click="cancel()">отмена</div> --}}
                {{-- <button class="btn btn-primary" ng-disabled="TransformService.selected_row === undefined || TransformService.selected_rows === undefined || !TransformService.selected_rows.length" ng-click="TransformService.add()">добавить</button> --}}
                <button class="btn btn-primary" :disabled="transform_items === undefined" @click="transform()">
                    трансформировать
                </button>
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
                <input v-model='list.title' @keydown.enter="saveAs()" class='form-control mb' placeholder="Новый список">
            </div>
            <div class="modal-footer center">
                <div class="btn btn-primary" :disabled="!list.title || saving" @click="saveAs()">сохранить</div>
            </div>
        </div>
    </div>
</div>

<div class="modal" id='edit-phrase-modal' tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title">Редактирование фразы</h4>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <input v-model.trim='modal_phrase.phrase' class='form-control mb' placeholder="фраза">
                </div>
                <div class="form-group">
                    <input v-model.number='modal_phrase.frequency' class='form-control mb' placeholder="частота">
                </div>
                <div class="form-group">
                    <input v-model.trim='modal_phrase.minus' class='form-control mb' placeholder="минус слова">
                </div>
            </div>
            <div class="modal-footer center">
                <div class="btn btn-primary" v-on:click="editPhrase()">сохранить</div>
            </div>
        </div>
    </div>
</div>
