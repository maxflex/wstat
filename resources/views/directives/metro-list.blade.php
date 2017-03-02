<span ng-init='transport_distance = {{ App\Models\Metro::TRANSPORT_DISTANCE }}'></span>
<div ng-repeat='marker in markers' style="display: @{{ inline ? 'inline-block' : 'block' }}" ng-init="stations = one_station ? [marker.metros[0]] : marker.metros">
    <span ng-repeat='metro in stations'>
        <span class="label label-metro-short"
            style="background: @{{ metro.station.color }}; margin-right: 3px">
            @{{ short(metro.station.title) }}
            @{{ minutes(metro.minutes) }}@{{ metro.meters > transport_distance ? 'т' : 'п' }}
        </span>
    </span>
    <span ng-hide='inline'>
         –
        <span ng-if="marker.type == 'green'">тут занятия возможны</span>
        <span ng-if="marker.type == 'red'">тут занятия не возможны</span>
        <span ng-if="marker.type == 'blue'">голубая метка</span>
    </span>
</div>
