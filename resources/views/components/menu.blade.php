<a class="list-group-item active">Операции</a>
<a @click="runModal(addWords, 'добавить')" class="list-group-item">Добавить слова</a>
<a @click="runModal(addMinuses, 'добавить')" class="list-group-item" :class="{'disabled': !list.phrases.length}">Добавить минус слова</a>
<a @click="addToAll()" class="list-group-item" :class="{'disabled': !list.phrases.length}">Добавить ко всем</a>
<a @click="splitPhrasesToWords()" class="list-group-item" :class="{'disabled': !list.phrases.length}">Разбить фразы на слова</a>
<a onclick="showModal('replace')" class="list-group-item" :class="{'disabled': !list.phrases.length}">Поиск и замена</a>
<a @click='lowercase()' class="list-group-item" :class="{'disabled': !list.phrases.length}">Превратить все буквы в маленькие</a>
<a @click='getFrequencies()' class="list-group-item" :class="{'disabled': !list.phrases.length}">Проставить частоты</a>
<a @click="sort()" class="list-group-item" :class="{disabled: !list.phrases.length}">Умная сортировка</a>
<a @click="configureMinus()" class="list-group-item" :class="{'disabled': !list.phrases.length}">Конфигурирование минусов</a>
<a @click="transformModal()" class="list-group-item" :class="{'disabled': !$root.list.phrases.length}">Трансформировать</a>

<a class="list-group-item active">Удаление</a>
<a @click="uniq()" class="list-group-item" :class="{'disabled': !list.phrases.length}">Удалить дубликаты</a>
<a @click="removeFrequencies()" class="list-group-item" :class="{'disabled': !list.phrases.length}">Удалить частоты</a>
<a @click="removeMinuses()" class="list-group-item" :class="{'disabled': !list.phrases.length}">Удалить минус слова</a>
<a @click="removePluses()" class="list-group-item" :class="{'disabled': !list.phrases.length}">Удалить плюс слова</a>
<a @click="runModal(deleteWordsInsidePhrase, 'удалить')" class="list-group-item" :class="{'disabled': !list.phrases.length}">Удалить слова внутри фразы</a>
<a @click="runModal(deletePhrasesWithWords, 'удалить')" class="list-group-item" :class="{'disabled': !list.phrases.length}">Удалить фразы, содержащие слова</a>

<a class="list-group-item active">Список</a>
<a @click="clear()" class="list-group-item" :class="{'disabled': !list.phrases.length}">Очистить</a>
<a @click="exportXls()" class="list-group-item" :class="{'disabled': !list.phrases.length}">Экспорт</a>
<a @click="save()" class="list-group-item" :class="{'disabled': !list.id}">Сохранить</a>
<a onclick="showModal('save-as')" class="list-group-item" :class="{'disabled': !list.phrases.length}">Сохранить как...</a>
<a @click="page = 'open'" class="list-group-item">Открыть</a>

<a class="list-group-item active">Административное</a>
<a href="logout" class="list-group-item">Выход</a>
