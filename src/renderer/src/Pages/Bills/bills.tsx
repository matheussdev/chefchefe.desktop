import { BillCard } from '@renderer/components/BillCard'
import { SearchBox } from '@renderer/components/SearchBox'
import { useBill } from '@renderer/hooks/useBills'
import { Flex, Spin, Tag, Typography } from 'antd'
import dayjs from 'dayjs'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
const { Text } = Typography

export const BillsPage: React.FC = () => {
  const { bills, fetchBills } = useBill()
  const hasUpdatedBills = useRef(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('open')
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
        gap="1rem"
      >
        <Flex wrap="wrap" gap="0.2rem">
          <Text
            strong
            style={{
              marginRight: '0.5rem'
            }}
          >
            Comandas
          </Text>
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
                closed_at__gte: dayjs().subtract(8, 'hours').toISOString()
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
            {statusFilter === 'closed' ? `(${bills.filter((bill) => !bill.is_open).length})` : ''}
          </Tag>
          <Tag
            style={{
              borderRadius: '10px',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
            color={statusFilter === 'all' ? 'blue' : 'default'}
            variant={statusFilter === 'all' ? 'outlined' : 'filled'}
            onClick={() => {
              setStatusFilter('all')
              setLoading(true)
              fetchBills({
                closed_at__gte: dayjs().subtract(8, 'hours').toISOString()
              }).finally(() => {
                setLoading(false)
              })
            }}
          >
            Todas {statusFilter === 'all' ? `(${bills.length})` : ''}
          </Tag>
        </Flex>
        <Spin spinning={loading} description="Carregando comandas..." size="large">
          <div
            style={{
              width: '100%',
              height: 'fit-content',
              maxHeight: '100%',
              flexWrap: 'wrap',
              flexDirection: 'row',
              overflow: 'auto',
              gap: '0.5rem',
              display: 'flex',
              minHeight: '100px'
            }}
          >
            {bills
              .filter((bill) => bill.number.toString().includes(searchTerm))
              .map((bill, index) => (
                <BillCard
                  key={index}
                  bill={bill}
                  onClick={() => navigate(`/comandas/${bill.id}`)}
                />
              ))}
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
            onSearch={(value) => {
              setSearchTerm(value)
              const bill = bills.find((bill) => String(bill.number) === value && bill.is_open)
              if (bill) {
                navigate(`/comandas/${bill.id}`)
              }
            }}
          />
        </Flex>
      )}
    </Flex>
  )
}
