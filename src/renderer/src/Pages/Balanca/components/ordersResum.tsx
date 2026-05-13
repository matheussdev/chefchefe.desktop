import { Bill } from '@renderer/types'
import { currenyFormat } from '@renderer/utils'
import { Flex, Table, Typography } from 'antd'
const { Text } = Typography
interface OrdersResumProps {
  loadingBill: boolean
  bill: Bill | null
}
export const OrdersResum: React.FC<OrdersResumProps> = ({ loadingBill, bill }) => {
  return (
    <Table
      loading={loadingBill}
      title={() => (
        <Flex justify="space-between" align="center">
          <Text strong>Pedidos</Text>
          <Text>
            {currenyFormat(
              bill?.orders?.reduce((acc, order) => acc + Number(order.total_price), 0) || 0
            )}
          </Text>
        </Flex>
      )}
      size="small"
      dataSource={bill?.orders || []}
      pagination={false}
      virtual
      style={{
        width: '100%',
      }}
      scroll={{
        y: window.innerHeight - 250
      }}
      columns={[
        {
          title: 'qtd',
          dataIndex: 'quantity',
          key: 'quantity',
          render: (value) => Number(value) + 'x',
          width: 70
        },
        {
          title: 'produto',
          dataIndex: 'product_name',
          key: 'product',
          minWidth: 150,
          ellipsis: true
        },
        {
          title: 'total',
          dataIndex: 'total_price',
          key: 'total',
          width: 100,
          render: (value) => `${currenyFormat(Number(value))}`
        }
      ]}
    />
  )
}
