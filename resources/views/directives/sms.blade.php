<!-- ЛАЙТБОКС ОТПРАВКА SMS -->
<div class="modal" id='sms-modal' tabindex="-1">
    <div class="modal-dialog lightbox-sms">
        <div class="modal-content">
            <div class="modal-body">
                <h4 class="center">@{{ number }}</h4>
            	<div class="row" style="margin-top: 8px">
            		<div class="col-sm-12" id="sms-history">
                        <div class="clear-sms" ng-repeat="sms in history">
                            <div class="from-them">
                                @{{ sms.message }}
                                <div class="sms-coordinates">
                                    @{{ sms.user_login }}
                                    @{{ $parent.$parent.formatDateTime(sms.created_at) }}
                                    @{{ sms.mass ? '(массовое)' : '' }}
    		                        <svg class="sms-status @{{ sms.id_status == 103 ? 'delivered' : ( sms.id_status == 102 ? 'inway' : 'not-delivered')}}">
                                        <circle r="3" cx="7" cy="7"></circle>
                                    </svg>
                                </div>
                            </div>
                        </div>
            		</div>
            	</div>
            	<div class="row">
            		<div class="col-sm-12" style="text-align: center">
            			<div class="form-group" style="position: relative; margin-bottom: 0">
            				<textarea rows="4" class="form-control" style="width: 100%" placeholder="Текст сообщения" ng-model="message"></textarea>
                			<span class="pull-right" id="sms-counter" style="position: absolute; right: 16px; bottom: 7px; color: #999; background: white; z-index: 9; border-radius: 5px">
                				@{{ smsCount() }} СМС
                			</span>
            			</div>

            			<div style="clear: both">
            				<button class="btn btn-primary" ng-click="send()" style="margin-bottom: 7px">Отправить</button>
            			</div>
            		</div>
            	</div>
            </div>
        </div>
    </div>
</div>
