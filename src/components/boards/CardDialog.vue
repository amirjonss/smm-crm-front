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
          <template v-if="initializing">
            <div class="card-main">
              <!-- Title skeleton -->
              <div class="card-title-area">
                <q-skeleton type="QAvatar" size="28px" class="bg-white-10 title-icon" dark animation="pulse" />
                <q-skeleton type="text" width="60%" height="44px" class="bg-white-10 title-input" dark animation="pulse" />
              </div>

              <!-- Actions row skeleton -->
              <div class="action-chips">
                <q-skeleton type="QBadge" width="120px" height="32px" class="bg-white-10" style="border-radius: 8px" dark animation="pulse" />
                <q-skeleton type="QBadge" width="100px" height="32px" class="bg-white-10" style="border-radius: 8px" dark animation="pulse" />
                <q-skeleton type="QBadge" width="130px" height="32px" class="bg-white-10" style="border-radius: 8px" dark animation="pulse" />
              </div>

              <!-- Meta info skeleton -->
              <div class="card-meta-row">
                <div class="meta-group">
                  <div class="meta-label"><q-skeleton type="text" width="70px" class="bg-white-10" dark animation="pulse" /></div>
                  <div class="meta-avatars" style="display:flex">
                    <q-skeleton type="QAvatar" size="32px" class="bg-white-10 meta-avatar" dark animation="pulse" />
                    <q-skeleton type="QAvatar" size="32px" class="bg-white-10 meta-avatar" dark animation="pulse" style="margin-left: -8px;" />
                  </div>
                </div>
                <div class="meta-group">
                  <div class="meta-label"><q-skeleton type="text" width="40px" class="bg-white-10" dark animation="pulse" /></div>
                  <q-skeleton type="QBadge" width="100px" height="32px" class="bg-white-10" style="border-radius: 8px" dark animation="pulse" />
                </div>
              </div>

              <!-- Description section skeleton -->
              <div class="card-section">
                <div class="section-header">
                  <q-skeleton type="QAvatar" size="20px" class="bg-white-10 section-icon" dark animation="pulse" />
                  <q-skeleton type="text" width="80px" height="24px" class="bg-white-10" dark animation="pulse" />
                </div>
                <div class="description-editor-wrap q-pa-md" style="min-height:160px;">
                  <q-skeleton type="text" width="90%" class="bg-white-10 q-mb-sm" dark animation="pulse" />
                  <q-skeleton type="text" width="100%" class="bg-white-10 q-mb-sm" dark animation="pulse" />
                  <q-skeleton type="text" width="75%" class="bg-white-10 q-mb-sm" dark animation="pulse" />
                  <q-skeleton type="text" width="40%" class="bg-white-10" dark animation="pulse" />
                </div>
              </div>
            </div>

            <!-- Right sidebar: logs skeleton -->
            <div class="card-sidebar" :class="{ 'is-expanded': showLogsMobile }">
              <template v-if="$q.screen.gt.xs">
                <div class="sidebar-header">
                  <q-skeleton type="QAvatar" size="20px" class="bg-white-10 sidebar-icon" dark animation="pulse" />
                  <q-skeleton type="text" width="180px" height="24px" class="bg-white-10" dark animation="pulse" />
                </div>
                <div class="sidebar-content-wrapper">
                  <div class="comment-compose">
                    <q-skeleton type="rect" height="60px" class="bg-white-10" style="border-radius: 10px" dark animation="pulse" />
                  </div>
                  <div class="sidebar-logs">
                    <div v-for="i in 3" :key="i" class="log-entry">
                      <q-skeleton type="QAvatar" size="28px" class="bg-white-10 log-avatar" dark animation="pulse" />
                      <div class="log-content">
                        <div class="log-head-row">
                          <q-skeleton type="text" width="120px" class="bg-white-10" dark animation="pulse" />
                          <q-skeleton type="QBadge" width="60px" height="18px" class="bg-white-10" style="border-radius: 9999px" dark animation="pulse" />
                        </div>
                        <q-skeleton type="text" width="100%" class="bg-white-10 q-mt-xs" dark animation="pulse" />
                        <q-skeleton type="text" width="80%" class="bg-white-10 q-mt-xs" dark animation="pulse" />
                        <q-skeleton type="text" width="60px" class="bg-white-10 q-mt-sm" dark animation="pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </template>

          <template v-else>
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
                <q-space />
                <q-btn
                  v-if="canManageCardDetails && !showInlineDescriptionEditor"
                  flat
                  dense
                  round
                  size="sm"
                  icon="edit"
                  class="desc-edit-trigger"
                  @click.stop="startDescriptionEdit"
                >
                  <q-tooltip>Редактировать описание</q-tooltip>
                </q-btn>
              </div>

              <div
                class="description-container"
                :class="{
                  'is-editable': canManageCardDetails && !isEditingDescription,
                  'is-inline-editing': showInlineDescriptionEditor,
                }"
                @click="handleDescriptionClick"
              >
                <template v-if="showInlineDescriptionEditor">
                  <div class="description-editor-wrap description-editor-inline">
                    <q-editor
                      ref="descEditorRef"
                      v-model="form.description"
                      :toolbar="activeToolbar"
                      flat
                      min-height="220px"
                      content-class="desc-editor-content"
                      class="description-editor"
                      placeholder="Добавьте подробное описание карточки..."
                      @paste="onEditorPaste"
                    />
                    <div class="desc-editor-actions">
                      <q-btn
                        unelevated
                        dense
                        no-caps
                        label="Сохранить"
                        class="desc-save-btn"
                        @click.stop="saveDescription"
                      />
                      <q-btn
                        flat
                        dense
                        no-caps
                        label="Отмена"
                        class="desc-cancel-btn"
                        @click.stop="cancelDescriptionEdit"
                      />
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div
                    v-if="form.description"
                    class="description-preview-content"
                    v-html="form.description"
                  />
                  <span v-else class="description-placeholder">
                    Добавить более подробное описание...
                  </span>
                </template>
              </div>

              <q-dialog
                v-if="isMobileDescriptionEditor"
                v-model="isEditingDescription"
                persistent
                transition-show="fade"
                transition-hide="fade"
              >
                <q-card class="description-editor-panel">
                  <div class="description-editor-panel-header">
                    <div class="description-editor-panel-title">Редактировать описание</div>
                    <q-btn
                      flat
                      round
                      dense
                      icon="close"
                      class="desc-panel-close"
                      @click.stop="cancelDescriptionEdit"
                    />
                  </div>

                  <div class="description-editor-wrap">
                    <q-editor
                      ref="descEditorRef"
                      v-model="form.description"
                      :toolbar="activeToolbar"
                      flat
                      min-height="220px"
                      content-class="desc-editor-content"
                      class="description-editor"
                      placeholder="Добавьте подробное описание карточки..."
                      @paste="onEditorPaste"
                    />
                  </div>

                  <div class="desc-editor-actions">
                    <q-btn
                      unelevated
                      dense
                      no-caps
                      label="Сохранить"
                      class="desc-save-btn"
                      @click.stop="saveDescription"
                    />
                    <q-btn
                      flat
                      dense
                      no-caps
                      label="Отмена"
                      class="desc-cancel-btn"
                      @click.stop="cancelDescriptionEdit"
                    />
                  </div>
                </q-card>
              </q-dialog>
            </div>


          </div>

          <!-- Right sidebar: logs -->
          <div class="card-sidebar" :class="{ 'is-expanded': showLogsMobile }">
            <template v-if="$q.screen.gt.xs">
              <div class="sidebar-header">
                <q-icon name="history" size="20px" class="sidebar-icon" />
                <span class="sidebar-title">Комментарии и события</span>
              </div>
              <div class="sidebar-content-wrapper">
                <div class="comment-compose">
                  <q-input
                    v-model="newCommentText"
                    autogrow
                    dense
                    outlined
                    class="comment-input"
                    maxlength="1000"
                    placeholder="Напишите комментарий..."
                    :disable="isCommentSubmitting || !props.card?.id"
                    @keydown.ctrl.enter.prevent="submitComment"
                    @keydown.meta.enter.prevent="submitComment"
                  />
                  <div class="comment-compose-footer">
                    <span class="comment-compose-hint">Ctrl/⌘ + Enter</span>
                    <q-btn
                      unelevated
                      no-caps
                      class="comment-submit-btn"
                      label="Отправить"
                      :loading="isCommentSubmitting"
                      :disable="!newCommentText.trim() || !props.card?.id"
                      @click="submitComment"
                    />
                  </div>
                </div>

                <div v-if="cardLogs.length === 0" class="sidebar-empty">
                  <q-icon name="info_outline" size="24px" class="empty-icon" />
                  <span>Нет комментариев и событий</span>
                </div>

                <div v-else class="sidebar-logs">
                  <div
                    v-for="log in visibleLogs"
                    :key="log.id"
                    class="log-entry"
                    :class="{ 'is-comment': isComment(log), 'is-log': !isComment(log) }"
                  >
                    <q-avatar size="28px" color="primary" text-color="white" class="log-avatar">
                      <img v-if="getUserAvatarUrl(log.createdBy)" :src="getUserAvatarUrl(log.createdBy)" alt="User avatar" />
                      <span v-else class="avatar-fallback-initial">{{ (log.createdBy?.givenName?.[0] || '?').toUpperCase() }}</span>
                    </q-avatar>
                    <div class="log-content">
                      <div class="log-head-row">
                        <div class="log-author-row">
                          <span class="log-author">{{ log.createdBy?.givenName || 'Пользователь' }}</span>
                          <span class="log-type-badge" :class="{ comment: isComment(log), event: !isComment(log) }">
                            {{ isComment(log) ? 'Комментарий' : 'Событие' }}
                          </span>
                        </div>
                        <div v-if="canModifyComment(log)" class="log-actions">
                          <q-btn
                            flat
                            dense
                            round
                            size="sm"
                            icon="edit"
                            class="log-action-btn"
                            @click="startEditComment(log)"
                          />
                          <q-btn
                            flat
                            dense
                            round
                            size="sm"
                            icon="delete"
                            class="log-action-btn delete"
                            :loading="deletingCommentId === log.id"
                            @click="deleteComment(log)"
                          />
                        </div>
                      </div>
                      <template v-if="isEditingComment(log)">
                        <q-input
                          v-model="editingCommentText"
                          autogrow
                          dense
                          outlined
                          class="comment-edit-input"
                          maxlength="1000"
                          @keydown.ctrl.enter.prevent="saveEditedComment(log)"
                          @keydown.meta.enter.prevent="saveEditedComment(log)"
                        />
                        <div class="comment-edit-actions">
                          <q-btn
                            unelevated
                            no-caps
                            dense
                            label="Сохранить"
                            class="comment-save-btn"
                            :loading="isEditingCommentSubmitting"
                            :disable="!editingCommentText.trim()"
                            @click="saveEditedComment(log)"
                          />
                          <q-btn
                            flat
                            no-caps
                            dense
                            label="Отмена"
                            class="comment-cancel-btn"
                            @click="cancelEditComment"
                          />
                        </div>
                      </template>
                      <div v-else class="log-description">{{ log.description }}</div>
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
            </template>

            <template v-else>
              <q-expansion-item
                v-model="showLogsMobile"
                icon="history"
                label="Комментарии и события"
                header-class="mobile-logs-header"
                expand-icon-class="mobile-logs-expand-icon"
              >
                <div class="sidebar-content-wrapper mobile">
                  <div class="comment-compose">
                    <q-input
                      v-model="newCommentText"
                      autogrow
                      dense
                      outlined
                      class="comment-input"
                      maxlength="1000"
                      placeholder="Напишите комментарий..."
                      :disable="isCommentSubmitting || !props.card?.id"
                    />
                    <div class="comment-compose-footer">
                      <q-btn
                        unelevated
                        no-caps
                        class="comment-submit-btn"
                        label="Отправить"
                        :loading="isCommentSubmitting"
                        :disable="!newCommentText.trim() || !props.card?.id"
                        @click="submitComment"
                      />
                    </div>
                  </div>

                  <div v-if="cardLogs.length === 0" class="sidebar-empty">
                    <span>Нет комментариев</span>
                  </div>

                  <div v-else class="sidebar-logs">
                    <div
                      v-for="log in visibleLogs"
                      :key="log.id"
                      class="log-entry"
                      :class="{ 'is-comment': isComment(log), 'is-log': !isComment(log) }"
                    >
                      <q-avatar size="24px" color="primary" text-color="white" class="log-avatar">
                        <img v-if="getUserAvatarUrl(log.createdBy)" :src="getUserAvatarUrl(log.createdBy)" alt="User avatar" />
                        <span v-else class="avatar-fallback-initial">{{ (log.createdBy?.givenName?.[0] || '?').toUpperCase() }}</span>
                      </q-avatar>
                      <div class="log-content">
                        <div class="log-head-row">
                          <div class="log-author-row">
                            <span class="log-author">{{ log.createdBy?.givenName || 'Пользователь' }}</span>
                            <span class="log-type-badge" :class="{ comment: isComment(log), event: !isComment(log) }">
                              {{ isComment(log) ? 'Комм.' : 'Соб.' }}
                            </span>
                          </div>
                          <div v-if="canModifyComment(log)" class="log-actions">
                            <q-btn
                              flat
                              dense
                              round
                              size="xs"
                              icon="edit"
                              class="log-action-btn"
                              @click="startEditComment(log)"
                            />
                            <q-btn
                              flat
                              dense
                              round
                              size="xs"
                              icon="delete"
                              class="log-action-btn delete"
                              :loading="deletingCommentId === log.id"
                              @click="deleteComment(log)"
                            />
                          </div>
                        </div>
                        <template v-if="isEditingComment(log)">
                          <q-input
                            v-model="editingCommentText"
                            autogrow
                            dense
                            outlined
                            class="comment-edit-input"
                            maxlength="1000"
                          />
                          <div class="comment-edit-actions">
                            <q-btn
                              unelevated
                              no-caps
                              dense
                              label="Ок"
                              class="comment-save-btn"
                              @click="saveEditedComment(log)"
                            />
                            <q-btn
                              flat
                              no-caps
                              dense
                              label="Отмена"
                              class="comment-cancel-btn"
                              @click="cancelEditComment"
                            />
                          </div>
                        </template>
                        <div v-else class="log-description">{{ log.description }}</div>
                        <div class="log-date">{{ formatLogDate(log.createdAt) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </q-expansion-item>
            </template>
          </div>
          </template>
        </div>
      </div>
    </div>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { CARD_STATUS, CARD_STATUS_OPTIONS, CARD_STATUS_COLORS } from '@/constants/cardStatus'
import { useUserStore } from 'stores/user.js'
import { useBoardStore } from 'stores/board.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  card: { type: Object, default: null },
  lists: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'save', 'toggleArchive', 'syncPattern'])

