<template>
  <q-page class="dashboard-page">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">Список проектов</h1>
        <q-btn
          flat
          dense
          no-caps
          icon="picture_as_pdf"
          label="Экспорт PDF"
          class="btn-export"
          @click="exportToPDF"
          :disable="isLoading"
        />
      </div>

      <!-- Stats Cards -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-value">{{ totalProjects }}</div>
          <div class="stat-label">Всего проектов</div>
        </div>
        <div class="stat-card stat-card--active">
          <div class="stat-value">{{ activeProjects }}</div>
          <div class="stat-label">Активных</div>
        </div>
        <div class="stat-card stat-card--inactive">
          <div class="stat-value">{{ inactiveProjects }}</div>
          <div class="stat-label">Неактивных</div>
        </div>
        <div
          class="stat-card stat-card--sum stat-card--clickable"
          @click="isTotalSumVisible = !isTotalSumVisible"
        >
          <div class="stat-value">
            <span v-if="isTotalSumVisible">{{ totalActiveSum.toLocaleString() }} $</span>
            <span v-else class="stat-value-mask">****</span>
          </div>
          <div class="stat-label">Сумма активных</div>
        </div>
      </div>

      <!-- Table Card -->
      <div class="table-card">
        <div v-if="isLoading" class="loading-state">
          <q-spinner-dots color="primary" size="32px" />
        </div>

        <div v-else-if="executorsWithProjects.length === 0" class="empty-state">
          <p>Проекты не найдены</p>
        </div>

        <template v-else>
          <!-- Mobile View -->
          <div class="mobile-view show-mobile-only">
            <div v-for="(executor, idx) in executorsWithProjects" :key="idx" class="mobile-group">
              <div class="mobile-executor">
                {{ executor.givenName }} {{ executor.familyName || '' }}
              </div>
              <div
                v-for="project in executor.projects"
                :key="project.id"
                class="mobile-project"
                :class="{ 'is-inactive': !project.isActive }"
              >
                <div class="mobile-row mobile-row--main">
                  <span class="mobile-label">{{ project.name }}</span>
                  <q-toggle
                    :model-value="project.isActive"
                    dense
                    size="xs"
                    color="positive"
                    @update:model-value="toggleProjectStatus(project, $event)"
                  />
                </div>
                <div class="mobile-row mobile-row--details">
                  <span class="mobile-meta">
                    <span class="mobile-meta-label">Постов:</span> {{ project.contentPlansCount || 0 }}
                  </span>
                  <span class="mobile-meta">
                    <span class="mobile-meta-label">День:</span>
                    <q-btn
                      flat
                      dense
                      no-caps
                      class="day-picker-btn day-picker-btn--mobile"
                      :label="project.chargeDay || '-'"
                    >
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                      <q-card class="day-picker-popup">
                        <div class="day-picker-header">День расчета</div>
                        <div class="day-picker-grid">
                          <q-btn
                            v-for="day in 31"
                            :key="day"
                            flat
                            dense
                            no-caps
                            class="day-picker-day"
                            :class="{ 'is-selected': project.chargeDay === day }"
                            :label="String(day)"
                            v-close-popup
                            @click="selectChargeDay(project, day)"
                          />
                        </div>
                        <q-btn
                          flat
                          dense
                          no-caps
                          class="day-picker-clear"
                          label="Сбросить"
                          v-close-popup
                          @click="selectChargeDay(project, null)"
                        />
                      </q-card>
                    </q-popup-proxy>
                  </q-btn>
                  </span>
                  <span class="mobile-meta">
                    <span class="mobile-meta-label">Цена:</span>
                    <template v-if="editingPriceId === project.id">
                      <div class="price-edit price-edit--mobile">
                        <q-input
                          v-model="editPriceValue"
                          dense
                          outlined
                          type="number"
                          class="price-input price-input--mobile"
                          @keyup.enter="savePrice(project)"
                          @keyup.escape="cancelEditingPrice"
                          autofocus
                        />
                        <q-btn flat dense round size="xs" icon="check" color="positive" @click="savePrice(project)" />
                        <q-btn flat dense round size="xs" icon="close" color="negative" @click="cancelEditingPrice" />
                      </div>
                    </template>
                    <template v-else>
                      <q-btn
                        flat
                        dense
                        no-caps
                        class="price-btn price-btn--mobile"
                        :class="{ 'price-hidden': !isPriceVisible(project.id) }"
                        @click="handlePriceClick(project)"
                      >
                        <span v-if="isPriceVisible(project.id)">{{ project.price != null ? project.price : '-' }}</span>
                        <span v-else class="price-mask">****</span>
                      </q-btn>
                    </template>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Desktop Table -->
          <table class="data-table hide-mobile-only">
            <thead>
              <tr>
                <th class="th-executor">Исполнитель</th>
                <th class="th-project">Проект</th>
                <th class="th-posts">Постов</th>
                <th class="th-charge">День расчета</th>
                <th class="th-price">Цена</th>
                <th class="th-status">Статус</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(executor, execIdx) in executorsWithProjects" :key="execIdx">
                <tr
                  v-for="(project, projIdx) in executor.projects"
                  :key="project.id"
                  :class="{ 'row-inactive': !project.isActive }"
                >
                  <td
                    v-if="projIdx === 0"
                    class="td-executor"
                    :rowspan="executor.projects.length"
                  >
                    <span class="executor-name">
                      {{ executor.givenName }} {{ executor.familyName || '' }}
                    </span>
                  </td>
                  <td class="td-project">{{ project.name }}</td>
                  <td class="td-posts">{{ project.contentPlansCount || 0 }}</td>
                  <td class="td-charge">
                    <q-btn
                      flat
                      dense
                      no-caps
                      class="day-picker-btn"
                      :label="project.chargeDay || '-'"
                    >
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-card class="day-picker-popup">
                          <div class="day-picker-header">День расчета</div>
                          <div class="day-picker-grid">
                            <q-btn
                              v-for="day in 31"
                              :key="day"
                              flat
                              dense
                              no-caps
                              class="day-picker-day"
                              :class="{ 'is-selected': project.chargeDay === day }"
                              :label="String(day)"
                              v-close-popup
                              @click="selectChargeDay(project, day)"
                            />
                          </div>
                          <q-btn
                            flat
                            dense
                            no-caps
                            class="day-picker-clear"
                            label="Сбросить"
                            v-close-popup
                            @click="selectChargeDay(project, null)"
                          />
                        </q-card>
                      </q-popup-proxy>
                    </q-btn>
                  </td>
                  <td class="td-price">
                    <template v-if="editingPriceId === project.id">
                      <div class="price-edit">
                        <q-input
                          v-model="editPriceValue"
                          dense
                          outlined
                          type="number"
                          class="price-input"
                          @keyup.enter="savePrice(project)"
                          @keyup.escape="cancelEditingPrice"
                          autofocus
                        />
                        <q-btn flat dense round size="sm" icon="check" color="positive" @click="savePrice(project)" />
                        <q-btn flat dense round size="sm" icon="close" color="negative" @click="cancelEditingPrice" />
                      </div>
                    </template>
                    <template v-else>
                      <q-btn
                        flat
                        dense
                        no-caps
                        class="price-btn"
                        :class="{ 'price-hidden': !isPriceVisible(project.id) }"
                        @click="handlePriceClick(project)"
                      >
                        <span v-if="isPriceVisible(project.id)">{{ project.price != null ? project.price : '-' }}</span>
                        <span v-else class="price-mask">****</span>
                        <q-tooltip>Клик - показать/скрыть, двойной клик - редактировать</q-tooltip>
                      </q-btn>
                    </template>
                  </td>
                  <td class="td-status">
                    <q-toggle
                      :model-value="project.isActive"
                      dense
                      size="sm"
                      color="positive"
                      @update:model-value="toggleProjectStatus(project, $event)"
                    />
                  </td>
                </tr>
                <tr class="row-divider" v-if="execIdx < executorsWithProjects.length - 1">
                  <td colspan="6"></td>
                </tr>
              </template>
            </tbody>
          </table>
        </template>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'boot/axios.js'
