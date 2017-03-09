<a class="list-group-item active">Операции</a>
<a v-on:click="runModal(addWords, 'добавить')" class="list-group-item">Добавить слова</a>
<a v-on:click="uniq()" class="list-group-item">Удалить дубликаты</a>
<a v-on:click="splitPhrasesToWords()" class="list-group-item">Разбить слова на фразы</a>
<a href="logout" class="list-group-item">Выход</a>
