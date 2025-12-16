<template>
  <q-page class="index-page">
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">Мои проекты</h1>
        <p class="page-subtitle">Управление проектами и контент-планами</p>
      </div>

      <div class="content-grid">
        <!-- Project Form Card -->
        <div class="grid-item">
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">
                <q-icon name="add_circle" class="card-icon" />
                {{ editingProject ? 'Редактировать проект' : 'Создать проект' }}
              </h2>
            </div>
            <div class="card-body">
              <q-form @submit.prevent="editingProject ? saveEditedProject() : addToProjectList()">
                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label">Название проекта</label>
                    <q-input
                      v-model="form.name"
                      outlined
                      placeholder="Введите название"
                      lazy-rules
                      :rules="[val => val.length > 0 || 'Заполните поле']"
                      class="modern-input"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Телефон</label>
                    <q-input
                      v-model="form.phone"
                      outlined
                      mask="998 (##) ### - ## - ##"
                      fill-mask
                      placeholder="998 (__) ___ - __ - __"
                      lazy-rules
                      :rules="[val => val.length > 0 || 'Заполните поле']"
                      class="modern-input"
                    />
                  </div>
                </div>
                <div class="form-actions">
                  <q-btn
                    v-if="editingProject"
                    flat
                    label="Отмена"
                    @click="cancelEdit"
                    class="btn-cancel"
                  />
                  <q-btn
                    type="submit"
                    :label="editingProject ? 'Сохранить' : 'Создать'"
                    unelevated
                    class="btn-primary-action"
                  />
                </div>
              </q-form>
            </div>
          </div>
        </div>

        <!-- Projects List Card -->
        <div class="grid-item">
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">
                <q-icon name="folder" class="card-icon" />
                Список проектов
              </h2>
              <span class="card-count">{{ projectStore.getProjects.length }}</span>
            </div>
            <div class="card-body no-padding">
              <div v-if="projectStore.getProjects.length === 0" class="empty-state">
                <q-icon name="folder_off" class="empty-state-icon" />
                <p class="empty-state-text">Проекты не найдены</p>
              </div>
              
              <!-- Mobile Cards View -->
              <div v-else class="mobile-cards show-mobile-only">
                <div
                  v-for="row in projectStore.getProjects"
                  :key="row.id"
                  class="mobile-card"
                  :class="{ 'mobile-card-selected': row.id === selectedProjectId }"
                >
                  <div class="mobile-card-header">
                    <span class="mobile-card-title">{{ row.name }}</span>
                    <q-btn
                      flat
                      round
                      dense
                      size="sm"
                      :icon="row.id === selectedProjectId ? 'check_circle' : 'radio_button_unchecked'"
                      :color="row.id === selectedProjectId ? 'primary' : 'grey-6'"
                      @click="selectProject(row.id)"
                    >
                      <q-tooltip>{{ row.id === selectedProjectId ? 'Выбрано' : 'Выбрать' }}</q-tooltip>
                    </q-btn>
                  </div>
                  <div class="mobile-card-body">
                    <div class="mobile-card-row">
                      <span class="mobile-card-label">Менеджер:</span>
                      <span>{{ row.createdBy.givenName }}</span>
                    </div>
                    <div class="mobile-card-row">
                      <span class="mobile-card-label">Телефон:</span>
                      <span>{{ row.phone }}</span>
                    </div>
                  </div>
                  <div class="mobile-card-actions">
                    <q-btn flat dense size="sm" icon="edit" label="Изменить" no-caps @click="editProject(row)" />
                    <q-btn flat dense size="sm" icon="delete_outline" label="Удалить" no-caps color="negative" @click="confirmProjectDeletion(row)" />
                  </div>
                </div>
              </div>
              
              <!-- Desktop Table View -->
              <q-markup-table v-if="projectStore.getProjects.length > 0" flat class="modern-table hide-mobile-only">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Проект</th>
                    <th class="hide-mobile">Менеджер</th>
                    <th class="hide-mobile">Телефон</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, index) in projectStore.getProjects"
                    :key="row.id"
                    :class="{ 'selected-row': row.id === selectedProjectId }"
                  >
                    <td>{{ index + 1 }}</td>
                    <td class="project-name">{{ row.name }}</td>
                    <td class="hide-mobile">{{ row.createdBy.givenName }}</td>
                    <td class="hide-mobile">{{ row.phone }}</td>
                    <td>
                      <div class="action-buttons">
                        <q-btn
                          :flat="row.id !== selectedProjectId"
                          :unelevated="row.id === selectedProjectId"
                          dense
                          size="sm"
                          :icon="row.id === selectedProjectId ? 'check_circle' : 'playlist_add'"
                          :color="row.id === selectedProjectId ? 'primary' : 'grey-6'"
                          class="action-btn-icon"
                          @click="selectProject(row.id)"
                        >
                          <q-tooltip>{{ row.id === selectedProjectId ? 'Выбрано' : 'Выбрать для контента' }}</q-tooltip>
                        </q-btn>
                        <q-btn
                          flat
                          dense
                          size="sm"
                          icon="edit"
                          color="grey-6"
                          class="action-btn-icon"
                          @click="editProject(row)"
                        >
                          <q-tooltip>Редактировать</q-tooltip>
                        </q-btn>
                        <q-btn
                          flat
                          dense
                          size="sm"
                          icon="delete_outline"
                          color="grey-6"
                          class="action-btn-icon action-btn-danger"
                          @click="confirmProjectDeletion(row)"
                        >
                          <q-tooltip>Удалить</q-tooltip>
                        </q-btn>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
            </div>
          </div>
        </div>

        <!-- Content Plan Form Card -->
        <div class="grid-item">
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">
                <q-icon name="post_add" class="card-icon" />
                {{ editingContent ? 'Редактировать контент' : 'Добавить контент' }}
              </h2>
            </div>
            <div class="card-body">
              <q-form @submit.prevent="editingContent ? saveEditedContentPlan() : addToContentList()">
                <div class="form-grid form-grid-3">
                  <div class="form-group">
                    <label class="form-label">Пост</label>
                    <q-input
                      v-model="contentPlanForm.post"
                      outlined
                      placeholder="Название поста"
                      lazy-rules
                      :rules="[val => val.length > 0 || 'Заполните поле']"
                      class="modern-input"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Формат</label>
                    <q-select
                      v-model="contentPlanForm.format"
                      :options="options"
                      outlined
                      placeholder="Выберите формат"
                      lazy-rules
                      :rules="[val => val.length > 0 || 'Выберите формат']"
                      class="modern-input"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Дата</label>
                    <q-input
                      v-model="contentPlanForm.date"
                      type="date"
                      outlined
                      lazy-rules
                      :rules="[val => val.length > 0 || 'Выберите дату']"
                      class="modern-input"
                    />
                  </div>
                  <div class="form-group form-group-full">
                    <label class="form-label">Идея</label>
                    <q-input
                      v-model="contentPlanForm.idea"
                      outlined
                      autogrow
                      placeholder="Опишите идею контента"
                      lazy-rules
                      :rules="[val => val.length > 0 || 'Заполните поле']"
                      class="modern-input"
                    />
                  </div>
                </div>
                <div class="form-actions">
                  <q-btn
                    v-if="editingContent"
                    flat
                    label="Отмена"
                    @click="cancelContentEdit"
                    class="btn-cancel"
                  />
                  <q-btn
                    type="submit"
                    :label="editingContent ? 'Сохранить' : 'Добавить'"
                    unelevated
                    class="btn-primary-action"
                    :disable="!selectedProjectId"
                  />
                </div>
                <p v-if="!selectedProjectId" class="form-hint">
                  <q-icon name="info" size="xs" /> Выберите проект для добавления контента
                </p>
              </q-form>
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
              </h2>
              <div class="card-header-actions">
                <span class="card-count">{{ contentPlanStore.getContentPlans.length }}</span>
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
              <div v-else class="mobile-cards show-mobile-only">
                <div
                  v-for="(row, index) in contentPlanStore.getContentPlans"
                  :key="index"
                  class="mobile-card"
                  :class="{ 'mobile-card-selected': row.id === contentPlanForm.id }"
                >
                  <div class="mobile-card-header">
                    <span class="mobile-card-title">{{ row.post }}</span>
                    <span class="format-badge">{{ row.format }}</span>
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
                    <q-btn flat dense size="sm" icon="edit" label="Изменить" no-caps @click="editContentPlan(row)" />
                    <q-btn flat dense size="sm" icon="delete_outline" label="Удалить" no-caps color="negative" @click="confirmContentPlanDeletion(row.id)" />
                  </div>
                </div>
              </div>
              
              <!-- Desktop Table View -->
              <q-markup-table v-if="contentPlanStore.getContentPlans.length > 0" flat class="modern-table hide-mobile-only">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Пост</th>
                    <th>Формат</th>
                    <th>Идея</th>
                    <th>Дата</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, index) in contentPlanStore.getContentPlans"
                    :key="index"
                    :class="{ 'selected-row': row.id === contentPlanForm.id }"
                  >
                    <td>{{ index + 1 }}</td>
                    <td class="post-name">{{ row.post }}</td>
                    <td>
                      <span class="format-badge">{{ row.format }}</span>
                    </td>
                    <td class="idea-cell">{{ row.idea }}</td>
                    <td>{{ row.date.slice(0, 10) }}</td>
                    <td>
                      <div class="action-buttons">
                        <q-btn flat round dense size="sm" icon="edit" color="grey-6" @click="editContentPlan(row)">
                          <q-tooltip>Редактировать</q-tooltip>
                        </q-btn>
                        <q-btn flat round dense size="sm" icon="delete_outline" color="grey-6" class="action-btn-danger" @click="confirmContentPlanDeletion(row.id)">
                          <q-tooltip>Удалить</q-tooltip>
                        </q-btn>
                      </div>
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
import { useProjectStore } from 'stores/project.js'
import { useQuasar } from 'quasar'
import { useContentPlanStore } from 'stores/content-plan.js'
import PdfPrinterComponent from 'components/PdfPrinterComponent.vue'

