import { Flex, Select, Button } from 'antd'
import React from 'react'
import { useCashier } from '@renderer/hooks/useCashiers'
import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

export const CashierConfigs: React.FC = () => {
  const { cashiers, selectedCashier } = useCashier()
  return (
    <Flex>
      <Select
        style={{ flex: 1 }}
        size="large"
        placeholder="Selecione o caixa"
        options={cashiers.map((cashier) => ({
          label: cashier.identification,
          value: cashier.id
        }))}
        onChange={(value) => {
          localStorage.setItem('@chefchefe:cashier_id', value || '')
          window.location.reload()
        }}
        value={selectedCashier?.id}
      ></Select>
      <Link to="/abrir-caixa">
        <Button size="large" style={{ marginLeft: '1rem' }} icon={<Plus size={16} />}>
          Novo Caixa
        </Button>
      </Link>
    </Flex>
  )
}
