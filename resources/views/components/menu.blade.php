<a class="list-group-item active">Операции</a>
<a @click="runModal(addWords, 'добавить')" class="list-group-item">Добавить слова</a>
<a @click="runModal(addMinuses, 'добавить')" class="list-group-item" :class="{'disabled': !list.phrases.length}">Добавить минус слова</a>
<a @click="splitPhrasesToWords()" class="list-group-item" :class="{'disabled': !list.phrases.length}">Разбить фразы на слова</a>
<a onclick="showModal('replace')" class="list-group-item" :class="{'disabled': !list.phrases.length}">Поиск и замена</a>
<a @click='lowercase()' class="list-group-item" :class="{'disabled': !list.phrases.length}">Превратить все буквы в маленькие</a>
<a @click='getFrequencies()' class="list-group-item" :class="{'disabled': !list.phrases.length}">Проставить частоты</a>
<a @click="configureMinus()" class="list-group-item" :class="{'disabled': !list.phrases.length}">Конфигурирование минусов</a>
<a @click="transformModal()" class="list-group-item" :class="{'disabled': !$root.list.phrases.length}">Трансформировать</a>
<a @click="uniq()" class="list-group-item">Удалить дубликаты</a>

<a class="list-group-item active">Список</a>
<a @click="downloadCSV()" class="list-group-item" :class="{'disabled': !list.phrases.length}">Экспорт</a>

<a class="list-group-item active">Административное</a>
<a href="logout" class="list-group-item">Выход</a>
