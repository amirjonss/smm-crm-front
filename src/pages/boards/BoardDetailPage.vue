<template>
  <q-page class="board-detail-page">
    <div class="board-top-bar">
      <q-btn flat round dense icon="arrow_back" class="back-btn" @click="router.push('/boards')">
        <q-tooltip>Назад к доскам</q-tooltip>
      </q-btn>

      <div v-if="isEditingBoardName" class="board-name-edit">
        <q-input
          ref="boardNameInputRef"
          v-model="editBoardName"
          outlined
          dense
          class="board-name-input"
          @keydown.enter.prevent="saveBoardName"
          @keydown.escape="cancelBoardNameEdit"
          @blur="saveBoardName"
        />
      </div>
      <h1 v-else class="board-name" @click="startBoardNameEdit">
        {{ boardStore.currentBoard?.name || 'Загрузка...' }}
      </h1>

      <div class="board-top-bar-spacer" />

      <q-btn
        flat
        dense
        icon="inventory_2"
        class="archive-btn"
        @click="showArchiveSidebar = true"
      >
        <q-tooltip>Архив</q-tooltip>
      </q-btn>
    </div>

    <div v-if="!boardStore.currentBoard" class="loading-state">
      <q-spinner-dots size="40px" color="white" />
    </div>

    <div
      v-else
      ref="scrollContainerRef"
      class="board-columns-container"
      :class="{ zoomed: isZoomed && isMobile, 'zoom-animating': isZoomAnimating }"
      @scroll="onColumnsScroll"
    >
      <draggable
        v-model="sortedLists"
        item-key="id"
        ghost-class="column-drag-ghost"
        drag-class="column-drag-fallback"
        chosen-class="column-drag-chosen"
        :force-fallback="true"
        :fallback-on-body="true"
        :animation="150"
        :scroll-sensitivity="100"
        handle=".column-header"
        class="columns-row"
        @change="persistListOrder"
      >
        <template #item="{ element: list }">
          <board-column
            :list="list"
            @update:cards="updateCards(list.id, $event)"
            @card-change="handleCardChange($event, list.id)"
            @add-card="addCard(list.id, $event)"
            @archive-card="archiveCard"
            @open-card="openCard($event)"
            @archive="archiveList(list)"
            @rename="renameList(list, $event)"
            @change-color="changeListColor(list, $event)"
          />
        </template>
      </draggable>

      <add-list-button v-if="userStore.canManageList" @add="addList" />
    </div>

    <!-- Slide dot indicators (zoomed-in mobile only) -->
    <div v-if="isMobile && isZoomed && boardStore.currentBoard" class="slide-dots">
      <span
        v-for="(list, i) in sortedLists"
        :key="list.id"
        class="slide-dot"
        :class="{ active: i === activeColumnIndex }"
        @click="scrollToColumn(i)"
      />
    </div>

    <!-- Zoom toggle FAB (mobile only) -->
    <button
      v-if="isMobile && boardStore.currentBoard"
      class="zoom-fab"
      @click="toggleZoom"
    >
      <q-icon :name="isZoomed ? 'close_fullscreen' : 'open_in_full'" size="20px" />
    </button>

    <card-dialog
      v-model="showCardDialog"
      :card="editingCard"
      :lists="boardStore.currentBoard?.lists || []"
      @save="saveCard"
      @toggle-archive="toggleCardArchive"
    />

    <board-archive-sidebar
      v-model="showArchiveSidebar"
      :board-id="boardStore.currentBoard?.id"
      @open-card="openCard"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useBoardStore } from 'stores/board.js'
import { useUserStore } from 'stores/user.js'
import { useBoardDragDrop } from '@/composables/useBoardDragDrop'
import draggable from 'vuedraggable'
import BoardColumn from 'components/boards/BoardColumn.vue'
import AddListButton from 'components/boards/AddListButton.vue'
import CardDialog from 'components/boards/CardDialog.vue'
import BoardArchiveSidebar from 'components/boards/BoardArchiveSidebar.vue'

const route = useRoute()
const router = useRouter()
const q = useQuasar()
const boardStore = useBoardStore()
const userStore = useUserStore()
const { sortedLists, persistListOrder, handleCardChange } = useBoardDragDrop()

const showCardDialog = ref(false)
const editingCard = ref(null)
const showArchiveSidebar = ref(false)

