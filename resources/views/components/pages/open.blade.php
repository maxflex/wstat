<div v-show="page == 'open'">
    <div class="full-size-center" v-show="lists === null || !lists.length">нет созданных списков</div>
    <table v-if='lists !== null && lists.length' class='table'>
        <tr v-for='list in lists'>
            <td style='width: 40%'>
                <span class="link-like" @click='openList(list.id)'>@{{ list.title }}</span>
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
