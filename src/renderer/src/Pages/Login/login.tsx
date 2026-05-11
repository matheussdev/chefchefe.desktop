/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useState } from 'react'
import { Button, Form, Input, message, Card, Flex, Typography } from 'antd'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { ChefHat } from 'lucide-react'
import styled from 'styled-components'
import { LoginParams } from '@renderer/types'
import { getRestaurantToken } from '@renderer/services/auth'
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
          navigate('/caixa')
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

  return (
    <div style={{ height: '100vh', display: 'flex' }}>
      {contextHolder}
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
          <Form
            layout="vertical"
            name="basic"
            onFinish={handleLogin}
            initialValues={{
              restaurant_token: getRestaurantToken()
            }}
          >
            <>
              <Form.Item
                name="restaurant_token"
                required
                label="Token do Restaurante"
                rules={[
                  {
                    required: true,
                    message: 'Por favor, insira o token do restaurante!'
                  }
                ]}
              >
                <Input size="large" placeholder="Token do Restaurante" />
              </Form.Item>
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
