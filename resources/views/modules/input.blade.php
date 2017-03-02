<div class="field-container">
  <{{ isset($textarea) ? "textarea rows=4" : 'input' }} type="text" class="field form-control" required placeholder="{{ $title }}" ng-model='FormService.model.{{ $model }}' ng-model-options="{ allowInvalid: true }"
    @if(isset($keyup))
        ng-keyup='{{ $keyup }}'
    @endif
    @if(isset($attributes))
        @foreach($attributes as $key => $attr)
            {{ $key }}@if($attr !== true){{ '=' . $attr }}@endif
        @endforeach
    @endif
  >@if(isset($textarea))</textarea>@endif
  <label class="floating-label">{{ $title }}</label>
</div>
