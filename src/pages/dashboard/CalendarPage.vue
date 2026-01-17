<template>
  <q-page class="calendar-page">
    <div class="page-container">
      <!-- Calendar Header -->
      <div class="calendar-header">
        <div class="header-left">
          <h1 class="page-title">
            <q-icon name="calendar_month" class="page-icon" />
            Календарь контента
          </h1>
        </div>

        <div class="header-controls">
          <q-btn
            v-if="!isCurrentMonthView"
            outline
            label="Сегодня"
            @click="goToToday"
            class="today-btn text-weight-medium"
          />

          <div class="row items-center">
            <q-btn flat round icon="chevron_left" @click="prevMonth" class="gt-xs" />
            <div class="current-month q-mx-md">{{ currentMonthName }} {{ currentYear }}</div>
            <q-btn flat round icon="chevron_right" @click="nextMonth" class="gt-xs" />
          </div>
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="calendar-wrapper" v-touch-swipe.mouse.left.right="handleSwipe">
        <!-- Weekday Headers -->
        <div class="weekdays-grid">
          <div v-for="day in weekDays" :key="day" class="weekday-header">
            {{ day }}
          </div>
        </div>

        <!-- Days Grid -->
        <transition :name="transitionName" mode="out-in">
          <div :key="currentMonthKey" class="days-grid">
            <div
              v-for="(day, index) in calendarDays"
              :key="index"
              class="day-cell cursor-pointer"
              :class="{
                'other-month': !day.isCurrentMonth,
                today: day.isToday,
              }"
              @click="handleDayClick(day)"
              @mouseenter="handleMouseEnter(day.date)"
              @mouseleave="handleMouseLeave"
            >
              <div class="day-header">
                <span class="day-number">{{ day.date.getDate() }}</span>
              </div>

              <div class="day-content">
                <!-- Desktop: Chips -->
                <template v-if="$q.screen.gt.xs">
                  <div
                    v-for="event in getEventsForDate(day.date).slice(0, 2)"
                    :key="event.id"
                    class="event-chip"
                    @click.stop="openEventDialog(event)"
                  >
                    <div class="row no-wrap items-center q-gutter-x-xs">
                      <q-icon :name="getIconForFormat(event.format)" size="xs" />
                      <div class="event-title">{{ truncateText(event.projectName, 30) }}</div>
                    </div>
                    <div class="event-type">{{ event.format }}</div>
                  </div>
                  <div
                    v-if="getEventsForDate(day.date).length > 2"
                    class="more-events-chip"
                    @click.stop="openDayList(day.date)"
                  >
                    +{{ getEventsForDate(day.date).length - 2 }} еще
                  </div>
                </template>

                <!-- Mobile: Dots -->
                <template v-else>
                  <div class="day-dots-container">
                    <div
                      v-for="event in getEventsForDate(day.date)"
                      :key="event.id"
                      class="day-dot"
                    ></div>
                  </div>
                </template>
              </div>

              <!-- Floating Cards Menu (Replaces Tooltip) -->
              <q-menu
                v-if="$q.screen.gt.xs && getEventsForDate(day.date).length > 2"
                :model-value="hoveredDayKey === date.formatDate(day.date, 'YYYY-MM-DD')"
                fit
                anchor="top left"
                self="top left"
                no-parent-event
                persistent
                class="bg-transparent no-shadow no-padding overflow-visible"
                transition-show="scale"
                transition-hide="scale"
                @mouseenter="handleMouseEnter(day.date)"
                @mouseleave="handleMouseLeave"
              >
                <div class="glass-day-card column q-gutter-y-xs">
                  <div
                    class="glass-content custom-scroll"
                    style="max-height: 360px; overflow-y: auto"
                  >
                    <div
                      v-for="event in getEventsForDate(day.date)"
                      :key="event.id"
                      class="event-chip glass-chip cursor-pointer"
                      @click="openEventDialog(event)"
                    >
                      <div class="row no-wrap items-center q-gutter-x-xs">
                        <q-icon :name="getIconForFormat(event.format)" size="xs" />
                        <div class="event-title">{{ truncateText(event.projectName, 30) }}</div>
                      </div>
                      <div class="event-type">{{ event.format }}</div>
                    </div>

                    <!-- Add Button as a Floating Card -->
                    <div
                      v-if="!userStore.isAdmin"
                      class="event-chip glass-chip add-event-card cursor-pointer"
                      @click="openCreateDialog(day.date)"
                    >
                      <q-icon name="add" size="sm" />
                    </div>
                  </div>
                </div>
              </q-menu>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- Mobile/Busy Day Events List Dialog (Centered) -->
    <q-dialog v-model="showDayList">
      <q-card class="calendar-dialog-card" style="width: 100%; min-width: 320px; max-width: 450px">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">{{ selectedDateLabel }}</div>
          <div class="row q-gutter-xs">
            <q-btn
              v-if="!userStore.isAdmin"
              flat
              round
              dense
              icon="add"
              color="primary"
              @click="openCreateDialog(selectedDateForMobileList)"
            />
            <q-btn icon="close" flat round dense v-close-popup />
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div v-if="selectedDayEvents.length === 0" class="text-grey text-center q-pa-md">
            Нет запланированного контента
          </div>
          <q-list v-else separator>
            <q-item
              v-for="event in selectedDayEvents"
              :key="event.id"
              clickable
              v-ripple
              @click="openEventDialog(event)"
            >
              <q-item-section avatar>
                <q-icon
                  :name="getIconForFormat(event.format)"
                  color="primary"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold text-primary">{{
                  event.projectName
                }}</q-item-label>
                <q-item-label caption lines="1">{{ event.title }}</q-item-label>
                <q-item-label caption>{{ event.format }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" color="grey" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Global Event Detail/Edit Dialog -->
    <q-dialog v-model="isEventDialogOpen">
      <q-card class="calendar-dialog-card q-pa-none" style="min-width: 320px; max-width: 400px; overflow: hidden">
        <!-- VIEW MODE -->
        <div v-if="!isEditing && tempEvent.id">
          <q-card-section class="row items-center justify-between q-pb-sm">
            <div class="text-subtitle1 text-weight-bold">Детали контента</div>
            <div class="row q-gutter-xs">
              <q-btn
                v-if="!userStore.isAdmin"
                flat
                round
                dense
                icon="edit"
                size="sm"
                color="primary"
                @click="isEditing = true"
              >
                <q-tooltip>Редактировать</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="close" size="sm" v-close-popup />
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none q-gutter-y-sm">
            <div>
              <div class="text-caption text-grey-7">Проект</div>
              <div class="text-body2 text-weight-medium text-primary">
                {{ tempEvent.projectName || 'Без проекта' }}
              </div>
            </div>

            <div v-if="userStore.isAdmin">
              <div class="text-caption text-grey-7">Исполнитель</div>
              <div class="text-body2 text-weight-medium text-secondary">
                {{ tempEvent.responsibleName || 'Не назначен' }}
              </div>
            </div>

            <div>
              <div class="text-caption text-grey-7">Post (Заголовок)</div>
              <div class="text-body2">{{ tempEvent.title }}</div>
            </div>

            <div>
              <div class="text-caption text-grey-7">Format (Тип)</div>
              <q-chip
                dense
                square
                outline
                color="primary"
                :label="tempEvent.format"
                :icon="getIconForFormat(tempEvent.format)"
                class="q-ma-none q-mt-xs"
              />
            </div>

            <div>
              <div class="text-caption text-grey-7">Idea (Идея)</div>
              <div
                class="text-body2 popup-idea-box q-pa-sm rounded-borders"
                style="white-space: pre-wrap"
              >
                {{ tempEvent.idea || 'Нет описания идеи...' }}
              </div>
            </div>

            <div>
              <div class="text-caption text-grey-7">Дата</div>
              <div class="text-body2">{{ date.formatDate(tempEvent.date, 'D MMMM YYYY') }}</div>
            </div>

            <div v-if="getEnabledPlatforms(tempEvent.platforms).length > 0">
              <div class="text-caption text-grey-7">Платформы</div>
              <div class="platform-status-list q-mt-xs">
                <div
                  v-for="platform in getEnabledPlatforms(tempEvent.platforms)"
                  :key="platform.name"
                  class="platform-status-item"
                  :style="{ '--platform-color': PLATFORM_COLORS[platform.name] }"
                >
                  <div class="platform-status-icon">
                    <q-icon
                      :name="PLATFORM_ICONS[platform.name]"
                      size="18px"
                      :style="{ color: PLATFORM_COLORS[platform.name] }"
                    />
                  </div>
                  <span class="platform-status-name">{{ PLATFORM_LABELS[platform.name] }}</span>
                  <q-badge
                    :color="STATUS_COLORS[platform.status] || 'grey'"
                    :label="STATUS_LABELS[platform.status] || platform.status"
                    class="platform-status-badge"
                  />
                </div>
              </div>
            </div>
          </q-card-section>
        </div>

        <!-- EDIT/CREATE MODE -->
        <div v-else>
          <q-card-section class="row items-center q-pb-none">
            <div class="text-subtitle1">
              {{ tempEvent.id ? 'Редактирование' : 'Создание контента' }}
            </div>
            <q-space />
            <q-btn
              v-if="tempEvent.id"
              icon="arrow_back"
              flat
              round
              dense
              size="sm"
              @click="isEditing = false"
            />
            <q-btn v-else icon="close" flat round dense size="sm" v-close-popup />
          </q-card-section>

          <q-card-section>
            <q-form @submit.prevent="saveEvent" class="q-gutter-md">
              <q-select
                v-model="tempEvent.projectId"
                :options="projectOptions"
                label="Проект"
                dense
                outlined
                emit-value
                map-options
                :rules="[(val) => !!val || 'Выберите проект']"
              />

              <q-select
                v-if="userStore.isAdmin"
                v-model="tempEvent.responsibleId"
                :options="userOptions"
                label="Исполнитель"
                dense
                outlined
                emit-value
                map-options
              />

              <q-input
                v-model="tempEvent.title"
                label="Post (Заголовок)"
                dense
                outlined
                autofocus
                :rules="[(val) => !!val || 'Обязательное поле']"
              />

              <q-select
                v-model="tempEvent.format"
                :options="typeOptions"
                label="Format (Тип)"
                dense
                outlined
                emit-value
                map-options
              />

              <q-input
                v-model="tempEvent.idea"
                label="Idea (Идея)"
                dense
                outlined
                type="textarea"
                rows="3"
              />

              <div class="platform-section q-mt-sm">
                <div class="text-caption text-grey-7 q-mb-sm">Платформы</div>
                <div class="platforms-grid">
                  <div
                    v-for="platform in platformOptions"
                    :key="platform.value"
                    class="platform-card"
                    :class="{
                      'platform-card-active': tempEvent.platforms[platform.value]?.enabled,
                    }"
                    :style="{
                      '--platform-color': PLATFORM_COLORS[platform.value],
                    }"
                  >
                    <div class="platform-card-header" @click="togglePlatform(platform.value)">
                      <div class="platform-card-icon">
                        <q-icon
                          :name="platform.icon"
                          size="20px"
                          :style="{ color: PLATFORM_COLORS[platform.value] }"
                        />
                      </div>
                      <div class="platform-card-info">
                        <span class="platform-card-name">{{ platform.label }}</span>
                      </div>
                      <q-checkbox
                        :model-value="tempEvent.platforms[platform.value]?.enabled"
                        @update:model-value="togglePlatform(platform.value)"
                        dense
                        size="sm"
                        class="platform-card-checkbox"
                        @click.stop
                      />
                    </div>
                    <div
                      v-if="tempEvent.platforms[platform.value]?.enabled"
                      class="platform-card-status"
                    >
                      <q-select
                        v-model="tempEvent.platforms[platform.value].status"
                        :options="statusOptions"
                        dense
                        outlined
                        emit-value
                        map-options
                        class="status-select"
                        popup-content-class="status-popup"
                      >
                        <template #selected-item="{ opt }">
                          <div class="row items-center no-wrap">
                            <q-badge
                              :color="STATUS_COLORS[opt.value] || 'grey'"
                              rounded
                              class="q-mr-sm"
                              style="width: 8px; height: 8px; min-width: 8px"
                            />
                            <span class="text-caption">{{ opt.label }}</span>
                          </div>
                        </template>
                        <template #option="{ itemProps, opt }">
                          <q-item v-bind="itemProps" dense>
                            <q-item-section avatar>
                              <q-badge
                                :color="STATUS_COLORS[opt.value] || 'grey'"
                                rounded
                                style="width: 10px; height: 10px; min-width: 10px"
                              />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label>{{ opt.label }}</q-item-label>
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </div>
                  </div>
                </div>
              </div>

              <q-input v-model="tempEvent.dateString" label="Дата" dense outlined type="date" />

              <div class="row justify-end q-mt-md">
                <q-btn label="Сохранить" color="primary" unelevated size="sm" @click="saveEvent" />
              </div>
            </q-form>
          </q-card-section>
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { date, useQuasar } from 'quasar'
import { useProjectStore } from 'stores/project.js'
import { useUserStore } from 'stores/user.js'
import { useContentPlanStore } from 'stores/content-plan.js'
import {
  PLATFORM_OPTIONS,
  PLATFORM,
  STATUS,
  STATUS_OPTIONS,
  PLATFORM_COLORS,
  PLATFORM_ICONS,
  PLATFORM_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
} from '@/constants/status'

