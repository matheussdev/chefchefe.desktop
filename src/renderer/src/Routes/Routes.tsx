import { HashRouter, Routes, Route, Link } from 'react-router-dom'
import { LoginRoute } from './LoginRoute'
import { LoginPage } from '../Pages/Login'
import { PrivateRoute } from './PrivateRoute'
import { Spin } from 'antd'
import { routes } from './'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@renderer/hooks/useAuth'
import { useCashier } from '@renderer/hooks/useCashiers'
import api from '@renderer/services/api'
import { printOrderReceipt } from '@renderer/utils/Printers'

interface MiddlewareProps {
  children: React.ReactNode
}

const Middleware = (props: MiddlewareProps): React.JSX.Element => {
  const { children } = props
  const [loading] = useState(false)
  const { getRestaurant } = useAuth()
  const { fetchCashiers } = useCashier()
  const hasUpadated = useRef(false)

  if (!hasUpadated.current) {
    getRestaurant()
    fetchCashiers()
    hasUpadated.current = true
  }

  const fetchToPrint = useCallback(async () => {
    const idPc = localStorage.getItem('chefchefe@id-pc')
    api
      .get('/v1/desktop/print-jobs/', {
        params: {
          id_pc: idPc || undefined
        }
      })
      .then(async (response) => {
        if (response.data.found) {
          const printJob = response.data.print_job?.payload
          if (printJob) {
            try {
              await printOrderReceipt(printJob)
              api.patch(`/v1/desktop/print-jobs/${response.data.print_job.id}/`, {
                status: 'SENT'
              })
            } catch (error) {
              console.error('Error printing order receipt:', error)
              api.patch(`/v1/desktop/print-jobs/${response.data.print_job.id}/`, {
                status: 'ERROR'
              })
            }
          }
        }
      })
  }, [])

  useEffect(() => {
    const severEnabled = localStorage.getItem('chefchefe@print-server-enabled') === 'true'
    const printTimeout = parseInt(localStorage.getItem('chefchefe@print-timeout') || '5', 10) * 1000
    if (severEnabled) {
      const interval = setInterval(() => {
        fetchToPrint()
      }, printTimeout)

      return () => clearInterval(interval)
    }
    return () => {}
  }, [fetchToPrint])

  return (
    <Spin spinning={loading} size="large">
      {children}
    </Spin>
  )
}

export const Navigation = (): React.JSX.Element => {
  return (
    <HashRouter>
      <Routes>
        {routes.map((route) => {
          if (route.private) {
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <Middleware>
                    <PrivateRoute wrapper={route.showSidebar} />
                  </Middleware>
                }
              >
                <Route path={route.path} element={<route.element />} />
              </Route>
            )
          }
          return <Route key={route.path} path={route.path} element={<route.element />} />
        })}
        <Route path="/login" element={<LoginRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route path="*" element={<Link to="/caixa">not found</Link>} />
      </Routes>
    </HashRouter>
  )
}
