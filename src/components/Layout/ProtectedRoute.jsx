import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAppContext();

  if (!user) {
    // Not logged in
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Logged in but not the right role. Redirect to appropriate dashboard.
    return <Navigate to={user.role === 'CITIZEN' ? '/portal' : '/dashboard'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
