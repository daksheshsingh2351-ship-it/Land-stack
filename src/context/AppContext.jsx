import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiFetch, removeAuthToken } from '../api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Initialize user from localStorage if available
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('landstack_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [selectedUlpin, setSelectedUlpin] = useState(null);
  
  // UI State
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [activeModal, setActiveModal] = useState(null); // { type: string, data: any }
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-login check on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await apiFetch('/auth/me');
        const userObj = { ...data.data.user, authenticated: true };
        setUser(userObj);
        localStorage.setItem('landstack_user', JSON.stringify(userObj));
      } catch (err) {
        // Token invalid or expired
        removeAuthToken();
        setUser(null);
        localStorage.removeItem('landstack_user');
      }
    };
    if (localStorage.getItem('landstack_jwt')) {
      checkAuth();
    }
  }, []);

  const login = (userData) => {
    const newUser = {
      ...userData,
      authenticated: true
    };
    setUser(newUser);
    localStorage.setItem('landstack_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('landstack_user');
    removeAuthToken();
    setSelectedUlpin(null);
    setProfileMenuOpen(false);
    setNotificationsOpen(false);
  };

  const showToast = useCallback((message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  const openModal = (type, data = null) => {
    setActiveModal({ type, data });
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    setProfileMenuOpen(false);
  };
  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
    setNotificationsOpen(false);
  };

  // Cleaned up mock data state

  return (
    <AppContext.Provider value={{
      user, login, logout,
      selectedUlpin, setSelectedUlpin,
      toastMessage, toastType, showToast,
      activeModal, openModal, closeModal,
      sidebarOpen, toggleSidebar,
      notificationsOpen, toggleNotifications,
      profileMenuOpen, toggleProfileMenu,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
