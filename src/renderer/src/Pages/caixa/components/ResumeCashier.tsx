import {
  Button,
  Card,
  Flex,
  Typography,
  Space,
  theme,
  Modal,
  Form,
  Input,
  FormInstance,
  message,
  Skeleton
} from 'antd'
import React from 'react'
import { Cashier } from '../../../types'
import api from '../../../services/api'
import { formatCurrency } from '@renderer/utils/currency'
import dayjs from 'dayjs'
import { Calendar, Inbox, Landmark, Printer, User } from 'lucide-react'
const { Text, Title } = Typography

interface ResumeCashierProps {
  cashier: Cashier | null
  loading?: boolean
}

export const ResumeCashier: React.FC<ResumeCashierProps> = ({ cashier, loading }) => {
  const token = theme.useToken().token
  const [cancelModal, setCancelModal] = React.useState(false)
  const cancelForm = React.useRef<FormInstance>(null)
  const [messageApi, contextHolder] = message.useMessage()
  return (
    <Card
      style={{
        width: '100%'
      }}
      styles={{
        header: {
          padding: '0.2rem 1rem'
        },
        title: {
          margin: '0'
        },
        body: {
          padding: '1rem'
        }
      }}
      title={
        <Space style={{ margin: 0, padding: 0 }}>
          <Landmark color={token.colorPrimary} size={20} />
          Valor em caixa
        </Space>
      }
      extra={[
        <Space key="actions" size="small">
          <Button icon={<Printer size={16} />}>Relatório</Button>
          <Button
            danger
            type="primary"
            icon={<Inbox size={16} />}
            onClick={() => setCancelModal(true)}
          >
            Fechar caixa
          </Button>
        </Space>
      ]}
    >
      {contextHolder}
      <Skeleton active loading={loading} paragraph={{ rows: 2 }}>
        <Title
          level={2}
          style={{
            color: token.colorPrimary,
            fontWeight: '900',
            margin: '0 0 0.5rem 0',
            marginBottom: '0.5rem'
          }}
        >
          {formatCurrency(Number(cashier?.current_value || 0))}
        </Title>
        <Flex gap={5} align="center" style={{ marginBottom: 5 }}>
          <User size={16} />
          <Text>{cashier?.opened_by_name}</Text>
        </Flex>

        <Flex gap={5} align="center">
          <Calendar size={16} />
          {dayjs(cashier?.created).format('DD/MM/YYYY HH:mm:ss')}
        </Flex>
      </Skeleton>
      <Modal
        title="Fechar Caixa"
        open={cancelModal}
        okText="Fechar caixa"
        onCancel={() => setCancelModal(false)}
        okButtonProps={{
          danger: true
        }}
        onOk={() => {
          cancelForm.current?.submit()
        }}
        confirmLoading={loading}
      >
        <Form
          layout="vertical"
          ref={cancelForm}
          onFinish={(values) => {
            api
              .patch(`v1/desktop/cashiers/${cashier?.id}/`, {
                code: values.code
              })
              .then(() => {
                messageApi.success('Caixa fechado com sucesso')
                window.api.reloadApp()
              })
              .catch((error) => {
                message.error(error?.response?.data?.message || 'Erro ao fechar caixa')
              })
              .finally(() => {})
          }}
        >
          <Form.Item
            label="Código do operador"
            name="code"
            required
            rules={[
              {
                required: true,
                message: 'Informe o código do operador'
              }
            ]}
          >
            <Input.Password size="large" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
