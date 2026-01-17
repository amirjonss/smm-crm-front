<template>
  <q-page class="index-page">
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">Мои проекты</h1>
        <p class="page-subtitle">Управление проектами и контент-планами</p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid q-mb-xl">
        <div class="stat-card">
          <div class="stat-icon stat-icon-blue">
            <q-icon name="today" size="1.5rem" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ todaysContentPlans.length }}</span>
            <span class="stat-label">Сегодня</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-purple">
            <q-icon name="date_range" size="1.5rem" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ weekCount }}</span>
            <span class="stat-label">На неделю</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-green">
            <q-icon name="calendar_month" size="1.5rem" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ monthCount }}</span>
            <span class="stat-label">На месяц</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-orange">
            <q-icon name="task_alt" size="1.5rem" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ contentPlanStore.getMyPublishedTotal }}</span>
            <span class="stat-label">Выполнено</span>
          </div>
        </div>
      </div>

      <!-- Today's Content Plan Table -->
      <div class="q-mb-xl">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">
              <q-icon name="today" class="card-icon" />
              План на сегодня
              <span class="card-count q-ml-sm">{{ todaysContentPlans.length }}</span>
            </h2>
          </div>
          <div class="card-body no-padding" style="min-height: auto; max-height: 400px">
            <div v-if="todaysContentPlans.length === 0" class="empty-state">
              <q-icon name="event_busy" class="empty-state-icon" />
              <p class="empty-state-text">На сегодня планов нет</p>
            </div>

            <template v-else>
              <!-- Mobile Cards View -->
              <div class="mobile-cards show-mobile-only">
                <div
                  v-for="plan in todaysContentPlans"
                  :key="plan.id"
                  class="mobile-card"
                  :class="`status-border-${plan.status || 'NOT_PUBLISHED'}`"
                >
                  <div class="mobile-card-header">
                    <span class="mobile-card-title">{{ plan.post }}</span>
                    <div class="row items-center q-gutter-x-xs">
                      <span class="format-badge">{{ plan.format }}</span>
                      <q-badge
                        :color="getColorForStatus(plan.status)"
                        :label="getStatusLabel(plan.status)"
                        class="cursor-pointer"
                      >
                        <q-menu auto-close>
                          <q-list style="min-width: 150px">
                            <q-item
                              v-for="opt in statusOptions"
                              :key="opt.value"
                              clickable
                              @click="updateStatus(plan, opt.value)"
                            >
                              <q-item-section side>
                                <q-badge :color="getColorForStatus(opt.value)" rounded />
                              </q-item-section>
                              <q-item-section>{{ opt.label }}</q-item-section>
                            </q-item>
                          </q-list>
                        </q-menu>
                      </q-badge>
                    </div>
                  </div>
                  <div class="mobile-card-body">
                    <div class="mobile-card-row">
                      <span class="mobile-card-label">Проект:</span>
                      <span class="project-name">{{ getProjectName(plan.project) }}</span>
                    </div>
                    <div class="mobile-card-row">
                      <span class="mobile-card-label">Идея:</span>
                      <span class="mobile-card-idea">{{ plan.idea }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Desktop Table View -->
              <q-markup-table flat class="modern-table hide-mobile-only">
                <thead>
                  <tr>
                    <th>Проект</th>
                    <th>Пост</th>
                    <th>Формат</th>
                    <th>Статус</th>
                    <th>Идея</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="plan in todaysContentPlans" :key="plan.id">
                    <td class="project-name">{{ getProjectName(plan.project) }}</td>
                    <td class="post-name">{{ plan.post }}</td>
                    <td>
                      <span class="format-badge">{{ plan.format }}</span>
                    </td>
                    <td>
                      <q-badge
                        :color="getColorForStatus(plan.status)"
                        :label="getStatusLabel(plan.status)"
                        class="cursor-pointer"
                      >
                        <q-menu auto-close>
                          <q-list style="min-width: 150px">
                            <q-item
                              v-for="opt in statusOptions"
                              :key="opt.value"
                              clickable
                              @click="updateStatus(plan, opt.value)"
                            >
                              <q-item-section side>
                                <q-badge :color="getColorForStatus(opt.value)" rounded />
                              </q-item-section>
                              <q-item-section>{{ opt.label }}</q-item-section>
                            </q-item>
                          </q-list>
                        </q-menu>
                      </q-badge>
                    </td>
                    <td class="idea-cell">{{ plan.idea }}</td>
                  </tr>
                </tbody>
              </q-markup-table>
            </template>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <!-- Projects List Card -->
        <div class="grid-item">
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">
                <q-icon name="folder" class="card-icon" />
                Список проектов
                <span class="card-count q-ml-sm">{{ projectStore.getProjects.length }}</span>
              </h2>
              <div class="card-header-actions">
                <q-btn
                  flat
                  round
                  dense
                  icon="add"
                  class="btn-add-minimal q-mr-sm"
                  @click="openProjectDialog"
                >
                  <q-tooltip>Создать проект</q-tooltip>
                </q-btn>
              </div>
            </div>
            <div class="card-body no-padding">
              <div v-if="projectStore.getProjects.length === 0" class="empty-state">
                <q-icon name="folder_off" class="empty-state-icon" />
                <p class="empty-state-text">Проекты не найдены</p>
              </div>

              <div v-else class="projects-list">
                <div
                  v-for="row in projectStore.getProjects"
                  :key="row.id"
                  class="project-item cursor-pointer"
                  :class="{ 'project-item-selected': row.id === selectedProjectId }"
                  @click="selectProject(row.id)"
                >
                  <div class="project-item-main">
                    <div class="project-item-icon">
                      <q-icon name="folder" size="20px" />
                    </div>
                    <div class="project-item-info">
                      <div class="project-item-name">{{ row.name }}</div>
                      <div class="project-item-phone">{{ row.phone }}</div>
                    </div>
                    <q-icon
                      v-if="row.id === selectedProjectId"
                      name="check_circle"
                      color="primary"
                      size="20px"
                      class="q-ml-sm"
                    />
                  </div>
                  <div class="project-item-actions">
                    <q-btn
                      flat
                      round
                      dense
                      size="sm"
                      icon="edit"
                      color="grey-6"
                      @click.stop="editProject(row)"
                    >
                      <q-tooltip>Редактировать</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      dense
                      size="sm"
                      icon="delete_outline"
                      color="grey-6"
                      class="action-btn-danger"
                      @click.stop="confirmProjectDeletion(row)"
                    >
                      <q-tooltip>Удалить</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Content Plans List Card -->
        <div class="grid-item">
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">
                <q-icon name="list_alt" class="card-icon" />
                Контент-план
                <span class="card-count q-ml-sm">{{
                  contentPlanStore.getContentPlans.length
                }}</span>
              </h2>
              <div class="card-header-actions">
                <q-btn
                  flat
                  round
                  dense
                  icon="add"
                  class="btn-add-minimal q-mr-sm"
                  :disable="!selectedProjectId"
                  @click="openContentDialog"
                >
                  <q-tooltip>{{
                    selectedProjectId ? 'Добавить контент' : 'Выберите проект'
                  }}</q-tooltip>
                </q-btn>
                <pdf-printer-component
                  v-if="contentPlanStore.getContentPlans.length > 0"
                  :contentPlans="contentPlanStore.getContentPlans"
                  :selected-project="selectedProject"
                  :selected-project-id="selectedProjectId"
                />
              </div>
            </div>
            <div class="card-body no-padding">
              <div v-if="contentPlanStore.getContentPlans.length === 0" class="empty-state">
                <q-icon name="article" class="empty-state-icon" />
                <p class="empty-state-text">
                  {{ selectedProjectId ? 'Контент-план пуст' : 'Выберите проект' }}
                </p>
              </div>

              <!-- Mobile Cards View -->
              <draggable
                v-else
                v-model="contentPlansList"
                item-key="id"
                class="mobile-cards show-mobile-only"
                handle=".drag-handle-wrapper"
                ghost-class="drag-ghost"
                drag-class="drag-fallback"
                :force-fallback="true"
                :fallback-tolerance="3"
                :fallback-on-body="true"
                :animation="200"
                :scroll="true"
                :bubble-scroll="true"
                :scroll-sensitivity="150"
                :scroll-speed="20"
              >
                <template #item="{ element: row }">
                  <div
                    class="mobile-card"
                    :class="[
                      { 'mobile-card-selected': row.id === contentPlanForm.id },
                      `status-border-${row.status || 'NOT_PUBLISHED'}`,
                    ]"
                  >
                    <div class="mobile-card-header">
                      <div class="drag-handle-wrapper q-mr-sm">
                        <q-icon
                          name="drag_handle"
                          size="20px"
                          color="grey-6"
                          style="cursor: grab"
                        />
                      </div>
                      <span class="mobile-card-title">{{ row.post }}</span>
                      <div class="row items-center q-gutter-x-xs">
                        <span class="format-badge">{{ row.format }}</span>
                        <q-badge
                          :color="getColorForStatus(row.status)"
                          :label="getStatusLabel(row.status)"
                          class="cursor-pointer"
                        >
                          <q-menu auto-close>
                            <q-list style="min-width: 150px">
                              <q-item
                                v-for="opt in statusOptions"
                                :key="opt.value"
                                clickable
                                @click="updateStatus(row, opt.value)"
                              >
                                <q-item-section side>
                                  <q-badge :color="getColorForStatus(opt.value)" rounded />
                                </q-item-section>
                                <q-item-section>{{ opt.label }}</q-item-section>
                              </q-item>
                            </q-list>
                          </q-menu>
                        </q-badge>
                      </div>
                    </div>
                    <div class="mobile-card-body">
                      <div class="mobile-card-row">
                        <span class="mobile-card-label">Идея:</span>
                        <span class="mobile-card-idea">{{ row.idea }}</span>
                      </div>
                      <div class="mobile-card-row">
                        <span class="mobile-card-label">Дата:</span>
                        <span>{{ row.date.slice(0, 10) }}</span>
                      </div>
                    </div>
                    <div class="mobile-card-actions">
                      <q-btn
                        flat
                        dense
                        size="sm"
                        icon="edit"
                        label="Изменить"
                        no-caps
                        @click="editContentPlan(row)"
                      />
                      <q-btn
                        flat
                        dense
                        size="sm"
                        icon="delete_outline"
                        label="Удалить"
                        no-caps
                        color="negative"
                        @click="confirmContentPlanDeletion(row.id)"
                      />
                    </div>
                  </div>
                </template>
              </draggable>

              <!-- Desktop Table View (CSS Grid for Trello-like Dragging) -->
              <div
                v-if="contentPlanStore.getContentPlans.length > 0"
                class="modern-table-grid hide-mobile-only"
              >
                <div class="grid-header">
                  <div class="header-cell">#</div>
                  <div class="header-cell">Проект</div>
                  <div class="header-cell">Пост</div>
                  <div class="header-cell">Формат</div>
                  <div class="header-cell">Статус</div>
                  <div class="header-cell">Идея</div>
                  <div class="header-cell">Дата</div>
                  <div class="header-cell text-right">Действия</div>
                </div>

                <draggable
                  v-model="contentPlansList"
                  tag="div"
                  item-key="id"
                  class="grid-body"
                  ghost-class="drag-ghost"
                  drag-class="drag-fallback"
                  :force-fallback="true"
                  :fallback-tolerance="3"
                  :fallback-on-body="true"
                  :animation="200"
                  :scroll="true"
                  :bubble-scroll="true"
                  :scroll-sensitivity="150"
                  :scroll-speed="20"
                >
                  <template #item="{ element: row, index }">
                    <div
                      :class="{
                        'selected-row': row.id === contentPlanForm.id,
                      }"
                      class="grid-row draggable-row"
                    >
                      <div class="grid-cell text-muted">{{ index + 1 }}</div>
                      <div class="grid-cell project-name">
                        {{ getProjectName(row.project) }}
                      </div>
                      <div class="grid-cell post-name">{{ row.post }}</div>
                      <div class="grid-cell">
                        <span class="format-badge">{{ row.format }}</span>
                      </div>
                      <div class="grid-cell">
                        <q-badge
                          :color="getColorForStatus(row.status)"
                          :label="getStatusLabel(row.status)"
                          class="cursor-pointer"
                        >
                          <q-menu auto-close>
                            <q-list style="min-width: 150px">
                              <q-item
                                v-for="opt in statusOptions"
                                :key="opt.value"
                                clickable
                                @click="updateStatus(row, opt.value)"
                              >
                                <q-item-section side>
                                  <q-badge :color="getColorForStatus(opt.value)" rounded />
                                </q-item-section>
                                <q-item-section>{{ opt.label }}</q-item-section>
                              </q-item>
                            </q-list>
                          </q-menu>
                        </q-badge>
                      </div>
                      <div class="grid-cell idea-cell">{{ row.idea }}</div>
                      <div class="grid-cell">{{ row.date.slice(0, 10) }}</div>
                      <div class="grid-cell action-buttons justify-end">
                        <q-btn
                          flat
                          round
                          dense
                          size="sm"
                          icon="edit"
                          color="grey-6"
                          @click="editContentPlan(row)"
                        >
                          <q-tooltip>Редактировать</q-tooltip>
                        </q-btn>
                        <q-btn
                          flat
                          round
                          dense
                          size="sm"
                          icon="delete_outline"
                          color="grey-6"
                          class="action-btn-danger"
                          @click="confirmContentPlanDeletion(row.id)"
                        >
                          <q-tooltip>Удалить</q-tooltip>
                        </q-btn>
                      </div>
                    </div>
                  </template>
                </draggable>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Project Dialog -->
      <q-dialog v-model="showProjectDialog" persistent>
        <q-card class="dialog-card">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">
              {{ editingProject ? 'Редактировать проект' : 'Создать проект' }}
            </div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup @click="cancelEdit" />
          </q-card-section>

          <q-card-section class="q-pt-md">
            <q-form @submit.prevent="editingProject ? saveEditedProject() : addToProjectList()">
              <div class="form-group q-mb-md">
                <label class="form-label">Название проекта</label>
                <q-input
                  v-model="form.name"
                  outlined
                  placeholder="Введите название"
                  lazy-rules
                  :rules="[(val) => val.length > 0 || 'Заполните поле']"
                  class="modern-input"
                />
              </div>
              <div class="form-group q-mb-lg">
                <label class="form-label">Телефон</label>
                <q-input
                  v-model="form.phone"
                  outlined
                  mask="998 (##) ### - ## - ##"
                  fill-mask
                  placeholder="998 (__) ___ - __ - __"
                  lazy-rules
                  :rules="[(val) => val.length > 0 || 'Заполните поле']"
                  class="modern-input"
                />
              </div>

              <div class="form-actions row justify-end q-gutter-sm">
                <q-btn
                  flat
                  label="Отмена"
                  color="grey-7"
                  v-close-popup
                  @click="cancelEdit"
                  class="btn-cancel"
                />
                <q-btn
                  type="submit"
                  :label="editingProject ? 'Сохранить' : 'Создать'"
                  unelevated
                  color="primary"
                  class="btn-primary-action"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>
      <!-- Content Dialog -->
      <q-dialog v-model="showContentDialog" persistent>
        <q-card class="dialog-card">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">
              {{ editingContent ? 'Редактировать контент' : 'Добавить контент' }}
            </div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup @click="cancelContentEdit" />
          </q-card-section>

          <q-card-section class="q-pt-md">
            <q-form @submit.prevent="editingContent ? saveEditedContentPlan() : addToContentList()">
              <div class="form-group q-mb-md">
                <label class="form-label">Пост</label>
                <q-input
                  v-model="contentPlanForm.post"
                  outlined
                  placeholder="Название поста"
                  lazy-rules
                  :rules="[(val) => val.length > 0 || 'Заполните поле']"
                  class="modern-input"
                />
              </div>
              <div class="form-group q-mb-md">
                <label class="form-label">Формат</label>
                <q-select
                  v-model="contentPlanForm.format"
                  :options="options"
                  outlined
                  placeholder="Выберите формат"
                  lazy-rules
                  :rules="[(val) => !!val || 'Выберите формат']"
                  class="modern-input"
                />
              </div>
              <div class="form-group q-mb-md">
                <label class="form-label">Статус</label>
                <q-select
                  v-model="contentPlanForm.status"
                  :options="statusOptions"
                  outlined
                  emit-value
                  map-options
                  placeholder="Выберите статус"
                  class="modern-input"
                />
              </div>
              <div class="form-group q-mb-md">
                <label class="form-label">Дата</label>
                <q-input
                  v-model="contentPlanForm.date"
                  type="date"
                  outlined
                  lazy-rules
                  :rules="[(val) => val.length > 0 || 'Выберите дату']"
                  class="modern-input"
                />
              </div>
              <div class="form-group q-mb-lg">
                <label class="form-label">Идея</label>
                <q-input
                  v-model="contentPlanForm.idea"
                  outlined
                  autogrow
                  placeholder="Опишите идею контента"
                  lazy-rules
                  :rules="[(val) => val.length > 0 || 'Заполните поле']"
                  class="modern-input"
                />
              </div>

              <div class="form-actions row justify-end q-gutter-sm">
                <q-btn
                  flat
                  label="Отмена"
                  color="grey-7"
                  v-close-popup
                  @click="cancelContentEdit"
                  class="btn-cancel"
                />
                <q-btn
                  type="submit"
                  :label="editingContent ? 'Сохранить' : 'Добавить'"
                  unelevated
                  color="primary"
                  class="btn-primary-action"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useProjectStore } from 'stores/project.js'
