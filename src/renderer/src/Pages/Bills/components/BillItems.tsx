import React from 'react'
import {
  Button,
  Flex,
  Form,
  FormInstance,
  Input,
  Modal,
  Select,
  Table,
  Tag,
  Typography
} from 'antd'
import { Clock, Forward, NotepadTextDashed, Trash2, User } from 'lucide-react'
import { Bill, Order } from '@renderer/types'
import { currenyFormat, errorActions } from '@renderer/utils'
import dayjs from 'dayjs'
import api from '@renderer/services/api'
import { useBill } from '@renderer/hooks/useBills'
const { Text } = Typography
interface BillItemsProps {
  items: Order[]
  loading?: boolean
  onCancelSuccess?: (order: Order) => void
  onTransferSuccess?: (order: Order) => void
  open?: boolean
}

export const BillItemsTable: React.FC<BillItemsProps> = ({
  items,
  loading,
  onCancelSuccess,
  onTransferSuccess,
  open
}) => {
  const [loadingCancel, setLoadingCancel] = React.useState<boolean>(false)
  const [toCancel, setToCancel] = React.useState<Order | null>(null)
  const [toTransfer, setToTransfer] = React.useState<Order | null>(null)
  const [loadingTransfer, setLoadingTransfer] = React.useState<boolean>(false)
  const [transferError, setTransferError] = React.useState<string | null>(null)
  const [cancelError, setCancelError] = React.useState<string | null>(null)
  const cancelForm = React.useRef<FormInstance>(null)
  const transferForm = React.useRef<FormInstance>(null)
  const [opened, setOpened] = React.useState<Bill[]>([])
  const { fetchBills } = useBill()
  return (
    <>
      <Table
        loading={loading}
        size="small"
        scroll={{ y: window.innerHeight - 240 }}
        columns={[
          {
            title: 'Qtd',
            dataIndex: 'quantity',
            width: 60,
            align: 'center',
            key: 'quantity',
            render: (value) => Number(value)
          },
          { title: 'Produto', dataIndex: 'product_name', ellipsis: true, key: 'product_name' },
          {
            title: 'valor unitário',
            dataIndex: 'unit_price',
            key: 'unit_price',
            width: 110,
            render: (value) => currenyFormat(Number(value))
          },
          {
            title: 'valor',
            dataIndex: 'total_price',
            width: 110,
            key: 'total_price',
            render: (value) => currenyFormat(Number(value))
          },
          {
            title: 'responsável',
            dataIndex: 'launched_by',
            render: (value) => (
              <>
                <User size={16} style={{ marginRight: 4 }} />
                {value}
              </>
            )
          },
          {
            title: 'Comanda',
            dataIndex: 'bill_number',
            render: (value) => (
              <Tag variant="outlined" color="blue">
                Comanda {value}
              </Tag>
            )
          },
          {
            title: 'Ações',
            dataIndex: 'actions',
            width: 80,
            hidden: !open,
            render: (_, record) => (
              <Flex gap="0.5rem">
                <Button
                  type="dashed"
                  onClick={() => {
                    setToTransfer(record)
                    fetchBills({ is_open: true }, false).then((bills) => {
                      setOpened(bills as Bill[])
                    })
                  }}
                  size="small"
                  icon={<Forward size={16} />}
                ></Button>
                <Button
                  type="dashed"
                  danger
                  onClick={() => {
                    setToCancel(record)
                    setTimeout(() => {
                      cancelForm?.current?.getFieldInstance('cancel_notes')?.focus()
                    }, 300)
                  }}
                  size="small"
                  icon={<Trash2 size={16} />}
                ></Button>
              </Flex>
            )
          }
        ]}
        dataSource={items}
        pagination={false}
        expandable={{
          expandedRowRender: (record) => (
            <Flex gap="0.5rem" vertical>
              <Flex align="center" gap="0.5rem">
                <Clock size={16} />
                <Text strong>Lançamento:</Text>
                <Text> {dayjs(record.created).format('DD/MM/YYYY HH:mm')}</Text>
              </Flex>
              <Flex align="center" gap="0.5rem">
                <NotepadTextDashed size={16} />
                <Text strong>Observações:</Text>
                <Text> {record.notes}</Text>
              </Flex>
              {record.complements && record.complements.length > 0 ? (
                <Flex vertical gap="0.25rem">
                  <strong>Complementos:</strong>
                  {record.complements.map((modifier, j) => (
                    <Flex key={j} vertical gap="0.25rem">
                      <strong>{modifier.complement_group_name}:</strong>
                      {modifier.complements.map((complement, i) => (
                        <Flex key={i} gap="0.5rem" style={{ marginLeft: '1rem' }}>
                          <span>{Number(complement.quantity)}x</span>
                          <span>
                            {complement.name} - {currenyFormat(Number(complement.price))}
                          </span>
                        </Flex>
                      ))}
                    </Flex>
                  ))}
                </Flex>
              ) : (
                <span style={{ fontStyle: 'italic' }}>Sem complementos</span>
              )}
            </Flex>
          )
        }}
        rowKey={(record) => record.id}
      />
      <Modal
        open={!!toTransfer}
        onCancel={() => !loadingTransfer && setToTransfer(null)}
        title="Transferir item"
        destroyOnHidden
        footer={
          <Flex gap="0.5rem" justify="space-between">
            <Button onClick={() => !loading && setToCancel(null)} disabled={loading}>
              Voltar
            </Button>
            <Button
              type="primary"
              danger
              onClick={() => transferForm.current?.submit()}
              loading={loadingTransfer}
            >
              Sim, Transferir
            </Button>
          </Flex>
        }
      >
        <Form
          layout="vertical"
          style={{ marginTop: '1rem' }}
          ref={transferForm}
          onFinish={(values) => {
            setLoadingTransfer(true)
            api
              .patch(`/v1/desktop/orders/${toTransfer?.id}/`, {
                ...values
              })
              .then((res) => {
                setToTransfer(null)
                onTransferSuccess?.(res.data)
              })
              .catch((error) => {
                errorActions(error)
                setTransferError(error.response?.data?.detail || 'Erro ao transferir item')
              })
              .finally(() => {
                setLoadingTransfer(false)
              })
          }}
        >
          <Form.Item
            name="new_bill"
            label="Nova comanda"
            rules={[{ required: true, message: 'Comanda de destino é obrigatória' }]}
            required
          >
            <Select
              placeholder="Selecione a comanda para qual deseja transferir o item"
              options={opened
                .filter((bill) => bill.number !== toTransfer?.bill_number)
                .map((bill) => ({
                  label: `Comanda ${bill.number} - ${bill.table_number || 'Sem mesa'}`,
                  value: bill.id,
                  number: bill.number
                }))}
              showSearch={{
                optionFilterProp: 'number'
              }}
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="code"
            label="Código do operador"
            rules={[{ required: true, message: 'Código do operador é obrigatório' }]}
          >
            <Input.Password placeholder="Código do operador" size="large" />
          </Form.Item>
        </Form>
        {transferError && (
          <Text type="danger" style={{ marginTop: '0.5rem', display: 'block' }}>
            {transferError}
          </Text>
        )}
      </Modal>
      <Modal
        open={!!toCancel}
        onCancel={() => !loading && setToCancel(null)}
        title="Cancelar item"
        destroyOnHidden
        footer={
          <Flex gap="0.5rem" justify="space-between">
            <Button onClick={() => !loading && setToCancel(null)} disabled={loading}>
              Voltar
            </Button>
            <Button
              type="primary"
              danger
              onClick={() => cancelForm.current?.submit()}
              loading={loadingCancel}
            >
              Sim, Cancelar
            </Button>
          </Flex>
        }
      >
        <Text>Tem certeza que deseja cancelar este item?</Text>
        <Table
          size="small"
          columns={[
            {
              title: 'Qtd',
              dataIndex: 'quantity',
              width: 60,
              align: 'center',
              key: 'quantity',
              render: (value) => Number(value)
            },
            { title: 'Produto', dataIndex: 'product_name', key: 'product_name' },
            {
              title: 'valor',
              dataIndex: 'total_price',
              key: 'total_price',
              render: (value) => currenyFormat(Number(value))
            }
          ]}
          dataSource={toCancel ? [toCancel] : []}
          pagination={false}
        />
        <Form
          layout="vertical"
          style={{ marginTop: '1rem' }}
          ref={cancelForm}
          onFinish={(values) => {
            setCancelError(null)
            setLoadingCancel(true)
            api
              .patch(`/v1/desktop/orders/${toCancel?.id}/`, {
                status: 'CANCELED',
                ...values
              })
              .then((res) => {
                setToCancel(null)
                onCancelSuccess?.(res.data)
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
          <Form.Item name="cancel_notes" label="Motivo do cancelamento">
            <Input.TextArea placeholder="Motivo do cancelamento" size="large" />
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
    </>
  )
}
