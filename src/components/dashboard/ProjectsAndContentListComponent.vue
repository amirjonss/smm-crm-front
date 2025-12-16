<template>
  <div class="projects-content-section" v-if="props.parentSelectedUserId">
    <div class="section-header">
      <h2 class="section-title">
        <q-icon name="work" class="section-icon" />
        Проекты и контент-планы
      </h2>
    </div>

    <div class="content-grid">
      <!-- Projects List Card -->
      <div class="grid-item">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <q-icon name="folder" class="card-icon card-icon-blue" />
              Проекты пользователя
            </h3>
            <span class="card-count">{{ projectStore.getProjects.length }}</span>
          </div>
          <div class="card-body no-padding">
            <div v-if="projectStore.getProjects.length === 0" class="empty-state">
              <q-icon name="folder_off" class="empty-state-icon" />
              <p class="empty-state-text">Проекты не найдены</p>
            </div>
            
            <!-- Mobile Cards View -->
            <div v-else class="mobile-cards show-mobile-only">
              <div
                v-for="(item, index) in projectStore.getProjects"
                :key="index"
                class="mobile-card"
                :class="{ 'mobile-card-selected': item.id === selectedProjectId }"
              >
                <div class="mobile-card-header">
                  <span class="mobile-card-title">{{ item.name }}</span>
                  <q-btn
                    flat
                    round
                    dense
                    size="sm"
                    :icon="item.id === selectedProjectId ? 'check_circle' : 'radio_button_unchecked'"
                    :color="item.id === selectedProjectId ? 'primary' : 'grey-6'"
                    @click="setProject(item)"
                  >
                    <q-tooltip>{{ item.id === selectedProjectId ? 'Выбрано' : 'Выбрать' }}</q-tooltip>
                  </q-btn>
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
            <q-markup-table v-if="projectStore.getProjects.length > 0" flat class="modern-table hide-mobile-only">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Проект</th>
                  <th>Менеджер</th>
                  <th>Телефон</th>
                  <th>Дата</th>
                  <th>Действие</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in projectStore.getProjects"
                  :key="index"
                  :class="{ 'selected-row': item.id === selectedProjectId }"
                >
                  <td>{{ index + 1 }}</td>
                  <td class="project-name">{{ item.name }}</td>
                  <td>{{ item.executor?.givenName || '-' }}</td>
                  <td>{{ item.phone }}</td>
                  <td>{{ item.createdAt?.slice(0, 10) || '-' }}</td>
                  <td>
                    <q-btn
                      flat
                      round
                      dense
                      size="sm"
                      :icon="item.id === selectedProjectId ? 'check_circle' : 'radio_button_unchecked'"
                      :color="item.id === selectedProjectId ? 'primary' : 'grey-6'"
                      @click="setProject(item)"
                    >
                      <q-tooltip>{{ item.id === selectedProjectId ? 'Выбрано' : 'Выбрать' }}</q-tooltip>
                    </q-btn>
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>
        </div>
      </div>

      <!-- Content Plans List Card -->
      <div class="grid-item">
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
            <div v-else class="mobile-cards show-mobile-only">
              <div
                v-for="(item, index) in contentPlanStore.getContentPlans"
                :key="index"
                class="mobile-card"
              >
                <div class="mobile-card-header">
                  <span class="mobile-card-title">{{ item.post }}</span>
                  <span class="format-badge">{{ item.format }}</span>
                </div>
                <div class="mobile-card-body">
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
            </div>
            
            <!-- Desktop Table View -->
            <q-markup-table v-if="contentPlanStore.getContentPlans.length > 0" flat class="modern-table hide-mobile-only">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Пост</th>
                  <th>Формат</th>
                  <th>Идея</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in contentPlanStore.getContentPlans" :key="index">
                  <td>{{ index + 1 }}</td>
                  <td class="post-name">{{ item.post }}</td>
                  <td>
                    <span class="format-badge">{{ item.format }}</span>
                  </td>
                  <td class="idea-cell">{{ item.idea }}</td>
                  <td>{{ item.date?.slice(0, 10) || '-' }}</td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useProjectStore } from 'stores/project.js'
import { useContentPlanStore } from 'stores/content-plan.js'
import PdfPrinterComponent from 'components/PdfPrinterComponent.vue'

const projectStore = useProjectStore()
const contentPlanStore = useContentPlanStore()
const selectedProjectId = ref(null)
const selectedProject = ref(null)

const props = defineProps({
  parentSelectedUserId: {
    default: null
  }
})

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

watch(() => props.parentSelectedUserId, async (newId) => {
  if (newId == null) {
    projectStore.clearProjects()
    selectedProjectId.value = null
    selectedProject.value = null
  } else {
    await projectStore.fetchProjectsByUser(newId)
  }
})
</script>

<style scoped lang="scss">
.projects-content-section {
  margin-top: 0.5rem;
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

.content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;

  @media (max-width: 1023px) {
    grid-template-columns: 1fr;
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
  
  :deep(thead tr th) {
    background: transparent !important;
    color: var(--text-muted) !important;
    font-weight: 500;
    font-size: 0.6875rem;
    border-top: none !important;
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

.project-name,
.post-name {
  font-weight: 500;
  color: var(--text-primary);
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
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  padding: 1rem;
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
  margin-bottom: 0.75rem;
  gap: 0.5rem;
}

.mobile-card-title {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-primary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-light);
}

.mobile-card-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  gap: 0.5rem;
}

.mobile-card-label {
  color: var(--text-muted);
  min-width: 80px;
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

// Table horizontal scroll on small screens
@media (min-width: 768px) and (max-width: 1023px) {
  .card-body.no-padding {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .modern-table {
    min-width: 600px;
  }
}
</style>