import { useQuasar } from 'quasar'
import { useContentPlanStore } from 'stores/content-plan.js'
import { api } from 'boot/axios.js'
import PdfPrinterComponent from 'components/PdfPrinterComponent.vue'
import draggable from 'vuedraggable'
import { useStatusFormatting } from '@/composables/useStatusFormatting'
import { getProjectName } from '@/utils/projectHelpers'
import { getTodayISO, getWeekRange, getMonthRange } from '@/utils/dateHelpers'
import { FORMAT_OPTIONS } from '@/constants/status'

const form = ref({ phone: '', name: '' })
const selectedProjectId = ref(null)
const editingProject = ref(null)
const showProjectDialog = ref(false)
const projectStore = useProjectStore()
const contentPlanStore = useContentPlanStore()
const q = useQuasar()

const todaysContentPlans = ref([])
const weekCount = ref(0)
const monthCount = ref(0)

const { statusOptions, getStatusLabel, getColorForStatus } = useStatusFormatting()

async function fetchTodaysContentPlans() {
  const today = getTodayISO()
  try {
    // Today
    const response = await api.get('/content_plans?date=' + today + '&itemsPerPage=1000')
    todaysContentPlans.value = response.data.member

    // Week
    const { start: weekStart, end: weekEnd } = getWeekRange()
    const weekPlans = await contentPlanStore.fetchContentPlansByDateRange(weekStart, weekEnd)
    weekCount.value = weekPlans.length

    // Month
    const { start: monthStart, end: monthEnd } = getMonthRange()
    const monthPlans = await contentPlanStore.fetchContentPlansByDateRange(monthStart, monthEnd)
    monthCount.value = monthPlans.length

    // Published
    await contentPlanStore.fetchMyPublishedContentPlansCount()
  } catch (e) {
    console.error('Error fetching stats:', e)
  }
}

