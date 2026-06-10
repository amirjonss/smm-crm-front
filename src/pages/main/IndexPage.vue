<template>
  <q-page class="index-page">
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">Мои проекты</h1>
        <p class="page-subtitle">Управление проектами и контент-планами</p>
      </div>

      <div v-if="isInitialLoading" class="index-skeleton-loading">
        <!-- Stats Skeletons -->
        <div class="stats-grid q-mb-xl">
          <div v-for="i in 4" :key="'stat-'+i" class="stat-card">
            <q-skeleton type="QAvatar" size="48px" class="bg-white-10" dark animation="pulse" />
            <div class="stat-content q-ml-md" style="flex:1">
              <q-skeleton type="text" width="40%" class="bg-white-10 q-mb-xs" dark animation="pulse" />
              <q-skeleton type="text" width="60%" class="bg-white-10" dark animation="pulse" />
            </div>
          </div>
        </div>
        <!-- Search and List Skeletons -->
        <div class="controls-row q-mb-md">
          <q-skeleton type="rect" width="100%" height="40px" class="bg-white-10" style="border-radius:8px" dark animation="pulse" />
        </div>
        <div v-for="i in 3" :key="'proj-'+i" class="q-mb-md">
          <q-skeleton type="rect" width="100%" height="60px" class="bg-white-10" style="border-radius:12px" dark animation="pulse" />
        </div>
      </div>

      <template v-else>
      <!-- Stats Cards -->
      <div class="stats-grid q-mb-xl">
        <div class="stat-card">
          <div class="stat-icon stat-icon-blue">
            <q-icon name="today" size="1.5rem" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ todaysContentPlans.length }}</span>
            <span class="stat-label">Сегодня</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-purple">
            <q-icon name="date_range" size="1.5rem" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ weekCount }}</span>
            <span class="stat-label">На неделю</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-green">
            <q-icon name="calendar_month" size="1.5rem" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ monthCount }}</span>
            <span class="stat-label">На месяц</span>
          </div>
        </div>
      </div>

      <!-- Today's Content Plan Table -->
      <div class="q-mb-xl">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">
              <q-icon name="today" class="card-icon" />
              План на сегодня
              <span class="card-count q-ml-sm">{{ todaysContentPlans.length }}</span>
            </h2>
          </div>
          <div class="card-body no-padding" style="min-height: auto; max-height: 400px">
            <div v-if="todaysContentPlans.length === 0" class="empty-state">
              <q-icon name="event_busy" class="empty-state-icon" />
              <p class="empty-state-text">На сегодня планов нет</p>
            </div>

            <template v-else>
              <!-- Mobile Cards View -->
              <div class="mobile-cards show-mobile-only">
                <div v-for="plan in todaysContentPlans" :key="plan.id" class="mobile-card">
                  <div class="mobile-card-header">
                    <span class="mobile-card-title">{{ plan.post }}</span>
                    <span class="format-badge">{{ plan.format }}</span>
                  </div>
                  <div class="mobile-card-body">
                    <div class="mobile-card-row">
                      <span class="mobile-card-label">Проект:</span>
                      <div class="row items-center no-wrap q-gutter-x-xs">
                        <span class="project-name">{{ getProjectName(plan.project) }}</span>
                        <span v-if="!getProjectActive(plan.project)" class="inactive-badge">Не активен</span>
                      </div>
                    </div>
                    <div v-if="plan.platforms?.length" class="mobile-card-row">
                      <span class="mobile-card-label">Платформы:</span>
                      <div class="platform-icons-row">
                        <div
                          v-for="p in plan.platforms"
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

                          <q-menu
                            auto-close
                            anchor="top middle"
                            self="bottom middle"
                            class="glass-menu"
                          >
                            <q-list style="min-width: 150px">
                              <q-item
                                v-for="opt in statusOptions"
                                :key="opt.value"
                                clickable
                                v-close-popup
                                @click="setPlatformStatus(plan, p.name, opt.value)"
                                :active="p.status === opt.value"
                                active-class="bg-blue-1 text-primary"
                              >
                                <q-item-section avatar style="min-width: 32px; padding-right: 0">
                                  <q-icon
                                    :name="getStatusIcon(opt.value)"
                                    size="xs"
                                    :color="STATUS_COLORS[opt.value]"
                                  />
                                </q-item-section>
                                <q-item-section>{{ opt.label }}</q-item-section>
                              </q-item>
                            </q-list>
                          </q-menu>

                          <q-tooltip class="glass-tooltip" :offset="[0, 8]">
                            {{ PLATFORM_LABELS[p.name] }}: {{ STATUS_LABELS[p.status] }}
                          </q-tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Desktop Table View -->
              <q-markup-table flat class="modern-table hide-mobile-only">
                <thead>
                  <tr>
                    <th>Проект</th>
                    <th>Пост</th>
                    <th>Формат</th>
                    <th>Платформы</th>
                    <th>Идея</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="plan in todaysContentPlans" :key="plan.id">
                    <td class="project-name">
                      <div class="project-name-cell">
                        <span class="project-name-text">{{ getProjectName(plan.project) }}</span>
                        <span v-if="!getProjectActive(plan.project)" class="inactive-badge">Не активен</span>
                      </div>
                    </td>
                    <td class="post-name">{{ plan.post }}</td>
                    <td>
                      <span class="format-badge">{{ plan.format }}</span>
                    </td>
                    <td class="platforms-cell">
                      <div class="platform-icons-row">
                        <div
                          v-for="p in plan.platforms"
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

                          <q-menu
                            auto-close
                            anchor="top middle"
                            self="bottom middle"
                            class="glass-menu"
                          >
                            <q-list style="min-width: 150px">
                              <q-item
                                v-for="opt in statusOptions"
                                :key="opt.value"
                                clickable
                                v-close-popup
                                @click="setPlatformStatus(plan, p.name, opt.value)"
                                :active="p.status === opt.value"
                                active-class="bg-blue-1 text-primary"
                              >
                                <q-item-section avatar style="min-width: 32px; padding-right: 0">
                                  <q-icon
                                    :name="getStatusIcon(opt.value)"
                                    size="xs"
                                    :color="STATUS_COLORS[opt.value]"
                                  />
                                </q-item-section>
                                <q-item-section>{{ opt.label }}</q-item-section>
                              </q-item>
                            </q-list>
                          </q-menu>

                          <q-tooltip class="glass-tooltip" :offset="[0, 8]">
                            {{ PLATFORM_LABELS[p.name] }}: {{ STATUS_LABELS[p.status] }}
                          </q-tooltip>
                        </div>
                        <span v-if="!plan.platforms?.length" class="text-grey-6">—</span>
                      </div>
                    </td>
                    <td class="idea-cell">{{ plan.idea }}</td>
                  </tr>
                </tbody>
              </q-markup-table>
            </template>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <!-- Projects List Card -->
        <div class="grid-item">
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">
                <q-icon name="folder" class="card-icon" />
                Список проектов
                <span class="card-count q-ml-sm">{{ projectStore.getProjects.length }}</span>
              </h2>
              <div class="card-header-actions">
                <q-btn
                  flat
                  round
                  dense
                  icon="add"
                  class="btn-add-minimal q-mr-sm"
                  @click="openProjectDialog"
                >
                  <q-tooltip>Создать проект</q-tooltip>
                </q-btn>
              </div>
            </div>
            <div class="card-body no-padding">
              <div v-if="projectStore.getProjects.length === 0" class="empty-state">
                <q-icon name="folder_off" class="empty-state-icon" />
                <p class="empty-state-text">Проекты не найдены</p>
              </div>

              <div v-else class="projects-list">
                <div
                  v-for="row in projectStore.getProjects"
                  :key="row.id"
                  class="project-item cursor-pointer"
                  :class="{ 'project-item-selected': row.id === selectedProjectId }"
                  @click="selectProject(row.id)"
                >
                  <div class="project-item-main">
                    <div class="project-item-icon">
                      <q-icon name="folder" size="20px" />
                    </div>
                    <div class="project-item-info">
                      <div class="project-item-name">
                        <span class="project-name-text">{{ row.name }}</span>
                        <span v-if="row.isActive === false" class="inactive-badge">Не активен</span>
                      </div>
                      <div class="project-item-phone">{{ row.phone }}</div>
                    </div>
                    <q-icon
                      v-if="row.id === selectedProjectId"
                      name="check_circle"
                      color="primary"
                      size="20px"
                      class="q-ml-sm"
                    />
                  </div>
                  <div class="project-item-actions">
                    <q-btn
                      flat
                      round
                      dense
                      size="sm"
                      icon="edit"
                      color="grey-6"
                      @click.stop="editProject(row)"
                    >
                      <q-tooltip>Редактировать</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      dense
                      size="sm"
                      icon="delete_outline"
                      color="grey-6"
                      class="action-btn-danger"
                      @click.stop="confirmProjectDeletion(row)"
                    >
                      <q-tooltip>Удалить</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Content Plans List Card -->
        <div class="grid-item">
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">
                <q-icon name="list_alt" class="card-icon" />
                Контент-план
                <span class="card-count q-ml-sm">{{
                  contentPlanStore.getContentPlans.length
                }}</span>
                <span v-if="selectedProject?.isActive === false" class="inactive-badge">Не активен</span>
              </h2>
              <div class="card-header-actions">
                <q-btn
                  flat
                  round
                  dense
                  icon="add"
                  class="btn-add-minimal q-mr-sm"
                  :disable="!selectedProjectId"
                  @click="openContentDialog"
                >
                  <q-tooltip>{{
                    selectedProjectId ? 'Добавить контент' : 'Выберите проект'
                  }}</q-tooltip>
                </q-btn>
                <pdf-printer-component
                  v-if="contentPlanStore.getContentPlans.length > 0"
                  :contentPlans="contentPlanStore.getContentPlans"
                  :selected-project="selectedProject"
                  :selected-project-id="selectedProjectId"
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
                ghost-class="drag-ghost"
                drag-class="drag-fallback"
                :force-fallback="true"
                :fallback-tolerance="3"
                :fallback-on-body="true"
                :animation="200"
                :scroll="true"
                :bubble-scroll="true"
                :scroll-sensitivity="150"
                :scroll-speed="20"
              >
                <template #item="{ element: row }">
                  <div
                    class="mobile-card"
                    :class="{ 'mobile-card-selected': row.id === contentPlanForm.id }"
                  >
                    <div class="mobile-card-header">
                      <div class="drag-handle-wrapper q-mr-sm">
                        <q-icon
                          name="drag_handle"
                          size="20px"
                          color="grey-6"
                          style="cursor: grab"
                        />
                      </div>
                      <span class="mobile-card-title">{{ row.post }}</span>
                      <span class="format-badge">{{ row.format }}</span>
                    </div>
                    <div class="mobile-card-body">
                      <div v-if="row.platforms?.length" class="mobile-card-row">
                        <span class="mobile-card-label">Платформы:</span>
                        <div class="platform-icons-row">
                          <div
                            v-for="p in row.platforms"
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

                            <q-menu
                              auto-close
                              anchor="top middle"
                              self="bottom middle"
                              class="glass-menu"
                            >
                              <q-list style="min-width: 150px">
                                <q-item
                                  v-for="opt in statusOptions"
                                  :key="opt.value"
                                  clickable
                                  v-close-popup
                                  @click="setPlatformStatus(row, p.name, opt.value)"
                                  :active="p.status === opt.value"
                                  active-class="bg-blue-1 text-primary"
                                >
                                  <q-item-section avatar style="min-width: 32px; padding-right: 0">
                                    <q-icon
                                      :name="getStatusIcon(opt.value)"
                                      size="xs"
                                      :color="STATUS_COLORS[opt.value]"
                                    />
                                  </q-item-section>
                                  <q-item-section>{{ opt.label }}</q-item-section>
                                </q-item>
                              </q-list>
                            </q-menu>

                            <q-tooltip class="glass-tooltip" :offset="[0, 8]">
                              {{ PLATFORM_LABELS[p.name] }}: {{ STATUS_LABELS[p.status] }}
                            </q-tooltip>
                          </div>
                        </div>
                      </div>
                      <div class="mobile-card-row">
                        <span class="mobile-card-label">Идея:</span>
                        <span class="mobile-card-idea">{{ row.idea }}</span>
                      </div>
                      <div class="mobile-card-row">
                        <span class="mobile-card-label">Дата:</span>
                        <span>{{ row.date.slice(0, 10) }}</span>
                      </div>
                    </div>
                    <div class="mobile-card-actions">
                      <q-btn
                        flat
                        dense
                        size="sm"
                        icon="edit"
                        label="Изменить"
                        no-caps
                        @click="editContentPlan(row)"
                      />
                      <q-btn
                        flat
                        dense
                        size="sm"
                        icon="delete_outline"
                        label="Удалить"
                        no-caps
                        color="negative"
                        @click="confirmContentPlanDeletion(row.id)"
                      />
                    </div>
                  </div>
                </template>
              </draggable>

              <!-- Desktop Table View (CSS Grid for Trello-like Dragging) -->
              <div
                v-if="contentPlanStore.getContentPlans.length > 0"
                class="modern-table-grid hide-mobile-only"
              >
                <div class="grid-header">
                  <div class="header-cell">#</div>
                  <div class="header-cell">Пост</div>
                  <div class="header-cell">Формат</div>
                  <div class="header-cell">Платформы</div>
                  <div class="header-cell">Идея</div>
                  <div class="header-cell">Дата</div>
                  <div class="header-cell text-right">Действия</div>
                </div>

                <draggable
                  v-model="contentPlansList"
                  tag="div"
                  item-key="id"
                  class="grid-body"
                  ghost-class="drag-ghost"
                  drag-class="drag-fallback"
                  :force-fallback="true"
                  :fallback-tolerance="3"
                  :fallback-on-body="true"
                  :animation="200"
                  :scroll="true"
                  :bubble-scroll="true"
                  :scroll-sensitivity="150"
                  :scroll-speed="20"
                >
                  <template #item="{ element: row, index }">
                    <div
                      :class="{
                        'selected-row': row.id === contentPlanForm.id,
                      }"
                      class="grid-row draggable-row"
                    >
                      <div class="grid-cell text-muted">{{ index + 1 }}</div>
                      <div class="grid-cell post-name">{{ row.post }}</div>
                      <div class="grid-cell">
                        <span class="format-badge">{{ row.format }}</span>
                      </div>
                      <div class="grid-cell platforms-cell">
                        <div class="platform-icons-row">
                          <div
                            v-for="p in row.platforms"
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

                            <q-menu
                              auto-close
                              anchor="top middle"
                              self="bottom middle"
                              class="glass-menu"
                            >
                              <q-list style="min-width: 150px">
                                <q-item
                                  v-for="opt in statusOptions"
                                  :key="opt.value"
                                  clickable
                                  v-close-popup
                                  @click="setPlatformStatus(row, p.name, opt.value)"
                                  :active="p.status === opt.value"
                                  active-class="bg-blue-1 text-primary"
                                >
                                  <q-item-section avatar style="min-width: 32px; padding-right: 0">
                                    <q-icon
                                      :name="getStatusIcon(opt.value)"
                                      size="xs"
                                      :color="STATUS_COLORS[opt.value]"
                                    />
                                  </q-item-section>
                                  <q-item-section>{{ opt.label }}</q-item-section>
                                </q-item>
                              </q-list>
                            </q-menu>

                            <q-tooltip class="glass-tooltip" :offset="[0, 8]">
                              {{ PLATFORM_LABELS[p.name] }}: {{ STATUS_LABELS[p.status] }}
                            </q-tooltip>
                          </div>
                          <span v-if="!row.platforms?.length" class="text-grey-6">—</span>
                        </div>
                      </div>
                      <div class="grid-cell idea-cell">{{ row.idea }}</div>
                      <div class="grid-cell">{{ row.date.slice(0, 10) }}</div>
                      <div class="grid-cell action-buttons justify-end">
                        <q-btn
                          flat
                          round
                          dense
                          size="sm"
                          icon="edit"
                          color="grey-6"
                          @click="editContentPlan(row)"
                        >
                          <q-tooltip>Редактировать</q-tooltip>
                        </q-btn>
                        <q-btn
                          flat
                          round
                          dense
                          size="sm"
                          icon="delete_outline"
                          color="grey-6"
                          class="action-btn-danger"
                          @click="confirmContentPlanDeletion(row.id)"
                        >
                          <q-tooltip>Удалить</q-tooltip>
                        </q-btn>
                      </div>
                    </div>
                  </template>
                </draggable>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Project Dialog -->
      <q-dialog v-model="showProjectDialog" persistent>
        <q-card class="dialog-card">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">
              {{ editingProject ? 'Редактировать проект' : 'Создать проект' }}
            </div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup @click="cancelEdit" />
          </q-card-section>

          <q-card-section class="q-pt-md">
            <q-form @submit.prevent="editingProject ? saveEditedProject() : addToProjectList()">
              <div class="form-group q-mb-md">
                <label class="form-label">Название проекта</label>
                <q-input
                  v-model="form.name"
                  outlined
                  placeholder="Введите название"
                  lazy-rules
                  :rules="[(val) => val.length > 0 || 'Заполните поле']"
                  class="modern-input"
                />
              </div>
              <div class="form-group q-mb-lg">
                <label class="form-label">Телефон</label>
                <q-input
                  v-model="form.phone"
                  outlined
                  mask="998 (##) ### - ## - ##"
                  fill-mask
                  placeholder="998 (__) ___ - __ - __"
                  lazy-rules
                  :rules="[(val) => val.length > 0 || 'Заполните поле']"
                  class="modern-input"
                />
              </div>

              <div class="form-actions row justify-end q-gutter-sm">
                <q-btn
                  flat
                  label="Отмена"
                  color="grey-7"
                  v-close-popup
                  @click="cancelEdit"
                  class="btn-cancel"
                />
                <q-btn
                  type="submit"
                  :label="editingProject ? 'Сохранить' : 'Создать'"
                  unelevated
                  color="primary"
                  class="btn-primary-action"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>
      <!-- Content Dialog -->
      <q-dialog v-model="showContentDialog" persistent>
        <q-card class="dialog-card content-dialog-card">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">
              {{ editingContent ? 'Редактировать контент' : 'Добавить контент' }}
            </div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup @click="cancelContentEdit" />
          </q-card-section>

          <q-card-section class="q-pt-md">
            <q-form @submit.prevent="editingContent ? saveEditedContentPlan() : addToContentList()">
              <div class="form-group q-mb-sm">
                <label class="form-label">Проект</label>
                <q-select
                  v-model="contentPlanForm.projectId"
                  :options="projectOptions"
                  dense
                  outlined
                  emit-value
                  map-options
                  placeholder="Выберите проект"
                  class="modern-input"
                  lazy-rules
                  :rules="[(val) => !!val || 'Выберите проект']"
                />
              </div>

              <div class="form-row-grid">
                <div class="form-group">
                  <label class="form-label">Пост</label>
                  <q-input
                    v-model="contentPlanForm.post"
                    outlined
                    dense
                    placeholder="Название поста"
                    lazy-rules
                    :rules="[(val) => val.length > 0 || 'Заполните поле']"
                    class="modern-input"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Формат</label>
                  <q-select
                    v-model="contentPlanForm.format"
                    :options="options"
                    outlined
                    dense
                    placeholder="Выберите формат"
                    lazy-rules
                    :rules="[(val) => !!val || 'Выберите формат']"
                    class="modern-input"
                  />
                </div>
              </div>

              <div class="form-group q-mb-sm">
                <label class="form-label">Дата</label>
                <q-input
                  v-model="contentPlanForm.date"
                  type="date"
                  outlined
                  dense
                  lazy-rules
                  :rules="[(val) => val.length > 0 || 'Выберите дату']"
                  class="modern-input"
                />
              </div>

              <div class="form-group q-mb-sm">
                <label class="form-label">Идея</label>
                <q-input
                  v-model="contentPlanForm.idea"
                  outlined
                  dense
                  autogrow
                  placeholder="Опишите идею контента"
                  lazy-rules
                  :rules="[(val) => val.length > 0 || 'Заполните поле']"
                  class="modern-input"
                />
              </div>

              <div class="form-group q-mb-md">
                <label class="form-label">Платформы</label>
                <div class="platforms-compact-grid q-mt-xs">
                  <div
                    v-for="platform in platformOptions"
                    :key="platform.value"
                    class="platform-card-mini"
                    :class="{
                      'platform-card-mini-active':
                        contentPlanForm.platforms[platform.value]?.enabled,
                    }"
                    :style="{
                      '--platform-color': PLATFORM_COLORS[platform.value],
                    }"
                    @click="togglePlatform(platform.value)"
                  >
                    <div class="platform-mini-main">
                      <q-icon
                        :name="platform.icon"
                        size="18px"
                        :style="{ color: PLATFORM_COLORS[platform.value] }"
                      />
                      <span class="platform-mini-name">{{ platform.label }}</span>
                      <q-checkbox
                        :model-value="contentPlanForm.platforms[platform.value]?.enabled"
                        @update:model-value="togglePlatform(platform.value)"
                        dense
                        size="xs"
                        class="platform-mini-checkbox"
                        @click.stop
                      />
                    </div>

                    <div
                      v-if="contentPlanForm.platforms[platform.value]?.enabled"
                      class="platform-mini-status"
                      @click.stop
                    >
                      <q-select
                        v-model="contentPlanForm.platforms[platform.value].status"
                        :options="statusOptions"
                        dense
                        outlined
                        emit-value
                        map-options
                        class="status-select-mini"
                        popup-content-class="status-popup-mini"
                      >
                        <template #selected-item="{ opt }">
                          <div class="row items-center no-wrap">
                            <q-badge
                              :color="STATUS_COLORS[opt.value] || 'grey'"
                              rounded
                              class="q-mr-xs"
                              style="width: 6px; height: 6px; min-width: 6px"
                            />
                            <span style="font-size: 10px">{{ opt.label }}</span>
                          </div>
                        </template>
                        <template #option="{ itemProps, opt }">
                          <q-item
                            v-bind="itemProps"
                            dense
                            style="min-height: 28px; padding: 4px 8px"
                          >
                            <q-item-section avatar style="min-width: 20px">
                              <q-badge
                                :color="STATUS_COLORS[opt.value] || 'grey'"
                                rounded
                                style="width: 8px; height: 8px; min-width: 8px"
                              />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label style="font-size: 11px">{{ opt.label }}</q-item-label>
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-actions row justify-end q-gutter-sm q-mt-md">
                <q-btn
                  flat
                  label="Отмена"
                  color="grey-7"
                  dense
                  v-close-popup
                  @click="cancelContentEdit"
                  class="btn-cancel"
                />
                <q-btn
                  type="submit"
                  :label="editingContent ? 'Сохранить' : 'Добавить'"
                  unelevated
                  dense
                  color="primary"
                  class="btn-primary-action"
                  style="padding: 4px 20px"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useProjectStore } from 'stores/project.js'