// 1. Store Hooks
const $q = useQuasar()
const projectStore = useProjectStore()
const userStore = useUserStore()
const contentPlanStore = useContentPlanStore()

// 2. Refs & State (Must be declared before usage)
const currentDate = ref(new Date())
const events = ref([])
const transitionDirection = ref('next')
const isEventDialogOpen = ref(false)
const isEditing = ref(false)
const showDayList = ref(false)
const selectedDayEvents = ref([])
const selectedDateLabel = ref('')
const selectedDateForMobileList = ref(null)
const hoveredDayKey = ref(null)

const tempEvent = ref({
  id: null,
  title: '',
  format: 'Post', // Default Format
  dateString: '',
  idea: '',
  date: new Date(),
  projectId: null,
  projectName: '',
  responsibleId: null,
  responsibleName: '',
  platforms: {}, // { INSTAGRAM: { enabled: true, status: 'NOT_PUBLISHED' }, ... }
})

const platformOptions = PLATFORM_OPTIONS
const statusOptions = STATUS_OPTIONS

// Initialize empty platforms object
function getEmptyPlatforms() {
  const platforms = {}
  Object.values(PLATFORM).forEach((name) => {
    platforms[name] = { enabled: false, status: STATUS.NOT_PUBLISHED }
  })
  return platforms
}

