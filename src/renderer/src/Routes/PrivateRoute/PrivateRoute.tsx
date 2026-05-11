import { Navigate, Outlet } from 'react-router-dom'
import { getToken, isAuthenticated } from '../../services/auth'
import { GlobalWrapper } from '../../components/GlobalWrapper'
import React from 'react'

interface PrivateRouteProps {
  wrapper?: boolean
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ wrapper = true }) => {
  const auth = getToken()
  const isAuth = isAuthenticated()
  let routeContent
  if (auth && isAuth) {
    if (wrapper) {
      routeContent = (
        <GlobalWrapper>
          <Outlet />
        </GlobalWrapper>
      )
    } else {
      routeContent = <Outlet />
    }
  } else {
    routeContent = <Navigate to="/login" />
  }
  return routeContent
}