const form = ref({ phone: '', name: '' })
const selectedProjectId = ref(null)
const editingProject = ref(null)
const projectStore = useProjectStore()
const contentPlanStore = useContentPlanStore()
const q = useQuasar()

function addToProjectList() {
  projectStore.createProject(form.value).then(() => {
    projectStore.fetchProjects()
    q.notify({
      message: 'Проект успешно создан',
      type: 'positive',
      position: 'top'
    })
  })
  form.value = { name: '', phone: '' }
}

function selectProject(id) {
  selectedProjectId.value = id === selectedProjectId.value ? null : id
}

function editProject(project) {
  if (project.id === selectedProjectId.value && editingProject.value) {
    cancelEdit()
  } else {
    selectedProjectId.value = project.id
    editingProject.value = project
    form.value = { name: project.name, phone: project.phone }
  }
}

function saveEditedProject() {
  projectStore.patchProject(form.value, selectedProjectId.value).then(() => {
    projectStore.fetchProjects()
    q.notify({
      message: 'Проект успешно обновлён',
      type: 'positive',
      position: 'top'
    })
  })
  cancelEdit()
}

function cancelEdit() {
  editingProject.value = null
  form.value = { name: '', phone: '' }
  selectedProjectId.value = null
}

function deleteProject(id) {
  projectStore.deleteProject(id).then(() => {
    projectStore.fetchProjects()
    q.notify({
      message: 'Проект удалён',
      type: 'positive',
      position: 'top'
    })
  })
}

