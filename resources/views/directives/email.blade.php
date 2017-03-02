<div class="input-group">
    <input type="text" class="form-control" ng-model="entity.email" placeholder="email">

    <input-comment entity='entity' comment-field='email_comment'></input-comment>

    <div class="input-group-btn">
        <button class="btn btn-default" ng-click="send()">
            <span class="glyphicon small glyphicon-envelope no-margin-right"></span>
        </button>
    </div>
</div>
