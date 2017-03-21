<div v-show="page == 'list'">
    <div class="full-size-center" v-show="!list.phrases.length">список пуст</div>

    <div class="row mb" v-show="list.phrases.length">
        <div class="col-sm-3 pull-right">
            <input class="form-control" type="text" placeholder="поиск..." v-model="phrase_search">
        </div>
    </div>

    <virtual-scroller v-show="list.phrases.length" class="scroller" :items="filtered_phrases" item-height="26" content-tag="table" content-class='table'>
          <template scope="props">
            <thead slot="before-content"></thead>
            <tr>
                <td style="width:3%" class="text-gray">
                     @{{ props.itemIndex + 1 }}.
                </td>
                <td style='width: 33%'>
                    @{{ props.item.phrase }}
                </td>
                <td style='width: 33%'>
                    <span class="text-gray">@{{ props.item.original }}</span>
                </td>
                <td style='width: 11%'>
                    <span v-if='props.item.minus' :aria-label="props.item.minus" class="hint--bottom-right cursor-default">
                        <plural :count="props.item.minus.toWords().length" type='minus'></plural>
                    </span>
                </td>
                <td style='width: 5%'>
                    @{{ props.item.frequency }}
                </td>
                <td style='width: 9%'>
                    <span class='link-like link-danger' @click='startEditingPhrase(props.item, props.itemIndex)'>редактировать</span>
                </td>
                <td style='width: 6%'>
                     <span class='link-like link-danger' @click='removePhrase(props.item)'>удалить</span>
                </td>
            </tr>
            <slot name="after-content"></tbody></slot>
          </template>
    </virtual-scroller>

    {{-- <table class="table">
        <tr v-for="(phrase, index) in filtered_phrases" :class="{
                'drag-over': drag.over === index && drag.start !== index,
                'is-dragging': drag.start === index
        }" draggable="true" @dragenter.prevent="drag.over = index" @dragstart='drag.start = index'
        @dragend="dragend" @drop.prevent='drop(index)' @dragover.prevent>
            <td style="width:3%" class="text-gray">
                 @{{ index + 1 }}.
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
                <span class='link-like link-danger' @click='startEditingPhrase(phrase, index)'>редактировать</span>
            </td>
            <td style='width: 5%'>
                 <span class='link-like link-danger' @click='removePhrase(phrase)'>удалить</span>
            </td>
        </tr>
    </table> --}}
</div>
