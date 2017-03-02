<div class="full-size-center" ng-show="!lists || !lists.length">нет созданных списков</div>

<table ng-if='lists.length' class='table'>
    <tr ng-repeat='list in lists'>
        <td style='width: 40%'>
            <span class="link-like" ng-click='open(list)'>@{{ list.title }}</span>
        </td>
        <td style='width: 20%'>
            <plural count='list.phrases_count' type='phrase' none-text='нет фраз'></plural>
        </td>
        <td style='width: 20%'>
            @{{ formatDateTime(list.created_at) }}
        </td>
        <td style='width: 20%'>
            <span class='pull-right link-like link-danger' ng-click='remove(list)'>удалить</span>
        </td>
    </tr>
</table>
