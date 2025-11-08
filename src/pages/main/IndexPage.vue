<template>
  <q-page class="page">
    <div class="row justify-center">
      <div class="project-row row justify-center col-xs-12 col-md-10">
        <!-- ======= ФОРМА ПРОЕКТА ======= -->
        <div class="project-row__form col-xs-12 col-lg-6">
          <q-form
            class="project-create col-md-12 col-lg-6"
            @submit.prevent="editingProject ? saveEditedProject() : addToProjectList()"
          >
            <div class="area">
              <div class="title">
                {{ editingProject ? 'Редактировать проект' : 'Создать проект' }}
              </div>
              <div class="create-form q-pa-lg row">
                <div class="form-item col-xs-12 col-sm-6 col-md-6 col-lg-6">
                  <q-input
                    class="input"
                    outlined
                    v-model="form.name"
                    label="Называние проекта"
                    lazy-rules
                    :rules="[
                      val => val.length > 0 || 'Заполните Форму'
                    ]"
                  />
                </div>
                <div class="form-item col-xs-12 col-sm-6 col-md-6 col-lg-6">
                  <q-input
                    class="input"
                    filled
                    v-model="form.phone"
                    label="Телефон"
                    mask="998 (##) ### - ## - ##"
                    fill-mask
                    lazy-rules
                    :rules="[
                      val => val.length > 0 || 'Заполните Форму'
                    ]"
                  />
                </div>
                <div class="form-item col-xs-12 col-sm-12 col-md-12 col-lg-12 flex justify-end">
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
                    <th v-for="col in projectColumns" :key="col.index" class="text-left">
                      {{ col.label }}
                    </th>
                    <th class="text-left">Действие</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, index) in projectStore.getProjects"
                    :key="row.id"
                    :class="{ 'selected-row': row.id === selectedProjectId }"
                  >
                    <td class="text-left">{{ index + 1 }}</td>
                    <td class="text-left">{{ row.name }}</td>
                    <td class="text-left">{{ row.createdBy.givenName }}</td>
                    <td class="text-left">{{ row.phone }}</td>
                    <td class="text-left">
                      <q-btn
                        flat
                        round
                        color="green"
                        icon="visibility"
                        @click="selectProject(row.id)"
                      />
                      <q-btn flat round color="primary" icon="edit" @click="editProject(row)" />
                      <q-btn flat round color="red" icon="delete" @click="confirmProjectDeletion(row)" />
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
        <div class="content-row__form col-xs-12 col-lg-6">
          <q-form
            class="content-plan-create col-md-12 col-lg-6"
            @submit.prevent="editingContent ? saveEditedContentPlan() : addToContentList()"
          >
            <div class="area">
              <div class="title">
                {{ editingContent ? 'Редактировать контент план' : 'Создать контент план' }}
              </div>
              <div class="create-form q-pa-lg row">
                <div class="form-item col-xs-12 col-sm-6 col-md-6 col-lg-4">
                  <q-input
                    class="input"
                    outlined
                    v-model="contentPlanForm.post"
                    label="Пост"
                    lazy-rules
                    :rules="[
                      val => val.length > 0 || 'Заполните Форму'
                    ]"
                  />
                </div>
                <div class="form-item col-xs-12 col-sm-6 col-md-6 col-lg-4">
                  <q-select
                    class="input"
                    outlined
                    v-model="contentPlanForm.format"
                    :options="options"
                    label="Формат"
                    lazy-rules
                    :rules="[
                      val => val.length > 0 || 'Заполните Форму'
                    ]"
                  />
                </div>
                <div class="form-item col-xs-12 col-sm-6 col-md-6 col-lg-4">
                  <q-input
                    type="date"
                    class="input"
                    outlined
                    v-model="contentPlanForm.date"
                    label="Дата"
                    lazy-rules
                    :rules="[
                      val => val.length > 0 || 'Заполните Форму'
                    ]"
                  />
                </div>
                <div class="form-item col-xs-12 col-sm-6 col-md-6 col-lg-4">
                  <q-input
                    class="input"
                    autogrow
                    outlined
                    v-model="contentPlanForm.idea"
                    label="Идея"
                    lazy-rules
                    :rules="[
                      val => val.length > 0 || 'Заполните Форму'
                    ]"
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
                  v-if="selectedProjectId"
                  @click="printPage"
                />
              </div>
              <q-markup-table>
                <thead>
                  <tr>
                    <th v-for="col in columns" :key="col.index" class="text-left">
                      {{ col.label }}
                    </th>
                    <th class="text-left">Действие</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in contentPlanStore.getContentPlans" :key="index" :class="{ 'selected-row': row.id === contentPlanForm.id }">
                    <td class="text-left">{{ index + 1 }}</td>
                    <td class="text-left">{{ row.post }}</td>
                    <td class="text-left">{{ row.format }}</td>
                    <td
                      class="text-left"
                      style="
                        max-width: 260px;
                        word-break: break-word;
                        white-space: normal !important;
                      "
                    >
                      {{ row.idea }}
                    </td>
                    <td class="text-left">{{ row.date.slice(0,10) }}</td>
                    <td class="text-left">
                      <q-btn flat round color="primary" icon="edit" @click="editContentPlan(row)" />
                      <q-btn
                        flat
                        round
                        color="red"
                        icon="delete"
                        @click="confirmContentPlanDeletion(row.id)"
                      />
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
import { ref, computed, onMounted, watch } from 'vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import 'svg2pdf.js'
import './Roboto-Regular-normal.js'
import './Roboto-Bold-normal.js'
import { useProjectStore } from 'stores/project.js'
import bgSvgRaw from 'assets/asset7.svg?raw'
import logoSvgRaw from 'assets/logo.svg?raw'
import { useContentPlanStore } from 'stores/content-plan.js'

