<template>
  <q-page class="page">
    <div class="row justify-center">
      <div class="project-row row justify-center col-10">
        <!-- ======= ФОРМА ПРОЕКТА ======= -->
        <div class="project-row__form col-xs-12 col-lg-6">
          <q-form class="project-create col-md-12 col-lg-6" @submit.prevent="editingProject ? saveEditedProject() : addToProjectList()">
            <div class="area">
              <div class="title">{{ editingProject ? 'Редактировать проект' : 'Создать проект' }}</div>
              <div class="create-form q-pa-lg row">
                <div class="form-item col-xs-12 col-sm-6 col-md-4 col-lg-4">
                  <q-input class="input" outlined v-model="form.project" label="Проект" />
                </div>
                <div class="form-item col-xs-12 col-sm-6 col-md-4 col-lg-4">
                  <q-input class="input" outlined v-model="form.name" label="Имя (СММ)" />
                </div>
                <div class="form-item col-xs-12 col-sm-6 col-md-4 col-lg-4">
                  <q-input
                    class="input"
                    filled
                    v-model="form.phone"
                    label="Телефон"
                    mask="998 (##) ### - ## - ##"
                    fill-mask
                  />
                </div>
                <div class="form-item col-xs-12 col-sm-6 col-md-12 col-lg-12 flex justify-end">
                  <q-btn
                    :label="editingProject ? 'Сохранить' : 'Создать проект'"
                    class="input self-end submit-btn__project-create"
                    type="submit"
                    color="grey-8"
                  />
                </div>
              </div>
            </div>
          </q-form>
        </div>

        <!-- ======= СПИСОК ПРОЕКТОВ ======= -->
        <div class="project-row__list col-xs-12 col-lg-6">
          <div class="area">
            <div class="q-pa-md">
              <div class="title">Список проектов</div>
              <q-markup-table>
                <thead>
                <tr>
                  <th v-for="col in projectColumns" :key="col.index" class="text-left">{{ col.label }}</th>
                  <th class="text-left">Действие</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="row in projectRows" :key="row.id" :class="{'selected-row': row.id === selectedProjectId}">
                  <td class="text-left">{{ row.index }}</td>
                  <td class="text-left">{{ row.project }}</td>
                  <td class="text-left">{{ row.name }}</td>
                  <td class="text-left">{{ row.phone }}</td>
                  <td class="text-left">
                    <q-btn flat round color="green" icon="visibility" @click="selectProject(row.id)" />
                    <q-btn flat round color="primary" icon="edit" @click="editProject(row)" />
                    <q-btn flat round color="red" icon="delete" @click="deleteProject(row.id)" />
                  </td>
                </tr>
                </tbody>
              </q-markup-table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row justify-center">
      <!-- ======= КОНТЕНТ ПЛАН ======= -->
      <div class="content-row row col-10">
        <div class="content-row__form  col-xs-12 col-lg-6">
          <q-form class="content-plan-create col-md-12 col-lg-6" @submit.prevent="editingContent ? saveEditedContentPlan() : addToContentList()">
            <div class="area">
              <div class="title">{{ editingContent ? 'Редактировать контент план' : 'Создать контент план' }}</div>
              <div class="create-form q-pa-lg row">
                <div class="form-item col-xs-12 col-sm-6 col-md-6 col-lg-4">
                  <q-input class="input" outlined v-model="contentPlanForm.post" label="Пост" />
                </div>
                <div class="form-item col-xs-12 col-sm-6 col-md-6 col-lg-4">
                  <q-select
                    class="input"
                    outlined
                    v-model="contentPlanForm.format"
                    :options="options"
                    label="Формат"
                  />
                </div>
                <div class="form-item col-xs-12 col-sm-6 col-md-6 col-lg-4">
                  <q-input
                    type="date"
                    class="input"
                    outlined
                    v-model="contentPlanForm.date"
                    label="Дата"
                  />
                </div>
                <div class="form-item col-xs-12 col-sm-6 col-md-6 col-lg-4">
                  <q-input
                    class="input"
                    autogrow
                    outlined
                    v-model="contentPlanForm.idea"
                    label="Идея"
                  />
                </div>
                <div class="form-item col-xs-12 col-sm-12 col-md-12 col-lg-8 flex justify-end">
                  <q-btn
                    :label="editingContent ? 'Сохранить' : 'Добавить контент'"
                    class="input self-end submit-btn"
                    type="submit"
                    color="grey-8"
                  />
                </div>
              </div>
            </div>
          </q-form>
        </div>

        <!-- ======= СПИСОК КОНТЕНТ ПЛАНОВ ======= -->
        <div class="content-row__list col-xs-12 col-lg-6">
          <div class="area">
            <div class="q-pa-md">
              <div class="title row justify-between items-center">
                <div>Список контент планов</div>
                <q-btn
                  flat
                  round
                  color="black"
                  icon="picture_as_pdf"
                  v-if="selectedProjectId && filteredContentPlans.length > 0"
                  @click="printPage"
                />
              </div>
              <q-markup-table>
                <thead>
                <tr>
                  <th v-for="col in columns" :key="col.index" class="text-left">{{ col.label }}</th>
                  <th class="text-left">Действие</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="row in filteredContentPlans" :key="row.id">
                  <td class="text-left">{{ row.index }}</td>
                  <td class="text-left">{{ row.post }}</td>
                  <td class="text-left">{{ row.format }}</td>
                  <td class="text-left">{{ row.idea }}</td>
                  <td class="text-left">{{ row.date }}</td>
                  <td class="text-left">
                    <q-btn flat round color="primary" icon="edit" @click="editContentPlan(row)" />
                    <q-btn flat round color="red" icon="delete" @click="deleteContentPlan(row.id)" />
                  </td>
                </tr>
                </tbody>
              </q-markup-table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// 👇 ОБЯЗАТЕЛЬНО: импорт файла шрифта, сгенерированного fontconverter’ом jsPDF
