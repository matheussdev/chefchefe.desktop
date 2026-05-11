import { Button, Flex } from 'antd'
import {
  BanknoteArrowDown,
  FileDigit,
  MonitorUp,
  ShoppingBasket,
  Utensils
} from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  return (
    <Flex
      align="center"
      gap={'1rem'}
      vertical
      style={{ padding: '1rem', maxWidth: '400px', width: '100%', margin: '0 auto' }}
    >
      <Button icon={<BanknoteArrowDown />} size="large" block onClick={() => navigate('/caixa')}>
        Caixa
      </Button>
      <Button icon={<FileDigit />} onClick={() => navigate('/comandas')} size="large" block>
        Comandas
      </Button>
      <Button icon={<MonitorUp />} size="large" onClick={() => navigate('/terminal/')} block>
        Terminal de pedidos
      </Button>
      <Button icon={<Utensils />} onClick={() => navigate('/mesas')} size="large" block>
        Mesas
      </Button>
      <Button icon={<ShoppingBasket />} size="large" block onClick={() => navigate('/vendas')}>
        Vendas
      </Button>
    </Flex>
  )
}
