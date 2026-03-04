<template>
  <transition name="slide-right">
    <div v-if="modelValue" class="patterns-sidebar-overlay" @click.self="close">
      <div class="patterns-sidebar">
        <div class="sidebar-header">
          <span class="sidebar-title">Шаблоны карточек</span>
          <q-btn flat round dense size="sm" icon="close" class="close-btn" @click="close" />
        </div>

        <div class="sidebar-content">
          <div v-if="loading" class="sidebar-loading-skeletons q-pa-md">
            <div v-for="i in 5" :key="i" class="q-mb-md">
              <q-skeleton type="text" width="70%" class="bg-white-10 q-mb-xs" dark animation="pulse" />
              <q-skeleton type="rect" width="100%" height="28px" class="bg-white-10" style="border-radius: 6px" dark animation="pulse" />
            </div>
          </div>

          <div v-else-if="patterns.length === 0" class="sidebar-empty">Шаблоны не найдены</div>

          <template v-else>
            <div v-for="pattern in patterns" :key="pattern.id" class="pattern-item">
              <div class="item-name">{{ pattern.name }}</div>

              <div class="item-actions">
                <q-btn
                  flat
                  dense
                  size="sm"
                  label="Изменить"
                  class="action-btn edit-btn"
                  @click="openPatternCard(pattern)"
                />
                <q-btn
                  flat
                  dense
                  size="sm"
                  label="Удалить"
                  class="action-btn delete-btn"
                  :loading="actionLoading === pattern.id"
                  @click="confirmDelete(pattern)"
                />
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useBoardStore } from 'stores/board.js'

const props = defineProps({
  modelValue: Boolean,
})

const emit = defineEmits(['update:modelValue', 'edit-pattern'])
const q = useQuasar()
const boardStore = useBoardStore()

const loading = ref(false)
const actionLoading = ref(null)

const patterns = computed(() => boardStore.getCardPatterns)

function close() {
  emit('update:modelValue', false)
}

function openPatternCard(pattern) {
  emit('edit-pattern', pattern)
  close()
}

function confirmDelete(pattern) {
  q.dialog({
    title: 'Удаление шаблона',
    message: `Удалить шаблон "${pattern.name}"?`,
    cancel: { flat: true, label: 'Отмена' },
    ok: { color: 'negative', label: 'Удалить' },
    persistent: true,
  }).onOk(async () => {
    actionLoading.value = pattern.id
    try {
      await boardStore.deleteCardPattern(pattern.id)
      q.notify({ message: 'Шаблон удалён', type: 'positive', position: 'top' })
    } catch {
      q.notify({ message: 'Ошибка удаления шаблона', type: 'negative', position: 'top' })
    } finally {
      actionLoading.value = null
    }
  })
}

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return
    loading.value = true
    try {
      await boardStore.fetchCardPatterns()
    } finally {
      loading.value = false
    }
  },
)
</script>

<style scoped lang="scss">
.patterns-sidebar-overlay {
  position: fixed;
  inset: 0;
  z-index: 2100;
  background: rgba(0, 0, 0, 0.42);
  display: flex;
  justify-content: flex-end;
}

.patterns-sidebar {
  width: 360px;
  max-width: 92vw;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(20, 18, 50, 0.94);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-title {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
}

.close-btn {
  color: rgba(255, 255, 255, 0.56);
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
}

.pattern-item {
  padding: 0.72rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 0.5rem;
}

.item-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
}

.item-actions {
  margin-top: 0.6rem;
  display: flex;
  gap: 0.45rem;
}

.action-btn {
  text-transform: none;
  border-radius: 6px;
}

.edit-btn {
  color: #93c5fd;
  background: rgba(59, 130, 246, 0.14);
}

.delete-btn {
  color: #f87171;
  background: rgba(239, 68, 68, 0.12);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-active .patterns-sidebar,
.slide-right-leave-active .patterns-sidebar {
  transition: transform 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  opacity: 0;
}

.slide-right-enter-from .patterns-sidebar,
.slide-right-leave-to .patterns-sidebar {
  transform: translateX(100%);
}
</style>