function openProjectDialog() {
  cancelEdit()
  showProjectDialog.value = true
}

function addToProjectList() {
  projectStore.createProject(form.value).then(() => {
    projectStore.fetchProjects()
    showProjectDialog.value = false
    q.notify({
      message: 'Проект успешно создан',
      type: 'positive',
      position: 'top',
    })
  })
  form.value = { name: '', phone: '' }
}

function selectProject(id) {
  selectedProjectId.value = id === selectedProjectId.value ? null : id
}

function editProject(project) {
  selectedProjectId.value = project.id
  editingProject.value = project
  form.value = { name: project.name, phone: project.phone }
  showProjectDialog.value = true
}

function saveEditedProject() {
  projectStore.patchProject(form.value, selectedProjectId.value).then(() => {
    projectStore.fetchProjects()
    showProjectDialog.value = false
    q.notify({
      message: 'Проект успешно обновлён',
      type: 'positive',
      position: 'top',
    })
  })
  cancelEdit()
}

function cancelEdit() {
  editingProject.value = null
  form.value = { name: '', phone: '' }
  showProjectDialog.value = false
}

function deleteProject(id) {
  projectStore.deleteProject(id).then(() => {
    projectStore.fetchProjects()
    q.notify({
      message: 'Проект удалён',
      type: 'positive',
      position: 'top',
    })
  })
}

