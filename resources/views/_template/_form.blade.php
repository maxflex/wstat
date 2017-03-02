<div class="row mb">
    <div class="col-sm-6">
        @include('modules.input', ['title' => 'название переменной', 'model' => 'name'])
    </div>
    <div class="col-sm-6">
        @include('modules.input', ['title' => 'краткое описание переменной', 'model' => 'desc'])
    </div>
</div>
<div class="row mb">
    <div class="col-sm-12">
        <label class="label-opacity">содержание переменной</label>
        <div id='editor' style="height: 500px">@{{ FormService.model.html }}</div>
    </div>
</div>
