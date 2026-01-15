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
            <div class="current-month q-mx-md">
              {{ currentMonthName }} {{ currentYear }}
            </div>
            <q-btn flat round icon="chevron_right" @click="nextMonth" class="gt-xs" />
          </div>
        </div>
      </div>

      <!-- Calendar Grid -->
      <div 
        class="calendar-wrapper"
        v-touch-swipe.mouse.left.right="handleSwipe"
      >
        <!-- Weekday Headers -->
        <div class="weekdays-grid">
          <div v-for="day in weekDays" :key="day" class="weekday-header">
            {{ day }}
          </div>
        </div>

        <!-- Days Grid -->
        <transition :name="transitionName" mode="out-in">
          <div
            :key="currentMonthKey"
            class="days-grid"
          >
            <div
              v-for="(day, index) in calendarDays"
              :key="index"
              class="day-cell cursor-pointer"
              :class="{
                'other-month': !day.isCurrentMonth,
                'today': day.isToday
              }"
              @click="handleDayClick(day)"
              @mouseenter="hoveredDayKey = date.formatDate(day.date, 'YYYY-MM-DD')"
              @mouseleave="hoveredDayKey = null"
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
                                                  :class="`type-${event.type}`"
                                                  @click.stop="openEventDialog(event)"
                                                >
                                                  <div class="event-title">{{ event.projectName }}</div>
                                                  <div class="event-type">{{ event.typeLabel }}</div>
                                                </div>                                
                                <div 
                                  v-if="getEventsForDate(day.date).length > 2"
                                  class="more-events-chip"
                                  @click.stop="openDayList(day.date)"
                                >
                                  +{{ getEventsForDate(day.date).length - 2 }} еще
                                </div>
                              </template>
                
                              <!-- Mobile: Dots -->                <template v-else>
                   <div class="day-dots-container">
                      <div 
                        v-for="event in getEventsForDate(day.date)" 
                        :key="event.id" 
                        class="day-dot"
                        :class="'dot-' + event.type"
                      ></div>
                   </div>
                </template>
              </div>

              <!-- Floating Cards Menu (Replaces Tooltip) -->
              <q-menu
                v-if="$q.screen.gt.xs && getEventsForDate(day.date).length > 2"
                :model-value="hoveredDayKey === date.formatDate(day.date, 'YYYY-MM-DD')"
                anchor="center middle"
                self="center middle"
                no-parent-event
                persistent
                class="bg-transparent no-shadow no-padding overflow-visible"
                @mouseenter="hoveredDayKey = date.formatDate(day.date, 'YYYY-MM-DD')"
                @mouseleave="hoveredDayKey = null"
              >
                <div class="glass-day-card column q-gutter-y-xs">
                   <div class="glass-content custom-scroll" style="max-height: 320px; overflow-y: auto;">
                     <div
                        v-for="event in getEventsForDate(day.date)"
                        :key="event.id"
                        class="event-chip glass-chip cursor-pointer"
                        :class="`type-${event.type}`"
                        @click="openEventDialog(event)"
                     >
                        <div class="event-title">{{ event.projectName }}</div>
                        <div class="event-type">{{ event.typeLabel }}</div>
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
      <q-card style="width: 100%; min-width: 320px; max-width: 450px; border-radius: 16px">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">{{ selectedDateLabel }}</div>
          <div class="row q-gutter-xs">
            <q-btn v-if="!userStore.isAdmin" flat round dense icon="add" color="primary" @click="openCreateDialog(selectedDateForMobileList)" />
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
                <q-icon :name="getIconForType(event.type)" :color="getColorForType(event.type)" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold text-primary">{{ event.projectName }}</q-item-label>
                <q-item-label caption lines="1">{{ event.title }}</q-item-label>
                <q-item-label caption>{{ event.typeLabel }}</q-item-label>
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
      <q-card class="q-pa-none" style="min-width: 320px; max-width: 400px; overflow: hidden;">
        <!-- VIEW MODE -->
        <div v-if="!isEditing && tempEvent.id">
          <q-card-section class="row items-center justify-between q-pb-sm">
            <div class="text-subtitle1 text-weight-bold">Детали контента</div>
            <div class="row q-gutter-xs">
              <q-btn v-if="!userStore.isAdmin" flat round dense icon="edit" size="sm" color="primary" @click="isEditing = true">
                <q-tooltip>Редактировать</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="close" size="sm" v-close-popup />
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none q-gutter-y-sm">
            <div>
              <div class="text-caption text-grey-7">Проект</div>
              <div class="text-body2 text-weight-medium text-primary">{{ tempEvent.projectName || 'Без проекта' }}</div>
            </div>

            <div v-if="userStore.isAdmin">
              <div class="text-caption text-grey-7">Исполнитель</div>
              <div class="text-body2 text-weight-medium text-secondary">{{ tempEvent.responsibleName || 'Не назначен' }}</div>
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
                :label="tempEvent.typeLabel"
                class="q-ma-none q-mt-xs popup-chip"
                :class="'chip-' + tempEvent.type"
              />
            </div>

            <div>
              <div class="text-caption text-grey-7">Idea (Идея)</div>
              <div class="text-body2 popup-idea-box q-pa-sm rounded-borders" style="white-space: pre-wrap;">{{ tempEvent.idea || 'Нет описания идеи...' }}</div>
            </div>
            
            <div>
              <div class="text-caption text-grey-7">Дата</div>
              <div class="text-body2">{{ date.formatDate(tempEvent.date, 'D MMMM YYYY') }}</div>
            </div>
          </q-card-section>
        </div>

        <!-- EDIT/CREATE MODE -->
        <div v-else>
          <q-card-section class="row items-center q-pb-none">
            <div class="text-subtitle1">{{ tempEvent.id ? 'Редактирование' : 'Создание контента' }}</div>
            <q-space />
            <q-btn v-if="tempEvent.id" icon="arrow_back" flat round dense size="sm" @click="isEditing = false" />
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
                :rules="[val => !!val || 'Выберите проект']"
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
                :rules="[val => !!val || 'Обязательное поле']"
              />
              
              <q-select
                v-model="tempEvent.type"
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

              <q-input
                v-model="tempEvent.dateString"
                label="Дата"
                dense
                outlined
                type="date"
              />

              <div class="row justify-end q-mt-md">
                <q-btn 
                  label="Сохранить" 
                  color="primary" 
                  unelevated 
                  size="sm"
                  @click="saveEvent" 
                />
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
  type: '',
  dateString: '',
  idea: '',
  date: new Date(),
  projectId: null,
  projectName: '',
  responsibleId: null,
  responsibleName: ''
})

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const monthNames = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
]

