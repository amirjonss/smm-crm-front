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
      <q-btn
        flat
        dense
        icon="note_add"
        class="archive-btn"
        @click="showPatternsSidebar = true"
      >
        <q-tooltip>Шаблоны</q-tooltip>
      </q-btn>
    </div>

    <div v-if="isPageLoading || boardStore.loading || !boardStore.currentBoard" class="board-columns-container skeleton-container">
      <div class="board-content-row">
        <div v-for="col in 4" :key="'skel-col-' + col" class="skeleton-column">
          <div class="skeleton-column-header">
            <q-skeleton type="text" width="50%" class="bg-white-10" dark animation="pulse" />
            <q-skeleton type="QBadge" width="20px" height="20px" class="bg-white-10" dark animation="pulse" style="border-radius: 9999px" />
          </div>
          <div class="skeleton-cards">
            <div v-for="card in 3" :key="'skel-card-' + card" class="skeleton-card">
              <q-skeleton type="text" width="85%" class="text-subtitle1 q-mb-sm bg-white-10" dark animation="pulse" />
              <q-skeleton type="text" width="60%" class="q-mb-md bg-white-10" dark animation="pulse" />
              <div class="skeleton-card-footer">
                <q-skeleton type="QBadge" width="50px" height="20px" class="bg-white-10" dark animation="pulse" style="border-radius: 9999px" />
                <div class="skeleton-avatars">
                  <q-skeleton type="QAvatar" size="22px" class="bg-white-10 avatar-skel" dark animation="pulse" />
                  <q-skeleton type="QAvatar" size="22px" class="bg-white-10 avatar-skel" dark animation="pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      ref="scrollContainerRef"
      class="board-columns-container"
      :class="{
        zoomed: isZoomed && isMobile,
        'zoom-animating': isZoomAnimating,
        'is-card-dragging': isCardDragging,
      }"
      @scroll="onColumnsScroll"
    >
      <div class="board-content-row">
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
              :is-zoomed="isZoomed"
              :patterns="boardStore.getCardPatterns"
              :patterns-loading="isPatternsLoading"
              :pattern-submitting="isPatternSubmitting"
              @update:cards="updateCards(list.id, $event)"
              @card-change="handleCardChange($event, list.id)"
              @add-card="addCard(list.id, $event)"
              @archive-card="archiveCard"
              @sync-pattern="syncCardPattern"
              @open-patterns="openPatternDialog"
              @use-pattern="createCardFromPattern"
              @create-pattern="createPatternAndCard"
              @open-card="openCard($event)"
              @archive="archiveList(list)"
              @rename="renameList(list, $event)"
              @change-color="changeListColor(list, $event)"
              @card-drag-state="onCardDragState"
            />
          </template>
        </draggable>

        <add-list-button v-if="userStore.canManageList" @add="addList" />
      </div>
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
      @sync-pattern="syncCardPattern"
      @toggle-archive="toggleCardArchive"
    />

    <card-pattern-dialog
      v-model="showPatternDialog"
      :pattern="editingPattern"
      :saving="isPatternDialogSaving"
      @save="savePatternDialog"
    />

    <board-archive-sidebar
      v-model="showArchiveSidebar"
      :board-id="boardStore.currentBoard?.id"
      @open-card="openCard"
    />

    <board-patterns-sidebar
      v-model="showPatternsSidebar"
      @edit-pattern="openPatternEditor"
    />

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useBoardStore } from 'stores/board.js'
import { useUserStore } from 'stores/user.js'
import { useBoardDragDrop } from '@/composables/useBoardDragDrop'
import { useMercureBoard } from '@/composables/useMercureBoard'
import draggable from 'vuedraggable'
import BoardColumn from 'components/boards/BoardColumn.vue'
import AddListButton from 'components/boards/AddListButton.vue'
import CardDialog from 'components/boards/CardDialog.vue'
import CardPatternDialog from 'components/boards/CardPatternDialog.vue'
import BoardArchiveSidebar from 'components/boards/BoardArchiveSidebar.vue'
import BoardPatternsSidebar from 'components/boards/BoardPatternsSidebar.vue'

