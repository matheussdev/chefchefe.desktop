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
import { getConfig } from '@renderer/services/auth'
import { GlobalWrapper } from '@renderer/components/GlobalWrapper'
import dayjs from 'dayjs'

interface MiddlewareProps {
  children: React.ReactNode
  wrapper?: boolean
}

const Middleware = (props: MiddlewareProps): React.JSX.Element => {
  const { children, wrapper = false } = props
  const [loading, setLoading] = useState(true)
  const { getRestaurant } = useAuth()
  const { fetchCashiers } = useCashier()
  const hasUpadated = useRef(false)

  useEffect(() => {
    if (!hasUpadated.current) {
      getRestaurant()
        .then(() => {
          fetchCashiers({ is_open: true }).finally(() => {
            setLoading(false)
          })
        })
        .catch(() => {
          setLoading(false)
        })
      const scalePort = getConfig('terminal-scale-port')
      const scaleBoundRate = parseInt(getConfig('terminal-scale-bound-rate') || '9600', 10)
      if (scalePort) {
        window.api.connectScale({ path: scalePort, boundRate: scaleBoundRate })
      }
      hasUpadated.current = true
    }
  }, [fetchCashiers, getRestaurant])

  const fetchToPrint = useCallback(async () => {
    const idPc = getConfig('id-pc')
    api
      .get('v1/desktop/operation/print-jobs/list/', {
        params: {
          time: dayjs().format('HH[h]mm[m]ss[s]'),
          id_pc: idPc || undefined
        }
      })
      .then(async (response) => {
        if (response.data.found) {
          const printJob = response.data.print_job
          const payload = printJob?.payload
          if (payload) {
            try {
              await printOrderReceipt(payload)
              api.delete(`v1/desktop/operation/print-jobs/${printJob.id}/`)
            } catch (error) {
              console.error('Error printing order receipt:', error)
            }
          }
        }
      })
  }, [])

  useEffect(() => {
    const severEnabled = getConfig('print-server-enabled') === 'true'
    const printTimeout = parseInt(getConfig('print-timeout') || '10', 10) * 1000
    if (severEnabled) {
      const interval = setInterval(() => {
        fetchToPrint()
      }, printTimeout)

      return () => clearInterval(interval)
    }
    return () => {}
  }, [fetchToPrint])

  return wrapper ? (
    <GlobalWrapper>
      <Spin spinning={loading} size="large">
        {children}
      </Spin>
    </GlobalWrapper>
  ) : (
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
                  <Middleware wrapper={route.showSidebar}>
                    <PrivateRoute />
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
        <Route path="*" element={<Link to="/">not found</Link>} />
      </Routes>
    </HashRouter>
  )
}
