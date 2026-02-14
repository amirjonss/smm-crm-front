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
    selectedUserId: null,
  }),

  getters: {
    getUser(state) {
      return state.user
    },
    isAdmin(state) {
      return state.user.roles.includes('ROLE_ADMIN')
    },
    isSMM(state) {
      return state.user.roles.includes('ROLE_SMM')
    },
    canCreateBoard() {
      return this.isAdmin
    },
    canDeleteBoard() {
      return this.isAdmin
    },
    canManageList() {
      return this.isAdmin || this.isSMM
    },
    isLoaded: (state) => state.loaded,
    getUsers: (state) => state.users.items,
    getSelectedUserId: (state) => state.selectedUserId,
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
    fetchUsers(params = {}) {
      return new Promise((resolve, reject) => {
        api
          .get('/users', { params })
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
    setSelectedUserId(id) {
      this.selectedUserId = id
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