const isEditingBoardName = ref(false)
const editBoardName = ref('')
const boardNameInputRef = ref(null)

// Mobile zoom
const isZoomed = ref(true)
const isMobile = computed(() => q.screen.lt.sm)

// Zoom animation
const isZoomAnimating = ref(false)

function toggleZoom() {
  isZoomAnimating.value = true
  isZoomed.value = !isZoomed.value
  setTimeout(() => {
    isZoomAnimating.value = false
  }, 350)
}

// Slide dot tracking
const scrollContainerRef = ref(null)
const activeColumnIndex = ref(0)

function onColumnsScroll() {
  if (!isZoomed.value || !isMobile.value) return
  const container = scrollContainerRef.value
  if (!container) return
  const column = container.querySelector('.board-column')
  if (!column) return
  const columnWidth = column.offsetWidth
  const gap = 12
  activeColumnIndex.value = Math.round(container.scrollLeft / (columnWidth + gap))
}

function scrollToColumn(index) {
  const container = scrollContainerRef.value
  if (!container) return
  const columns = container.querySelectorAll('.board-column')
  if (columns[index]) {
    columns[index].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
  }
}

function startBoardNameEdit() {
  editBoardName.value = boardStore.currentBoard?.name || ''
  isEditingBoardName.value = true
  nextTick(() => {
    boardNameInputRef.value?.focus()
    boardNameInputRef.value?.select()
  })
}

function saveBoardName() {
  if (!isEditingBoardName.value) return
  isEditingBoardName.value = false
  const trimmed = editBoardName.value.trim()
  if (trimmed && trimmed !== boardStore.currentBoard?.name) {
    boardStore.patchBoard(boardStore.currentBoard.id, { name: trimmed })
  }
}

function cancelBoardNameEdit() {
  isEditingBoardName.value = false
}

function updateCards(listId, cards) {
  boardStore.reorderCards(listId, cards)
}

function addCard(listId, name) {
  boardStore.createCard(listId, { name }).then(() => {
    q.notify({ message: 'Карточка добавлена', type: 'positive', position: 'top', timeout: 1000 })
  })
}

function archiveCard(card) {
  if (!card?.id) return
  boardStore.patchCard(card.id, { isArchived: true }).then(() => {
    q.notify({ message: 'Карточка архивирована', type: 'positive', position: 'top', timeout: 1000 })
  })
}

function openCard(card) {
  editingCard.value = card
  showCardDialog.value = true
}

function saveCard(data) {
  if (!editingCard.value) return

  const oldListId = editingCard.value.list?.id
  const newListId = data.listId

  const patchData = {
    name: data.name,
    status: data.status,
    deadline: data.deadline || null,
    description: data.description,
  }

  if (newListId && newListId !== oldListId) {
    const toList = boardStore.currentBoard?.lists.find((l) => l.id === newListId)
    const newIndex = toList ? toList.cards.length : 0
    boardStore.moveCard(editingCard.value.id, oldListId, newListId, newIndex)
    // Persist list move via dedicated endpoint
    const lastCard = toList && toList.cards.length > 1 ? toList.cards[toList.cards.length - 2] : null
    boardStore.moveCardPosition(editingCard.value.id, {
      targetListId: newListId,
      prevCardId: lastCard?.id !== editingCard.value.id ? lastCard?.id : null,
      nextCardId: null,
    })
  }

  const cardId = editingCard.value.id
  boardStore.patchCard(cardId, patchData).then(() => {
    boardStore.fetchCardLogs(cardId)
    q.notify({ message: 'Карточка обновлена', type: 'positive', position: 'top', timeout: 1000 })
  })
}

function toggleCardArchive({ cardId, isArchived }) {
  boardStore.patchCard(cardId, { isArchived }).then(() => {
    showCardDialog.value = false
    const message = isArchived ? 'Карточка архивирована' : 'Карточка восстановлена'
    q.notify({ message, type: 'positive', position: 'top', timeout: 1200 })
  })
}

function addList(data) {
  const boardId = boardStore.currentBoard?.id
  if (!boardId) return
  boardStore.createList(boardId, data).then(() => {
    q.notify({ message: 'Список добавлен', type: 'positive', position: 'top', timeout: 1000 })
  })
}

function renameList(list, name) {
  boardStore.patchList(list.id, { name })
}

function changeListColor(list, color) {
  boardStore.patchList(list.id, { color })
}

