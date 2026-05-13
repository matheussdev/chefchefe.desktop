import Axios, { type AxiosRequestHeaders } from 'axios'
import { getToken } from './auth'

const api = Axios.create({
  baseURL: import.meta.env.VITE_API_URL || localStorage.getItem('chefchefe@api-base-url') || 'http://localhost:8001/api',
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

api.interceptors.request.use(async (config) => {
  const token = getToken()
  if (token) {
    if (!config) {
      config = {
        headers: {} as AxiosRequestHeaders
      }
    }
    if (!config.headers) {
      config.headers = {} as AxiosRequestHeaders
    }
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
export default api
