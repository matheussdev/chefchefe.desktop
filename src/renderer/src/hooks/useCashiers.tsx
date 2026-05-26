import api from '@renderer/services/api'
import { getConfig, setConfig } from '@renderer/services/auth'
import { Cashier, CashierDetail } from '@renderer/types'
import { errorActions } from '@renderer/utils'
import { createContext, type ReactNode, useCallback, useContext, useState } from 'react'

interface CashierProviderProps {
  children: ReactNode
}

interface CashierFilterParams {
  is_open?: boolean
  paginated?: boolean
}
interface OpenCashierData {
  code: string
  identification: string
  initial_value: number
}
interface CloseCashierData {
  code: string
}
interface CashierContextData {
  cashiers: Cashier[]
  fetchCashiers: (
    params?: CashierFilterParams,
    updateCashiers?: boolean
  ) => Promise<Cashier[] | Cashier>
  selectedCashier: Cashier | null
  loading: boolean
  fetchCashier: (id: string) => Promise<CashierDetail>
  openCashier: (data: OpenCashierData) => Promise<Cashier>
  closeCashier: (id: string, data: CloseCashierData) => Promise<CashierDetail>
}

// eslint-disable-next-line react-refresh/only-export-components
export const CashierContext = createContext<CashierContextData>({} as CashierContextData)

export function CashierProvider({ children }: Readonly<CashierProviderProps>): React.JSX.Element {
  const [selectedCashier, setSelectedCashier] = useState<Cashier | null>(null)
  const [loading, setLoading] = useState(true)
  const [cashiers, setCashiers] = useState<Cashier[]>([])
  const fetchCashiers = useCallback(
    async (
      params?: CashierFilterParams,
      updateCashiers: boolean = true
    ): Promise<Cashier[] | Cashier> => {
      return new Promise<Cashier[] | Cashier>((resolve, reject) => {
        setLoading(true)
        api
          .get('v1/desktop/financial/cashiers/', {
            params: {
              paginated: false,
              ...params
            }
          })
          .then((response) => {
            const storageCashier = getConfig('selected_cashier_id')
            const data = response?.data?.results || response.data
            if (updateCashiers) {
              setCashiers(data)
              if (data.length > 0 && storageCashier) {
                const foundCashier = data.find((cashier: Cashier) => cashier.id === storageCashier)
                if (foundCashier) {
                  setSelectedCashier(foundCashier)
                } else {
                  setSelectedCashier({
                    id: storageCashier,
                    is_open: false,
                    identification: 'Caixa fechado',
                    initial_value: '0.00',
                    created: ''
                  })
                }
              } else if (data.length > 0 && !storageCashier) {
                setSelectedCashier(data[0])
                setConfig('selected_cashier_id', String(data[0].id))
              } else {
                setSelectedCashier(null)
                setConfig('selected_cashier_id', null)
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
  const fetchCashier = useCallback(async (id: string): Promise<CashierDetail> => {
    return new Promise<CashierDetail>((resolve, reject) => {
      setLoading(true)
      api
        .get(`v1/desktop/financial/cashiers/${id}/`)
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
  }, [])
  const openCashier = useCallback(
    async (data: OpenCashierData): Promise<Cashier> => {
      return new Promise<Cashier>((resolve, reject) => {
        api
          .post('v1/desktop/financial/cashiers/', {
            ...data
          })
          .then((resp) => {
            fetchCashiers({ is_open: true })
            resolve(resp.data)
          })
          .catch((error) => {
            errorActions(error)
            reject(error.response?.data?.detail || 'Erro ao abrir caixa, tente novamente.')
          })
      })
    },
    [fetchCashiers]
  )

  const closeCashier = useCallback(
    async (id: string, data: CloseCashierData): Promise<CashierDetail> => {
      return new Promise<CashierDetail>((resolve, reject) => {
        api
          .patch(`v1/desktop/financial/cashiers/${id}/`, {
            code: data.code
          })
          .then((response) => {
            resolve(response.data)
          })
          .catch((error) => {
            errorActions(error)
            reject(error?.response?.data?.detail || 'Erro ao fechar caixa')
          })
          .finally(() => {})
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
        fetchCashier,
        openCashier,
        closeCashier
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
