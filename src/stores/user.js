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
      telegramUsername: null,
      avatar: null,
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
          .then((response) => {
            if (this.user?.id === id && response?.data) {
              this.user = {
                ...this.user,
                ...response.data,
              }
            }
            resolve(response?.data)
          })
          .catch((e) => {
            reject(e)
          })
      })
    },
    changeUserRole(id, roles) {
      return new Promise((resolve, reject) => {
        api
          .patch('/users/' + id + '/change-role', { roles })
          .then((response) => {
            resolve(response?.data)
          })
          .catch((e) => {
            reject(e)
          })
      })
    },
    changeUserEmail(id, email) {
      return new Promise((resolve, reject) => {
        api
          .patch('/users/' + id + '/change-email', { email })
          .then((response) => {
            resolve(response?.data)
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
    verifyCurrentPassword(password) {
      return new Promise((resolve, reject) => {
        api
          .post('/users/auth', {
            email: this.user.email,
            password,
          }, {
            skipAuthRefresh: true,
          })
          .then(() => {
            resolve()
          })
          .catch((e) => {
            reject(e)
          })
      })
    },
    changePassword(userId, newPassword) {
      return new Promise((resolve, reject) => {
        api
          .patch('/users/' + userId + '/password', {
            password: newPassword,
          })
          .then((response) => {
            resolve(response?.data)
          })
          .catch((e) => {
            reject(e)
          })
      })
    },
    uploadAvatar(file) {
      const formData = new FormData()
      formData.append('file', file)

      return new Promise((resolve, reject) => {
        api
          .post('/media_objects', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
          .then((response) => {
            resolve(response?.data)
          })
          .catch((e) => {
            reject(e)
          })
      })
    },
    fetchMediaObject(iriOrPath) {
      let path = iriOrPath
      if (typeof path === 'string' && path.startsWith('/api/')) {
        path = path.slice(4)
      }
      return new Promise((resolve, reject) => {
        api
          .get(path)
          .then((response) => {
            resolve(response?.data)
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
