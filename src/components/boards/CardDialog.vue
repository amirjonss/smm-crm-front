<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    maximized
    transition-show="scale"
    transition-hide="scale"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="card-dialog-overlay" @click.self="close">
      <div class="card-dialog-container">
        <!-- Top bar -->
        <div class="card-top-bar">
          <q-select
            v-model="form.status"
            :options="statusOptions"
            dense
            borderless
            emit-value
            map-options
            class="status-select"
          >
            <template #selected-item="scope">
              <q-badge
                :color="CARD_STATUS_COLORS[scope.opt.value] || 'grey'"
                :label="scope.opt.label"
                class="status-badge-top"
              />
            </template>
          </q-select>

          <q-space />

          <q-btn
            v-if="canManageCardDetails"
            flat
            round
            dense
            icon="note_add"
            class="top-btn"
            @click="syncPattern"
          >
            <q-tooltip>{{ isTemplateCard ? 'Обновить шаблон' : 'Создать шаблон' }}</q-tooltip>
          </q-btn>
          <q-btn
            v-if="canManageCardDetails"
            flat
            round
            dense
            :icon="isCardArchived ? 'unarchive' : 'archive'"
            class="top-btn"
            @click="toggleArchive"
          >
            <q-tooltip>{{ isCardArchived ? 'Восстановить карточку' : 'Архивировать карточку' }}</q-tooltip>
          </q-btn>
          <q-btn flat round dense icon="close" class="top-btn" @click="close" />
        </div>

        <!-- Main content area -->
        <div class="card-dialog-body">
          <!-- Left side: main content -->
          <div class="card-main">
            <!-- Title area -->
            <div class="card-title-area">
              <q-icon
                :name="statusIcon"
                :color="CARD_STATUS_COLORS[form.status]"
                size="24px"
                class="title-icon"
              />
              <q-input
                v-model="form.name"
                borderless
                autogrow
                :readonly="!canManageCardDetails"
                class="title-input"
                placeholder="Название карточки"
                @blur="onTitleBlur"
              />
            </div>

            <!-- Action chips row -->
            <div v-if="canManageCardDetails" class="action-chips">
              <q-btn flat dense no-caps class="action-chip">
                <q-icon name="event" size="16px" class="q-mr-xs" />
                Даты

                <q-popup-proxy v-model="showDeadlinePicker" :breakpoint="600">
                  <div class="dl-panel">
                    <div class="dl-header">
                      <span>Даты</span>
                      <q-btn v-close-popup flat round dense icon="close" size="xs" class="dl-close" />
                    </div>

                    <q-date
                      v-model="deadlineDate"
                      mask="YYYY-MM-DD"
                      minimal
                      flat
                      class="dl-calendar"
                    />

                    <div class="dl-body">
                      <div class="dl-label">Срок</div>
                      <div class="dl-row">
                        <q-checkbox v-model="deadlineEnabled" dense size="sm" color="blue" />
                        <div class="dl-date" :class="{ disabled: !deadlineEnabled }">
                          {{ deadlineFormatted }}
                        </div>
                        <input
                          v-model="deadlineTime"
                          type="text"
                          maxlength="5"
                          placeholder="00:00"
                          class="dl-time"
                          :disabled="!deadlineEnabled"
                          @input="onTimeInput"
                        />
                      </div>

                      <q-btn
                        unelevated
                        no-caps
                        label="Сохранить"
                        class="dl-save"
                        @click="saveDeadline"
                      />
                      <q-btn
                        v-if="form.deadline"
                        flat
                        no-caps
                        label="Удалить"
                        class="dl-delete"
                        @click="deleteDeadline"
                      />
                    </div>
                  </div>
                </q-popup-proxy>
              </q-btn>

              <q-btn flat dense no-caps class="action-chip">
                <q-icon name="person_add" size="16px" class="q-mr-xs" />
                Участники

                <!-- Executor picker popup -->
                <q-popup-proxy v-model="showExecutorPicker" :breakpoint="600">
                  <div class="ex-panel">
                    <div class="ex-header">
                      <span>Участники</span>
                      <q-btn v-close-popup flat round dense icon="close" size="xs" class="ex-close" />
                    </div>

                    <div class="ex-search-wrap">
                      <q-icon name="search" size="18px" class="ex-search-icon" />
                      <q-input
                        v-model="executorSearch"
                        dense
                        borderless
                        placeholder="Поиск..."
                        class="ex-search"
                      />
                    </div>

                    <div class="ex-section-label">Участники доски</div>

                    <div class="ex-list">
                      <div
                        v-for="user in filteredUsers"
                        :key="user.id"
                        class="ex-item"
                        :class="{ selected: isExecutor(user.id) }"
                        @click="toggleExecutor(user)"
                      >
                        <q-avatar
                          size="32px"
                          class="ex-avatar"
                          :style="{ background: avatarColor(user.id) }"
                        >
                          <img v-if="getUserAvatarUrl(user)" :src="getUserAvatarUrl(user)" alt="User avatar" />
                          <span v-else class="avatar-fallback-initial">{{ (user.givenName?.[0] || '').toUpperCase() }}</span>
                        </q-avatar>
                        <div class="ex-user-info">
                          <span class="ex-name">{{ user.givenName }} {{ user.familyName }}</span>
                        </div>
                        <transition name="ex-check-fade">
                          <q-icon
                            v-if="isExecutor(user.id)"
                            name="check_circle"
                            size="20px"
                            class="ex-check"
                          />
                        </transition>
                      </div>
                      <div v-if="filteredUsers.length === 0" class="ex-empty">
                        <q-icon name="search_off" size="28px" />
                        <span>Не найдено</span>
                      </div>
                    </div>
                  </div>
                </q-popup-proxy>
              </q-btn>
            </div>

            <!-- Meta row: Executors + Deadline inline -->
            <div v-if="cardExecutors.length || form.deadline" class="card-meta-row">
              <div v-if="cardExecutors.length" class="meta-group">
                <div class="meta-label">Участники</div>
                <div class="meta-avatars">
                  <q-avatar
                    v-for="user in cardExecutors"
                    :key="'av-' + user.id"
                    size="32px"
                    class="meta-avatar"
                    :class="{ 'has-image': !!getUserAvatarUrl(user) }"
                    :style="{ background: avatarColor(user.id) }"
                  >
                    <img v-if="getUserAvatarUrl(user)" :src="getUserAvatarUrl(user)" alt="User avatar" />
                    <span v-else class="avatar-fallback-initial">{{ (user.givenName?.[0] || '').toUpperCase() }}</span>
                    <q-tooltip :delay="400">{{ user.givenName }} {{ user.familyName }}</q-tooltip>
                  </q-avatar>
                </div>
              </div>

              <div v-if="form.deadline" class="meta-group">
                <div class="meta-label">Срок</div>
                <q-btn
                  v-if="canManageCardDetails"
                  flat
                  dense
                  no-caps
                  class="meta-deadline-chip"
                  @click="showDeadlinePicker = true"
                >
                  {{ formattedDeadlineFull }}
                  <q-icon name="expand_more" size="14px" class="q-ml-xs" />
                </q-btn>
                <span v-else class="meta-deadline-text">{{ formattedDeadlineFull }}</span>
              </div>
            </div>

            <!-- Description section -->
            <div class="card-section">
              <div class="section-header">
                <q-icon name="subject" size="20px" class="section-icon" />
                <span class="section-title">Описание</span>
              </div>

              <div v-if="isEditingDescription" class="description-editor-wrap">
                <div class="desc-editor-toolbar-row">
                  <heading-dropdown :editor-ref="descEditorRef" />
                  <div class="desc-toolbar-sep" />
                  <q-editor
                    ref="descEditorRef"
                    v-model="form.description"
                    :toolbar="descToolbar"
                    flat
                    min-height="140px"
                    content-class="desc-editor-content"
                    toolbar-bg="transparent"
                    class="description-editor"
                    placeholder="Добавьте подробное описание карточки..."
                  />
                </div>
                <div class="desc-editor-actions">
                  <q-btn
                    unelevated
                    dense
                    no-caps
                    label="Сохранить"
                    class="desc-save-btn"
                    @click="saveDescription"
                  />
                  <q-btn
                    flat
                    dense
                    no-caps
                    label="Отмена"
                    class="desc-cancel-btn"
                    @click="cancelDescriptionEdit"
                  />
                </div>
              </div>

              <div v-else class="description-preview" @click="startDescriptionEdit">
                <div
                  v-if="form.description"
                  class="description-preview-content"
                  v-html="form.description"
                />
                <span v-else class="description-placeholder">
                  Добавить более подробное описание...
                </span>
              </div>
            </div>


          </div>

          <!-- Right sidebar: logs -->
          <div class="card-sidebar">
            <div class="sidebar-header">
              <q-icon name="history" size="20px" class="sidebar-icon" />
              <span class="sidebar-title">Комментарии и события</span>
            </div>

            <div v-if="cardLogs.length === 0" class="sidebar-empty">
              <q-icon name="info_outline" size="24px" class="empty-icon" />
              <span>Нет событий</span>
            </div>

            <div v-else class="sidebar-logs">
              <div v-for="log in visibleLogs" :key="log.id" class="log-entry">
                <q-avatar size="28px" color="primary" text-color="white" class="log-avatar">
                  <img v-if="getUserAvatarUrl(log.createdBy)" :src="getUserAvatarUrl(log.createdBy)" alt="User avatar" />
                  <span v-else class="avatar-fallback-initial">{{ (log.createdBy?.givenName?.[0] || '?').toUpperCase() }}</span>
                </q-avatar>
                <div class="log-content">
                  <div class="log-description">{{ log.description }}</div>
                  <div class="log-date">{{ formatLogDate(log.createdAt) }}</div>
                </div>
              </div>

              <q-btn
                v-if="cardLogs.length > 3 && !showAllLogs"
                flat
                dense
                no-caps
                class="show-more-btn"
                @click="showAllLogs = true"
              >
                Показать подробности ({{ cardLogs.length - 3 }})
              </q-btn>
            </div>

          </div>
        </div>
      </div>
    </div>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import { CARD_STATUS, CARD_STATUS_OPTIONS, CARD_STATUS_COLORS } from '@/constants/cardStatus'
