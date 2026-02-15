<template>
  <transition name="slide-right">
    <div v-if="modelValue" class="archive-sidebar-overlay" @click.self="close">
      <div class="archive-sidebar">
        <div class="sidebar-header">
          <span class="sidebar-title">Архив</span>
          <q-btn flat round dense size="sm" icon="close" class="close-btn" @click="close" />
        </div>

        <div class="sidebar-tabs">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'cards' }"
            @click="switchTab('cards')"
          >
            Карточки
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'lists' }"
            @click="switchTab('lists')"
          >
            Списки
          </button>
        </div>

        <div ref="scrollAreaRef" class="sidebar-content" @scroll="onScroll">
          <div v-if="loading && items.length === 0" class="sidebar-loading">
            <q-spinner-dots size="32px" color="white" />
          </div>

          <div v-else-if="items.length === 0" class="sidebar-empty">
            {{ activeTab === 'cards' ? 'Нет архивных карточек' : 'Нет архивных списков' }}
          </div>

          <template v-else>
            <div
              v-for="item in items"
              :key="item.id"
              class="archive-item"
            >
              <div class="item-info" @click="activeTab === 'cards' && onCardClick(item)">
                <div class="item-name" :class="{ clickable: activeTab === 'cards' }">
                  {{ item.name }}
                </div>
                <div v-if="activeTab === 'cards' && item.list" class="item-list-name">
                  {{ getListName(item.list) }}
                </div>
              </div>
              <div class="item-actions">
                <q-btn
                  flat
                  dense
                  size="sm"
                  label="Вернуть"
                  class="action-btn restore-btn"
                  :loading="actionLoading === item.id"
                  @click="unarchiveItem(item)"
                />
                <q-btn
                  flat
                  dense
                  size="sm"
                  label="Удалить"
                  class="action-btn delete-btn"
                  @click="confirmDelete(item)"
                />
              </div>
            </div>

            <div ref="sentinelRef" class="load-sentinel">
              <q-spinner-dots v-if="loading" size="24px" color="white" />
            </div>
          </template>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import { useBoardStore } from 'stores/board.js'

const props = defineProps({
  modelValue: Boolean,
  boardId: Number,
})

const emit = defineEmits(['update:modelValue', 'open-card'])

const q = useQuasar()
const boardStore = useBoardStore()

const activeTab = ref('cards')
const loading = ref(false)
const actionLoading = ref(null)
const scrollAreaRef = ref(null)
const sentinelRef = ref(null)
let observer = null

const items = computed(() =>
  activeTab.value === 'cards' ? boardStore.archivedCards : boardStore.archivedLists,
)
const total = computed(() =>
  activeTab.value === 'cards' ? boardStore.archivedCardsTotal : boardStore.archivedListsTotal,
)
const currentPage = computed(() =>
  activeTab.value === 'cards' ? boardStore.archivedCardsPage : boardStore.archivedListsPage,
)

function close() {
  emit('update:modelValue', false)
}

function switchTab(tab) {
  if (activeTab.value === tab) return
  activeTab.value = tab
  fetchPage(1, true)
}

async function fetchPage(page, reset = false) {
  if (!props.boardId) return
  loading.value = true
  try {
    if (activeTab.value === 'cards') {
      await boardStore.fetchArchivedCards(props.boardId, page, reset)
    } else {
      await boardStore.fetchArchivedLists(props.boardId, page, reset)
    }
  } finally {
    loading.value = false
    nextTick(setupObserver)
  }
}

function onScroll() {
  // Fallback: if IntersectionObserver doesn't fire
}

function setupObserver() {
  if (observer) {
    observer.disconnect()
    observer = null
  }
  if (!sentinelRef.value) return
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && !loading.value && items.value.length < total.value) {
        fetchPage(currentPage.value + 1, false)
      }
    },
    { root: scrollAreaRef.value, threshold: 0.1 },
  )
  observer.observe(sentinelRef.value)
}