// Помести Roboto-Regular-normal.js в src/fonts и проверь путь:
import './Roboto-Regular-normal.js'

// ====== ТВОЙ СУЩЕСТВУЮЩИЙ КОД СОСТОЯНИЙ/МЕТОДОВ (без изменений) ======
const form = ref({ name: '', phone: '', project: '' })
const projectRows = ref([])
const selectedProjectId = ref(null)
const editingProject = ref(null)
const projectColumns = [
  { index: 'index', label: '#', field: 'index' },
  { project: 'project', label: 'Проект', field: 'project' },
  { name: 'name', label: 'Имя (СММ)', field: 'name' },
  { phone: 'phone', label: 'Телефон', field: 'phone' },
]
function addToProjectList() {
  const newRow = { id: Date.now(), name: form.value.name, phone: form.value.phone, project: form.value.project, index: projectRows.value.length + 1 }
  projectRows.value.push(newRow)
  saveProjectsToStorage()
  form.value = { name: '', phone: '', project: '' }
}
function selectProject(id) { selectedProjectId.value = id }
function editProject(project) { editingProject.value = project; form.value = { name: project.name, phone: project.phone, project: project.project } }
function saveEditedProject() {
  const idx = projectRows.value.findIndex(p => p.id === editingProject.value.id)
  if (idx !== -1) {
    projectRows.value[idx] = { ...editingProject.value, ...form.value }
    saveProjectsToStorage()
    editingProject.value = null
    form.value = { name: '', phone: '', project: '' }
  }
}
function deleteProject(id) {
  projectRows.value = projectRows.value.filter(p => p.id !== id)
  rows.value = rows.value.filter(r => r.projectId !== id)
  saveProjectsToStorage()
  saveContentToStorage()
  if (selectedProjectId.value === id) selectedProjectId.value = null
}
const selectedProject = computed(() => projectRows.value.find(p => p.id === selectedProjectId.value) || null)

