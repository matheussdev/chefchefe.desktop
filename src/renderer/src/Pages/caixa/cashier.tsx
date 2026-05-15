import { useCashier } from '@renderer/hooks/useCashiers'
import { Flex, message } from 'antd'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ResumeCashier } from './components/ResumeCashier'
import { PaymentMethodsList } from './components/PaymentMethodsList'
import { CashierConfigs } from './components/Configs'
import { Cashier } from '@renderer/types'
import { ListRecivedPayments } from './components/ListRecivedPayments'

export const CashierPage: React.FC = () => {
  const { cashiers, selectedCashier, loading, fetchCashier } = useCashier()
  const [loadingCashier, setLoadingCashier] = useState(true)
  const [cashier, setCashier] = useState<Cashier | null>(null)
  const [messageApi, contextHolder] = message.useMessage()
  const navigate = useNavigate()
  if (cashiers.length === 0 && !loading) {
    navigate('/abrir-caixa')
  }
  const hasUpdated = React.useRef(false)
  useEffect(() => {
    console.log('selectedCashier', selectedCashier)
    if (!hasUpdated.current && selectedCashier) {
      setLoadingCashier(true)
      fetchCashier(selectedCashier?.id)
        .then((data) => {
          setCashier(data)
          setLoadingCashier(false)
        })
        .catch((error) => {
          messageApi.error(error)
        })
      hasUpdated.current = true
    }
  }, [fetchCashier, selectedCashier, messageApi])
  return (
    <Flex
      gap={'1rem'}
      align="start"
      style={{
        padding: '1.5rem',
        width: '100%'
      }}
    >
      {contextHolder}
      <Flex
        style={{
          width: '100%'
        }}
        vertical
        gap={'1rem'}
      >
        <ResumeCashier cashier={cashier || null} loading={loadingCashier} />
        {cashier && <ListRecivedPayments cashierId={cashier.id} />}
      </Flex>
      <Flex vertical gap={'1rem'} style={{ width: '100%', maxWidth: '400px' }}>
        <CashierConfigs />
        {cashier && <PaymentMethodsList cashierId={cashier.id} />}
      </Flex>
    </Flex>
  )
}
