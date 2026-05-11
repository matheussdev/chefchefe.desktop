import { ScheduleTwoTone } from '@ant-design/icons'
import { BillsPage } from '@renderer/Pages/Bills'
import { BillDetailPage } from '@renderer/Pages/Bills/bill'
import { CashierPage } from '@renderer/Pages/caixa'
import { OpenCashierPage } from '@renderer/Pages/caixa/open'
import { HomePage } from '@renderer/Pages/Home'
import { TablesPage } from '@renderer/Pages/Tables'
import { TerminalBillsPage, TerminalSelectedPage } from '@renderer/Pages/Terminal'
import { MonitorUp } from 'lucide-react'
// import { IoBoatOutline } from "react-icons/io5";

export const routes = [
  {
    path: '/',
    element: HomePage,
    private: true,
    icon: ScheduleTwoTone,
    title: 'Dashboard',
    showSidebar: true,
    show: true,
    especialIcon: true
  },
  {
    path: '/mesas',
    element: TablesPage,
    private: true,
    icon: ScheduleTwoTone,
    title: 'Operação',
    showSidebar: true,
    show: true,
    especialIcon: true
  },
  {
    path: '/caixa',
    element: CashierPage,
    private: true,
    icon: ScheduleTwoTone,
    title: 'Operação',
    showSidebar: true,
    show: true,
    especialIcon: true
  },
  {
    path: '/abrir-caixa',
    element: OpenCashierPage,
    private: true,
    icon: ScheduleTwoTone,
    title: 'Abrir Caixa',
    showSidebar: true,
    show: true,
    especialIcon: true
  },
  {
    path: '/comandas',
    element: BillsPage,
    private: true,
    icon: ScheduleTwoTone,
    title: 'Operação',
    showSidebar: true,
    show: true,
    especialIcon: true
  },
  {
    path: '/comandas/:id',
    element: BillDetailPage,
    private: true,
    icon: ScheduleTwoTone,
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
  }
]
