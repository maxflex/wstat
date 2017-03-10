<div class="full-size-center" v-show="!list.phrases.length">список пуст</div>

<div class="row" v-show="list.phrases.length">
    <div class="col-sm-3 pull-right">
        <input class="form-control" type="text" placeholder="поиск..." ng-model="phrase_search" ng-model-options="{debounce: 300}">
    </div>
</div>

<table class="table">
    <tr v-for="phrase in list.phrases">
        <td style="width:3%" class="text-gray">
            {{-- @{{ getHardIndex(phrase) }}. --}}
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
            {{-- <span class='link-like link-danger' v-on:click='startEditing(phrase)'>редактировать</span> --}}
        </td>
        <td style='width: 5%'>
            {{-- <span class='link-like link-danger' v-on:click='removePhrase(phrase)'>удалить</span> --}}
        </td>
    </tr>
</table>

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
