<template>
  <q-page class="page">
    <div class="project-row row justify-center">
      <div class="project-row__form col-6">
        <q-form class="project-create col-md-12 col-lg-6" @submit.prevent="addToProjectList">
          <div class="area">
            <div class="title">Мета Проект</div>
            <div class="create-form q-pa-lg row">
              <div class="form-item col-4">
                <q-input class="input" outlined v-model="form.project" label="Проект" />
              </div>
              <div class="form-item col-4">
                <q-input class="input" outlined v-model="form.name" label="Имя (СММ)" />
              </div>
              <div class="project-create-form__item col-4">
                <q-input
                  class="input"
                  filled
                  v-model="form.phone"
                  label="Телефон"
                  mask="998 (##) ### - ## - ##"
                  fill-mask
                />
              </div>
              <div class="form-item col-12 flex justify-end">
                <q-btn
                  label="Создать проект"
                  class="input self-end submit-btn__project-create"
                  type="submit"
                  color="grey-8"
                />
              </div>
            </div>
          </div>
        </q-form>
      </div>
      <div class="project-row__list col-6">
        <div class="area">
          <div class="q-pa-md">
            <div class="title">
              Список проектов
            </div>
            <q-markup-table>
              <thead>
                <tr>
                  <th v-for="col in projectColumns" :key="col.index" class="text-left">
                    {{ col.label }}
                  </th>
                  <th class="text-left"> Действие </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in projectRows" :key="row.index">
                  <td class="text-left">{{row.index}}</td>
                  <td class="text-left">{{row.project}}</td>
                  <td class="text-left">{{row.name}}</td>
                  <td class="text-left">{{row.phone}}</td>
                  <td class="text-left">
                    <q-btn flat round color="red" icon="delete"/>
                    <q-btn flat round color="primary" icon="edit"/>
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>
        </div>
      </div>
    </div>
    <div class="content-row row">
      <div class="content-row__form col-6">
        <q-form class="content-plan-create col-md-12 col-lg-6" @submit.prevent="addToContentList">
          <div class="area">
            <div class="title">Создать контент план</div>
            <div class="create-form q-pa-lg row">
              <div class="form-item col-4">
                <q-input class="input" outlined v-model="contentPlanForm.post" label="Пост" />
              </div>
              <div class="form-item col-4">
                <q-select
                  class="input"
                  outlined
                  v-model="contentPlanForm.format"
                  :options="options"
                  label="Формат"
                />
              </div>
              <div class="project-create-form__item col-4">
                <q-input
                  type="date"
                  class="input"
                  outlined
                  v-model="contentPlanForm.date"
                  label="Дата"
                />
              </div>
              <div class="form-item col-6">
                <q-input
                  class="input"
                  autogrow
                  outlined
                  v-model="contentPlanForm.idea"
                  label="Идея"
                />
              </div>
              <div class="form-item col-6 flex justify-end">
                <q-btn
                  label="Добавить контент"
                  class="input self-end submit-btn"
                  type="submit"
                  color="grey-8"
                />
              </div>
            </div>
          </div>
        </q-form>
      </div>
      <div class="content-row__list col-6">
        <div class="area">
          <div class="q-pa-md">
            <div class="title">
              Список контент планов
            </div>
            <q-markup-table>
              <thead>
              <tr>
                <th v-for="col in columns" :key="col.index" class="text-left">
                  {{ col.label }}
                </th>
                <th class="text-left"> Действие </th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="row in rows" :key="row.index">
                <td class="text-left">{{row.index}}</td>
                <td class="text-left">{{row.post}}</td>
                <td class="text-left">{{row.format}}</td>
                <td class="text-left">{{row.idea}}</td>
                <td class="text-left">{{row.date}}</td>
                <td class="text-left">
                  <q-btn flat round color="red" icon="delete"/>
                  <q-btn flat round color="primary" icon="edit"/>
                </td>
              </tr>
              </tbody>
            </q-markup-table>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  name: '',
  phone: '',
  project: '',
  index: 1,
})

const projectRows = ref([])

const contentPlanForm = ref({
  post: '',
  format: '',
  idea: '',
  date: '',
  index: 1,
})

const options = ref(['Reels', 'Carousel', 'Post', 'Animation', 'Story'])

const columns = [
  { name: 'index', label: '#', field: 'index' },
  {
    name: 'post',
    required: true,
    label: 'Пост',
    align: 'left',
    field: (row) => row.post,
    format: (val) => `${val}`,
  },
  { name: 'format', align: 'center', label: 'Формат', field: 'format' },
  { name: 'idea', label: 'Идея', field: 'idea', align: 'left' },
  { name: 'date', label: 'Дата', field: 'date', align: 'left' },
]

const projectColumns = [
  { index: 'index', align: 'left', label: '#', field: 'index' },
  { project: 'project', align: 'left', label: 'Проект', field: 'project' },
  { name: 'name', align: 'left', label: 'Имя (СММ)', field: 'name' },
  { phone: 'phone', align: 'left', label: 'Телефон', field: 'phone' },
]

const rows = ref([])
function addToContentList() {
  const newRow = {
    post: contentPlanForm.value.post,
    format: contentPlanForm.value.format,
    idea: contentPlanForm.value.idea,
    date: contentPlanForm.value.date,
    index: rows.value.length + 1,
  }
  rows.value.push(newRow)
  contentPlanForm.value = {
    post: '',
    format: '',
    idea: '',
    date: '',
  }
}
function addToProjectList() {
  const newRow = {
    name: form.value.name,
    phone: form.value.phone,
    project: form.value.project,
    index: projectRows.value.length + 1,
  }
  projectRows.value.push(newRow)
  form.value = {
    name: '',
    phone: '',
    project: '',
  }
}
</script>

<style scoped lang="scss">
.area {
  background-color: #f2f2f2;
  border-radius: 10px;
  margin: 10px 0 10px 0;
}
.title {
  font-size: 25px;
  text-align: center;
  padding: 10px 0;
}
.project-create {
  padding: 10px;
  &__submit-btn {
    width: 100%;
  }
}
.content-plan-create {
  padding: 10px;
}
.input {
  margin: 10px;
}
.submit-btn {
  width: 70%;
}
.page {
  width: 1400px;
  margin: auto;
}
.content-row {
  padding: 10px;
}
.project-row__list,
.content-row__list {
  padding: 10px;
}
.submit-btn__project-create {
  width: 30%;
}
</style>
