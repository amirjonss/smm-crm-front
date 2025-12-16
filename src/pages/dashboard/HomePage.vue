<template>
  <q-page class="dashboard-page">
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Панель управления</h1>
          <p class="page-subtitle">Управление персоналом и проектами</p>
        </div>
      </div>

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
            <span class="stat-value">{{ projectStore.getProjects.length }}</span>
            <span class="stat-label">Проекты</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-green">
            <q-icon name="article" size="1.5rem" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ contentPlanStore.getContentPlans.length }}</span>
            <span class="stat-label">Контент-планы</span>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <!-- User Form Card -->
        <div class="grid-item">
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">
                <q-icon name="person_add" class="card-icon" />
                {{ editingUserId ? 'Редактировать персонал' : 'Добавить персонал' }}
              </h2>
            </div>
            <div class="card-body">
              <q-form @submit.prevent="createUser">
                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label">Имя</label>
                    <q-input
                      v-model="userForm.givenName"
                      outlined
                      placeholder="Введите имя"
                      lazy-rules
                      :rules="[val => val.length > 0 || 'Заполните поле']"
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
                      :rules="[val => val.length > 0 || 'Заполните поле']"
                      class="modern-input"
                    />
                  </div>
                  <div class="form-group form-group-full">
                    <label class="form-label">Email</label>
                    <q-input
                      v-model="userForm.email"
                      outlined
                      type="email"
                      placeholder="example@email.com"
                      lazy-rules
                      :rules="[val => val.length > 0 || 'Заполните поле']"
                      class="modern-input"
                    />
                  </div>
                </div>
                <div class="form-actions">
                  <q-btn
                    v-if="editingUserId"
                    flat
                    label="Отмена"
                    @click="clearForm"
                    class="btn-cancel"
                  />
                  <q-btn
                    type="submit"
                    :label="editingUserId ? 'Сохранить' : 'Добавить'"
                    unelevated
                    class="btn-primary-action"
                    :loading="isLoading"
                  />
                </div>
              </q-form>
            </div>
          </div>
        </div>

        <!-- Users List Card -->
        <div class="grid-item">
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
                  class="user-item"
                  :class="{
                    'user-item-editing': row.id === editingUserId,
                    'user-item-selected': row.id === selectedUserId
                  }"
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
                      :outline="row.id !== selectedUserId"
                      :unelevated="row.id === selectedUserId"
                      dense
                      no-caps
                      size="sm"
                      :icon="row.id === selectedUserId ? 'folder_open' : 'folder'"
                      :label="row.id === selectedUserId ? 'Скрыть' : 'Проекты'"
                      :color="row.id === selectedUserId ? 'primary' : 'grey-7'"
                      class="action-btn-main"
                      @click="selectUser(row)"
                    />
                    <q-btn
                      flat
                      round
                      dense
                      size="sm"
                      icon="edit"
                      color="grey-7"
                      class="action-btn-icon"
                      @click="editUser(row)"
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
                      @click="confirmUserDeletion(row)"
                    >
                      <q-tooltip>Удалить</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Projects and Content Section -->
      <projects-and-content-list-component :parent-selected-user-id="selectedUserId" />
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
const q = useQuasar()

const filteredUsers = computed(() => {
  return userStore.getUsers.filter(n => n.id !== userStore.user?.id)
})

function createUser() {
  isLoading.value = true
  if (editingUserId.value) {
    saveEditedUser()
  } else {
    userStore.createUser(userForm.value).then(() => {
      isLoading.value = false
      userStore.fetchUsers()
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
  if (row.id === editingUserId.value) {
    clearForm()
  } else {
    editingUserId.value = row.id
    userForm.value.email = row.email
    userForm.value.givenName = row.givenName
    userForm.value.familyName = row.familyName
  }
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

.page-header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.btn-primary-action {
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  font-weight: 500;
  padding: 0.625rem 1.5rem;
}

.btn-cancel {
  color: var(--text-secondary);
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
  .page-header {
    margin-bottom: 1.25rem;
  }
  
  .page-title {
    font-size: 1.375rem;
  }
  
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
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem !important;
  }
  
  .user-info {
    width: 100%;
  }
  
  .user-details {
    flex: 1;
    min-width: 0;
  }
  
  .user-name {
    word-break: break-word;
  }
  
  .user-email {
    word-break: break-all;
  }
  
  .user-actions {
    width: 100%;
    justify-content: space-between;
    gap: 0.375rem;
  }
  
  .action-btn-main {
    flex: 1;
    min-width: 0;
    font-size: 0.6875rem;
    padding: 0.5rem 0.625rem;
  }
  
  .action-btn-main .q-btn__content {
    gap: 0.25rem;
  }
  
  .action-btn-icon {
    min-width: 40px;
    height: 40px;
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
