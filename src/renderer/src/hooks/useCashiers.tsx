import api from '@renderer/services/api'
import { Cashier } from '@renderer/types'
import { errorActions } from '@renderer/utils'
import { createContext, type ReactNode, useCallback, useContext, useState } from 'react'

interface CashierProviderProps {
  children: ReactNode
}

interface CashierContextData {
  cashiers: Cashier[]
  fetchCashiers: (params?: any, updateCashiers?: boolean) => Promise<Cashier[] | Cashier>
  selectedCashier: Cashier | null
  loading: boolean
  fetchCashier: (id: string) => Promise<Cashier>
}

// eslint-disable-next-line react-refresh/only-export-components
export const CashierContext = createContext<CashierContextData>({} as CashierContextData)

export function CashierProvider({ children }: Readonly<CashierProviderProps>): React.JSX.Element {
  const [selectedCashier, setSelectedCashier] = useState<Cashier | null>(null)
  const [loading, setLoading] = useState(true)
  const [cashiers, setCashiers] = useState<Cashier[]>([])
  const fetchCashiers = useCallback(
    async (params?: any, updateCashiers: boolean = true): Promise<Cashier[] | Cashier> => {
      return new Promise<Cashier[] | Cashier>((resolve, reject) => {
        if (updateCashiers) {
          setLoading(true)
        }
        api
          .get('v1/desktop/cashiers/', {
            params: {
              paginated: false,
              is_open: true,
              ...params
            }
          })
          .then((response) => {
            const storageCashier = localStorage.getItem('@chefchefe:cashier_id')
            const data = response?.data?.results || response.data
            if (updateCashiers) {
              setCashiers(data)
              if (data.length > 0 && storageCashier) {
                const foundCashier = data.find((cashier: Cashier) => cashier.id === storageCashier)
                if (foundCashier) {
                  setSelectedCashier(foundCashier)
                } else {
                  setSelectedCashier(data[0])
                  localStorage.setItem('@chefchefe:cashier_id', String(data[0].id))
                }
              } else if (data.length > 0 && !storageCashier) {
                setSelectedCashier(data[0])
                localStorage.setItem('@chefchefe:cashier_id', String(data[0].id))
              } else {
                setSelectedCashier(null)
                localStorage.removeItem('@chefchefe:cashier_id')
              }
            }
            resolve(data)
          })
          .catch((error) => {
            errorActions(error)
            reject(error?.response?.data?.detail || 'Erro ao buscar caixas')
          })
          .finally(() => {
            setLoading(false)
          })
      })
    },
    []
  )
  const fetchCashier = useCallback(
    async (id: string): Promise<Cashier> => {
      return new Promise<Cashier>((resolve, reject) => {
        setLoading(true)
        api
          .get(`v1/desktop/cashiers/${id}/`)
          .then((response) => {
            resolve(response.data)
          })
          .catch((error) => {
            errorActions(error)
            reject(error?.response?.data?.detail || 'Erro ao buscar caixa')
          })
          .finally(() => {
            setLoading(false)
          })
      })
    },
    []
  )
  return (
    <CashierContext.Provider
      value={{
        cashiers,
        fetchCashiers,
        selectedCashier,
        loading,
        fetchCashier
      }}
    >
      {children}
    </CashierContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCashier(): CashierContextData {
  const context = useContext(CashierContext)
  return context
}
