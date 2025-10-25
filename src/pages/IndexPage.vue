<template>
  <q-page class="page">
    <div class="row justify-center">
      <div class="project-row row justify-center col-xs-12 col-md-10">
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
      <div class="content-row row col-xs-12 col-md-10">
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
                  <td class="text-left" style="max-width: 260px; word-break: break-word; white-space: normal !important;">{{ row.idea }}</td>
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
import 'svg2pdf.js'
import './Roboto-Regular-normal.js'
import './Roboto-Bold-normal.js'
import { useUserStore } from 'stores/user.js'
// Фон и логотип как raw-SVG (никаких fetch)
import bgSvgRaw from '../assets/asset7.svg?raw'
import logoSvgRaw from '../assets/logo.svg?raw'

// ====== состояние/методы ======
const form = ref({ name: '', phone: '', project: '' })
const projectRows = ref([])
const selectedProjectId = ref(null)
const editingProject = ref(null)
const user = useUserStore();
const projectColumns = [
  { index: 'index', label: '#', field: 'index' },
  { project: 'project', label: 'Проект', field: 'project' },
  { name: 'name', label: 'Имя (СММ)', field: 'name' },
  { phone: 'phone', label: 'Телефон', field: 'phone' },
]
function addToProjectList() {
  user.fetchUser()
  const newRow = {
    id: Date.now(),
    name: form.value.name,
    phone: form.value.phone,
    project: form.value.project,
    index: projectRows.value.length + 1
  }
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
  const newRow = {
    id: Date.now(),
    projectId: selectedProjectId.value,
    post: contentPlanForm.value.post,
    format: contentPlanForm.value.format,
    idea: contentPlanForm.value.idea,
    date: contentPlanForm.value.date,
    index: filteredContentPlans.value.length + 1
  }
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

// ====== helpers ======
function svgFromRaw(raw) {
  const div = document.createElement('div')
  div.innerHTML = raw.trim()
  const svg = div.querySelector('svg')
  if (!svg) throw new Error('SVG not found')
  if (!svg.getAttribute('viewBox')) {
    const w = parseFloat(svg.getAttribute('width')) || 1000
    const h = parseFloat(svg.getAttribute('height')) || 1414
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
  }
  return svg
}

// ====== ПЕЧАТЬ: pixel-perfect ======
async function printPage() {
  if (!selectedProject.value || filteredContentPlans.value.length === 0) return

  // Цвета из макета
  const NAVY = { r: 31, g: 42, b: 90 }     // #1F2A5A
  const CYAN = { r: 0, g: 188, b: 212 }    // #00BCD4

  // Базовая сетка A4
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const FONT = 'Roboto-Regular'
  const FONT_BOLD = 'Roboto-Bold'
  doc.setFont(FONT, 'normal')

  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()

  // Фон во всю страницу (вектор)
  await doc.svg(svgFromRaw(bgSvgRaw), { x: 0, y: 0, width: W, height: H })

  // ===== Шапка (точные координаты из макета) =====
  // Логотип: центр, ~26мм ширина, Y=24
  await doc.svg(svgFromRaw(logoSvgRaw), { x: W/2 - 40, y: 24, width: 80, height: 11 })

  // Текст шапки
  doc.setFontSize(14)
  doc.setFont(FONT, 'normal', 'normal')

  // Слева: Brend (y=48), Raqam (y=56)
  doc.setTextColor(CYAN.r, CYAN.g, CYAN.b);  doc.text('Brend:', 18, 48)
  doc.setTextColor(0,0,0);                   doc.text(selectedProject.value.project || '', 35, 48)

  doc.setTextColor(CYAN.r, CYAN.g, CYAN.b);  doc.text('Raqam:', 18, 56)
  doc.setTextColor(0,0,0);                   doc.text(selectedProject.value.phone || '', 37, 56)

  // Справа: F.I.O (y=48)
  doc.setTextColor(CYAN.r, CYAN.g, CYAN.b);  doc.text('F.I.O:', W - 78, 48)
  doc.setTextColor(0,0,0);                   doc.text(selectedProject.value.name || '', W - 62, 48)

  // Тонкая линия под шапкой (y=64)
  doc.setDrawColor(NAVY.r, NAVY.g, NAVY.b)
  doc.setLineWidth(0.5)
  doc.line(18, 64, W - 18, 64)

  // Заголовок «KONTENT PLAN»
  doc.setTextColor(NAVY.r, NAVY.g, NAVY.b)
  doc.setFontSize(30)
  doc.setFont(FONT, 'normal', '400')
  doc.text('KONTENT PLAN', W/2, 82, { align: 'center'})

  // ===== Таблица (в точности по центру, не выходит за страницу) =====
  // В макете поле слева/справа ≈ 18мм. Держим целевую ширину 162мм (W=210 → 210-2*24 ≈ 162 для визуального баланса)
  const TARGET_W = 300
  const maxAllowed = W - 2 * 18
  const tableWidth = Math.min(TARGET_W, maxAllowed)
  const left = (W - tableWidth) / 2

  const head = [['№', 'Post', 'Format', 'Idea', 'Sana']]
  const body = filteredContentPlans.value.map((item, i) => ([
    String(i + 1),
    item.post || '',
    item.format || '',
    item.idea || '',
    item.date || ''
  ]))

  autoTable(doc, {
    head,
    body,
    startY: 94,                         // под заголовком как в макете
    tableWidth,
    margin: { left, right: left },
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 3.2,
      lineWidth: 0.28,
      lineColor: [NAVY.r, NAVY.g, NAVY.b],
      textColor: [0,0,0],
      overflow: 'linebreak',
      valign: 'middle'
    },
    headStyles: {
      font: FONT_BOLD,
      fontStyle: 'normal',
      fontSize: 13,
      fillColor: [NAVY.r, NAVY.g, NAVY.b],
      textColor: [255,255,255],
      lineColor: [NAVY.r, NAVY.g, NAVY.b],
      halign: 'center'
    },
    // Доли ширины колонок подобраны под картинку
    columnStyles: {
      0: { cellWidth: tableWidth * 0.07, halign: 'center' }, // №
      1: { cellWidth: tableWidth * 0.23 },                   // Post
      2: { cellWidth: tableWidth * 0.12 },                   // Format
      3: { cellWidth: tableWidth * 0.38 },                   // Idea
      4: { cellWidth: tableWidth * 0.20, halign: 'center' },  // Sana
    },
    didParseCell: (data) => { data.cell.styles.font = FONT },
    didDrawPage: () => {
      // Футер как в макете
      doc.setTextColor(0,0,0)
      doc.setFontSize(11)
      doc.text('@kh.agency', 18, H - 12)
      doc.text('+998 20 010 20 20', W - 18, H - 12, { align: 'right' })
    },
    pageBreak: 'auto',
    rowPageBreak: 'auto',
    // Чуть уменьшаем высоту строк, чтобы визуально совпало
    bodyStyles: { minCellHeight: 10.2 }
  })

  doc.save(`${selectedProject.value.project || 'project'}_content_plan.pdf`)
}
</script>

<style scoped lang="scss">
.area {
  background-color: #f2f2f2;
  border-radius: 10px;
  margin: 10px 0 10px 0;
}
.title { font-size: 25px; text-align: center; padding: 10px 0; }
.project-create { padding: 10px; }
.content-plan-create { padding: 10px; }
.input { margin: 10px; }

.project-row__list, .content-row__list { padding: 10px; }
.selected-row { background-color: #d0f0d0 !important; }
</style>
