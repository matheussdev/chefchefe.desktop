import React from 'react'
import * as S from './styles'
import { Alert, Button, Drawer, Flex, Form, Input, Tooltip, Typography } from 'antd'
import {
  Armchair,
  BanknoteArrowDown,
  ChefHat,
  FileDigit,
  MonitorUp,
  RefreshCcw,
  Settings
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@renderer/hooks/useAuth'
import { useCashier } from '@renderer/hooks/useCashiers'
interface GlobalWrapperProps {
  children: React.ReactNode
}
import jsonPackage from '../../../../../package.json'
import { useHotkeys } from 'react-hotkeys-hook'
const { Text, Title } = Typography

const Menu = (): React.JSX.Element => {
  const [openConfig, setOpenConfig] = React.useState(false)
  const [defaultOperatorCode, setDefaultOperatorCode] = React.useState(
    localStorage.getItem('chefchefe@terminal-saved-code') || ''
  )
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
          icon={<Armchair />}
          onClick={() => navigate('/mesas')}
          shape="circle"
          size="large"
        />
      </Tooltip>
      {/* <Tooltip title="Balança">
        <Button icon={<Scale />} shape="circle" size="large" onClick={() => navigate('/balanca')} />
      </Tooltip> */}
      <Button
        icon={<RefreshCcw />}
        onClick={async () => await window.api.reloadApp()}
        shape="circle"
        size="large"
        type="dashed"
      />
      <Button icon={<Settings />} onClick={() => setOpenConfig(true)} shape="circle" size="large" />
      <Drawer
        title="Configurações"
        placement="right"
        onClose={() => setOpenConfig(false)}
        open={openConfig}
      >
        {defaultOperatorCode && (
          <Alert
            type="success"
            style={{ marginBottom: '1rem' }}
            title={`Código de operador padrão configurado`}
            action={
              <Button
                type="text"
                onClick={() => {
                  localStorage.removeItem('chefchefe@terminal-saved-code')
                  setDefaultOperatorCode('')
                }}
              >
                Remover
              </Button>
            }
          />
        )}
        <Form
          layout="vertical"
          onFinish={(values) => {
            localStorage.setItem('chefchefe@terminal-saved-code', values.defaultOperatorCode)
            setDefaultOperatorCode(values.defaultOperatorCode)
          }}
        >
          <Form.Item label="Código de operador padrão" name="defaultOperatorCode">
            <Input size="large" placeholder="Código de operador padrão" />
          </Form.Item>
          <Form.Item>
            <Button block type="primary" size="large" htmlType="submit">
              Salvar
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </Flex>
  )
}

export const GlobalWrapper: React.FC<GlobalWrapperProps> = ({
  children
}: GlobalWrapperProps): React.JSX.Element => {
  const { restaurant } = useAuth()
  const { selectedCashier } = useCashier()
  const version = jsonPackage.version
  const navigate = useNavigate()
  useHotkeys(['t', 'c'], (_, handler) => {
    switch (handler.hotkey) {
      case 't':
        navigate('/terminal')
        break
      case 'c':
        navigate('/comandas')
        break
    }
  })
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
                  Versão {version}
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
