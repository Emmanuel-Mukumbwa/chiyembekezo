import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based dashboard redirection
  const roleDashboards = {
    admin: '/admin',
    professional: '/professional',
    volunteer: '/volunteer/dashboard',
    org_admin: '/organization',        // ✅ fixed
    listener: '/listener/dashboard',
    user: '/dashboard',
  };

  const defaultDashboard = '/dashboard';
  const roleDashboard = roleDashboards[user.role] || defaultDashboard;

  // If user is on root or login page, redirect to their role dashboard
  if (location.pathname === '/' || location.pathname === '/login') {
    return <Navigate to={roleDashboard} replace />;
  }

  // If user is on the wrong dashboard (e.g., user goes to /admin), redirect
  // but only if they are on a known dashboard path
  const dashboardPaths = Object.values(roleDashboards);
  if (dashboardPaths.includes(location.pathname) && location.pathname !== roleDashboard) {
    return <Navigate to={roleDashboard} replace />;
  }

  return children;
};

export default ProtectedRoute;