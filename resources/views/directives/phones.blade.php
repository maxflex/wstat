@foreach(App\Traits\Person::$phone_fields as $index => $phone_field)
    <div class="form-group" ng-class="{'has-error': entity.{{ $phone_field }}_duplicate}" ng-show="level >= {{ $index + 1 }}">
        <div ng-class="{'input-group': isFull(entity.{{ $phone_field }})
            || ({{ $index + 1 }} == level && level < {{ count(App\Traits\Person::$phone_fields) }})}">
            <input ng-keyup="phoneMaskControl($event)" type="text"
                class="form-control phone-masked" ng-model="entity.{{ $phone_field }}" placeholder="телефон {{ $index ? ($index + 1) : '' }}">

            <input-comment entity='entity' comment-field='{{ $phone_field }}_comment'></input-comment>

            <div class="input-group-btn">
                <button class="btn btn-default" ng-if="isFull(entity.{{ $phone_field }})" ng-click='info(entity.{{ $phone_field }})'>
                    <span class="glyphicon glyphicon-transfer small no-margin-right"></span>
                </button>
                <button class="btn btn-default" ng-if="isFull(entity.{{ $phone_field }})" ng-click='PhoneService.call(entity.{{ $phone_field }})'>
                    <span class="glyphicon glyphicon-earphone small no-margin-right"></span>
                </button>
                <button class="btn btn-default"
                    ng-click='sms(entity.{{ $phone_field }})'
                    ng-if="isFull(entity.{{ $phone_field }}) && PhoneService.isMobile(entity.{{ $phone_field }})">
                    <span class="glyphicon glyphicon-envelope small no-margin-right"></span>
                </button>
                <button class="btn btn-default" ng-if="level == {{ $index + 1 }} && level < {{ count(App\Traits\Person::$phone_fields) }}" ng-click="nextLevel()">
                    <span class="glyphicon glyphicon-plus small no-margin-right"></span>
                </button>
            </div>
        </div>
    </div>
@endforeach

{{-- API --}}
<div class="modal" id='api-phone-info' tabindex="-1">
    <div class="modal-dialog" style="width: 60%; margin: 10% auto">
        <div class="modal-content" style="height: 50%">
            <div class="div-loading" ng-show='mango_info === null'>
                <span>загрузка...</span>
            </div>
            <div class="modal-body" style="height: 500px; overflow: scroll; max-height: 100%" >
                <div class="vertical-center" ng-show='!mango_info.length'>нет данных</div>
                <h4 ng-show='mango_info.length' class="modal-title" style="margin-bottom: 10px">Детализация по номеру @{{ api_number }}</h4>
                <table class='table table-divlike'>
                    <tr ng-repeat='data in mango_info'>
                        <td width='300'>
                            <span ng-show='data.from_extension' style='color: @{{ UserService.getColor(data.from_extension) }}'>@{{ UserService.getLogin(data.from_extension) }}</span>
                            <span ng-hide='data.from_extension'>@{{ getNumberTitle(data.from_number) }}</span>
                            @{{ formatDateTime(data.date_start) }}
                            <span class="glyphicon glyphicon-arrow-right"></span>
                            <span ng-show='data.to_extension' style='color: @{{ UserService.getColor(data.to_extension) }}'>@{{ UserService.getLogin(data.to_extension) }}</span>
                            <span ng-hide='data.to_extension'>@{{ getNumberTitle(data.to_number) }}</span>
                        </td>
                        <td width='100'>
                            @{{ time(data.seconds) }}
                        </td>
                        <td width='50'>
                            @{{ disconnectReason(data) }}
                        </td>
                        <td width='100'>
                            <span class="link-like" ng-show='data.recording_id'>
                                <span class='link-like text-danger' ng-show='isPlaying(data.recording_id)' ng-click='stop(data.recording_id)'>остановить</span>
                                <span ng-hide='isPlaying(data.recording_id)' ng-click='play(data.recording_id)'>прослушать</span>
                            </span>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</div>