const typeOptions = [
  { label: 'Post', value: 'post' },
  { label: 'Story', value: 'story' },
  { label: 'Reels', value: 'video' },
  { label: 'Carousel', value: 'carousel' },
  { label: 'Animation', value: 'animation' }
]

// 3. Computed Properties
const projectOptions = computed(() => {
  return projectStore.getProjects.map(p => ({
    label: p.name,
    value: p.id
  }))
})

const userOptions = computed(() => {
  return userStore.getUsers.map(u => ({
    label: `${u.givenName} ${u.familyName}`.trim() || u.email,
    value: u.id
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
  return currentDate.value.getMonth() === today.getMonth() &&
         currentDate.value.getFullYear() === today.getFullYear()
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
      isToday: isSameDate(date, new Date())
    })
  }
  
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const date = new Date(year, month, i)
    days.push({
      date: date,
      isCurrentMonth: true,
      isToday: isSameDate(date, new Date())
    })
  }
  
  const remainingCells = 42 - days.length
  for (let i = 1; i <= remainingCells; i++) {
    const date = new Date(year, month + 1, i)
    days.push({
      date: date,
      isCurrentMonth: false,
      isToday: isSameDate(date, new Date())
    })
  }
  
  return days
})

// 4. Helper Functions
function isSameDate(d1, d2) {
  return d1.getDate() === d2.getDate() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getFullYear() === d2.getFullYear()
}

