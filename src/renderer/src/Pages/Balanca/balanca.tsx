import { SearchBox } from '@renderer/components/SearchBox'
import { useBill } from '@renderer/hooks/useBills'
import { Button, Flex, Modal, Typography } from 'antd'
import { Plus } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BillFormPage } from '../Bills/form'
import { BillCard } from '@renderer/components/BillCard'
const { Text } = Typography
export const BalancaPage: React.FC = () => {
  const { bills, fetchBills } = useBill()
  const hasUpdatedBills = useRef(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [openBillModal, setOpenBillModal] = useState(false)
  const navigate = useNavigate()

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
        <Flex wrap="wrap" gap="0.5rem" align="center" justify="space-between">
          <Text
            strong
            style={{
              marginRight: '0.5rem'
            }}
          >
            Balança - Comandas abertas 1
          </Text>
          <Button
            onClick={() => {
              setOpenBillModal(true)
            }}
            icon={<Plus size={16} />}
            type="dashed"
          >
            Abrir comanda (N)
          </Button>
        </Flex>
        <div
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
        </div>
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
            navigate(`/terminal/${bill.id}`)
          }}
        />
      </Modal>
      {window.innerWidth > 845 && (
        <Flex
          vertical
          style={{
            width: '40%',
            maxWidth: '300px',
            minWidth: '270px'
          }}
        >
          <SearchBox
            placeholder="Nº da comanda"
            srtartFocus
            onSearch={(value) => {
              setSearchTerm(value)
              const bill = bills.find((bill) => String(bill.number) === value && bill.is_open)
              if (bill) {
                navigate(`/terminal/${bill.id}`)
              }
            }}
          />
        </Flex>
      )}
    </Flex>
  )
}