// Toggle platform selection
function togglePlatform(platformName) {
  tempEvent.value.platforms[platformName].enabled =
    !tempEvent.value.platforms[platformName].enabled
}

// Get enabled platforms as array for display
function getEnabledPlatforms(platforms) {
  if (!platforms) return []
  return Object.entries(platforms)
    .filter(([, data]) => data.enabled)
    .map(([name, data]) => ({ name, status: data.status }))
}

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const monthNames = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
]

// API Strict Values: Reels, Carousel, Post, Animation, Story
const typeOptions = [
  { label: 'Post', value: 'Post' },
  { label: 'Story', value: 'Story' },
  { label: 'Reels', value: 'Reels' },
  { label: 'Carousel', value: 'Carousel' },
  { label: 'Animation', value: 'Animation' },
]

// 3. Computed Properties
const projectOptions = computed(() => {
  return projectStore.getProjects.map((p) => ({
    label: p.name,
    value: p.id,
  }))
})

const userOptions = computed(() => {
  return userStore.getUsers.map((u) => ({
    label: `${u.givenName} ${u.familyName}`.trim() || u.email,
    value: u.id,
  }))
})

const transitionName = computed(() => {
  return `slide-${transitionDirection.value}`
})

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonthName = computed(() => monthNames[currentDate.value.getMonth()])
const currentMonthKey = computed(() => `${currentYear.value}-${currentDate.value.getMonth()}`)

