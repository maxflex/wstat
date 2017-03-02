<span ng-hide='hideZero && !count' ng-if="!noneText || count || withoutDigit"><span ng-if='!textOnly'>@{{ count }}</span> <ng-pluralize count="count" when="{
        'one': when[type][0],
        'few': when[type][1],
        'many': when[type][2]
    }"></ng-pluralize></span><span ng-hide='hideZero' ng-if='noneText && !count'>@{{ noneText }}</span>
