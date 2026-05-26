/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useState } from 'react'
import {
  Button,
  Form,
  Input,
  message,
  Card,
  Flex,
  Typography,
  FloatButton,
  Modal,
  Select
} from 'antd'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { ChefHat, Settings } from 'lucide-react'
import styled from 'styled-components'
import { LoginParams } from '@renderer/types'
import { getConfig, setConfig } from '@renderer/services/auth'
const { Text } = Typography

const LogoCotainer = styled(Flex)`
  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    background-color: ${(props: any) => props.theme.token.colorPrimary};
    background: ${(props: any) => props.theme.token.gradientPrimary};
    padding: 0.5rem;
    border-radius: 0.5rem;
    color: #fff;
  }
`

export const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const [loadingLogin, setLoadingLogin] = useState(false)
  const navigate = useNavigate()
  const [messageApi, contextHolder] = message.useMessage()
  const handleLogin = useCallback(
    (values: LoginParams) => {
      setLoadingLogin(true)
      login(values)
        .then(() => {
          navigate('/')
        })
        .catch((error) => {
          messageApi.error(error)
        })
        .finally(() => {
          setLoadingLogin(false)
        })
    },
    [login, navigate, messageApi]
  )
  const [configModalOpen, setConfigModalOpen] = useState(false)
  return (
    <div style={{ height: '100vh', display: 'flex' }}>
      {contextHolder}
      <FloatButton onClick={() => setConfigModalOpen(true)} icon={<Settings />}></FloatButton>
      <Modal
        title="Configurações"
        open={configModalOpen}
        onCancel={() => setConfigModalOpen(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={(values) => {
            if (values.baseURL) {
              setConfig('baseURL', values.baseURL)
            }
            if (values.http) {
              setConfig('http', values.http)
            }
            if (values.schema) {
              setConfig('schema', values.schema)
            }
            window.api.reloadApp()
          }}
        >
          <Form.Item label="HTTP" name="http" initialValue={getConfig('http') || 'http'}>
            <Select
              size="large"
              placeholder="HTTP"
              options={[
                { label: 'http', value: 'http' },
                { label: 'https', value: 'https' }
              ]}
            />
          </Form.Item>
          <Form.Item label="Subdomínio" name="schema" initialValue={getConfig('schema') || ''}>
            <Input size="large" placeholder="Subdomínio" />
          </Form.Item>
          <Form.Item
            label="URL da API"
            name="baseURL"
            initialValue={getConfig('baseURL') || 'localhost:8000'}
          >
            <Input size="large" placeholder="Url da API" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Salvar e recarregar
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Flex
        flex={1}
        align="center"
        justify="center"
        style={{
          padding: '1rem'
        }}
      >
        <Card
          style={{
            maxWidth: '402px',
            width: '100%'
          }}
          styles={{
            body: {
              padding: '1rem'
            }
          }}
        >
          <LogoCotainer
            style={{ marginRight: 'auto', marginBottom: '1rem' }}
            align="center"
            gap="0.5rem"
            justify="center"
          >
            <div className="logo">
              <ChefHat />
            </div>
            <Flex vertical>
              <Text strong style={{ margin: 0, lineHeight: '1rem' }}>
                ChefChefe
              </Text>
              <Text
                type="secondary"
                style={{ margin: 0, fontSize: '0.7rem', lineHeight: '0.7rem' }}
              >
                Versão 1.0.0
              </Text>
            </Flex>
          </LogoCotainer>
          <Form layout="vertical" name="basic" onFinish={handleLogin}>
            <>
              <Form.Item
                name="email"
                required
                label="email"
                rules={[
                  {
                    required: true,
                    message: 'Por favor, insira seu email!'
                  },
                  {
                    type: 'email',
                    message: 'Por favor, insira um email válido!'
                  }
                ]}
              >
                <Input size="large" placeholder="email@email.com" type="email" />
              </Form.Item>
              <Form.Item
                name="password"
                required
                label="Senha"
                rules={[
                  {
                    required: true,
                    message: 'Por favor, insira sua senha!'
                  }
                ]}
                style={{
                  marginBottom: '0px !important'
                }}
              >
                <Input.Password size="large" placeholder="Senha" />
              </Form.Item>
              <Form.Item>
                <Button block type="primary" htmlType="submit" size="large" loading={loadingLogin}>
                  Entrar
                </Button>
              </Form.Item>
            </>
          </Form>
        </Card>
      </Flex>
    </div>
  )
}