import { useQuasar } from 'quasar'
import { useContentPlanStore } from 'stores/content-plan.js'
import { api } from 'boot/axios.js'
import PdfPrinterComponent from 'components/PdfPrinterComponent.vue'
import draggable from 'vuedraggable'
import { getProjectName, getProjectActive } from '@/utils/projectHelpers'
import { getTodayISO, getWeekRange, getMonthRange } from '@/utils/dateHelpers'
import {
  FORMAT_OPTIONS,
  PLATFORM_OPTIONS,
  PLATFORM,
  STATUS,
  STATUS_OPTIONS,
  PLATFORM_COLORS,
  PLATFORM_LABELS,
  PLATFORM_ICONS,
  STATUS_COLORS,
  STATUS_LABELS,
} from '@/constants/status'

const form = ref({ phone: '', name: '' })
const selectedProjectId = ref(null)
const editingProject = ref(null)
const showProjectDialog = ref(false)
const projectStore = useProjectStore()
const contentPlanStore = useContentPlanStore()
const q = useQuasar()

const todaysContentPlans = ref([])
const weekCount = ref(0)
const monthCount = ref(0)
const isInitialLoading = ref(true)

const projectOptions = computed(() => {
  return projectStore.getProjects.map((p) => ({
    label: p.name,
    value: p.id,
  }))
})