import { useQuasar } from 'quasar'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import bgSvgRaw from 'assets/asset7.svg?raw'
import logoSvgRaw from 'assets/logo.svg?raw'
import 'svg2pdf.js'
import '../../components/Roboto-Regular-normal.js'
import '../../components/Roboto-Bold-normal.js'

const q = useQuasar()
const isLoading = ref(true)
const executorsWithProjects = ref([])
const visiblePrices = ref(new Set())
const editingPriceId = ref(null)
const editPriceValue = ref('')
const clickTimer = ref(null)
const isTotalSumVisible = ref(false)

// Computed stats
const allProjects = computed(() => {
  return executorsWithProjects.value.flatMap(e => e.projects)
})

const totalProjects = computed(() => allProjects.value.length)

const activeProjects = computed(() => {
  return allProjects.value.filter(p => p.isActive).length
})

const inactiveProjects = computed(() => {
  return allProjects.value.filter(p => !p.isActive).length
})

const totalActiveSum = computed(() => {
  return allProjects.value
    .filter(p => p.isActive && p.price != null)
    .reduce((sum, p) => sum + Number(p.price), 0)
})


async function fetchAllData() {
  isLoading.value = true
  try {
    const response = await api.post('/users/projects')
    executorsWithProjects.value = response.data || []
  } catch (error) {
    console.error('Error fetching data:', error)
    q.notify({ message: 'Ошибка загрузки данных', type: 'negative', position: 'top' })
  } finally {
    isLoading.value = false
  }
}

