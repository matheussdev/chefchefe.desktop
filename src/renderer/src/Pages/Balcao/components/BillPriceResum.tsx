import React, { useEffect, useRef, useState } from 'react'
import { Banknote, Check, CreditCard, DollarSign, QrCode, Trash2, X } from 'lucide-react'

import { Button, Typography, Divider, Flex, Modal, Select, Form, Input, message } from 'antd'
import { currenyFormat, errorActions } from '@renderer/utils'
import { useAuth } from '@renderer/hooks/useAuth'
import { brlToNumber, formatToBRL } from '@renderer/utils/currency'
import { CartProduct } from '@renderer/types'
import { useCashier } from '@renderer/hooks/useCashiers'
import api from '@renderer/services/api'
import { printBillReceipt } from '@renderer/utils/Printers'
import { useHotkeys } from 'react-hotkeys-hook'
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
  orders: CartProduct[]
}

const Resum: React.FC<{
  values: { subtotal: number; discount: number }
}> = ({ values }) => {
  const total = values.subtotal - values.discount
  return (
    <>
      <Flex gap="0.5rem" align="flex-end" justify="space-between">
        <Text strong>Subtotal:</Text>
        <Text>{currenyFormat(values?.subtotal || 0)}</Text>
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
  values: { subtotal: number; discount: number }
  orders: CartProduct[]
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ values, orders }) => {
  const { restaurant } = useAuth()
  const { selectedCashier } = useCashier()
  const [form] = Form.useForm()
  const finishButtonRef = useRef<HTMLButtonElement>(null)
  const finalAmount = Math.round((values.subtotal - values.discount) * 100) / 100
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
    setTimeout(() => {
      form.getFieldInstance('payment_method_0')?.focus()
    }, 300)
  }, [form])

  const [selectedChangeMethod, setSelectedChangeMethod] = React.useState<string | undefined>(
    restaurant?.payment_methods[0]?.id
  )
  const [loadingFinish, setLoadingFinish] = React.useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={() => {
        setLoadingFinish(true)
        const savedCode = localStorage.getItem('chefchefe@terminal-saved-code') || ''
        if (!savedCode) {
          messageApi.error(
            'Código do caixa não encontrado. Por favor, registre um código para o caixa nas configurações.'
          )
          setLoadingFinish(false)
          return
        }
        const datasend = {
          payments: payments.map((payment) => ({
            method: payment.method,
            amount: brlToNumber(String(payment.amount) || '0')
          })),
          change: brlToNumber(changeValue || '0'),
          discount: values.discount,
          subtotal: values.subtotal,
          total: Math.round((values.subtotal - values.discount) * 100) / 100,
          total_received: payments.reduce(
            (acc, payment) => acc + brlToNumber(String(payment.amount) || '0'),
            0
          ),
          cashier: selectedCashier?.id,
          change_method: change >= 0 ? selectedChangeMethod : undefined,
          orders: orders.map((order) => ({
            ...order,
            unit_price: Number(order.unit_price),
            total_price: Number(order.total_price)
          })),
          code: savedCode
        }
        api
          .post('/v1/desktop/send-counter-sale/', {
            ...datasend
          })
          .then(async (response) => {
            messageApi.success('Pagamento registrado com sucesso!')
            const data = {
              type: 'close',
              printerName: 'caixa',
              bill: {
                bill_number: 'Venda Balcão - ' + response.data.sale_number,
                table: '',
                subtotal: datasend.subtotal,
                tax: 0,
                total: datasend.total,
                total_received: datasend.total_received,
                change: datasend.change
              },
              items: orders.map((order) => ({
                name: order.product_name,
                quantity: order.quantity,
                price: Number(order.total_price)
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
            console.log('Printing receipt with data:', data)
            await printBillReceipt(data)
            localStorage.removeItem('balcao_cart')
            window.api.reloadApp()
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
          <Resum values={{ subtotal: values.subtotal, discount: values.discount }} />
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
            form?.submit()
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

export const BillPriceResum: React.FC<BillPriceResumProps> = ({ subtotal, orders }) => {
  const { restaurant } = useAuth()
  const confirmButtonRef = React.useRef<HTMLButtonElement>(null)
  const [paymentModalVisible, setPaymentModalVisible] = React.useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  useHotkeys(
    ['*'],
    (a) => {
      if (orders.length > 0 && a.key === '+') {
        setPaymentModalVisible(true)
      }
      if (a.key === '-') {
        setPaymentModalVisible(false)
      }
    },
    { enableOnContentEditable: true }
  )

  return (
    restaurant && (
      <>
        <Flex gap="0.5rem">
          <Button
            size="large"
            type="dashed"
            danger
            icon={<Trash2 size={16} />}
            onClick={() => {
              if (!confirmClear) {
                setConfirmClear(true)
              }
            }}
          >
            Limpar
          </Button>
          <Button
            size="large"
            type="primary"
            block
            icon={<Check size={16} />}
            onClick={() => {
              setPaymentModalVisible(true)
            }}
            disabled={orders.length === 0}
            ref={confirmButtonRef}
          >
            Finalizar (+)
          </Button>
        </Flex>

        <Modal
          title={<Flex>Finalizar pedido</Flex>}
          destroyOnHidden
          open={paymentModalVisible}
          onCancel={() => {
            setPaymentModalVisible(false)
            confirmButtonRef.current?.focus()
          }}
          footer={null}
          closeIcon={false}
          width={900}
        >
          <PaymentForm values={{ subtotal: subtotal, discount: 0 }} orders={orders} />
        </Modal>
        <Modal
          title="Confirmação"
          open={confirmClear}
          onCancel={() => setConfirmClear(false)}
          closeIcon={false}
          onOk={() => {
            // Handle ok action
          }}
          afterOpenChange={(open) => {
            const confirmClearButton = document.getElementById('confirm-clear-button')
            if (open) {
              confirmClearButton?.focus()
            }
          }}
          footer={
            <Flex justify="space-between">
              <Button onClick={() => setConfirmClear(false)} style={{ marginRight: '0.5rem' }}>
                Não, manter
              </Button>
              <Button
                onClick={() => {
                  localStorage.removeItem('balcao_cart')
                  window.api.reloadApp()
                  setConfirmClear(false)
                }}
                id="confirm-clear-button"
                type="primary"
                danger
              >
                Sim, limpar
              </Button>
            </Flex>
          }
        >
          <p>Tem certeza que deseja limpar o carrinho?</p>
        </Modal>
      </>
    )
  )
}
