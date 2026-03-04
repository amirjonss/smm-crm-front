<template>
  <div class="board-column" :style="{ '--list-color': list.color }">
    <div class="column-header">
      <div v-if="list.color" class="column-color-bar" />

      <div v-if="isEditingName && userStore.canManageList" class="column-name-edit">
        <q-input
          ref="nameInputRef"
          v-model="editName"
          outlined
          dense
          class="name-input"
          @keydown.enter.prevent="saveName"
          @keydown.escape="cancelNameEdit"
          @blur="saveName"
        />
      </div>
      <div
        v-else
        class="column-title"
        :class="{ editable: userStore.canManageList }"
        @click="userStore.canManageList && startNameEdit()"
      >
        <span class="column-name">{{ list.name }}</span>
        <span class="column-count">{{ localCards.length }}</span>
      </div>

      <q-btn flat round dense size="sm" icon="more_horiz" class="column-icon-btn">
        <q-menu class="column-dropdown-menu">
          <div class="dropdown-header">
            <span class="dropdown-header-title">Действия со списком</span>
            <q-btn v-close-popup flat round dense size="sm" icon="close" class="dropdown-close" />
          </div>

          <q-separator class="dropdown-sep" />

          <template v-if="userStore.canManageList">
            <div class="dropdown-section">
              <div class="dropdown-label">Изменить цвет колонки</div>
              <div class="dropdown-color-grid">
                <div
                  class="color-swatch no-color"
                  :class="{ selected: !list.color }"
                  @click="$emit('changeColor', null)"
                >
                  <q-icon name="block" size="14px" />
                </div>
                <div
                  v-for="c in LIST_COLORS"
                  :key="c"
                  class="color-swatch"
                  :class="{ selected: list.color === c }"
                  :style="{ background: c }"
                  @click="$emit('changeColor', c)"
                />
              </div>
            </div>

            <q-separator class="dropdown-sep" />

            <q-item v-close-popup clickable class="dropdown-item" @click="$emit('archive')">
              <q-item-section avatar><q-icon name="archive" size="18px" /></q-item-section>
              <q-item-section>Архивировать список</q-item-section>
            </q-item>
          </template>

          <q-item v-if="!userStore.canManageList" class="dropdown-item text-grey-5">
            <q-item-section>Нет доступных действий</q-item-section>
          </q-item>
        </q-menu>
      </q-btn>
    </div>

    <div class="column-body">
      <draggable
        v-model="localCards"
        item-key="id"
        group="cards"
        ghost-class="card-drag-ghost"
        chosen-class="card-drag-chosen"
        drag-class="card-drag-active"
        :force-fallback="true"
        :fallback-on-body="true"
        :delay="300"
        :delay-on-touch-only="true"
        :touch-start-threshold="8"
        :scroll="true"
        :bubble-scroll="true"
        :animation="150"
        :scroll-sensitivity="140"
        :scroll-speed="18"
        :swap-threshold="0.2"
        :invert-swap="true"
        :empty-insert-threshold="30"
        class="cards-list"
        @start="onDragStart"
        @end="onDragEnd"
        @change="onDragChange"
      >
        <template #item="{ element }">
          <board-card-item
            :card="element"
            @click="$emit('openCard', element)"
            @archive="$emit('archiveCard', element)"
            @pattern="$emit('syncPattern', element)"
          />
        </template>
      </draggable>
    </div>

    <div v-if="userStore.canManageList" class="column-footer">
      <add-card-button @add="$emit('addCard', $event)" />
      <q-btn
        flat
        dense
        icon="note_add"
        size="sm"
        class="pattern-btn"
      >
        <q-tooltip>Карточки по шаблону</q-tooltip>

        <q-menu
          v-model="showPatternsMenu"
          class="patterns-popover-menu"
          :class="{ 'is-zoomed-out': !isZoomed && $q.screen.lt.sm }"
          anchor="top right"
          self="bottom right"
          :offset="[0, 8]"
          @before-show="$emit('openPatterns')"
        >
          <card-patterns-popover
            :open="showPatternsMenu"
            :patterns="patterns"
            :loading="patternsLoading"
            :submitting="patternSubmitting"
            @close="showPatternsMenu = false"
            @use-pattern="onUsePattern"
            @create-pattern="onCreatePattern"
          />
        </q-menu>
      </q-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import draggable from 'vuedraggable'
