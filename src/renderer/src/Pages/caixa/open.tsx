import api from '@renderer/services/api'
import { errorActions } from '@renderer/utils'
import { brlToNumber, formatToBRL } from '@renderer/utils/currency'
import { Button, Card, Flex, Form, FormInstance, Input, message, Result, theme } from 'antd'
import { Inbox, TagIcon } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const OpenCashierPage: React.FC = () => {
  const form = useRef<FormInstance>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [messageApi, contextHolder] = message.useMessage()
  return (
    <Flex
      style={{
        height: 'calc(100vh - 4rem)',
        padding: '0rem 1rem 1rem',
        gap: '1rem'
      }}
    >
      {contextHolder}
      <Flex
        align="center"
        justify="center"
        style={{
          height: '100%',
          width: '100%',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <Card
          style={{
            width: '100%',
            maxWidth: '600px'
          }}
        >
          <Result
            status="error"
            title="Abrir novo caixa"
            icon={<Inbox size={80} color={theme.useToken().token.colorPrimary} />}
            subTitle="Por favor, abra um caixa para continuar."
          />
          <Form
            layout="vertical"
            ref={form}
            onFinish={(values) => {
              api
                .post('v1/desktop/cashiers/', {
                  ...values,
                  initial_value: brlToNumber(values.initial_value)
                })
                .then(() => {
                  messageApi.success('Caixa aberto com sucesso!')
                  navigate('/caixa')
                })
                .catch((error) => {
                  errorActions
                  messageApi.error(
                    error.response?.data?.detail || 'Erro ao abrir caixa, tente novamente.'
                  )
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
    </Flex>
  )
}