// ====== состояние/методы ======
const form = ref({ phone: '', name: '' })
const projectRows = ref([])
const selectedProjectId = ref(null)
const editingProject = ref(null)
const projectStore = useProjectStore()
const contentPlanStore = useContentPlanStore()
import { useQuasar } from 'quasar'

const q = useQuasar()
const projectColumns = [
  { index: 'index', label: '#', field: 'index' },
  { project: 'project', label: 'Проект', field: 'project' },
  { name: 'name', label: 'Имя (СММ)', field: 'name' },
  { phone: 'phone', label: 'Телефон', field: 'phone' },
]
function addToProjectList() {
  projectStore.createProject(form.value)
    .then(() => {
      projectStore.fetchProjects()
      q.notify({
        message: 'Проект успешно создан',
        type: 'positive'
      })
    })
  form.value = { name: '', phone: '' }
}
function selectProject(id) {
  if (id === selectedProjectId.value) {
    selectedProjectId.value = null
  } else {
    selectedProjectId.value = id
  }
}
function editProject(project) {
  if (project.id === selectedProjectId.value) {
    editingProject.value = null
    form.value = { name: '', phone: ''}
    selectedProjectId.value = null
  } else {
    selectedProjectId.value = project.id
    editingProject.value = project
    form.value = { name: project.name, phone: project.phone }
  }
}
function saveEditedProject() {
  console.log(selectedProjectId)
  projectStore.patchProject(form.value, selectedProjectId.value).then(() => {
    projectStore.fetchProjects()
    q.notify({
      message: 'Проект успешно изменено',
      type: 'positive'
    })
  })
  editingProject.value = null
  form.value = { name: '', phone: ''}
  selectedProjectId.value = null
}
function deleteProject(id) {
  projectStore.deleteProject(id).then(() => {
    projectStore.fetchProjects()
    q.notify({
      message: 'Проект успешно удалено',
      type: 'positive'
    })
  })
}

function fetchProject() {
  contentPlanStore.fetchContentPlan(selectedProjectId.value).then(() => {
    console.log(contentPlanStore.getContentPlans, 'contentPlans')
  })
}
const selectedProject = computed(
  () => projectStore.getProjects.find((p) => p.id === selectedProjectId.value) || null,
)

watch(selectedProjectId, async () => {
  if (selectedProjectId.value) {
    fetchProject()
  } else {
    contentPlanStore.clearContentPlans()
  }
})

