import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, login } = useAppContext();
  const location = useLocation();

  useEffect(() => {
    // Automatically set mock user based on route to bypass authentication
    if (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/intelligence') || location.pathname.startsWith('/systems')) {
      if (!user || user.role !== 'OFFICER') {
        login({ id: 'mock-officer', name: 'Officer', role: 'OFFICER' });
      }
    } else if (location.pathname.startsWith('/portal') || location.pathname.startsWith('/requests')) {
      if (!user || user.role !== 'CITIZEN') {
        login({ id: 'mock-citizen', name: 'Citizen', role: 'CITIZEN' });
      }
    } else {
       if (!user) {
         login({ id: 'mock-citizen', name: 'Citizen', role: 'CITIZEN' });
       }
    }
  }, [location.pathname, user, login]);

  return <Outlet />;
};

export default ProtectedRoute;
