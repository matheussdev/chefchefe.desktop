import { useBill } from '@renderer/hooks/useBills'
import api from '@renderer/services/api'
import { BillDetail, Product } from '@renderer/types'
import { currenyFormat } from '@renderer/utils'
import { Button, Flex, Form, message, Select, Skeleton, Space, Table, Typography } from 'antd'
import { ChevronLeft, Save } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
const { Text } = Typography
interface ProductsSelectTableProps {
  loadingBill: boolean
  bill: BillDetail | null
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
            <Space.Compact>
              <Form.Item name="table" label="Mesa" noStyle initialValue={bill?.table || undefined}>
                <Select
                  disabled={loadingChangeTable}
                  style={{
                    width: 120
                  }}
                  placeholder="Sem mesa"
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
                htmlType="submit"
                loading={loadingChangeTable}
              >
                Salvar
              </Button>
            </Space.Compact>
          </Form>
        </Skeleton>
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
          {
            title: 'Categoria',
            dataIndex: 'category',
            key: 'category',
            render: (value) => <Text style={{ fontSize: '1.2rem' }}>{value || '-'}</Text>
          },
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
    </Flex>
  )
}
