<span class="link-like"
    ng-click="UserService.toggle(entity, userId, resource)"
    style='color: @{{ UserService.getColor(entity[userId]) }}'
>
    @{{ UserService.getLogin(entity[userId]) }}
</span>
