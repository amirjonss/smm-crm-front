import { ref } from 'vue'
import { useContentPlanStore } from '@/stores/content-plan'
import { api } from '@/boot/axios'
import { getTodayISO, getWeekRange, getMonthRange } from '@/utils/dateHelpers'

export function useContentPlanStats() {
  const contentPlanStore = useContentPlanStore()
  const todaysPlans = ref([])
  const weekCount = ref(0)
  const monthCount = ref(0)
  const loading = ref(false)

  async function fetchTodaysPlans() {
    const today = getTodayISO()
    const response = await api.get(`/content_plans?date=${today}&itemsPerPage=1000`)
    todaysPlans.value = response.data.member
    return todaysPlans.value
  }

  async function fetchAllStats() {
    loading.value = true
    try {
      await fetchTodaysPlans()

      const { start: weekStart, end: weekEnd } = getWeekRange()
      const weekPlans = await contentPlanStore.fetchContentPlansByDateRange(weekStart, weekEnd)
      weekCount.value = weekPlans.length

      const { start: monthStart, end: monthEnd } = getMonthRange()
      const monthPlans = await contentPlanStore.fetchContentPlansByDateRange(monthStart, monthEnd)
      monthCount.value = monthPlans.length

      await contentPlanStore.fetchMyPublishedContentPlansCount()
    } finally {
      loading.value = false
    }
  }

  return {
    todaysPlans,
    weekCount,
    monthCount,
    loading,
    fetchTodaysPlans,
    fetchAllStats,
  }
}