async function fetchTodaysContentPlans() {
  const today = getTodayISO()
  try {
    // Today
    const response = await api.get('/content_plans?date=' + today + '&itemsPerPage=1000')
    todaysContentPlans.value = response.data.member

    // Week
    const { start: weekStart, end: weekEnd } = getWeekRange()
    const weekPlans = await contentPlanStore.fetchContentPlansByDateRange(weekStart, weekEnd)
    weekCount.value = weekPlans.length

    // Month
    const { start: monthStart, end: monthEnd } = getMonthRange()
    const monthPlans = await contentPlanStore.fetchContentPlansByDateRange(monthStart, monthEnd)
    monthCount.value = monthPlans.length
  } catch (e) {
    console.error('Error fetching stats:', e)
  }
}

function openProjectDialog() {
  cancelEdit()
  showProjectDialog.value = true
}

function addToProjectList() {
  projectStore.createProject(form.value).then(() => {
    projectStore.fetchProjects()
    showProjectDialog.value = false
    q.notify({
      message: 'Проект успешно создан',
      type: 'positive',
      position: 'top',
    })
  })
  form.value = { name: '', phone: '' }
}

function selectProject(id) {
  selectedProjectId.value = id === selectedProjectId.value ? null : id
}

function editProject(project) {
  selectedProjectId.value = project.id
  editingProject.value = project
  form.value = { name: project.name, phone: project.phone }
  showProjectDialog.value = true
}

