import { Container } from '@renderer/components/Container'
import { SearchBox } from '@renderer/components/SearchBox'
import { useBill } from '@renderer/hooks/useBills'
import { BillDetail, Order, Product } from '@renderer/types'
import { Flex, Modal, Typography } from 'antd'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ProductsSelectTable } from './components/productsSelctTable'
import { OrdersResum } from './components/ordersResum'
import { OrderModal } from './components/orderModal'
import { useHotkeys } from 'react-hotkeys-hook'
import api from '@renderer/services/api'
const { Text } = Typography
interface ToAddOrder {
  bill: string
  product: string
  notes: string
  status: string
  quantity: number
  product_name: string
  complements: {
    complement: string
    quantity: number
  }[]
}
export const TerminalSelectedPage: React.FC = () => {
  const { products, fetchProducts, fetchBillById } = useBill()
  const [bill, setBill] = useState<BillDetail | null>(null)
  const [loadingBill, setLoadingBill] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const { id: billId } = useParams()
  const hasUpdatedBills = useRef(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [loadingOrders, setLoadingOrders] = React.useState(false)
  const [orders, setOrders] = React.useState<Order[]>([])
  const [toAddOrders, setToAddOrders] = React.useState<ToAddOrder[]>([])
  const fetchOrders = useCallback((id: string) => {
    setLoadingOrders(true)
    api
      .get(`v1/desktop/operation/bill-orders`, {
        params: {
          bill_id: id
        }
      })
      .then((response) => {
        setOrders(response.data)
      })
      .finally(() => {
        setLoadingOrders(false)
      })
  }, [])
  useEffect(() => {
    if (!hasUpdatedBills.current && billId) {
      setLoadingBill(true)
      fetchBillById(billId)
        .then((data) => {
          setBill(data)
          fetchOrders(data.id)
        })
        .finally(() => {
          setLoadingBill(false)
        })
      setLoadingProducts(true)
      fetchProducts().finally(() => {
        setLoadingProducts(false)
      })
      hasUpdatedBills.current = true
    }
  }, [fetchProducts, fetchBillById, billId, fetchOrders])
  const filteredProducts = (value: string) =>
    products.filter(
      (product) =>
        product.name.toLowerCase().includes(value.toLowerCase()) ||
        (product.code ? product.code.toLocaleLowerCase() === value.toLocaleLowerCase() : false) ||
        product?.slug.toLowerCase().includes(value.toLowerCase()) ||
        product.category.toLowerCase().includes(value.toLowerCase())
    )
  const choseProduct = async (product: Product) => {
    setSelectedProduct(product)
  }

  const onSearch = (value: string) => {
    value = value.trim()
    setSearchTerm(value)
  }

  const navigate = useNavigate()
  const [exitConfirm, setExitConfirm] = useState(false)
  useHotkeys(['q', 'r', 'e'], async (_, handler) => {
    switch (handler.hotkey) {
      case 'q':
        if (toAddOrders.length > 0) {
          if (!exitConfirm) {
            setExitConfirm(true)
          }
        } else {
          try {
            navigate(-1)
          } catch {
            navigate('/terminal')
          }
        }
        break
    }
  })
  return (
    <Container>
      <Modal
        open={exitConfirm}
        onOk={() => {
          try {
            navigate(-1)
          } catch {
            navigate('/terminal')
          }
        }}
        okText="Sair sem salvar"
        cancelText="Cancelar"
        okButtonProps={{
          danger: true
        }}
        onCancel={() => setExitConfirm(false)}
        title="Tem certeza que deseja sair?"
      >
        <Text style={{ fontSize: '1.5rem' }}>
          Você tem pedidos não enviados, se sair agora eles serão perdidos.
        </Text>
      </Modal>
      <ProductsSelectTable
        loadingBill={loadingBill}
        bill={bill}
        loadingProducts={loadingProducts}
        products={products}
        searchTerm={searchTerm}
        filteredProducts={filteredProducts}
        choseProduct={choseProduct}
        goBack={() => {
          if (toAddOrders.length > 0) {
            setExitConfirm(true)
          } else {
            try {
              navigate(-1)
            } catch {
              navigate('/terminal')
            }
          }
        }}
      />
      {window.innerWidth > 920 && (
        <Flex
          vertical
          gap="1rem"
          style={{
            width: '40%',
            maxWidth: '450px',
            minWidth: '350px'
          }}
        >
          <SearchBox
            placeholder="Buscar produto"
            type="text"
            showKeyBoard={false}
            srtartFocus
            onArrow={() => {
              const buttonElement = document.getElementById(
                `button-product-${filteredProducts(searchTerm)[0]?.id}`
              )
              buttonElement?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
              })
              buttonElement?.focus()
            }}
            onTimeSearch={onSearch}
            onSearch={(value) => {
              if (filteredProducts(value).length === 1) {
                setSelectedProduct(filteredProducts(value)[0])
                return
              }
              const buttonElement = document.getElementById(
                `button-product-${filteredProducts(searchTerm)[0]?.id}`
              )
              buttonElement?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
              })
              buttonElement?.focus()
            }}
          />
          <OrdersResum
            loadingBill={loadingOrders}
            orders={orders}
            toAddOrders={toAddOrders}
            onOrdersChange={setToAddOrders}
            onSuccess={() => {
              fetchOrders(billId || '')
            }}
          />
        </Flex>
      )}
      <OrderModal
        billId={billId || ''}
        selectedProduct={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSuccess={(order) => {
          setToAddOrders((prev) => [...prev, order])
        }}
      />
    </Container>
  )
}
