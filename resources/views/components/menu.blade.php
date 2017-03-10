<a class="list-group-item active">Операции</a>
<a v-on:click="runModal(addWords, 'добавить')" class="list-group-item">Добавить слова</a>
<a v-on:click="uniq()" class="list-group-item">Удалить дубликаты</a>
<a v-on:click="splitPhrasesToWords()" class="list-group-item">Разбить слова на фразы</a>
<a v-on:click="sort()" class="list-group-item" :class="{disabled: !list.phrases.length}">Умная сортировка</a>

<a class="list-group-item active">Удаление</a>
<a v-on:click="removeFrequencies()" class="list-group-item" :class="{'disabled': !list.phrases.length}">Удалить частоты</a>
<a v-on:click="removeMinuses()" class="list-group-item" :class="{'disabled': !list.phrases.length}">Удалить минус слова</a>
<a v-on:click="removePluses()" class="list-group-item" :class="{'disabled': !list.phrases.length}">Удалить плюс слова</a>
<a v-on:click="runModal(deleteWordsInsidePhrase, 'удалить')" class="list-group-item" :class="{'disabled': !list.phrases.length}">Удалить слова внутри фразы</a>
<a v-on:click="runModal(deletePhrasesWithWords, 'удалить')" class="list-group-item" :class="{'disabled': !list.phrases.length}">Удалить фразы, содержащие слова</a>

<a href="logout" class="list-group-item">Выход</a>