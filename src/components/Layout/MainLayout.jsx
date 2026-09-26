import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Layers, Map, FileText, Settings, HelpCircle, LogOut, LayoutDashboard, User, Bell, CheckCircle, Menu, Info } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { apiFetch } from '../../api';

const MainLayout = () => {
  const { user, logout, showToast, sidebarOpen, toggleSidebar, profileMenuOpen, toggleProfileMenu, openModal } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const res = await apiFetch('/notifications/unread-count');
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error('Failed to fetch unread count', err);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    setNotificationsLoading(true);
    try {
      const res = await apiFetch('/notifications');
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await apiFetch(`/notifications/${notif.id}/read`, { method: 'PATCH' });
        fetchUnreadCount();
        if (notificationsOpen) fetchNotifications();
      } catch (err) {
        console.error('Failed to mark read', err);
      }
    }
    setNotificationsOpen(false);
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    }
  };

  const closeSidebar = () => {
    if (window.innerWidth <= 768) toggleSidebar();
  };
  const toggleNotifications = () => {
    const nextState = !notificationsOpen;
    setNotificationsOpen(nextState);
    if (nextState) {
      fetchNotifications();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    showToast("Logged out successfully");
  };

  const navItems = user?.role === 'CITIZEN'
    ? [
        { path: '/portal',       label: 'Citizen Dashboard',  icon: User },
        { path: '/requests',     label: 'My Requests',        icon: FileText },
        { path: '/explorer',     label: 'GIS / Land Explorer',icon: Map },
      ]
    : [
        { path: '/dashboard',    label: 'Officer Dashboard',  icon: LayoutDashboard },
        { path: '/explorer',     label: 'GIS / Land Explorer',icon: Map },
        { path: '/intelligence', label: 'AI Alerts',          icon: FileText },
        { path: '/systems',      label: 'Connected Systems',  icon: Layers },
      ];

  const bottomNavItems = [
    { label: 'Settings',     icon: Settings,    action: () => { openModal('settings'); closeSidebar(); } },
    { label: 'Help & Support', icon: HelpCircle, action: () => { openModal('help'); closeSidebar(); } },
  ];

  const getPageTitle = () => {
    if (location.pathname.includes('/portal'))      return 'Citizen Portal';
    if (location.pathname.includes('/requests'))    return 'My Requests';
    if (location.pathname.includes('/dashboard'))   return 'Officer Dashboard';
    if (location.pathname.includes('/explorer'))    return 'GIS Land Explorer';
    if (location.pathname.includes('/intelligence')) return 'AI Land Intelligence';
    if (location.pathname.includes('/systems'))     return 'Connected Systems';
    return 'LandStack Platform';
  };

  if (!user) {
    if (location.pathname === '/explorer' || location.pathname === '/explorer/') {
      return <Navigate to="/" replace />;
    }
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)', flexDirection: 'column' }}>
        <Layers size={48} color="var(--primary-color)" style={{ marginBottom: '24px' }} />
        <h2>Session Expired</h2>
        <p className="text-muted" style={{ marginBottom: '24px', marginTop: '8px' }}>Please log in to continue.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Return to Login</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>

      {/* Mobile Overlay */}
      <div className={`mobile-overlay ${sidebarOpen ? 'open' : ''}`} onClick={closeSidebar}></div>

      {/* Sidebar */}
      <aside
        className={`sidebar ${sidebarOpen ? 'open' : ''}`}
        style={{
          width: '260px',
          backgroundColor: 'var(--surface-color)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 200,
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)' }}>
          <Layers size={28} color="var(--primary-color)" />
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>LandStack</span>
        </div>

        {/* User Profile */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', fontWeight: 600 }}>
              {user.name.charAt(0)}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.name}</div>
              <div className="text-small text-muted">{user.role}</div>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '16px 0', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <div
                key={item.path}
                onClick={() => { navigate(item.path); closeSidebar(); }}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                <Icon size={20} color={isActive ? 'var(--primary-color)' : 'var(--text-tertiary)'} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div style={{ padding: '16px 0', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                onClick={item.action}
                className="sidebar-link"
                style={{ cursor: 'pointer' }}
              >
                <Icon size={20} color="var(--text-tertiary)" />
                <span>{item.label}</span>
              </div>
            );
          })}
          <div
            onClick={handleLogout}
            className="sidebar-link"
            style={{ cursor: 'pointer', color: 'var(--status-error)', marginTop: '8px' }}
          >
            <LogOut size={20} />
            <span>Sign out</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header */}
        <header
          className="topbar"
          style={{ height: '64px', backgroundColor: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 50 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="btn-ghost menu-toggle" onClick={toggleSidebar} style={{ display: 'none', padding: '8px', margin: '-8px' }} title="Toggle Menu" aria-label="Toggle Menu">
              <Menu size={20} />
            </button>
            <span style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--text-primary)' }}>
              {getPageTitle()}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>

            {/* Notifications bell */}
            <button className="btn-ghost" onClick={toggleNotifications} title="Notifications" aria-label="Notifications" style={{ padding: '8px', position: 'relative', borderRadius: 'var(--radius-full)' }}>
              <Bell size={20} color="var(--text-secondary)" />
              {unreadCount > 0 && (
                <div style={{ position: 'absolute', top: '6px', right: '8px', width: '8px', height: '8px', backgroundColor: 'var(--status-error)', borderRadius: '50%', border: '2px solid var(--surface-color)' }}></div>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div style={{ position: 'absolute', top: '100%', right: '48px', marginTop: '8px', width: '360px', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', zIndex: 100, overflow: 'hidden', animation: 'slideUp 0.2s ease-out' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-color)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Notifications</span>
                  {unreadCount > 0 && <span className="badge badge-info">{unreadCount} New</span>}
                </div>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {notificationsLoading ? (
                    <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <div className="skeleton" style={{ height: '20px', width: '60%', margin: '0 auto' }}></div>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <Bell size={32} style={{ opacity: 0.2, marginBottom: '12px' }} />
                      <div>No notifications right now</div>
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id}
                        className="hover-row" 
                        style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', backgroundColor: notif.isRead ? 'var(--surface-color)' : 'var(--primary-light)', display: 'flex', gap: '16px', alignItems: 'flex-start' }} 
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <div style={{ color: notif.isRead ? 'var(--text-tertiary)' : 'var(--primary-color)', marginTop: '2px', flexShrink: 0 }}>
                          {notif.title.toLowerCase().includes('verif') ? <CheckCircle size={18} /> : <Info size={18} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: notif.isRead ? 500 : 600, color: 'var(--text-primary)', marginBottom: '4px', fontSize: '0.9375rem' }}>{notif.title}</div>
                          <div className="text-small text-muted" style={{ lineHeight: 1.4 }}>{notif.message}</div>
                          <div className="text-small text-tertiary" style={{ marginTop: '8px' }}>{new Date(notif.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div style={{ height: '32px', width: '1px', backgroundColor: 'var(--border-color)' }}></div>

            {/* Profile avatar + dropdown */}
            <div style={{ position: 'relative' }}>
              <div
                style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', fontWeight: 600, cursor: 'pointer' }}
                title="Profile"
                onClick={toggleProfileMenu}
              >
                {user.name.charAt(0)}
              </div>

              {profileMenuOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '200px', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 100 }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 600 }}>{user.name}</div>
                    <div className="text-small text-muted">{user.role}</div>
                  </div>
                  <div style={{ padding: '8px 0' }}>
                    <div className="hover-row" style={{ padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                      onClick={() => { openModal('settings'); toggleProfileMenu(); }}>
                      <User size={16} /> Profile Settings
                    </div>
                    <div className="hover-row" style={{ padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                      onClick={() => { openModal('settings'); toggleProfileMenu(); }}>
                      <Settings size={16} /> Settings
                    </div>
                    <div className="hover-row" style={{ padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-error)' }}
                      onClick={handleLogout}>
                      <LogOut size={16} /> Sign out
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content" style={{ flex: 1, padding: '32px 48px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .page-content { padding: 24px 16px !important; }
          .menu-toggle { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

export default MainLayout;
