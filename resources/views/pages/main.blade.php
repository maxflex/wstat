<div class="full-size-center" ng-show="!list.length">список пуст</div>

<table class="table">
    <tr ng-repeat="list_item in list">
        <td>
            @{{ list_item.phrase }}
        </td>
        <td>
            @{{ list_item.frequency }}
        </td>
    </tr>
</table>


{{-- MODAL --}}
<div class="modal" id='addwords-modal' tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-body">
                <textarea class='form-control' id='addwords' placeholder="список слов..." ng-model='addwords'></textarea>
                <center>
                    <div class="btn btn-primary" ng-click="addWords()">добавить</div>
                </center>
            </div>
        </div>
    </div>
</div>
