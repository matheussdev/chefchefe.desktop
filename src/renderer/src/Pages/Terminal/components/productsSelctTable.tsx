import { useBill } from '@renderer/hooks/useBills'
import api from '@renderer/services/api'
import { BillDetail, Product } from '@renderer/types'
import { currenyFormat } from '@renderer/utils'
import { Button, Flex, Form, message, Select, Skeleton, Space, Table, Typography } from 'antd'
import { ChevronLeft, Save } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
const { Text } = Typography
interface ProductsSelectTableProps {
  loadingBill: boolean
  bill: BillDetail | null
  loadingProducts: boolean
  products: Product[]
  searchTerm: string
  filteredProducts: (searchTerm: string) => Product[]
  choseProduct: (product: Product) => void
  goBack?: () => void
}
export const ProductsSelectTable: React.FC<ProductsSelectTableProps> = ({
  loadingBill,
  bill,
  loadingProducts,
  products,
  searchTerm,
  filteredProducts,
  choseProduct,
  goBack
}) => {
  const { tables, fetchTables } = useBill()
  const render = useRef(false)
  useEffect(() => {
    if (!render.current) {
      fetchTables()
      render.current = true
    }
  }, [fetchTables])
  const [messageApi, contextHolder] = message.useMessage()
  const [loadingChangeTable, setLoadingChangeTable] = useState(false)
  const categories = Array.from(
    new Set(filteredProducts(searchTerm).map((product) => product.category))
  )
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  return (
    <Flex
      vertical
      style={{
        width: '100%',
        minWidth: '600px'
      }}
      gap="1rem"
    >
      {contextHolder}
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
        <Flex wrap="wrap" gap="0.5rem" align="center">
          <Button
            icon={<ChevronLeft size={20} />}
            onClick={() => {
              goBack?.()
            }}
            style={{ fontSize: '2rem' }}
            size="large"
          >
            <Text style={{ fontSize: '1.5rem' }} strong>
              Voltar
            </Text>
          </Button>
          <Text
            strong
            style={{
              marginRight: '0.5rem',
              fontSize: '1.8rem'
            }}
          >
            Comanda {bill?.number || bill?.identification || bill?.table_number || 'N/A'}
          </Text>
          <Form
            style={{ marginLeft: 'auto' }}
            onFinish={(values) => {
              setLoadingChangeTable(true)
              api
                .patch(`v1/desktop/operation/bills/${bill?.id}/`, {
                  table: values.table
                })
                .then(() => {
                  messageApi.success('Mesa alterada com sucesso')
                  fetchTables()
                })
                .catch(() => {
                  messageApi.error('Erro ao alterar mesa')
                })
                .finally(() => {
                  setLoadingChangeTable(false)
                })
            }}
          >
            <Space.Compact size="large">
              <Form.Item name="table" label="Mesa" noStyle initialValue={bill?.table || undefined}>
                <Select
                  disabled={loadingChangeTable}
                  style={{
                    width: 120
                  }}
                  placeholder="Sem mesa"
                  size="large"
                  options={[
                    { label: 'Sem mesa', value: undefined },
                    ...tables.map((table) => ({
                      label: 'Mesa ' + table.number,
                      value: table.id,
                      number: table.number
                    }))
                  ]}
                  showSearch={{
                    optionFilterProp: 'number'
                  }}
                  onSelect={() => {
                    window.document.getElementById('button-change-table')?.focus()
                  }}
                />
              </Form.Item>
              <Button
                id="button-change-table"
                icon={<Save size={16} />}
                size="large"
                htmlType="submit"
                loading={loadingChangeTable}
              >
                Salvar
              </Button>
            </Space.Compact>
          </Form>
        </Flex>
      </Skeleton>
      <Table
        loading={loadingProducts || loadingBill}
        dataSource={categories.map((category) => ({ category }))}
        pagination={false}
        scroll={{
          y: window.innerHeight - 220
        }}
        virtual
        rowKey={(record) => record.category}
        onRow={(record) => {
          return {
            style: {
              cursor: 'pointer'
            },
            onClick: () => {
              if (expandedCategories.includes(record.category)) {
                setExpandedCategories(expandedCategories.filter((cat) => cat !== record.category))
              } else {
                setExpandedCategories([record.category])
              }
            }
          }
        }}
        showHeader={false}
        columns={[
          {
            title: 'Categorias',
            dataIndex: 'category',
            key: 'category',
            render: (value) => (
              <Text style={{ fontSize: '1.5rem', fontWeight: '500' }}>{value}</Text>
            )
          }
        ]}
        expandable={{
          columnWidth: 50,
          expandedRowKeys: expandedCategories,
          expandedRowRender: (category) => {
            const productsByCategory = filteredProducts(searchTerm).filter(
              (product) => product.category === category.category
            )
            return (
              <Table
                loading={loadingProducts || loadingBill}
                dataSource={productsByCategory}
                size="small"
                pagination={false}
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
                        disabled={loadingBill || loadingProducts}
                        id={`button-product-${record.id}`}
                        size="large"
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
                        <Text style={{ fontSize: '1.5rem', fontWeight: '500' }}> {value}</Text>
                      </Button>
                    )
                  },
                  // {
                  //   title: 'Categoria',
                  //   dataIndex: 'category',
                  //   key: 'category',
                  //   render: (value) => <Text style={{ fontSize: '1.2rem' }}>{value || '-'}</Text>
                  // },
                  {
                    title: 'Preço',
                    dataIndex: 'price',
                    key: 'price',
                    render: (value) => (
                      <Text style={{ fontSize: '1.2rem' }}>
                        {value ? currenyFormat(Number(value)) : '-'}
                      </Text>
                    )
                  }
                ]}
              />
            )
          }
        }}
      />
    </Flex>
  )
}