function confirmProjectDeletion(project) {
  q.dialog({
    title: 'Удаление проекта',
    message: `Вы уверены, что хотите удалить проект "${project.name}"?`,
    cancel: { flat: true, label: 'Отмена' },
    ok: { color: 'negative', label: 'Удалить' },
    persistent: true
  }).onOk(() => deleteProject(project.id))
}

const selectedProject = computed(
  () => projectStore.getProjects.find((p) => p.id === selectedProjectId.value) || null
)

watch(selectedProjectId, async () => {
  if (selectedProjectId.value) {
    contentPlanStore.fetchContentPlan(selectedProjectId.value)
  } else {
    contentPlanStore.clearContentPlans()
  }
})

// Content plan
const contentPlanForm = ref({ post: '', format: '', idea: '', date: '', id: null })
const editingContent = ref(null)
const options = ref(['Reels', 'Carousel', 'Post', 'Animation', 'Story'])

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
    date: contentPlanForm.value.date
  }
  contentPlanStore.createContentPlan(newRow).then(() => {
    contentPlanStore.fetchContentPlan(selectedProjectId.value)
    q.notify({
      message: 'Контент добавлен',
      type: 'positive',
      position: 'top'
    })
  })
  contentPlanForm.value = { post: '', format: '', idea: '', date: '', id: null }
}