async function toggleProjectStatus(project, newStatus) {
  const originalStatus = project.isActive
  project.isActive = newStatus
  try {
    await api.patch(`/projects/${project.id}/admin`, { isActive: newStatus })
    q.notify({
      message: newStatus ? 'Проект активирован' : 'Проект деактивирован',
      type: 'positive',
      position: 'top',
      timeout: 2000
    })
  } catch {
    project.isActive = originalStatus
    q.notify({ message: 'Ошибка обновления статуса', type: 'negative', position: 'top' })
  }
}

async function selectChargeDay(project, day) {
  const originalDay = project.chargeDay
  project.chargeDay = day

  try {
    await api.patch(`/projects/${project.id}/admin`, { chargeDay: day })
    q.notify({
      message: day ? `День расчета: ${day}` : 'День расчета сброшен',
      type: 'positive',
      position: 'top',
      timeout: 2000
    })
  } catch {
    project.chargeDay = originalDay
    q.notify({ message: 'Ошибка обновления дня расчета', type: 'negative', position: 'top' })
  }
}

function handlePriceClick(project) {
  if (clickTimer.value) {
    clearTimeout(clickTimer.value)
    clickTimer.value = null
    startEditingPrice(project)
  } else {
    clickTimer.value = setTimeout(() => {
      togglePriceVisibility(project.id)
      clickTimer.value = null
    }, 250)
  }
}

function togglePriceVisibility(projectId) {
  if (visiblePrices.value.has(projectId)) {
    visiblePrices.value.delete(projectId)
  } else {
    visiblePrices.value.add(projectId)
  }
}

function isPriceVisible(projectId) {
  return visiblePrices.value.has(projectId)
}

function startEditingPrice(project) {
  editingPriceId.value = project.id
  editPriceValue.value = project.price != null ? String(project.price) : ''
}

function cancelEditingPrice() {
  editingPriceId.value = null
  editPriceValue.value = ''
}

async function savePrice(project) {
  const newPrice = editPriceValue.value === '' ? null : Number(editPriceValue.value)
  const originalPrice = project.price

  project.price = newPrice
  editingPriceId.value = null
  editPriceValue.value = ''

  try {
    await api.patch(`/projects/${project.id}/admin`, { price: newPrice })
    q.notify({
      message: newPrice != null ? `Цена обновлена: ${newPrice}` : 'Цена сброшена',
      type: 'positive',
      position: 'top',
      timeout: 2000
    })
  } catch {
    project.price = originalPrice
    q.notify({ message: 'Ошибка обновления цены', type: 'negative', position: 'top' })
  }
}

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

