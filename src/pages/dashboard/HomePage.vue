<template>
  <q-page class="dashboard-page">
    <div class="page-container">

      <div v-if="isInitialLoading" class="home-skeleton-loading">
        <!-- Stats Skeletons -->
        <div class="stats-grid q-mb-xl">
          <div v-for="i in 4" :key="'stat-'+i" class="stat-card">
            <q-skeleton type="QAvatar" size="48px" class="bg-white-10" dark animation="pulse" />
            <div class="stat-content q-ml-md" style="flex:1">
              <q-skeleton type="text" width="40%" class="bg-white-10 q-mb-xs" dark animation="pulse" />
              <q-skeleton type="text" width="60%" class="bg-white-10" dark animation="pulse" />
            </div>
          </div>
        </div>
        <!-- Table Skeleton -->
        <div class="q-mb-md">
          <q-skeleton type="rect" width="100%" height="300px" class="bg-white-10" style="border-radius:12px" dark animation="pulse" />
        </div>
      </div>

      <template v-else>
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
          <div class="stat-icon stat-icon-teal">
            <q-icon name="article" size="1.5rem" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ contentPlanStore.getMonthlyTotal }}</span>
            <span class="stat-label">Планы на месяц</span>
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
          <div
            class="card-body no-padding"
            style="min-height: auto; max-height: 400px; overflow-y: auto"
          >
            <div v-if="todaysContentPlans.length === 0" class="empty-state">
              <q-icon name="event_busy" class="empty-state-icon" />
              <p class="empty-state-text">На сегодня планов нет</p>
            </div>

            <template v-else>
              <!-- Mobile Cards View -->
              <div class="mobile-cards show-mobile-only">
                <div v-for="plan in todaysContentPlans" :key="plan.id" class="mobile-card">
                  <div class="mobile-card-header">
                    <span class="mobile-card-title">{{ plan.post }}</span>
                    <span class="format-badge">{{ plan.format }}</span>
                  </div>
                  <div class="mobile-card-body">
                    <div class="mobile-card-row">
                      <span class="mobile-card-label">Проект:</span>
                      <span class="project-name-table">{{ getProjectName(plan.project) }}</span>
                    </div>

                    <div v-if="plan.platforms?.length" class="mobile-card-row">
                      <span class="mobile-card-label">Платформы:</span>
                      <div class="platform-icons-row">
                        <div
                          v-for="p in plan.platforms"
                          :key="p.name"
                          class="platform-status-wrapper"
                          :class="`status-${p.status}`"
                        >
                          <q-icon
                            :name="PLATFORM_ICONS[p.name]"
                            size="14px"
                            :style="{ color: PLATFORM_COLORS[p.name] }"
                          />
                          <div v-if="getStatusIcon(p.status)" class="status-indicator-icon">
                            <q-icon :name="getStatusIcon(p.status)" size="8px" />
                          </div>

                          <q-menu
                            v-if="!userStore.isAdmin"
                            auto-close
                            anchor="top middle"
                            self="bottom middle"
                            class="glass-menu"
                          >
                            <q-list style="min-width: 150px">
                              <q-item
                                v-for="opt in statusOptions"
                                :key="opt.value"
                                clickable
                                v-close-popup
                                @click="setPlatformStatus(plan, p.name, opt.value)"
                                :active="p.status === opt.value"
                                active-class="bg-blue-1 text-primary"
                              >
                                <q-item-section avatar style="min-width: 32px; padding-right: 0">
                                  <q-icon
                                    :name="getStatusIcon(opt.value)"
                                    size="xs"
                                    :color="STATUS_COLORS[opt.value]"
                                  />
                                </q-item-section>
                                <q-item-section>{{ opt.label }}</q-item-section>
                              </q-item>
                            </q-list>
                          </q-menu>

                          <q-tooltip class="glass-tooltip" :offset="[0, 8]">
                            {{ PLATFORM_LABELS[p.name] }}: {{ STATUS_LABELS[p.status] }}
                          </q-tooltip>
                        </div>
                      </div>
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
                    <th>Платформы</th>
                    <th>Идея</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="plan in todaysContentPlans" :key="plan.id">
                    <td class="project-name-table">{{ getProjectName(plan.project) }}</td>
                    <td class="post-name-table">{{ plan.post }}</td>
                    <td>
                      <span class="format-badge">{{ plan.format }}</span>
                    </td>
                    <td class="platforms-cell">
                      <div class="platform-icons-row">
                        <div
                          v-for="p in plan.platforms"
                          :key="p.name"
                          class="platform-status-wrapper"
                          :class="`status-${p.status}`"
                        >
                          <q-icon
                            :name="PLATFORM_ICONS[p.name]"
                            size="16px"
                            :style="{ color: PLATFORM_COLORS[p.name] }"
                          />
                          <div v-if="getStatusIcon(p.status)" class="status-indicator-icon">
                            <q-icon :name="getStatusIcon(p.status)" size="8px" />
                          </div>

                          <q-menu
                            v-if="!userStore.isAdmin"
                            auto-close
                            anchor="top middle"
                            self="bottom middle"
                            class="glass-menu"
                          >
                            <q-list style="min-width: 150px">
                              <q-item
                                v-for="opt in statusOptions"
                                :key="opt.value"
                                clickable
                                v-close-popup
                                @click="setPlatformStatus(plan, p.name, opt.value)"
                                :active="p.status === opt.value"
                                active-class="bg-blue-1 text-primary"
                              >
                                <q-item-section avatar style="min-width: 32px; padding-right: 0">
                                  <q-icon
                                    :name="getStatusIcon(opt.value)"
                                    size="xs"
                                    :color="STATUS_COLORS[opt.value]"
                                  />
                                </q-item-section>
                                <q-item-section>{{ opt.label }}</q-item-section>
                              </q-item>
                            </q-list>
                          </q-menu>

                          <q-tooltip class="glass-tooltip" :offset="[0, 8]">
                            {{ PLATFORM_LABELS[p.name] }}: {{ STATUS_LABELS[p.status] }}
                          </q-tooltip>
                        </div>
                        <span v-if="!plan.platforms?.length" class="text-grey-6">—</span>
                      </div>
                    </td>
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
            <div class="card-header card-header-col">
              <div class="card-header-top">
                <h2 class="card-title">
                  <q-icon name="group" class="card-icon" />
                  Список персонала
                </h2>
                <span class="card-count">{{ filteredUsers.length }}</span>
              </div>
              <div class="role-chips">
                <button
                  class="role-chip"
                  :class="{ 'role-chip-active': !selectedRoleFilter }"
                  @click="selectedRoleFilter = null"
                >
                  Все
                </button>
                <button
                  v-for="role in ROLE_OPTIONS"
                  :key="role.value"
                  class="role-chip"
                  :class="{ 'role-chip-active': selectedRoleFilter === role.value }"
                  @click="
                    selectedRoleFilter = selectedRoleFilter === role.value ? null : role.value
                  "
                >
                  {{ role.label }}
                </button>
              </div>
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
                    'user-item-selected': row.id === selectedUserId,
                  }"
                  @click="selectUser(row)"
                >
                  <div class="user-info">
                    <q-avatar size="40px" color="primary" text-color="white" class="user-avatar">
                      <img v-if="getUserAvatarUrl(row)" :src="getUserAvatarUrl(row)" :alt="row.email" />
                      <span v-else>{{ (row.givenName?.[0] || '').toUpperCase() }}</span>
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
      </template>

      <!-- User Form Dialog -->
      <q-dialog v-model="showUserDialog" persistent>
        <q-card class="user-dialog-card">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">
              {{ editingUserId ? 'Редактировать персонал' : 'Добавить персонал' }}
            </div>
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
                  :rules="[(val) => (val && val.length > 0) || 'Заполните поле']"
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
                  :rules="[(val) => (val && val.length > 0) || 'Заполните поле']"
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
                  :rules="[(val) => (val && val.length > 0) || 'Заполните поле']"
                  class="modern-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Роль</label>
                <q-select
                  v-model="userForm.roles"
                  :options="ROLE_OPTIONS"
                  outlined
                  emit-value
                  map-options
                  placeholder="Выберите роль"
                  lazy-rules
                  :rules="[(val) => !!val || 'Выберите роль']"
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
import { onMounted, ref, computed, watch } from 'vue'
import { useUserStore } from 'stores/user.js'
import { useProjectStore } from 'stores/project.js'
import { useContentPlanStore } from 'stores/content-plan.js'
import ProjectsAndContentListComponent from 'components/dashboard/ProjectsAndContentListComponent.vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios.js'
import { getProjectName } from '@/utils/projectHelpers'
import { getTodayISO } from '@/utils/dateHelpers'
import {
  PLATFORM_COLORS,
  PLATFORM_LABELS,
  PLATFORM_ICONS,
  STATUS_COLORS,
  STATUS_LABELS,
  STATUS_OPTIONS,
  STATUS,
} from '@/constants/status'

