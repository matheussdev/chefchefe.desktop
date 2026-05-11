import React, { useCallback, useEffect } from 'react'
import { ArrowDownOutlined, ArrowUpOutlined, EditOutlined } from '@ant-design/icons'
import { Button, Table, Tag, message} from 'antd'
import api from '../../../services/api'
import { darkTheme } from '../../../theme'
import { formatCurrency } from '@renderer/utils/currency'
import { Sale } from '@renderer/types'
import dayjs from 'dayjs'
import { Banknote, CreditCard, QrCode, Wallet } from 'lucide-react'

const paymentsMap = (method: string) => {
  switch (method) {
    case 'CASH':
      return {
        icon: <Banknote size={16} style={{ marginBottom: -4 }} />,
        color: 'green',
        title: 'Dinheiro'
      }
    case 'CREDIT_CARD':
      return {
        icon: <CreditCard size={16} style={{ marginBottom: -4 }} />,
        color: 'blue',
        title: 'Cartão de Crédito'
      }
    case 'DEBIT_CARD':
      return {
        icon: <CreditCard size={16} style={{ marginBottom: -4 }} />,
        color: 'orange',
        title: 'Cartão de Débito'
      }
    case 'PIX':
      return {
        icon: <QrCode size={16} style={{ marginBottom: -4 }} />,
        color: 'purple',
        title: 'Pix'
      }
    default:
      return {
        icon: <Wallet size={16} style={{ marginBottom: -4 }} />,
        color: 'purple',
        title: method
      }
  }
}

interface ListRecivedPaymentsProps {
  cashierId: string
}
export const ListRecivedPayments: React.FC<ListRecivedPaymentsProps> = ({ cashierId }) => {
  const [data, setData] = React.useState<Sale[]>([])
  const [loading, setLoading] = React.useState(false)
  const [totalCount, setTotalCount] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const pageSize = 10
  const fetchSales = useCallback((id: string, page: number, pageSize: number) => {
    setLoading(true)
    api
      .get(`v1/desktop/transactions/?cashier=${id}&page=${page}&page_size=${pageSize}`)
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
  }, [cashierId, fetchSales])

  return (
    <Table
      size="small"
      columns={[
        {
          dataIndex: 'amount',
          key: 'value_type',
          render: (amount) =>
            Number(amount) > 0 ? (
              <ArrowDownOutlined style={{ color: darkTheme.token.colorPrimary }} />
            ) : (
              <ArrowUpOutlined style={{ color: 'red' }} />
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
              <Tag color={color}>
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
          title: '',
          width: '50px',
          key: 'action',
          render: () => <Button icon={<EditOutlined />}></Button>
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
