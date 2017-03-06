<a class="list-group-item active">Основное
    <span class="search_icon" id="searchModalOpen"><span class="glyphicon glyphicon-search no-margin-right"></span></span>
</a>
<a ng-click="runModal(addWords, 'добавить')" class="list-group-item">Добавить слова</a>
<a ng-click='splitPhrasesToWords()' class="list-group-item" ng-class="{'disabled': !$root.list.phrases.length}">Разбить фразы на слова</a>
<a ng-click="runModal(replacePhrases, 'заменить')" class="list-group-item" ng-class="{'disabled': !$root.list.phrases.length}">Замена слов</a>
<a ng-click='uniq()' class="list-group-item" ng-class="{'disabled': !$root.list.phrases.length}">Удалить дубликаты</a>
<a ng-click='lowercase()' class="list-group-item" ng-class="{'disabled': !$root.list.phrases.length}">Превратить все буквы в маленькие</a>
{{-- <a ng-click='uniq()' class="list-group-item" ng-class="{'disabled': !$root.list.phrases.length}">Проставить частоты</a> --}}
<a ng-click='removeFrequencies()' class="list-group-item" ng-class="{'disabled': !$root.list.phrases.length}">Удалить частоты</a>
<a ng-click='getFrequencies()' class="list-group-item" ng-class="{'disabled': !$root.list.phrases.length}">Проставить частоты</a>
<a ng-click="removeStartingWith('-')" class="list-group-item" ng-class="{'disabled': !$root.list.phrases.length}">Удалить минус слова</a>
<a ng-click="runModal(deleteWordsInsidePhrase, 'удалить')" class="list-group-item" ng-class="{'disabled': !$root.list.phrases.length}">Удалить слова внутри фразы</a>
<a ng-click="runModal(deletePhrasesWithWords, 'удалить')" class="list-group-item" ng-class="{'disabled': !$root.list.phrases.length}">Удалить фразы, содержащие слова</a>
<a ng-click="removeStartingWith('+')" class="list-group-item" ng-class="{'disabled': !$root.list.phrases.length}">Удалить плюс слова</a>
<a ng-click="SmartSort.run($root.list)" class="list-group-item" ng-class="{'disabled': !$root.list.phrases.length}">Умная сортировка</a>
<a ng-click="configureMinus()" class="list-group-item" ng-class="{'disabled': !$root.list.phrases.length}">Конфигурация минус-слов</a>
<a ng-click="transform()" class="list-group-item" ng-class="{'disabled': !$root.list.phrases.length}">Трансформировать</a>
<a ng-click="ExportService.export()" class="list-group-item" ng-class="{'disabled': !$root.list.phrases.length}">Экспорт</a>
{{-- <a ng-click="ExportService.import($event)" class="list-group-item">Импорт</a> --}}
<a ng-click="save()" class="list-group-item" ng-class="{'disabled': !$root.list.id}">Сохранить</a>
<a onclick="showModal('save-as')" class="list-group-item" ng-class="{'disabled': !$root.list.phrases.length}">Сохранить как...</a>
<a href='/#lists' class="list-group-item">Открыть список</a>
<a href="logout" class="list-group-item">Выход</a>
