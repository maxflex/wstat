<div class="full-size-center" v-show="!list.phrases.length">список пуст</div>

<div class="row" v-show="list.phrases.length">
    <div class="col-sm-3 pull-right">
        <input class="form-control" type="text" placeholder="поиск..." v-model="phrase_search">
    </div>
</div>

<table class="table">
    <tr v-for="phrase in filtered_phrases">
        <td style="width:3%" class="text-gray">
             @{{ getHardIndex(phrase) }}.
        </td>
        <td style='width: 33%'>
            @{{ phrase.phrase }}
        </td>
        <td style='width: 33%'>
            <span class="text-gray">@{{ phrase.original }}</span>
        </td>
        <td style='width: 11%'>
            {{-- <span ng-if='phrase.minus' aria-label="@{{ phrase.minus }}" class="hint--bottom-right cursor-default">
                <plural count="phrase.minus.split(' ').length" type='minus'></plural>
            </span> --}}
        </td>
        <td style='width: 5%'>
            @{{ phrase.frequency }}
        </td>
        <td style='width: 10%'>
             <span class='link-like link-danger' v-on:click='startEditingPhrase(list.phrases.indexOf(phrase), phrase)'>редактировать</span>
        </td>
        <td style='width: 5%'>
             <span class='link-like link-danger' v-on:click='removePhrase(phrase)'>удалить</span>
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
                    <button class="btn btn-primary" v-on:click="(modal.action)()">@{{ modal.title }}</button>
                </center>
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