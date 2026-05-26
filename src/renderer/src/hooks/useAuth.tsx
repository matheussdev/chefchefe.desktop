import { createContext, type ReactNode, useCallback, useContext, useState } from 'react'
import { setConfig, setLogin } from '../services/auth'
import api from '../services/api'
import { errorActions } from '../utils/errorActions'
import type { LoginParams, LoginResponse, Restaurant, User } from '../types'

interface AuthProviderProps {
  children: ReactNode
}

interface AuthContextData {
  login: (params: LoginParams) => Promise<LoginResponse>
  getRestaurant: () => Promise<Restaurant>
  restaurant: Restaurant | null
  user?: User | null
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: Readonly<AuthProviderProps>): React.JSX.Element {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const login = useCallback(async (params: LoginParams): Promise<LoginResponse> => {
    return new Promise<LoginResponse>((resolve, reject) => {
      api
        .post('/token/', {
          ...params
        })
        .then((response) => {
          const data: LoginResponse = response.data
          setLogin(data.access)
          resolve(data)
          return
        })
        .catch((error) => {
          reject(error?.response?.data?.detail || 'Erro ao fazer login')
        })
    })
  }, [])
  const getRestaurant = useCallback(async (): Promise<Restaurant> => {
    return new Promise<Restaurant>((resolve, reject) => {
      api
        .get('/v1/desktop/restaurant/')
        .then((response) => {
          const data: { restaurant: Restaurant; user: User } = response.data
          setRestaurant(data.restaurant)
          setUser(data.user)
          if (data.user.default_code) {
            setConfig('terminal-saved-code', data.user.default_code)
          }
          resolve(response.data)
        })
        .catch((error) => {
          errorActions(error)
          reject()
        })
    })
  }, [])
  return (
    <AuthContext.Provider
      value={{
        login,
        getRestaurant,
        restaurant,
        user
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextData {
  const context = useContext(AuthContext)
  return context
}
