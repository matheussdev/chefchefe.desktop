import { Container } from '@renderer/components/Container'
import { SearchBox } from '@renderer/components/SearchBox'
import { useBill } from '@renderer/hooks/useBills'
import { CartProduct, Product } from '@renderer/types'
import { Flex, message } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { ProductsSelectTable } from './components/productsSelctTable'
import { OrdersResum } from './components/ordersResum'
import { OrderModal } from './components/orderModal'
import { BillPriceResum } from './components/BillPriceResum'

export const BalcaoPage: React.FC = () => {
  const { products, fetchProducts, fetchBillById } = useBill()
  const [loadingProducts, setLoadingProducts] = useState(false)
  const hasUpdatedBills = useRef(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [, contextHolder] = message.useMessage()
  useEffect(() => {
    if (!hasUpdatedBills.current) {
      setLoadingProducts(true)
      fetchProducts().finally(() => {
        setLoadingProducts(false)
      })
      hasUpdatedBills.current = true
    }
  }, [fetchProducts, fetchBillById])
  const filteredProducts = (value: string) =>
    products.filter(
      (product) =>
        product.name.toLowerCase().includes(value.toLowerCase()) ||
        (product.code ? product.code.toLocaleLowerCase() === value.toLocaleLowerCase() : false) ||
        product?.slug.toLowerCase().includes(value.toLowerCase()) ||
        product.category.toLowerCase().includes(value.toLowerCase()) ||
        product.description.toLowerCase().includes(value.toLowerCase())
    )
  const choseProduct = async (product: Product) => {
    setSelectedProduct(product)
  }

  const onSearch = (value: string) => {
    value = value.trim()
    setSearchTerm(value)
  }

  const [cartProducts, setCartProducts] = useState<CartProduct[]>(
    localStorage.getItem('balcao_cart')
      ? JSON.parse(localStorage.getItem('balcao_cart') || '[]')
      : []
  )
  return (
    <Container>
      {contextHolder}
      <ProductsSelectTable
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
          <BillPriceResum
            orders={cartProducts}
            subtotal={cartProducts.reduce((acc, item) => acc + Number(item.total_price), 0) || 0}
          />
          <OrdersResum loadingBill={false} orders={cartProducts} />
        </Flex>
      )}
      <OrderModal
        selectedProduct={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSuccess={(order) => {
          console.log('Order added:', order)
          setCartProducts((prev) => [...prev, order])
          setSelectedProduct(null)
          setSearchTerm('')
          localStorage.setItem('balcao_cart', JSON.stringify([...cartProducts, order]))
        }}
      />
    </Container>
  )
}