const userStore = useUserStore()
const projectStore = useProjectStore()
const contentPlanStore = useContentPlanStore()
const ROLE_OPTIONS = [
  { label: 'SMM', value: 'ROLE_SMM' },
  { label: 'Монтажер', value: 'ROLE_EDITOR' },
  { label: 'Дизайнер', value: 'ROLE_DESIGNER' },
  { label: 'Оператор', value: 'ROLE_OPERATOR' },
  { label: 'Админ', value: 'ROLE_ADMIN' },
]

const userForm = ref({
  givenName: '',
  familyName: '',
  email: '',
  roles: null,
})
const isInitialLoading = ref(true)
const isLoading = ref(false)
const editingUserId = ref(null)
const showUserDialog = ref(false)
const q = useQuasar()

const selectedUserId = computed(() => userStore.getSelectedUserId)
const selectedRoleFilter = ref(null)

const statusOptions = STATUS_OPTIONS

function toAbsoluteUrl(path) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path

  const baseUrl = import.meta.env.VITE_BASE_URL || ''
  const origin = baseUrl.startsWith('http') ? new URL(baseUrl).origin : window.location.origin
  return origin + path
}

function getUserAvatarUrl(user) {
  const avatar = user?.avatar
  if (!avatar) return ''

  if (typeof avatar === 'object' && avatar.contentUrl) {
    return toAbsoluteUrl(avatar.contentUrl)
  }

  return ''
}

