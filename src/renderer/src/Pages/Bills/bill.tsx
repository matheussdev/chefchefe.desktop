import { useBill } from '@renderer/hooks/useBills'
import {
  Button,
  Card,
  Drawer,
  Flex,
  Form,
  FormInstance,
  Input,
  message,
  Modal,
  Select,
  Tabs,
  Tag,
  Typography
} from 'antd'
import { ChevronLeft, FileDigit, MonitorUp, Receipt } from 'lucide-react'
import React, { useCallback, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BillResum } from './components/BillResum'
import { Bill } from '@renderer/types'
import { BillPriceResum } from './components/BillPriceResum'
import { BillItemsTable } from './components/BillItems'
import { useHotkeys } from 'react-hotkeys-hook'
import api from '@renderer/services/api'
import { errorActions } from '@renderer/utils'
import { printCloseCommand } from '@renderer/utils/Printers'
const { Text } = Typography
export const BillDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [bill, setBill] = React.useState<Bill | null>(null)
  const [loadingBill, setLoadingBill] = React.useState(false)
  const { fetchBillById, fetchBills } = useBill()
  const [billsToGroup, setBillsToGroup] = React.useState<Bill[]>([])
  const hasUpdatedBills = useRef(false)
  const [unifyDrawerOpen, setUnifyDrawerOpen] = React.useState(false)
  const [loadingUnify, setLoadingUnify] = React.useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const [cancelModalOpen, setCancelModalOpen] = React.useState(false)
  const [cancelError, setCancelError] = React.useState<string | null>(null)
  const [loadingCancel, setLoadingCancel] = React.useState(false)
  const cancelForm = useRef<FormInstance | null>(null)
  const getBill = useCallback(
    async (id: string) => {
      setLoadingBill(true)
      fetchBillById(id)
        .then((data) => {
          setBill(data)
          fetchBills(
            {
              is_open: true,
              free_group: true,
              current_group: data?.bill_groups ? data.bill_groups[0] : undefined
            },
            false
          ).then((datar) => {
            setBillsToGroup(datar as Bill[])
          })
        })
        .finally(() => {
          setLoadingBill(false)
        })
    },
    [fetchBillById, fetchBills]
  )
  useEffect(() => {
    if (!hasUpdatedBills.current && id) {
      getBill(id!)
      hasUpdatedBills.current = true
    }
  }, [getBill, id])
  const navigate = useNavigate()
  useHotkeys(['q', 'u', 'n', 'f'], (_, handler) => {
    switch (handler.hotkey) {
      case 'q':
        navigate('/comandas')
        break
      case 'u':
        setUnifyDrawerOpen(true)
        break
      case 'n':
        alert('NF!')
        break
      case 'f':
        if (bill?.is_open) navigate(`/terminal/${id}/`)
        break
    }
  })

  return (
    <Flex
      style={{
        height: 'calc(100vh - 4rem)',
        padding: '1rem',
        gap: '1rem'
      }}
    >
      {contextHolder}
      <Flex
        vertical
        style={{
          width: '100%'
        }}
        gap="1rem"
      >
        <Flex wrap="wrap" gap="0.6rem" align="center">
          <Button
            icon={<ChevronLeft size={16} />}
            onClick={() => {
              navigate('/comandas')
            }}
            type="text"
            style={{ padding: '0rem' }}
          >
            Voltar (Q)
          </Button>

          <Flex wrap="wrap" gap="0.2rem" style={{ display: 'inline-flex' }} align="center">
            <Text
              strong
              style={{
                marginRight: '0.5rem',
                fontSize: '1.2rem'
              }}
            >
              Comandas:
            </Text>
            {bill?.bill_group
              ? bill?.bill_group?.map((group) => (
                  <Tag key={group.id} color="blue" variant="outlined">
                    {group.number.toString().padStart(3, '0')}
                  </Tag>
                ))
              : bill?.number || bill?.identification || bill?.table_number || 'N/A'}
          </Flex>
          {bill?.is_open && (
            <Button
              style={{ marginLeft: 'auto' }}
              icon={<MonitorUp size={16} />}
              onClick={() => {
                navigate(`/terminal/${id}/`)
              }}
              type="dashed"
            >
              Adicionar Pedido (F)
            </Button>
          )}
          <Button
            style={{ marginLeft: bill?.is_open ? '0.5rem' : 'auto' }}
            icon={<FileDigit size={16} />}
            onClick={() => {
              setUnifyDrawerOpen(true)
            }}
            type="dashed"
          >
            Unificar (U)
          </Button>
          <Button
            icon={<Receipt size={16} />}
            onClick={() => {
              alert('Visualizar')
            }}
            type="dashed"
          >
            NF (N)
          </Button>
        </Flex>
        <Card
          styles={{
            body: {
              padding: '0rem',
              flexGrow: 1,
              overflow: 'hidden'
            }
          }}
        >
          <Tabs
            defaultActiveKey="1"
            tabBarStyle={{ padding: '0 1rem', marginBottom: '0rem' }}
            items={[
              {
                label: `Pedidos`,
                key: '1',
                children: (
                  <BillItemsTable
                    open={bill?.is_open}
                    items={
                      bill?.bill_group
                        ? bill?.bill_group.flatMap((group) => group.orders)
                        : bill?.orders || []
                    }
                    loading={loadingBill}
                    onCancelSuccess={() => {
                      window.api.reloadApp()
                    }}
                    onTransferSuccess={() => {
                      window.api.reloadApp()
                    }}
                  />
                )
              },
              {
                label: `Pagamentos`,
                key: '2',
                disabled: bill?.is_open,
                children: <>olá2</>,
                style: { padding: '1rem' }
              }
            ]}
          />
        </Card>
      </Flex>
      {window.innerWidth > 845 && (
        <Flex
          vertical
          style={{
            width: '40%',
            maxWidth: '500px',
            minWidth: '270px'
          }}
          gap={'1rem'}
        >
          <BillResum bill={bill} loading={loadingBill} />
          {bill?.orders && bill.orders.length > 0 && bill.is_open && (
            <BillPriceResum
              orders={
                bill?.bill_group
                  ? bill?.bill_group.flatMap((group) =>
                      group.orders.flatMap((order) => {
                        return {
                          quantity: Number(order.quantity),
                          name: order.product_name,
                          price: Number(order.total_price)
                        }
                      })
                    )
                  : bill.orders.flatMap((order) => {
                      return {
                        quantity: Number(order.quantity),
                        name: order.product_name,
                        price: Number(order.total_price)
                      }
                    })
              }
              bills={bill?.bill_group ? bill?.bill_group : [bill]}
              subtotal={
                bill?.bill_group
                  ? bill?.bill_group
                      .flatMap((group) => group.orders)
                      .reduce((acc, item) => acc + Number(item.total_price), 0)
                  : bill?.orders.reduce((acc, item) => acc + Number(item.total_price), 0)
              }
              loading={loadingBill}
            />
          )}
          {bill?.is_open && (
            <Button type="dashed" block danger onClick={() => setCancelModalOpen(true)}>
              Fechar comanda
            </Button>
          )}
        </Flex>
      )}
      <Drawer
        title={'Unificar comandas'}
        size={600}
        onClose={() => setUnifyDrawerOpen(false)}
        open={unifyDrawerOpen}
        destroyOnHidden
      >
        <Form
          layout="vertical"
          initialValues={{
            bills: bill?.bill_group ? bill.bill_group.map((group) => group.id) : [bill?.id]
          }}
          onFinish={(values) => {
            setLoadingUnify(true)
            api
              .post(`/v1/desktop/bill-groups/`, {
                bills: [...(values.bills || [])],
                group_id:
                  bill?.bill_groups && bill?.bill_groups?.length > 0
                    ? bill.bill_groups[0]
                    : undefined
              })
              .then(() => {
                getBill(id!)
                setUnifyDrawerOpen(false)
                messageApi.success('Comandas unificadas com sucesso!')
              })
              .catch((error) => {
                errorActions(error)
                messageApi.error(error.response?.data?.detail || 'Erro ao unificar comandas')
              })
              .finally(() => {
                setLoadingUnify(false)
              })
          }}
        >
          <Form.Item label="Comandas para unificar" name="bills">
            <Select
              placeholder="Clique aqui e selecione a comanda para unificar"
              allowClear
              style={{ width: '100%', minHeight: '80px' }}
              size="large"
              options={billsToGroup.map((bill) => ({
                label: `Comanda ${bill.number} - ${bill.table_number ? `Mesa ${bill.table_number}` : 'Sem mesa'}`,
                value: bill.id
              }))}
              mode="multiple"
              showSearch={{
                optionFilterProp: 'label'
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loadingUnify}>
              Salvar
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
      <Modal
        open={cancelModalOpen}
        onCancel={() => !loadingCancel && setCancelModalOpen(false)}
        title="Fechar comanda"
        destroyOnHidden
        footer={
          <Flex gap="0.5rem" justify="space-between">
            <Button
              onClick={() => {
                setCancelError(null)
                setCancelModalOpen(false)
              }}
              disabled={loadingCancel}
            >
              Voltar
            </Button>
            <Button
              type="primary"
              danger
              onClick={() => cancelForm.current?.submit()}
              loading={loadingCancel}
            >
              Sim, fechar comanda
            </Button>
          </Flex>
        }
      >
        <Text>Tem certeza que deseja fechar esta comanda?</Text>
        <Form
          layout="vertical"
          style={{ marginTop: '1rem' }}
          ref={cancelForm}
          onFinish={(values) => {
            setCancelError(null)
            setLoadingCancel(true)
            api
              .patch(`/v1/desktop/bills/${id}/`, {
                is_open: false,
                ...values
              })
              .then(async (res) => {
                messageApi.success('Comanda fechada com sucesso!')
                const data = {
                  printerName: 'caixa',
                  bill: {
                    bill_number: bill?.number.toString() || '',
                    table: bill?.table_number ? `Mesa ${bill.table_number}` : 'Sem mesa',
                    subtotal: bill?.orders
                      ? bill?.orders.reduce((acc, item) => acc + Number(item.total_price), 0)
                      : 0
                  },
                  orders: bill?.orders
                    ? bill?.orders.map((order) => ({
                        name: order.product_name,
                        quantity: Number(order.quantity),
                        price: Number(order.total_price)
                      }))
                    : [],
                  date: new Date().toLocaleString(),
                  motivo: values.close_message || '',
                  employee: res?.data?.close_detail?.closed_by_name || ''
                }
                await printCloseCommand(data)
                navigate('/comandas')
              })
              .catch((error) => {
                errorActions(error)
                setCancelError(error.response?.data?.detail || 'Erro ao cancelar item')
              })
              .finally(() => {
                setLoadingCancel(false)
              })
          }}
        >
          <Form.Item name="close_message" label="Motivo do fechamento">
            <Input.TextArea placeholder="Motivo do fechamento" size="large" />
          </Form.Item>
          <Form.Item
            name="code"
            label="Código do operador"
            rules={[{ required: true, message: 'Código do operador é obrigatório' }]}
            required
          >
            <Input.Password placeholder="Código do operador" size="large" />
          </Form.Item>
        </Form>
        {cancelError && (
          <Text type="danger" style={{ marginTop: '0.5rem', display: 'block' }}>
            {cancelError}
          </Text>
        )}
      </Modal>
    </Flex>
  )
}
