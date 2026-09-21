import { Navigate, Outlet, useLocation } from 'react-router';

import { useAuth } from '../context/AuthContext.jsx';
import { PageLoader } from './Feedback.jsx';

/**
 * Keeps signed-out visitors out of account pages and non-admins out of the
 * admin area. This is a convenience for the person using the site — the API
 * enforces the same rules on every request, so bypassing this changes nothing.
 */
export function ProtectedRoute({ requireAdmin = false, tone = 'dark' }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader tone={tone} label="Checking your session" />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
}

export default ProtectedRoute;
