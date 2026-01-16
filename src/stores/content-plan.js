import { acceptHMRUpdate, defineStore } from 'pinia'
import { api } from 'boot/axios.js'

export const useContentPlanStore = defineStore('content-plan', {
  state: () => ({
    contentPlans: {
      totalItems: 0,
      items: [],
    },
    globalTotal: 0,
    publishedTotal: 0,
    myPublishedTotal: 0,
    monthlyTotal: 0,
  }),

  getters: {
    getContentPlanTotalItems: (state) => state.contentPlans.totalItems,
    getContentPlans: (state) => state.contentPlans.items,
    getGlobalTotal: (state) => state.globalTotal,
    getPublishedTotal: (state) => state.publishedTotal,
    getMyPublishedTotal: (state) => state.myPublishedTotal,
    getMonthlyTotal: (state) => state.monthlyTotal,
  },

  actions: {
    createContentPlan(data) {
      return new Promise((resolve, reject) => {
        api
          .post('/content_plans', data)
          .then(() => {
            console.log('content plan has been created')
            resolve()
          })
          .catch((e) => {
            reject(e, 'error during the creating content plan')
          })
      })
    },
    fetchContentPlansCount() {
      return new Promise((resolve, reject) => {
        api
          .get('/content_plans?itemsPerPage=1000')
          .then((response) => {
            this.globalTotal = response.data.totalItems
            resolve()
          })
          .catch((e) => {
            reject(e, 'error during the fetching content plan count')
          })
      })
    },
    fetchMonthlyContentPlansCount() {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)

      return new Promise((resolve, reject) => {
        api
          .get(`/content_plans?date[after]=${startOfMonth}&date[before]=${endOfMonth}&itemsPerPage=1`)
          .then((response) => {
            this.monthlyTotal = response.data.totalItems
            resolve()
          })
          .catch((e) => {
            reject(e, 'error during the fetching monthly content plan count')
          })
      })
    },
    fetchPublishedContentPlansCount() {
      return new Promise((resolve, reject) => {
        api
          .get(`/content_plans/count/published`)
          .then((response) => {
            this.publishedTotal = response.data.count
            resolve()
          })
          .catch((e) => {
            reject(e, 'error during the fetching published content plan count')
          })
      })
    },
    fetchMyPublishedContentPlansCount() {
      return new Promise((resolve, reject) => {
        api
          .get('/content_plans/my-count/published')
          .then((response) => {
            this.myPublishedTotal = response.data.count
            resolve()
          })
          .catch((e) => {
            reject(e, 'error during the fetching my published content plan count')
          })
      })
    },
    patchContentPlan(data, id) {
      console.log(data, id)
      return new Promise((resolve, reject) => {
        api
          .patch('/content_plans/' + id, data)
          .then(() => {
            console.log('content plan has been edited')
            resolve()
          })
          .catch((e) => {
            reject(e, 'error during the editing content plan')
          })
      })
    },
    fetchContentPlan(projectId) {
      return new Promise((resolve, reject) => {
        api
          .get('/content_plans?project.id=' + projectId + '&order[position]=asc&itemsPerPage=1000')
          .then((response) => {
            this.contentPlans.totalItems = response.data.totalItems
            this.contentPlans.items = response.data.member
            resolve()
          })
          .catch((e) => {
            reject(e, 'error during the fetching content plan')
          })
      })
    },
    fetchContentPlansByDateRange(startDate, endDate) {
      return new Promise((resolve, reject) => {
        api
          .get(`/content_plans?date[after]=${startDate}&date[before]=${endDate}&itemsPerPage=1000`)
          .then((response) => {
            resolve(response.data.member)
          })
          .catch((e) => {
            reject(e, 'error during the fetching content plan by date range')
          })
      })
    },
    deleteContentPlan(id) {
      return new Promise((resolve, reject) => {
        api
          .delete('/content_plans/' + id)
          .then(() => {
            console.log('successfully deleted')
            resolve()
          })
          .catch((e) => {
            reject(e, 'there is an error during the deletion')
          })
      })
    },
    setContentPlans(items) {
      this.contentPlans.items = items
    },
    clearContentPlans() {
      this.contentPlans.totalItems = 0
      this.contentPlans.items = []
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useContentPlanStore, import.meta.hot))
}