function saveEditedProject() {
  projectStore.patchProject(form.value, selectedProjectId.value).then(() => {
    projectStore.fetchProjects()
    showProjectDialog.value = false
    q.notify({
      message: 'Проект успешно обновлён',
      type: 'positive',
      position: 'top',
    })
  })
  cancelEdit()
}

function cancelEdit() {
  editingProject.value = null
  form.value = { name: '', phone: '' }
  showProjectDialog.value = false
}

function deleteProject(id) {
  projectStore.deleteProject(id).then(() => {
    projectStore.fetchProjects()
    q.notify({
      message: 'Проект удалён',
      type: 'positive',
      position: 'top',
    })
  })
}

function confirmProjectDeletion(project) {
  q.dialog({
    title: 'Удаление проекта',
    message: `Вы уверены, что хотите удалить проект "${project.name}"?`,
    cancel: { flat: true, label: 'Отмена' },
    ok: { color: 'negative', label: 'Удалить' },
    persistent: true,
  }).onOk(() => deleteProject(project.id))
}

const selectedProject = computed(
  () => projectStore.getProjects.find((p) => p.id === selectedProjectId.value) || null,
)

watch(selectedProjectId, async () => {
  if (selectedProjectId.value) {
    contentPlanStore.fetchContentPlan(selectedProjectId.value)
  } else {
    contentPlanStore.clearContentPlans()
  }
})