function confirmProjectDeletion(project) {
  q.dialog({
    title: 'Удаление проекта',
    message: `Вы уверены, что хотите удалить проект "${project.name}"?`,
    cancel: { flat: true, label: 'Отмена' },
    ok: { color: 'negative', label: 'Удалить' },
    persistent: true,
  }).onOk(() => deleteProject(project.id))
}

const selectedProject = computed(
  () => projectStore.getProjects.find((p) => p.id === selectedProjectId.value) || null,
)

watch(selectedProjectId, async () => {
  if (selectedProjectId.value) {
    contentPlanStore.fetchContentPlan(selectedProjectId.value)
  } else {
    contentPlanStore.clearContentPlans()
  }
})

// Content plan
const contentPlanForm = ref({
  post: '',
  format: 'Post',
  idea: '',
  date: '',
  id: null,
  status: 'NOT_PUBLISHED',
  position: 0,
})
const editingContent = ref(null)
const showContentDialog = ref(false)
const options = FORMAT_OPTIONS

async function updateStatus(plan, newStatus) {
  if (plan.status === newStatus) return

  try {
    await contentPlanStore.patchContentPlan({ status: newStatus }, plan.id)
    if (selectedProjectId.value) {
      await contentPlanStore.fetchContentPlan(selectedProjectId.value)
    }
    await fetchTodaysContentPlans()
    q.notify({
      message: 'Статус обновлен',
      type: 'positive',
      position: 'top',
      timeout: 1000,
    })
  } catch (e) {
    console.error('Error updating status:', e)
    q.notify({
      message: 'Ошибка при обновлении статуса',
      type: 'negative',
      position: 'top',
    })
  }
}



