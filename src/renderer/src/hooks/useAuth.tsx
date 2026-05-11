import { createContext, type ReactNode, useCallback, useContext, useState } from 'react'
import { setLogin } from '../services/auth'
import api from '../services/api'
import { errorActions } from '../utils/errorActions'
import type { LoginParams, LoginResponse, Restaurant, User } from '../types'

interface AuthProviderProps {
  children: ReactNode
}

interface AuthContextData {
  login: (params: LoginParams) => Promise<LoginResponse>
  getUser: () => Promise<User>
  user: User | null
  getRestaurant: () => Promise<Restaurant>
  restaurant: Restaurant | null
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: Readonly<AuthProviderProps>): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const login = useCallback(async (params: LoginParams): Promise<LoginResponse> => {
    return new Promise<LoginResponse>((resolve, reject) => {
      api
        .post('/v1/user/login/', {
          ...params
        })
        .then((response) => {
          const data: LoginResponse = response.data
          setLogin(data.access, params.restaurant_token)
          resolve(data)
          return
        })
        .catch((error) => {
          reject(error?.response?.data?.detail || 'Erro ao fazer login')
        })
    })
  }, [])
  const getUser = useCallback(async (): Promise<User> => {
    return new Promise<User>((resolve, reject) => {
      api
        .get('/v1/user/me/')
        .then((response) => {
          const data: User = response.data
          setUser(data)
          resolve(response.data)
        })
        .catch((error) => {
          errorActions(error)
          reject()
        })
    })
  }, [])
  const getRestaurant = useCallback(async (): Promise<Restaurant> => {
    return new Promise<Restaurant>((resolve, reject) => {
      api
        .get('/v1/desktop/restaurant/')
        .then((response) => {
          const data: Restaurant = response.data
          setRestaurant(data)
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
        getUser,
        user,
        getRestaurant,
        restaurant
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
