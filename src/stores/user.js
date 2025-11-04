import { acceptHMRUpdate, defineStore } from 'pinia'
import { api } from 'boot/axios.js'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: {
      id: null,
      email: null,
      roles: [],
      createdAt: null,
      updatedAt: null,
      updatedBy: null,
      givenName: null,
      familyName: null
    }
  }),

  getters: {
    getUser(state) {
      return state.user
    },
    isAdmin(state) {
      return state.user.roles.includes("ROLE_ADMIN")
    }
  },

  actions: {
    fetchUser(data) {
      return new Promise((resolve, reject) => {
        api
          .post('/users/about_me', data)
          .then((response) => {
            this.user = response.data
            console.log(this.user, 'user')
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
