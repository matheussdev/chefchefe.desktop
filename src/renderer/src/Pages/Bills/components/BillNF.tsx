import React from 'react'
import { Button, Divider, Flex, Input, InputNumber, message, Select, Table, Typography } from 'antd'
import { useBill } from '@renderer/hooks/useBills'
import { ArrowRight, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '@renderer/hooks/useAuth'
import { brlToNumber, formatToBRL, formatToKilos } from '@renderer/utils/currency'
import api from '@renderer/services/api'
import { errorActions } from '@renderer/utils'
const { Title, Text } = Typography
interface BillNFProps {
  orders?: {
    name: string
    price: number
    quantity: number
    product_id: string
    paid_value: number
  }[]
  sale_id?: string
  bills: string
  total_paid: number
  onSuccess?: () => void
}

export const BillNF: React.FC<BillNFProps> = ({
  orders,
  sale_id,
  bills,
  total_paid,
  onSuccess
}) => {
  const { products, fetchProducts } = useBill()
  const { restaurant } = useAuth()
  React.useEffect(() => {
    fetchProducts()
  }, [fetchProducts])
  const [items, setItems] = React.useState<
    { name: string; price: number; quantity: number; product_id: string; paid_value: number }[]
  >(orders || [])
  const [payments, setPayments] = React.useState<{ method: string; amount: string }[]>([])
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const [loadingEmit, setLoadingEmit] = React.useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  return (
    <>
      {contextHolder}
      <Flex vertical>
        <Title level={4}>Comandas {bills}</Title>
        <Text>Total pago: R$ {formatToBRL(total_paid?.toFixed(2) || '0.00')}</Text>
        <Text>
          Valor restante: R${' '}
          {formatToBRL((total - total_paid < 0 ? total - total_paid : 0).toFixed(2))}
        </Text>
      </Flex>
      <Divider />
      <Table
        style={{ marginBottom: '1rem' }}
        size="small"
        title={() => 'Itens da Nota Fiscal'}
        dataSource={items}
        pagination={false}
        columns={[
          {
            title: 'Produto',
            dataIndex: 'name',
            key: 'name',
            width: 300,
            render: (_, record, index) => (
              <Select
                style={{ width: '100%', maxWidth: 400 }}
                options={products.map((product) => ({
                  label: `${product.code ? `[${product.code}] ` : ''}${product.name} - ${product.category}`,
                  value: product.id
                }))}
                size="large"
                showSearch={{
                  optionFilterProp: 'label'
                }}
                value={record.product_id}
                onChange={(value) => {
                  setItems((prev) => {
                    const product = products.find((product) => product.id === value)
                    if (index !== -1 && product) {
                      const newItems = [...prev]
                      newItems[index] = {
                        ...newItems[index],
                        name: product.name,
                        price: Number(product.price),
                        product_id: value,
                        paid_value: Number(product.price) * newItems[index].quantity
                      }
                      return newItems
                    }
                    return prev
                  })
                }}
              />
            )
          },
          {
            title: 'Quantidade',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 100,
            render: (value, _, index) =>
              products.find((product) => product.id === items[index].product_id)?.sell_type ===
              'KG' ? (
                <Input
                  size="large"
                  placeholder="0,000 Kg"
                  type="text"
                  value={formatToKilos(value.toFixed(3))}
                  onChange={(e) => {
                    setItems((prev) => {
                      const value = formatToKilos(e.target.value)
                      if (index !== -1) {
                        const newItems = [...prev]
                        newItems[index] = {
                          ...newItems[index],
                          quantity: brlToNumber(value),
                          paid_value: brlToNumber(value) * newItems[index].price
                        }
                        return newItems
                      }
                      return prev
                    })
                  }}
                />
              ) : (
                <InputNumber
                  min={1}
                  value={value}
                  size="large"
                  onChange={(value) => {
                    setItems((prev) => {
                      if (index !== -1) {
                        const newItems = [...prev]
                        newItems[index] = {
                          ...newItems[index],
                          quantity: Number(value),
                          paid_value: Number(value) * newItems[index].price
                        }
                        return newItems
                      }
                      return prev
                    })
                  }}
                />
              )
          },
          {
            title: 'Unitário',
            dataIndex: 'price',
            key: 'price',
            render: (value) => `R$ ${value.toFixed(2)}`
          },
          {
            title: 'Total',
            dataIndex: '',
            key: 'total',
            render: (_, record) => `R$ ${(record.price * record.quantity).toFixed(2)}`
          },
          {
            title: 'Valor Pago',
            dataIndex: 'paid_value',
            key: 'paid_value',
            width: 150,
            render: (_, record, index) => (
              <Input
                size="large"
                placeholder="0,000 Kg"
                type="text"
                value={formatToBRL(record.paid_value.toFixed(2))}
                onChange={(e) => {
                  setItems((prev) => {
                    const value = formatToBRL(e.target.value)
                    if (index !== -1) {
                      const newItems = [...prev]
                      newItems[index] = { ...newItems[index], paid_value: brlToNumber(value) }
                      return newItems
                    }
                    return prev
                  })
                }}
              />
            )
          },
          {
            title: '',
            dataIndex: 'actions',
            key: 'actions',
            width: 50,
            render: (_, __, index) => (
              <Button
                icon={<Trash2 size={16} />}
                danger
                onClick={() => {
                  setItems((prev) => prev.filter((_, i) => i !== index))
                }}
              ></Button>
            )
          }
        ]}
        rowKey={(record) => record.product_id}
        footer={() => (
          <Button
            type="dashed"
            block
            icon={<Plus size={16} />}
            size="large"
            onClick={() =>
              setItems((prev) => [
                ...prev,
                { name: '', price: 0, quantity: 1, product_id: ``, paid_value: 0 }
              ])
            }
          >
            Adicionar Item
          </Button>
        )}
      />
      <Table
        size="small"
        title={() => 'Pagamentos'}
        dataSource={payments}
        pagination={false}
        columns={[
          {
            title: 'Método de Pagamento',
            dataIndex: 'name',
            key: 'name',
            width: 300,
            render: (_, record, index) => (
              <Select
                style={{ width: '100%', maxWidth: 400 }}
                options={
                  restaurant?.payment_methods?.map((product) => ({
                    label: product.display_name,
                    value: product.id,
                    disabled:
                      payments.some((payment) => payment.method === product.id) &&
                      record.method !== product.id
                  })) || []
                }
                size="large"
                showSearch={{
                  optionFilterProp: 'label'
                }}
                value={record.method}
                onChange={(value) => {
                  setPayments((prev) => {
                    const method = restaurant?.payment_methods?.find(
                      (method) => method.id === value
                    )
                    if (index !== -1 && method) {
                      const newItems = [...prev]
                      newItems[index] = {
                        ...newItems[index],
                        method: value
                      }
                      return newItems
                    }
                    return prev
                  })
                }}
              />
            )
          },
          {
            title: 'Valor',
            dataIndex: 'amount',
            key: 'amount',
            render: (_, record, index) => (
              <Input
                onFocus={(e) => {
                  e.target.select()
                }}
                size="large"
                prefix={'R$'}
                type="text"
                placeholder="Valor pago"
                value={record.amount}
                onChange={(e) => {
                  setPayments((prev) => {
                    const value = e.target.value
                    const formattedValue = formatToBRL(value)
                    if (index !== -1) {
                      const newItems = [...prev]
                      newItems[index] = {
                        ...newItems[index],
                        amount: formattedValue
                      }
                      return newItems
                    }
                    return prev
                  })
                }}
              />
            )
          },
          {
            title: '',
            dataIndex: 'actions',
            key: 'actions',
            width: 50,
            render: (_, __, index) => (
              <Button
                icon={<Trash2 size={16} />}
                danger
                onClick={() => {
                  setPayments((prev) => prev.filter((_, i) => i !== index))
                }}
              ></Button>
            )
          }
        ]}
        rowKey={(record) => record.method + record.amount}
        footer={() => (
          <Button
            type="dashed"
            block
            icon={<Plus size={16} />}
            size="large"
            onClick={() =>
              setPayments((prev) => [
                ...prev,
                {
                  method: '',
                  amount: formatToBRL(
                    (
                      items.reduce((acc, item) => acc + item.price * item.quantity, 0) -
                      prev.reduce((acc, payment) => acc + brlToNumber(payment.amount), 0)
                    ).toFixed(2)
                  )
                }
              ])
            }
          >
            Adicionar forma de pagamento
          </Button>
        )}
      />

      <Flex>
        <Button
          icon={<ArrowRight size={16} />}
          iconPlacement="end"
          size="large"
          style={{ marginTop: '2rem', marginLeft: 'auto' }}
          type="primary"
          disabled={
            items.length === 0 ||
            payments.some((payment) => !payment.method || payment.amount === 'R$ 0,00') ||
            items.reduce((acc, item) => acc + item.price * item.quantity, 0) !==
              payments.reduce((acc, payment) => acc + brlToNumber(payment.amount), 0)
          }
          loading={loadingEmit}
          onClick={() => {
            const data = {
              sale_id: sale_id,
              items,
              payments: payments
                .map((payment) => ({
                  method: payment.method,
                  amount: brlToNumber(payment.amount)
                }))
                .filter((payment) => payment.method && payment.amount > 0)
            }
            console.log(data)
            setLoadingEmit(true)
            api
              .post('v1/desktop/operation/emit-nf', data)
              .then((response) => {
                setLoadingEmit(false)
                setItems([])
                setPayments([])
                onSuccess?.()
                window.api.openExternal(response.data.url)
              })
              .catch((err) => {
                errorActions(err)
                setLoadingEmit(false)
                messageApi.error('Erro ao emitir nota fiscal')
              })
          }}
        >
          Emitir Nota Fiscal
        </Button>
      </Flex>
    </>
  )
}
