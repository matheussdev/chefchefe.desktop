import Axios, { type AxiosRequestHeaders } from 'axios'
import { getConfig, getToken } from './auth'
const http = getConfig('http') || 'http'
const schema = getConfig('schema') || ''
const baseURL = getConfig('baseURL') || 'chefchefe.app'
const api = Axios.create({
  baseURL: `${http}://${schema}${schema ? '.' : ''}${baseURL}/api`,
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