const contentPlansList = computed({
  get: () => contentPlanStore.getContentPlans,
  set: (val) => {
    contentPlanStore.setContentPlans(val)
    persistOrder(val)
  },
})

async function persistOrder(plans) {
  // Show loading notification
  const dismiss = q.notify({
    group: false,
    timeout: 0,
    spinner: true,
    message: 'Сохранение порядка...',
    position: 'top',
  })

  // Persist changes to backend
  try {
    const updatePromises = []
    plans.forEach((p, i) => {
      const newPos = i + 1
      if (p.position !== newPos) {
        p.position = newPos
        updatePromises.push(contentPlanStore.patchContentPlan({ position: newPos }, p.id))
      }
    })

    await Promise.all(updatePromises)

    dismiss()
    q.notify({
      message: 'Порядок сохранен',
      type: 'positive',
      position: 'top',
      timeout: 1000,
    })
  } catch (e) {
    dismiss()
    console.error('Error persisting order:', e)
    q.notify({
      message: 'Ошибка при сохранении порядка',
      type: 'negative',
      position: 'top',
    })
    // Refresh from server to revert if failed
    if (selectedProjectId.value) {
      contentPlanStore.fetchContentPlan(selectedProjectId.value)
    }
  }
}



function openContentDialog() {
  cancelContentEdit()
  showContentDialog.value = true
}

