import { acceptHMRUpdate, defineStore } from 'pinia'
import { api } from 'boot/axios.js'

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
    fetchToken(data) {
      return new Promise((resolve, reject) => {
        api
          .post('/users/auth', data)
          .then((response) => {
            this.updateToke(response.data.accessToken, response.data.refreshToken)
            resolve()
          })
          .catch((e) => {
            reject(e, 'what is it')
          })
      })
    },
    fetchRefreshToken() {
      return new Promise((resolve, reject) => {
        api
          .post('/users/auth/refreshToken', { refreshToken: localStorage.getItem('refreshToken') })
          .then((response) => {
            this.updateToke(response.data.accessToken, response.data.refreshToken)
            resolve()
          })
          .catch((e) => {
            reject(e)
          })
      })
    },
    updateToke(accessToken, refreshToken) {
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      this.accessToken = localStorage.getItem('accessToken') || ''
      this.refreshToken = localStorage.getItem('refreshToken') || ''
      this.isAuthorized = localStorage.getItem('accessToken')
    },
    clearTokens() {
      localStorage.clear()
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
