import React, { useEffect, useRef } from 'react'
import { Banknote, CheckCheck, CreditCard, DollarSign, Printer, QrCode, X } from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'

import {
  Button,
  Card,
  Typography,
  Divider,
  Flex,
  Modal,
  Select,
  Form,
  Input,
  FormInstance,
  Space,
  message
} from 'antd'
import { currenyFormat, errorActions } from '@renderer/utils'
import { useAuth } from '@renderer/hooks/useAuth'
import { brlToNumber, formatToBRL } from '@renderer/utils/currency'
import { Bill, BillGroup } from '@renderer/types'
import { useCashier } from '@renderer/hooks/useCashiers'
import api from '@renderer/services/api'
import { useNavigate } from 'react-router-dom'
import { printBillReceipt } from '@renderer/utils/Printers'
const { Text } = Typography

const getPaymentMethodIcon = (method: string): React.ReactNode => {
  switch (method) {
    case 'CASH':
      return <Banknote size={16} />
    case 'CREDIT_CARD':
      return <CreditCard size={16} />
    case 'DEBIT_CARD':
      return <CreditCard size={16} />
    case 'PIX':
      return <QrCode size={16} />
    default:
      return <DollarSign size={16} />
  }
}

interface BillPriceResumProps {
  subtotal: number
  bills: Bill[] | BillGroup[]
  orders: {
    quantity: number
    name: string
    price: number
  }[]
  loading?: boolean
}

const Resum: React.FC<{
  values: { subtotal: number; tax: number; discount: number }
}> = ({ values }) => {
  const total = values.subtotal + values.tax - values.discount
  return (
    <>
      <Flex gap="0.5rem" align="flex-end" justify="space-between">
        <Text strong>Subtotal:</Text>
        <Text>{currenyFormat(values?.subtotal || 0)}</Text>
      </Flex>
      <Flex gap="0.5rem" align="flex-end" justify="space-between">
        <Text strong>Taxa de serviço:</Text>
        <Text>{currenyFormat(values?.tax || 0)}</Text>
      </Flex>
      <Flex gap="0.5rem" align="flex-end" justify="space-between">
        <Text strong>Desconto:</Text>
        <Text>{currenyFormat(values?.discount || 0)}</Text>
      </Flex>
      <Divider
        style={{
          marginTop: '0.3rem',
          marginBottom: '0.3rem'
        }}
      />

      <Flex gap="0.5rem" align="flex-end" justify="space-between" style={{ marginBottom: '1rem' }}>
        <Text
          strong
          style={{
            fontSize: '1.1rem'
          }}
        >
          Total:
        </Text>
        <Text
          strong
          style={{
            fontSize: '1.1rem'
          }}
        >
          {currenyFormat(total)}
        </Text>
      </Flex>
    </>
  )
}

