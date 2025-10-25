import { acceptHMRUpdate, defineStore } from 'pinia'
import { api } from 'boot/axios.js'

export const useUserStore = defineStore('user', {
  state: () => ({
    accessToken: null,
    refreshToken: null,
  }),

  getters: {
    getAccessToken(state) {
      return state.accessToken
    },
    getRefreshToken(state) {
      return state.refreshToken
    },
  },

  actions: {
    fetchUser(data) {
      return new Promise((resolve, reject) => {
        api
          .post('/users/about_me', data)
          .then(() => {
            resolve()
          })
          .catch((e) => {
            reject(e)
          })
      })
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