function editContentPlan(plan) {
  if (editingContent.value?.id === plan.id) {
    cancelContentEdit()
  } else {
    editingContent.value = plan
    contentPlanForm.value = {
      post: plan.post,
      format: plan.format,
      idea: plan.idea,
      date: plan.date.slice(0, 10),
      id: plan.id
    }
  }
}

function cancelContentEdit() {
  editingContent.value = null
  contentPlanForm.value = { post: '', format: '', idea: '', date: '', id: null }
}

function saveEditedContentPlan() {
  contentPlanStore.patchContentPlan({
    post: contentPlanForm.value.post,
    format: contentPlanForm.value.format,
    date: contentPlanForm.value.date,
    idea: contentPlanForm.value.idea
  }, editingContent.value.id).then(() => {
    contentPlanStore.fetchContentPlan(selectedProjectId.value)
    q.notify({
      message: 'Контент обновлён',
      type: 'positive',
      position: 'top'
    })
  })
  cancelContentEdit()
}

function deleteContentPlan(id) {
  contentPlanStore.deleteContentPlan(id).then(() => {
    contentPlanStore.fetchContentPlan(selectedProjectId.value)
    q.notify({
      message: 'Контент удалён',
      type: 'positive',
      position: 'top'
    })
  })
}

function confirmContentPlanDeletion(contentPlanId) {
  q.dialog({
    title: 'Удаление контента',
    message: 'Вы уверены, что хотите удалить этот контент?',
    cancel: { flat: true, label: 'Отмена' },
    ok: { color: 'negative', label: 'Удалить' },
    persistent: true
  }).onOk(() => deleteContentPlan(contentPlanId))
}

onMounted(() => {
  projectStore.fetchProjects()
})
</script>

<style scoped lang="scss">
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

.content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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

  @media (max-width: 599px) {
    padding: 1rem;
  }

  &.no-padding {
    padding: 0;
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

.modern-table {
  background: transparent;
  border: none;
  
  :deep(thead tr th) {
    background: transparent !important;
    color: var(--text-muted) !important;
    font-weight: 500;
    font-size: 0.6875rem;
    border-top: none !important;
  }
  
  :deep(tbody tr) {
    &:nth-child(even) {
      background-color: var(--bg-tertiary);
    }
    
    &:hover {
      background-color: var(--bg-hover) !important;
    }
  }
}

.action-buttons {
  display: flex;
  gap: 0.375rem;
  align-items: center;
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

.project-name,
.post-name {
  font-weight: 500;
  color: var(--text-primary);
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
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
}

.mobile-card-selected {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.mobile-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.mobile-card-title {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-primary);
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
</style>