import { useUserStore } from 'stores/user.js'
import { useBoardStore } from 'stores/board.js'
import HeadingDropdown from 'components/boards/HeadingDropdown.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  card: { type: Object, default: null },
  lists: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'save', 'toggleArchive', 'syncPattern'])

const userStore = useUserStore()
const boardStore = useBoardStore()
const canManageCardDetails = computed(() => userStore.isAdmin || userStore.isSMM)

const statusOptions = computed(() => {
  if (userStore.isAdmin || userStore.isSMM) return CARD_STATUS_OPTIONS
  return CARD_STATUS_OPTIONS.filter((o) => o.value !== CARD_STATUS.DONE)
})

const isCardArchived = computed(() => {
  if (!props.card?.id) return false
  if (props.card.isArchived === true) return true
  return boardStore.archivedCards.some((card) => card.id === props.card.id)
})
const isTemplateCard = computed(() => {
  return !!(
    props.card?.cardPattern?.id ||
    props.card?.cardPatternId ||
    props.card?.pattern?.id ||
    props.card?.patternId
  )
})

const showDeadlinePicker = ref(false)
const showExecutorPicker = ref(false)
const executorSearch = ref('')
const deadlineDate = ref('')
const deadlineTime = ref('12:00')
const deadlineEnabled = ref(false)
const cardExecutors = ref([])

