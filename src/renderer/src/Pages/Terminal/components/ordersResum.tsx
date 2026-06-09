import api from '@renderer/services/api'
import { getConfig } from '@renderer/services/auth'
import { Order } from '@renderer/types'
import { currenyFormat, errorActions } from '@renderer/utils'
import { printOrderBillReceipt } from '@renderer/utils/Printers'
import { Button, Flex, Form, Input, message, Modal, Table, Typography } from 'antd'
import { SendHorizonal, Trash2 } from 'lucide-react'
import { useCallback, useState } from 'react'
const { Text } = Typography

interface ToAddOrder {
  bill: string
  product: string
  product_name: string
  notes: string
  status: string
  quantity: number
  complements: {
    complement: string
    quantity: number
  }[]
}
interface OrdersResumProps {
  loadingBill: boolean
  orders?: Order[]
  toAddOrders?: ToAddOrder[]
  onOrdersChange?: (orders: ToAddOrder[]) => void
  onSuccess?: (order: Order[]) => void
}
export const OrdersResum: React.FC<OrdersResumProps> = ({
  loadingBill,
  orders,
  toAddOrders,
  onOrdersChange,
  onSuccess
}) => {
  const [messageApi, contextHolder] = message.useMessage()
  const savedCode = getConfig('terminal-saved-code') || ''
  const [loadingAdd, setLoadingAdd] = useState(false)
  const [confirmModal, setConfirmModal] = useState(false)
  const finishOrders = useCallback(
    async (values) => {
      if (loadingAdd) return
      setLoadingAdd(true)
      api
        .post('v1/desktop/operation/orders/', {
          data: toAddOrders,
          code: savedCode || values.code
        })
        .then((response) => {
          const result: {
            printer: string
            orders: Order[]
          }[] = response.data

          result.forEach(({ printer, orders }) => {
            printOrderBillReceipt(orders, printer)
          })
          messageApi.success('Pedidos enviados com sucesso')
          onSuccess?.(result.flatMap((r) => r.orders))
          onOrdersChange?.([])
          setLoadingAdd(false)
          setConfirmModal(false)
        })
        .catch((err) => {
          errorActions(err)
          setLoadingAdd(false)
          messageApi.error(err?.response?.data?.detail || 'Erro ao enviar pedidos')
        })
    },
    [savedCode, toAddOrders, loadingAdd, messageApi, onOrdersChange, onSuccess]
  )

  const [form] = Form.useForm()
  return (
    <Flex vertical gap="1rem" style={{ padding: '0.5rem' }}>
      {contextHolder}
      <Modal
        open={confirmModal}
        onCancel={() => setConfirmModal(false)}
        footer={null}
        title="Enviar pedidos"
        afterOpenChange={(open) => {
          if (open) {
            form.getFieldInstance('code')?.focus()
          } else {
            form.resetFields()
          }
        }}
      >
        <Table
          loading={loadingBill}
          size="small"
          dataSource={toAddOrders || []}
          pagination={false}
          virtual
          scroll={{
            y: window.innerHeight - 300
          }}
          style={{
            marginBottom: '1rem'
          }}
          rowKey={(record, i) => record.product + i}
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
              minWidth: 150
            }
          ]}
        />
        <Form layout="vertical" onFinish={finishOrders} form={form}>
          {!savedCode && (
            <Form.Item
              label="Código do garçom"
              name="code"
              required
              rules={[{ required: true, message: 'Por favor, insira o código do garçom' }]}
            >
              <Input.Password className="custom-input" placeholder="Código do pedido" />
            </Form.Item>
          )}
          <Form.Item>
            <Button
              className="custom-input"
              icon={<SendHorizonal size={16} />}
              type="primary"
              htmlType="submit"
              loading={loadingAdd}
              block
            >
              Enviar pedidos
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      {toAddOrders && toAddOrders.length > 0 && (
        <Table
          loading={loadingBill}
          title={() => (
            <Flex justify="space-between" align="center">
              <Text strong>Para lançar</Text>
              <Text>
                <Button
                  onClick={() => {
                    setConfirmModal(true)
                  }}
                  variant="solid"
                  color="green"
                  disabled={loadingAdd}
                  icon={<SendHorizonal size={16} />}
                >
                  Enviar pedidos
                </Button>
              </Text>
            </Flex>
          )}
          size="small"
          dataSource={toAddOrders || []}
          pagination={false}
          virtual
          scroll={{
            y: window.innerHeight - 476
          }}
          rowKey={(record, i) => record.product + i}
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
              minWidth: 150
            },
            {
              title: '',
              dataIndex: 'action',
              key: 'action',
              width: 50,
              render: (_, __, index) => (
                <Button
                  icon={<Trash2 size={16} />}
                  size="small"
                  danger
                  onClick={() => {
                    const newOrders = [...(toAddOrders || [])]
                    newOrders.splice(index, 1)
                    onOrdersChange?.(newOrders)
                  }}
                ></Button>
              )
            }
          ]}
        />
      )}
      <Table
        loading={loadingBill}
        title={() => (
          <Flex justify="space-between" align="center">
            <Text strong>Pedidos lançados</Text>
            <Text>
              {currenyFormat(
                orders?.reduce((acc, order) => acc + Number(order.total_price), 0) || 0
              )}
            </Text>
          </Flex>
        )}
        size="small"
        dataSource={orders || []}
        pagination={false}
        virtual
        scroll={{
          y: window.innerHeight - 476
        }}
        rowKey={(record) => record.id}
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
            minWidth: 150
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
    </Flex>
  )
}
