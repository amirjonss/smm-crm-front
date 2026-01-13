<template>
  <q-page class="dashboard-page">
    <div class="page-container">
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon stat-icon-blue">
            <q-icon name="people" size="1.5rem" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ userStore.getUsers.length }}</span>
            <span class="stat-label">Персонал</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-purple">
            <q-icon name="folder" size="1.5rem" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ projectStore.getGlobalTotal }}</span>
            <span class="stat-label">Проекты</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-green">
            <q-icon name="article" size="1.5rem" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ contentPlanStore.getGlobalTotal }}</span>
            <span class="stat-label">Контент-планы</span>
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
          <div class="card-body no-padding" style="min-height: auto; max-height: 400px;">
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
                >
                  <div class="mobile-card-header">
                    <span class="mobile-card-title">{{ plan.post }}</span>
                    <span class="format-badge">{{ plan.format }}</span>
                  </div>
                  <div class="mobile-card-body">
                    <div class="mobile-card-row">
                      <span class="mobile-card-label">Проект:</span>
                      <span class="project-name-table">{{ getProjectName(plan.project) }}</span>
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
                    <th>Идея</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="plan in todaysContentPlans" :key="plan.id">
                    <td class="project-name-table">{{ getProjectName(plan.project) }}</td>
                    <td class="post-name-table">{{ plan.post }}</td>
                    <td><span class="format-badge">{{ plan.format }}</span></td>
                    <td class="idea-cell-table">{{ plan.idea }}</td>
                  </tr>
                </tbody>
              </q-markup-table>
            </template>
          </div>
        </div>
      </div>

      <div class="flex justify-end q-mb-md">
        <q-btn
          outline
          padding="8px 20px"
          icon="add"
          label="Добавить персонал"
          class="btn-create-outlined"
          @click="openCreateDialog"
        />
      </div>

      <div class="dashboard-content">
        <!-- Users List Card -->
        <div class="grid-item user-list-section">
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">
                <q-icon name="group" class="card-icon" />
                Список персонала
              </h2>
              <span class="card-count">{{ filteredUsers.length }}</span>
            </div>
            <div class="card-body no-padding">
              <div v-if="filteredUsers.length === 0" class="empty-state">
                <q-icon name="person_off" class="empty-state-icon" />
                <p class="empty-state-text">Персонал не найден</p>
              </div>
              <div v-else class="users-list">
                <div
                  v-for="row in filteredUsers"
                  :key="row.id"
                  class="user-item cursor-pointer"
                  :class="{
                    'user-item-editing': row.id === editingUserId,
                    'user-item-selected': row.id === selectedUserId
                  }"
                  @click="selectUser(row)"
                >
                  <div class="user-info">
                    <q-avatar size="40px" color="primary" text-color="white" class="user-avatar">
                      {{ (row.givenName?.[0] || '').toUpperCase() }}
                    </q-avatar>
                    <div class="user-details">
                      <span class="user-name">{{ row.givenName }} {{ row.familyName }}</span>
                      <span class="user-email">{{ row.email }}</span>
                    </div>
                  </div>
                  <div class="user-actions">
                    <q-btn
                      flat
                      round
                      dense
                      size="sm"
                      icon="edit"
                      color="grey-7"
                      class="action-btn-icon"
                      @click.stop="editUser(row)"
                    >
                      <q-tooltip>Редактировать</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      dense
                      size="sm"
                      icon="delete_outline"
                      color="grey-7"
                      class="action-btn-icon btn-danger-hover"
                      @click.stop="confirmUserDeletion(row)"
                    >
                      <q-tooltip>Удалить</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Projects and Content Section -->
        <div class="projects-section">
          <projects-and-content-list-component :parent-selected-user-id="selectedUserId" />
        </div>
      </div>

      <!-- User Form Dialog -->
      <q-dialog v-model="showUserDialog" persistent>
        <q-card class="user-dialog-card">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">{{ editingUserId ? 'Редактировать персонал' : 'Добавить персонал' }}</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup @click="clearForm" />
          </q-card-section>

          <q-card-section class="q-pt-md">
            <q-form @submit.prevent="createUser" class="q-gutter-y-md">
              <div class="form-group">
                <label class="form-label">Имя</label>
                <q-input
                  v-model="userForm.givenName"
                  outlined
                  placeholder="Введите имя"
                  lazy-rules
                  :rules="[val => val && val.length > 0 || 'Заполните поле']"
                  class="modern-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Фамилия</label>
                <q-input
                  v-model="userForm.familyName"
                  outlined
                  placeholder="Введите фамилию"
                  lazy-rules
                  :rules="[val => val && val.length > 0 || 'Заполните поле']"
                  class="modern-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <q-input
                  v-model="userForm.email"
                  outlined
                  type="email"
                  placeholder="example@email.com"
                  lazy-rules
                  :rules="[val => val && val.length > 0 || 'Заполните поле']"
                  class="modern-input"
                />
              </div>

              <div class="form-actions-row">
                <q-btn
                  flat
                  label="Отмена"
                  color="grey-7"
                  v-close-popup
                  @click="clearForm"
                  class="btn-cancel"
                />
                <q-btn
                  type="submit"
                  :label="editingUserId ? 'Сохранить' : 'Добавить'"
                  unelevated
                  color="primary"
                  class="btn-primary-action"
                  :loading="isLoading"
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
import { onMounted, ref, computed } from 'vue'
import { useUserStore } from 'stores/user.js'
import { useProjectStore } from 'stores/project.js'
import { useContentPlanStore } from 'stores/content-plan.js'
import ProjectsAndContentListComponent from 'components/dashboard/ProjectsAndContentListComponent.vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios.js'

