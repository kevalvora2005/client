import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const GuestRoute = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Still attempting silent refresh — don't redirect yet
  if (isLoading) return null;

  // Already logged in → redirect away from login page to their proper home
  if (isAuthenticated && user) {
    if (user.mustResetPassword) {
      if (user.resetToken) {
        return <Navigate to={`/reset-password?token=${user.resetToken}`} replace />;
      }
      return <Navigate to="/reset-password" replace />;
    }

    const role = user.role?.toLowerCase();

    if (role === 'resident') {
      return <Navigate to="/resident" replace />;
    }
    if (role === 'security') {
      return <Navigate to="/security" replace />;
    }
    // Default fallback for admins
    return <Navigate to="/residents" replace />;
  }

  // Not logged in → let them see the login page
  return <Outlet />;
};

export default GuestRoute;