function addToContentList() {
  if (!selectedProjectId.value) {
    q.notify({ message: 'Выберите проект!', type: 'warning', position: 'top' })
    return
  }
  const newRow = {
    project: '/api/projects/' + selectedProjectId.value,
    post: contentPlanForm.value.post,
    format: contentPlanForm.value.format,
    idea: contentPlanForm.value.idea,
    date: contentPlanForm.value.date,
    status: contentPlanForm.value.status,
    position: contentPlanForm.value.position || contentPlanStore.getContentPlans.length + 1,
  }
  contentPlanStore.createContentPlan(newRow).then(() => {
    contentPlanStore.fetchContentPlan(selectedProjectId.value)
    fetchTodaysContentPlans()
    showContentDialog.value = false
    q.notify({
      message: 'Контент добавлен',
      type: 'positive',
      position: 'top',
    })
  })
  contentPlanForm.value = {
    post: '',
    format: 'Post',
    idea: '',
    date: '',
    id: null,
    status: 'NOT_PUBLISHED',
    position: 0,
  }
}

function editContentPlan(plan) {
  editingContent.value = plan
  contentPlanForm.value = {
    post: plan.post,
    format: plan.format,
    idea: plan.idea,
    date: plan.date.slice(0, 10),
    id: plan.id,
    status: plan.status || 'NOT_PUBLISHED',
    position: plan.position || 0,
  }
  showContentDialog.value = true
}

function cancelContentEdit() {
  editingContent.value = null
  contentPlanForm.value = {
    post: '',
    format: 'Post',
    idea: '',
    date: '',
    id: null,
    status: 'NOT_PUBLISHED',
    position: 0,
  }
  showContentDialog.value = false
}

function saveEditedContentPlan() {
  contentPlanStore
    .patchContentPlan(
      {
        post: contentPlanForm.value.post,
        format: contentPlanForm.value.format,
        date: contentPlanForm.value.date,
        idea: contentPlanForm.value.idea,
        status: contentPlanForm.value.status,
        position: contentPlanForm.value.position,
      },
      editingContent.value.id,
    )
    .then(() => {
      contentPlanStore.fetchContentPlan(selectedProjectId.value)
      fetchTodaysContentPlans()
      showContentDialog.value = false
      q.notify({
        message: 'Контент обновлён',
        type: 'positive',
        position: 'top',
      })
    })
  cancelContentEdit()
}

