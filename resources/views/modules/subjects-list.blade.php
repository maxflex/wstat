<span ng-init="type = '{{ $type }}'"></span>
<span ng-repeat='subject_id in {{ $subjects }}'>@{{ Subjects[type][subject_id] }}@{{ $last ? '' : '+' }}</span>
