import { Navigate, Outlet } from 'react-router-dom'
import { isAuthenticated,getToken } from '../../services/auth'

export function LoginRoute(): React.JSX.Element {
  const auth = getToken()
  const isAuth = isAuthenticated()
  return !auth || !isAuth ? <Outlet /> : <Navigate to="/" />
}