import { useUserStore } from 'stores/user.js'
import { LIST_COLORS } from '@/constants/cardStatus'
import BoardCardItem from './BoardCardItem.vue'
import AddCardButton from './AddCardButton.vue'
import CardPatternsPopover from './CardPatternsPopover.vue'

const props = defineProps({
  list: { type: Object, required: true },
  isZoomed: { type: Boolean, default: true },
  patterns: { type: Array, default: () => [] },
  patternsLoading: { type: Boolean, default: false },
  patternSubmitting: { type: Boolean, default: false },
})

const emit = defineEmits([
  'update:cards',
  'cardChange',
  'addCard',
  'openCard',
  'archiveCard',
  'syncPattern',
  'openPatterns',
  'usePattern',
  'createPattern',
  'archive',
  'rename',
  'changeColor',
  'cardDragState',
])

const userStore = useUserStore()
const isEditingName = ref(false)
const editName = ref('')
const nameInputRef = ref(null)
const showPatternsMenu = ref(false)

function positionOrMax(value) {
  return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER
}

const activeCards = computed(() =>
  (props.list.cards || [])
    .filter((c) => !c.isArchived)
    .sort((a, b) => positionOrMax(a.position) - positionOrMax(b.position)),
)

// Local ref — vuedraggable mutates this directly via splice (instant, no lag).
// Store syncs in via watcher; we only persist back on drop (@change).
const localCards = ref([])

watch(activeCards, (val) => {
  localCards.value = val
}, { immediate: true })

function onDragChange(event) {
  emit('update:cards', [...localCards.value])
  emit('cardChange', event)
}

function onDragStart() {
  emit('cardDragState', true)
}

function onDragEnd() {
  emit('cardDragState', false)
}

function startNameEdit() {
  editName.value = props.list.name
  isEditingName.value = true
  nextTick(() => {
    nameInputRef.value?.focus()
    nameInputRef.value?.select()
  })
}

function saveName() {
  if (!isEditingName.value) return
  isEditingName.value = false
  const trimmed = editName.value.trim()
  if (trimmed && trimmed !== props.list.name) {
    emit('rename', trimmed)
  }
}

function cancelNameEdit() {
  isEditingName.value = false
}

function onUsePattern(pattern) {
  emit('usePattern', { listId: props.list.id, pattern })
  showPatternsMenu.value = false
}

function onCreatePattern(name) {
  emit('createPattern', { listId: props.list.id, name })
  showPatternsMenu.value = false
}
</script>

<style scoped lang="scss">
.board-column {
  width: 300px;
  min-width: 300px;
  height: 100%;
  max-height: calc(100vh - 180px);
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;

  @media (max-width: 599px) {
    width: 280px;
    min-width: 280px;
    max-height: none;
  }
}

.column-header {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  gap: 0.375rem;
  position: relative;
  user-select: none;
  -webkit-user-select: none;
}

.column-color-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--list-color, #3b82f6);
  border-radius: 16px 16px 0 0;
}

.column-title {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.375rem;
  border-radius: 4px;
  user-select: none;
  -webkit-user-select: none;

  &.editable {
    cursor: pointer;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }
  }
}

.column-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
}

.column-count {
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  border-radius: 9999px;
  min-width: 20px;
  text-align: center;
}

.column-name-edit {
  flex: 1;
  user-select: text;
  -webkit-user-select: text;
}

.name-input {
  :deep(.q-field__control) {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    min-height: 32px;
    padding: 0 8px;
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  :deep(.q-field__native) {
    font-size: 0.875rem;
    font-weight: 600;
    padding: 4px 0;
    color: #fff;
  }
}

.column-icon-btn {
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.14);
    border-color: rgba(255, 255, 255, 0.22);
  }
}

/* Column dropdown menu */
.column-dropdown-menu {
  background: rgba(20, 24, 38, 0.92) !important;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  min-width: 280px;
  padding: 0.4rem;
  border-radius: 12px !important;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 0.6rem 0.5rem;
}

.dropdown-header-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.82);
  letter-spacing: 0.01em;
  text-transform: none;
}

