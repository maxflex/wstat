@extends('app')
@section('title', 'Редактирование переменной')
@section('title-center')
    <span ng-click="FormService.edit()">сохранить</span>
@stop
@section('title-right')
    <span ng-click="FormService.delete($event)">удалить переменную</a>
@stop
@section('content')
@section('controller', 'VariablesForm')
<div class="row">
    <div class="col-sm-12">
        @include('variables._form')
    </div>
</div>
@stop