// Content plan
const contentPlanForm = ref({
  post: '',
  format: 'Post',
  idea: '',
  date: '',
  id: null,
  position: 0,
  projectId: null,
  platforms: {}, // { INSTAGRAM: { enabled: true, status: 'NOT_PUBLISHED' }, ... }
})
const editingContent = ref(null)
const showContentDialog = ref(false)
const options = FORMAT_OPTIONS
const platformOptions = PLATFORM_OPTIONS
const statusOptions = STATUS_OPTIONS

// Initialize empty platforms object
function getEmptyPlatforms() {
  const platforms = {}
  Object.values(PLATFORM).forEach((name) => {
    platforms[name] = { enabled: false, status: STATUS.NOT_PUBLISHED }
  })
  return platforms
}

// Toggle platform selection
function togglePlatform(platformName) {
  contentPlanForm.value.platforms[platformName].enabled =
    !contentPlanForm.value.platforms[platformName].enabled
}

const contentPlansList = computed({
  get: () => contentPlanStore.getContentPlans,
  set: (val) => {
    contentPlanStore.setContentPlans(val)
    persistOrder(val)
  },
})

async function persistOrder(plans) {
  // Show loading notification
  const dismiss = q.notify({
    group: false,
    timeout: 0,
    spinner: true,
    message: 'Сохранение порядка...',
    position: 'top',
  })

  // Persist changes to backend
  try {
    const updatePromises = []
    plans.forEach((p, i) => {
      const newPos = i + 1
      if (p.position !== newPos) {
        p.position = newPos
        updatePromises.push(contentPlanStore.patchContentPlan({ position: newPos }, p.id))
      }
    })

    await Promise.all(updatePromises)

    dismiss()
    q.notify({
      message: 'Порядок сохранен',
      type: 'positive',
      position: 'top',
      timeout: 1000,
    })
  } catch (e) {
    dismiss()
    console.error('Error persisting order:', e)
    q.notify({
      message: 'Ошибка при сохранении порядка',
      type: 'negative',
      position: 'top',
    })
    // Refresh from server to revert if failed
    if (selectedProjectId.value) {
      contentPlanStore.fetchContentPlan(selectedProjectId.value)
    }
  }
}

