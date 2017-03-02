<div class="modal modal-fullscreen" id='svg-modal' tabindex="-1">
    <div class="modal-dialog" style="margin: 3% auto; width: 70%">
        <div class="modal-content">
            <div class="modal-body">
                <div class="row">
                    <div class="col-sm-9">
                        <iframe src="svg/map.svg" frameborder="0" marginwidth="0" marginheight="0" data-width="700" id="map"
                            scrolling="no" style="height: 668px; width: 700px; overflow: hidden"></iframe>
                    </div>
                    <div class="col-sm-3 center">
                        {{-- <button class="btn btn-primary" ng-click="scopeApply()">Сохранить</button> --}}
                        <div id="metromap">
                            <div class="legend">
                                <div style="text-align:center"><a data-rel="0">Вся Москва</a></div>
                                <a data-rel="1" class="marker big center" style="top:65px;left:82px;"></a>
                                <a data-rel="6" class="marker apl" style="top:90px;left:40px;"></a>
                                <a data-rel="7" class="marker apl" style="top:50px;left:137px;"></a>
                                <a data-rel="8" class="marker fl" style="top:70px;left:38px;"></a>
                                <a data-rel="11" class="marker tkl" style="top:50px;left:44px;"></a>
                                <a data-rel="12" class="marker tkl" style="top:90px;left:143px;"></a>
                                <a data-rel="4" class="marker zl" style="top:33px;left:60px;"></a>
                                <a data-rel="5" class="marker zl" style="top:122px;left:115px;"></a>
                                <a data-rel="14" class="marker stl" style="top:25px;left:82px;"></a>
                                <a data-rel="15" class="marker stl" style="top:126px;left:92px;"></a>
                                <a data-rel="9" class="marker krl" style="top:26px;left:105px;"></a>
                                <a data-rel="10" class="marker krl" style="top:122px;left:69px;"></a>
                                <a data-rel="2" class="marker sl" style="top:35px;left:125px;"></a>
                                <a data-rel="3" class="marker sl" style="top:108px;left:52px;"></a>
                                <a data-rel="13" class="marker kl" style="top:70px;left:145px;"></a>
                                <a data-rel="16" class="marker ll" style="top:108px;left:135px;"></a>
                            </div>
                        </div>

                        <button class="btn btn-default" ng-click="svgSave()">сохранить</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
