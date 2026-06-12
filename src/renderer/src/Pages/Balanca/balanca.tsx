import { Container } from '@renderer/components/Container'
import { useBill } from '@renderer/hooks/useBills'
import { Order } from '@renderer/types'
import { Button, Card, Flex, Form, Input, message, Select, Space, Typography } from 'antd'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { OrdersSelectTable } from './components/productsSelctTable'
import api from '@renderer/services/api'
import { currenyFormat } from '@renderer/utils'
import { brlToNumber, formatToKilos } from '@renderer/utils/currency'
import { getConfig, setConfig } from '@renderer/services/auth'
import { BillFormPage } from './form'
import { Plus, XIcon } from 'lucide-react'
import { printOrderBillReceipt } from '@renderer/utils/Printers'
import { useHotkeys } from 'react-hotkeys-hook'
const { Text } = Typography
export const BalancaPage: React.FC = () => {
  const { products, fetchProducts, bills, fetchBills } = useBill()
  const [loadingProducts, setLoadingProducts] = useState(false)
  const hasUpdatedBills = useRef(false)
  const [loadingOrders, setLoadingOrders] = React.useState(false)
  const [orders, setOrders] = React.useState<Order[]>([])
  const fetchOrders = useCallback((id: string) => {
    setLoadingOrders(true)
    api
      .get(`v1/desktop/operation/bill-orders`, {
        params: {
          bill_id: id
        }
      })
      .then((response) => {
        setOrders(response.data)
      })
      .finally(() => {
        setLoadingOrders(false)
      })
  }, [])

  const [loadingBills, setLoadingBills] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    if (!hasUpdatedBills.current) {
      setLoadingProducts(true)
      fetchProducts().finally(() => {
        setLoadingProducts(false)
      })
      setLoadingBills(true)
      form?.focusField('bill')
      fetchBills({
        is_open: true
      }).finally(() => {
        setLoadingBills(false)
      })
      hasUpdatedBills.current = true
    }
  }, [fetchBills, fetchProducts, form])
  const [messageApi, contextHolder] = message.useMessage()
  const [loadingAdd, setLoadingAdd] = useState(false)
  const savedCode = getConfig('terminal-saved-code') || ''
  const finishOrders = useCallback(
    async (values: { bill: string; product: string; quantity: string; code: string }) => {
      if (brlToNumber(values.quantity.toString()) === 0) {
        messageApi.error('Quantidade deve ser maior que zero')
        return
      }
      if (loadingAdd) return
      setLoadingAdd(true)
      api
        .post('v1/desktop/operation/orders/', {
          data: [
            {
              bill: values.bill,
              product: values.product,
              notes: '',
              quantity: brlToNumber(values.quantity.toString()),
              complements: []
            }
          ],
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
          form?.resetFields(['quantity'])
          form?.focusField('bill')
          setLoadingAdd(false)
          fetchOrders(values.bill)
        })
        .catch((err) => {
          setLoadingAdd(false)
          messageApi.error(err?.response?.data?.detail || 'Erro ao enviar pedidos')
        })
    },
    [savedCode, loadingAdd, messageApi, form, fetchOrders]
  )
  useEffect(() => {
    window.api.onScaleWeight((_, weight) => {
      form?.setFieldsValue({ quantity: formatToKilos(weight.toFixed(3)) })
    })
    return () => {
      window.api.removeScaleWeightListener()
    }
  }, [form])

  useEffect(() => {
    window.api.onScaleError((_, error) => {
      console.error('Erro no peso da balança:', error)
      messageApi.error('Erro ao ler peso da balança')
    })
    return () => {
      window.api.removeScaleErrorListener()
    }
  }, [messageApi])
  const [openNewBillModal, setOpenNewBillModal] = useState(false)
  const onCreateBillSuccess = useCallback(
    (bill) => {
      setOpenNewBillModal(false)
      const newBillId = bill.id
      console.log('Nova comanda criada:', bill)
      form?.setFieldsValue({
        bill: newBillId,
        quantity: ''
      })
      form?.focusField('bill')
      fetchBills({
        is_open: true
      })
      fetchOrders(newBillId)
    },
    [fetchOrders, form, fetchBills]
  )
  useHotkeys(
    ['n'],
    (_, handler) => {
      switch (handler.hotkey) {
        case 'n':
          setOpenNewBillModal(true)
          break
      }
    },
    { enableOnContentEditable: true, enableOnFormTags: true }
  )
  return (
    <Container>
      {contextHolder}
      <OrdersSelectTable loadingProducts={loadingOrders} orders={orders} />
      {window.innerWidth > 620 && (
        <Flex
          vertical
          gap="1rem"
          style={{
            maxWidth: '550px',
            minWidth: '550px'
          }}
        >
          <Card
            style={{ width: '100%' }}
            styles={{
              body: {
                padding: '1rem'
              }
            }}
          >
            <Form
              layout="vertical"
              form={form}
              onFinish={async (values) => {
                await finishOrders(values)
              }}
            >
              <Form.Item>
                <Button
                  onClick={() => {
                    setOpenNewBillModal(true)
                  }}
                  icon={<Plus size={16} />}
                  type="dashed"
                  size="large"
                  block
                  disabled={loadingAdd || loadingBills || loadingProducts || loadingOrders}
                >
                  Abrir comanda
                </Button>
                <Flex align="center" justify="end">
                  <BillFormPage
                    onEndModal={() => {
                      form?.focusField('bill')
                    }}
                    onSuccess={(bill) => {
                      onCreateBillSuccess(bill)
                    }}
                    open={openNewBillModal}
                    onClose={() => setOpenNewBillModal(false)}
                  />
                </Flex>
              </Form.Item>
              <Form.Item
                label="Produto"
                name="product"
                initialValue={getConfig('balanca_product')}
                rules={[
                  {
                    required: true,
                    message: 'Obrigatório'
                  }
                ]}
                required
              >
                <Select
                  loading={loadingProducts}
                  onChange={(value) => {
                    setConfig('balanca_product', value)
                  }}
                  size="large"
                  showSearch={{
                    optionFilterProp: 'number'
                  }}
                  placeholder="Selecione um produto"
                  options={products
                    .filter((p) => p.sell_type === 'KG')
                    .map((product) => ({
                      label: `${product.name} - ${currenyFormat(Number(product.price))}`,
                      value: product.id,
                      code: product.code
                    }))}
                  optionRender={(option) => (
                    <Flex vertical>
                      <Text style={{ fontSize: '1.7rem', fontWeight: '500', margin: 0 }}>
                        {option.label}
                      </Text>
                    </Flex>
                  )}
                  style={{ width: '100%', fontSize: '1.7rem', fontWeight: '600' }}
                />
              </Form.Item>
              <Space.Compact
                style={{ alignItems: 'flex-end', marginBottom: '2rem', width: '100%' }}
                size="large"
              >
                <Form.Item
                  label="Comanda"
                  name="bill"
                  style={{ marginBottom: 0, width: '100%' }}
                  rules={[
                    {
                      required: true,
                      message: 'Obrigatório'
                    }
                  ]}
                  required
                >
                  <Select
                    size="large"
                    showSearch={{
                      optionFilterProp: 'number'
                    }}
                    allowClear
                    onClear={() => {
                      setOrders([])
                    }}
                    loading={loadingBills}
                    onChange={(value) => {
                      fetchOrders(value)
                    }}
                    placeholder="Selecione uma comanda"
                    options={bills.map((bill) => ({
                      label: `Comanda ${bill.number}`,
                      value: bill.id,
                      number: bill.number
                    }))}
                    onSelect={async () => {
                      form?.focusField('quantity')
                      if (await window.api.checkConnectScale()) {
                        await window.api.requestWeight()
                      } else {
                        messageApi.error('Balança desconectada')
                      }
                    }}
                    optionRender={(option) => (
                      <Flex vertical>
                        <Text style={{ fontSize: '1.7rem', fontWeight: '500', margin: 0 }}>
                          {option.label}
                        </Text>
                      </Flex>
                    )}
                    style={{ width: '100%', fontSize: '1.7rem', fontWeight: '600' }}
                  />
                </Form.Item>
                <Button
                  onClick={async () => {
                    setOrders([])
                    form?.resetFields()
                    form?.getFieldInstance('bill')?.focus()
                  }}
                  danger
                  className="custom-button-lg"
                  id="button-weight"
                  size="large"
                  style={{ minWidth: '60px' }}
                  icon={<XIcon />}
                ></Button>
              </Space.Compact>
              <Space.Compact
                style={{ alignItems: 'flex-end', marginBottom: '2rem', width: '100%' }}
                size="large"
              >
                <Form.Item
                  label="Peso"
                  name="quantity"
                  required
                  style={{ marginBottom: 0, width: '100%' }}
                  rules={[
                    {
                      required: true,
                      message: 'Obrigatório'
                    }
                  ]}
                >
                  <Input
                    size="large"
                    suffix="Kg"
                    placeholder="0,000 Kg"
                    id="quantity-input"
                    className="custom-input-lg"
                    type="text"
                    onChange={(e) => {
                      const value = formatToKilos(e.target.value)
                      form?.setFieldsValue({
                        quantity: value
                      })
                    }}
                    onPressEnter={(e) => {
                      e.preventDefault()
                      const buttonElement = document.getElementById('button-add-product')
                      buttonElement?.focus()
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowUp') {
                        e.preventDefault()
                        form.focusField('bill')
                      }
                    }}
                  />
                </Form.Item>
                <Button
                  onClick={async () => {
                    if (await window.api.checkConnectScale()) {
                      await window.api.requestWeight()
                      const buttonElement = document.getElementById('button-add-product')
                      buttonElement?.focus()
                    } else {
                      messageApi.error('Balança desconectada')
                      form.getFieldInstance('quantity')?.focus()
                    }
                  }}
                  className="custom-button-lg"
                  id="button-weight"
                  size="large"
                >
                  Atualizar
                </Button>
              </Space.Compact>
              <Button
                className="custom-button-lg"
                type="primary"
                block
                id="button-add-product"
                htmlType="submit"
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    form.focusField('quantity')
                  }
                }}
                loading={loadingAdd}
                disabled={loadingAdd}
              >
                Lançar pedido
              </Button>
            </Form>
          </Card>
        </Flex>
      )}
    </Container>
  )
}
