import React, { useCallback, useEffect } from 'react'
import { Button, Table, Tag, message } from 'antd'
import api from '../../../services/api'
import { darkTheme } from '../../../theme'
import { formatCurrency } from '@renderer/utils/currency'
import { Sale } from '@renderer/types'
import dayjs from 'dayjs'
import { ArrowDown, ArrowUp, Edit2 } from 'lucide-react'
import { paymentsMap } from '@renderer/utils/paymentsMethods'

interface ListRecivedPaymentsProps {
  cashierId: string
  isOpen?: boolean
}
export const ListRecivedPayments: React.FC<ListRecivedPaymentsProps> = ({ cashierId, isOpen }) => {
  const [data, setData] = React.useState<Sale[]>([])
  const [loading, setLoading] = React.useState(false)
  const [totalCount, setTotalCount] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const pageSize = 10
  const fetchSales = useCallback((id: string, page: number, pageSize: number) => {
    setLoading(true)
    api
      .get(`v1/desktop/financial/transactions/?cashier=${id}&page=${page}&page_size=${pageSize}`)
      .then((response) => {
        setData(response.data.results)
        setTotalCount(response.data.count)
        setPage(page)
      })
      .catch(() => {
        message.error('Erro ao buscar movimentações')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const hasUpdated = React.useRef(false)

  useEffect(() => {
    if (!hasUpdated.current) {
      fetchSales(cashierId, page, pageSize)
      hasUpdated.current = true
    }
  }, [cashierId, fetchSales, page, pageSize])

  return (
    <Table
      size="small"
      rowKey={(record) => record.id}
      columns={[
        {
          dataIndex: 'amount',
          key: 'value_type',
          render: (amount) =>
            Number(amount) > 0 ? (
              <ArrowDown style={{ color: darkTheme.token.colorPrimary }} size={16} />
            ) : (
              <ArrowUp style={{ color: 'red' }} size={16} />
            )
        },
        {
          title: 'Descrição',
          dataIndex: 'description',
          key: 'description'
        },
        {
          title: 'Data',
          dataIndex: 'created',
          key: 'created',
          render: (text) => dayjs(text).format('DD/MM/YYYY HH:mm:ss')
        },
        {
          title: 'Forma de Pagamento',
          dataIndex: 'payment_method_name',
          key: 'payment_method_name',
          render: (payment, record) => {
            const { icon, color } = paymentsMap(record.payment_method_method)
            return (
              <Tag color={color} variant="outlined">
                {icon} {payment}
              </Tag>
            )
          }
        },
        {
          title: 'Tipo',
          dataIndex: 'type_display',
          key: 'type_display'
        },
        {
          title: 'Total',
          dataIndex: 'amount',
          key: 'amount',
          render: (amount) => `${formatCurrency(Number(amount))}`
        },
        {
          hidden: !isOpen,
          title: '',
          width: '50px',
          key: 'action',
          render: () => <Button icon={<Edit2 size={16} />}></Button>
        }
      ]}
      loading={loading}
      dataSource={data}
      pagination={{
        pageSize: pageSize,
        total: totalCount,
        current: page,
        showTotal: (total) => `Total ${total} movimentações`,
        onChange: (page) => fetchSales(cashierId, page, pageSize)
      }}
    />
  )
}
