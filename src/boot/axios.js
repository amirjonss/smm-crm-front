import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'
import { useAuthStore } from 'stores/auth.js'

const baseUrl = import.meta.env.VITE_BASE_URL
const api = axios.create({ baseURL: baseUrl })
api.defaults.headers.common['Content-Type'] = 'application/ld+json'
api.defaults.headers.patch['Content-Type'] = 'application/merge-patch+json'

function isAuthEndpoint(url = '') {
  return url.endsWith('/users/auth') || url === '/users/auth' || url.endsWith('/users/auth/refreshToken') || url === '/users/auth/refreshToken'
}

api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.getAccessToken || authStore.accessToken
    config.headers['Authorization'] = 'Bearer ' + token

    return config
  },
  function (error) {
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
    if (error.config?.skipAuthRefresh === true) {
      return Promise.reject(error)
    }
    if (
      error.response.status === 401 &&
      !isAuthEndpoint(error.config?.url || '')
    ) {
      useAuthStore()
        .fetchRefreshToken()
        .then(() => {
          api(error.config)
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