function openContentDialog() {
  cancelContentEdit()
  contentPlanForm.value.platforms = getEmptyPlatforms()
  contentPlanForm.value.projectId = selectedProjectId.value
  showContentDialog.value = true
}

function addToContentList() {
  const targetProjectId = contentPlanForm.value.projectId || selectedProjectId.value
  if (!targetProjectId) {
    q.notify({ message: 'Выберите проект!', type: 'warning', position: 'top' })
    return
  }
  // Convert platforms object to array for API
  const platforms = Object.entries(contentPlanForm.value.platforms)
    .filter(([, data]) => data.enabled)
    .map(([name, data]) => ({
      name,
      status: data.status,
    }))

  const payload = {
    project: '/api/projects/' + targetProjectId,
    post: contentPlanForm.value.post,
    format: contentPlanForm.value.format,
    idea: contentPlanForm.value.idea,
    date: contentPlanForm.value.date,
    position: contentPlanForm.value.position || contentPlanStore.getContentPlans.length + 1,
    platforms,
  }

  contentPlanStore.createContentPlan(payload).then(() => {
    // Only refresh list if we added to the currently selected project
    if (targetProjectId === selectedProjectId.value) {
      contentPlanStore.fetchContentPlan(selectedProjectId.value)
    }
    fetchTodaysContentPlans()
    showContentDialog.value = false
    q.notify({
      message: 'Контент добавлен',
      type: 'positive',
      position: 'top',
    })
  })
  resetContentForm()
}

function editContentPlan(plan) {
  editingContent.value = plan
  // Build platforms object from existing data
  const platforms = getEmptyPlatforms()
  if (plan.platforms) {
    plan.platforms.forEach((p) => {
      platforms[p.name] = { enabled: true, status: p.status || STATUS.NOT_PUBLISHED }
    })
  }
  contentPlanForm.value = {
    post: plan.post,
    format: plan.format,
    idea: plan.idea,
    date: plan.date.slice(0, 10),
    id: plan.id,
    position: plan.position || 0,
    projectId: plan.project?.id || selectedProjectId.value,
    platforms,
  }
  showContentDialog.value = true
}

function resetContentForm() {
  contentPlanForm.value = {
    post: '',
    format: 'Post',
    idea: '',
    date: '',
    id: null,
    position: 0,
    projectId: null,
    platforms: {},
  }
}

function cancelContentEdit() {
  editingContent.value = null
  resetContentForm()
  showContentDialog.value = false
}

function saveEditedContentPlan() {
  // Convert platforms object to array for API
  const platforms = Object.entries(contentPlanForm.value.platforms)
    .filter(([, data]) => data.enabled)
    .map(([name, data]) => ({
      name,
      status: data.status,
    }))

  const payload = {
    post: contentPlanForm.value.post,
    format: contentPlanForm.value.format,
    date: contentPlanForm.value.date,
    idea: contentPlanForm.value.idea,
    position: contentPlanForm.value.position,
    project: contentPlanForm.value.projectId
      ? `/api/projects/${contentPlanForm.value.projectId}`
      : undefined,
    platforms,
  }

  contentPlanStore.patchContentPlan(payload, editingContent.value.id).then(() => {
    contentPlanStore.fetchContentPlan(selectedProjectId.value)
    fetchTodaysContentPlans()
    showContentDialog.value = false
    q.notify({
      message: 'Контент обновлён',
      type: 'positive',
      position: 'top',
    })
  })
  cancelContentEdit()
}

function deleteContentPlan(id) {
  contentPlanStore.deleteContentPlan(id).then(() => {
    contentPlanStore.fetchContentPlan(selectedProjectId.value)
    fetchTodaysContentPlans()
    q.notify({
      message: 'Контент удалён',
      type: 'positive',
      position: 'top',
    })
  })
}

function confirmContentPlanDeletion(contentPlanId) {
  q.dialog({
    title: 'Удаление контента',
    message: 'Вы уверены, что хотите удалить этот контент?',
    cancel: { flat: true, label: 'Отмена' },
    ok: { color: 'negative', label: 'Удалить' },
    persistent: true,
  }).onOk(() => deleteContentPlan(contentPlanId))
}

function getStatusIcon(status) {
  switch (status) {
    case STATUS.PUBLISHED:
      return 'check'
    case STATUS.CANCELED:
      return 'close'
    case STATUS.RESCHEDULED:
      return 'schedule'
    default:
      return '' // No icon for NOT_PUBLISHED
  }
}

