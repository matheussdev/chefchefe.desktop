import React, { useCallback, useEffect } from 'react'
import { Product } from '@renderer/types'
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
import { currenyFormat } from '@renderer/utils'
import { brlToNumber, formatToKilos } from '@renderer/utils/currency'
const { Text } = Typography
interface ToAddOrder {
  bill: string
  product: string
  notes: string
  status: string
  quantity: number
  product_name: string
  complements: {
    complement: string
    quantity: number
  }[]
}
interface OrderModalProps {
  selectedProduct: Product | null
  onClose: () => void
  onSuccess?: (order: ToAddOrder) => void
  billId: string
}
interface ProductToAdd {
  bill: string
  product: string
  notes: string
  status: string
  quantity: number
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
  id: string
  index?: number
}> = ({ value, onChange, max, id, index }) => {
  return (
    <Flex align="center" gap="0.5rem">
      <Button
        icon={<Minus size={22} />}
        size="large"
        onClick={() => value > 0 && onChange(value - 1)}
        disabled={value === 0}
        style={{ height: '48px', width: '48px' }}
        id={`minus-${id}-${index}`}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            const plusButton = document.getElementById(`plus-${id}-${index ? index + 1 : 0}`)
            plusButton?.focus()
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            const plusButton = document.getElementById(`plus-${id}-${index ? index - 1 : 0}`)
            plusButton?.focus()
          } else if (e.key === 'ArrowRight') {
            e.preventDefault()
            const plusButton = document.getElementById(`plus-${id}-${index ? index + 1 : 0}`)
            plusButton?.focus()
          }
        }}
      />
      <InputNumber
        size="large"
        mode="spinner"
        style={{
          width: 60
        }}
        className="custom-input-number"
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
        style={{ height: '48px', width: '48px' }}
        onClick={() => !max && onChange(value + 1)}
        id={`plus-${id}-${index}`}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            const plusButton = document.getElementById(`plus-${id}-${index ? index + 1 : 0}`)
            alert(`plus-${id}-${index ? index + 1 : 0}`)
            plusButton?.focus()
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            const plusButton = document.getElementById(`plus-${id}-${index ? index - 1 : 0}`)
            plusButton?.focus()
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault()
            const minusButton = document.getElementById(`minus-${id}-${index ? index - 1 : 0}`)
            minusButton?.focus()
          }
        }}
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
      onSuccess?.({
        ...values,
        product_name: selectedProduct?.name || '',
        quantity: brlToNumber(values.quantity.toString()),
        complements: complementsToAdd
          .filter((c) => c.quantity > 0)
          .map((c) => ({
            complement: c.complement,
            quantity: c.quantity
          }))
      })
      setComplementsToAdd([])
      setLoadingAdd(false)
      onClose()
    },
    [complementsToAdd, onSuccess, onClose, selectedProduct]
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
      closeIcon={false}
      centered
      title={
        <Text strong style={{ fontSize: '1.8rem' }}>
          {selectedProduct?.name}
        </Text>
      }
      destroyOnHidden
      footer={
        <Flex>
          <Text type="secondary">
            use <ArrowDown size={14} /> <ArrowUp size={14} /> para alterar a quantidade e{' '}
            <b>Enter</b> para adicionar o produto
          </Text>
        </Flex>
      }
      width={700}
      afterOpenChange={(open) => {
        if (!open) {
          setComplementsToAdd([])
          form.resetFields()
        } else {
          setLoadingAdd(false)
          form?.setFieldsValue({
            quantity: selectedProduct?.sell_type === 'UN' ? 1 : undefined
          })
          if (selectedProduct?.sell_type === 'KG') {
            // const buttonElement = document.getElementById('button-weight')
            // buttonElement?.focus()
            form?.getFieldInstance('quantity')?.focus()
          } else {
            form?.getFieldInstance('quantity')?.focus()
          }
        }
      }}
    >
      {contextHolder}
      <Form form={form} layout="vertical" onFinish={onFinish} autoFocus={false}>
        <Form.Item name="product" initialValue={selectedProduct?.id} hidden></Form.Item>
        <Form.Item name="bill" initialValue={billId} hidden></Form.Item>
        <Flex vertical style={{ maxHeight: 'calc(100vh - 340px)', overflowY: 'auto' }} gap="1rem">
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
                      <Text
                        style={{ display: 'block', fontSize: '1.5rem' }}
                        ellipsis={{ tooltip: value }}
                      >
                        {value}{' '}
                        <Text
                          style={{ fontSize: '1rem' }}
                        >{`${currenyFormat(Number(record.price))}`}</Text>
                      </Text>
                    )
                  },
                  {
                    title: 'Quantidade',
                    dataIndex: 'id',
                    key: 'id',
                    width: 150,
                    render: (_, item, ind) => (
                      <NumberInput
                        id={'plus-min'}
                        index={ind + 1}
                        max={
                          complementsToAdd.find((c) => c.complement === item.id)?.quantity ===
                            item.max ||
                          group.max -
                            (complementsToAdd
                              .filter((c) => c.group === group.id)
                              .reduce((acc, c) => acc + c.quantity, 0) || 0) <=
                            0
                        }
                        value={
                          complementsToAdd.find((c) => c.complement === item.id)?.quantity || 0
                        }
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
        </Flex>
        <Form.Item label="Anotacão (opcional)" name="notes" initialValue={''}>
          <Input.TextArea
            size="large"
            autoFocus={false}
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
                className="custom-input-number"
                onPressEnter={(e) => {
                  e.preventDefault()
                  const buttonElement = document.getElementById('button-add-product')
                  buttonElement?.focus()
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
                style={{ height: '48px' }}
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
                  className="custom-input"
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
                />
              </Form.Item>
            </Space.Compact>
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
