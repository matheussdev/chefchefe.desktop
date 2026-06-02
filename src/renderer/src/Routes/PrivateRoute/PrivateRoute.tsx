import { Navigate, Outlet } from 'react-router-dom'
import { getToken, isAuthenticated } from '../../services/auth'

import React from 'react'

interface PrivateRouteProps {
  wrapper?: boolean
}

export const PrivateRoute: React.FC<PrivateRouteProps> = () => {
  const auth = getToken()
  const isAuth = isAuthenticated()
  let routeContent
  if (auth && isAuth) {
    routeContent = <Outlet />
  } else {
    routeContent = <Navigate to="/login" />
  }
  return routeContent
}