const isCurrentMonthView = computed(() => {
  const today = new Date()
  return (
    currentDate.value.getMonth() === today.getMonth() &&
    currentDate.value.getFullYear() === today.getFullYear()
  )
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  const days = []

  let startDay = firstDayOfMonth.getDay() - 1
  if (startDay === -1) startDay = 6

  for (let i = startDay; i > 0; i--) {
    const date = new Date(year, month, 1 - i)
    days.push({
      date: date,
      isCurrentMonth: false,
      isToday: isSameDate(date, new Date()),
    })
  }

  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const date = new Date(year, month, i)
    days.push({
      date: date,
      isCurrentMonth: true,
      isToday: isSameDate(date, new Date()),
    })
  }

  const remainingCells = 42 - days.length
  for (let i = 1; i <= remainingCells; i++) {
    const date = new Date(year, month + 1, i)
    days.push({
      date: date,
      isCurrentMonth: false,
      isToday: isSameDate(date, new Date()),
    })
  }

  return days
})

// 4. Helper Functions
function isSameDate(d1, d2) {
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  )
}

const eventsMap = computed(() => {
  const map = {}
  events.value.forEach((event) => {
    const key = date.formatDate(event.date, 'YYYY-MM-DD')
    if (!map[key]) map[key] = []
    map[key].push(event)
  })
  return map
})