async function setPlatformStatus(plan, platformName, newStatus) {
  const platform = plan.platforms.find((p) => p.name === platformName)
  if (!platform || platform.status === newStatus) return

  // Optimistic update
  const originalStatus = platform.status
  platform.status = newStatus

  // Prepare payload
  const updatedPlatforms = plan.platforms.map((p) => ({
    name: p.name,
    status: p.name === platformName ? newStatus : p.status,
  }))

  try {
    await contentPlanStore.patchContentPlan({ platforms: updatedPlatforms }, plan.id)
    q.notify({
      message: `${PLATFORM_LABELS[platformName]}: ${STATUS_LABELS[newStatus]}`,
      type: STATUS_COLORS[newStatus] || 'info',
      position: 'top',
      timeout: 1000,
      icon: getStatusIcon(newStatus),
    })

    // Refresh today's list if the plan is in it
    if (todaysContentPlans.value.some((p) => p.id === plan.id)) {
      fetchTodaysContentPlans()
    }
  } catch (e) {
    // Revert on error
    platform.status = originalStatus
    console.error('Error updating status:', e)
    q.notify({
      message: 'Ошибка обновления статуса',
      type: 'negative',
      position: 'top',
    })
  }
}

onMounted(async () => {
  isInitialLoading.value = true
  await Promise.allSettled([projectStore.fetchProjects(), fetchTodaysContentPlans()])
  isInitialLoading.value = false
})
</script>

<style scoped lang="scss">
.btn-add-minimal {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  width: 32px;
  height: 32px;

  &:hover {
    background: #3b82f6;
    color: white;
  }
}