const contentPlanForm = ref({ post: '', format: '', idea: '', date: '', id: null })
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
  if (!selectedProjectId.value) {
    alert('Выберите проект!')
    return
  }
  const newRow = {
    project: '/api/projects/' + selectedProjectId.value,
    post: contentPlanForm.value.post,
    format: contentPlanForm.value.format,
    idea: contentPlanForm.value.idea,
    date: contentPlanForm.value.date,
  }
  contentPlanStore.createContentPlan(newRow).then(() => {
    contentPlanStore.fetchContentPlan(selectedProjectId.value)
    q.notify({
      message: 'Контент-план успешно создан',
      type: 'positive'
    })
  })
  contentPlanForm.value = { post: '', format: '', idea: '', date: '', id: null }
}
function editContentPlan(plan) {
  if(editingContent.value === null || editingContent.value.id !== plan.id) {
    editingContent.value = plan
    contentPlanForm.value = { post: plan.post, format: plan.format, idea: plan.idea, date: plan.date.slice(0, 10), id: plan.id }
  } else {
    editingContent.value = null
    contentPlanForm.value = { post: '', format: '', idea: '', date: '', id: null }
  }
}
function saveEditedContentPlan() {
  contentPlanStore.patchContentPlan({
    post: contentPlanForm.value.post,
    format: contentPlanForm.value.format,
    date: contentPlanForm.value.date,
    idea: contentPlanForm.value.idea,
  }, editingContent.value.id).then(() => {
    contentPlanStore.fetchContentPlan(selectedProjectId.value)
    q.notify({
      message: 'Контент-план успешно изменено',
      type: 'positive'
    })
  })
  editingContent.value = null
  contentPlanForm.value = { post: '', format: '', idea: '', date: '' }
}
function deleteContentPlan(id) {
  contentPlanStore.deleteContentPlan(id).then(() => {
    contentPlanStore.fetchContentPlan(selectedProjectId.value)
    q.notify({
      message: 'Контент-план успешно удалено',
      type: 'positive'
    })
  })
}
function loadDataFromStorage() {
  const savedProjects = localStorage.getItem('projects')
  const savedContent = localStorage.getItem('contentPlans')
  if (savedProjects) projectRows.value = JSON.parse(savedProjects)
  if (savedContent) rows.value = JSON.parse(savedContent)
}

function confirmProjectDeletion(project) {
  q.dialog({
    title: 'Внимание',
    message: 'Вы действительно хотите удалить проект ' + '<strong>' + project.name + '</strong>',
    cancel: true,
    color: 'red',
    html: true
  }).onOk(() => {
    deleteProject(project.id)
  })
}

function confirmContentPlanDeletion(contentPlanId) {
  q.dialog({
    title: 'Внимание',
    message: 'Вы действительно хотите удалить контент план ',
    cancel: true,
    color: 'red',
    html: true
  }).onOk(() => {
    deleteContentPlan(contentPlanId)
  })
}

onMounted(() => {
  loadDataFromStorage()
  projectStore.fetchProjects()
})

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

