import {
  CreditCardFilled,
  CreditCardOutlined,
  DollarCircleOutlined,
  QrcodeOutlined,
  TeamOutlined,
  WalletFilled,
  WalletTwoTone
} from '@ant-design/icons'
import { Card, Space, theme, List, Typography, Avatar, Flex } from 'antd'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { PmStats } from '../../../types'
import { currenyFormat } from '../../../utils'
import api from '@renderer/services/api'
const { Text, Title } = Typography
const paymentsMap = (mehtod: string) => {
  switch (mehtod) {
    case 'CASH':
      return {
        icon: <DollarCircleOutlined />,
        color: 'green-7',
        backgroundColor: 'green-3',
        title: 'Dinheiro'
      }
    case 'CREDIT_CARD':
      return {
        icon: <CreditCardOutlined />,
        color: 'yellow-7',
        backgroundColor: 'yellow-3',
        title: 'Cartão de Crédito'
      }
    case 'DEBIT_CARD':
      return {
        icon: <CreditCardFilled />,
        color: 'orange-6',
        backgroundColor: 'orange-3',
        title: 'Cartão de Débito'
      }
    case 'PIX':
      return {
        icon: <QrcodeOutlined />,
        color: 'blue-6',
        backgroundColor: 'blue-3',
        title: 'Pix'
      }
    case 'Conveniado':
      return {
        icon: <TeamOutlined />,
        color: 'cyan-7',
        backgroundColor: 'cyan-3',
        title: 'Conveniado'
      }
    default:
      return {
        icon: <WalletFilled />,
        color: 'purple-5',
        backgroundColor: 'purple-3',
        title: mehtod
      }
  }
}

interface PaymentMethodsListProps {
  cashierId?: string
}
export const PaymentMethodsList: React.FC<PaymentMethodsListProps> = ({ cashierId }) => {
  const token = theme.useToken().token
  const [payments, setPayments] = useState<PmStats[] | null>(null)
  const hasUpdated = useRef(false)
  const fetchPayments = useCallback((id: string) => {
    api.get('/v1/desktop/payment-methods-stats/',{
      params: {
        cashier_id: id
      }
    }).then((response) => {
      setPayments(
        response.data.payment_method_stats.map((item: any) => ({
          ...item,
          average_amount: Math.round(
            (item.total_amount /
              response.data.payment_method_stats.reduce(
                (acc: number, pm: any) => acc + pm.total_amount,
                0
              )) *
              100
          ),
          avarage_count: Math.round(
            (item.transaction_count / response.data.total_transactions) * 100
          )
        }))
      )
    })
  }, [])
  useEffect(() => {
    if (!hasUpdated.current && cashierId) {
      fetchPayments(cashierId || '')
      hasUpdated.current = true
    }
  }, [fetchPayments])
  return (
    <Card
      style={{
        width: '100%'
      }}
      title={
        <Space style={{ margin: 0, padding: 0 }}>
          <WalletTwoTone
            twoToneColor={token.colorPrimary}
            style={{
              fontSize: '1.7rem'
            }}
          />
          Forma de pagamento
        </Space>
      }
    >
      <List
        dataSource={payments ? payments : []}
        style={{
          padding: 0
        }}
        renderItem={(item) => (
          <List.Item
            extra={
              <Flex vertical align="end" gap="0.2rem">
                <Text
                  style={{
                    color: item.total_amount * 100 > 20 ? token.lime5 : token['red-4'],
                    fontWeight: '800'
                  }}
                >
                  {item.average_amount}% Faturamento
                </Text>
                <Text
                  style={{
                    color: item.total_amount * 100 > 20 ? token.lime5 : token['red-4'],
                    fontWeight: '800'
                  }}
                >
                  {item.avarage_count}% Transações
                </Text>
              </Flex>
            }
          >
            <List.Item.Meta
              title={
                <Title
                  style={{
                    color: token.colorPrimary,
                    margin: 0,
                    fontWeight: '800'
                  }}
                  level={5}
                >
                  {currenyFormat(item.total_amount)}
                </Title>
              }
              avatar={
                <Avatar
                  size="large"
                  icon={paymentsMap(item.method_type).icon}
                  style={{
                    backgroundColor:
                      token[paymentsMap(item.method_type).backgroundColor as 'blue-1'],
                    color: token[paymentsMap(item.method_type).color as 'blue-1']
                  }}
                >
                  {paymentsMap(item.method_type).icon}
                </Avatar>
              }
              description={paymentsMap(item.method_type).title}
            />
          </List.Item>
        )}
      />
    </Card>
  )
}
