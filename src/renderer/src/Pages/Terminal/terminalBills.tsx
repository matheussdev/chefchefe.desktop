import { BillCard } from '@renderer/components/BillCard'
import { SearchBox } from '@renderer/components/SearchBox'
import { useBill } from '@renderer/hooks/useBills'
import { Flex, Spin, Typography } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BillFormPage } from '@renderer/Pages/Bills/form'
const { Title } = Typography

export const TerminalBillsPage: React.FC = () => {
  const { bills, fetchBills } = useBill()
  const hasUpdatedBills = useRef(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!hasUpdatedBills.current) {
      setLoading(true)
      fetchBills({
        is_open: true
      }).finally(() => {
        setLoading(false)
      })
      hasUpdatedBills.current = true
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
        gap="0.5rem"
      >
        <Flex gap="0.2rem" align="center" justify="space-between">
          <Flex align="center" gap="0.5rem">
            <Title
              level={4}
              style={{
                marginBottom: 0,
                margin: 0
              }}
            >
              Terminal de pedidos
            </Title>
          </Flex>
          <BillFormPage
            onSuccess={(bill) => {
              navigate(`/terminal/${bill.id}`)
            }}
          />
        </Flex>
        <Spin spinning={loading} description="Carregando comandas..." size="large">
          <div
            style={{
              width: '100%',
              height: '100%',
              maxHeight: '100%',
              flexWrap: 'wrap',
              flexDirection: 'row',
              gap: '0.5rem',
              display: 'flex',
              minHeight: '100px'
            }}
          >
            {bills
              .filter((bill) => bill.number.toString().includes(searchTerm) || searchTerm === '')
              .map((bill, index) => (
                <BillCard
                  key={index}
                  index={index}
                  bill={bill}
                  onClick={() => navigate(`/terminal/${bill.id}`)}
                />
              ))}
          </div>
        </Spin>
      </Flex>
      {window.innerWidth > 645 && (
        <Flex
          vertical
          style={{
            width: '40%',
            maxWidth: '300px',
            minWidth: '300px'
          }}
        >
          <SearchBox
            placeholder="Nº da comanda"
            srtartFocus
            onReload={() => {
              setSearchTerm('')
              setLoading(true)
              fetchBills({
                is_open: true
              }).finally(() => {
                setLoading(false)
              })
            }}
            onSearch={(value) => {
              setSearchTerm(value)
              const bill = bills.find((bill) => String(bill.number) === value && bill.is_open)
              if (bill) {
                navigate(`/terminal/${bill.id}`)
              } else {
                const buttonElement = document.getElementById(`bill-card-0`)
                buttonElement?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'nearest'
                })
                buttonElement?.focus()
              }
            }}
          />
        </Flex>
      )}
    </Flex>
  )
}
