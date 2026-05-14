import React, { useCallback, useEffect } from 'react'
import { Order, Product } from '@renderer/types'
import {
  Button,
  Flex,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Space,
  Table,
  Typography
} from 'antd'
import { ArrowDown, ArrowUp, Minus, Plus } from 'lucide-react'
import api from '@renderer/services/api'
import { currenyFormat } from '@renderer/utils'
import { printOrderReceipt } from '@renderer/utils/Printers'
import dayjs from 'dayjs'
import { brlToNumber, formatToKilos } from '@renderer/utils/currency'
const { Text } = Typography
interface OrderModalProps {
  selectedProduct: Product | null
  onClose: () => void
  onSuccess?: (order: Order) => void
  billId: string
}
interface ProductToAdd {
  bill: string
  product: string
  notes: string
  status: string
  quantity: number
  code: string
}

interface ComplementToAdd {
  group: string
  complement: string
  group_name?: string
  complement_name?: string
  quantity: number
}

const NumberInput: React.FC<{
  value: number
  onChange: (value: number | null) => void
  max?: boolean
}> = ({ value, onChange, max }) => {
  return (
    <Flex align="center" gap="0.5rem">
      <Button
        icon={<Minus size={22} />}
        size="large"
        onClick={() => value > 0 && onChange(value - 1)}
        disabled={max && value === 0}
      />
      <InputNumber
        size="large"
        mode="spinner"
        style={{
          width: 60,
          height: 40
        }}
        onChange={onChange}
        value={value}
        defaultValue={0}
        min={0}
        controls={false}
        disabled={max}
      />
      <Button
        disabled={max}
        icon={<Plus size={22} />}
        size="large"
        onClick={() => !max && onChange(value + 1)}
      />
    </Flex>
  )
}