const contentPlanForm = ref({ post: '', format: '', idea: '', date: '' })
const rows = ref([])
const editingContent = ref(null)
const options = ref(['Reels', 'Carousel', 'Post', 'Animation', 'Story'])
const columns = [
  { name: 'index', label: '#', field: 'index' },
  { name: 'post', label: 'Пост', field: 'post' },
  { name: 'format', label: 'Формат', field: 'format' },
  { name: 'idea', label: 'Идея', field: 'idea' },
  { name: 'date', label: 'Дата', field: 'date' },
]
function addToContentList() {
  if (!selectedProjectId.value) { alert('Выберите проект!'); return }
  const newRow = { id: Date.now(), projectId: selectedProjectId.value, post: contentPlanForm.value.post, format: contentPlanForm.value.format, idea: contentPlanForm.value.idea, date: contentPlanForm.value.date, index: filteredContentPlans.value.length + 1 }
  rows.value.push(newRow)
  saveContentToStorage()
  contentPlanForm.value = { post: '', format: '', idea: '', date: '' }
}
function editContentPlan(plan) { editingContent.value = plan; contentPlanForm.value = { post: plan.post, format: plan.format, idea: plan.idea, date: plan.date } }
function saveEditedContentPlan() {
  const idx = rows.value.findIndex(p => p.id === editingContent.value.id)
  if (idx !== -1) {
    rows.value[idx] = { ...editingContent.value, ...contentPlanForm.value }
    saveContentToStorage()
    editingContent.value = null
    contentPlanForm.value = { post: '', format: '', idea: '', date: '' }
  }
}
function deleteContentPlan(id) { rows.value = rows.value.filter(r => r.id !== id); saveContentToStorage() }
const filteredContentPlans = computed(() => rows.value.filter(r => r.projectId === selectedProjectId.value))

function saveProjectsToStorage() { localStorage.setItem('projects', JSON.stringify(projectRows.value)) }
function saveContentToStorage() { localStorage.setItem('contentPlans', JSON.stringify(rows.value)) }
function loadDataFromStorage() {
  const savedProjects = localStorage.getItem('projects')
  const savedContent = localStorage.getItem('contentPlans')
  if (savedProjects) projectRows.value = JSON.parse(savedProjects)
  if (savedContent) rows.value = JSON.parse(savedContent)
}
onMounted(() => loadDataFromStorage())

// ====== ВОТ ЭТА ФУНКЦИЯ ИСПРАВЛЯЕТ ЗАГОЛОВКИ (кириллица в head) ======
function printPage() {
  if (!selectedProject.value) return

  const doc = new jsPDF()

  // Имя шрифта должно совпадать с addFont(...) внутри Roboto-Regular-normal.js
  const FONT = 'Roboto-Regular' // чаще всего именно так называется после конвертации

  // Устанавливаем шрифт для документа
  doc.setFont(FONT, 'normal')

  // Заголовок
  doc.setFontSize(18)
  doc.text(selectedProject.value.project || 'Без названия', 14, 20)

  doc.setFontSize(12)
  doc.text(`Имя (СММ): ${selectedProject.value.name || ''}`, 14, 30)
  doc.text(`Телефон: ${selectedProject.value.phone || ''}`, 14, 38)

  // Заголовки и тело таблицы
  const head = [['#', 'Post', 'Format', 'Idea', 'Date']]
  const body = filteredContentPlans.value.map(item => [
    item.index,
    item.post || '',
    item.format || '',
    item.idea || '',
    item.date || ''
  ])

  autoTable(doc, {
    head,
    body,
    startY: 50,
    theme: 'grid',
    // Базовые стили для ВСЕХ ячеек
    styles: {
      font: FONT,
      fontSize: 10,
      cellPadding: 3,
    },
    // Стили заголовка (на всякий случай тоже задаём)
    headStyles: {
      font: FONT,
      fontStyle: 'bold',
      fontSize: 10,
      fillColor: [33, 150, 243],
      textColor: 255,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 40 },
      2: { cellWidth: 30 },
      3: { cellWidth: 80 },
      4: { cellWidth: 30 },
    },
    // 🛠 КРИТИЧЕСКО: насильно проставляем шрифт для head,
    // т.к. у некоторых версий автотаблицы он может игнорироваться
    didParseCell: (data) => {
      data.cell.styles.font = FONT
    }
  })

  // Подвал
  const pageHeight = doc.internal.pageSize.getHeight()
  doc.setFontSize(10)
  doc.text('KH Marketing Agency — контент-план', 14, pageHeight - 10)

  // Сохранение
  doc.save(`${selectedProject.value.project || 'project'}_content_plan.pdf`)
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
}
.content-plan-create {
  padding: 10px;
}
.input {
  margin: 10px;
}
.submit-btn {
  //width: 70%;
}
.page {
  //width: 1400px;
  //margin: auto;
}
.content-row {
  padding: 10px;
}
.project-row__list,
.content-row__list {
  padding: 10px;
}
.submit-btn__project-create {
  //width: 30%;
}
.selected-row {
  background-color: #d0f0d0 !important;
}
</style>
