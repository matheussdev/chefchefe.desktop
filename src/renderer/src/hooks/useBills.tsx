import api from '@renderer/services/api'
import { Bill, Table, Product } from '@renderer/types'
import { errorActions } from '@renderer/utils'
import { createContext, type ReactNode, useCallback, useContext, useState } from 'react'

interface BillProviderProps {
  children: ReactNode
}

interface BillContextData {
  bills: Bill[]
  fetchBills: (params?: any, updateBills?: boolean) => Promise<Bill[] | Bill>
  fetchBillById: (id: string) => Promise<Bill>
  fetchTables: () => Promise<Table[] | Table>
  tables: Table[]
  products: Product[]
  fetchProducts: () => Promise<Product[] | Product>
}


// eslint-disable-next-line react-refresh/only-export-components
export const BillContext = createContext<BillContextData>({} as BillContextData)

export function BillProvider({ children }: Readonly<BillProviderProps>): React.JSX.Element {
  const [bills, setBills] = useState<Bill[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const fetchBills = useCallback(async (params?: any, updateBills: boolean = true): Promise<Bill[] | Bill> => {
    return new Promise<Bill[] | Bill>((resolve, reject) => {
      api
        .get('v1/desktop/bills/', {
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
  }, [])
  const fetchTables = useCallback(async (): Promise<Table[] | Table> => {
    return new Promise<Table[] | Table>((resolve, reject) => {
      api
        .get('v1/desktop/tables/', {
          params: {
            paginated: false
          }
        })
        .then((response) => {
          setTables(response.data)
          resolve(response.data)
        })
        .catch((error) => {
          errorActions(error)
          reject(error?.response?.data?.detail || 'Erro ao buscar mesas')
        })
    })
  }, [])
  const fetchBillById = useCallback(async (id: string): Promise<Bill> => {
    return new Promise<Bill>((resolve, reject) => {
      api
        .get(`v1/desktop/bills/${id}/`)
        .then((response) => {
          resolve(response.data)
        })
        .catch((error) => {
          errorActions(error)
          reject(error?.response?.data?.detail || 'Erro ao buscar comanda')
        })
    })
  }, [])
  const fetchProducts = useCallback(async (): Promise<Product[] | Product> => {
    return new Promise<Product[] | Product>((resolve, reject) => {
      api
        .get('v1/desktop/products/')
        .then((response) => {
          setProducts(response.data)
          resolve(response.data)
        })
        .catch((error) => {
          errorActions(error)
          reject(error?.response?.data?.detail || 'Erro ao buscar produtos')
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
        tables,
        bills,
        products
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