.dropdown-close {
  color: rgba(255, 255, 255, 0.72);
  background: transparent;
  border: 1px solid transparent;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.16);
  }
}

.dropdown-sep {
  margin: 0.25rem 0.25rem;
  background: rgba(255, 255, 255, 0.14) !important;
}

.dropdown-item {
  color: rgba(255, 255, 255, 0.88);
  min-height: 42px;
  border-radius: 8px;
  margin: 0.1rem 0.25rem;
  transition: background 0.15s ease, color 0.15s ease;

  :deep(.q-icon) {
    color: rgba(255, 255, 255, 0.72);
  }

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
  }
}

.dropdown-section {
  margin: 0.2rem 0.25rem;
  padding: 0.55rem 0.6rem 0.65rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
}

.dropdown-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.66);
  margin-bottom: 0.55rem;
  text-transform: none;
  letter-spacing: 0.01em;
}

.dropdown-color-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.375rem;
}

.color-swatch {
  width: 100%;
  aspect-ratio: 1.6;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: transform 0.16s ease, opacity 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;

  &:hover {
    transform: translateY(-1px);
    opacity: 0.95;
    border-color: rgba(255, 255, 255, 0.3);
  }

  &.selected {
    border-color: #fff;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.34), 0 4px 14px rgba(0, 0, 0, 0.22);
  }

  &.no-color {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.4);
  }
}

.column-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 0.5rem;
  min-height: 40px;
}

.cards-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 40px;
  min-height: 100%;
  padding-bottom: 0.125rem;
}

.cards-list > * {
  flex-shrink: 0;
}

.column-footer {
  padding: 0.25rem 0.5rem 0.5rem;
  display: flex;
  align-items: flex-end;
  gap: 0.25rem;

  :deep(.add-card-wrapper) {
    flex: 1;
  }
}

.pattern-btn {
  color: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.08);
  margin-bottom: 0.3rem;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  min-height: 28px;
  border-radius: 8px;

  &:hover {
    color: #fff;
    border-color: rgba(96, 165, 250, 0.5);
    background: rgba(59, 130, 246, 0.18);
  }
}

</style>

<style lang="scss">
/* Global (unscoped) — SortableJS appends clones to <body> */
.column-dropdown-menu {
  background: rgba(20, 24, 38, 0.96) !important;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  border-radius: 12px !important;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.38) !important;
  min-width: 280px;
  padding: 0.4rem;
  color: rgba(255, 255, 255, 0.9);
}

.column-dropdown-menu .dropdown-header-title {
  color: rgba(255, 255, 255, 0.82);
}

.column-dropdown-menu .dropdown-sep {
  background: rgba(255, 255, 255, 0.14) !important;
}

.column-dropdown-menu .dropdown-item {
  color: rgba(255, 255, 255, 0.88);
  border-radius: 8px;
  min-height: 42px;
}

.column-dropdown-menu .dropdown-item:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.column-dropdown-menu .dropdown-item .q-icon {
  color: rgba(255, 255, 255, 0.72);
}

.column-dropdown-menu .dropdown-section {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
}

.patterns-popover-menu {
  background: transparent !important;
  box-shadow: none !important;
  overflow: visible !important;

  &.is-zoomed-out {
    transform: scale(0.78) !important;
    transform-origin: bottom right !important;
    /* Force layout box to match visual scaled size (260px * 0.78 approx 203px) to prevent overflow/scrollbars */
    width: 203px !important;
    min-width: 203px !important;
    max-height: 312px !important;
  }
}

.card-drag-ghost {
  opacity: 0.4;
  border: 2px dashed rgba(139, 92, 246, 0.5) !important;
  border-radius: 12px;
  background: rgba(139, 92, 246, 0.08) !important;
}

.card-drag-chosen {
  opacity: 0.9;
  transform: rotate(-1deg);
}

.card-drag-active {
  transition: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  opacity: 1 !important;
  background: rgba(30, 27, 60, 0.95) !important;
  border: 1px solid rgba(139, 92, 246, 0.5) !important;
  border-radius: 12px !important;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4) !important;
  z-index: 9999 !important;
  cursor: grabbing !important;
  transform: rotate(-2.2deg) scale(1.02);
  transform-origin: center center;
}
</style>
