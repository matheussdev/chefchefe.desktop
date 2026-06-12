import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  BadgePercent,
  Banknote,
  CheckCheck,
  CreditCard,
  DollarSign,
  Printer,
  QrCode,
  Receipt,
  X
} from 'lucide-react'
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
import { getConfig } from '@renderer/services/auth'
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
    product_id?: string
  }[]
  loading?: boolean
}

const Resum: React.FC<{
  values: { subtotal: number; tax: number; discount: number }
  onDiscountClick?: () => void
}> = ({ values, onDiscountClick }) => {
  const total = values.subtotal + values.tax - values.discount
  return (
    <>
      <Flex gap="0.5rem" align="flex-end" justify="space-between">
        <Text strong>Subtotal:</Text>
        <Text>{currenyFormat(values?.subtotal || 0)}</Text>
      </Flex>
      <Flex gap="0.5rem" align="flex-end" justify="space-between">
        <Text strong>Desconto:</Text>
        {values.discount > 0 ? (
          <Text>-{currenyFormat(values?.discount || 0)}</Text>
        ) : onDiscountClick ? (
          <Button
            onClick={onDiscountClick}
            size="small"
            icon={<BadgePercent size={16} />}
            type="dashed"
          >
            Aplicar Desconto
          </Button>
        ) : (
          <Text>-{currenyFormat(values?.discount || 0)}</Text>
        )}
      </Flex>
      <Flex gap="0.5rem" align="flex-end" justify="space-between">
        <Text strong>Taxa de serviço:</Text>
        <Text>{currenyFormat(values?.tax || 0)}</Text>
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
  subtotal: number
  tax: number
  total: number
  bills: string[]
  bills_number?: string
  orders: {
    quantity: number
    name: string
    price: number
    product_id?: string
  }[]
  discount: number
  discountCode?: string
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  subtotal,
  tax,
  total,
  bills,
  bills_number,
  orders,
  discount,
  discountCode
}) => {
  const [paymentModalVisible, setPaymentModalVisible] = React.useState(false)
  const { restaurant } = useAuth()
  const { selectedCashier } = useCashier()
  const [form] = Form.useForm()
  const finishButtonRef = useRef<HTMLButtonElement>(null)
  const [changeValue, setChangeValue] = React.useState('')
  const [payments, setPayments] = React.useState<{ method: string | undefined; amount: string }[]>([
    { method: undefined, amount: formatToBRL(String(total.toFixed(2))) }
  ])
  const totalReceived = useMemo(() => {
    return payments.reduce((acc, payment) => acc + brlToNumber(payment.amount || '0'), 0)
  }, [payments])

  const change = totalReceived - total

  const [selectedChangeMethod, setSelectedChangeMethod] = React.useState<string | undefined>(
    restaurant?.payment_methods.filter((m) => m.method === 'CASH')[0]?.id ||
      restaurant?.payment_methods[0]?.id
  )
  const [loadingFinish, setLoadingFinish] = React.useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const navigate = useNavigate()
  useHotkeys(
    ['p', 'enter', 'numpad enter'],
    async (_, handler) => {
      switch (handler.hotkey) {
        case 'enter':
          if (!paymentModalVisible) {
            const confirmButton = document.getElementById('confirm-payment-button')
            confirmButton?.focus()
          }
          break
        case 'numpad enter':
          if (!paymentModalVisible) {
            const confirmButton = document.getElementById('confirm-payment-button')
            confirmButton?.focus()
          }
          break
      }
    },
    {
      keyup: true
    }
  )
  const [finishCode, setFinishCode] = React.useState('')
  const [emitNF, setEmitNF] = React.useState(false)
  return (
    <>
      <Button
        icon={<CheckCheck size={16} />}
        onClick={() => {
          setPaymentModalVisible(true)
        }}
        type="primary"
        id="confirm-payment-button"
        size="large"
      >
        Confirmar (enter)
      </Button>
      <Modal
        title={<Flex>Pagamento {bills_number && `(Comandas: ${bills_number})`}</Flex>}
        destroyOnHidden
        open={paymentModalVisible}
        onCancel={() => {
          if (!loadingFinish) {
            setPaymentModalVisible(false)
          }
        }}
        footer={null}
        width={800}
        afterOpenChange={(open) => {
          setChangeValue('')
          setSelectedChangeMethod(
            restaurant?.payment_methods.filter((m) => m.method === 'CASH')[0]?.id ||
              restaurant?.payment_methods[0]?.id
          )
          setPayments([
            {
              method: undefined,
              amount: formatToBRL(String(total.toFixed(2)))
            }
          ])
          form.setFieldsValue({
            payment_amount_0: formatToBRL(String(total.toFixed(2)))
          })
          if (open) {
            form.getFieldInstance('payment_method_0')?.focus()
          } else {
            form.resetFields()
          }
        }}
        closeIcon={false}
        centered
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={() => {
            setLoadingFinish(true)
            const datasend = {
              payments: payments.map((payment) => ({
                method: payment.method,
                amount: brlToNumber(String(payment.amount) || '0')
              })),
              change: Number(change.toFixed(2)) < 0 ? 0 : brlToNumber(changeValue || '0'),
              tax: Number(tax.toFixed(2)),
              discount: Number(discount.toFixed(2)),
              discount_code: discountCode,
              subtotal: Number(subtotal.toFixed(2)),
              total: Number(total.toFixed(2)),
              total_received: Number(
                payments
                  .reduce((acc, payment) => acc + brlToNumber(String(payment.amount) || '0'), 0)
                  .toFixed(2)
              ),
              bills,
              cashier: selectedCashier?.id,
              change_method: Number(change.toFixed(2)) >= 0 ? selectedChangeMethod : undefined,
              code: Number(change.toFixed(2)) < 0 ? finishCode : undefined,
              reason: Number(change.toFixed(2)) < 0 ? form.getFieldValue('reason') : undefined
            }
            api
              .post('/v1/desktop/operation/finish-bills/', {
                ...datasend
              })
              .then(async () => {
                messageApi.success('Pagamento registrado com sucesso!')
                const printer = getConfig('default-printer') || 'caixa'
                const data = {
                  type: 'close',
                  printerName: printer,
                  bill: {
                    bill_number: bills_number || '',
                    table: '',
                    discount: Number(datasend.discount.toFixed(2)),
                    subtotal: Number(datasend.subtotal.toFixed(2)),
                    tax: Number(datasend.tax.toFixed(2)),
                    total: Number(datasend.total.toFixed(2)),
                    total_received: Number(datasend.total_received.toFixed(2)),
                    change: Number(datasend.change.toFixed(2))
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
                    phone: restaurant?.phone || '',
                    cnpj: restaurant?.cnpj || ''
                  },
                  payments: datasend.payments.map((payment) => ({
                    method:
                      restaurant?.payment_methods.find((m) => m.id === payment.method)
                        ?.display_name || '',
                    amount: payment.amount
                  }))
                }
                await printBillReceipt(data)
                if (emitNF) {
                  navigate(`/comandas/${bills[0]}?emit_nf=true`)
                  window.api.reloadApp()
                } else {
                  navigate('/comandas')
                }
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
                style={{ minWidth: '200px', maxWidth: '540px', width: '100%' }}
                name={`payment_method_${index}`}
                required
                rules={[{ required: true, message: 'Por favor, selecione o método de pagamento!' }]}
              >
                <Select
                  size="large"
                  showSearch={{
                    optionFilterProp: 'number'
                  }}
                  style={{ fontSize: '1.3rem', fontWeight: '500' }}
                  placeholder={`${restaurant?.payment_methods.map((method) => `${method.display_name} (${method.position})`).join(' | ')}`}
                  onChange={(value) => {
                    setPayments((prev) => {
                      const newPayments = [...prev]
                      newPayments[index].method = value
                      return newPayments
                    })
                    form?.getFieldInstance(`payment_amount_${index}`)?.focus()
                  }}
                  value={payment.method}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight') {
                      form?.getFieldInstance(`payment_amount_${index}`)?.focus()
                    }
                  }}
                  options={restaurant?.payment_methods.map((method) => ({
                    label: (
                      <Flex align="center" gap="0.5rem">
                        {getPaymentMethodIcon(method.method)}
                        <span style={{ fontSize: '1.3rem' }}>
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
                style={{ minWidth: '100px' }}
                name={`payment_amount_${index}`}
              >
                <Input
                  onFocus={(e) => {
                    e.target.select()
                  }}
                  className="custom-input"
                  size="large"
                  prefix={'R$'}
                  type="text"
                  placeholder="Valor pago"
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft') {
                      form?.getFieldInstance(`payment_method_${index}`)?.focus()
                    } else if (e.key === 'ArrowDown') {
                      if (index < payments.length - 1) {
                        form?.getFieldInstance(`payment_method_${index + 1}`)?.focus()
                      }
                    } else if (e.key === 'ArrowUp') {
                      if (index > 0) {
                        form?.getFieldInstance(`payment_method_${index - 1}`)?.focus()
                      }
                    } else if (e.key === 'Enter') {
                      e.preventDefault()
                      if (index === payments.length - 1) {
                        finishButtonRef.current?.focus()
                      } else {
                        form?.getFieldInstance(`payment_method_${index + 1}`)?.focus()
                      }
                    }
                  }}
                  onChange={(e) => {
                    const value = e.target.value
                    setPayments((prev) => {
                      const newPayments = [...prev]
                      const formattedValue = formatToBRL(value)
                      newPayments[index].amount = formattedValue
                      form?.setFieldsValue({ [`payment_amount_${index}`]: formattedValue })
                      const changeV = (
                        Math.round(
                          (newPayments.reduce(
                            (acc, payment) => acc + brlToNumber(String(payment.amount) || '0'),
                            0
                          ) -
                            total) *
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
            size="large"
          >
            Adicionar forma de pagamento
          </Button>
          <Flex vertical>
            {subtotal && <Resum values={{ subtotal, tax, discount: discount }} />}
          </Flex>
          {change !== 0 && (
            <>
              <>
                {Number(brlToNumber(changeValue).toFixed(2)) > Number(change.toFixed(2)) && (
                  <Text type="danger" style={{ fontSize: '0.9rem' }}>
                    O valor digitado é menor que o valor da comanda. Verifique o valor do pagamento.
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
                        width: 200,
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
                    {currenyFormat(
                      Number(change >= 0 ? change.toFixed(2) : Math.abs(change).toFixed(2))
                    )}
                  </Text>
                )}
              </Flex>
            </>
          )}
          {Number(change.toFixed(2)) < 0 && (
            <>
              <Form.Item label="Motivo" name="reason">
                <Input.TextArea size="large" placeholder="Motivo" />
              </Form.Item>
              <Form.Item
                label="Código de operador"
                name="code"
                required={true}
                rules={[{ required: true, message: 'Por favor, insira o código do operador!' }]}
              >
                <Input.Password
                  size="large"
                  placeholder="Código de operador"
                  onChange={(e) => setFinishCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      finishButtonRef.current?.focus()
                    }
                  }}
                />
              </Form.Item>
            </>
          )}
          <Flex justify="space-between" gap="0.5rem">
            <Button
              size="large"
              onClick={() => {
                setPaymentModalVisible(false)
              }}
              disabled={loadingFinish}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setEmitNF(true)
                form.submit()
              }}
              style={{
                marginLeft: 'auto'
              }}
              size="large"
              disabled={
                payments.some((payment) => !payment.method) ||
                (Number(change.toFixed(2)) < 0 && !finishCode)
              }
              ref={finishButtonRef}
              loading={loadingFinish}
              icon={<Receipt size={16} />}
            >
              Finalizar e Gerar NF
            </Button>
            <Button
              type="primary"
              onClick={() => {
                form.submit()
              }}
              size="large"
              disabled={
                payments.some((payment) => !payment.method) ||
                (Number(change.toFixed(2)) < 0 && !finishCode)
              }
              ref={finishButtonRef}
              loading={loadingFinish}
              icon={<CheckCheck size={16} />}
            >
              Confirmar pagamento
            </Button>
          </Flex>
        </Form>
      </Modal>
    </>
  )
}

export const BillPriceResum: React.FC<BillPriceResumProps> = ({ subtotal, bills, orders }) => {
  const { restaurant } = useAuth()
  const [messageApi, contextHolder] = message.useMessage()
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
  const [taxType, setTaxType] = React.useState<'percentage' | 'value'>(
    restaurant?.tip_type || 'percentage'
  )
  const [taxInput, setTaxInput] = React.useState(() => {
    if (restaurant?.tip_aplyed_by_default) {
      return formatToBRL(String(restaurant.default_tip_value || '0'))
    }
    return ''
  })
  const [discountValue, setDiscountValue] = React.useState(0)
  const printBill = useCallback(async () => {
    const printer = getConfig('default-printer') || 'caixa'
    messageApi.loading('Gerando recibo para impressão...', 0)
    const newOrders: typeof orders = []
    orders.forEach((order) => {
      const unit_price = order.price / order.quantity
      const existingOrder = newOrders.find(
        (o) =>
          o?.name === order.name &&
          o?.price / o.quantity === unit_price &&
          o?.product_id === order.product_id
      )
      if (existingOrder) {
        existingOrder.quantity += order.quantity
        existingOrder.price = unit_price * existingOrder.quantity
      } else {
        newOrders.push({ ...order })
      }
    })
    try {
      const data = {
        printerName: printer,
        bill: {
          bill_number: bills.map((bill) => bill.number).join(', '),
          table: bills.map((bill) => bill?.table_number).join(', '),
          subtotal,
          tax: taxApplied ? taxValue : 0,
          discount: discountValue,
          total: Math.round((subtotal + (taxApplied ? taxValue : 0) - discountValue) * 100) / 100
        },
        items: newOrders.map((order) => ({
          name: order.name,
          quantity: order.quantity,
          price: order.price,
          product_id: order.product_id
        })),
        restaurant: {
          name: restaurant?.name || '',
          street: restaurant?.address || '',
          city: restaurant?.city || '',
          state: restaurant?.state || '',
          zip: restaurant?.postal_code || '',
          phone: restaurant?.phone || '',
          cnpj: restaurant?.cnpj || ''
        }
      }
      await printBillReceipt(data)
      console.log(data)
      messageApi.destroy()
      messageApi.success('Recibo enviado para impressão!')
    } catch (err) {
      console.error(err)
      messageApi.destroy()
      messageApi.error('Erro ao imprimir recibo')
    }
  }, [bills, orders, restaurant, subtotal, taxApplied, taxValue, messageApi, discountValue])
  useHotkeys(
    ['p', 'r'],
    async (_, handler) => {
      switch (handler.hotkey) {
        case 'p':
          await printBill()
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
  const [openDiscountModal, setOpenDiscountModal] = React.useState(false)
  const [loadingFindingDiscount, setLoadingFindingDiscount] = React.useState(false)
  const [discountForm] = Form.useForm()
  const [discountCode, setDiscountCode] = React.useState<{
    code: string
    method: 'PERCENTAGE' | 'VALUE' | 'VALUE_VARIABLE' | 'PERCENTAGE_VARIABLE'
    min_value: 'string'
    max_value: 'string'
  } | null>(null)
  const findDiscount = useCallback(
    async (code: string) => {
      setLoadingFindingDiscount(true)
      api
        .get(`/v1/desktop/financial/discount-codes/`, { params: { code } })
        .then((res) => {
          setDiscountCode(res.data)
          setLoadingFindingDiscount(false)
          const button = document.getElementById('apply-discount-button')
          button?.focus()
        })
        .catch((err) => {
          errorActions(err)
          setLoadingFindingDiscount(false)
          messageApi.error(err.response?.data?.detail || 'Erro ao buscar código de desconto')
        })
    },
    [messageApi]
  )
  return (
    restaurant && (
      <>
        {contextHolder}
        <Button
          style={{ marginLeft: 'auto' }}
          className="custom-input"
          icon={<Printer size={20} />}
          block
          onClick={async () => {
            await printBill()
          }}
          type="dashed"
          size="large"
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
                  const confirmButton = document.getElementById('confirm-payment-button')
                  confirmButton?.focus()
                  return false
                }
                const newTotal = subtotal - discountValue
                let tax =
                  values.taxType === 'percentage'
                    ? (newTotal * Number(values.taxValue)) / 100
                    : Number(values.taxValue)
                tax = Math.round(tax * 100) / 100
                setTaxValue(tax)
                setTaxType(values.taxType)
                setTaxInput(formatToBRL(String(values.taxValue)))
                const confirmButton = document.getElementById('confirm-payment-button')
                confirmButton?.focus()
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
          <Resum
            values={{ subtotal: subtotal, tax: taxApplied ? taxValue : 0, discount: discountValue }}
            onDiscountClick={() => {
              setOpenDiscountModal(true)
            }}
          />
          <PaymentForm
            subtotal={Math.round(subtotal * 100) / 100}
            tax={taxApplied ? Math.round(taxValue * 100) / 100 : 0}
            total={Math.round((subtotal + (taxApplied ? taxValue : 0) - discountValue) * 100) / 100}
            bills={bills.map((bill) => bill.id)}
            bills_number={bills.map((bill) => bill.number).join(', ')}
            orders={orders}
            discountCode={discountCode?.code}
            discount={discountValue}
          />
        </Card>
        <Modal
          centered
          open={openDiscountModal}
          onCancel={() => setOpenDiscountModal(false)}
          footer={null}
          width={600}
          destroyOnHidden
          afterOpenChange={(open) => {
            if (open) {
              discountForm?.getFieldInstance('discountCode')?.focus()
              if (discountCode) {
                discountForm.setFieldsValue({
                  discountCode: discountCode.code,
                  discountValue: formatToBRL(discountCode.min_value)
                })
              } else {
                discountForm.resetFields()
              }
            }
          }}
        >
          <Form
            layout="vertical"
            form={discountForm}
            onFinish={(values) => {
              let discount = 0
              if (discountCode) {
                switch (discountCode.method) {
                  case 'PERCENTAGE':
                    discount = (subtotal * brlToNumber(values.discountValue || '0')) / 100
                    break
                  case 'VALUE':
                    discount = brlToNumber(values.discountValue || '0')
                    break
                  case 'PERCENTAGE_VARIABLE':
                    discount = (subtotal * brlToNumber(values.discountValue || '0')) / 100
                    break
                  case 'VALUE_VARIABLE':
                    discount = brlToNumber(values.discountValue || '0')
                    break
                }
              }
              discount = Math.round(discount * 100) / 100
              setDiscountValue(discount)
              const newtotal = subtotal - discount
              let tax =
                taxType === 'percentage'
                  ? (newtotal * brlToNumber(taxInput || '0')) / 100
                  : Number(brlToNumber(taxInput || '0'))
              tax = Math.round(tax * 100) / 100
              setTaxValue(tax)
              setOpenDiscountModal(false)
            }}
          >
            <Form.Item label="Código de desconto" name="discountCode">
              <Input
                placeholder="Digite o código de desconto"
                size="large"
                suffix={
                  <Button
                    onClick={() => {
                      if (discountCode) {
                        setDiscountCode(null)
                        discountForm.resetFields()
                      } else {
                        const code = discountForm.getFieldValue('discountCode')
                        if (code) {
                          findDiscount(code)
                        }
                      }
                    }}
                  >
                    {discountCode ? 'Limpar' : 'Buscar'}
                  </Button>
                }
                onPressEnter={async (e) => {
                  e.preventDefault()
                  const code = discountForm.getFieldValue('discountCode')
                  if (code) {
                    await findDiscount(code)
                  }
                }}
              />
            </Form.Item>
            {discountCode && (
              <Form.Item
                label="Desconto"
                name="discountValue"
                initialValue={formatToBRL(discountCode.min_value)}
              >
                <Input
                  size="large"
                  prefix={
                    discountCode.method === 'PERCENTAGE' ||
                    discountCode.method === 'PERCENTAGE_VARIABLE'
                      ? '%'
                      : 'R$'
                  }
                  readOnly={discountCode.max_value === discountCode.min_value}
                  onChange={(e) => {
                    const value = e.target.value
                    discountForm.setFieldsValue({
                      discountValue: formatToBRL(value)
                    })
                  }}
                />
              </Form.Item>
            )}
            <Button
              type="primary"
              htmlType="submit"
              id="apply-discount-button"
              loading={loadingFindingDiscount}
              disabled={!discountCode}
            >
              Aplicar desconto
            </Button>
          </Form>
        </Modal>
      </>
    )
  )
}
