import { acceptHMRUpdate, defineStore } from 'pinia'
import { api } from 'boot/axios.js'
import { useUserStore } from 'stores/user.js'
import { useProjectStore } from 'stores/project.js'
import { useContentPlanStore } from 'stores/content-plan.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthorized: localStorage.getItem('accessToken'),
    accessToken: localStorage.getItem('accessToken') || '',
    refreshToken: localStorage.getItem('refreshToken') || '',
  }),

  getters: {
    getAccessToken(state) {
      return state.accessToken
    },
    getRefreshToken(state) {
      return state.refreshToken
    },
    getIsAuthorised(state) {
      return state.isAuthorized
    },
  },

  actions: {
    async fetchToken(data) {
      const response = await api.post('/users/auth', data)
      this.updateToken(response.data.accessToken, response.data.refreshToken)
    },
    async fetchRefreshToken() {
      const response = await api.post('/users/auth/refreshToken', {
        refreshToken: localStorage.getItem('refreshToken'),
      })
      this.updateToken(response.data.accessToken, response.data.refreshToken)
    },
    updateToken(accessToken, refreshToken) {
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      this.accessToken = localStorage.getItem('accessToken') || ''
      this.refreshToken = localStorage.getItem('refreshToken') || ''
      this.isAuthorized = localStorage.getItem('accessToken')
    },
    clearTokens() {
      localStorage.clear()
      this.accessToken = ''
      this.refreshToken = ''
      this.isAuthorized = false

      const userStore = useUserStore()
      const projectStore = useProjectStore()
      const contentPlanStore = useContentPlanStore()

      userStore.$reset()
      projectStore.$reset()
      contentPlanStore.$reset()
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