const eventsMap = computed(() => {
  const map = {}
  events.value.forEach(event => {
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

function mapFormatToType(format) {
  const map = {
    'Post': 'post',
    'Story': 'story',
    'Reels': 'video',
    'Carousel': 'carousel',
    'Animation': 'animation'
  }
  return map[format] || 'post'
}

function mapTypeToFormat(type) {
  const map = {
    'post': 'Post',
    'story': 'Story',
    'video': 'Reels',
    'carousel': 'Carousel',
    'animation': 'Animation'
  }
  return map[type] || 'Post'
}

function getIconForType(type) {
  switch (type) {
    case 'post': return 'article'
    case 'story': return 'history_edu'
    case 'video': return 'videocam'
    case 'carousel': return 'view_carousel'
    case 'animation': return 'animation'
    default: return 'event'
  }
}

function getColorForType(type) {
  switch (type) {
    case 'post': return 'blue-9'
    case 'story': return 'orange-9'
    case 'video': return 'pink-9'
    case 'carousel': return 'green-9'
    case 'animation': return 'purple-9'
    default: return 'grey'
  }
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
    events.value = data.map(item => {
      const executor = item.executor || item.project?.executor
      return {
        id: item.id,
        title: item.post,
        date: new Date(item.date),
        type: mapFormatToType(item.format),
        typeLabel: item.format,
        idea: item.idea,
        projectId: item.project?.id,
        projectName: item.project?.name,
        responsibleId: executor?.id,
        responsibleName: executor ? `${executor.givenName || ''} ${executor.familyName || ''}`.trim() : null
      }
    })
  } catch (e) {
    console.error('Error fetching events', e)
    $q.notify({ type: 'negative', message: 'Ошибка загрузки событий' })
  }
}

async function saveEvent() {
  const payload = {
    post: tempEvent.value.title,
    format: mapTypeToFormat(tempEvent.value.type),
    idea: tempEvent.value.idea,
    date: new Date(tempEvent.value.dateString).toISOString(),
    project: tempEvent.value.projectId ? `/api/projects/${tempEvent.value.projectId}` : null
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
    const message = e.response?.data?.detail || e.response?.data?.['hydra:description'] || 'Ошибка сохранения'
    const violations = e.response?.data?.violations?.map(v => v.message).join('\n')
    $q.notify({ type: 'negative', message: violations || message })
  }
}

// 6. Navigation & UI Logic
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
  tempEvent.value = {
    ...event,
    dateString: date.formatDate(event.date, 'YYYY-MM-DD')
  }
  isEventDialogOpen.value = true
  showDayList.value = false 
}

function openCreateDialog(dateObj) {
  isEditing.value = true
  tempEvent.value = {
    id: null,
    title: '',
    type: 'post',
    typeLabel: 'Post',
    idea: '',
    date: dateObj,
    dateString: date.formatDate(dateObj, 'YYYY-MM-DD'),
    projectId: null,
    projectName: '',
    responsibleId: null,
    responsibleName: ''
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

.day-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  
  &.dot-post { background-color: #3b82f6; }
  &.dot-story { background-color: #f59e0b; }
  &.dot-video { background-color: #ec4899; }
  &.dot-carousel { background-color: #22c55e; }
  &.dot-animation { background-color: #8b5cf6; }
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
  min-width: 200px;
  max-width: 240px;
  padding: 10px;
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
.custom-scroll::-webkit-scrollbar-track { background: transparent; }
.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.1);
  border-radius: 4px;
}

/* Unified Chip Styles */
.event-chip {
  padding: 0.375rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
}

/* Specific styles for cards in the floating menu */
.glass-chip {
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  /* Use slightly more opaque background for menu items to ensure visibility */
  border: 1px solid rgba(255,255,255,0.2);
  
  .body--dark & {
    box-shadow: 0 4px 15px rgba(0,0,0,0.4);
    border: 1px solid rgba(255,255,255,0.1);
  }

  &:hover {
    transform: scale(1.03) translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
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

/* Color Coding */
.type-post {
  background: rgba(59, 130, 246, 0.15);
  border-left-color: #3b82f6;
  color: #1e40af;
  .body--dark & { background: rgba(59, 130, 246, 0.25); color: #93c5fd; }
}

.type-story {
  background: rgba(245, 158, 11, 0.15);
  border-left-color: #f59e0b;
  color: #92400e;
  .body--dark & { background: rgba(245, 158, 11, 0.25); color: #fcd34d; }
}

.type-video {
  background: rgba(236, 72, 153, 0.15);
  border-left-color: #ec4899;
  color: #9d174d;
  .body--dark & { background: rgba(236, 72, 153, 0.25); color: #f9a8d4; }
}

.type-carousel {
  background: rgba(34, 197, 94, 0.15);
  border-left-color: #22c55e;
  color: #166534;
  .body--dark & { background: rgba(34, 197, 94, 0.25); color: #bbf7d0; }
}

.type-animation {
  background: rgba(139, 92, 246, 0.15);
  border-left-color: #8b5cf6;
  color: #5b21b6;
  .body--dark & { background: rgba(139, 92, 246, 0.25); color: #ddd6fe; }
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

.popup-chip {
  font-weight: 600;
  
  &.chip-post {
    background: #e3f2fd;
    color: #0d47a1;
    .body--dark & { background: #1e3a8a; color: #bfdbfe; }
  }
  
  &.chip-story {
    background: #fff3e0;
    color: #e65100;
    .body--dark & { background: #7c2d12; color: #fed7aa; }
  }
  
  &.chip-video {
    background: #fce4ec;
    color: #880e4f;
    .body--dark & { background: #831843; color: #fbcfe8; }
  }

  &.chip-carousel {
    background: #f0fdf4;
    color: #166534;
    .body--dark & { background: #14532d; color: #bbf7d0; }
  }

  &.chip-animation {
    background: #f5f3ff;
    color: #5b21b6;
    .body--dark & { background: #4c1d95; color: #ddd6fe; }
  }
}
</style>