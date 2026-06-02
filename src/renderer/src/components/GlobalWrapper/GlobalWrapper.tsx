import React, { useState } from 'react'
import * as S from './styles'
import { Avatar, Button, Dropdown, Flex, Tag, theme, Tooltip, Typography } from 'antd'
import {
  Armchair,
  BanknoteArrowDown,
  ChefHat,
  FileDigit,
  Home,
  LogOut,
  MonitorUp,
  PrinterCheck,
  RefreshCcw,
  Settings,
  ShoppingBasket,
  Store,
  User
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@renderer/hooks/useAuth'
import { useCashier } from '@renderer/hooks/useCashiers'
interface GlobalWrapperProps {
  children: React.ReactNode
}
import jsonPackage from '../../../../../package.json'
import { getConfig, logout } from '@renderer/services/auth'
import { ConfigModal } from '../ConfigModal'
const { Text, Title } = Typography
const menu = [
  {
    key: 'caixa',
    label: 'Caixa',
    icon: <BanknoteArrowDown />,
    path: '/caixa',
    permission: 'CAIXA'
  },
  {
    key: 'comandas',
    label: 'Comandas',
    icon: <FileDigit />,
    path: '/comandas',
    permission: 'COMANDAS'
  },
  {
    key: 'terminal',
    label: 'Terminal de pedidos',
    icon: <MonitorUp />,
    path: '/terminal',
    permission: 'TERMINAL'
  },
  {
    key: 'balcao',
    label: 'Balcão',
    icon: <ShoppingBasket />,
    path: '/balcao',
    permission: 'BALCAO'
  },
  {
    key: 'mesas',
    label: 'Mesas',
    icon: <Armchair />,
    path: '/mesas',
    permission: 'MESAS'
  }
]

const Menu = (): React.JSX.Element => {
  const navigate = useNavigate()
  const path = window.location.hash
  const { user } = useAuth()
  return (
    <Flex align="center" gap={'0.5rem'}>
      {menu
        .filter((item) => user?.sidebar_desktop.includes(item.permission))
        .map((item) => (
          <Tooltip key={item.key} title={item.label} destroyOnHidden>
            <Button
              icon={item.icon}
              shape="circle"
              size="large"
              onClick={() => navigate(item.path)}
              type={path.includes(item.path) ? 'primary' : 'default'}
            />
          </Tooltip>
        ))}
      <Tooltip title="Atualizar página" destroyOnHidden>
        <Button
          icon={<RefreshCcw />}
          onClick={async () => await window.api.reloadApp()}
          shape="circle"
          size="large"
          type="dashed"
        />
      </Tooltip>
    </Flex>
  )
}

export const GlobalWrapper: React.FC<GlobalWrapperProps> = ({
  children
}: GlobalWrapperProps): React.JSX.Element => {
  const { restaurant, user } = useAuth()
  const { selectedCashier } = useCashier()
  const version = jsonPackage.version
  const [openConfig, setOpenConfig] = useState(false)
  const navigate = useNavigate()
  const token = theme.useToken().token
  return (
    <S.Containter>
      <ConfigModal isOpen={openConfig} onClose={() => setOpenConfig(false)} />
      <S.Navbar>
        <div id="navbar-height" />
        <div id="navbar-fixed">
          <Flex style={{ width: '100%' }} align="center" gap="0.5rem" justify="space-between">
            <Flex align="center" gap="0.5rem">
              <Dropdown
                trigger={['click']}
                styles={{
                  item: {
                    fontSize: '1.3rem'
                  }
                }}
                menu={{
                  items: [
                    {
                      icon: <Home size={24} />,
                      key: 'home',
                      label: 'Início',
                      onClick: () => navigate('/')
                    },
                    {
                      icon: <Settings size={24} />,
                      key: 'Configurações',
                      label: 'Configurações',
                      onClick: () => setOpenConfig(true)
                    },

                    {
                      icon: <LogOut size={24} />,
                      key: 'logout',
                      label: 'Sair',
                      onClick: () => logout()
                    }
                  ]
                }}
              >
                <button className="logo">
                  <ChefHat />
                </button>
              </Dropdown>
              <Flex vertical>
                <Text strong style={{ margin: 0, lineHeight: '1rem' }}>
                  ChefChefe
                </Text>
                <Text
                  type="secondary"
                  style={{ margin: 0, fontSize: '0.7rem', lineHeight: '0.7rem' }}
                >
                  Versão {version}
                </Text>
              </Flex>
              {getConfig('print-server-enabled') === 'true' && (
                <Tooltip title="Servidor de impressão ativo" destroyOnHidden>
                  <Tag
                    style={{ paddingTop: '4px' }}
                    icon={<PrinterCheck size={16} color="green" />}
                    color="green"
                    variant="outlined"
                  ></Tag>
                </Tooltip>
              )}
              <Flex align="center" gap="0.5rem" style={{ marginLeft: '0.4rem' }}>
                <Avatar
                  size={34}
                  shape="square"
                  style={{ backgroundColor: token.colorPrimary }}
                  icon={<Store size={22} color="#fff" />}
                >
                  {restaurant?.name[0] || 'U'}
                </Avatar>
                <Flex vertical>
                  <Title
                    level={5}
                    style={{
                      margin: 0,
                      marginBottom: '0px',
                      fontSize: '0.9rem'
                    }}
                  >
                    {restaurant?.name || 'ChefChefe'}
                  </Title>
                  <Text
                    type="secondary"
                    style={{ margin: 0, fontSize: '0.8rem', lineHeight: '0.8rem' }}
                  >
                    {selectedCashier
                      ? `Caixa: ${selectedCashier.identification}`
                      : 'Nenhum caixa aberto'}
                  </Text>
                </Flex>
              </Flex>
              <Flex align="center" gap="0.5rem" style={{ marginLeft: '0.4rem' }}>
                <Avatar
                  size={34}
                  shape="square"
                  style={{ backgroundColor: token.colorPrimary }}
                  icon={<User size={22} color="#fff" />}
                >
                  {user?.name[0] || 'U'}
                </Avatar>
                <Flex vertical>
                  <Title
                    level={5}
                    style={{
                      margin: 0,
                      marginBottom: '0px',
                      fontSize: '0.9rem'
                    }}
                  >
                    {user?.name || 'ChefChefe'}
                  </Title>
                  <Text
                    type="secondary"
                    style={{ margin: 0, fontSize: '0.8rem', lineHeight: '0.8rem' }}
                  >
                    {'Usuário'}
                  </Text>
                </Flex>
              </Flex>
            </Flex>
            <Menu />
          </Flex>
        </div>
      </S.Navbar>
      <S.Content>{children}</S.Content>
    </S.Containter>
  )
}