const q = useQuasar()
const userStore = useUserStore()
const boardStore = useBoardStore()
const canManageCardDetails = computed(() => userStore.isAdmin || userStore.isSMM)
const currentUserId = computed(() => userStore.getUser?.id || null)

const showLogsMobile = ref(false)

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
const newCommentText = ref('')
const isCommentSubmitting = ref(false)
const editingCommentId = ref(null)
const editingCommentText = ref('')
const isEditingCommentSubmitting = ref(false)
const deletingCommentId = ref(null)
const isMobileDescriptionEditor = computed(() => q.screen.width < 768)
const showInlineDescriptionEditor = computed(
  () => isEditingDescription.value && !isMobileDescriptionEditor.value
)

const activeToolbar = computed(() => {
  return q.screen.gt.xs ? [
    ['bold', 'italic', 'underline'],
    ['unordered', 'ordered'],
    ['link'],
    ['left', 'center', 'right', 'justify'],
  ] : [
    ['bold', 'italic', 'underline', 'unordered', 'ordered', 'link'],
    [{
      label: '',
      icon: 'more_horiz',
      fixedIcon: true,
      list: 'no-icons editor-toolbar-dropdown',
      options: [
        'left', 'center', 'right', 'justify',
      ]
    }]
  ]
})

function startDescriptionEdit() {
  if (!canManageCardDetails.value) return
  descriptionBackup.value = form.value.description
  isEditingDescription.value = true
  nextTick(() => {
    descEditorRef.value?.focus?.()
  })
}

