import { BalancaPage } from '@renderer/Pages/Balanca/balanca'
import { BillsPage } from '@renderer/Pages/Bills'
import { BillDetailPage } from '@renderer/Pages/Bills/bill'
import { CashierPage } from '@renderer/Pages/caixa'
import { OpenCashierPage } from '@renderer/Pages/caixa/open'
import { HomePage } from '@renderer/Pages/Home'
import { TablesPage } from '@renderer/Pages/Tables'
import { TerminalBillsPage, TerminalSelectedPage } from '@renderer/Pages/Terminal'
import { MonitorUp } from 'lucide-react'

export const routes = [
  {
    path: '/',
    element: HomePage,
    private: true,
    title: 'Dashboard',
    showSidebar: true,
    show: true,
    especialIcon: true
  },
  {
    path: '/mesas',
    element: TablesPage,
    private: true,
    title: 'Operação',
    showSidebar: true,
    show: true,
    especialIcon: true
  },
  {
    path: '/caixa',
    element: CashierPage,
    private: true,
    title: 'Operação',
    showSidebar: true,
    show: true,
    especialIcon: true
  },
  {
    path: '/abrir-caixa',
    element: OpenCashierPage,
    private: true,
    title: 'Abrir Caixa',
    showSidebar: true,
    show: true,
    especialIcon: true
  },
  {
    path: '/comandas',
    element: BillsPage,
    private: true,
    title: 'Operação',
    showSidebar: true,
    show: true,
    especialIcon: true
  },
  {
    path: '/comandas/:id',
    element: BillDetailPage,
    private: true,
    title: 'Operação',
    showSidebar: true,
    show: true,
    especialIcon: true
  },
  {
    path: '/terminal/',
    element: TerminalBillsPage,
    private: true,
    icon: MonitorUp,
    title: 'Terminal de pedidos',
    showSidebar: true,
    show: true,
    especialIcon: true
  },
  {
    path: '/terminal/:id',
    element: TerminalSelectedPage,
    private: true,
    icon: MonitorUp,
    title: 'Terminal de pedidos',
    showSidebar: true,
    show: true,
    especialIcon: true
  },
  {
    path: '/balanca',
    element: BalancaPage,
    private: true,
    icon: MonitorUp,
    title: 'Balanca',
    showSidebar: true,
    show: true,
    especialIcon: true
  }
]
