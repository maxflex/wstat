<span>
    <span ng-click="startComment($event)" style="height: 16px"
        class="glyphicon glyphicon-pencil opacity-pointer" ng-hide="model || is_being_commented"></span>
    <div contenteditable style="display: inline-block; max-width: 700px"
        ng-show='model || is_being_commented'
        ng-blur="blurComment()"
        ng-focus="focusComment()"
        ng-keydown='watchEnter($event)'
        ng-keyup='updateModel($event)'
    >@{{ model }}</div>
</span>
