import { Wallet } from 'lucide-react'
import { Card, theme, Typography, Avatar, Flex, Table, Tag } from 'antd'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { PmStats } from '../../../types'
import { currenyFormat } from '../../../utils'
import api from '@renderer/services/api'
import { paymentsMap } from '@renderer/utils/paymentsMethods'
const { Text, Title } = Typography
interface PaymentMethodsListProps {
  cashierId?: string
}
export const PaymentMethodsList: React.FC<PaymentMethodsListProps> = ({ cashierId }) => {
  const token = theme.useToken().token
  const [payments, setPayments] = useState<PmStats[] | null>(null)
  const hasUpdated = useRef(false)
  const fetchPayments = useCallback((id: string) => {
    api
      .get('/v1/desktop/financial/payment-methods-stats/', {
        params: {
          cashier_id: id
        }
      })
      .then((response) => {
        setPayments(response.data.payment_method_stats)
      })
  }, [])
  useEffect(() => {
    if (!hasUpdated.current && cashierId) {
      fetchPayments(cashierId || '')
      hasUpdated.current = true
    }
  }, [fetchPayments, cashierId])
  return (
    <Card
      style={{
        width: '100%',
        overflow: 'hidden'
      }}
      styles={{
        body: {
          padding: 0,
          overflow: 'hidden'
        }
      }}
      title={
        <Flex align="center" gap="0.5rem">
          <Wallet size={20} />
          Forma de pagamento
        </Flex>
      }
    >
      <Table
        dataSource={payments ? payments : []}
        showHeader={false}
        pagination={false}
        size="small"
        rowKey={(record) => record.method_type}
        columns={[
          {
            title: '',
            dataIndex: 'method_type',
            key: 'method_type',
            width: 32,
            render: (method_type) => (
              <Avatar
                size={32}
                icon={paymentsMap(method_type).icon}
                style={{
                  backgroundColor: token[paymentsMap(method_type).backgroundColor as 'blue-1'],
                  color: token[paymentsMap(method_type).color as 'blue-1'],
                  paddingBottom: 4
                }}
              >
                {paymentsMap(method_type).icon}
              </Avatar>
            )
          },
          {
            title: '',
            dataIndex: 'total_amount',
            key: 'total_amount',
            render: (amount, item) => (
              <Flex vertical>
                <Title
                  style={{
                    color: token[paymentsMap(item.method_type).color as 'blue-1'],
                    margin: 0,
                    marginBottom: '0',
                    fontWeight: '800'
                  }}
                  level={5}
                >
                  {currenyFormat(amount)}
                </Title>
                <Text type="secondary">{paymentsMap(item.method_type).title}</Text>
              </Flex>
            )
          },
          {
            title: '',
            dataIndex: 'transaction_count',
            key: 'transaction_count',
            render: (_, item) => (
              <Flex vertical align="end" gap="0.2rem">
                <Tag color={item.total_amount * 100 > 20 ? 'green' : 'red'} variant="solid">
                  {Math.round(
                    (item.total_amount /
                      (payments ? payments.reduce((acc, pm) => acc + pm.total_amount, 0) : 1)) *
                      100
                  )}
                  % Faturamento
                </Tag>
                <Tag color={item.total_amount * 100 > 20 ? 'green' : 'red'} variant="solid">
                  {Math.round(
                    (item.transaction_count /
                      (payments
                        ? payments.reduce((acc, pm) => acc + pm.transaction_count, 0)
                        : 1)) *
                      100
                  )}
                  % Transações
                </Tag>
              </Flex>
            )
          }
        ]}
      ></Table>
    </Card>
  )
}
