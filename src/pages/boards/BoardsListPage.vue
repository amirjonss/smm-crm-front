<template>
  <q-page class="boards-list-page">
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Доски</h1>
        </div>
        <q-btn
          v-if="userStore.canCreateBoard"
          unelevated
          icon="add"
          label="Новая доска"
          no-caps
          class="btn-create"
          @click="openCreateDialog"
        />
      </div>

      <div v-if="isPageLoading" class="boards-grid">
        <div v-for="i in 4" :key="'skel-board-' + i" class="skeleton-board-card">
          <div class="skeleton-board-header">
            <q-skeleton type="text" width="70%" class="text-h6 bg-white-10" dark animation="pulse" />
          </div>
          <div class="skeleton-board-stats">
            <q-skeleton type="text" width="40%" class="bg-white-10" dark animation="pulse" />
            <q-skeleton type="text" width="40%" class="bg-white-10" dark animation="pulse" />
          </div>
          <div class="skeleton-board-footer">
            <q-skeleton type="text" width="50%" class="bg-white-10" dark animation="pulse" />
          </div>
        </div>
      </div>

      <div v-else-if="boardStore.getBoards.length === 0" class="empty-state">
        <q-icon name="dashboard" class="empty-state-icon" />
        <p class="empty-state-text">Досок пока нет</p>
        <q-btn
          v-if="userStore.canCreateBoard"
          unelevated
          label="Создать первую доску"
          no-caps
          class="q-mt-md btn-create"
          @click="openCreateDialog"
        />
      </div>

      <div v-else class="boards-grid">
        <board-card
          v-for="board in boardStore.getBoards"
          :key="board.id"
          :board="board"
          @click="router.push('/boards/' + board.id)"
          @edit="openEditDialog(board)"
          @delete="confirmDelete(board)"
        />
      </div>

      <board-dialog v-model="showDialog" :board="editingBoard" @save="saveBoard" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useBoardStore } from 'stores/board.js'
import { useUserStore } from 'stores/user.js'
import BoardCard from 'components/boards/BoardCard.vue'
import BoardDialog from 'components/boards/BoardDialog.vue'

const router = useRouter()
const q = useQuasar()
const boardStore = useBoardStore()
const userStore = useUserStore()

const showDialog = ref(false)
const editingBoard = ref(null)
const isPageLoading = ref(true)

function openCreateDialog() {
  editingBoard.value = null
  showDialog.value = true
}

function openEditDialog(board) {
  editingBoard.value = board
  showDialog.value = true
}

function saveBoard(data) {
  if (editingBoard.value) {
    boardStore.patchBoard(editingBoard.value.id, data).then(() => {
      q.notify({ message: 'Доска обновлена', type: 'positive', position: 'top' })
    })
  } else {
    boardStore.createBoard(data).then(() => {
      q.notify({ message: 'Доска создана', type: 'positive', position: 'top' })
    })
  }
  editingBoard.value = null
}

function confirmDelete(board) {
  q.dialog({
    title: 'Удаление доски',
    message: `Вы уверены, что хотите удалить доску "${board.name}"?`,
    cancel: { flat: true, label: 'Отмена' },
    ok: { color: 'negative', label: 'Удалить' },
    persistent: true,
  }).onOk(() => {
    boardStore.deleteBoard(board.id).then(() => {
      q.notify({ message: 'Доска удалена', type: 'positive', position: 'top' })
    })
  })
}

onMounted(async () => {
  isPageLoading.value = true
  try {
    await boardStore.fetchBoards()
  } finally {
    isPageLoading.value = false
  }
})
</script>

<style scoped lang="scss">
.skeleton-board-card {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
}
.skeleton-board-header {
  margin-bottom: 1rem;
}
.skeleton-board-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
}
.skeleton-board-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 0.75rem;
  margin-top: auto;
}
.bg-white-10 {
  background: rgba(255, 255, 255, 0.1) !important;
}

.boards-list-page {
  padding: 0;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  min-height: 100vh;
  position: relative;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.5rem;

  @media (max-width: 599px) {
    padding: 1rem;
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;

  @media (max-width: 599px) {
    flex-direction: column;
    margin-bottom: 1.25rem;
  }
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 0.25rem;

  @media (max-width: 599px) {
    font-size: 1.5rem;
  }
}

.page-subtitle {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.btn-create {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  font-weight: 500;
  padding: 0.5rem 1.25rem;
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.18);
  }
}

.boards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;

  @media (max-width: 1023px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 599px) {
    grid-template-columns: 1fr;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1.5rem;
  text-align: center;
}

.empty-state-icon {
  font-size: 4rem;
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 1rem;
}

.empty-state-text {
  color: rgba(255, 255, 255, 0.5);
  font-size: 1rem;
  margin: 0;
}
</style>