export const OrderModal: React.FC<OrderModalProps> = ({
  selectedProduct,
  onClose,
  onSuccess,
  billId
}) => {
  const [form] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()
  const [loadingAdd, setLoadingAdd] = React.useState(false)
  const savedCode = localStorage.getItem('chefchefe@terminal-saved-code') || ''
  const [complementsToAdd, setComplementsToAdd] = React.useState<ComplementToAdd[]>([])
  const disabled_to_add = React.useMemo(() => {
    if (!selectedProduct) return true
    if (selectedProduct.complement_groups.length === 0) return false
    return selectedProduct.complement_groups.some((group) => {
      const minimum_required_complements = group.min || 0
      if (minimum_required_complements === 0) return false
      const quantity_for_group = complementsToAdd
        .filter((c) => c.group === group.id)
        .reduce((acc, c) => acc + c.quantity, 0)
      return quantity_for_group < minimum_required_complements
    })
  }, [complementsToAdd, selectedProduct])
  const onFinish = useCallback(
    (values: ProductToAdd) => {
      if (loadingAdd) return
      setLoadingAdd(true)
      console.log('values', values)
      api
        .post('v1/desktop/orders/', {
          ...values,
          code: savedCode || values.code,
          quantity: brlToNumber(values.quantity.toString()),
          complements: complementsToAdd
            .filter((c) => c.quantity > 0)
            .map((c) => ({
              complement: c.complement,
              quantity: c.quantity
            }))
        })
        .then((response) => {
          const data = {
            printerName: response.data?.printer_name,
            order: {
              number_id: response?.data?.number,
              table: response?.data?.table_number,
              identification: response?.data?.bill_identification,
              bill_number: response?.data?.bill_number,
              waiter: response?.data?.launched_by_name,
              quantity: response?.data?.quantity,
              product_name: response?.data?.product_name,
              notes: response?.data?.notes,
              date: dayjs(response?.data?.created).format('DD/MM/YYYY HH:mm:ss')
            },
            type: 'first' as 'first' | 'reprint'
          }
          if (response.data?.printer_name) {
            printOrderReceipt(data)
          }
          setComplementsToAdd([])
          messageApi.success('Produto adicionado com sucesso')
          onSuccess?.(response.data)
        })
        .catch((err) => {
          messageApi.error(err.response?.data?.detail || 'Erro ao adicionar produto')
        })
        .finally(() => {
          setLoadingAdd(false)
        })
    },
    [complementsToAdd, savedCode, messageApi, onSuccess, loadingAdd]
  )
  useEffect(() => {
    window.api.onScaleWeight((_, weight) => {
      console.log('Peso recebido do backend:', weight.toFixed(3))
      form?.setFieldsValue({ quantity: formatToKilos(weight.toFixed(3)) })
    })
    return () => {
      window.api.removeScaleWeightListener()
    }
  }, [form])

  useEffect(() => {
    window.api.onScaleError((_, error) => {
      console.error('Erro no peso da balança:', error)
    })
    return () => {
      window.api.removeScaleErrorListener()
    }
  }, [])
  return (
    <Modal
      open={!!selectedProduct}
      onCancel={onClose}
      title={selectedProduct?.name}
      destroyOnHidden
      footer={
        <Flex>
          <Text type="secondary">
            use <ArrowDown size={14} /> <ArrowUp size={14} /> para alterar a quantidade e{' '}
            <b>Enter</b> para adicionar o produto
          </Text>
        </Flex>
      }
      width={600}
      afterOpenChange={(open) => {
        if (!open) {
          setComplementsToAdd([])
          form.resetFields()
        } else {
          form?.setFieldsValue({
            quantity: selectedProduct?.sell_type === 'UN' ? 1 : undefined
          })
          if (selectedProduct?.sell_type === 'KG') {
            const buttonElement = document.getElementById('button-weight')
            buttonElement?.focus()
          } else {
            form?.getFieldInstance('quantity')?.focus()
          }
        }
      }}
    >
      {contextHolder}
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="product" initialValue={selectedProduct?.id} hidden></Form.Item>
        <Form.Item name="bill" initialValue={billId} hidden></Form.Item>
        {selectedProduct?.complement_groups.map((group) => (
          <Flex vertical key={group.id} gap="0.5rem" style={{ marginBottom: '1rem' }}>
            <Text strong>{group.name}</Text>
            <Table
              size="small"
              pagination={false}
              showHeader={false}
              bordered={true}
              rowKey={(record) => record.id}
              columns={[
                {
                  title: 'Complemento',
                  dataIndex: 'name',
                  key: 'name',
                  render: (value, record) => (
                    <Text>
                      {value} - {`${currenyFormat(Number(record.price))}`}
                    </Text>
                  )
                },
                {
                  title: 'Quantidade',
                  dataIndex: 'id',
                  key: 'id',
                  width: 150,
                  render: (_, item) => (
                    <NumberInput
                      max={
                        complementsToAdd.find((c) => c.complement === item.id)?.quantity ===
                          item.max ||
                        group.max -
                          (complementsToAdd
                            .filter((c) => c.group === group.id)
                            .reduce((acc, c) => acc + c.quantity, 0) || 0) <=
                          0
                      }
                      value={complementsToAdd.find((c) => c.complement === item.id)?.quantity || 0}
                      onChange={(value) => {
                        setComplementsToAdd((prev) => {
                          const index = prev.findIndex((c) => c.complement === item.id)
                          if (index === -1) {
                            return [
                              ...prev,
                              {
                                complement: item.id,
                                group: group.id,
                                quantity: value ?? 0,
                                group_name: group.name,
                                complement_name: item.name
                              }
                            ]
                          } else {
                            if (value === 0) {
                              return prev.filter((c) => c.complement !== item.id)
                            }
                            const newComplements = [...prev]
                            newComplements[index] = {
                              ...newComplements[index],
                              quantity: value ?? 0
                            }
                            return newComplements
                          }
                        })
                      }}
                    />
                  )
                }
              ]}
              dataSource={group.complements}
              locale={{
                emptyText: 'Nenhum complemento adicionado'
              }}
            />
          </Flex>
        ))}
        <Form.Item label="Anotacão (opcional)" name="notes" initialValue={''}>
          <Input.TextArea
            size="large"
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') {
                e.preventDefault()
                form?.getFieldInstance('quantity')?.focus()
              }
            }}
          />
        </Form.Item>
        <Flex style={{ width: '100%' }} gap="1rem" align="end">
          {selectedProduct?.sell_type === 'UN' ? (
            <Form.Item
              label={selectedProduct?.sell_type === 'UN' ? 'Quantidade' : 'Peso'}
              name="quantity"
              initialValue={selectedProduct?.sell_type === 'UN' ? 1 : undefined}
              required
              rules={[
                {
                  required: true,
                  message: 'Obrigatório'
                }
              ]}
              style={{ marginBottom: 0 }}
            >
              <InputNumber
                min={1}
                size="large"
                onPressEnter={(e) => {
                  e.preventDefault()
                  if (!savedCode) {
                    form?.getFieldInstance('code')?.focus()
                  } else {
                    const buttonElement = document.getElementById('button-add-product')
                    buttonElement?.focus()
                  }
                }}
              />
            </Form.Item>
          ) : (
            <Space.Compact style={{ alignItems: 'flex-end' }} size="large">
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
                id="button-weight"
                size="large"
              >
                Atualizar
              </Button>
              <Form.Item
                label={selectedProduct?.sell_type === 'UN' ? 'Quantidade' : 'Peso'}
                name="quantity"
                initialValue={selectedProduct?.sell_type === 'UN' ? 1 : undefined}
                required
                style={{ marginBottom: 0 }}
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
                  type="text"
                  onChange={(e) => {
                    const value = formatToKilos(e.target.value)
                    form?.setFieldsValue({
                      quantity: value
                    })
                  }}
                  onPressEnter={(e) => {
                    e.preventDefault()
                    if (!savedCode) {
                      form?.getFieldInstance('code')?.focus()
                    } else {
                      const buttonElement = document.getElementById('button-add-product')
                      buttonElement?.focus()
                    }
                  }}
                />
              </Form.Item>
            </Space.Compact>
          )}
          {!savedCode && (
            <Form.Item
              label="Código funcionário"
              name="code"
              required
              style={{
                maxWidth: 200,
                marginBottom: 0
              }}
              rules={[
                {
                  required: true,
                  message: 'Obrigatório'
                }
              ]}
            >
              <Input
                type="password"
                size="large"
                placeholder="****"
                autoComplete="new-password"
                onPressEnter={(e) => {
                  e.preventDefault()
                  const buttonElement = document.getElementById('button-add-product')
                  buttonElement?.focus()
                }}
              />
            </Form.Item>
          )}
          <Form.Item label="" style={{ flex: 1, marginBottom: 0 }}>
            <Button
              type="primary"
              size="large"
              style={{ marginTop: '1.5rem' }}
              block
              htmlType="submit"
              id="button-add-product"
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') {
                  e.preventDefault()
                  form?.getFieldInstance('quantity')?.focus()
                }
                if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  const quantityElement = form?.getFieldInstance('notes')
                  quantityElement?.focus()
                }
              }}
              loading={loadingAdd}
              disabled={disabled_to_add}
            >
              Adicionar
            </Button>
          </Form.Item>
        </Flex>
      </Form>
    </Modal>
  )
}