const userStore = useUserStore()
const projectStore = useProjectStore()
const contentPlanStore = useContentPlanStore()
const userForm = ref({
  givenName: '',
  familyName: '',
  email: ''
})
const isLoading = ref(false)
const selectedUserId = ref(null)
const editingUserId = ref(null)
const showUserDialog = ref(false)
const q = useQuasar()

const todaysContentPlans = ref([])

async function fetchTodaysContentPlans() {
  const today = new Date().toISOString().slice(0, 10)
  try {
    const response = await api.get('/content_plans?date=' + today)
    todaysContentPlans.value = response.data.member
  } catch (e) {
    console.error('Error fetching stats:', e)
  }
}

function getProjectName(project) {
  if (!project) return '---'
  if (typeof project === 'object' && project.name) return project.name
  if (typeof project === 'string') {
    const id = project.split('/').pop()
    const found = projectStore.getProjects.find(p => String(p.id) === String(id))
    return found ? found.name : '---'
  }
  return '---'
}

const filteredUsers = computed(() => {
  return userStore.getUsers.filter(n => n.id !== userStore.user?.id)
})

function openCreateDialog() {
  clearForm()
  showUserDialog.value = true
}

function createUser() {
  isLoading.value = true
  if (editingUserId.value) {
    saveEditedUser()
  } else {
    userStore.createUser(userForm.value).then(() => {
      isLoading.value = false
      userStore.fetchUsers()
      showUserDialog.value = false
      clearForm()
      q.notify({
        message: 'Пользователь создан',
        type: 'positive',
        position: 'top'
      })
    }).catch((e) => {
      isLoading.value = false
      console.log(e)
      q.notify({
        message: 'Такой email уже существует',
        type: 'negative',
        position: 'top'
      })
    })
  }
}

function editUser(row) {
  editingUserId.value = row.id
  userForm.value.email = row.email
  userForm.value.givenName = row.givenName
  userForm.value.familyName = row.familyName
  showUserDialog.value = true
}

function selectUser(user) {
  if (selectedUserId.value === user.id) {
    selectedUserId.value = null
  } else {
    selectedUserId.value = user.id
  }
}

function saveEditedUser() {
  userStore.patchUser(userForm.value, editingUserId.value).then(() => {
    userStore.fetchUsers().then(() => {
      isLoading.value = false
      showUserDialog.value = false
      q.notify({
        message: 'Пользователь обновлён',
        type: 'positive',
        position: 'top'
      })
    })
  })
  clearForm()
}

function clearForm() {
  editingUserId.value = null
  userForm.value = { email: '', familyName: '', givenName: '' }
}

function deleteUser(id) {
  userStore.deleteUser(id).then(() => {
    userStore.fetchUsers()
    q.notify({
      message: 'Пользователь удалён',
      type: 'positive',
      position: 'top'
    })
  })
}

function confirmUserDeletion(user) {
  q.dialog({
    title: 'Удаление пользователя',
    message: `Вы уверены, что хотите удалить пользователя "${user.givenName} ${user.familyName}"?`,
    cancel: { flat: true, label: 'Отмена' },
    ok: { color: 'negative', label: 'Удалить' },
    persistent: true
  }).onOk(() => deleteUser(user.id))
}

onMounted(() => {
  userStore.fetchUsers()
  projectStore.fetchProjectsCount()
  contentPlanStore.fetchContentPlansCount()
  fetchTodaysContentPlans()
})
</script>

<style scoped lang="scss">
.dashboard-page {
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

// Stats Cards
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
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

// Content Grid
.content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 1023px) {
    grid-template-columns: 1fr;
  }
}

.dashboard-content {
  display: grid;
  grid-template-columns: 4fr 6fr;
  grid-template-areas: 
    "users projects"
    "content content";
  gap: 1.5rem;  margin-bottom: 2rem;
  transition: all 0.3s ease;
  align-items: start;

  @media (max-width: 1023px) {
    grid-template-columns: 1fr;
    grid-template-areas:
      "users"
      "projects"
      "content";
  }
}