const route = useRoute()
const router = useRouter()
const q = useQuasar()
const boardStore = useBoardStore()
const userStore = useUserStore()
const { sortedLists, persistListOrder, handleCardChange } = useBoardDragDrop()

useMercureBoard(route.params.id, (event) => {
  switch (event.type) {
    case 'card.created':
    case 'card.updated':
      boardStore.patchCardInState(event.data)
      // If this card is open in the dialog, refresh its logs
      if (showCardDialog.value && editingCard.value?.id === event.data.id) {
        boardStore.fetchCardLogs(event.data.id)
      }
      break
    case 'card.moved':
      boardStore.handleCardMoved(event.data)
      if (showCardDialog.value && editingCard.value?.id === event.data.id) {
        boardStore.fetchCardLogs(event.data.id)
      }
      break
    case 'card.archived':
      if (event.data.isArchived) {
        boardStore.removeCardFromState(event.data.cardId)
        if (showCardDialog.value && editingCard.value?.id === event.data.cardId) {
          showCardDialog.value = false
        }
      }
      break
    case 'list.updated':
    case 'list.created':
      boardStore.patchListInState(event.data)
      break
    case 'card.log_added':
      if (showCardDialog.value && editingCard.value?.id === event.data.cardId) {
        boardStore.addLogToState(event.data.log)
      }
      break
  }
})

const showCardDialog = ref(false)
const editingCard = ref(null)
const showPatternDialog = ref(false)
const editingPattern = ref(null)
const isPatternDialogSaving = ref(false)
const showArchiveSidebar = ref(false)
const showPatternsSidebar = ref(false)
const isPageLoading = ref(true)
const isPatternsLoading = ref(false)
const isPatternSubmitting = ref(false)

const isEditingBoardName = ref(false)
const editBoardName = ref('')
const boardNameInputRef = ref(null)

// Mobile zoom
const isZoomed = ref(true)
const isMobile = computed(() => q.screen.lt.sm)

// Zoom animation
const isZoomAnimating = ref(false)

function toggleZoom() {
  const container = scrollContainerRef.value
  const currentColumn = activeColumnIndex.value

  isZoomAnimating.value = true
  isZoomed.value = !isZoomed.value

  nextTick(() => {
    if (!container || !isMobile.value) return

    if (!isZoomed.value) {
      // In zoom-out mode, start from the left edge to avoid empty offset gaps.
      container.scrollLeft = 0
      return
    }

    // Restore to the previously active column when returning to zoomed mode.
    scrollToColumn(currentColumn)
  })

  setTimeout(() => {
    isZoomAnimating.value = false
  }, 350)
}

// Slide dot tracking
const scrollContainerRef = ref(null)
const activeColumnIndex = ref(0)
const isCardDragging = ref(false)
const isDragTouchListenerBound = ref(false)

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

function onCardDragState(value) {
  isCardDragging.value = !!value

  if (isCardDragging.value) {
    bindDragTouchAutoScroll()
  } else {
    unbindDragTouchAutoScroll()
  }
}

function handleDragTouchMove(event) {
  if (!isCardDragging.value || !isMobile.value) return
  const container = scrollContainerRef.value
  const touch = event.touches?.[0]
  if (!container || !touch) return

  const rect = container.getBoundingClientRect()
  const edgeSize = 72
  const maxSpeed = 18
  let deltaX = 0

  if (touch.clientX < rect.left + edgeSize) {
    const ratio = (rect.left + edgeSize - touch.clientX) / edgeSize
    deltaX = -maxSpeed * Math.min(1, Math.max(0, ratio))
  } else if (touch.clientX > rect.right - edgeSize) {
    const ratio = (touch.clientX - (rect.right - edgeSize)) / edgeSize
    deltaX = maxSpeed * Math.min(1, Math.max(0, ratio))
  }

  if (deltaX !== 0) {
    container.scrollLeft += deltaX
  }
}

