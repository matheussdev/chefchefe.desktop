import api from '@renderer/services/api'
import { getCache, setCache } from '@renderer/services/auth'
import { Bill, Table, Product, BillDetail } from '@renderer/types'
import { errorActions } from '@renderer/utils'
import { createContext, type ReactNode, useCallback, useContext, useState } from 'react'

interface BillProviderProps {
  children: ReactNode
}

interface BillParams {
  cashier_id?: string
  table_id?: string
  is_open?: boolean
  paginated?: boolean
  free_group?: boolean
  current_group?: string
}

interface OpenBillParams {
  number: number
  table?: string
  identification?: string
  code: string
}

interface BillContextData {
  bills: Bill[]
  fetchBills: (params?: BillParams, updateBills?: boolean) => Promise<Bill[]>
  fetchBillById: (id: string, force?: boolean) => Promise<BillDetail>
  fetchTables: () => Promise<Table[] | Table>
  tables: Table[]
  products: Product[]
  fetchProducts: () => Promise<Product[] | Product>
  openBill: (params: OpenBillParams) => Promise<BillDetail>
  selectedBill: BillDetail | null
}

// eslint-disable-next-line react-refresh/only-export-components
export const BillContext = createContext<BillContextData>({} as BillContextData)

export function BillProvider({ children }: Readonly<BillProviderProps>): React.JSX.Element {
  const [bills, setBills] = useState<Bill[]>([])
  const [selectedBill, setSelectedBill] = useState<BillDetail | null>(null)
  const [tables, setTables] = useState<Table[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const fetchBills = useCallback(
    async (params?: BillParams, updateBills: boolean = true): Promise<Bill[]> => {
      return new Promise<Bill[]>((resolve, reject) => {
        if (updateBills) {
          setSelectedBill(null)
        }
        api
          .get('v1/desktop/operation/bills/', {
            params: {
              paginated: false,
              ...params
            }
          })
          .then((response) => {
            if (updateBills) {
              setBills(response.data)
            }
            resolve(response.data)
          })
          .catch((error) => {
            errorActions(error)
            reject(error?.response?.data?.detail || 'Erro ao buscar comandas')
          })
      })
    },
    []
  )
  const fetchTables = useCallback(async (): Promise<Table[]> => {
    return new Promise<Table[]>((resolve, reject) => {
      const cachedTables = getCache('tables')
      if (cachedTables) {
        setTables(cachedTables as Table[])
        resolve(cachedTables as Table[])
        return
      }
      api
        .get('v1/desktop/operation/tables/')
        .then((response) => {
          setCache('tables', response.data, 60 * 60 * 3) // Cache por 3 horas
          setTables(response.data)
          resolve(response.data)
        })
        .catch((error) => {
          errorActions(error)
          reject(error?.response?.data?.detail || 'Erro ao buscar mesas')
        })
    })
  }, [])

  const fetchBillById = useCallback(
    async (id: string, force?: boolean): Promise<BillDetail> => {
      return new Promise<BillDetail>((resolve, reject) => {
        if (!force && selectedBill && selectedBill.id === id) {
          resolve(selectedBill)
          return
        }
        api
          .get(`v1/desktop/operation/bills/${id}/`)
          .then((response) => {
            resolve(response.data)
            setSelectedBill(response.data)
          })
          .catch((error) => {
            errorActions(error)
            reject(error?.response?.data?.detail || 'Erro ao buscar comanda')
          })
      })
    },
    [selectedBill]
  )
  const fetchProducts = useCallback(async (): Promise<Product[] | Product> => {
    return new Promise<Product[] | Product>((resolve, reject) => {
      const cachedProducts = getCache('products')
      if (cachedProducts) {
        setProducts(cachedProducts as Product[])
        resolve(cachedProducts as Product[])
        return
      }
      api
        .get('v1/desktop/products/')
        .then((response) => {
          setProducts(response.data)
          setCache('products', response.data, 60 * 60 * 3) // Cache por 3 horas
          resolve(response.data)
        })
        .catch((error) => {
          errorActions(error)
          reject(error?.response?.data?.detail || 'Erro ao buscar produtos')
        })
    })
  }, [])

  const openBill = useCallback(async (params: OpenBillParams): Promise<BillDetail> => {
    return new Promise<BillDetail>((resolve, reject) => {
      api
        .post('v1/desktop/operation/bills/', {
          ...params
        })
        .then((res) => {
          setBills((prevBills) => {
            const newBills = [
              ...prevBills,
              {
                id: res.data.id,
                number: res.data.number,
                is_open: res.data.is_open,
                identification: res.data.identification,
                table: res.data.table
              }
            ]
            newBills.sort((a, b) => a.number - b.number)
            return newBills
          })
          setSelectedBill(res.data)
          resolve(res.data)
        })
        .catch((error) => {
          errorActions(error)
          reject(error.response?.data?.detail || 'Erro ao criar comanda')
        })
    })
  }, [])

  return (
    <BillContext.Provider
      value={{
        fetchBills,
        fetchBillById,
        fetchTables,
        fetchProducts,
        openBill,
        tables,
        bills,
        products,
        selectedBill
      }}
    >
      {children}
    </BillContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBill(): BillContextData {
  const context = useContext(BillContext)
  return context
}
