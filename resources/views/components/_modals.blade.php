{{-- MODAL --}}
<div class="modal big-modal" id='main-modal' tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-body">
                <textarea class='form-control' id='modal-value' :placeholder="modal.placeholder" v-model='modal.value'></textarea>
                <center>
                    <button class="btn btn-primary" :disabled='!modal.value' @click="(modal.action)()">@{{ modal.title }}</button>
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
                <table class='table table-small'>
                    <tr
                        v-for='(phrase, index) in transform_phrases'
                        v-show='!phrase.added'
                        :class="{
                               'drag-over': drag.over === index && drag.start !== index,
                               'is-dragging': drag.start === index
                        }" draggable="true" @dragenter.prevent="drag.over = index" @dragstart='drag.start = index'
                       @dragend="dragend" @drop.prevent='drop(index)' @dragover.prevent
                    >
                        <td style='width: 20%'>
                            @{{ phrase.phrase }}
                        </td>
                        <td class='text-gray' style='width: 80%'>
                            <span v-if='phrase.words' v-for="word in phrase.words">
                                <span class='link-like link-gray' @click='transformRemove(word, phrase, index)'>@{{ word.phrase }}</span>@{{ word.index == phrase.words[phrase.words.length - 1].index ? '' : ', ' }}
                            </span>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="modal-footer center">
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

<div class="modal" id='add-to-all-modal' tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title">Добавить ко всем</h4>
            </div>
            <div class="modal-body">
                <input v-model='modal.value' @keydown.enter="addToAll()" class='form-control mb' placeholder="слово или фраза...">
            </div>
            <div class="modal-footer center">
                <div class="btn btn-primary" :disabled='!modal.value' @click="addToAll()">добавить</div>
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
                    <input v-model='modal_phrase.frequency' v-digits-only class='form-control mb' placeholder="частота">
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
