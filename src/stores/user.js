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
      familyName: null,
    },
    loaded: false,
    users: {
      totalItems: 0,
      items: [],
    },
  }),

  getters: {
    getUser(state) {
      return state.user
    },
    isAdmin(state) {
      return state.user.roles.includes('ROLE_ADMIN')
    },
    isLoaded: (state) => state.loaded,
    getUsers: (state) => state.users.items,
  },

  actions: {
    fetchUser(data) {
      return new Promise((resolve, reject) => {
        api
          .post('/users/about_me', data)
          .then((response) => {
            this.user = response.data
            this.loaded = true
            resolve()
          })
          .catch((e) => {
            reject(e)
          })
      })
    },
    createUser(data) {
      return new Promise((resolve, reject) => {
        api
          .post('/users', data)
          .then(() => {
            resolve()
          })
          .catch((e) => {
            reject(e)
          })
      })
    },
    fetchUsers() {
      return new Promise((resolve, reject) => {
        api
          .get('/users')
          .then((response) => {
            this.users.totalItems = response.data.totalItems
            this.users.items = response.data.member
            resolve()
          })
          .catch((e) => {
            reject(e)
          })
      })
    },
    patchUser(data, id) {
      return new Promise((resolve, reject) => {
        api
          .patch('/users/' + id, data)
          .then(() => {
            resolve()
          })
          .catch((e) => {
            reject(e)
          })
      })
    },
    deleteUser(id) {
      return new Promise((resolve, reject) => {
        api
          .delete('/users/' + id)
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