const filteredUsers = computed(() => {
  const users = userStore.getUsers || []
  const q = executorSearch.value.toLowerCase().trim()
  if (!q) return users
  return users.filter((u) =>
    `${u.givenName} ${u.familyName}`.toLowerCase().includes(q),
  )
})

const AVATAR_COLORS = [
  '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#f97316',
]

function avatarColor(id) {
  if (!id) return AVATAR_COLORS[0]
  const hash = typeof id === 'string' ? id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) : id
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

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

function isExecutor(userId) {
  return cardExecutors.value.some((e) => e.id === userId)
}

function toggleExecutor(user) {
  const idx = cardExecutors.value.findIndex((e) => e.id === user.id)
  const cardId = props.card?.id
  if (idx >= 0) {
    cardExecutors.value.splice(idx, 1)
    if (cardId) {
      boardStore.removeExecutor(cardId, user.id).then(() => {
        boardStore.fetchCardLogs(cardId)
      })
    }
  } else {
    cardExecutors.value.push(user)
    if (cardId) {
      boardStore.addExecutor(cardId, user).then(() => {
        boardStore.fetchCardLogs(cardId)
      })
    }
  }
}

const showAllLogs = ref(false)
const isEditingDescription = ref(false)
const initializing = ref(false)
const descEditorRef = ref(null)
const descriptionBackup = ref('')

