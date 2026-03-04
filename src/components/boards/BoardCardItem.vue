<template>
  <div
    class="board-card-item"
    :class="{ 'is-holding-drag': isHoldingForDrag }"
    @click="onCardClick"
    @touchstart.passive="onTouchStart"
    @touchmove.passive="onTouchMove"
    @touchend="clearHoldState"
    @touchcancel="clearHoldState"
  >
    <div class="card-item-content">
      <div class="card-item-header">
        <div class="card-item-title">{{ card.name }}</div>
        <q-btn
          v-if="userStore.canManageList"
          flat
          round
          dense
          size="sm"
          icon="more_horiz"
          class="card-menu-btn"
          @click.stop
          @mousedown.stop
          @touchstart.stop
        >
          <q-menu class="card-dropdown-menu" @click.stop @mousedown.stop @touchstart.stop>
            <q-item
              v-close-popup
              clickable
              class="card-dropdown-item"
              @click.stop="emit('pattern', card)"
            >
              <q-item-section avatar>
                <q-icon :name="isTemplateCard ? 'check_box' : 'check_box_outline_blank'" size="16px" />
              </q-item-section>
              <q-item-section>Шаблон</q-item-section>
            </q-item>

            <q-item v-close-popup clickable class="card-dropdown-item" @click.stop="emit('archive', card)">
              <q-item-section avatar><q-icon name="archive" size="16px" /></q-item-section>
              <q-item-section>Архивировать карточку</q-item-section>
            </q-item>
          </q-menu>
        </q-btn>
      </div>

      <div class="card-item-footer">
        <div class="footer-left">
          <div class="status-pill" :style="statusStyle">
            <span class="status-dot" :style="{ background: statusColors.dot }" />
            {{ CARD_STATUS_LABELS[card.status] }}
          </div>

          <span v-if="card.deadline" class="deadline-badge" :class="{ overdue: isOverdue }">
            <q-icon name="schedule" size="12px" />
            {{ formattedDeadline }}
          </span>
        </div>

        <div v-if="card.executor?.length" class="footer-executors">
          <q-avatar
            v-for="(user, i) in visibleExecutors"
            :key="user.id"
            size="22px"
            class="executor-avatar"
            :style="{ zIndex: card.executor.length - i }"
          >
            <img v-if="getUserAvatarUrl(user)" :src="getUserAvatarUrl(user)" alt="User avatar" />
            <span v-else class="executor-initial">{{ (user.givenName?.[0] || '').toUpperCase() }}</span>
            <q-tooltip>{{ user.givenName }} {{ user.familyName }}</q-tooltip>
          </q-avatar>
          <span v-if="overflowCount > 0" class="executor-overflow">+{{ overflowCount }}</span>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, ref, onBeforeUnmount } from 'vue'
import { CARD_STATUS_LABELS, CARD_STATUS_STYLE } from '@/constants/cardStatus'
import { useUserStore } from 'stores/user.js'

const props = defineProps({
  card: { type: Object, required: true },
})

const emit = defineEmits(['click', 'archive', 'pattern'])
const userStore = useUserStore()
const HOLD_TO_DRAG_MS = 300
const MOVE_CANCEL_THRESHOLD = 8
const isHoldingForDrag = ref(false)
const suppressNextClick = ref(false)

let holdTimer = null
let touchStartX = 0
let touchStartY = 0

const statusColors = computed(() => CARD_STATUS_STYLE[props.card.status] || CARD_STATUS_STYLE.open)

const statusStyle = computed(() => ({
  background: statusColors.value.bg,
  color: statusColors.value.text,
}))

const isOverdue = computed(() => {
  if (!props.card.deadline) return false
  return new Date(props.card.deadline) < new Date()
})

const formattedDeadline = computed(() => {
  if (!props.card.deadline) return ''
  return new Date(props.card.deadline).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
})

const visibleExecutors = computed(() => (props.card.executor || []).slice(0, 3))
const overflowCount = computed(() => Math.max(0, (props.card.executor?.length || 0) - 3))
const templatePatternId = computed(() =>
  props.card.cardPattern?.id ||
  props.card.cardPatternId ||
  props.card.pattern?.id ||
  props.card.patternId ||
  null,
)
const isTemplateCard = computed(() => !!templatePatternId.value)

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

function clearHoldTimer() {
  if (holdTimer) {
    clearTimeout(holdTimer)
    holdTimer = null
  }
}