async function exportToPDF() {
  const NAVY = { r: 31, g: 42, b: 90 } // #1F2A5A
  const GRAY = { r: 160, g: 160, b: 160 } // Gray for inactive projects

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const FONT = 'Roboto-Regular'
  const FONT_BOLD = 'Roboto-Bold'
  doc.setFont(FONT, 'normal')

  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()

  await doc.svg(svgFromRaw(bgSvgRaw), { x: 0, y: 0, width: W, height: H })

  // Logo on the left
  await doc.svg(svgFromRaw(logoSvgRaw), { x: 10, y: 8, width: 50, height: 7 })

  // Title centered
  doc.setFontSize(16)
  doc.setFont(FONT_BOLD, 'normal')
  doc.setTextColor(NAVY.r, NAVY.g, NAVY.b)
  doc.text('PROYEKTLAR RO\'YXATI', W / 2, 13, { align: 'center' })

  // Current date and count on the right
  const currentDate = new Date().toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })

  doc.setFontSize(8)
  doc.setFont(FONT, 'normal')
  doc.setTextColor(0, 0, 0)
  doc.text(currentDate, W - 10, 11, { align: 'right' })

  // Prepare table data with executor grouping info
  const head = [['Ijrochi', 'Proyekt', 'Postlar', 'Hisob kuni']]
  const body = []
  const rowColors = [] // Track inactive rows
  const executorSpans = [] // Track which rows should show executor and rowspan

  // Calculate statistics
  let totalProjectsCount = 0

  executorsWithProjects.value.forEach((executor) => {
    const name = `${executor.givenName} ${executor.familyName || ''}`.trim()
    const projectCount = executor.projects.length

    executor.projects.forEach((project, index) => {
      body.push([
        index === 0 ? name : '', // Only show executor name on first row
        project.name,
        String(project.contentPlansCount || 0),
        project.chargeDay ? String(project.chargeDay) : '-'
      ])
      rowColors.push(project.isActive)

      // Mark the first row of each executor with rowspan info
      executorSpans.push({
        isFirst: index === 0,
        rowSpan: projectCount,
        executorName: name
      })

      // Count total projects
      totalProjectsCount++
    })
  })

  // Display total projects count on the right below date
  doc.setFontSize(8)
  doc.setFont(FONT, 'normal')
  doc.setTextColor(0, 0, 0)
  doc.text(`Jami proyektlar: ${totalProjectsCount}`, W - 10, 15, { align: 'right' })

  const tableWidth = W - 20
  const left = 10

  autoTable(doc, {
    head,
    body,
    startY: 20,
    tableWidth,
    margin: { left, right: left },
    theme: 'grid',
    styles: {
      fontSize: 6,
      cellPadding: 1,
      lineWidth: 0.15,
      lineColor: [NAVY.r, NAVY.g, NAVY.b],
      textColor: [0, 0, 0],
      overflow: 'linebreak',
      valign: 'middle',
      font: FONT,
      minCellHeight: 4,
    },
    headStyles: {
      font: FONT_BOLD,
      fontStyle: 'normal',
      fontSize: 7,
      fillColor: [NAVY.r, NAVY.g, NAVY.b],
      textColor: [255, 255, 255],
      lineColor: [NAVY.r, NAVY.g, NAVY.b],
      halign: 'center',
      cellPadding: 1.5,
    },
    columnStyles: {
      0: { cellWidth: tableWidth * 0.28, halign: 'center' }, // Executor - centered
      1: { cellWidth: tableWidth * 0.42, halign: 'left' },   // Project
      2: { cellWidth: tableWidth * 0.15, halign: 'center' }, // Posts
      3: { cellWidth: tableWidth * 0.15, halign: 'center' }, // Charge Day
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        const rowIndex = data.row.index
        const isActive = rowColors[rowIndex]
        const spanInfo = executorSpans[rowIndex]

        // Apply gray color to inactive projects
        if (!isActive) {
          data.cell.styles.textColor = [GRAY.r, GRAY.g, GRAY.b]
        }

        // Handle executor column rowspan
        if (data.column.index === 0) {
          if (spanInfo.isFirst && spanInfo.rowSpan > 1) {
            // First row of executor group - set rowspan
            data.cell.rowSpan = spanInfo.rowSpan
            data.cell.styles.valign = 'middle'
          } else if (!spanInfo.isFirst) {
            // Hide subsequent executor cells (they're merged)
            data.cell.text = []
          }
        }
      }
    },
    didDrawCell: (data) => {
      // Add strikethrough for inactive project names (column 1)
      if (data.section === 'body' && data.column.index === 1) {
        const rowIndex = data.row.index
        const isActive = rowColors[rowIndex]

        if (!isActive && data.cell.text.length > 0) {
          // Draw strikethrough line
          doc.setDrawColor(GRAY.r, GRAY.g, GRAY.b)
          doc.setLineWidth(0.2)
          const textWidth = doc.getTextWidth(data.cell.text[0])
          const y = data.cell.y + data.cell.height / 2
          const x = data.cell.x + data.cell.padding('left')
          doc.line(x, y, x + textWidth, y)
        }
      }
    },
    didDrawPage: () => {
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(11)
      doc.setFont(FONT, 'normal')
      doc.text('@kh.agency', 18, H - 12)
      doc.text('+998 20 010 20 20', W - 18, H - 12, { align: 'right' })
    },
    pageBreak: 'auto',
    rowPageBreak: 'auto',
  })

  doc.save(`projects_list_${new Date().toISOString().split('T')[0]}.pdf`)
}