function handleDescriptionClick(event) {
  const target = event?.target
  if (target instanceof HTMLElement && target.closest('a')) return
  if (!canManageCardDetails.value || isEditingDescription.value) return
  startDescriptionEdit()
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

function isComment(log) {
  return log?.type === 'COMMENT'
}

function canModifyComment(log) {
  if (!isComment(log) || !log?.id) return false
  return log.createdBy?.id === currentUserId.value
}

function isEditingComment(log) {
  return editingCommentId.value === log?.id
}

function startEditComment(log) {
  if (!canModifyComment(log)) return
  editingCommentId.value = log.id
  editingCommentText.value = log.description || ''
}

function cancelEditComment() {
  editingCommentId.value = null
  editingCommentText.value = ''
}

async function submitComment() {
  const cardId = props.card?.id
  const description = newCommentText.value.trim()
  if (!cardId || !description || isCommentSubmitting.value) return

  isCommentSubmitting.value = true
  try {
    await boardStore.createCardLog(cardId, description)
    newCommentText.value = ''
  } catch {
    q.notify({
      message: 'Не удалось добавить комментарий',
      type: 'negative',
      position: 'top',
    })
  } finally {
    isCommentSubmitting.value = false
  }
}

async function saveEditedComment(log) {
  const description = editingCommentText.value.trim()
  if (!canModifyComment(log) || !description || isEditingCommentSubmitting.value) return

  isEditingCommentSubmitting.value = true
  try {
    await boardStore.patchCardLog(log.id, description)
    cancelEditComment()
  } catch {
    q.notify({
      message: 'Не удалось сохранить комментарий',
      type: 'negative',
      position: 'top',
    })
  } finally {
    isEditingCommentSubmitting.value = false
  }
}

async function deleteComment(log) {
  if (!canModifyComment(log) || deletingCommentId.value) return

  q.dialog({
    title: 'Удалить комментарий?',
    message: 'Это действие нельзя отменить.',
    persistent: true,
    ok: {
      label: 'Удалить',
      color: 'negative',
      unelevated: true,
      noCaps: true,
    },
    cancel: {
      label: 'Отмена',
      flat: true,
      noCaps: true,
    },
  }).onOk(async () => {
    deletingCommentId.value = log.id
    try {
      await boardStore.deleteCardLog(log.id)
      if (editingCommentId.value === log.id) {
        cancelEditComment()
      }
    } catch {
      q.notify({
        message: 'Не удалось удалить комментарий',
        type: 'negative',
        position: 'top',
      })
    } finally {
      deletingCommentId.value = null
    }
  })
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
  newCommentText.value = ''
  cancelEditComment()

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

// Sync form with real-time Mercure updates while dialog is open
watch(
  () =>
    props.card && {
      name: props.card.name,
      status: props.card.status,
      description: props.card.description,
      deadline: props.card.deadline,
      executor: props.card.executor,
    },
  (newCard, oldCard) => {
    if (!props.modelValue || !newCard || initializing.value) return
    if (!oldCard) return
    form.value.name = newCard.name || ''
    form.value.status = newCard.status || 'open'
    if (!isEditingDescription.value) {
      form.value.description = newCard.description || ''
    }
    if (newCard.deadline !== oldCard.deadline) {
      form.value.deadline = newCard.deadline ? newCard.deadline.slice(0, 10) : ''
      if (newCard.deadline) {
        deadlineDate.value = newCard.deadline.slice(0, 10)
        deadlineTime.value = newCard.deadline.slice(11, 16) || '12:00'
        deadlineEnabled.value = true
      } else {
        deadlineEnabled.value = false
      }
    }
    if (newCard.executor) {
      cardExecutors.value = [...newCard.executor]
    }
  },
  { deep: true },
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

function autoLinkify(html) {
  if (!html) return html;

  // Clean up zero-width spaces that might break URL parsing
  let cleanHtml = html.replace(/\u200B/g, '').replace(/<wbr>/gi, '');

  const temp = document.createElement('div');
  temp.innerHTML = cleanHtml;

  function processNode(node) {
    if (node.nodeType === 3) {
      const urlRegex = /(https?:\/\/[^\s<]+)/g;
      const text = node.nodeValue;
      let match;
      let lastIndex = 0;
      const parent = node.parentNode;
      let hasMatch = false;

      while ((match = urlRegex.exec(text)) !== null) {
        hasMatch = true;
        if (match.index > lastIndex) {
          parent.insertBefore(document.createTextNode(text.slice(lastIndex, match.index)), node);
        }

        let url = match[0];
        let suffix = '';
        const suffixMatch = url.match(/([.,;?!)]+)$/);
        if (suffixMatch) {
          url = url.slice(0, -suffixMatch[1].length);
          suffix = suffixMatch[1];
        }

        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.textContent = url;
        parent.insertBefore(a, node);

        if (suffix) {
          parent.insertBefore(document.createTextNode(suffix), node);
        }

        lastIndex = urlRegex.lastIndex;
      }

      if (hasMatch) {
        if (lastIndex < text.length) {
          parent.insertBefore(document.createTextNode(text.slice(lastIndex)), node);
        }
        parent.removeChild(node);
      }
    } else if (node.nodeType === 1) {
      if (node.nodeName !== 'A' && node.nodeName !== 'BUTTON') {
        Array.from(node.childNodes).forEach(processNode);
      }
    }
  }

  Array.from(temp.childNodes).forEach(processNode);
  return temp.innerHTML;
}

function stripPasteStyles(html) {
  const div = document.createElement('div')
  div.innerHTML = html
  div.querySelectorAll('*').forEach((el) => {
    // Remove color, background, font-family, font-size inline styles
    const style = el.getAttribute('style')
    if (style) {
      const cleaned = style
        .split(';')
        .filter((s) => !/^\s*(color|background|background-color|font-family|font-size|mso-|line-height)\s*:/i.test(s))
        .join(';')
      if (cleaned.trim()) el.setAttribute('style', cleaned)
      else el.removeAttribute('style')
    }
    // Remove color/face attributes on legacy tags
    el.removeAttribute('color')
    el.removeAttribute('face')
  })
  return div.innerHTML
}

function insertAtCursor(content) {
  const sel = window.getSelection()
  if (!sel || !sel.rangeCount) return
  sel.deleteFromDocument()
  const range = sel.getRangeAt(0)

  if (typeof content === 'string') {
    const temp = document.createElement('div')
    temp.innerHTML = content
    const frag = document.createDocumentFragment()
    let lastNode
    while (temp.firstChild) {
      lastNode = frag.appendChild(temp.firstChild)
    }
    range.insertNode(frag)
    if (lastNode) {
      range.setStartAfter(lastNode)
      range.collapse(true)
      sel.removeAllRanges()
      sel.addRange(range)
    }
  }

  // Trigger q-editor's onInput to sync v-model
  const editor = descEditorRef.value?.$el?.querySelector('.q-editor__content')
  if (editor) editor.dispatchEvent(new Event('input', { bubbles: true }))
}

function onEditorPaste(evt) {
  evt.preventDefault()
  evt.stopImmediatePropagation()
  const text = (evt.clipboardData || window.clipboardData).getData('text')
  if (/^https?:\/\/[^\s]+$/.test(text.trim())) {
    const url = text.trim()
    insertAtCursor(`<a href="${url}" target="_blank">${url}</a>`)
    return
  }
  // Strip color/font styles from pasted HTML
  const html = evt.clipboardData?.getData('text/html')
  if (html) {
    insertAtCursor(stripPasteStyles(html))
  } else if (text) {
    insertAtCursor(text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>'))
  }
}

function saveDescription() {
  isEditingDescription.value = false
  form.value.description = autoLinkify(form.value.description)
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
  width: 1200px;
  min-width: 1200px;
  height: 614px;
  min-height: 614px;
  max-width: calc(100vw - 4rem);
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

  @media (max-width: 1199px), (max-height: 760px) {
    width: 100%;
    min-width: 0;
    height: auto;
    min-height: 0;
  }

  @media (max-width: 959px) {
    max-height: calc(100vh - 2rem);
  }
}

/* Top bar */
.card-top-bar {
  display: flex;
  align-items: center;
  min-height: 57px;
  height: 57px;
  padding: 0 1rem;
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
  height: calc(614px - 57px);
  overflow-y: auto;
  min-height: 0;

  @media (max-width: 1199px), (max-height: 760px) {
    height: auto;
  }

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

  @media (max-width: 599px) {
    margin-bottom: 0.85rem;
  }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.section-icon {
  color: rgba(255, 255, 255, 0.5);

  @media (max-width: 599px) {
    font-size: 18px !important;
  }
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);

  @media (max-width: 599px) {
    font-size: 0.8125rem;
  }
}

/* Description editor */
.desc-edit-trigger {
  color: rgba(255, 255, 255, 0.5);

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }
}

.description-container {
  min-height: 140px;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  transition: border-color 0.2s ease, background-color 0.2s ease;

  &.is-editable {
    cursor: pointer;

    &:hover {
      border-color: rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.06);
    }
  }

  &.is-inline-editing {
    padding: 0;
    cursor: default;
    border-color: rgba(255, 255, 255, 0.16);
    background: rgba(255, 255, 255, 0.02);
  }

  @media (max-width: 599px) {
    min-height: 120px;
    padding: 0.625rem;
  }
}

.description-editor-panel {
  width: min(760px, calc(100vw - 2rem));
  max-height: min(76vh, 640px);
  margin-top: -24px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 14px;
  background: rgba(22, 20, 50, 0.97);
  box-shadow: 0 28px 64px rgba(0, 0, 0, 0.58);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  @media (max-width: 599px) {
    width: calc(100vw - 1rem);
    max-height: calc(100vh - 3rem);
    margin-top: 0;
    border-radius: 12px;
  }
}

.description-editor-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0.875rem 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.description-editor-panel-title {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  font-weight: 600;
}

.desc-panel-close {
  color: rgba(255, 255, 255, 0.55);

  &:hover {
    color: #fff;
  }
}

.description-editor-wrap {
  flex: 1;
  min-height: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}

.description-editor-inline {
  min-height: 100%;
}

.description-editor {
  height: 100%;
  background: transparent;
  color: rgba(255, 255, 255, 0.85);

  :deep(.q-editor__toolbar) {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 0.25rem 0.375rem;
    min-height: 38px;
    scrollbar-width: none;
    background: rgba(255, 255, 255, 0.02) !important;
  }

  :deep(.q-editor__toolbar::-webkit-scrollbar) {
    display: none;
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
    min-height: 220px;
    max-height: min(44vh, 380px);

    h1 { font-size: 1.375rem; font-weight: 700; margin: 0.5rem 0; color: rgba(255, 255, 255, 0.92); }
    h2 { font-size: 1.175rem; font-weight: 700; margin: 0.4rem 0; color: rgba(255, 255, 255, 0.9); }
    h3 { font-size: 1.05rem; font-weight: 600; margin: 0.35rem 0; color: rgba(255, 255, 255, 0.9); }
    h4 { font-size: 0.95rem; font-weight: 600; margin: 0.3rem 0; color: rgba(255, 255, 255, 0.88); }
    h5 { font-size: 0.875rem; font-weight: 600; margin: 0.25rem 0; color: rgba(255, 255, 255, 0.86); }
    h6 { font-size: 0.8125rem; font-weight: 600; margin: 0.2rem 0; color: rgba(255, 255, 255, 0.82); }
  }

  :deep(.q-editor__content a) {
    color: #8b5cf6;
    word-break: break-all;
    overflow-wrap: break-word;
  }

  :deep(.q-editor__content hr) {
    border: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.28);
    margin: 0.85rem 0;
  }
}

