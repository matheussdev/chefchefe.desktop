import { Container } from '@renderer/components/Container'
import { SearchBox } from '@renderer/components/SearchBox'
import { useBill } from '@renderer/hooks/useBills'
import { Bill, Product } from '@renderer/types'
import { Flex, message } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ProductsSelectTable } from './components/productsSelctTable'
import { OrdersResum } from './components/ordersResum'
import { OrderModal } from './components/orderModal'
import { useHotkeys } from 'react-hotkeys-hook'

export const TerminalSelectedPage: React.FC = () => {
  const { products, fetchProducts, fetchBillById } = useBill()
  const [bill, setBill] = useState<Bill | null>(null)
  const [loadingBill, setLoadingBill] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const { id: billId } = useParams()
  const hasUpdatedBills = useRef(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [, contextHolder] = message.useMessage()
  useEffect(() => {
    if (!hasUpdatedBills.current && billId) {
      setLoadingBill(true)
      fetchBillById(billId)
        .then((data) => {
          setBill(data)
        })
        .finally(() => {
          setLoadingBill(false)
        })
      setLoadingProducts(true)
      fetchProducts()
        .then((p) => {
          setTimeout(() => {
            const element = document.getElementById('button-product-' + p[0]?.id)
            element?.focus()
          }, 300)
        })
        .finally(() => {
          setLoadingProducts(false)
        })
      hasUpdatedBills.current = true
    }
  }, [fetchProducts, fetchBillById, billId])
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
    const filtered = filteredProducts(value)
    if (filtered.length === 1) {
      choseProduct(filtered[0])
    } else {
      setSelectedProduct(null)
      // focus first item if exists
      if (filtered.length > 0) {
        const buttonElement = document.getElementById(`button-product-${filtered[0].id}`)
        buttonElement?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        })
        buttonElement?.focus()
      }
    }
  }
  const navigate = useNavigate()

  useHotkeys(['q', 'r', 'e'], async (_, handler) => {
    switch (handler.hotkey) {
      case 'q':
        navigate(-1)
        break
      case 'r':
        await window.api.reloadApp()
        break
      case 'e':
        navigate(`/comandas/${billId}`)
    }
  })

  return (
    <Container>
      {contextHolder}
      <ProductsSelectTable
        loadingBill={loadingBill}
        bill={bill}
        loadingProducts={loadingProducts}
        products={products}
        searchTerm={searchTerm}
        filteredProducts={filteredProducts}
        choseProduct={choseProduct}
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
          <SearchBox placeholder="Buscar produto" type="text" onSearch={onSearch} />
          <OrdersResum loadingBill={loadingBill} bill={bill} />
        </Flex>
      )}
      <OrderModal
        billId={billId || ''}
        selectedProduct={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSuccess={(order) => {
          setSelectedProduct(null)
          setSearchTerm('')
          setBill((prev) => {
            if (!prev) return prev
            return {
              ...prev,
              orders: [order, ...(prev?.orders || [])]
            }
          })
        }}
      />
    </Container>
  )
}