function getStatusIcon(status) {
  switch (status) {
    case STATUS.PUBLISHED:
      return 'check'
    case STATUS.CANCELED:
      return 'close'
    case STATUS.RESCHEDULED:
      return 'schedule'
    default:
      return ''
  }
}

async function setPlatformStatus(plan, platformName, newStatus) {
  if (userStore.isAdmin) return // Admin restriction

  const platform = plan.platforms.find((p) => p.name === platformName)
  if (!platform || platform.status === newStatus) return

  // Optimistic update
  const originalStatus = platform.status
  platform.status = newStatus

  // Prepare payload
  const updatedPlatforms = plan.platforms.map((p) => ({
    name: p.name,
    status: p.name === platformName ? newStatus : p.status,
  }))

  try {
    await contentPlanStore.patchContentPlan({ platforms: updatedPlatforms }, plan.id)
    q.notify({
      message: `${PLATFORM_LABELS[platformName]}: ${STATUS_LABELS[newStatus]}`,
      type: STATUS_COLORS[newStatus] || 'info',
      position: 'top',
      timeout: 1000,
      icon: getStatusIcon(newStatus),
    })

    // Refresh today's list if the plan is in it
    if (todaysContentPlans.value.some((p) => p.id === plan.id)) {
      fetchTodaysContentPlans()
    }
  } catch (e) {
    // Revert on error
    platform.status = originalStatus
    console.error('Error updating status:', e)
    q.notify({
      message: 'Ошибка обновления статуса',
      type: 'negative',
      position: 'top',
    })
  }
}

const todaysContentPlans = ref([])

async function fetchTodaysContentPlans() {
  const today = getTodayISO()
  try {
    const response = await api.get('/content_plans?date=' + today + '&itemsPerPage=1000')
    todaysContentPlans.value = response.data.member
  } catch (e) {
    console.error('Error fetching stats:', e)
  }
}

const filteredUsers = computed(() => {
  return userStore.getUsers
})

function fetchFilteredUsers() {
  const params = {}
  if (selectedRoleFilter.value) {
    params.roles = selectedRoleFilter.value
  }
  return userStore.fetchUsers(params)
}

watch(selectedRoleFilter, () => {
  fetchFilteredUsers()
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
    const payload = { ...userForm.value, roles: userForm.value.roles ? [userForm.value.roles] : [] }
    userStore
      .createUser(payload)
      .then(() => {
        isLoading.value = false
        fetchFilteredUsers()
        showUserDialog.value = false
        clearForm()
        q.notify({
          message: 'Пользователь создан',
          type: 'positive',
          position: 'top',
        })
      })
      .catch((e) => {
        isLoading.value = false
        console.log(e)
        q.notify({
          message: 'Такой email уже существует',
          type: 'negative',
          position: 'top',
        })
      })
  }
}

function editUser(row) {
  editingUserId.value = row.id
  userForm.value.email = row.email
  userForm.value.givenName = row.givenName
  userForm.value.familyName = row.familyName
  userForm.value.roles = row.roles?.[0] || null
  showUserDialog.value = true
}

function selectUser(user) {
  if (selectedUserId.value === user.id) {
    userStore.setSelectedUserId(null)
  } else {
    userStore.setSelectedUserId(user.id)
  }
}

function saveEditedUser() {
  const { roles, email, ...userPayload } = userForm.value
  const rolesList = roles ? [roles] : []
  const id = editingUserId.value

  Promise.all([
    userStore.patchUser(userPayload, id),
    userStore.changeUserRole(id, rolesList),
    userStore.changeUserEmail(id, email),
  ]).then(() => {
    fetchFilteredUsers().then(() => {
      isLoading.value = false
      showUserDialog.value = false
      q.notify({
        message: 'Пользователь обновлён',
        type: 'positive',
        position: 'top',
      })
    })
  })
  clearForm()
}

