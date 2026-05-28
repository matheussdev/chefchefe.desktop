import { clearCache, getConfig, setConfig } from '@renderer/services/auth'
import {
  Alert,
  Button,
  Divider,
  Drawer,
  Flex,
  Form,
  Input,
  message,
  Select,
  Space,
  Switch,
  Typography
} from 'antd'
import { RefreshCw, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
const { Text } = Typography
interface ConfigModalProps {
  isOpen?: boolean
  onClose?: () => void
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose }) => {
  const [defaultOperatorCode, setDefaultOperatorCode] = useState(
    getConfig('terminal-saved-code') || ''
  )
  const [ports, setPorts] = useState<
    {
      path: string
      manufacturer?: string
    }[]
  >([])
  const [scaleConnected, setScaleConnected] = useState(false)
  useEffect(() => {
    const init = async () => {
      window.api.listScalePorts().then(setPorts)
      setScaleConnected(await window.api.checkConnectScale())
    }
    init()
  }, [])
  const [messageApi, contextHolder] = message.useMessage()
  return (
    <Drawer
      title="Configurações"
      placement="left"
      onClose={onClose}
      open={isOpen}
      size={600}
      styles={{
        body: {
          padding: '1rem'
        },
        title: {
          marginBottom: 0
        }
      }}
    >
      <Divider
        titlePlacement="left"
        style={{
          marginTop: 0
        }}
      >
        Dados
      </Divider>
      <Flex gap="1rem" wrap="wrap" style={{ marginBottom: '1rem' }} align="center">
        <Button
          type="dashed"
          icon={<RefreshCw size={16} />}
          onClick={() => {
            clearCache('products')
            window.api.reloadApp()
          }}
        >
          Atualizar Produtos
        </Button>
        <Button
          type="dashed"
          icon={<RefreshCw size={16} />}
          onClick={() => {
            clearCache('tables')
            window.api.reloadApp()
          }}
        >
          Atualizar Mesas
        </Button>
      </Flex>
      {contextHolder}
      <Form
        layout="vertical"
        onFinish={async (values) => {
          if (values.defaultOperatorCode) {
            setConfig('terminal-saved-code', values.defaultOperatorCode)
            setDefaultOperatorCode(values.defaultOperatorCode)
          }
          if (values.printServer) {
            setConfig('print-server-enabled', 'true')
          } else {
            setConfig('print-server-enabled', 'false')
          }
          if (values.printTimeout) {
            setConfig('print-timeout', values.printTimeout)
          } else {
            setConfig('print-timeout', '5')
          }
          if (values.idPc) {
            setConfig('id-pc', values.idPc)
          } else {
            setConfig('id-pc', '')
          }
          if (values.http) {
            setConfig('http', values.http)
          } else {
            setConfig('http', 'http')
          }
          if (values.schema) {
            setConfig('schema', values.schema)
          } else {
            setConfig('schema', '')
          }
          if (values.baseURL) {
            setConfig('baseURL', values.baseURL)
          } else {
            setConfig('baseURL', 'chefchefe.app')
          }
          if (values.scalePort) {
            setConfig('terminal-scale-port', values.scalePort)
          } else {
            setConfig('terminal-scale-port', '')
          }
          if (values.scaleBoundRate) {
            setConfig('terminal-scale-bound-rate', values.scaleBoundRate)
          } else {
            setConfig('terminal-scale-bound-rate', '9600')
          }
          messageApi.success('Configurações salvas com sucesso!')
          window.api.reloadApp()
        }}
      >
        <Text>Acesso</Text>
        <Space.Compact size="large" style={{ display: 'flex', marginBottom: '1rem' }}>
          <Form.Item label="HTTP" name="http" initialValue={getConfig('http') || 'http'} noStyle>
            <Select
              size="large"
              placeholder="HTTP"
              options={[
                { label: 'http', value: 'http' },
                { label: 'https', value: 'https' }
              ]}
            />
          </Form.Item>
          <Form.Item
            label="Subdomínio"
            name="schema"
            initialValue={getConfig('schema') || ''}
            noStyle
          >
            <Input size="large" placeholder="Subdomínio" />
          </Form.Item>
          <Form.Item
            noStyle
            label="URL da API"
            name="baseURL"
            initialValue={getConfig('baseURL') || 'chefchefe.app'}
          >
            <Input size="large" placeholder="Url da API" />
          </Form.Item>
        </Space.Compact>
        <Form.Item label="Id do computador" name="idPc" initialValue={getConfig('id-pc') || ''}>
          <Input size="large" placeholder="Ex: Caixa" />
        </Form.Item>
        <Divider titlePlacement="left">Operador</Divider>
        {defaultOperatorCode ? (
          <Alert
            type="success"
            style={{ marginBottom: '1rem' }}
            title={`Código de operador padrão configurado`}
            action={
              <Button
                type="text"
                onClick={() => {
                  setConfig('terminal-saved-code', '')
                  setDefaultOperatorCode('')
                }}
              >
                Remover
              </Button>
            }
          />
        ) : (
          <Form.Item label="Código de operador padrão" name="defaultOperatorCode">
            <Input size="large" placeholder="Código de operador padrão" />
          </Form.Item>
        )}
        <Divider titlePlacement="left">Impressão remota</Divider>
        <Flex gap="1rem">
          <Form.Item
            label="Servidor de impressão"
            tooltip="Caso Habilitado, os pedidos enviados pelo aplicativo de celular serão enviados para impressão a partir deste computador. caso ativo, certifique-se de que este computador esteja sempre ligado e conectado à impressora, deixe este recurso habilitado apenas em um computador para evitar conflitos de impressão."
            name="printServer"
            valuePropName="checked"
            initialValue={getConfig('print-server-enabled') === 'true'}
          >
            <Switch />
          </Form.Item>
          <Form.Item
            label="Tempo de impressão (segundos)"
            name="printTimeout"
            initialValue={getConfig('print-timeout') || '5'}
          >
            <Input size="large" placeholder="Tempo de impressão" type="number" />
          </Form.Item>
        </Flex>
        <Divider titlePlacement="left">Balança</Divider>
        <Form.Item
          label="Porta da balança"
          name="scalePort"
          initialValue={getConfig('terminal-scale-port')}
        >
          <Select
            size="large"
            onChange={() => {
              setScaleConnected(false)
            }}
            options={ports.map((port) => ({
              label: `${port.path} - ${port.manufacturer || 'Desconhecido'}`,
              value: port.path
            }))}
          />
        </Form.Item>
        <Form.Item
          label="Velocidade da balança"
          name="scaleBoundRate"
          initialValue={getConfig('terminal-scale-bound-rate') || '9600'}
        >
          <Input size="large" placeholder="ex: 9600" type="number" />
        </Form.Item>
        {scaleConnected && (
          <Alert
            showIcon
            type="success"
            description={`Balança conectada`}
            style={{ marginBottom: '1rem' }}
            action={
              <Button
                type="text"
                onClick={() => {
                  setConfig('terminal-scale-port', '')
                  setConfig('terminal-scale-bound-rate', '')
                  setScaleConnected(false)
                  window.api.reloadApp()
                }}
              >
                Remover
              </Button>
            }
          />
        )}
        <Form.Item>
          <Button block type="primary" size="large" htmlType="submit" icon={<Save size={16} />}>
            Salvar
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  )
}
