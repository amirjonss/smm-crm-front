import { acceptHMRUpdate, defineStore } from 'pinia'
import { api } from 'boot/axios.js'

export const useProjectStore = defineStore('project', {
  state: () => ({
    projects: {
      totalItems: 0,
      items: []
    }
  }),

  getters: {
    getProjectsTotalItems: (state) => state.projects.totalItems,
    getProjects: state => state.projects.items
  },

  actions: {
    createProject(data) {
      return new Promise((resolve, reject) => {
        api
          .post('/projects', data)
          .then(() => {
            console.log('project has been created')
            resolve()
          })
          .catch((e) => {
            reject(e, 'error during the creating project')
          })
      })
    },
    patchProject(data, id) {
      console.log(data, id)
      return new Promise((resolve, reject) => {
        api
          .patch('/projects/' + id, data)
          .then(() => {
            console.log('project has been edited')
            resolve()
          })
          .catch((e) => {
            reject(e, 'error during the editing project')
          })
      })
    },
    fetchProjects() {
      return new Promise((resolve, reject) => {
        api
          .get('/projects')
          .then((response) => {
            this.projects.totalItems = response.data.totalItems
            this.projects.items = response.data.member
            resolve()
          })
          .catch((e) => {
            reject(e, 'error during the fetching project')
          })
      })
    },
    fetchProjectsByUser(userId) {
      return new Promise((resolve, reject) => {
        api
          .get('/projects?executor.id=' + userId)
          .then((response) => {
            this.projects.totalItems = response.data.totalItems
            this.projects.items = response.data.member
            resolve()
          })
          .catch((e) => {
            reject(e, 'error during the fetching project')
          })
      })
    },
    deleteProject(id) {
      return new Promise((resolve, reject) => {
        api
          .delete('/projects/' + id)
          .then(() => {
            console.log('successfully deleted')
            resolve()
          })
          .catch((e) => {
            reject(e, 'there is an error during the deletion')
          })
      })
    },
    clearProjects() {
      this.projects.totalItems = 0
      this.projects.items = null
    }
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProjectStore, import.meta.hot))
}