function deleteContentPlan(id) {
  contentPlanStore.deleteContentPlan(id).then(() => {
    contentPlanStore.fetchContentPlan(selectedProjectId.value)
    fetchTodaysContentPlans()
    q.notify({
      message: 'Контент удалён',
      type: 'positive',
      position: 'top',
    })
  })
}

function confirmContentPlanDeletion(contentPlanId) {
  q.dialog({
    title: 'Удаление контента',
    message: 'Вы уверены, что хотите удалить этот контент?',
    cancel: { flat: true, label: 'Отмена' },
    ok: { color: 'negative', label: 'Удалить' },
    persistent: true,
  }).onOk(() => deleteContentPlan(contentPlanId))
}

onMounted(() => {
  projectStore.fetchProjects()
  fetchTodaysContentPlans()
})
</script>

<style scoped lang="scss">
.btn-add-minimal {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  width: 32px;
  height: 32px;

  &:hover {
    background: #3b82f6;
    color: white;
  }
}

.dialog-card {
  width: 450px;
  max-width: 95vw;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);

  @media (max-width: 599px) {
    width: 90vw;
  }
}

.index-page {
  padding: 0;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.5rem;

  @media (max-width: 599px) {
    padding: 1rem;
  }
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem;

  @media (max-width: 599px) {
    font-size: 1.5rem;
  }
}