interface PaymentFormProps {
  values: { subtotal: number; tax: number; discount: number }
  bills: string[]
  bills_number?: string
  orders: {
    quantity: number
    name: string
    price: number
  }[]
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  values,
  bills,
  bills_number,
  orders
}) => {
  const { restaurant } = useAuth()
  const { selectedCashier } = useCashier()
  const form = useRef<FormInstance>(null)
  const finishButtonRef = useRef<HTMLButtonElement>(null)
  const finalAmount = Math.round((values.subtotal + values.tax - values.discount) * 100) / 100
  const [changeValue, setChangeValue] = React.useState('')
  const [payments, setPayments] = React.useState<{ method: string | undefined; amount: string }[]>([
    {
      method: undefined,
      amount: formatToBRL(String(finalAmount.toFixed(2)))
    }
  ])
  const change =
    Math.round(
      (payments.reduce((acc, payment) => acc + brlToNumber(String(payment.amount) || '0'), 0) -
        finalAmount) *
        100
    ) / 100

  useEffect(() => {
    form.current?.getFieldInstance(`payment_method_0}`)?.focus()
  }, [values])

  const [selectedChangeMethod, setSelectedChangeMethod] = React.useState<string | undefined>(
    restaurant?.payment_methods[0]?.id
  )
  const [loadingFinish, setLoadingFinish] = React.useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const navigate = useNavigate()
  return (
    <Form
      layout="vertical"
      ref={form}
      onFinish={() => {
        setLoadingFinish(true)
        const datasend = {
          payments: payments.map((payment) => ({
            method: payment.method,
            amount: brlToNumber(String(payment.amount) || '0')
          })),
          change: brlToNumber(changeValue || '0'),
          tax: values.tax,
          discount: values.discount,
          subtotal: values.subtotal,
          total: Math.round((values.subtotal + values.tax - values.discount) * 100) / 100,
          total_received: payments.reduce(
            (acc, payment) => acc + brlToNumber(String(payment.amount) || '0'),
            0
          ),
          bills,
          cashier: selectedCashier?.id,
          change_method: change >= 0 ? selectedChangeMethod : undefined
        }
        api
          .post('/v1/desktop/finish-bills/', {
            ...datasend
          })
          .then(async () => {
            messageApi.success('Pagamento registrado com sucesso!')
            const data = {
              type: 'close',
              printerName: 'caixa',
              bill: {
                bill_number: bills_number || '',
                table: '',
                subtotal: datasend.subtotal,
                tax: datasend.tax,
                total: datasend.total,
                total_received: datasend.total_received,
                change: datasend.change
              },
              items: orders.map((order) => ({
                name: order.name,
                quantity: order.quantity,
                price: order.price
              })),
              restaurant: {
                name: restaurant?.name || '',
                street: restaurant?.address || '',
                city: restaurant?.city || '',
                state: restaurant?.state || '',
                zip: restaurant?.postal_code || '',
                phone: restaurant?.phone || ''
              },
              payments: datasend.payments.map((payment) => ({
                method:
                  restaurant?.payment_methods.find((m) => m.id === payment.method)?.display_name ||
                  '',
                amount: payment.amount
              }))
            }
            await printBillReceipt(data)
            navigate('/comandas')
          })
          .catch((err) => {
            errorActions(err)
            messageApi.error(err.response?.data?.detail || 'Erro ao registrar pagamento')
          })
          .finally(() => {
            setLoadingFinish(false)
          })
      }}
    >
      {contextHolder}
      {payments.map((payment, index) => (
        <Flex key={index} align="center" gap="1rem">
          <Form.Item
            label="Método de pagamento"
            style={{ flex: 1 }}
            name={`payment_method_${index}`}
            required
            rules={[{ required: true, message: 'Por favor, selecione o método de pagamento!' }]}
          >
            <Select
              size="large"
              style={{ minWidth: '200px', flexGrow: 1 }}
              showSearch={{
                optionFilterProp: 'number'
              }}
              placeholder={`${restaurant?.payment_methods.map((method) => `${method.display_name} (${method.position})`).join(' | ')}`}
              onChange={(value) => {
                setPayments((prev) => {
                  const newPayments = [...prev]
                  newPayments[index].method = value
                  return newPayments
                })
              }}
              value={payment.method}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') {
                  form.current?.getFieldInstance(`payment_amount_${index}`)?.focus()
                }
              }}
              options={restaurant?.payment_methods.map((method) => ({
                label: (
                  <Flex align="center" gap="0.5rem">
                    {getPaymentMethodIcon(method.method)}
                    <span>
                      {method.display_name} ({method.position})
                    </span>
                  </Flex>
                ),
                value: method.id,
                number: method.position
              }))}
            />
          </Form.Item>
          <Form.Item
            label="Valor pago"
            rules={[
              {
                required: true,
                message: 'Por favor, insira o valor pago!'
              }
            ]}
            initialValue={payment.amount}
            style={{ width: '200px' }}
            name={`payment_amount_${index}`}
          >
            <Input
              onFocus={(e) => {
                e.target.select()
              }}
              size="large"
              prefix={'R$'}
              type="text"
              placeholder="Valor pago"
              onChange={(e) => {
                const value = e.target.value
                setPayments((prev) => {
                  const newPayments = [...prev]
                  const formattedValue = formatToBRL(value)
                  newPayments[index].amount = formattedValue
                  form?.current?.setFieldsValue({ [`payment_amount_${index}`]: formattedValue })
                  const changeV = (
                    Math.round(
                      (newPayments.reduce(
                        (acc, payment) => acc + brlToNumber(String(payment.amount) || '0'),
                        0
                      ) -
                        finalAmount) *
                        100
                    ) / 100
                  ).toFixed(2)
                  setChangeValue(formatToBRL(changeV))
                  return newPayments
                })
              }}
            />
          </Form.Item>
          {index > 0 && (
            <Button
              shape="circle"
              size="small"
              danger
              onClick={() => {
                setPayments((prev) => prev.filter((_, i) => i !== index))
              }}
              icon={<X size={16} />}
            ></Button>
          )}
        </Flex>
      ))}
      <Button
        type="dashed"
        onClick={() => setPayments((prev) => [...prev, { method: undefined, amount: '0' }])}
        style={{ width: '100%', marginBottom: '1rem' }}
      >
        Adicionar forma de pagamento
      </Button>
      <Flex vertical>
        {values.subtotal && (
          <Resum
            values={{ subtotal: values.subtotal, tax: values.tax, discount: values.discount }}
          />
        )}
      </Flex>
      {change !== 0 && (
        <>
          <>
            {brlToNumber(changeValue) > change && (
              <Text type="danger" style={{ fontSize: '0.9rem' }}>
                O valor do troco é menor que o valor da comanda. Verifique o valor do pagamento.
              </Text>
            )}
          </>
          <Flex
            gap="0.5rem"
            align="flex-end"
            justify="space-between"
            style={{ marginBottom: '1rem' }}
          >
            <Text
              strong
              style={{
                fontSize: '1.1rem'
              }}
            >
              {change >= 0 ? 'Troco:' : 'Restante:'}
            </Text>
            {change >= 0 ? (
              <Flex>
                <Select
                  style={{
                    width: 150,
                    marginRight: '0.5rem'
                  }}
                  value={selectedChangeMethod}
                  placeholder="Método de troco"
                  onChange={(value) => {
                    setSelectedChangeMethod(value)
                  }}
                  options={restaurant?.payment_methods.map((method) => ({
                    label: (
                      <Flex align="center" gap="0.5rem">
                        {getPaymentMethodIcon(method.method)}
                        <span>
                          {method.display_name} ({method.position})
                        </span>
                      </Flex>
                    ),
                    value: method.id,
                    number: method.position
                  }))}
                />
                <Input
                  value={changeValue}
                  onChange={(e) => {
                    const formattedValue = formatToBRL(e.target.value)
                    setChangeValue(formattedValue)
                  }}
                  onWheel={(e) => e.currentTarget.blur()}
                  type="text"
                  prefix={'R$'}
                  style={{
                    width: '130px'
                  }}
                ></Input>
              </Flex>
            ) : (
              <Text
                strong
                style={{
                  fontSize: '1.1rem',
                  color: change >= 0 ? '#47a618' : 'red'
                }}
              >
                {currenyFormat(change >= 0 ? change : Math.abs(change))}
              </Text>
            )}
          </Flex>
        </>
      )}
      <Flex justify="space-between" gap="0.5rem">
        <Button>Cancelar</Button>
        <Button
          type="primary"
          onClick={() => {
            form.current?.submit()
          }}
          disabled={payments.some((payment) => !payment.method) || change < 0}
          ref={finishButtonRef}
          loading={loadingFinish}
        >
          Confirmar pagamento
        </Button>
      </Flex>
    </Form>
  )
}

