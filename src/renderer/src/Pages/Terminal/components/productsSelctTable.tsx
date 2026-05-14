import { Bill, Product } from '@renderer/types'
import { Button, Flex, Skeleton, Table, Typography } from 'antd'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
const { Text } = Typography
interface ProductsSelectTableProps {
  loadingBill: boolean
  bill: Bill | null
  loadingProducts: boolean
  products: Product[]
  searchTerm: string
  filteredProducts: (searchTerm: string) => Product[]
  choseProduct: (product: Product) => void
}
export const ProductsSelectTable: React.FC<ProductsSelectTableProps> = ({
  loadingBill,
  bill,
  loadingProducts,
  products,
  searchTerm,
  filteredProducts,
  choseProduct
}) => {
  const navigate = useNavigate()
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
        <Skeleton
          loading={loadingBill}
          active
          paragraph={false}
          title={{
            width: 200
          }}
          style={{
            marginBottom: 8
          }}
        >
          <Button
            icon={<ChevronLeft size={16} />}
            onClick={() => {
              navigate(-1)
            }}
            type="text"
            style={{ padding: '0rem' }}
          >
            Voltar (Q)
          </Button>
          <Text
            strong
            style={{
              marginRight: '0.5rem'
            }}
          >
            Comanda {bill?.number || bill?.identification || bill?.table_number || 'N/A'}
          </Text>
        </Skeleton>
        <Button
          onClick={() => {
            navigate(`/comandas/${bill?.id}`)
          }}
          type="primary"
          style={{
            marginLeft: 'auto'
          }}
        >
          Finalizar Comanda (e)
        </Button>
      </Flex>
      <Table
        loading={loadingProducts || loadingBill}
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
