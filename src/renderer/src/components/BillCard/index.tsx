import { Bill } from '@renderer/types'
import { Avatar, Button, Flex, theme, Typography } from 'antd'
import React from 'react'
const { Text } = Typography
interface BillCardProps {
  bill: Bill
  onClick?: () => void
}

export const BillCard: React.FC<BillCardProps> = ({ bill, onClick }) => {
  const token = theme.useToken().token
  return (
    <Button
      style={{
        width: 'calc(20% - 0.5rem)',
        maxWidth: '180px',
        minWidth: '150px',
        height: 'fit-content',
        padding: '0.4rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'start',
        gap: '0.4rem'
      }}
      onClick={onClick}
    >
      <Avatar
        style={{
          backgroundColor: bill.is_open ? token.colorPrimary : token.colorErrorBgFilledHover,
          color: token.colorTextLightSolid,
          fontWeight: 'bold',
          fontSize: '1.3rem',
          minWidth: '30px'
        }}
        shape="square"
        size={60}
      >
        {String(bill.number).padStart(2, '0')}
      </Avatar>
      <Flex vertical align="start">
        <Text strong>Comanda</Text>
        <Text
          type="secondary"
          style={{
            fontSize: '0.875rem'
          }}
        >
          {bill.is_open ? 'Aberta' : 'Fechada'}
        </Text>
      </Flex>
    </Button>
  )
}
