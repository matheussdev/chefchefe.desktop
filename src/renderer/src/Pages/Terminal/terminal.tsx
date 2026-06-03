import { Container } from '@renderer/components/Container'
import { SearchBox } from '@renderer/components/SearchBox'
import { useBill } from '@renderer/hooks/useBills'
import { BillDetail, Order, Product } from '@renderer/types'
import { Button, Flex, Form, Input, message, Modal } from 'antd'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ProductsSelectTable } from './components/productsSelctTable'
import { OrdersResum } from './components/ordersResum'
import { OrderModal } from './components/orderModal'
import { useHotkeys } from 'react-hotkeys-hook'
import api from '@renderer/services/api'
import { getConfig } from '@renderer/services/auth'
export const TerminalSelectedPage: React.FC = () => {
  const { products, fetchProducts, fetchBillById } = useBill()
  const [bill, setBill] = useState<BillDetail | null>(null)
  const [loadingBill, setLoadingBill] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const { id: billId } = useParams()
  const hasUpdatedBills = useRef(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [messageApi, contextHolder] = message.useMessage()
  const [loadingOrders, setLoadingOrders] = React.useState(false)
  const [orders, setOrders] = React.useState<Order[]>([])
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
        product?.slug.toLowerCase().includes(value.toLowerCase())
    )
  const choseProduct = async (product: Product) => {
    setSelectedProduct(product)
  }

  const onSearch = (value: string) => {
    value = value.trim()
    setSearchTerm(value)
  }

  const navigate = useNavigate()

  useHotkeys(['q', 'r', 'e'], async (_, handler) => {
    switch (handler.hotkey) {
      case 'q':
        navigate(-1)
        break
    }
  })
  const [defaultCode, setDefaultCode] = useState('')
  const [employeeName, setEmployeeName] = useState('')
  const savedCode = getConfig('terminal-saved-code') || ''
  const [loaingFindingCode, setLoadingFindingCode] = useState(false)
  return (
    <Container>
      {contextHolder}
      <ProductsSelectTable
        waiterName={employeeName}
        loadingBill={loadingBill}
        bill={bill}
        loadingProducts={loadingProducts}
        products={products}
        searchTerm={searchTerm}
        filteredProducts={filteredProducts}
        choseProduct={choseProduct}
      />
      <Modal
        title="Código do garçom"
        open={!defaultCode && !savedCode}
        onCancel={() => {}}
        footer={null}
        closeIcon={null}
      >
        <Form
          layout="vertical"
          onFinish={(values) => {
            const code = values.code.trim()
            setLoadingFindingCode(true)
            api
              .get('v1/desktop/find-employee/', {
                params: {
                  code
                }
              })
              .then((response) => {
                if (response.data) {
                  setDefaultCode(code)
                  setEmployeeName(response.data.name)
                }
              })
              .catch(() => {
                messageApi.error('Código inválido')
              })
              .finally(() => {
                setLoadingFindingCode(false)
              })
          }}
        >
          <Form.Item
            name="code"
            required
            rules={[{ required: true, message: 'Digite o código do garçom' }]}
          >
            <Input
              className="custom-input"
              type="password"
              size="large"
              placeholder="Digite o código do garçom"
              autoComplete="off"
              id="waiter-code-input"
            />
          </Form.Item>
          <Form.Item>
            <Flex gap="1rem" justify="end">
              <Button
                htmlType="submit"
                type="primary"
                size="large"
                block
                loading={loaingFindingCode}
                onClick={() => {
                  const inputElement = document.getElementById(
                    'waiter-code-input'
                  ) as HTMLInputElement
                  inputElement?.focus()
                }}
              >
                Salvar
              </Button>
            </Flex>
          </Form.Item>
        </Form>
      </Modal>

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
            onSearch={() => {
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
          <OrdersResum loadingBill={loadingOrders} orders={orders} />
        </Flex>
      )}
      <OrderModal
        savedCode={defaultCode || savedCode}
        billId={billId || ''}
        selectedProduct={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSuccess={(order) => {
          setSelectedProduct(null)
          setSearchTerm('')
          setOrders((prev) => [order, ...prev])
        }}
      />
    </Container>
  )
}
