import { useCashier } from '@renderer/hooks/useCashiers'
import { brlToNumber, formatToBRL } from '@renderer/utils/currency'
import {
  Avatar,
  Button,
  Card,
  Flex,
  Form,
  FormInstance,
  Input,
  message,
  theme,
  Typography
} from 'antd'
import { ArrowLeft, BanknoteArrowDownIcon, TagIcon } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
const { Text, Title } = Typography

export const OpenCashierPage: React.FC = () => {
  const form = useRef<FormInstance>(null)
  const [loading, setLoading] = useState(false)
  const { openCashier } = useCashier()
  const navigate = useNavigate()
  const [messageApi, contextHolder] = message.useMessage()
  return (
    <Flex
      style={{
        height: 'calc(100vh - 4rem)',
        padding: '1rem',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      vertical
    >
      {contextHolder}
      <Flex
        align="center"
        justify="start"
        gap="0.5rem"
        style={{
          width: '100%',
          maxWidth: '600px',
          height: 'fit-content'
        }}
      >
        <Link
          to="/caixa"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: theme.useToken().token.colorTextSecondary,
            fontSize: '1rem',
            opacity: 0.5
          }}
        >
          <ArrowLeft size={16} />
          Voltar para o caixa aberto
        </Link>
      </Flex>
      <Card
        style={{
          width: '100%',
          maxWidth: '600px',
          height: 'fit-content'
        }}
      >
        <Flex gap="0.5rem" style={{ marginBottom: '1rem' }}>
          <Avatar
            size={64}
            style={{ backgroundColor: theme.useToken().token['green-2'] }}
            icon={<BanknoteArrowDownIcon size={42} color={theme.useToken().token['green-5']} />}
            shape="square"
          />
          <Flex vertical>
            <Title level={4} style={{ margin: 0 }}>
              Abrir novo caixa
            </Title>
            <Text type="secondary">Por favor, abra um caixa para continuar.</Text>
          </Flex>
        </Flex>
        <Form
          layout="vertical"
          ref={form}
          onFinish={(values) => {
            setLoading(true)
            openCashier({
              ...values,
              initial_value: brlToNumber(values.initial_value)
            })
              .then(() => {
                messageApi.success('Caixa aberto com sucesso!')
                navigate('/caixa')
              })
              .catch((error) => {
                messageApi.error(error)
              })
              .finally(() => {
                setLoading(false)
              })
          }}
        >
          <Form.Item name="initial_value" label="Valor Inicial">
            <Input
              size="large"
              placeholder="Valor Inicial"
              prefix="R$"
              onChange={(e) => {
                const formattedValue = formatToBRL(e.target.value)
                form.current?.setFieldValue('initial_value', formattedValue)
              }}
            />
          </Form.Item>
          <Form.Item name="identification" label="Identificação do Caixa">
            <Input size="large" placeholder="ex: Caixa da Manhã" prefix={<TagIcon size={16} />} />
          </Form.Item>
          <Form.Item
            name="code"
            label="Código do Operador"
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
          <Form.Item>
            <Button block size="large" type="primary" htmlType="submit" loading={loading}>
              Abrir Caixa
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Flex>
  )
}
