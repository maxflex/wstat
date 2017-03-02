<div class='comment-inside-input'>
    <span ng-click="startComment($event)"
        class="glyphicon glyphicon-pencil opacity-pointer" ng-hide="entity[commentField] || is_being_commented"></span>
    <input type="text" class='no-border-outline phone-comment' id='field-comment' maxlength="64" placeholder="комментарий..."
        ng-model='entity[commentField]'
        ng-show='entity[commentField] || is_being_commented'
        ng-blur="blurComment()"
        ng-focus="focusComment()"
        ng-keyup='endComment($event)'
    >
</div>
