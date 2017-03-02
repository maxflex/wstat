<div class="top-links pull-right">
    <span ng-repeat='option in options' class="link-like"
        ng-class="{'active': $index == sort}" ng-click='setSort($index)'>@{{ option }}</span>
</div>