function getListName(listRef) {
  const listId = typeof listRef === 'object' ? listRef.id : listRef
  if (!boardStore.currentBoard) return ''
  const list = boardStore.currentBoard.lists.find((l) => l.id === listId)
  if (list) return list.name
  if (typeof listRef === 'object' && listRef.name) return listRef.name
  return ''
}

function onCardClick(card) {
  emit('open-card', card)
}

async function unarchiveItem(item) {
  actionLoading.value = item.id
  try {
    if (activeTab.value === 'cards') {
      await boardStore.patchCard(item.id, { isArchived: false })
      q.notify({ message: 'Карточка восстановлена', type: 'positive', position: 'top', timeout: 1500 })
    } else {
      await boardStore.patchList(item.id, { isArchived: false })
      q.notify({ message: 'Список восстановлен', type: 'positive', position: 'top', timeout: 1500 })
    }
  } finally {
    actionLoading.value = null
  }
}

function confirmDelete(item) {
  const label = activeTab.value === 'cards' ? 'карточку' : 'список'
  q.dialog({
    title: 'Удаление',
    message: `Удалить ${label} "${item.name}" навсегда?`,
    cancel: { flat: true, label: 'Отмена' },
    ok: { color: 'negative', label: 'Удалить' },
    persistent: true,
  }).onOk(async () => {
    actionLoading.value = item.id
    try {
      if (activeTab.value === 'cards') {
        await boardStore.deleteCard(item.id)
        q.notify({ message: 'Карточка удалена', type: 'positive', position: 'top', timeout: 1500 })
      } else {
        await boardStore.deleteList(item.id)
        q.notify({ message: 'Список удалён', type: 'positive', position: 'top', timeout: 1500 })
      }
    } finally {
      actionLoading.value = null
    }
  })
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      activeTab.value = 'cards'
      fetchPage(1, true)
    } else {
      if (observer) {
        observer.disconnect()
        observer = null
      }
    }
  },
)

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped lang="scss">
.archive-sidebar-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: flex-end;
}

.archive-sidebar {
  width: 340px;
  max-width: 90vw;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(20, 18, 50, 0.92);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1rem 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
}

.close-btn {
  color: rgba(255, 255, 255, 0.5);
  &:hover {
    color: #fff;
  }
}

.sidebar-tabs {
  display: flex;
  gap: 0;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.tab-btn {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:first-child {
    border-radius: 8px 0 0 8px;
  }
  &:last-child {
    border-radius: 0 8px 8px 0;
    border-left: none;
  }

  &.active {
    background: rgba(139, 92, 246, 0.25);
    border-color: rgba(139, 92, 246, 0.4);
    color: #fff;
  }

  &:hover:not(.active) {
    background: rgba(255, 255, 255, 0.05);
  }
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
}

.sidebar-loading,
.sidebar-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
}

.archive-item {
  padding: 0.75rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 0.5rem;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.07);
  }
}

.item-info {
  margin-bottom: 0.5rem;
}

.item-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
  word-break: break-word;

  &.clickable {
    cursor: pointer;
    &:hover {
      color: rgba(139, 92, 246, 1);
    }
  }
}

.item-list-name {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.45);
  margin-top: 0.2rem;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  font-size: 0.78rem;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  text-transform: none;
}

.restore-btn {
  color: rgba(139, 92, 246, 1);
  background: rgba(139, 92, 246, 0.12);

  &:hover {
    background: rgba(139, 92, 246, 0.22);
  }
}

.delete-btn {
  color: rgba(239, 68, 68, 0.9);
  background: rgba(239, 68, 68, 0.1);

  &:hover {
    background: rgba(239, 68, 68, 0.2);
  }
}

.load-sentinel {
  display: flex;
  justify-content: center;
  padding: 0.75rem;
  min-height: 40px;
}

// Slide transition
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-active .archive-sidebar,
.slide-right-leave-active .archive-sidebar {
  transition: transform 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  opacity: 0;
}

.slide-right-enter-from .archive-sidebar,
.slide-right-leave-to .archive-sidebar {
  transform: translateX(100%);
}
</style>
