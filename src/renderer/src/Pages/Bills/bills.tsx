import { BillCard } from '@renderer/components/BillCard'
import { SearchBox } from '@renderer/components/SearchBox'
import { useBill } from '@renderer/hooks/useBills'
import { Flex, Result, Spin, Tag, Typography } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BillFormPage } from './form'
import { useCashier } from '@renderer/hooks/useCashiers'
import { Inbox } from 'lucide-react'
const { Title } = Typography

export const BillsPage: React.FC = () => {
  const { bills, fetchBills } = useBill()
  const hasUpdatedBills = useRef(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('open')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const { selectedCashier } = useCashier()
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
              Comandas
            </Title>
            <Tag
              style={{
                borderRadius: '10px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
              color={statusFilter === 'open' ? 'green' : 'default'}
              variant={statusFilter === 'open' ? 'outlined' : 'filled'}
              onClick={() => {
                setStatusFilter('open')
                setLoading(true)
                fetchBills({
                  is_open: true
                }).finally(() => {
                  setLoading(false)
                })
              }}
            >
              Abertas{' '}
              {statusFilter === 'open' ? `(${bills.filter((bill) => bill.is_open).length})` : ''}
            </Tag>
            {selectedCashier?.id && (
              <Tag
                style={{
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
                color={statusFilter === 'closed' ? 'red' : 'default'}
                variant={statusFilter === 'closed' ? 'outlined' : 'filled'}
                onClick={() => {
                  setStatusFilter('closed')
                  setLoading(true)
                  fetchBills({
                    is_open: false,
                    cashier_id: selectedCashier?.id
                  })
                    .catch(() => {
                      setLoading(false)
                    })
                    .finally(() => {
                      setLoading(false)
                    })
                }}
              >
                Fechadas{' '}
                {statusFilter === 'closed'
                  ? `(${bills.filter((bill) => !bill.is_open).length})`
                  : ''}
              </Tag>
            )}
          </Flex>
          <BillFormPage
            onSuccess={(bill) => {
              navigate(`/comandas/${bill.id}`)
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
                  onClick={() => navigate(`/comandas/${bill.id}`)}
                />
              ))}
            {bills.filter(
              (bill) => bill.number.toString().includes(searchTerm) || searchTerm === ''
            ).length === 0 && (
              <Result
                style={{
                  marginTop: '2rem',
                  width: '100%'
                }}
                icon={<Inbox size={48} />}
                title="Nenhuma comanda encontrada"
              />
            )}
          </div>
        </Spin>
      </Flex>
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
                navigate(`/comandas/${bill.id}`)
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
