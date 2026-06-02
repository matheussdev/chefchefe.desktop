import { useAuth } from '@renderer/hooks/useAuth'
import { Card, Flex, Typography } from 'antd'
import { Armchair, BanknoteArrowDown, FileDigit, MonitorUp, ShoppingBasket } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
const { Text, Title } = Typography

const CardItem: React.FC<{
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
}> = ({ title, description, icon, onClick }) => {
  return (
    <Card
      styles={{ body: { padding: '1rem' } }}
      style={{ width: '100%' }}
      onClick={onClick}
      hoverable
    >
      <Flex align="center" gap="1rem">
        {icon}
        <Flex vertical>
          <Text>{title}</Text>
          <Text type="secondary">{description}</Text>
        </Flex>
      </Flex>
    </Card>
  )
}

const pages = [
  {
    title: 'Caixa',
    description: 'Gerencie o caixa do seu estabelecimento',
    icon: <BanknoteArrowDown size={54} color={'#46AA54'} />,
    path: '/caixa',
    permission: 'CAIXA'
  },
  {
    title: 'Comandas',
    description: 'Gerencie as comandas do seu estabelecimento',
    icon: <FileDigit size={54} color={'#46AA54'} />,
    path: '/comandas',
    permission: 'COMANDAS'
  },
  {
    title: 'Terminal de pedidos',
    description: 'Gerencie o terminal de pedidos do seu estabelecimento',
    icon: <MonitorUp size={54} color={'#46AA54'} />,
    path: '/terminal',
    permission: 'TERMINAL'
  },

  {
    title: 'Vendas Balcão',
    description: 'Gerencie as vendas do seu estabelecimento',
    icon: <ShoppingBasket size={54} color={'#46AA54'} />,
    path: '/balcao',
    permission: 'BALCAO'
  },
  {
    title: 'Mesas',
    description: 'Gerencie as mesas do seu estabelecimento',
    icon: <Armchair size={54} color={'#46AA54'} />,
    path: '/mesas',
    permission: 'MESAS'
  }
]

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  return (
    <Flex
      gap={'1rem'}
      vertical
      style={{ padding: '1rem', maxWidth: '900px', width: '100%', margin: '0 auto' }}
    >
      <Title style={{ fontWeight: 'bold' }} level={2}>
        Bem-vindo, {user?.name || 'usuário'}!
      </Title>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          width: '100%',
          gap: '1rem'
        }}
      >
        {pages
          .filter((page) => user?.sidebar_desktop.includes(page.permission))
          .map((page) => (
            <CardItem
              key={page.title}
              title={page.title}
              description={page.description}
              icon={page.icon}
              onClick={() => navigate(page.path)}
            />
          ))}
      </div>
    </Flex>
  )
}
