import { useBill } from '@renderer/hooks/useBills'
import api from '@renderer/services/api'
import { Bill } from '@renderer/types'
import { errorActions } from '@renderer/utils'
import { Alert, Button, Form, FormInstance, Input, InputNumber, Select } from 'antd'
import { useEffect, useRef, useState } from 'react'

interface BillFormPageProps {
  initialValue?: Bill
  onSuccess?: (bill: Bill) => void
}
export const BillFormPage: React.FC<BillFormPageProps> = ({ initialValue, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const form = useRef<FormInstance>(null)
  const { tables, fetchTables } = useBill()
  const createBill = (values: any) => {
    setLoading(true)
    setError(null)
    api
      .post('v1/desktop/bills/', values)
      .then((res) => {
        form?.current?.resetFields()
        if (onSuccess) {
          onSuccess(res.data)
        }
      })
      .catch((error) => {
        errorActions(error)
        setLoading(false)
        setError(error.response?.data?.detail || 'Erro ao criar comanda')
      })
      .finally(() => {
        setLoading(false)
      })
  }
  useEffect(() => {
    fetchTables()
    setTimeout(() => {
      form.current?.getFieldInstance('number')?.focus()
    }, 300)
  }, [fetchTables])
  return (
    <Form initialValues={initialValue} onFinish={createBill} layout="vertical" ref={form}>
      <Form.Item
        name="number"
        label="Número da comanda"
        rules={[
          { required: true, message: 'Número da comanda é obrigatório' },
          {
            pattern: /^\d+$/,
            message: 'O número da comanda deve conter apenas dígitos'
          },
        ]}
        required
      >
        <InputNumber
          style={{ width: '100%' }}
          size="large"
          type="number"
          placeholder="ex: 1"
          min={1}
          onPressEnter={(e) => {
            e.preventDefault()
            form.current?.getFieldInstance('identification')?.focus()
          }}
        />
      </Form.Item>
      <Form.Item name="identification" label="Identificação">
        <Input
          size="large"
          placeholder="ex: Comanda do João"
          onPressEnter={(e) => {
            e.preventDefault()
            form.current?.getFieldInstance('table')?.focus()
          }}
        />
      </Form.Item>
      <Form.Item name="table" label="Mesa">
        <Select
          size="large"
          placeholder="Selecione uma mesa"
          options={[
            { label: 'Sem mesa', value: null },
            ...tables.map((table) => ({
              label:
                'Mesa ' +
                table.number +
                (table.count && table.count > 0 ? ` Ocupada: (${table.count})` : ''),
              value: table.id,
              number: table.number
            }))
          ]}
          allowClear
          showSearch={{
            optionFilterProp: 'number'
          }}
          onSelect={() => {
            form.current?.getFieldInstance('code')?.focus()
          }}
        />
      </Form.Item>
      <Form.Item
        name="code"
        label="Código do operador"
        rules={[{ required: true, message: 'Código do operador é obrigatório' }]}
        required
      >
        <Input.Password
          size="large"
          placeholder="Código do operador"
          onPressEnter={(e) => {
            e.preventDefault()
            window.document.getElementById('button-open-bill')?.focus()
          }}
        />
      </Form.Item>
      {error && (
        <Form.Item>
          <Alert type="error" title={error} showIcon />
        </Form.Item>
      )}
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          loading={loading}
          block
          id="button-open-bill"
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp') {
              e.preventDefault()
              form.current?.getFieldInstance('code')?.focus()
            }
          }}
        >
          Abrir comanda
        </Button>
      </Form.Item>
    </Form>
  )
}
