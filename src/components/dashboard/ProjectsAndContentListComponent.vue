<template>
  <div class="content-row row justify-center">
    <div class="projects-row col-xs-12 col-sm-12 col-md-8 col-lg-6 q-pa-md">
      <div class="projects-row__list area row q-pa-lg">
        <div class="col-xs-12 col-md-10 title text-h5 text-center q-pb-lg">Список Проектов</div>
        <div class="col-12">
          <q-markup-table>
            <thead>
              <tr>
                <th class="text-left" v-for="(item, index) in projectColumns" :key="index">
                  {{ item.name }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in projectStore.getProjects"
                :key="index"
                :class="{ 'selected-row': item.id === selectedProjectId }"
              >
                <td class="text-left">{{ index + 1 }}</td>
                <td class="text-left">{{ item.name }}</td>
                <td class="text-left">{{ item.executor.givenName }}</td>
                <td class="text-left">{{ item.phone }}</td>
                <td class="text-left">{{ item.createdAt.slice(0, 10) }}</td>
                <td class="text-left">
                  <q-btn
                    flat
                    round
                    color="primary"
                    icon="info"
                    @click="
                      item.id === selectedProjectId
                        ? (selectedProjectId = null)
                        : (selectedProjectId = item.id)
                    "
                  />
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>
      </div>
    </div>
    <div class="content-plan-row col-xs-12 col-sm-12 col-md-8 col-lg-6 q-pa-md">
      <div class="content-plan-row__list area row q-pa-lg">
        <div class="col-12 title text-h5 text-center q-pb-lg">Список Контент Планов</div>
        <div class="col-12">
          <q-markup-table>
            <thead>
              <tr>
                <th class="text-left" v-for="(item, index) in contentPlanColumns" :key="index">
                  {{ item.name }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in contentPlanStore.getContentPlans" :key="index">
                <td class="text-left">{{ index + 1 }}</td>
                <td class="text-left">{{ item.post }}</td>
                <td class="text-left">{{ item.format }}</td>
                <td class="text-left">{{ item.idea }}</td>
                <td class="text-left">{{ item.date.slice(0, 10) }}</td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps } from 'vue'
import { useProjectStore } from 'stores/project.js'
import { useContentPlanStore } from 'stores/content-plan.js'

const projectStore = useProjectStore()
const contentPlanStore = useContentPlanStore()
const selectedProjectId = ref(null)
const selectedUserId = ref(null)
const props = defineProps({
  parentSelectedUserId: {
    default: null
  }
})

const projectColumns = [
  { name: '№' },
  { name: 'Называние проекта' },
  { name: 'Имя (SMM)' },
  { name: 'Телефон' },
  { name: 'Дата создание' },
  { name: 'Действие' },
]

const contentPlanColumns = [
  { name: '#' },
  { name: 'Пост' },
  { name: 'Формат' },
  { name: 'Идея' },
  { name: 'Дата' },
]
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
  } else {
    selectedUserId.value = newId
    await projectStore.fetchProjectsByUser(newId)
  }
})
</script>

<style scoped>
.area {
  background-color: #f2f2f2;
  border-radius: 10px;
  margin: 10px 0 10px 0;
}
.selected-row {
  background-color: #d0f0d0 !important;
}
</style>
