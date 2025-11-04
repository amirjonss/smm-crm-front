import { acceptHMRUpdate, defineStore } from 'pinia'
import { api } from 'boot/axios.js'

export const useContentPlanStore = defineStore('content-plan', {
  state: () => ({
    contentPlans: {
      totalItems: 0,
      items: []
    }
  }),

  getters: {
    getContentPlanTotalItems: (state) => state.contentPlans.totalItems,
    getContentPlans: state => state.contentPlans.items
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
          .get('/content_plans?project.id=' + projectId)
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
    clearContentPlans() {
      this.contentPlans.totalItems = 0
      this.contentPlans.items = null
    }
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useContentPlanStore, import.meta.hot))
}
