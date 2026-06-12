import { useBill } from '@renderer/hooks/useBills'
import { Order } from '@renderer/types'
import { currenyFormat } from '@renderer/utils'
import { Flex, message, Table, Typography } from 'antd'
import { useEffect, useRef } from 'react'
const { Text } = Typography
interface OrdersSelectTableProps {
  loadingProducts: boolean
  orders: Order[]
}
export const OrdersSelectTable: React.FC<OrdersSelectTableProps> = ({
  loadingProducts,
  orders
}) => {
  const { fetchTables } = useBill()
  const render = useRef(false)
  useEffect(() => {
    if (!render.current) {
      fetchTables()
      render.current = true
    }
  }, [fetchTables])
  const [, contextHolder] = message.useMessage()
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
      <Table
        loading={loadingProducts}
        dataSource={orders}
        size="small"
        pagination={false}
        onRow={(record) => {
          return {
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
            title: 'Pedido',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity, order) => `${quantity}x ${order.product_name}`
          },
          {
            title: 'Preço',
            dataIndex: 'total_price',
            key: 'total_price',
            render: (value) => <Text>{value ? currenyFormat(Number(value)) : '-'}</Text>
          }
        ]}
      />
    </Flex>
  )
}