function clearForm() {
  editingUserId.value = null
  userForm.value = { email: '', familyName: '', givenName: '', roles: null }
}

function deleteUser(id) {
  userStore.deleteUser(id).then(() => {
    fetchFilteredUsers()
    q.notify({
      message: 'Пользователь удалён',
      type: 'positive',
      position: 'top',
    })
  })
}

function confirmUserDeletion(user) {
  q.dialog({
    title: 'Удаление пользователя',
    message: `Вы уверены, что хотите удалить пользователя "${user.givenName} ${user.familyName}"?`,
    cancel: { flat: true, label: 'Отмена' },
    ok: { color: 'negative', label: 'Удалить' },
    persistent: true,
  }).onOk(() => deleteUser(user.id))
}

onMounted(async () => {
  isInitialLoading.value = true
  await Promise.allSettled([
    userStore.fetchUsers(),
    projectStore.fetchProjectsCount(),
    contentPlanStore.fetchMonthlyContentPlansCount(),
    fetchTodaysContentPlans(),
  ])
  isInitialLoading.value = false
})
</script>

<style scoped lang="scss">
.dashboard-page {
  padding: 0;
  position: relative;
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
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 599px) {
    grid-template-columns: repeat(2, 1fr);
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

.stat-icon-teal {
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
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
    'users projects'
    'content content';
  gap: 1.5rem;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
  align-items: start;

  @media (max-width: 1023px) {
    grid-template-columns: 1fr;
    grid-template-areas:
      'users'
      'projects'
      'content';
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
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);

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
  // .stats-grid media query moved to main declaration
}

.platform-status-wrapper {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border: 2px solid transparent;
  transition: all 0.2s ease-out;
  cursor: pointer;
  position: relative;
  user-select: none;

  &.status-PUBLISHED {
    border-color: #22c55e;
    background: rgba(34, 197, 94, 0.1);
  }
  &.status-CANCELED {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }
  &.status-NOT_PUBLISHED {
    border-color: #9ca3af;
    background: rgba(156, 163, 175, 0.1);
  }
  &.status-RESCHEDULED {
    border-color: #f97316;
    background: rgba(249, 115, 22, 0.1);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    z-index: 10;
  }

  &:active {
    transform: scale(0.95);
  }
}

.status-indicator-icon {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 2;

  .status-PUBLISHED & {
    color: #22c55e;
    border-color: #22c55e;
    background: #ecfdf5;
  }
  .status-CANCELED & {
    color: #ef4444;
    border-color: #ef4444;
    background: #fef2f2;
  }
  .status-RESCHEDULED & {
    color: #f97316;
    border-color: #f97316;
    background: #fff7ed;
  }
}

.platforms-cell {
  min-width: 0;
}

.platform-icons-row {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.card-header-col {
  flex-direction: column;
  align-items: stretch;
  gap: 0.75rem;
}

.card-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.role-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.role-chip {
  all: unset;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  background: transparent;
  transition: all 0.2s ease;
  user-select: none;
  white-space: nowrap;

  &:hover {
    border-color: rgba(139, 92, 246, 0.4);
    color: #8b5cf6;
    background: rgba(139, 92, 246, 0.04);
  }
}

.role-chip-active {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  border-color: rgba(139, 92, 246, 0.4);
  font-weight: 600;
}
</style>

<style lang="scss">
.glass-tooltip {
  background: rgba(255, 255, 255, 0.65) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
  color: #000 !important;
  border-radius: 8px !important;
  font-size: 10px !important;
  padding: 4px 8px !important;
  letter-spacing: 0.3px;

  .body--dark & {
    background: rgba(20, 20, 20, 0.65) !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
    color: #fff !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
  }
}

.glass-menu {
  background: rgba(255, 255, 255, 0.65) !important;
  backdrop-filter: blur(15px) !important;
  -webkit-backdrop-filter: blur(15px) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
  border-radius: 12px !important;
  overflow: hidden;

  .body--dark & {
    background: rgba(20, 20, 20, 0.65) !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
  }

  .q-list {
    min-width: 130px !important;
    background: transparent !important;
    padding: 4px !important;
  }

  .q-item {
    min-height: 32px !important;
    padding: 4px 8px !important;
    border-radius: 8px !important;
    margin-bottom: 2px;
    font-size: 11px !important;
    color: var(--text-primary);
    transition: all 0.2s ease;

    &:last-child {
      margin-bottom: 0;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.3) !important;
      .body--dark & {
        background: rgba(255, 255, 255, 0.05) !important;
      }
    }

    &.bg-blue-1 {
      background: rgba(59, 130, 246, 0.15) !important;
      font-weight: 600;
    }
  }

  .q-item__section--main {
    font-size: 11px !important;
  }

  .q-icon {
    font-size: 14px !important;
  }
}
</style>
