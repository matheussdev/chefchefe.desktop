import React from 'react'
import { Card, Flex, Tag, Typography } from 'antd'
import { Clock, FileDigit, HandPlatter, IdCard, Utensils } from 'lucide-react'
import { Bill } from '@renderer/types'
import dayjs from 'dayjs'
const { Text } = Typography

interface BillResumProps {
  bill: Bill | null
  loading?: boolean
}

const fromNow = (date: string | undefined | null, closedAt?: string | null) => {
  if (!date) return ''
  const now = dayjs(closedAt || new Date())
  const then = dayjs(date)
  const diffInMinutes = now.diff(then, 'minute')
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutos`
  }
  if (diffInMinutes < 60 * 24) {
    const hours = Math.floor(diffInMinutes / 60)
      .toString()
      .padStart(2, '0')
    const minutes = (diffInMinutes % 60).toString().padStart(2, '0')
    return `${hours}h${minutes}m`
  }
  const days = Math.floor(diffInMinutes / (60 * 24))
    .toString()
    .padStart(2, '0')
  const hours = Math.floor((diffInMinutes % (60 * 24)) / 60)
    .toString()
    .padStart(2, '0')
  return `${days}d${hours}h`
}

export const BillResum: React.FC<BillResumProps> = ({ bill, loading }) => {
  return (
    <Card
      loading={loading}
      styles={{
        body: {
          padding: '1rem',
          display: 'flex',
          gap: '0.3rem',
          flexDirection: 'column'
        }
      }}
    >
      <Flex gap="0.5rem" align="center">
        <FileDigit size={20} />
        <Text strong>Comanda:</Text>
        <Text>{bill?.number}</Text>
        <Tag color={bill?.is_open ? 'green' : 'red'} variant="outlined">
          {bill?.is_open ? 'Aberta' : 'Fechada'}
        </Tag>
      </Flex>
      <Flex gap="0.5rem" align="center">
        <Clock size={17} />
        <Text strong>Permanência:</Text>
        <Text>{fromNow(bill?.opened_at, bill?.closed_at)}</Text>
      </Flex>
      {bill?.identification && (
        <Flex gap="0.5rem" align="center">
          <IdCard size={20} />
          <Text strong>Identificação:</Text>
          <Text>{bill?.identification}</Text>
        </Flex>
      )}
      {bill?.table && (
        <Flex gap="0.5rem" align="center">
          <Utensils size={20} />
          <Text strong>Mesa:</Text>
          <Text>{bill?.table}</Text>
        </Flex>
      )}
      {bill?.opened_by_name && (
        <Flex gap="0.5rem" align="center">
          <HandPlatter size={20} />
          <Text strong>Aberto por:</Text>
          <Text>{bill?.opened_by_name}</Text>
        </Flex>
      )}
    </Card>
  )
}
