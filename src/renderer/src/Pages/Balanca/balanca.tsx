import { useBill } from '@renderer/hooks/useBills'
import { Button, Card, Flex, Form, FormInstance, Input, Modal, Select } from 'antd'
import { Weight } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { BillFormPage } from '../Bills/form'
import { OrdersResum } from './components/ordersResum'
import { Bill } from '@renderer/types'
export const BalancaPage: React.FC = () => {
  const { bills, fetchBills, fetchBillById } = useBill()
  const hasUpdatedBills = useRef(false)
  const [openBillModal, setOpenBillModal] = useState(false)
  const form = React.useRef<FormInstance>(null)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'n') {
        setOpenBillModal(true)
      }
    }

    if (!hasUpdatedBills.current) {
      fetchBills({
        is_open: true
      })
      hasUpdatedBills.current = true
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [fetchBills])
  const [bill, setBill] = useState<Bill | null>(null)
  return (
    <Flex
      style={{
        height: 'calc(100vh - 4rem)',
        padding: '1rem',
        gap: '1rem'
      }}
    >
      <Flex
        vertical
        style={{
          width: '100%'
        }}
        gap="1rem"
      >
        <Flex style={{ width: '100%' }} gap="2rem" justify="center">
          <Card style={{ width: '100%', maxWidth: '600px', height: 'fit-content' }} title="Balança">
            <Form layout="vertical" ref={form}>
              <Form.Item label="Produto">
                <Select size="large" />
              </Form.Item>
              <Form.Item label="Comanda" name="bill_id">
                <Select
                  size="large"
                  options={bills.map((bill) => ({
                    label: `Comanda ${bill.number} - ${bill.table_number ? `Mesa ${bill.table_number}` : ''}`,
                    value: bill.id,
                    number: bill.number
                  }))}
                  showSearch={{
                    optionFilterProp: 'number'
                  }}
                  onChange={(value) => {

                    form.current?.getFieldInstance('quantity')?.focus()
                    fetchBillById(value).then((data) => {
                      setBill(data)
                    })
                  }}
                />
              </Form.Item>
              <Form.Item label="Peso" name="quantity">
                <Input size="large" prefix="Kg" type="number" step="0.001" />
              </Form.Item>
              <Form.Item>
                <Button icon={<Weight />} size="large" type="primary" block>
                  Enviar
                </Button>
              </Form.Item>
            </Form>
          </Card>
          <Flex
            vertical
            style={{ minWidth: '400px', maxWidth: '600px' }}
            gap="1rem"
            align="start"
            justify="start"
            flex={1}
          >
            {bill ? <OrdersResum loadingBill={false} bill={bill} /> : <span></span>}
          </Flex>
        </Flex>
        {/* <div
          style={{
            width: '100%',
            height: 'fit-content',
            maxHeight: '100%',
            flexWrap: 'wrap',
            flexDirection: 'row',
            overflow: 'auto',
            gap: '0.5rem',
            display: 'flex'
          }}
        >
          {bills
            .filter(
              (bill) =>
                bill.number.toString().includes(searchTerm) ||
                bill.id.toString().includes(searchTerm)
            )
            .map((bill, index) => (
              <BillCard key={index} bill={bill} onClick={() => navigate(`/terminal/${bill.id}`)} />
            ))}
        </div> */}
      </Flex>
      <Modal
        open={openBillModal}
        onCancel={() => setOpenBillModal(false)}
        footer={null}
        title="Abrir nova comanda"
      >
        <BillFormPage
          onSuccess={(bill) => {
            setOpenBillModal(false)
            fetchBills({
              is_open: true
            })
            form.current?.setFieldsValue({
              bill_id: bill.id
            })
            setTimeout(() => {
              form.current?.getFieldInstance('quantity')?.focus()
            }, 300)
          }}
        />
      </Modal>
    </Flex>
  )
}
