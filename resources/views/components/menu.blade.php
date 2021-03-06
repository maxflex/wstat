<a class="list-group-item active">Операции</a>
<a @click="runModal(addWords, 'добавить')" class="list-group-item">Добавить слова</a>
<a @click="addFromWordstatModal" class="list-group-item">Добавить из WordStat</a>
<a @click="runModal(addMinuses, 'добавить')" class="list-group-item" :class="{'disabled': !list.phrases.length}">Добавить минус слова</a>
<a onclick="showModal('add-to-all')" class="list-group-item" :class="{'disabled': !list.phrases.length}">Добавить ко всем</a>
<a @click="splitPhrasesToWords()" class="list-group-item" :class="{'disabled': !list.phrases.length}">Разбить фразы на слова</a>
<a onclick="showModal('replace')" class="list-group-item" :class="{'disabled': !list.phrases.length}">Поиск и замена</a>
<a @click='lowercase()' class="list-group-item" :class="{'disabled': !list.phrases.length}">Превратить все буквы в маленькие</a>
<a @click="sortModal()" class="list-group-item" :class="{disabled: !list.phrases.length}">Умная сортировка</a>
<a @click="configureMinus()" class="list-group-item" :class="{'disabled': !list.phrases.length}">Конфигурирование минусов</a>
<a @click="transformModal()" class="list-group-item" :class="{'disabled': !$root.list.phrases.length}">Трансформировать</a>
<a @click="runModal(mixer, 'применить')" class="list-group-item" :class="{'disabled': !$root.list.phrases.length}">Миксер</a>

<a class="list-group-item active">Удаление</a>
<a @click="removeDuplicates()" class="list-group-item" :class="{'disabled': !list.phrases.length}">Удалить дубликаты</a>
<a @click="removeFrequencies()" class="list-group-item" :class="{'disabled': !list.phrases.length}">Удалить частоты</a>
<a @click="removeMinuses()" class="list-group-item" :class="{'disabled': !list.phrases.length}">Удалить минус слова</a>
<a @click="removePluses()" class="list-group-item" :class="{'disabled': !list.phrases.length}">Удалить плюс слова</a>
<a @click="runModal(deleteWordsInsidePhrase, 'удалить')" class="list-group-item" :class="{'disabled': !list.phrases.length}">Удалить слова внутри фразы</a>
<a @click="runModal(deletePhrasesWithWords, 'удалить')" class="list-group-item" :class="{'disabled': !list.phrases.length}">Удалить фразы, содержащие слова</a>

<a class="list-group-item active">Проставить частоты</a>
<a @click='getFrequencies(213)' class="list-group-item" :class="{'disabled': !list.phrases.length}">Москва</a>
<a @click='getFrequencies(1)' class="list-group-item" :class="{'disabled': !list.phrases.length}">Московская область</a>

<a class="list-group-item active">Список</a>
<a @click="clear()" class="list-group-item" :class="{'disabled': !list.phrases.length}">Очистить</a>
<a class="list-group-item" :class="{'disabled': !list.phrases.length}">
    <span class="link-like" @click="exportXls()">Экспорт</span>
    <span class="bar-separator">|</span>
    <span class="link-like" id='copy-to-clipboard'>Скопировать</span>
</a>
<a @click="save()" class="list-group-item" :class="{'disabled': !list.id}">Сохранить</a>
<a onclick="showModal('save-as')" class="list-group-item" :class="{'disabled': !list.phrases.length}">Сохранить как...</a>
<a @click="page = 'open'" class="list-group-item">Открыть</a>

<a class="list-group-item active">Административное</a>
<a href="logout" class="list-group-item">Выход</a>
