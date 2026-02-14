<template>
  <div class="board-card" @click="$emit('click')">
    <div class="board-card-header">
      <div class="board-card-name">{{ board.name }}</div>
      <div v-if="userStore.canDeleteBoard" class="board-card-actions" @click.stop>
        <q-btn flat round dense size="sm" icon="edit" class="action-btn" @click="$emit('edit')">
          <q-tooltip>Редактировать</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          dense
          size="sm"
          icon="delete_outline"
          class="action-btn action-btn-danger"
          @click="$emit('delete')"
        >
          <q-tooltip>Удалить</q-tooltip>
        </q-btn>
      </div>
    </div>

    <div class="board-card-stats">
      <div class="board-stat">
        <q-icon name="view_column" size="14px" />
        <span>{{ listCount }} {{ listWord }}</span>
      </div>
      <div class="board-stat">
        <q-icon name="style" size="14px" />
        <span>{{ cardCount }} {{ cardWord }}</span>
      </div>
    </div>

    <div class="board-card-footer">
      <span class="board-card-date">{{ formattedDate }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from 'stores/user.js'

const props = defineProps({
  board: { type: Object, required: true },
})

defineEmits(['click', 'edit', 'delete'])

const userStore = useUserStore()

const listCount = computed(() => props.board.lists?.filter((l) => !l.isArchived).length || 0)
const cardCount = computed(() => {
  if (!props.board.lists) return 0
  return props.board.lists.reduce((sum, l) => sum + (l.cards?.length || 0), 0)
})

const listWord = computed(() => {
  const n = listCount.value
  if (n === 1) return 'список'
  if (n >= 2 && n <= 4) return 'списка'
  return 'списков'
})

const cardWord = computed(() => {
  const n = cardCount.value
  if (n === 1) return 'карточка'
  if (n >= 2 && n <= 4) return 'карточки'
  return 'карточек'
})

const formattedDate = computed(() => {
  if (!props.board.createdAt) return ''
  return new Date(props.board.createdAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
})
</script>

<style scoped lang="scss">
.board-card {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(139, 92, 246, 0.4);
    box-shadow: 0 8px 32px rgba(139, 92, 246, 0.15);
    transform: translateY(-2px);
  }
}

.board-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.board-card-name {
  font-size: 1.0625rem;
  font-weight: 600;
  color: #fff;
  word-break: break-word;
  flex: 1;
  margin-right: 0.5rem;
}

.board-card-actions {
  display: flex;
  gap: 0.125rem;
  flex-shrink: 0;
}

.action-btn {
  color: rgba(255, 255, 255, 0.4);

  &:hover {
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.1);
  }
}

.action-btn-danger:hover {
  background: rgba(239, 68, 68, 0.15) !important;
  color: #ef4444 !important;
}

.board-card-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.board-stat {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.5);
}

.board-card-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 0.75rem;
}

.board-card-date {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
}
</style>
