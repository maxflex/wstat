@section('scripts')
<script src="//maps.google.ru/maps/api/js?key=AIzaSyAXXZZwXMG5yNxFHN7yR4GYJgSe9cKKl7o&libraries=places"></script>
<script src="{{ asset('/js/maps.js', isProduction()) }}"></script>
@endsection

<div class="modal" id='gmap-modal' tabindex="-1">
    <div class="modal-dialog" style="margin: 3% auto; width: 95%; height: 100%">
        <div class="modal-content" style="height: 90%">
            <div class="modal-body" style="height: 100%; padding: 0">
                <map zoom="10" disable-default-u-i="true" scale-control="true"
                    zoom-control="true" zoom-control-options="{style:'SMALL'}" style="height: 100%">
                    <transit-layer></transit-layer>
                    <custom-control position="TOP_RIGHT" index="1">
                    <div class="input-group gmap-search-control">
                      <input type="text" id="map-search" class="form-control" ng-keyup="gmapsSearch($event)" placeholder="Поиск...">
                      <span class="input-group-btn">
                        <button class="btn btn-default" ng-click="gmapsSearch($event)">
                        <span class="glyphicon glyphicon-search no-margin-right"></span>
                        </button>
                      </span>
                    </div>
                    </custom-control>
                </map>
                <button class="btn btn-default map-save-button" ng-click="saveMarkers()">Сохранить</button>
            </div>
        </div>
    </div>
</div>