onMounted(fetchAllData)
</script>

<style scoped lang="scss">
.dashboard-page {
  padding: 0;
}

.page-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem;

  @media (max-width: 599px) {
    padding: 1rem;
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 0.5rem;

  @media (max-width: 599px) {
    margin-bottom: 0.75rem;
  }
}

.page-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;

  @media (max-width: 599px) {
    font-size: 1rem;
  }
}

.btn-export {
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;

  @media (max-width: 599px) {
    font-size: 0.6875rem;
    padding: 0.25rem 0.5rem;

    :deep(.q-btn__content) {
      gap: 0.25rem;
    }

    :deep(.q-icon) {
      font-size: 1rem;
    }
  }

  &:hover {
    color: var(--text-primary);
  }
}

// Stats Cards
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;

  @media (max-width: 599px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.875rem 0.5rem;
  text-align: center;

  @media (max-width: 599px) {
    padding: 0.625rem 0.375rem;
    border-radius: 6px;
  }
}

.stat-value {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;

  @media (max-width: 599px) {
    font-size: 1.125rem;
  }
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.25rem;

  @media (max-width: 599px) {
    font-size: 0.625rem;
  }
}

.stat-card--active {
  .stat-value {
    color: #22c55e;
  }
}

.stat-card--inactive {
  .stat-value {
    color: #ef4444;
  }
}

.stat-card--sum {
  .stat-value {
    color: #8b5cf6;
  }
}

.stat-card--clickable {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
}

.stat-value-mask {
  letter-spacing: 2px;
  color: var(--text-muted);
}

.table-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.loading-state,
.empty-state {
  padding: 3rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.8125rem;
}

// Desktop Table
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;

  th {
    text-align: left;
    padding: 0.75rem 1rem;
    font-weight: 500;
    font-size: 0.6875rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--text-muted);
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border-color);
  }

  td {
    padding: 0.5rem 1rem;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border-light);
  }

  tr:hover td {
    background: var(--bg-hover);
  }
}

.th-executor { width: 180px; text-align: center !important; }
.th-project { text-align: center !important; }
.th-posts { width: 80px; text-align: center !important; }
.th-charge { width: 100px; text-align: center !important; }
.th-price { width: 100px; text-align: center !important; }
.th-status { width: 80px; text-align: center !important; }

.td-executor {
  vertical-align: middle;
  text-align: center;
  border-right: 1px solid var(--border-color);
  background: rgba(0, 0, 0, 0.03);

  .body--dark & {
    background: rgba(255, 255, 255, 0.03);
  }
}

