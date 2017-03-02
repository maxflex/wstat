@extends('app')
@section('controller', 'VariablesForm')
@section('title', 'Добавление переменной')
@section('content')
<div class="row">
    <div class="col-sm-12">
        @include('variables._form')
        @include('modules.create_button')
    </div>
</div>
@stop
