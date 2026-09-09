import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AdminRoute({ children, allowVenueAdmin = false, allowModerator = false }) {
  const { user, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (
    !user.isAdmin &&
    !(allowVenueAdmin && user.isVenueAdmin) &&
    !(allowModerator && user.isModerator)
  ) {
    return <Navigate to="/home" replace />
  }

  return children
}

export default AdminRoute