function archiveList(list) {
  boardStore.patchList(list.id, { isArchived: true }).then(() => {
    q.notify({ message: 'Список архивирован', type: 'positive', position: 'top' })
  })
}

onMounted(() => {
  boardStore.fetchBoard(route.params.id).catch(() => {
    q.notify({ message: 'Доска не найдена', type: 'negative', position: 'top' })
    router.push('/boards')
  })
})
</script>

<style scoped lang="scss">
.board-detail-page {
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  min-height: 100vh;
}

.board-top-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  @media (max-width: 599px) {
    padding: 0.5rem 1rem;
  }
}

.back-btn {
  color: rgba(255, 255, 255, 0.6);

  &:hover {
    color: #fff;
  }
}

.board-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  @media (max-width: 599px) {
    font-size: 1.125rem;
  }
}

.board-top-bar-spacer {
  flex: 1;
}

.archive-btn {
  color: rgba(255, 255, 255, 0.6);
  border-radius: 8px;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.08);
  }
}

.board-name-edit {
  flex: 1;
  max-width: 400px;
}

.board-name-input {
  :deep(.q-field__control) {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    min-height: 36px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  :deep(.q-field__native) {
    font-size: 1.25rem;
    font-weight: 700;
    padding: 4px 8px;
    color: #fff;
  }
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.board-columns-container {
  flex: 1;
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 1rem 1.5rem 1.5rem;
  gap: 1rem;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 599px) {
    padding: 0.75rem;
    gap: 0.75rem;
  }
}

.columns-row {
  display: flex;
  gap: 1rem;
  align-items: flex-start;

  @media (max-width: 599px) {
    gap: 0.75rem;
  }
}

/* Slide dot indicators */
.slide-dots {
  position: fixed;
  bottom: 5rem;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  z-index: 100;
  pointer-events: none;
}

.slide-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.25s ease;
  border: none;
  padding: 0;

  &.active {
    background: rgba(255, 255, 255, 0.9);
    transform: scale(1.3);
  }
}

/* Zoom toggle FAB — liquid glass */
.zoom-fab {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 100;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    rgba(168, 85, 247, 0.45),
    rgba(139, 92, 246, 0.3)
  );
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(168, 85, 247, 0.35);
  color: #fff;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease;
  outline: none;
  -webkit-tap-highlight-color: transparent;

  &:active {
    background: linear-gradient(
      135deg,
      rgba(168, 85, 247, 0.6),
      rgba(139, 92, 246, 0.45)
    );
    box-shadow: 0 2px 12px rgba(139, 92, 246, 0.4);
  }
}
</style>

<style lang="scss">
/* Prevent body scroll and black bg when drag clone extends viewport */
body:has(.board-detail-page) {
  background-color: #0f0c29;
  overflow: hidden;
}

/* Mobile zoom modes */
@media (max-width: 599px) {
  /* Zoomed-in: full-width columns, swipeable slides with snap */
  .board-columns-container.zoomed {
    scroll-snap-type: x mandatory;
    scroll-padding: 0.75rem;

    .board-column {
      width: calc(100vw - 1.5rem) !important;
      min-width: calc(100vw - 1.5rem) !important;
      scroll-snap-align: start;
    }

    .add-list-wrapper {
      width: calc(100vw - 1.5rem) !important;
      min-width: calc(100vw - 1.5rem) !important;
      scroll-snap-align: start;
    }
  }

  /* Zoomed-out: true CSS zoom — everything proportionally smaller */
  .board-columns-container:not(.zoomed) {
    zoom: 0.65;
  }

  /* Zoom transition animation */
  .board-columns-container.zoom-animating {
    animation: zoomSwitch 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

@keyframes zoomSwitch {
  0% {
    opacity: 0.4;
    transform: scale(0.92);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Global (unscoped) — SortableJS appends clones to <body> */
.column-drag-ghost {
  opacity: 0.4;
  border: 2px dashed rgba(139, 92, 246, 0.6) !important;
  border-radius: 16px;
  background: rgba(139, 92, 246, 0.06) !important;
}

.column-drag-chosen {
  opacity: 0.9;
}

.column-drag-fallback {
  transition: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  opacity: 1 !important;
  background: rgba(30, 27, 60, 0.95) !important;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4) !important;
  z-index: 9999 !important;
  cursor: grabbing !important;
}
</style>