function getEventsForDate(dateObj) {
  const key = date.formatDate(dateObj, 'YYYY-MM-DD')
  return eventsMap.value[key] || []
}

function getIconForFormat(format) {
  switch (format) {
    case 'Post':
      return 'article'
    case 'Story':
      return 'history_edu'
    case 'Reels':
      return 'videocam'
    case 'Carousel':
      return 'view_carousel'
    case 'Animation':
      return 'animation'
    default:
      return 'event'
  }
}

function truncateText(text, length) {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

// 5. Async Functions
async function fetchEvents() {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  // Calculate range: First day of month - 7 days to Last day of month + 14 days
  const firstDay = new Date(year, month, 1)
  const startDate = date.formatDate(date.subtractFromDate(firstDay, { days: 7 }), 'YYYY-MM-DD')

  const lastDay = new Date(year, month + 1, 0)
  const endDate = date.formatDate(date.addToDate(lastDay, { days: 14 }), 'YYYY-MM-DD')

  try {
    const data = await contentPlanStore.fetchContentPlansByDateRange(startDate, endDate)
    events.value = data.map((item) => {
      const executor = item.executor || item.project?.executor
      return {
        id: item.id,
        title: item.post,
        date: new Date(item.date),
        format: item.format || 'Post', // API Field
        idea: item.idea,
        projectId: item.project?.id,
        projectName: item.project?.name,
        responsibleId: executor?.id,
        responsibleName: executor
          ? `${executor.givenName || ''} ${executor.familyName || ''}`.trim()
          : null,
        platforms: item.platforms || [],
      }
    })
  } catch (e) {
    console.error('Error fetching events', e)
    $q.notify({ type: 'negative', message: 'Ошибка загрузки событий' })
  }
}

async function saveEvent() {
  // Convert platforms object to array for API
  const platforms = Object.entries(tempEvent.value.platforms)
    .filter(([, data]) => data.enabled)
    .map(([name, data]) => ({
      name,
      status: data.status,
    }))

  const payload = {
    post: tempEvent.value.title,
    format: tempEvent.value.format, // strict value
    idea: tempEvent.value.idea,
    date: new Date(tempEvent.value.dateString).toISOString(),
    project: tempEvent.value.projectId ? `/api/projects/${tempEvent.value.projectId}` : null,
    platforms,
    // executor: tempEvent.value.responsibleId ? `/api/users/${tempEvent.value.responsibleId}` : null
  }

  try {
    if (tempEvent.value.id) {
      await contentPlanStore.patchContentPlan(payload, tempEvent.value.id)
      $q.notify({ type: 'positive', message: 'Сохранено' })
    } else {
      await contentPlanStore.createContentPlan(payload)
      $q.notify({ type: 'positive', message: 'Создано' })
    }
    await fetchEvents()
    isEventDialogOpen.value = false
    isEditing.value = false
  } catch (e) {
    console.error(e)
    const message =
      e.response?.data?.detail || e.response?.data?.['hydra:description'] || 'Ошибка сохранения'
    const violations = e.response?.data?.violations?.map((v) => v.message).join('\n')
    $q.notify({ type: 'negative', message: violations || message })
  }
}

// 6. Navigation & UI Logic
let closeTimer = null

function handleMouseEnter(dayDate) {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
  if (dayDate) {
    hoveredDayKey.value = date.formatDate(dayDate, 'YYYY-MM-DD')
  }
}

function handleMouseLeave() {
  if (closeTimer) clearTimeout(closeTimer)
  closeTimer = setTimeout(() => {
    hoveredDayKey.value = null
  }, 200)
}

function prevMonth() {
  transitionDirection.value = 'prev'
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

function nextMonth() {
  transitionDirection.value = 'next'
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

function handleSwipe({ direction }) {
  if (direction === 'left') nextMonth()
  if (direction === 'right') prevMonth()
}

function goToToday() {
  const today = new Date()
  if (today > currentDate.value) {
    transitionDirection.value = 'next'
  } else {
    transitionDirection.value = 'prev'
  }
  currentDate.value = new Date()
}

function openEventDialog(event) {
  isEditing.value = false
  // Build platforms object from existing data
  const platforms = getEmptyPlatforms()
  if (event.platforms) {
    event.platforms.forEach((p) => {
      platforms[p.name] = { enabled: true, status: p.status || STATUS.NOT_PUBLISHED }
    })
  }
  tempEvent.value = {
    ...event,
    dateString: date.formatDate(event.date, 'YYYY-MM-DD'),
    platforms,
  }
  isEventDialogOpen.value = true
  showDayList.value = false
}

function openCreateDialog(dateObj) {
  isEditing.value = true
  tempEvent.value = {
    id: null,
    title: '',
    format: 'Post',
    idea: '',
    date: dateObj,
    dateString: date.formatDate(dateObj, 'YYYY-MM-DD'),
    projectId: null,
    projectName: '',
    responsibleId: null,
    responsibleName: '',
    platforms: getEmptyPlatforms(),
  }
  isEventDialogOpen.value = true
  showDayList.value = false
}

function openDayList(dateObj) {
  const events = getEventsForDate(dateObj)
  selectedDayEvents.value = events
  selectedDateLabel.value = date.formatDate(dateObj, 'D MMMM YYYY')
  selectedDateForMobileList.value = dateObj
  showDayList.value = true
}

function handleDayClick(day) {
  const events = getEventsForDate(day.date)

  if ($q.screen.lt.sm) {
    if (events.length > 0) {
      openDayList(day.date)
    } else if (!userStore.isAdmin) {
      openCreateDialog(day.date)
    }
  } else {
    if (events.length > 2) {
      openDayList(day.date)
    } else if (!userStore.isAdmin) {
      openCreateDialog(day.date)
    }
  }
}

// 7. Lifecycle & Watchers (Must be last)
watch(currentDate, () => {
  fetchEvents()
})

onMounted(() => {
  projectStore.fetchProjects()
  if (userStore.isAdmin) {
    userStore.fetchUsers()
  }
  fetchEvents()
})
</script>

<style scoped lang="scss">
// Transitions
.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition: all 0.3s ease-out;
}

.slide-next-enter-from {
  transform: translateX(20px);
  opacity: 0;
}
.slide-next-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-prev-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}
.slide-prev-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

.calendar-page {
  padding: 0;
}

.calendar-dialog-card {
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.5rem;

  @media (max-width: 599px) {
    padding: 0.5rem;
  }
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 599px) {
    margin-bottom: 1rem;
    gap: 0.75rem;
  }
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  line-height: 1.2;

  @media (max-width: 599px) {
    font-size: 1.25rem;
    gap: 0.5rem;
  }
}

