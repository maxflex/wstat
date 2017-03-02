<pagination class='ng-hide' style="margin-top: 30px"
    ng-hide='IndexService.page.last_page <= 1'
    ng-model="IndexService.current_page"
    ng-change="IndexService.pageChanged()"
    total-items="IndexService.page.total"
    max-size="IndexService.max_size"
    items-per-page="IndexService.page.per_page"
    first-text="«"
    last-text="»"
    previous-text="«"
    next-text="»"
></pagination>
