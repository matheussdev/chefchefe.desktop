import { AxiosError } from 'axios'
import { logout } from '../services/auth'

export function errorActions(error: AxiosError): void {
  if (error.response?.status === 401) {
    logout()
  }
}
