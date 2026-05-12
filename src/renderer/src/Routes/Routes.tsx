import { HashRouter, Routes, Route, Link } from 'react-router-dom'
import { LoginRoute } from './LoginRoute'
import { LoginPage } from '../Pages/Login'
import { PrivateRoute } from './PrivateRoute'
import { Spin } from 'antd'
import { routes } from './'
import { useRef, useState } from 'react'
import { useAuth } from '@renderer/hooks/useAuth'
import { useCashier } from '@renderer/hooks/useCashiers'

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