.page-icon {
  color: #8b5cf6;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 599px) {
    width: 100%;
    justify-content: space-between;
    gap: 0.5rem;
  }
}

.today-btn {
  color: var(--text-primary);
  border-color: var(--border-color) !important;
}

.current-month {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 150px;
  text-align: center;

  @media (max-width: 599px) {
    font-size: 1rem;
    min-width: auto;
  }
}

// Grid Styles
.calendar-wrapper {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.weekdays-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.weekday-header {
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  @media (max-width: 599px) {
    padding: 0.5rem 0.25rem;
    font-size: 0.7rem;
  }
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(140px, auto);
  background: var(--border-color);
  gap: 1px;

  @media (max-width: 599px) {
    grid-auto-rows: minmax(90px, auto);
  }
}

.day-cell {
  background: var(--bg-card);
  padding: 0.75rem;
  position: relative;
  transition: background-color 0.2s;
  min-width: 0;
  overflow: hidden;

  &:hover {
    background: var(--bg-hover);
  }

  @media (max-width: 599px) {
    padding: 0.25rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  &.other-month {
    background: var(--bg-tertiary);

    .day-number,
    .day-content {
      opacity: 0.5;
    }

    .day-number {
      color: var(--text-muted);
    }
  }

  &.today {
    background: rgba(139, 92, 246, 0.03);

    .day-number {
      background: #8b5cf6;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      @media (max-width: 599px) {
        width: 20px;
        height: 20px;
        font-size: 0.75rem;
      }
    }
  }
}

.day-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5rem;

  @media (max-width: 599px) {
    margin-bottom: 0.25rem;
  }
}

