import { Product } from '@renderer/types'
import { Button, Flex, Table, Typography } from 'antd'
const { Text } = Typography
interface ProductsSelectTableProps {
  loadingProducts: boolean
  products: Product[]
  searchTerm: string
  filteredProducts: (searchTerm: string) => Product[]
  choseProduct: (product: Product) => void
}
export const ProductsSelectTable: React.FC<ProductsSelectTableProps> = ({
  loadingProducts,
  products,
  searchTerm,
  filteredProducts,
  choseProduct
}) => {
  return (
    <Flex
      vertical
      style={{
        width: '100%',
        minWidth: '600px'
      }}
      gap="1rem"
    >
      <Flex wrap="wrap" gap="0.5rem" align="center">
        <Text strong>Vendas Balcão</Text>
      </Flex>
      <Table
        loading={loadingProducts}
        dataSource={searchTerm ? filteredProducts(searchTerm) : products}
        size="small"
        pagination={false}
        scroll={{
          y: window.innerHeight - 185
        }}
        virtual
        onRow={(record) => {
          return {
            onClick: () => {
              choseProduct(record)
            },
            style: {
              cursor: 'pointer'
            },
            id: `product-${record.id}`,
            onFocus: () => {
              const element = document.getElementById(`product-${record.id}`)
              element?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
              })
            }
          }
        }}
        rowKey={(record) => record.id}
        columns={[
          {
            title: 'Código',
            dataIndex: 'code',
            key: 'code',
            width: 70,
            render: (value) => value || '-'
          },
          {
            title: 'Produto',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            render: (value, record, index) => (
              <Button
                type="text"
                id={`button-product-${record.id}`}
                size="small"
                onKeyDown={(e) => {
                  // if anyLetter or number key is pressed, focus next element
                  // aarow down key
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    const nextElement = document.getElementById(
                      `button-product-${searchTerm ? filteredProducts(searchTerm)[index + 1]?.id : products[index + 1]?.id}`
                    )
                    nextElement?.focus()
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    const prevElement = document.getElementById(
                      `button-product-${searchTerm ? filteredProducts(searchTerm)[index - 1]?.id : products[index - 1]?.id}`
                    )
                    prevElement?.focus()
                  }
                }}
              >
                {value}
              </Button>
            )
          },
          {
            title: 'Categoria',
            dataIndex: 'category',
            key: 'category'
          },
          {
            title: 'Preço',
            dataIndex: 'price',
            key: 'price',
            render: (value) => `R$ ${value}`
          }
        ]}
      />
    </Flex>
  )
}
