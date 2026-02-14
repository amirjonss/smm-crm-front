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

            <q-item
              v-close-popup
              clickable
              class="dropdown-item text-negative"
              @click="$emit('delete')"
            >
              <q-item-section avatar>
                <q-icon name="delete_outline" size="18px" color="negative" />
              </q-item-section>
              <q-item-section>Удалить</q-item-section>
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
        :animation="150"
        :scroll-sensitivity="100"
        class="cards-list"
        @change="onDragChange"
      >
        <template #item="{ element }">
          <board-card-item :card="element" @click="$emit('openCard', element)" />
        </template>
      </draggable>
    </div>

    <div v-if="userStore.canManageList" class="column-footer">
      <add-card-button @add="$emit('addCard', $event)" />
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

const props = defineProps({
  list: { type: Object, required: true },
})

const emit = defineEmits([
  'update:cards',
  'cardChange',
  'addCard',
  'openCard',
  'archive',
  'delete',
  'rename',
  'changeColor',
])

const userStore = useUserStore()
const isEditingName = ref(false)
const editName = ref('')
const nameInputRef = ref(null)

const activeCards = computed(() =>
  (props.list.cards || []).filter((c) => !c.isArchived).sort((a, b) => a.position - b.position),
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
</script>

<style scoped lang="scss">
.board-column {
  width: 300px;
  min-width: 300px;
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
  }
}

.column-header {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  gap: 0.375rem;
  position: relative;
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
  color: rgba(255, 255, 255, 0.4);

  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }
}

/* Column dropdown menu */
.column-dropdown-menu {
  background: rgba(20, 18, 50, 0.95) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px !important;
  min-width: 260px;
  padding: 0;
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 0.75rem;
}

.dropdown-header-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}

.dropdown-close {
  color: rgba(255, 255, 255, 0.4);

  &:hover {
    color: #fff;
  }
}

.dropdown-sep {
  background: rgba(255, 255, 255, 0.08) !important;
}

.dropdown-item {
  color: rgba(255, 255, 255, 0.7);
  min-height: 40px;

  :deep(.q-icon) {
    color: rgba(255, 255, 255, 0.5);
  }

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
}

.dropdown-section {
  padding: 0.5rem 0.75rem;
}

.dropdown-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 0.5rem;
}

.dropdown-color-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.375rem;
}

.color-swatch {
  width: 100%;
  aspect-ratio: 1.6;
  border-radius: 6px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.15s ease;

  &:hover {
    transform: scale(1.08);
    opacity: 0.85;
  }

  &.selected {
    border-color: #fff;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.3);
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
  padding-bottom: 0.25rem;
}

.column-footer {
  padding: 0.25rem 0.5rem 0.5rem;
}

</style>

<style lang="scss">
/* Global (unscoped) — SortableJS appends clones to <body> */
.card-drag-ghost {
  opacity: 0.4;
  border: 2px dashed rgba(139, 92, 246, 0.5) !important;
  border-radius: 12px;
  background: rgba(139, 92, 246, 0.08) !important;
}

.card-drag-chosen {
  opacity: 0.9;
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
}
</style>