function clearHoldState() {
  clearHoldTimer()
  isHoldingForDrag.value = false
}

function onTouchStart(event) {
  const point = event.touches?.[0]
  if (!point) return

  touchStartX = point.clientX
  touchStartY = point.clientY
  isHoldingForDrag.value = true
  clearHoldTimer()
  holdTimer = setTimeout(() => {
    isHoldingForDrag.value = false
    suppressNextClick.value = true
    holdTimer = null
  }, HOLD_TO_DRAG_MS)
}

function onTouchMove(event) {
  if (!isHoldingForDrag.value) return
  const point = event.touches?.[0]
  if (!point) return

  const movedX = Math.abs(point.clientX - touchStartX)
  const movedY = Math.abs(point.clientY - touchStartY)
  if (movedX > MOVE_CANCEL_THRESHOLD || movedY > MOVE_CANCEL_THRESHOLD) {
    clearHoldState()
  }
}

function onCardClick() {
  if (suppressNextClick.value) {
    suppressNextClick.value = false
    return
  }
  emit('click', props.card)
}

onBeforeUnmount(() => {
  clearHoldState()
})
</script>

<style scoped lang="scss">
.board-card-item {
  position: relative;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
  user-select: none;
  -webkit-user-select: none;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Noto Sans", "Ubuntu", "Droid Sans", "Helvetica Neue", sans-serif;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(139, 92, 246, 0.4);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &.is-holding-drag {
    border-color: rgba(96, 165, 250, 0.55);
    box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.28), 0 6px 16px rgba(0, 0, 0, 0.25);
    animation: holdPulse 0.3s ease-in-out infinite;
  }
}

@keyframes holdPulse {
  50% {
    transform: translateY(-1px) scale(1.01);
  }
}

.card-item-content {
  padding: 0.75rem;
  min-width: 0;
}

.card-item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.375rem;
  margin-bottom: 0.625rem;
}

.card-item-title {
  font-size: 14px;
  font-weight: 400;
  color: #fff;
  line-height: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 0;
  flex: 1;
}

.card-menu-btn {
  margin-top: -2px;
  color: rgba(255, 255, 255, 0.72);
  opacity: 0;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  transition: opacity 0.16s ease, color 0.16s ease, background 0.16s ease, border-color 0.16s ease;

  .board-card-item:hover & {
    opacity: 1;
  }

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.14);
    border-color: rgba(255, 255, 255, 0.24);
  }
}

.card-dropdown-menu {
  background: rgba(20, 24, 38, 0.92) !important;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  min-width: 220px;
  padding: 0.35rem;
  border-radius: 10px !important;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
}

.card-dropdown-item {
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.88);
  min-height: 38px;
  transition: background 0.15s ease, color 0.15s ease;

  :deep(.q-icon) {
    color: rgba(255, 255, 255, 0.72);
  }

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
  }
}

.card-item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-wrap: wrap;
  min-width: 0;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
  white-space: nowrap;
  letter-spacing: 0.01em;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.deadline-badge {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.6875rem;
  color: rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.06);
  padding: 0.2rem 0.4rem;
  border-radius: 9999px;
  white-space: nowrap;

  &.overdue {
    color: #f87171;
    background: rgba(248, 113, 113, 0.12);
  }
}

.footer-executors {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.executor-avatar {
  margin-left: -5px;
  border: 1.5px solid rgba(15, 12, 41, 0.8);
  background: rgba(139, 92, 246, 0.35);
  color: #fff;

  &:first-child {
    margin-left: 0;
  }
}

.executor-initial {
  font-size: 0.5rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.executor-overflow {
  font-size: 0.625rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.45);
  margin-left: 0.25rem;
}
</style>

<style lang="scss">
.card-dropdown-menu {
  background: rgba(20, 24, 38, 0.96) !important;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  border-radius: 10px !important;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.38) !important;
  min-width: 220px;
  padding: 0.35rem;
  color: rgba(255, 255, 255, 0.9);
}

.card-dropdown-menu .card-dropdown-item {
  color: rgba(255, 255, 255, 0.88);
  border-radius: 8px;
  min-height: 38px;
}

.card-dropdown-menu .card-dropdown-item:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.card-dropdown-menu .card-dropdown-item .q-icon {
  color: rgba(255, 255, 255, 0.72);
}
</style>