.dialog-card {
  width: 450px;
  max-width: 95vw;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

  .body--dark & {
    background: rgba(25, 25, 25, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  @media (max-width: 599px) {
    width: 92vw;
  }
}

.content-dialog-card {
  width: 420px;
}

.form-row-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 8px;
}

.platforms-compact-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.platform-card-mini {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 6px;

  &:hover {
    border-color: var(--platform-color);
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
}

.platform-card-mini-active {
  border-color: var(--platform-color);
  background: rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 0 0 1px var(--platform-color);
}

.platform-mini-main {
  display: flex;
  align-items: center;
  gap: 10px;
}

.platform-mini-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.platform-mini-status {
  width: 100%;
  animation: slideInDown 0.2s ease;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.status-select-mini {
  :deep(.q-field__control) {
    min-height: 28px;
    height: 28px;
    padding: 0 8px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
  }
  :deep(.q-field__native) {
    min-height: 28px;
    padding: 0;
    font-size: 11px;
  }
  :deep(.q-field__marginal) {
    height: 28px;
  }
}

.index-page {
  padding: 0;
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
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem;

  @media (max-width: 599px) {
    font-size: 1.5rem;
  }
}

.page-subtitle {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;

  @media (max-width: 1023px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 599px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;

    .stat-card {
      padding: 1rem;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.75rem;
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      flex-shrink: 0;

      :deep(.q-icon) {
        font-size: 1.25rem !important;
      }
    }

    .stat-value {
      font-size: 1.25rem;
    }

    .stat-label {
      font-size: 0.75rem;
    }
  }
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-card-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  filter: grayscale(0.8);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon-blue {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.stat-icon-purple {
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
}

.stat-icon-green {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.stat-icon-orange {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.content-grid {
  display: grid;
  grid-template-columns: 3fr 7fr;
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
  color: #3b82f6;
  font-size: 1.25rem;
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
  min-height: 500px;
  max-height: 500px;
  overflow-y: auto;

  @media (max-width: 599px) {
    padding: 1rem;
    min-height: auto;
  }

  &.no-padding {
    padding: 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  @media (max-width: 599px) {
    grid-template-columns: 1fr;
  }
}

.form-grid-3 {
  grid-template-columns: repeat(3, 1fr);

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-group-full {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.modern-input :deep(.q-field__control) {
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.platforms-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;

  @media (max-width: 599px) {
    grid-template-columns: 1fr;
  }
}

.platform-card {
  background: var(--bg-tertiary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  overflow: hidden;

  &:hover {
    border-color: var(--platform-color, var(--border-color));
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
}

.platform-card-active {
  border-color: var(--platform-color);
  background: linear-gradient(
    135deg,
    rgba(var(--platform-color-rgb, 0, 0, 0), 0.05) 0%,
    transparent 100%
  );

  .platform-card-icon {
    background: rgba(var(--platform-color-rgb, 0, 0, 0), 0.1);
  }
}

.platform-card-header {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  cursor: pointer;
  gap: 0.75rem;
}

.platform-card-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.platform-card-info {
  flex: 1;
  min-width: 0;
}

.platform-card-name {
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--text-primary);
}

.platform-card-checkbox {
  flex-shrink: 0;
}

.platform-card-status {
  padding: 0 0.75rem 0.75rem;
  border-top: 1px solid var(--border-light);
  margin-top: -0.25rem;
  padding-top: 0.5rem;
}

.status-select {
  :deep(.q-field__control) {
    min-height: 32px;
    padding: 0 8px;
  }

  :deep(.q-field__native) {
    padding: 0;
  }

  :deep(.q-field__marginal) {
    height: 32px;
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

.platform-icon-item {
  transition: transform 0.15s ease;
  cursor: default;

  &:hover {
    transform: scale(1.15);
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.btn-primary-action {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  font-weight: 500;
  padding: 0.625rem 1.5rem;
}

.btn-cancel {
  color: var(--text-secondary);
}

.form-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.modern-table-grid {
  width: 100%;
  display: flex;
  flex-direction: column;
  user-select: none;
}

.grid-header {
  display: grid;
  grid-template-columns: 50px 1.5fr 100px 120px 1.5fr 100px 100px;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.02);
}

.header-cell {
  color: var(--text-muted);
  font-weight: 500;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.grid-body {
  display: flex;
  flex-direction: column;
}

.grid-row {
  display: grid;
  grid-template-columns: 50px 1.5fr 100px 120px 1.5fr 100px 100px;
  gap: 1rem;
  padding: 1rem;
  align-items: center;
  border-bottom: 1px solid var(--border-light);
  transition: background-color 0.2s ease;
  background: var(--bg-card);
  cursor: grab;

  &:hover {
    background-color: var(--bg-hover);
  }

  &:active {
    cursor: grabbing;
  }

  &.selected-row {
    background-color: rgba(59, 130, 246, 0.08);
    border-left: 3px solid #3b82f6;
    padding-left: calc(1rem - 3px);
  }
}

.grid-cell {
  font-size: 0.875rem;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &.post-name {
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    font-weight: 500;
    color: var(--text-primary);
  }

  &.idea-cell {
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    font-size: 0.8125rem;
  }
}

.text-right {
  text-align: right;
}

.text-muted {
  color: var(--text-muted);
}

.justify-end {
  justify-content: flex-end;
  display: flex;
}

.drag-handle {
  cursor: move;
}

.dragged-item {
  opacity: 0.05 !important;
  background-color: var(--bg-tertiary) !important;
  border: 2px dashed #3b82f6 !important;
}

.drag-over {
  background-color: rgba(59, 130, 246, 0.1) !important;
  transform: translateY(15px);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: -10px;
    left: 0;
    right: 0;
    height: 4px;
    background: #3b82f6;
    border-radius: 4px;
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
    animation: drag-pulse 1s infinite;
  }
}

@keyframes drag-pulse {
  0% {
    opacity: 0.6;
    transform: scaleX(0.98);
  }
  50% {
    opacity: 1;
    transform: scaleX(1);
  }
  100% {
    opacity: 0.6;
    transform: scaleX(0.98);
  }
}

.selected-row {
  background-color: rgba(59, 130, 246, 0.1) !important;
  border-left: 3px solid #3b82f6;
}

.action-buttons {
  display: flex;
  gap: 0.375rem;
  align-items: center;
}

.projects-list {
  display: flex;
  flex-direction: column;
}

.project-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-light);
  transition: all 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: var(--bg-hover);
  }
}

.project-item-selected {
  background-color: rgba(59, 130, 246, 0.08);
  border-left: 3px solid #3b82f6;
  padding-left: calc(1.25rem - 3px);
}

.project-item-main {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.project-item-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.875rem;
  flex-shrink: 0;
}

.project-item-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.project-item-name {
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.project-name-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.project-name-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.inactive-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.15rem 0.45rem;
  background: rgba(245, 158, 11, 0.1);
  color: #b45309;
  border-radius: 4px;
  border: 1px solid rgba(245, 158, 11, 0.3);
  letter-spacing: 0.03em;
  white-space: nowrap;
  flex-shrink: 0;

  .body--dark & {
    color: #fbbf24;
    background: rgba(245, 158, 11, 0.15);
    border-color: rgba(245, 158, 11, 0.35);
  }
}

.project-item-phone {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.project-item-actions {
  display: flex;
  gap: 0.25rem;
  margin-left: 0.5rem;
}

.action-btn-icon {
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary) !important;
  }
}

.action-btn-danger:hover {
  background: rgba(239, 68, 68, 0.1) !important;
  color: #ef4444 !important;
}

.project-name {
  font-weight: 500;
  color: var(--text-primary);
  max-width: 200px;
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

// Mobile Cards
.mobile-cards {
  padding: 0.75rem;
  user-select: none;
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
  align-items: flex-start;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.mobile-card-title {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-primary);
  margin-right: auto;
  word-break: break-word;
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
}

.mobile-card-label {
  color: var(--text-muted);
}

.mobile-card-idea {
  color: var(--text-secondary);
  text-align: right;
  max-width: 60%;
  white-space: normal;
  word-wrap: break-word;
}

.mobile-card-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

// Responsive form
@media (max-width: 599px) {
  .form-actions {
    flex-direction: column;

    .q-btn {
      width: 100%;
    }
  }

  .btn-primary-action {
    order: -1;
  }
}

// Responsive page header
@media (max-width: 599px) {
  .page-header {
    margin-bottom: 1.25rem;
  }

  .page-title {
    font-size: 1.375rem;
  }
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
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  transform: scale(1.02);
  z-index: 9999 !important;
  cursor: grabbing !important;
  display: grid !important; /* Ensure it stays a grid item */
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
</style>

<style lang="scss">
.glass-tooltip {
  background: rgba(255, 255, 255, 0.65) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
  color: #000 !important;
  border-radius: 8px !important;
  font-size: 10px !important;
  padding: 4px 8px !important;
  letter-spacing: 0.3px;

  .body--dark & {
    background: rgba(20, 20, 20, 0.65) !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
    color: #fff !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
  }
}

.glass-menu {
  background: rgba(255, 255, 255, 0.65) !important;
  backdrop-filter: blur(15px) !important;
  -webkit-backdrop-filter: blur(15px) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
  border-radius: 12px !important;
  overflow: hidden;

  .body--dark & {
    background: rgba(20, 20, 20, 0.65) !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
  }

  .q-list {
    min-width: 130px !important;
    background: transparent !important;
    padding: 4px !important;
  }

  .q-item {
    min-height: 32px !important;
    padding: 4px 8px !important;
    border-radius: 8px !important;
    margin-bottom: 2px;
    font-size: 11px !important;
    color: var(--text-primary);
    transition: all 0.2s ease;

    &:last-child {
      margin-bottom: 0;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.3) !important;
      .body--dark & {
        background: rgba(255, 255, 255, 0.05) !important;
      }
    }

    &.bg-blue-1 {
      background: rgba(59, 130, 246, 0.15) !important;
      font-weight: 600;
    }
  }

  .q-item__section--main {
    font-size: 11px !important;
  }

  .q-icon {
    font-size: 14px !important;
  }
}
</style>