.day-number {
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--text-primary);

  @media (max-width: 599px) {
    font-size: 0.75rem;
  }
}

.day-content {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;

  @media (max-width: 599px) {
    gap: 2px;
    align-items: center;
  }
}

.day-dots-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2px;
  width: 100%;
  margin-top: 2px;
}

.more-events-chip {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  padding: 2px 4px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--bg-hover);
    color: var(--text-primary);
  }
}

/* Floating Cards Menu Styles */
.glass-day-card {
  background: transparent;
  border: none;
  box-shadow: none;
  width: 100%;
  padding: 0.75rem;
}

.glass-content {
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Custom Scrollbar */
.custom-scroll::-webkit-scrollbar {
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

/* Unified Chip Styles */
.event-chip {
  padding: 0.5rem 0.625rem;
  border-radius: 8px;
  font-size: 0.75rem;
  cursor: pointer;
  border-left: 3px solid #8b5cf6;
  background: rgba(139, 92, 246, 0.1);
  color: var(--text-primary);
  transition: all 0.2s ease;
  max-width: 100%;
  overflow: hidden;
  min-height: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

/* Specific styles for cards in the floating menu */
.glass-chip {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);

  .body--dark & {
    background: rgba(30, 30, 30, 0.9);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  &:hover {
    transform: scale(1.02) translateY(-1px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
}

/* Add Button Card Style */
.add-event-card {
  border: 2px dashed #8b5cf6;
  background: rgba(139, 92, 246, 0.05);
  color: #8b5cf6;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 38px;

  &:hover {
    background: rgba(139, 92, 246, 0.1);
    border-style: solid;
  }
}

/* Mobile Dots */
.day-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: #8b5cf6;
}

.event-title {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.1rem;
}

.event-type {
  font-size: 0.625rem;
  opacity: 0.8;
}

.popup-idea-box {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.platform-section {
  margin-top: 0.5rem;
}

.platforms-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.platform-card {
  background: var(--bg-tertiary);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.2s ease;
  overflow: hidden;

  &:hover {
    border-color: var(--platform-color, var(--border-color));
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
}

.platform-card-active {
  border-color: var(--platform-color);
}

.platform-card-header {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  cursor: pointer;
  gap: 0.5rem;
}

.platform-card-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.platform-card-info {
  flex: 1;
  min-width: 0;
}

.platform-card-name {
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--text-primary);
}

.platform-card-checkbox {
  flex-shrink: 0;
}

.platform-card-status {
  padding: 0 0.5rem 0.5rem;
  border-top: 1px solid var(--border-light);
  margin-top: -0.125rem;
  padding-top: 0.375rem;
}

.status-select {
  :deep(.q-field__control) {
    min-height: 28px;
    padding: 0 6px;
  }

  :deep(.q-field__native) {
    padding: 0;
  }

  :deep(.q-field__marginal) {
    height: 28px;
  }
}

.platform-status-list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.platform-status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.5rem;
  background: var(--bg-tertiary);
  border-radius: 6px;
  border-left: 3px solid var(--platform-color);
}

.platform-status-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.platform-status-name {
  flex: 1;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-primary);
}

.platform-status-badge {
  font-size: 0.6875rem;
  padding: 0.125rem 0.375rem;
}

.popup-chip {
  font-weight: 600;

  &.chip-post {
    background: #e3f2fd;
    color: #0d47a1;
    .body--dark & {
      background: #1e3a8a;
      color: #bfdbfe;
    }
  }

  &.chip-story {
    background: #fff3e0;
    color: #e65100;
    .body--dark & {
      background: #7c2d12;
      color: #fed7aa;
    }
  }

  &.chip-video {
    background: #fce4ec;
    color: #880e4f;
    .body--dark & {
      background: #831843;
      color: #fbcfe8;
    }
  }

  &.chip-carousel {
    background: #f0fdf4;
    color: #166534;
    .body--dark & {
      background: #14532d;
      color: #bbf7d0;
    }
  }

  &.chip-animation {
    background: #f5f3ff;
    color: #5b21b6;
    .body--dark & {
      background: #4c1d95;
      color: #ddd6fe;
    }
  }
}
</style>
