import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

function PrivateRoute({ children, requiredRole }) {
  const { user } = useContext(AuthContext)

  // Redirect if not logged in
  if (!user || !user.token) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default PrivateRoute