export const BillPriceResum: React.FC<BillPriceResumProps> = ({
  subtotal,
  loading,
  bills,
  orders
}) => {
  const { restaurant } = useAuth()
  const [taxValue, setTaxValue] = React.useState(() => {
    const initialTaxValue = restaurant?.default_tip_value || 0
    const v =
      restaurant?.tip_type === 'percentage'
        ? (subtotal * Number(initialTaxValue)) / 100
        : Number(initialTaxValue)
    return Math.round(v * 100) / 100
  })
  const [taxApplied, setTaxApplied] = React.useState(
    restaurant?.tip_aplyed_by_default ? true : false
  )
  const confirmButtonRef = React.useRef<HTMLButtonElement>(null)
  const [paymentModalVisible, setPaymentModalVisible] = React.useState(false)
  useHotkeys(
    ['p', 'enter', 'numpad enter'],
    async (_, handler) => {
      switch (handler.hotkey) {
        case 'enter':
          if (!paymentModalVisible) {
            confirmButtonRef.current?.focus()
          }
          break
        case 'numpad enter':
          if (!paymentModalVisible) {
            confirmButtonRef.current?.focus()
          }
          break
        case 'p':
          await printBillReceipt({
            printerName: 'caixa',
            bill: {
              bill_number: bills.map((bill) => bill.number).join(', '),
              table: bills.map((bill) => bill.table).join(', '),
              subtotal,
              tax: taxApplied ? taxValue : 0,
              total: Math.round((subtotal + (taxApplied ? taxValue : 0)) * 100) / 100
            },
            items: orders.map((order) => ({
              name: order.name,
              quantity: order.quantity,
              price: order.price
            })),
            restaurant: {
              name: restaurant?.name || '',
              street: restaurant?.address || '',
              city: restaurant?.city || '',
              state: restaurant?.state || '',
              zip: restaurant?.postal_code || '',
              phone: restaurant?.phone || ''
            }
          })
          break
      }
    },
    {
      keyup: true,
      keydown: false
    }
  )
  const taxForm = useRef<FormInstance>(null)
  useEffect(() => {
    if (restaurant?.tip_aplyed_by_default) {
      const initialTaxValue = restaurant.default_tip_value || 0
      let tax =
        restaurant.tip_type === 'percentage'
          ? (subtotal * Number(initialTaxValue)) / 100
          : Number(initialTaxValue)
      tax = Math.round(tax * 100) / 100
      setTaxValue(tax)
    }
  }, [subtotal, restaurant])
  return (
    restaurant && (
      <>
        <Button
          style={{ marginLeft: 'auto' }}
          icon={<Printer size={16} />}
          block
          onClick={async () => {
            await printBillReceipt({
              printerName: 'caixa',
              bill: {
                bill_number: bills.map((bill) => bill.number).join(', '),
                table: bills.map((bill) => bill.table).join(', '),
                subtotal,
                tax: taxApplied ? taxValue : 0,
                total: Math.round((subtotal + (taxApplied ? taxValue : 0)) * 100) / 100
              },
              items: orders.map((order) => ({
                name: order.name,
                quantity: order.quantity,
                price: order.price
              })),
              restaurant: {
                name: restaurant.name,
                street: restaurant?.address || '',
                city: restaurant?.city || '',
                state: restaurant?.state || '',
                zip: restaurant?.postal_code || '',
                phone: restaurant?.phone || ''
              }
            })
          }}
          type="dashed"
        >
          Imprimir (P)
        </Button>
        <Card
          styles={{
            body: {
              padding: '1rem',
              display: 'flex',
              gap: '0.3rem',
              flexDirection: 'column'
            }
          }}
        >
          <Text strong>Taxa de serviço</Text>
          <Form
            layout="vertical"
            ref={taxForm}
            initialValues={{
              taxType: restaurant.tip_type === 'percentage' ? 'percentage' : 'value',
              taxValue: restaurant.default_tip_value
            }}
            onFinish={(values) => {
              setTaxApplied((prev) => {
                if (prev) {
                  setTaxValue(0)
                  return false
                }
                let tax =
                  values.taxType === 'percentage'
                    ? (subtotal * Number(values.taxValue)) / 100
                    : Number(values.taxValue)
                tax = Math.round(tax * 100) / 100
                setTaxValue(tax)
                confirmButtonRef.current?.focus()
                return true
              })
            }}
          >
            <Space.Compact>
              <Form.Item label="Taxa de serviço" name="taxType" noStyle>
                <Select
                  size="large"
                  style={{ width: 70 }}
                  onChange={() => {
                    setTaxApplied(false)
                  }}
                  options={[
                    {
                      label: '%',
                      value: 'percentage'
                    },
                    {
                      label: 'R$',
                      value: 'value'
                    }
                  ]}
                />
              </Form.Item>
              <Form.Item
                label="Taxa de serviço"
                name="taxValue"
                noStyle
                required
                rules={[
                  { required: true, message: 'Por favor, insira o valor da taxa de serviço!' }
                ]}
              >
                <Input
                  placeholder="0"
                  size="large"
                  type="number"
                  onChange={() => {
                    setTaxApplied(false)
                  }}
                />
              </Form.Item>
              <Button
                size="large"
                htmlType="submit"
                type={taxApplied ? 'primary' : 'default'}
                icon={<CheckCheck size={16} />}
              >
                {taxApplied ? 'Aplicado' : 'Aplicar'}
              </Button>
            </Space.Compact>
          </Form>
        </Card>
        <Card
          styles={{
            body: {
              padding: '1rem',
              display: 'flex',
              gap: '0.3rem',
              flexDirection: 'column'
            }
          }}
        >
          <Resum values={{ subtotal: subtotal, tax: taxApplied ? taxValue : 0, discount: 0 }} />
          <Button
            icon={<CheckCheck size={16} />}
            onClick={() => {
              setPaymentModalVisible(true)
              confirmButtonRef.current?.blur()
            }}
            type="primary"
            ref={confirmButtonRef}
            disabled={loading}
          >
            Confirmar (enter)
          </Button>
          <Modal
            title={
              <Flex>
                Pagamento{' '}
                {bills.length > 1 && `(Comandas: ${bills.map((bill) => bill.number).join(', ')})`}
              </Flex>
            }
            destroyOnHidden
            open={paymentModalVisible}
            onCancel={() => {
              setPaymentModalVisible(false)
              confirmButtonRef.current?.focus()
            }}
            footer={null}
            width={730}
          >
            <PaymentForm
              values={{ subtotal: subtotal, tax: taxApplied ? taxValue : 0, discount: 0 }}
              bills={bills.map((bill) => bill.id)}
              bills_number={bills.map((bill) => bill.number).join(', ')}
              orders={orders}
            />
          </Modal>
        </Card>
      </>
    )
  )
}