const descToolbar = [
  ['bold', 'italic', 'underline', 'strike'],
  ['left', 'center', 'right', 'justify'],
  ['unordered', 'ordered', 'outdent', 'indent'],
  ['link', 'hr', 'removeFormat'],
]

function startDescriptionEdit() {
  descriptionBackup.value = form.value.description
  isEditingDescription.value = true
}

function cancelDescriptionEdit() {
  form.value.description = descriptionBackup.value
  isEditingDescription.value = false
}

const form = ref({
  name: '',
  status: 'open',
  deadline: '',
  listId: null,
  description: '',
})

const originalForm = ref({})

const cardLogs = computed(() => boardStore.getCardLogs || [])

const visibleLogs = computed(() => {
  if (showAllLogs.value) return cardLogs.value
  return cardLogs.value.slice(0, 3)
})

const statusIcon = computed(() => {
  const icons = {
    open: 'radio_button_unchecked',
    in_progress: 'pending',
    review: 'visibility',
    done: 'check_circle',
  }
  return icons[form.value.status] || 'radio_button_unchecked'
})

const deadlineFormatted = computed(() => {
  if (!deadlineDate.value) return 'ДД.ММ.ГГГГ'
  const d = new Date(deadlineDate.value + 'T00:00:00')
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
})

const formattedDeadlineFull = computed(() => {
  if (!form.value.deadline) return ''
  const d = new Date(form.value.deadline + 'T00:00:00')
  const date = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  return deadlineTime.value ? `${date}, ${deadlineTime.value}` : date
})

function formatLogDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const datePart = date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const timePart = date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${datePart}, ${timePart}`
}

function initForm(card) {
  initializing.value = true
  const data = {
    name: card.name || '',
    status: card.status || 'open',
    deadline: card.deadline ? card.deadline.slice(0, 10) : '',
    listId: card.list?.id || null,
    description: card.description || '',
  }
  form.value = { ...data }
  originalForm.value = { ...data }
  cardExecutors.value = [...(card.executor || [])]
  executorSearch.value = ''
  showAllLogs.value = false
  isEditingDescription.value = false

  // Fetch users list if not loaded
  if (canManageCardDetails.value && !userStore.getUsers?.length) {
    userStore.fetchUsers()
  }

  // Fetch card logs from API
  if (card.id) {
    boardStore.fetchCardLogs(card.id)
  }

  if (card.deadline) {
    deadlineDate.value = card.deadline.slice(0, 10)
    deadlineTime.value = card.deadline.slice(11, 16) || '12:00'
    deadlineEnabled.value = true
  } else {
    deadlineDate.value = new Date().toISOString().slice(0, 10)
    deadlineTime.value = '12:00'
    deadlineEnabled.value = false
  }
  nextTick(() => { initializing.value = false })
}

function saveDeadline() {
  if (deadlineEnabled.value && deadlineDate.value) {
    form.value.deadline = deadlineDate.value
  } else {
    form.value.deadline = ''
  }
  showDeadlinePicker.value = false
  save()
}

function deleteDeadline() {
  form.value.deadline = ''
  deadlineEnabled.value = false
  showDeadlinePicker.value = false
  save()
}

watch(
  () => [props.modelValue, props.card?.id],
  ([open, cardId], prevState) => {
    const [prevOpen, prevCardId] = prevState || []
    if (!open || !cardId || !props.card) return
    const isOpening = !prevOpen && open
    const isCardSwitchedWhileOpen = prevOpen && open && cardId !== prevCardId
    if (isOpening || isCardSwitchedWhileOpen) {
      initForm(props.card)
    }
  },
  { immediate: true },
)

function close() {
  emit('update:modelValue', false)
}

function toggleArchive() {
  if (!props.card?.id) return
  emit('toggleArchive', {
    cardId: props.card.id,
    isArchived: !isCardArchived.value,
  })
}

function syncPattern() {
  if (!props.card?.id) return
  emit('syncPattern', {
    ...props.card,
    name: form.value.name,
    description: form.value.description,
  })
}

function save() {
  const data = {
    name: form.value.name,
    status: form.value.status,
    deadline: form.value.deadline
      ? form.value.deadline + 'T' + (deadlineTime.value || '12:00') + ':00+00:00'
      : null,
    listId: form.value.listId,
    description: form.value.description,
  }
  emit('save', data)
  originalForm.value = { ...form.value }
}

function onTitleBlur() {
  if (!canManageCardDetails.value) return
  if (form.value.name !== originalForm.value.name) save()
}

function saveDescription() {
  isEditingDescription.value = false
  if (form.value.description !== originalForm.value.description) save()
}

// Auto-save on status change (skip during init)
watch(() => form.value.status, (val, old) => { if (!initializing.value && old && val !== old) save() })

function onTimeInput(e) {
  let v = e.target.value.replace(/[^\d]/g, '').slice(0, 4)
  if (v.length >= 3) v = v.slice(0, 2) + ':' + v.slice(2)
  deadlineTime.value = v
  e.target.value = v
}

// Enable checkbox when date is picked from calendar
watch(deadlineDate, () => { deadlineEnabled.value = true })
</script>

<style scoped lang="scss">
.card-dialog-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);

  @media (max-width: 959px) {
    padding: 1rem;
    align-items: flex-start;
  }
}

.card-dialog-container {
  width: 100%;
  max-width: 1180px;
  max-height: calc(100vh - 4rem);
  background: rgba(20, 18, 50, 0.92);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);

  @media (max-width: 959px) {
    max-height: calc(100vh - 2rem);
  }
}

/* Top bar */
.card-top-bar {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.status-select {
  max-width: 160px;

  :deep(.q-field__control) {
    min-height: 32px;
  }

  :deep(.q-field__native) {
    color: #fff;
    padding: 0;
  }
}

.status-badge-top {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.625rem;
}

.top-btn {
  color: rgba(255, 255, 255, 0.5);

  &:hover {
    color: #fff;
  }
}

/* Body layout */
.card-dialog-body {
  display: flex;
  flex: 1;
  overflow-y: auto;
  min-height: 0;

  @media (max-width: 767px) {
    flex-direction: column;
  }
}

/* Left main */
.card-main {
  flex: 1;
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
  min-width: 0;

  @media (max-width: 599px) {
    padding: 1rem;
  }
}

/* Title */
.card-title-area {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.title-icon {
  margin-top: 6px;
  flex-shrink: 0;
}

.title-input {
  flex: 1;

  :deep(.q-field__control) {
    min-height: 36px;
  }

  :deep(.q-field__native) {
    font-size: 1.25rem;
    font-weight: 700;
    color: #fff;
    line-height: 1.4;
    padding: 0;
  }
}

/* Meta row: executors + deadline inline */
.card-meta-row {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.meta-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.meta-label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.meta-avatars {
  display: flex;
  align-items: center;
}

.meta-avatar {
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  border: 2px solid rgba(12, 14, 36, 1);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    border-radius: 50%;
  }

  & + .meta-avatar {
    margin-left: -4px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
    z-index: 1;
  }

  &.has-image {
    background: rgba(12, 14, 36, 1) !important;
  }
}

.meta-deadline-chip {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8125rem;
  padding: 0.3rem 0.5rem;
  height: 32px;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
  }
}

.meta-deadline-text {
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.8125rem;
}

/* Action chips */
.action-chips {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}

.action-chip {
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 0.8125rem;
  padding: 0.25rem 0.625rem;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
  }
}

/* Sections */
.card-section {
  margin-bottom: 1.25rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.section-icon {
  color: rgba(255, 255, 255, 0.5);
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}

/* Description editor */
.description-editor-wrap {
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  overflow: visible;
  background: rgba(255, 255, 255, 0.04);
}

.desc-editor-toolbar-row {
  display: flex;
  align-items: flex-start;

  .heading-dropdown {
    padding: 0.25rem 0 0 0.25rem;
    flex-shrink: 0;
  }

  .description-editor {
    flex: 1;
    min-width: 0;
  }
}

.desc-toolbar-sep {
  width: 1px;
  height: 18px;
  background: rgba(255, 255, 255, 0.12);
  margin-top: 0.5rem;
  flex-shrink: 0;
}

.description-editor {
  background: transparent;
  color: rgba(255, 255, 255, 0.85);

  :deep(.q-editor__toolbar) {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding: 0.25rem;
    min-height: auto;
  }

  :deep(.q-editor__toolbar .q-btn) {
    color: rgba(255, 255, 255, 0.5);
    padding: 0.25rem;
    min-height: 28px;
    min-width: 28px;

    &:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.1);
    }

    &.q-btn--active {
      color: #fff;
      background: rgba(139, 92, 246, 0.3);
    }
  }

  :deep(.q-editor__toolbar-group + .q-editor__toolbar-group::before) {
    background: rgba(255, 255, 255, 0.12);
  }

  :deep(.q-btn-dropdown__arrow) {
    color: rgba(255, 255, 255, 0.5);
  }

  :deep(.q-editor__content) {
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.875rem;
    line-height: 1.6;
    padding: 0.75rem;
    min-height: 120px;

    h1 { font-size: 1.375rem; font-weight: 700; margin: 0.5rem 0; color: rgba(255, 255, 255, 0.92); }
    h2 { font-size: 1.175rem; font-weight: 700; margin: 0.4rem 0; color: rgba(255, 255, 255, 0.9); }
    h3 { font-size: 1.05rem; font-weight: 600; margin: 0.35rem 0; color: rgba(255, 255, 255, 0.9); }
    h4 { font-size: 0.95rem; font-weight: 600; margin: 0.3rem 0; color: rgba(255, 255, 255, 0.88); }
    h5 { font-size: 0.875rem; font-weight: 600; margin: 0.25rem 0; color: rgba(255, 255, 255, 0.86); }
    h6 { font-size: 0.8125rem; font-weight: 600; margin: 0.2rem 0; color: rgba(255, 255, 255, 0.82); }
  }

  :deep(.q-editor__content a) {
    color: #8b5cf6;
  }

  :deep(.q-editor__content hr) {
    border: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.28);
    margin: 0.85rem 0;
  }
}

.desc-editor-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.desc-save-btn {
  background: rgba(139, 92, 246, 0.35);
  border: 1px solid rgba(139, 92, 246, 0.4);
  color: #fff;
  font-weight: 500;
  font-size: 0.8125rem;
  padding: 0.25rem 0.875rem;

  &:hover {
    background: rgba(139, 92, 246, 0.5);
  }
}

.desc-cancel-btn {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8125rem;
}

/* Description preview (view mode) */
.description-preview {
  min-height: 60px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.15);
  }
}

.description-preview-content {
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.875rem;
  line-height: 1.6;
  word-break: break-word;

  :deep(a) {
    color: #8b5cf6;
  }

  :deep(hr) {
    border: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.28);
    margin: 0.85rem 0;
  }

  :deep(ul),
  :deep(ol) {
    padding-left: 1.25rem;
  }

  :deep(h1) { font-size: 1.375rem; font-weight: 700; margin: 0.5rem 0; }
  :deep(h2) { font-size: 1.175rem; font-weight: 700; margin: 0.4rem 0; }
  :deep(h3) { font-size: 1.05rem; font-weight: 600; margin: 0.35rem 0; }
  :deep(h4) { font-size: 0.95rem; font-weight: 600; margin: 0.3rem 0; }
  :deep(h5) { font-size: 0.875rem; font-weight: 600; margin: 0.25rem 0; }
  :deep(h6) { font-size: 0.8125rem; font-weight: 600; margin: 0.2rem 0; }
}

.description-placeholder {
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.875rem;
}


/* Right sidebar */
.card-sidebar {
  width: 300px;
  min-width: 300px;
  border-left: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.02);

  @media (max-width: 767px) {
    width: 100%;
    min-width: 100%;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    max-height: 300px;
  }
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1rem 0.75rem;
  flex-shrink: 0;
}

.sidebar-icon {
  color: rgba(255, 255, 255, 0.5);
}

.sidebar-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}

.sidebar-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem 1rem;

  .empty-icon {
    color: rgba(255, 255, 255, 0.15);
  }

  span {
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.3);
  }
}

.sidebar-logs {
  flex: 1;
  overflow-y: auto;
  padding: 0 1rem;
}

.log-entry {
  display: flex;
  gap: 0.625rem;
  padding: 0.625rem 0;

  & + .log-entry {
    border-top: 1px solid rgba(255, 255, 255, 0.04);
  }
}

.log-avatar {
  flex-shrink: 0;
  font-size: 0.625rem;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.log-content {
  min-width: 0;
}

.log-description {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.4;
  word-break: break-word;
}

.log-date {
  font-size: 0.6875rem;
  color: rgba(139, 92, 246, 0.6);
  margin-top: 0.25rem;
}

.show-more-btn {
  color: rgba(139, 92, 246, 0.7);
  font-size: 0.75rem;
  margin: 0.25rem 0;
  width: 100%;

  &:hover {
    color: rgba(139, 92, 246, 1);
  }
}

</style>

<style lang="scss">
/* Q-editor heading dropdown — scoped to card dialog editor menus only */
.card-dialog-container .q-menu,
.q-menu:has(.dl-panel),
.q-menu:has(.ex-panel) {
  background: #1e1b38 !important;
  border: 1px solid #2d2a4a !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4) !important;
}

/* Bottom-sheet dialog style when q-popup-proxy uses dialog mode on mobile */
.q-dialog__inner:has(.dl-panel),
.q-dialog__inner:has(.ex-panel) {
  padding: 0 !important;

  > .q-card,
  > div {
    background: #161332 !important;
    border-radius: 16px 16px 0 0 !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-bottom: none !important;
    box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.5) !important;
    max-height: 80vh !important;
    overflow-y: auto;
  }
}

/* Deadline panel — rendered as portal on <body>, must be unscoped */
.q-menu:has(.dl-panel) {
  background: #161332 !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 12px !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6) !important;
  padding: 0 !important;
  overflow: hidden !important;
}

.dl-panel {
  width: 290px;

  @media (max-width: 599px) {
    width: 100%;
  }
}

.dl-header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 0.625rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.75);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.dl-close {
  position: absolute;
  right: 0.5rem;
  color: rgba(255, 255, 255, 0.3) !important;
  &:hover { color: #fff !important; }
}

.dl-calendar {
  background: transparent !important;
  color: #fff !important;
  width: 100% !important;
  min-height: 0 !important;
  padding: 0.25rem 0.5rem !important;

  .q-date__header { display: none !important; }

  .q-date__view {
    padding: 0 !important;
    min-height: 0 !important;
  }

  .q-date__navigation {
    min-height: 32px !important;
    padding: 0 !important;
    color: rgba(255, 255, 255, 0.8) !important;

    .q-btn {
      color: rgba(255, 255, 255, 0.5) !important;
      min-height: 32px !important;
      min-width: 32px !important;
    }

    .q-date__arrow { font-size: 18px; }
  }

  .q-date__calendar-weekdays > div {
    color: rgba(255, 255, 255, 0.3) !important;
    font-size: 0.6875rem !important;
  }

  .q-date__calendar-days-container {
    min-height: 0 !important;

    .q-date__calendar-item {
      padding: 2px !important;
    }

    .q-btn {
      color: rgba(255, 255, 255, 0.6) !important;
      width: 32px !important;
      height: 32px !important;
      min-height: 32px !important;
      min-width: 32px !important;
      font-size: 0.8125rem !important;
      border-radius: 50% !important;

      &:hover {
        background: rgba(255, 255, 255, 0.08) !important;
      }

      &.q-btn--unelevated {
        background: #3b82f6 !important;
        color: #fff !important;
      }
    }
  }

  .q-date__calendar-item--out { opacity: 0.2 !important; }

  .q-date__calendar-item--today .q-btn {
    border: 1px solid rgba(59, 130, 246, 0.5) !important;
  }
}

.dl-body {
  padding: 0.75rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.dl-label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.35);
  margin-bottom: 0.375rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dl-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.dl-date {
  flex: 1;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  padding: 0.375rem 0.625rem;
  font-size: 0.8125rem;
  color: #fff;
  &.disabled { opacity: 0.4; }
}

.dl-time {
  width: 70px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  padding: 0.375rem 0.5rem;
  font-size: 0.8125rem;
  font-family: inherit;
  color: #fff;
  outline: none;
  -webkit-appearance: none;
  appearance: none;

  &:disabled { opacity: 0.4; }
  &::-webkit-calendar-picker-indicator { display: none; }
}


.dl-save {
  width: 100%;
  background: #3b82f6 !important;
  color: #fff !important;
  font-weight: 600;
  font-size: 0.8125rem;
  padding: 0.5rem;
  border-radius: 8px;
  margin-bottom: 0.375rem;
  &:hover { background: #2563eb !important; }
}

.dl-delete {
  width: 100%;
  color: rgba(255, 255, 255, 0.45) !important;
  font-size: 0.8125rem;
  padding: 0.375rem;
  border-radius: 6px;
  &:hover {
    color: #fff !important;
    background: rgba(255, 255, 255, 0.06) !important;
  }
}

/* ── Executor picker panel ── */
.q-menu:has(.ex-panel) {
  background: #161332 !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 14px !important;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.55) !important;
  padding: 0 !important;
  overflow: hidden !important;
}

.ex-panel {
  width: 300px;
  max-height: 420px;
  display: flex;
  flex-direction: column;

  @media (max-width: 599px) {
    width: 100%;
    max-height: 60vh;
  }
}

.ex-header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 0.75rem 1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.ex-close {
  position: absolute;
  right: 0.625rem;
  color: rgba(255, 255, 255, 0.3) !important;
  &:hover { color: #fff !important; }
}

/* Search */
.ex-search-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.ex-search-icon {
  color: rgba(255, 255, 255, 0.25);
  flex-shrink: 0;
}

.ex-search {
  flex: 1;

  .q-field__control {
    min-height: 32px !important;
    height: 32px !important;
  }

  .q-field__native {
    color: rgba(255, 255, 255, 0.85) !important;
    font-size: 0.8125rem !important;
    padding: 0 !important;

    &::placeholder {
      color: rgba(255, 255, 255, 0.3) !important;
    }
  }
}

.ex-section-label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.625rem 0.75rem 0.375rem;
}

/* User list */
.ex-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 0.375rem 0.375rem;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
}

.ex-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.625rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  &.selected {
    background: rgba(139, 92, 246, 0.1);

    &:hover {
      background: rgba(139, 92, 246, 0.15);
    }
  }
}

.ex-avatar {
  flex-shrink: 0;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.avatar-fallback-initial {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  font-weight: 700;
  transform: translateY(1px);
}

.ex-user-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.ex-name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ex-email {
  font-size: 0.6875rem;
  color: rgba(255, 255, 255, 0.35);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ex-check {
  flex-shrink: 0;
  color: #8b5cf6;
}

.ex-check-fade-enter-active,
.ex-check-fade-leave-active {
  transition: all 0.2s ease;
}

.ex-check-fade-enter-from,
.ex-check-fade-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

.ex-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 1rem;
  color: rgba(255, 255, 255, 0.25);
  font-size: 0.8125rem;
}
</style>