.page-subtitle {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;

  @media (max-width: 1023px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 599px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;

    .stat-card {
      padding: 1rem;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.75rem;
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      flex-shrink: 0;

      :deep(.q-icon) {
        font-size: 1.25rem !important;
      }
    }

    .stat-value {
      font-size: 1.25rem;
    }

    .stat-label {
      font-size: 0.75rem;
    }
  }
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-card-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  filter: grayscale(0.8);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon-blue {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.stat-icon-purple {
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
}

.stat-icon-green {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.stat-icon-orange {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.content-grid {
  display: grid;
  grid-template-columns: 3fr 7fr;
  gap: 1.5rem;

  @media (max-width: 1023px) {
    grid-template-columns: 1fr;
  }
}

.grid-item {
  min-width: 0;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: none;

  @media (max-width: 599px) {
    padding: 1rem;
  }
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-icon {
  color: #3b82f6;
  font-size: 1.25rem;
}

.card-count {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.625rem;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border-radius: 9999px;
}

.card-header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-body {
  padding: 1.5rem;
  min-height: 500px;
  max-height: 500px;
  overflow-y: auto;

  @media (max-width: 599px) {
    padding: 1rem;
    min-height: auto;
  }

  &.no-padding {
    padding: 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  @media (max-width: 599px) {
    grid-template-columns: 1fr;
  }
}

.form-grid-3 {
  grid-template-columns: repeat(3, 1fr);

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-group-full {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.modern-input :deep(.q-field__control) {
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.btn-primary-action {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  font-weight: 500;
  padding: 0.625rem 1.5rem;
}

.btn-cancel {
  color: var(--text-secondary);
}

.form-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.modern-table-grid {
  width: 100%;
  display: flex;
  flex-direction: column;
  user-select: none;
}

.grid-header {
  display: grid;
  grid-template-columns: 50px 1.5fr 2fr 100px 150px 2fr 100px 100px;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.02);
}

.header-cell {
  color: var(--text-muted);
  font-weight: 500;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.grid-body {
  display: flex;
  flex-direction: column;
}

.grid-row {
  display: grid;
  grid-template-columns: 50px 1.5fr 2fr 100px 150px 2fr 100px 100px;
  gap: 1rem;
  padding: 1rem;
  align-items: center;
  border-bottom: 1px solid var(--border-light);
  transition: background-color 0.2s ease;
  background: var(--bg-card);
  cursor: grab;

  &:hover {
    background-color: var(--bg-hover);
  }

  &:active {
    cursor: grabbing;
  }

  &.selected-row {
    background-color: rgba(59, 130, 246, 0.08);
    border-left: 3px solid #3b82f6;
    padding-left: calc(1rem - 3px);
  }
}

.grid-cell {
  font-size: 0.875rem;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &.post-name {
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    font-weight: 500;
    color: var(--text-primary);
  }

  &.idea-cell {
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    font-size: 0.8125rem;
  }
}

.text-right {
  text-align: right;
}

.text-muted {
  color: var(--text-muted);
}

.justify-end {
  justify-content: flex-end;
  display: flex;
}



.drag-handle {
  cursor: move;
}

.dragged-item {
  opacity: 0.05 !important;
  background-color: var(--bg-tertiary) !important;
  border: 2px dashed #3b82f6 !important;
}

.drag-over {
  background-color: rgba(59, 130, 246, 0.1) !important;
  transform: translateY(15px);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: -10px;
    left: 0;
    right: 0;
    height: 4px;
    background: #3b82f6;
    border-radius: 4px;
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
    animation: drag-pulse 1s infinite;
  }
}

@keyframes drag-pulse {
  0% {
    opacity: 0.6;
    transform: scaleX(0.98);
  }
  50% {
    opacity: 1;
    transform: scaleX(1);
  }
  100% {
    opacity: 0.6;
    transform: scaleX(0.98);
  }
}

.selected-row {
  background-color: rgba(59, 130, 246, 0.1) !important;
  border-left: 3px solid #3b82f6;
}

.action-buttons {
  display: flex;
  gap: 0.375rem;
  align-items: center;
}

.projects-list {
  display: flex;
  flex-direction: column;
}

.project-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-light);
  transition: all 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: var(--bg-hover);
  }
}

.project-item-selected {
  background-color: rgba(59, 130, 246, 0.08);
  border-left: 3px solid #3b82f6;
  padding-left: calc(1.25rem - 3px);
}

.project-item-main {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.project-item-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.875rem;
  flex-shrink: 0;
}

.project-item-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.project-item-name {
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-item-phone {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.project-item-actions {
  display: flex;
  gap: 0.25rem;
  margin-left: 0.5rem;
}

.action-btn-icon {
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary) !important;
  }
}

.action-btn-danger:hover {
  background: rgba(239, 68, 68, 0.1) !important;
  color: #ef4444 !important;
}

.project-name {
  font-weight: 500;
  color: var(--text-primary);
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-name {
  font-weight: 500;
  color: var(--text-primary);
  max-width: 200px;
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.format-badge {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0.25rem 0.5rem;
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  border-radius: 4px;
}

.idea-cell {
  max-width: 250px;
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  color: var(--text-muted);
}

.empty-state-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
  opacity: 0.4;
}

.empty-state-text {
  font-size: 0.875rem;
  margin: 0;
}

// Responsive visibility
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

// Mobile Cards
.mobile-cards {
  padding: 0.75rem;
  user-select: none;
}

.mobile-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-bottom: 0.75rem;
  transition: all 0.2s ease;

  &:last-child {
    margin-bottom: 0;
  }

  &.status-border-PUBLISHED {
    border-left: 4px solid var(--q-positive);
  }
  &.status-border-CANCELED {
    border-left: 4px solid var(--q-negative);
  }
  &.status-border-RESCHEDULED {
    border-left: 4px solid var(--q-orange);
  }
  &.status-border-NOT_PUBLISHED {
    border-left: 4px solid var(--q-grey-7);
  }
}

.mobile-card-selected {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.mobile-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.mobile-card-title {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-primary);
  margin-right: auto;
  word-break: break-word;
}

.mobile-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-light);
}

.mobile-card-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.mobile-card-label {
  color: var(--text-muted);
}

.mobile-card-idea {
  color: var(--text-secondary);
  text-align: right;
  max-width: 60%;
  white-space: normal;
  word-wrap: break-word;
}

.mobile-card-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

// Responsive form
@media (max-width: 599px) {
  .form-actions {
    flex-direction: column;

    .q-btn {
      width: 100%;
    }
  }

  .btn-primary-action {
    order: -1;
  }
}

// Responsive page header
@media (max-width: 599px) {
  .page-header {
    margin-bottom: 1.25rem;
  }

  .page-title {
    font-size: 1.375rem;
  }
}
.modern-table {
  min-width: 100%;
}

.drag-ghost {
  opacity: 0.5;
  background: var(--bg-tertiary);
  border: 2px dashed #3b82f6;
}

.drag-fallback {
  opacity: 1 !important;
  background: var(--bg-card);
  border: 1px solid #3b82f6;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  transform: scale(1.02);
  z-index: 9999 !important;
  cursor: grabbing !important;
  display: grid !important; /* Ensure it stays a grid item */
}
</style>
