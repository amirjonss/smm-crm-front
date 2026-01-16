import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'
import { useAuthStore } from 'stores/auth.js'

const baseUrl = process.env.VUE_APP_BASE_URL
const api = axios.create({ baseURL: baseUrl })
api.defaults.headers.common['Content-Type'] = 'application/ld+json'
api.defaults.headers.patch['Content-Type'] = 'application/merge-patch+json'
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.getAccessToken || authStore.accessToken
    config.headers['Authorization'] = 'Bearer ' + token

    return config
  },
  function (error) {
    console.log('interceptor', error)
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response === undefined) {
      return Promise.reject('connection refused')
    }
    console.log(error.response.status)
    console.log(error.config.url)
    console.log(error.response.data)
    if (
      error.response.status === 401 &&
      (error.config.url !== '/api/users/auth' ||
        error.config.url !== '/api/users/auth/refreshToken')
    ) {
      console.log('need to clean token')

      useAuthStore()
        .fetchRefreshToken()
        .then(() => {
          api(error.config).then(() => {
            console.log('done')
          })
        })
        .catch(() => {
          useAuthStore().clearTokens()
        })
    }
    return Promise.reject(error)
  },
)

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios

  app.config.globalProperties.$api = api
})

export { api }
