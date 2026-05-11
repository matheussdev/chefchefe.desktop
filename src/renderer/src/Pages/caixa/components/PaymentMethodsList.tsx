import { Banknote, CreditCard, QrCode, Wallet } from 'lucide-react'
import { Card, theme, List, Typography, Avatar, Flex } from 'antd'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { PmStats } from '../../../types'
import { currenyFormat } from '../../../utils'
import api from '@renderer/services/api'
const { Text, Title } = Typography
const paymentsMap = (mehtod: string) => {
  switch (mehtod) {
    case 'CASH':
      return {
        icon: <Banknote size={25} />,
        color: 'green-7',
        backgroundColor: 'green-3',
        title: 'Dinheiro'
      }
    case 'CREDIT_CARD':
      return {
        icon: <CreditCard size={25} />,
        color: 'yellow-7',
        backgroundColor: 'yellow-3',
        title: 'Cartão de Crédito'
      }
    case 'DEBIT_CARD':
      return {
        icon: <CreditCard size={25} />,
        color: 'orange-6',
        backgroundColor: 'orange-3',
        title: 'Cartão de Débito'
      }
    case 'PIX':
      return {
        icon: <QrCode size={25} />,
        color: 'blue-6',
        backgroundColor: 'blue-3',
        title: 'Pix'
      }
    default:
      return {
        icon: <Wallet size={25} />,
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
    api
      .get('/v1/desktop/payment-methods-stats/', {
        params: {
          cashier_id: id
        }
      })
      .then((response) => {
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
        <Flex align="center" gap="0.5rem">
          <Wallet size={20} />
          Forma de pagamento
        </Flex>
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
