<template>
  <div class="projects-content-section">
    <!-- Projects List Card -->
    <div class="projects-wrapper grid-item">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <q-icon name="folder" class="card-icon card-icon-blue" />
            Проекты пользователя
          </h3>
          <span class="card-count">{{ projectStore.getProjects.length }}</span>
        </div>
        <div class="card-body no-padding">
          <div v-if="!props.parentSelectedUserId" class="empty-state">
            <q-icon name="person_search" class="empty-state-icon" />
            <p class="empty-state-text">Выберите пользователя из списка слева</p>
          </div>
          <div v-else-if="projectStore.getProjects.length === 0" class="empty-state">
            <q-icon name="folder_off" class="empty-state-icon" />
            <p class="empty-state-text">Проекты не найдены</p>
          </div>

          <!-- Mobile Cards View -->
          <div v-else class="mobile-cards show-mobile-only">
            <div
              v-for="(item, index) in projectStore.getProjects"
              :key="index"
              class="mobile-card cursor-pointer"
              :class="{ 'mobile-card-selected': item.id === selectedProjectId }"
              @click="setProject(item)"
            >
              <div class="mobile-card-header">
                <span class="mobile-card-title">{{ item.name }}</span>
                <q-icon
                  :name="item.id === selectedProjectId ? 'check_circle' : 'radio_button_unchecked'"
                  :color="item.id === selectedProjectId ? 'primary' : 'grey-5'"
                  size="20px"
                />
              </div>
              <div class="mobile-card-body">
                <div class="mobile-card-row">
                  <span class="mobile-card-label">Менеджер:</span>
                  <span>{{ item.executor?.givenName || '-' }}</span>
                </div>
                <div class="mobile-card-row">
                  <span class="mobile-card-label">Телефон:</span>
                  <span>{{ item.phone }}</span>
                </div>
                <div class="mobile-card-row">
                  <span class="mobile-card-label">Дата:</span>
                  <span>{{ item.createdAt?.slice(0, 10) || '-' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Desktop Table View -->
          <q-markup-table
            v-if="projectStore.getProjects.length > 0"
            flat
            class="modern-table hide-mobile-only"
          >
            <thead>
              <tr>
                <th>#</th>
                <th>Проект</th>
                <th>Менеджер</th>
                <th>Телефон</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in projectStore.getProjects"
                :key="index"
                :class="{ 'selected-row': item.id === selectedProjectId }"
                @click="setProject(item)"
                class="cursor-pointer"
              >
                <td>{{ index + 1 }}</td>
                <td class="project-name">{{ item.name }}</td>
                <td>{{ item.executor?.givenName || '-' }}</td>
                <td>{{ item.phone }}</td>
                <td>{{ item.createdAt?.slice(0, 10) || '-' }}</td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>
      </div>
    </div>

    <!-- Content Plans List Card -->
    <div class="content-plans-wrapper grid-item">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <q-icon name="list_alt" class="card-icon card-icon-green" />
            Контент-планы
          </h3>
          <div class="card-header-actions">
            <span class="card-count">{{ contentPlanStore.getContentPlans.length }}</span>
            <pdf-printer-component
              v-if="contentPlanStore.getContentPlans.length > 0"
              :selected-project-id="selectedProjectId"
              :selected-project="selectedProject"
              :content-plans="contentPlanStore.getContentPlans"
            />
          </div>
        </div>
        <div class="card-body no-padding">
          <div v-if="contentPlanStore.getContentPlans.length === 0" class="empty-state">
            <q-icon name="article" class="empty-state-icon" />
            <p class="empty-state-text">
              {{ selectedProjectId ? 'Контент-план пуст' : 'Выберите проект' }}
            </p>
          </div>

          <!-- Mobile Cards View -->
          <draggable
            v-else
            v-model="contentPlansList"
            item-key="id"
            class="mobile-cards show-mobile-only"
            handle=".drag-handle-wrapper"
            :force-fallback="true"
            ghost-class="drag-ghost"
            drag-class="drag-fallback"
            :disabled="userStore.isAdmin"
          >
            <template #item="{ element: item }">
              <div class="mobile-card">
                <div class="mobile-card-header">
                  <div v-if="!userStore.isAdmin" class="drag-handle-wrapper q-mr-sm">
                    <q-icon name="drag_handle" size="20px" color="grey-6" style="cursor: grab" />
                  </div>
                  <span class="mobile-card-title">{{ item.post }}</span>
                  <div class="row items-center q-gutter-x-xs">
                    <span class="format-badge">{{ item.format }}</span>
                  </div>
                </div>
                <div class="mobile-card-body">
                  <div v-if="item.platforms?.length" class="mobile-card-row">
                    <span class="mobile-card-label">Платформы:</span>
                    <div class="platform-icons-row">
                      <div
                        v-for="p in item.platforms"
                        :key="p.name"
                        class="platform-status-wrapper"
                        :class="`status-${p.status}`"
                      >
                        <q-icon
                          :name="PLATFORM_ICONS[p.name]"
                          size="14px"
                          :style="{ color: PLATFORM_COLORS[p.name] }"
                        />
                        <div v-if="getStatusIcon(p.status)" class="status-indicator-icon">
                          <q-icon :name="getStatusIcon(p.status)" size="8px" />
                        </div>
                        <q-tooltip class="glass-tooltip" :offset="[0, 8]">
                          {{ PLATFORM_LABELS[p.name] }}: {{ STATUS_LABELS[p.status] }}
                        </q-tooltip>
                      </div>
                    </div>
                  </div>
                  <div class="mobile-card-row">
                    <span class="mobile-card-label">Идея:</span>
                    <span class="mobile-card-idea">{{ item.idea }}</span>
                  </div>
                  <div class="mobile-card-row">
                    <span class="mobile-card-label">Дата:</span>
                    <span>{{ item.date?.slice(0, 10) || '-' }}</span>
                  </div>
                </div>
              </div>
            </template>
          </draggable>

          <!-- Desktop Table View -->
          <q-markup-table
            v-if="contentPlanStore.getContentPlans.length > 0"
            flat
            class="modern-table hide-mobile-only"
          >
            <thead>
              <tr>
                <th>#</th>
                <th>Пост</th>
                <th>Формат</th>
                <th>Платформы</th>
                <th>Идея</th>
                <th>Дата</th>
              </tr>
            </thead>
            <draggable
              v-model="contentPlansList"
              tag="tbody"
              item-key="id"
              :disabled="userStore.isAdmin"
            >
              <template #item="{ element: item, index }">
                <tr :style="!userStore.isAdmin ? 'cursor: grab' : ''">
                  <td>{{ index + 1 }}</td>
                  <td class="post-name">{{ item.post }}</td>
                  <td>
                    <span class="format-badge">{{ item.format }}</span>
                  </td>
                  <td class="platforms-cell">
                    <div class="platform-icons-row">
                      <div
                        v-for="p in item.platforms"
                        :key="p.name"
                        class="platform-status-wrapper"
                        :class="`status-${p.status}`"
                      >
                        <q-icon
                          :name="PLATFORM_ICONS[p.name]"
                          size="16px"
                          :style="{ color: PLATFORM_COLORS[p.name] }"
                        />
                        <div v-if="getStatusIcon(p.status)" class="status-indicator-icon">
                          <q-icon :name="getStatusIcon(p.status)" size="8px" />
                        </div>
                        <q-tooltip class="glass-tooltip" :offset="[0, 8]">
                          {{ PLATFORM_LABELS[p.name] }}: {{ STATUS_LABELS[p.status] }}
                        </q-tooltip>
                      </div>
                      <span v-if="!item.platforms?.length" class="text-grey-6">—</span>
                    </div>
                  </td>
                  <td class="idea-cell">{{ item.idea }}</td>
                  <td>{{ item.date?.slice(0, 10) || '-' }}</td>
                </tr>
              </template>
            </draggable>
          </q-markup-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useProjectStore } from 'stores/project.js'
import { useContentPlanStore } from 'stores/content-plan.js'
import { useUserStore } from 'stores/user.js'
import PdfPrinterComponent from 'components/PdfPrinterComponent.vue'
import draggable from 'vuedraggable'
import {
  PLATFORM_ICONS,
  PLATFORM_COLORS,
  PLATFORM_LABELS,
  STATUS_LABELS,
  STATUS
} from '@/constants/status'

const projectStore = useProjectStore()
const contentPlanStore = useContentPlanStore()
const userStore = useUserStore()
const selectedProjectId = ref(null)
const selectedProject = ref(null)

const props = defineProps({
  parentSelectedUserId: {
    default: null,
  },
})

function getStatusIcon(status) {
  switch (status) {
    case STATUS.PUBLISHED:
      return 'check'
    case STATUS.CANCELED:
      return 'close'
    case STATUS.RESCHEDULED:
      return 'schedule'
    default:
      return ''
  }
}

const contentPlansList = computed({
  get: () => contentPlanStore.getContentPlans,
  set: (val) => {
    contentPlanStore.setContentPlans(val)
    updateOrder(val)
  },
})

function updateOrder(items) {
  items.forEach((item, index) => {
    // Check if position changed to avoid unnecessary requests
    // We assume backend uses 'position' field.
    if (item.position !== index) {
      // Optimistically update local item position to avoid repeated updates if drag happens quickly
      item.position = index
      contentPlanStore.patchContentPlan({ position: index }, item.id)
    }
  })
}

function setProject(project) {
  if (project.id === selectedProjectId.value) {
    selectedProjectId.value = null
    selectedProject.value = null
  } else {
    selectedProjectId.value = project.id
    selectedProject.value = project
  }
}

watch(selectedProjectId, () => {
  if (selectedProjectId.value != null) {
    contentPlanStore.fetchContentPlan(selectedProjectId.value)
  } else {
    contentPlanStore.clearContentPlans()
  }
})

watch(
  () => props.parentSelectedUserId,
  async (newId) => {
    if (newId == null) {
      projectStore.clearProjects()
      selectedProjectId.value = null
      selectedProject.value = null
    } else {
      selectedProjectId.value = null
      selectedProject.value = null
      await projectStore.fetchProjectsByUser(newId)
    }
  },
)
</script>

<style scoped lang="scss">
.projects-content-section {
  display: contents;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-icon {
  color: #3b82f6;
}

.projects-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.content-plan-full-width {
  width: 100%;
}

.projects-wrapper {
  .card-body {
    min-height: 500px;
    max-height: 500px;
    overflow-y: auto;

    @media (max-width: 1023px) {
      min-height: auto;
    }
  }
}

.grid-item {
  min-width: 0;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: none;

  @media (max-width: 599px) {
    padding: 1rem;
  }
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-icon {
  font-size: 1.25rem;
}

.card-icon-blue {
  color: #3b82f6;
}

.card-icon-green {
  color: #22c55e;
}

.card-count {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.625rem;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border-radius: 9999px;
}

.card-header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-body {
  padding: 1.5rem;

  @media (max-width: 599px) {
    padding: 1rem;
  }

  &.no-padding {
    padding: 0;
  }
}

.modern-table {
  background: transparent;
  border: none;
  width: 100%;

  :deep(thead tr th) {
    background: transparent !important;
    color: var(--text-muted) !important;
    font-weight: 500;
    font-size: 0.6875rem;
    border-top: none !important;
    text-align: left !important;
  }

  :deep(tbody tr td) {
    text-align: left !important;
  }

  :deep(tbody tr) {
    &:nth-child(even) {
      background-color: var(--bg-tertiary);
    }

    &:hover {
      background-color: var(--bg-hover) !important;
    }
  }
}

.project-name {
  font-weight: 500;
  color: var(--text-primary);
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-name {
  font-weight: 500;
  color: var(--text-primary);
  max-width: 200px;
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.format-badge {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0.25rem 0.5rem;
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  border-radius: 4px;
}

.idea-cell {
  max-width: 250px;
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.selected-row {
  background-color: rgba(59, 130, 246, 0.1) !important;
  border-left: 3px solid #3b82f6;
}

.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  color: var(--text-muted);
}

.empty-state-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
  opacity: 0.4;
}

.empty-state-text {
  font-size: 0.875rem;
  margin: 0;
}

.action-btn {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }
}

// Responsive visibility
.hide-mobile-only {
  @media (max-width: 767px) {
    display: none !important;
  }
}

.show-mobile-only {
  display: none !important;

  @media (max-width: 767px) {
    display: block !important;
  }
}

.hide-mobile {
  @media (max-width: 767px) {
    display: none;
  }
}

// Mobile Cards
.mobile-cards {
  padding: 0.75rem;
}

.mobile-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.875rem;
  margin-bottom: 0.75rem;
  transition: all 0.2s ease;

  &:last-child {
    margin-bottom: 0;
  }


}

.mobile-card-selected {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.mobile-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  gap: 0.5rem;
}

.mobile-card-title {
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--text-primary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.mobile-card-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.8125rem;
  gap: 0.5rem;
}

.mobile-card-label {
  color: var(--text-muted);
  min-width: 70px;
}

.mobile-card-idea {
  color: var(--text-secondary);
  text-align: right;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// Mobile responsive
@media (max-width: 599px) {
  .section-title {
    font-size: 1rem;
  }

  .card-title {
    font-size: 0.875rem;
  }

  .action-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
  }

  .modern-table :deep(td),
  .modern-table :deep(th) {
    padding: 0.75rem 0.5rem;
    font-size: 0.8125rem;
  }
}

// Table horizontal scroll
.card-body.no-padding {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.modern-table {
  min-width: 100%;
}

.drag-ghost {
  opacity: 0.5;
  background: var(--bg-tertiary);
  border: 2px dashed #3b82f6;
}

.drag-fallback {
  opacity: 1 !important;
  background: var(--bg-card);
  border: 1px solid #3b82f6;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transform: scale(1.02);
}

.platform-status-wrapper {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border: 2px solid transparent;
  transition: all 0.2s ease-out;
  cursor: pointer;
  position: relative;
  user-select: none;

  &.status-PUBLISHED {
    border-color: #22c55e;
    background: rgba(34, 197, 94, 0.1);
  }
  &.status-CANCELED {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }
  &.status-NOT_PUBLISHED {
    border-color: #9ca3af;
    background: rgba(156, 163, 175, 0.1);
  }
  &.status-RESCHEDULED {
    border-color: #f97316;
    background: rgba(249, 115, 22, 0.1);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    z-index: 10;
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.status-indicator-icon {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  z-index: 2;

  .status-PUBLISHED & {
    color: #22c55e;
    border-color: #22c55e;
    background: #ecfdf5; 
  }
  .status-CANCELED & {
    color: #ef4444;
    border-color: #ef4444;
    background: #fef2f2;
  }
  .status-RESCHEDULED & {
    color: #f97316;
    border-color: #f97316;
    background: #fff7ed;
  }
}

.platforms-cell {
  min-width: 0;
}

.platform-icons-row {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-wrap: wrap;
}
</style>
