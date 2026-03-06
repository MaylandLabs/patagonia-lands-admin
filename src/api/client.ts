import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
})

let token: string | null = null

export function setToken(t: string | null) {
  token = t
}

export function getToken() {
  return token
}

api.interceptors.request.use((config) => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      token = null
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