function bindDragTouchAutoScroll() {
  if (isDragTouchListenerBound.value) return
  window.addEventListener('touchmove', handleDragTouchMove, { passive: true })
  isDragTouchListenerBound.value = true
}

function unbindDragTouchAutoScroll() {
  if (!isDragTouchListenerBound.value) return
  window.removeEventListener('touchmove', handleDragTouchMove)
  isDragTouchListenerBound.value = false
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

function getCardPatternId(card) {
  return card?.cardPattern?.id || card?.cardPatternId || card?.pattern?.id || card?.patternId || null
}

function markCardAsPattern(cardId, pattern) {
  if (!boardStore.currentBoard?.lists?.length) return
  for (const list of boardStore.currentBoard.lists) {
    const card = list.cards?.find((item) => item.id === cardId)
    if (card) {
      card.cardPattern = { id: pattern.id, name: pattern.name || card.name }
      card.cardPatternId = pattern.id
      break
    }
  }
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

function openPatternEditor(pattern) {
  editingPattern.value = {
    id: pattern.id,
    name: pattern.name || '',
    description: pattern.description || '',
    status: pattern.status || 'open',
    deadline: pattern.deadline || null,
  }
  showPatternDialog.value = true
}

function updatePatternNameInCards(patternId, patternName) {
  if (!boardStore.currentBoard?.lists?.length) return
  for (const list of boardStore.currentBoard.lists) {
    for (const card of list.cards || []) {
      const cardPatternId =
        card?.cardPattern?.id || card?.cardPatternId || card?.pattern?.id || card?.patternId
      if (cardPatternId === patternId) {
        card.cardPattern = { id: patternId, name: patternName }
        card.cardPatternId = patternId
      }
    }
  }
}

async function savePatternDialog(payload) {
  if (!editingPattern.value?.id) return
  isPatternDialogSaving.value = true
  try {
    const updated = await boardStore.patchCardPattern(editingPattern.value.id, payload)
    updatePatternNameInCards(updated.id, updated.name || payload.name)
    showPatternDialog.value = false
    q.notify({ message: 'Шаблон обновлён', type: 'positive', position: 'top' })
  } catch {
    q.notify({ message: 'Ошибка обновления шаблона', type: 'negative', position: 'top' })
  } finally {
    isPatternDialogSaving.value = false
  }
}

async function syncCardPattern(card) {
  if (!card?.id) return
  try {
    let pattern
    const patternId = getCardPatternId(card)
    if (patternId) {
      pattern = await boardStore.patchCardPattern(patternId, {
        name: card.name,
        description: card.description || '',
      })
      q.notify({ message: 'Шаблон обновлён', type: 'positive', position: 'top', timeout: 1200 })
    } else {
      pattern = await boardStore.createCardPatternFromCard(card.id)
      q.notify({ message: 'Шаблон создан', type: 'positive', position: 'top', timeout: 1200 })
    }
    markCardAsPattern(card.id, pattern)
  } catch {
    q.notify({ message: 'Ошибка при сохранении шаблона', type: 'negative', position: 'top' })
  }
}

async function openPatternDialog() {
  if (isPatternsLoading.value) return
  isPatternsLoading.value = true
  try {
    await boardStore.fetchCardPatterns()
  } catch {
    q.notify({ message: 'Не удалось загрузить шаблоны', type: 'negative', position: 'top' })
  } finally {
    isPatternsLoading.value = false
  }
}

async function createCardFromPattern({ listId, pattern }) {
  if (!listId || !pattern?.name) return
  isPatternSubmitting.value = true
  try {
    const payload = {
      name: pattern.name,
      description: pattern.description || '',
    }

    if (pattern.status) {
      payload.status = pattern.status
    }

    if (pattern.deadline) {
      payload.deadline = pattern.deadline
    }

    await boardStore.createCard(listId, payload)
    q.notify({ message: 'Карточка создана по шаблону', type: 'positive', position: 'top' })
  } catch {
    q.notify({ message: 'Ошибка создания карточки', type: 'negative', position: 'top' })
  } finally {
    isPatternSubmitting.value = false
  }
}

async function createPatternAndCard({ listId, name }) {
  if (!listId || !name?.trim()) return
  isPatternSubmitting.value = true
  try {
    const card = await boardStore.createCard(listId, { name: name.trim() })
    const pattern = await boardStore.createCardPatternFromCard(card.id)
    markCardAsPattern(card.id, pattern)
    q.notify({ message: 'Созданы карточка и шаблон', type: 'positive', position: 'top' })
  } catch {
    q.notify({ message: 'Ошибка создания шаблона', type: 'negative', position: 'top' })
  } finally {
    isPatternSubmitting.value = false
  }
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

onMounted(async () => {
  isPageLoading.value = true
  try {
    await boardStore.fetchBoard(route.params.id)
  } catch {
    q.notify({ message: 'Доска не найдена', type: 'negative', position: 'top' })
    router.push('/boards')
  } finally {
    isPageLoading.value = false
  }
})

onBeforeUnmount(() => {
  unbindDragTouchAutoScroll()
})
</script>

<style scoped lang="scss">
/* Skeleton Board loading states */
.skeleton-container {
  display: flex;
  overflow: hidden;
  height: 100%;
}
.skeleton-column {
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
  padding: 0.75rem;

  @media (max-width: 599px) {
    width: 280px;
    min-width: 280px;
  }
}
.skeleton-column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.25rem;
}
.skeleton-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.skeleton-card {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 0.75rem;
}
.skeleton-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}
.skeleton-avatars {
  display: flex;
  align-items: center;
}
.avatar-skel {
  border: 1.5px solid rgba(15, 12, 41, 0.8);
}
.bg-white-10 {
  background: rgba(255, 255, 255, 0.1) !important;
}

.board-detail-page {
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  height: calc(100dvh - 64px);

  @media (max-width: 599px) {
    height: calc(100dvh - 56px);
  }
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
  display: block;
  min-height: 0;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0;
  padding-bottom: 12px;
  -webkit-overflow-scrolling: touch;

  /* Стили для скроллбара */
  scrollbar-width: auto;
  scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.05);

  &::-webkit-scrollbar {
    height: 12px;
    background: transparent;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin: 0 1.5rem;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    border: 3px solid transparent;
    background-clip: padding-box;
    &:hover {
      background-color: rgba(255, 255, 255, 0.4);
    }
  }

  @media (max-width: 599px) {
    gap: 0;
  }
}