async function printPage() {
  const NAVY = { r: 31, g: 42, b: 90 } // #1F2A5A
  const CYAN = { r: 0, g: 188, b: 212 } // #00BCD4

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const FONT = 'Roboto-Regular'
  const FONT_BOLD = 'Roboto-Bold'
  doc.setFont(FONT, 'normal')

  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()

  await doc.svg(svgFromRaw(bgSvgRaw), { x: 0, y: 0, width: W, height: H })

  await doc.svg(svgFromRaw(logoSvgRaw), { x: W / 2 - 40, y: 24, width: 80, height: 11 })

  doc.setFontSize(14)
  doc.setFont(FONT, 'normal', 'normal')

  doc.setTextColor(CYAN.r, CYAN.g, CYAN.b)
  doc.text('Brend:', 18, 48)
  doc.setTextColor(0, 0, 0)
  doc.text(selectedProject.value.name || '', 35, 48)

  doc.setTextColor(CYAN.r, CYAN.g, CYAN.b)
  doc.text('Raqam:', 18, 56)
  doc.setTextColor(0, 0, 0)
  doc.text(selectedProject.value.phone || '', 37, 56)

  doc.setTextColor(CYAN.r, CYAN.g, CYAN.b)
  doc.text('F.I.O:', W - 78, 48)
  doc.setTextColor(0, 0, 0)
  doc.text(selectedProject.value.name || '', W - 62, 48)

  doc.setDrawColor(NAVY.r, NAVY.g, NAVY.b)
  doc.setLineWidth(0.5)
  doc.line(18, 64, W - 18, 64)

  doc.setTextColor(NAVY.r, NAVY.g, NAVY.b)
  doc.setFontSize(30)
  doc.setFont(FONT, 'normal', '400')
  doc.text('KONTENT PLAN', W / 2, 82, { align: 'center' })

  const TARGET_W = 300
  const maxAllowed = W - 2 * 18
  const tableWidth = Math.min(TARGET_W, maxAllowed)
  const left = (W - tableWidth) / 2

  const head = [['№', 'Post', 'Format', 'Idea', 'Sana']]
  const body = contentPlanStore.getContentPlans.map((item, i) => [
    String(i + 1),
    item.post || '',
    item.format || '',
    item.idea || '',
    item.date.slice(0, 10) || '',
  ])

  autoTable(doc, {
    head,
    body,
    startY: 94, // под заголовком как в макете
    tableWidth,
    margin: { left, right: left },
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 3.2,
      lineWidth: 0.28,
      lineColor: [NAVY.r, NAVY.g, NAVY.b],
      textColor: [0, 0, 0],
      overflow: 'linebreak',
      valign: 'middle',
    },
    headStyles: {
      font: FONT_BOLD,
      fontStyle: 'normal',
      fontSize: 13,
      fillColor: [NAVY.r, NAVY.g, NAVY.b],
      textColor: [255, 255, 255],
      lineColor: [NAVY.r, NAVY.g, NAVY.b],
      halign: 'center',
    },
    // Доли ширины колонок подобраны под картинку
    columnStyles: {
      0: { cellWidth: tableWidth * 0.07, halign: 'center' }, // №
      1: { cellWidth: tableWidth * 0.23 }, // Post
      2: { cellWidth: tableWidth * 0.12 }, // Format
      3: { cellWidth: tableWidth * 0.38 }, // Idea
      4: { cellWidth: tableWidth * 0.2, halign: 'center' }, // Sana
    },
    didParseCell: (data) => {
      data.cell.styles.font = FONT
    },
    didDrawPage: () => {
      // Футер как в макете
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(11)
      doc.text('@kh.agency', 18, H - 12)
      doc.text('+998 20 010 20 20', W - 18, H - 12, { align: 'right' })
    },
    pageBreak: 'auto',
    rowPageBreak: 'auto',
    // Чуть уменьшаем высоту строк, чтобы визуально совпало
    bodyStyles: { minCellHeight: 10.2 },
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

.project-row__list,
.content-row__list {
  padding: 10px;
}
.selected-row {
  background-color: #d0f0d0 !important;
}
.page {
  background: url("data:image/svg+xml,<svg id='patternId' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='50' height='33.333' patternTransform='scale(2) rotate(0)'><rect x='0' y='0' width='100%' height='100%' fill='%23000000ff'/><path d='M25 .806v2.79h.8V.806Zm0 4.465v2.791h.8v-2.79Zm-2.043 3.902-2.32 1.55.444.665 2.32-1.55-.443-.665zm4.885 0-.444.665 2.32 1.55.445-.665zM-.4 10.61v2.79h.8v-2.79zm50 0v2.79h.8v-2.79zm-30.356 1.042-2.32 1.55.443.666 2.322-1.55-.444-.666zm12.311 0-.444.665 2.32 1.55.445-.664zm3.783 2.566-.444.666 2.321 1.55.444-.666zm-19.852.025-2.32 1.55.444.665 2.32-1.55zm-15.886.77v2.79h.8v-2.79Zm50 0v2.79h.8v-2.79Zm-50 4.465v2.79h.8v-2.79h-.8Zm50 0v2.79h.8v-2.79h-.8zM2.442 23.379l-.444.665 2.32 1.55.445-.665zm45.115 0-2.32 1.55.443.666 2.322-1.55-.444-.666zM6.155 25.86l-.444.665 2.32 1.55.445-.665zm37.69 0-2.322 1.55.444.665 2.321-1.55-.444-.666zM9.937 28.424l-.444.665 2.32 1.55.445-.665-2.321-1.55zm30.11.003-2.321 1.55.444.666 2.321-1.55zM25 29.737v2.79h.8v-2.79z'  stroke-width='1' stroke='none' fill='%2301dbfeff'/></pattern></defs><rect width='800%' height='800%' transform='translate(0,0)' fill='url(%23a)'/></svg>")
}
</style>
