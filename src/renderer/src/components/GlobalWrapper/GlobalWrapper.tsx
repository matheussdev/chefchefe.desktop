import React from 'react'
import * as S from './styles'
import { Button, Flex, Tooltip, Typography } from 'antd'
import {
  BanknoteArrowDown,
  ChefHat,
  FileDigit,
  MonitorUp,
  Moon,
  RefreshCcw,
  ShoppingBasket,
  Sun,
  Utensils
} from 'lucide-react'
import { useTheme } from '@renderer/hooks/useTheme'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@renderer/hooks/useAuth'
import { useCashier } from '@renderer/hooks/useCashiers'
interface GlobalWrapperProps {
  children: React.ReactNode
}
const { Text, Title } = Typography

const Menu = (): React.JSX.Element => {
  const { themeMode, toggleTheme } = useTheme()
  const navigate = useNavigate()
  return (
    <Flex align="center" gap={'0.5rem'}>
      <Tooltip title="Caixa">
        <Button
          icon={<BanknoteArrowDown />}
          shape="circle"
          size="large"
          onClick={() => navigate('/caixa')}
        />
      </Tooltip>
      <Tooltip title="Comandas">
        <Button
          icon={<FileDigit />}
          onClick={() => navigate('/comandas')}
          shape="circle"
          size="large"
        />
      </Tooltip>
      <Tooltip title="Terminal de pedidos">
        <Button
          icon={<MonitorUp />}
          shape="circle"
          size="large"
          onClick={() => navigate('/terminal/')}
        />
      </Tooltip>
      <Tooltip title="Mesas">
        <Button
          icon={<Utensils />}
          onClick={() => navigate('/mesas')}
          shape="circle"
          size="large"
        />
      </Tooltip>
      <Tooltip title="Vendas">
        <Button icon={<ShoppingBasket />} shape="circle" size="large" />
      </Tooltip>
      <Button
        icon={<RefreshCcw />}
        onClick={() => window.location.reload()}
        shape="circle"
        size="large"
        type="dashed"
      />
      <Button
        icon={themeMode === 'light' ? <Moon /> : <Sun />}
        onClick={toggleTheme}
        shape="circle"
        size="large"
      />
    </Flex>
  )
}

export const GlobalWrapper: React.FC<GlobalWrapperProps> = ({
  children
}: GlobalWrapperProps): React.JSX.Element => {
  const { restaurant } = useAuth()
  const { selectedCashier } = useCashier()
  return (
    <S.Containter>
      <S.Navbar>
        <div id="navbar-height" />
        <div id="navbar-fixed">
          <Flex style={{ width: '100%' }} align="center" gap="0.5rem" justify="space-between">
            <Flex align="center" gap="0.5rem">
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
            </Flex>
            <Flex align="center" gap="0.2rem" vertical>
              <Title
                level={5}
                style={{
                  margin: 0,
                  marginBottom: '-0.5rem'
                }}
              >
                {restaurant?.name || 'ChefChefe'}
              </Title>
              <Text>
                {selectedCashier
                  ? `Caixa: ${selectedCashier.identification}`
                  : 'Nenhum caixa aberto'}
              </Text>
            </Flex>
            <Menu />
          </Flex>
        </div>
      </S.Navbar>
      <S.Content>{children}</S.Content>
    </S.Containter>
  )
}