.columns-row {
  display: flex;
  gap: 1rem;
  align-items: stretch;
  height: 100%;
  padding: 1rem 0.75rem 1.5rem 1.5rem;

  @media (max-width: 599px) {
    gap: 0.75rem;
    padding: 0.75rem 0.75rem 8rem 0.75rem;
  }
}

.board-content-row {
  display: flex;
  align-items: stretch;
  gap: 1rem;
  height: 100%;
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  width: max-content;
  min-width: 100%;

  @media (max-width: 599px) {
    gap: 0.75rem;
    padding: 0.75rem 0.75rem 8rem 0.75rem;
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
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
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
      height: 100% !important;
      scroll-snap-align: start;
    }

    .add-list-wrapper {
      width: calc(100vw - 1.5rem) !important;
      min-width: calc(100vw - 1.5rem) !important;
      height: 100% !important;
      scroll-snap-align: start;
    }
  }

  /* During card drag in zoomed mode, disable snap and show more targets */
  .board-columns-container.zoomed.is-card-dragging {
    scroll-snap-type: none;
  }

  /* Zoomed-out on mobile: avoid CSS zoom; use smaller column widths */
  .board-columns-container:not(.zoomed) {
    scroll-snap-type: none;

    .board-content-row {
      transform: scale(0.78);
      transform-origin: top left;
      width: max-content;
      height: calc(100% / 0.78) !important;
    }
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
