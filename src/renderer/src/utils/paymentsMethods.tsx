import { Banknote, CreditCard, QrCode, Wallet } from 'lucide-react'

export const paymentsMap = (method: string) => {
  switch (method) {
    case 'CASH':
      return {
        icon: <Banknote size={16} style={{ marginBottom: -4 }} />,
        color: 'green',
        title: 'Dinheiro',
        backgroundColor: 'green-2'
      }
    case 'CREDIT_CARD':
      return {
        icon: <CreditCard size={16} style={{ marginBottom: -4 }} />,
        color: 'blue',
        title: 'Cartão de Crédito',
        backgroundColor: 'blue-1'
      }
    case 'DEBIT_CARD':
      return {
        icon: <CreditCard size={16} style={{ marginBottom: -4 }} />,
        color: 'orange',
        title: 'Cartão de Débito',
        backgroundColor: 'orange-1'
      }
    case 'PIX':
      return {
        icon: <QrCode size={16} style={{ marginBottom: -4 }} />,
        color: 'purple',
        title: 'Pix',
        backgroundColor: 'purple-1'
      }
    default:
      return {
        icon: <Wallet size={16} style={{ marginBottom: -4 }} />,
        color: 'purple',
        title: method,
        backgroundColor: 'purple-1'
      }
  }
}
