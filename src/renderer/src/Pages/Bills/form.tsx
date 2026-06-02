import { useBill } from '@renderer/hooks/useBills'
import { getConfig } from '@renderer/services/auth'
import { Bill } from '@renderer/types'
import { errorActions } from '@renderer/utils'
import { Alert, Button, Form, Input, InputNumber, Modal, Select } from 'antd'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

interface BillFormPageProps {
  initialValue?: Bill
  onSuccess?: (bill: Bill) => void
}
export const BillFormPage: React.FC<BillFormPageProps> = ({ initialValue, onSuccess }) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form] = Form.useForm()
  const { tables, fetchTables, openBill } = useBill()
  const savedCode = getConfig('terminal-saved-code') || ''
  useHotkeys(
    ['n'],
    (_, handler) => {
      switch (handler.hotkey) {
        case 'n':
          setOpen(true)
          break
      }
    },
    { enableOnContentEditable: true, enableOnFormTags: true }
  )
  return (
    <>
      <Button
        onClick={() => {
          setOpen(true)
        }}
        icon={<Plus size={16} />}
        type="dashed"
        size="large"
      >
        Abrir comanda (N)
      </Button>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        title="Abrir nova comanda"
        afterOpenChange={(open) => {
          if (open) {
            fetchTables()
            form?.getFieldInstance('number')?.focus()
          }
        }}
      >
        <Form
          initialValues={initialValue}
          onFinish={(values) => {
            openBill({
              number: values.number,
              table: values.table,
              identification: values.identification,
              code: savedCode ? savedCode : values.code
            })
              .then((bill) => {
                form?.resetFields()
                if (onSuccess) {
                  onSuccess(bill)
                }
              })
              .catch((error) => {
                errorActions(error)
                setError(error.response?.data?.detail || 'Erro ao criar comanda')
              })
              .finally(() => {
                setLoading(false)
              })
          }}
          layout="vertical"
          form={form}
        >
          <Form.Item
            name="number"
            label="Número da comanda"
            rules={[
              { required: true, message: 'Número da comanda é obrigatório' },
              {
                pattern: /^\d+$/,
                message: 'O número da comanda deve conter apenas dígitos'
              }
            ]}
            required
          >
            <InputNumber
              style={{
                width: '100%'
              }}
              className="custom-input-number"
              size="large"
              type="number"
              styles={{
                input: {
                  fontSize: '1.3rem'
                }
              }}
              placeholder="ex: 1"
              min={1}
              onPressEnter={(e) => {
                e.preventDefault()
                form?.getFieldInstance('identification')?.focus()
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  form?.getFieldInstance('identification')?.focus()
                }
              }}
            />
          </Form.Item>
          <Form.Item name="identification" label="Identificação">
            <Input
              style={{ width: '100%' }}
              size="large"
              className="custom-input"
              placeholder="ex: Comanda do João"
              onPressEnter={(e) => {
                e.preventDefault()
                form?.getFieldInstance('table')?.focus()
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  form?.getFieldInstance('table')?.focus()
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  form?.getFieldInstance('number')?.focus()
                }
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
                  label: 'Mesa ' + table.number,
                  value: table.id,
                  number: table.number
                }))
              ]}
              style={{ fontSize: '1.3rem', fontWeight: '500', width: '100%' }}
              allowClear
              showSearch={{
                optionFilterProp: 'number'
              }}
              onSelect={() => {
                if (savedCode) {
                  window.document.getElementById('button-open-bill')?.focus()
                } else {
                  form?.getFieldInstance('code')?.focus()
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  if (savedCode) {
                    form?.getFieldInstance('identification')?.focus()
                  }
                }
              }}
            />
          </Form.Item>
          {!savedCode && (
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
          )}
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
                  form?.getFieldInstance('code')?.focus()
                }
              }}
            >
              Abrir comanda
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