.desc-editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
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

.description-preview-content {
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.875rem;
  line-height: 1.6;
  word-break: break-word;

  :deep(a) {
    color: #8b5cf6;
    word-break: break-all;
    overflow-wrap: break-word;
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

  @media (max-width: 599px) {
    font-size: 0.8125rem;
  }
}

.description-placeholder {
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.875rem;

  @media (max-width: 599px) {
    font-size: 0.8125rem;
  }
}


/* Right sidebar */
.card-sidebar {
  width: 459px;
  min-width: 459px;
  height: 557px;
  min-height: 557px;
  border-left: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 1199px), (max-height: 760px) {
    width: 360px;
    min-width: 360px;
    height: auto;
    min-height: 0;
  }

  @media (max-width: 767px) {
    width: 100%;
    min-width: 100%;
    height: auto;
    min-height: 0;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    background: transparent;
  }

  &.is-expanded {
    @media (max-width: 767px) {
      max-height: 60vh;
    }
  }
}

:deep(.mobile-logs-header) {
  min-height: 48px;
  padding: 0.5rem 1rem;
  color: rgba(255, 255, 255, 0.86);
  font-size: 0.8125rem;
  font-weight: 600;
  transition: background-color 0.2s ease, color 0.2s ease;

  .q-item__label {
    color: rgba(255, 255, 255, 0.86);
    font-weight: 600;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  &:active {
    background: rgba(255, 255, 255, 0.1);
  }

  .q-item__section--avatar {
    min-width: 32px;
    color: rgba(255, 255, 255, 0.68);
  }
}

:deep(.mobile-logs-expand-icon) {
  color: rgba(255, 255, 255, 0.68);
}

:deep(.q-expansion-item--expanded .mobile-logs-header) {
  background: rgba(255, 255, 255, 0.08);
}

.sidebar-content-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;

  &.mobile {
    background: rgba(255, 255, 255, 0.02);
    border-top: 1px solid rgba(255, 255, 255, 0.04);
  }
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1rem 0.6rem;
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

.comment-compose {
  padding: 0 1rem 0.85rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  @media (max-width: 599px) {
    padding: 0.75rem 0.75rem 0.6rem;
  }
}

.comment-input {
  :deep(.q-field__control) {
    background: rgba(255, 255, 255, 0.04);
    border-radius: 10px;
  }

  :deep(.q-field__native) {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.8125rem;
    line-height: 1.4;
  }
}

.comment-compose-footer {
  margin-top: 0.45rem;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 599px) {
    justify-content: flex-end;
  }
}