.user-list-section {
  grid-area: users;
  
  .card {
    display: flex;
    flex-direction: column;
  }
  
  .card-body {
    min-height: 500px;
    max-height: 500px;
    overflow-y: auto;

    @media (max-width: 1023px) {
      min-height: auto;
    }
  }
}
.projects-section {
  display: contents;

  :deep(.projects-wrapper) {
    grid-area: projects;
  }

  :deep(.content-plans-wrapper) {
    grid-area: content;
  }
}

.grid-item {
  min-width: 0;
}

.gap-sm {
  gap: 0.5rem;
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
  color: #8b5cf6;
  font-size: 1.25rem;
}

.card-count {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.625rem;
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  border-radius: 9999px;
}

.card-body {
  padding: 1.5rem;

  @media (max-width: 599px) {
    padding: 1rem;
  }

  &.no-padding {
    padding: 0;
  }

  :deep(thead tr th) {
    text-align: left !important;
  }

  :deep(tbody tr td) {
    text-align: left !important;
  }
}

// Form Styles
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  @media (max-width: 599px) {
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

.btn-create-outlined {
  border-radius: 12px;
  font-weight: 600;
  text-transform: none;
  color: #8b5cf6 !important;
  border: 1.5px solid rgba(139, 92, 246, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: rgba(139, 92, 246, 0.04);
    border-color: #8b5cf6;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1);
  }

  &:active {
    transform: translateY(0);
  }

  :deep(.q-icon) {
    font-size: 1.2rem;
  }
}

.btn-primary-action {
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  font-weight: 500;
  padding: 0.625rem 1.5rem;
}

.btn-cancel {
  color: var(--text-secondary);
  text-transform: none;
  font-weight: 500;
}

.user-dialog-card {
  width: 450px;
  max-width: 95vw;
  border-radius: 12px;
  background: var(--bg-card);

  @media (max-width: 599px) {
    width: 90vw;
    margin: 1rem;
  }
}

.form-actions-row {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;

  @media (max-width: 599px) {
    flex-direction: column;
    
    .q-btn {
      width: 100%;
    }
    
    .btn-primary-action {
      order: -1;
    }
  }
}

// Users List
.users-list {
  display: flex;
  flex-direction: column;
}

.user-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-light);
  transition: background-color 0.15s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: var(--bg-hover);
  }

  @media (max-width: 599px) {
    padding: 0.875rem 1rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}

.user-item-editing {
  background-color: rgba(139, 92, 246, 0.1);
  border-left: 3px solid #8b5cf6;
}

.user-item-selected {
  background-color: rgba(59, 130, 246, 0.1);
  border-left: 3px solid #3b82f6;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.user-avatar {
  font-weight: 600;
  font-size: 0.875rem;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9375rem;
}

.user-email {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.user-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;

  @media (max-width: 599px) {
    align-self: flex-end;
  }
}

.modern-table {
  background: transparent;
  border: none;
  width: 100%;
  min-width: 100%;

  :deep(thead tr th) {
    background: transparent !important;
    color: var(--text-muted) !important;
    font-weight: 500;
    font-size: 0.6875rem;
    border-top: none !important;
    text-align: left !important;
  }

  :deep(tbody tr td) {
    text-align: left !important;
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

.project-name-table {
  font-weight: 500;
  color: var(--text-primary);
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-name-table {
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

.idea-cell-table {
  max-width: 250px;
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
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
  white-space: normal;
  word-wrap: break-word;
}

.action-btn-main {
  font-size: 0.75rem;
  padding: 0.375rem 0.875rem;
  border-radius: 8px;
  font-weight: 500;
  min-width: 90px;
}

.action-btn-icon {
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-hover);
  }
}

.btn-danger-hover:hover {
  background: rgba(239, 68, 68, 0.1) !important;
  color: #ef4444 !important;
}

// Empty State
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

// Mobile responsive
@media (max-width: 599px) {
  .stats-grid {
    gap: 0.75rem;
  }

  .stat-card {
    padding: 1rem;
    flex-direction: row;
    align-items: center;
  }

  .stat-icon {
    width: 44px;
    height: 44px;
    flex-shrink: 0;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }

  .card-header {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .card-count {
    margin-left: auto;
  }

    .user-item {
      flex-direction: row;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem !important;
    }
    
    .user-info {
      flex: 1;
      min-width: 0;
    }
    
    .user-details {
      flex: 1;
      min-width: 0;
    }
    
    .user-name {
      font-size: 0.875rem;
      word-break: break-word;
    }
    
    .user-email {
      font-size: 0.75rem;
      word-break: break-all;
    }
    
    .user-actions {
      width: auto;
      justify-content: flex-end;
      gap: 0.25rem;
    }
    
    .action-btn-icon {
      width: 32px;
      height: 32px;
      min-width: 32px;
    }
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

// Tablet responsive
@media (max-width: 1023px) and (min-width: 600px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