.executor-name {
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--text-primary);
}

.td-project {
  font-weight: 400;
  text-align: center;
}

.td-posts {
  text-align: center;
  color: var(--text-secondary);
}

.td-charge {
  text-align: center;
}

.td-price {
  text-align: center;
}

.td-status {
  text-align: center;
}

// Day Picker
.day-picker-btn {
  min-width: 44px;
  height: 28px;
  padding: 0 10px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-primary);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;

  &:hover {
    background: var(--bg-hover);
    border-color: var(--text-muted);
  }

  &--mobile {
    min-width: 36px;
    height: 24px;
    font-size: 0.75rem;
    padding: 0 8px;
  }
}

.day-picker-popup {
  padding: 12px;
  min-width: 260px;

  &.q-card {
    background: var(--bg-card);
    border-radius: 8px;
  }
}

.day-picker-header {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 10px;
  text-align: center;
}

.day-picker-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 10px;
}

.day-picker-day {
  min-width: 32px !important;
  min-height: 32px !important;
  padding: 0 !important;
  font-size: 0.75rem !important;
  font-weight: 500;
  color: var(--text-primary);
  border-radius: 6px;

  &.is-selected {
    background: #8b5cf6 !important;
    color: white !important;
  }
}

.day-picker-clear {
  width: 100%;
  font-size: 0.75rem !important;
  color: var(--text-muted);
  border: 1px solid var(--border-color);
  border-radius: 6px;

  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
}

// Price column
.price-btn {
  min-width: 60px;
  height: 28px;
  padding: 0 10px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-primary);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: var(--bg-hover);
    border-color: var(--text-muted);
  }

  &--mobile {
    min-width: 50px;
    height: 24px;
    font-size: 0.75rem;
    padding: 0 8px;
  }

  &.price-hidden {
    .price-mask {
      letter-spacing: 1px;
      color: var(--text-muted);
    }
  }
}

.price-edit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  &--mobile {
    gap: 2px;
  }
}

.price-input {
  width: 80px;

  :deep(.q-field__control) {
    height: 28px;
    min-height: 28px;
  }

  :deep(.q-field__native) {
    padding: 0 8px;
    font-size: 0.8125rem;
    -moz-appearance: textfield;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  &--mobile {
    width: 60px;

    :deep(.q-field__control) {
      height: 24px;
      min-height: 24px;
    }

    :deep(.q-field__native) {
      font-size: 0.75rem;
      padding: 0 6px;
    }
  }
}

.row-inactive {
  opacity: 0.5;

  .td-project {
    text-decoration: line-through;
  }
}

.row-divider td {
  padding: 0;
  height: 8px;
  background: rgba(0, 0, 0, 0.05);
  border-bottom: none;

  .body--dark & {
    background: rgba(255, 255, 255, 0.05);
  }
}

// Responsive
.hide-mobile-only {
  @media (max-width: 767px) {
    display: none !important;
  }
}

.show-mobile-only {
  display: none !important;
  @media (max-width: 767px) {
    display: block !important;
  }
}

// Mobile View
.mobile-view {
  padding: 0.5rem;
}

.mobile-group {
  margin-bottom: 0.75rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;

  &:last-child {
    margin-bottom: 0;
  }
}

.mobile-executor {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
  padding: 0.625rem 0.75rem;
  background: rgba(139, 92, 246, 0.1);
  border-bottom: 1px solid var(--border-color);
}

.mobile-project {
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid var(--border-light);

  &:last-child {
    border-bottom: none;
  }

  &.is-inactive {
    opacity: 0.5;
    .mobile-label {
      text-decoration: line-through;
    }
  }
}

.mobile-row {
  display: flex;
  justify-content: space-between;
  align-items: center;

  &--main {
    margin-bottom: 0.375rem;
  }

  &--details {
    gap: 1rem;
  }
}

.mobile-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
  margin-right: 0.5rem;
}

.mobile-meta {
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.mobile-meta-label {
  color: var(--text-muted);
}

</style>