.comment-compose-hint {
  font-size: 0.6875rem;
  color: rgba(255, 255, 255, 0.35);
}

.comment-submit-btn {
  font-size: 0.75rem;
  min-height: 28px;
  padding: 0 0.7rem;
  border-radius: 8px;
  background: rgba(34, 197, 94, 0.85);
  color: #fff;

  &:hover {
    background: rgba(22, 163, 74, 0.92);
  }

  @media (max-width: 599px) {
    font-size: 0.7rem;
    padding: 0 0.8rem;
    min-height: 26px;
  }
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

  @media (max-width: 599px) {
    padding: 1rem;
    span { font-size: 0.75rem; }
  }
}

.sidebar-logs {
  flex: 1;
  overflow-y: auto;
  padding: 0.1rem 1rem 0.75rem;

  @media (max-width: 599px) {
    padding: 0.1rem 0.75rem 0.75rem;
  }
}

.log-entry {
  display: flex;
  gap: 0.7rem;
  padding: 0.75rem 0;

  & + .log-entry {
    border-top: 1px solid rgba(255, 255, 255, 0.04);
  }

  &.is-comment .log-content {
    background: rgba(16, 185, 129, 0.09);
    border: 1px solid rgba(16, 185, 129, 0.22);
  }

  &.is-log .log-content {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  @media (max-width: 599px) {
    gap: 0.5rem;
    padding: 0.6rem 0;
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
  flex: 1;
  border-radius: 10px;
  padding: 0.5rem 0.55rem;
}

.log-head-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.log-author-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.log-author {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.82);

  @media (max-width: 599px) {
    font-size: 0.7rem;
  }
}

.log-type-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.12rem 0.4rem;
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.02em;

  &.comment {
    color: rgba(16, 185, 129, 0.95);
    background: rgba(16, 185, 129, 0.16);
  }

  &.event {
    color: rgba(96, 165, 250, 0.95);
    background: rgba(59, 130, 246, 0.16);
  }

  @media (max-width: 599px) {
    padding: 0.08rem 0.35rem;
    font-size: 0.55rem;
  }
}

.log-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.1rem;
}

.log-action-btn {
  color: rgba(255, 255, 255, 0.42);

  &:hover {
    color: #fff;
  }

  &.delete:hover {
    color: rgba(248, 113, 113, 1);
  }
}

.log-description {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
  word-break: break-word;
  white-space: pre-wrap;
  margin-top: 0.35rem;

  @media (max-width: 599px) {
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }
}

.log-date {
  font-size: 0.6875rem;
  color: rgba(255, 255, 255, 0.45);
  margin-top: 0.35rem;

  @media (max-width: 599px) {
    font-size: 0.625rem;
    margin-top: 0.25rem;
  }
}

.comment-edit-input {
  margin-top: 0.4rem;

  :deep(.q-field__control) {
    background: rgba(255, 255, 255, 0.07);
    border-radius: 8px;
  }

  :deep(.q-field__native) {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.8125rem;
    line-height: 1.4;
  }
}

.comment-edit-actions {
  margin-top: 0.4rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.comment-save-btn {
  background: rgba(34, 197, 94, 0.85);
  color: #fff;
  border-radius: 7px;
  font-size: 0.75rem;
  padding: 0 0.6rem;
  min-height: 26px;
}

.comment-cancel-btn {
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.75rem;
}

.show-more-btn {
  color: rgba(96, 165, 250, 0.78);
  font-size: 0.75rem;
  margin: 0.25rem 0;
  width: 100%;

  &:hover {
    color: rgba(147, 197, 253, 1);
  }
}

</style>

<style lang="scss">
/* Q-editor heading dropdown — scoped to card dialog editor menus only */
.card-dialog-container .q-menu,
.q-menu:has(.dl-panel),
.q-menu:has(.ex-panel),
.q-menu:has(.editor-toolbar-dropdown) {
  background: #1e1b38 !important;
  border: 1px solid #2d2a4a !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4) !important;
  z-index: 10000 !important; /* Ensure dropdowns appear above all dialog layers */
  opacity: 1 !important;
  backdrop-filter: none !important;
}

/* Fallback for browsers that don't support :has() and ensuring opaque list */
.editor-toolbar-dropdown {
  background: #1e1b38 !important;
  border: 1px solid #2d2a4a !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4) !important;
  padding: 4px 0 !important;
  opacity: 1 !important;
  backdrop-filter: none !important;
  z-index: 10000 !important;
}

/* Hover state for q-editor dropdown options */
.editor-toolbar-dropdown .q-item {
  color: rgba(255, 255, 255, 0.85) !important;
  transition: background 0.2s, color 0.2s;
  min-height: 36px !important;
  padding: 0 16px !important;
  background: transparent !important; /* clear any transparent quasar utility */

  &:hover, &:focus {
    background: rgba(255, 255, 255, 0.08) !important;
    color: #fff !important;
  }
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
