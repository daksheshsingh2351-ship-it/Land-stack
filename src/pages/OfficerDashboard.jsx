  import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, AlertTriangle, FileWarning, CheckCircle, Search, Filter, Layers, ChevronRight, RefreshCw, FileText } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { apiFetch } from '../api';

const OfficerDashboard = () => {
  const navigate = useNavigate();
  const { openModal, showToast } = useAppContext();
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    total: 0, pending: 0, inProgress: 0, completed: 0, rejected: 0, unassigned: 0
  });
  const [requests, setRequests] = useState([]);
  const [aiAlertsCount, setAiAlertsCount] = useState(0);
  const [aiAlerts, setAiAlerts] = useState([]);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [dashRes, reqsRes, alertsRes] = await Promise.all([
        apiFetch('/officer/dashboard'),
        apiFetch('/officer/requests'),
        apiFetch('/alerts/summary').catch(e => ({ data: { summary: { bySeverity: {} } } }))
      ]);
      setDashboardData(dashRes.data);
      setRequests(reqsRes.data.requests);
      
      const summary = alertsRes.data.summary;
      const count = summary ? Object.values(summary.bySeverity || {}).reduce((a, b) => a + b, 0) : 0;
      setAiAlertsCount(count);
    } catch (err) {
      if (err.status !== 401 && err.status !== 403) {
        showToast('Failed to fetch dashboard data', 'error');
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const handleRefresh = () => fetchData();
    window.addEventListener('refreshDashboard', handleRefresh);
    return () => window.removeEventListener('refreshDashboard', handleRefresh);
  }, []);

  const handleReview = (req, readableType) => {
    openModal('verification', { 
      id: req.id, 
      ulpin: req.ulpin || req.parcel?.ulpin, 
      type: readableType, 
      hasAlert: false,
      description: req.description,
      creatorName: req.creator?.name
    });
  };

  const handleRefresh = () => {
    fetchData();
  };

  const dismissAlert = (ulpin) => {
    setAiAlerts(prev => prev.filter(a => a.ulpin !== ulpin));
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div style={{ padding: '24px 0 8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Officer Dashboard</h1>
          <p className="text-muted" style={{ fontSize: '1.25rem' }}>Overview of land records, verifications, and system alerts.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="btn btn-outline" onClick={handleRefresh} disabled={isRefreshing} style={{ padding: '12px 24px', fontSize: '1rem' }}>
            <RefreshCw size={20} className={isRefreshing ? 'spin' : ''} /> Refresh Data
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/explorer')} style={{ padding: '12px 24px', fontSize: '1rem' }}>
            Open GIS Explorer <Layers size={20} />
          </button>
        </div>
      </div>

      {/* STATISTICS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        
        <div className="card hover-elevate" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-md)' }}>
              <Users size={24} color="var(--primary-color)" />
            </div>
            <div style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '1.125rem' }}>Total Parcels</div>
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '8px', lineHeight: 1 }}>
            {isRefreshing ? '...' : dashboardData.total.toLocaleString()}
          </div>
          <div className="text-small" style={{ color: 'var(--status-success)', fontWeight: 600, marginTop: 'auto' }}>↑ 2.4% from last month</div>
        </div>

        <div className="card hover-elevate" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--status-success-bg)', borderRadius: 'var(--radius-md)' }}>
              <CheckCircle size={24} color="var(--status-success)" />
            </div>
            <div style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '1.125rem' }}>Verified Parcels</div>
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '8px', lineHeight: 1 }}>
            {isRefreshing ? '...' : dashboardData.completed.toLocaleString()}
          </div>
          <div className="text-small" style={{ color: 'var(--status-success)', fontWeight: 600, marginTop: 'auto' }}>↑ 3.1% from last month</div>
        </div>

        <div className="card hover-elevate" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--status-warning-bg)', borderRadius: 'var(--radius-md)' }}>
              <FileWarning size={24} color="var(--status-warning)" />
            </div>
            <div style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '1.125rem' }}>Pending</div>
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '8px', lineHeight: 1 }}>
            {isRefreshing ? '...' : dashboardData.pending.toLocaleString()}
          </div>
          <div className="text-small" style={{ color: 'var(--status-warning)', fontWeight: 600, marginTop: 'auto' }}>Needs manual review</div>
        </div>

        <div className="card hover-elevate" style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--status-error)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--status-error-bg)', borderRadius: 'var(--radius-md)' }}>
              <AlertTriangle size={24} color="var(--status-error)" />
            </div>
            <div style={{ color: 'var(--status-error)', fontWeight: 600, fontSize: '1.125rem' }}>AI Alerts</div>
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '8px', lineHeight: 1, color: 'var(--status-error)' }}>{isRefreshing ? '...' : aiAlertsCount}</div>
          <div className="text-small" style={{ color: 'var(--status-error)', fontWeight: 600, marginTop: 'auto' }}>Requires immediate action</div>
        </div>

      </div>

      {/* TWO COLUMN LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }} className="officer-grid">
        
        {/* LEFT: Citizen Service Requests */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileText color="var(--primary-color)" /> Service Requests
            </h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input type="text" className="input-field" placeholder="Search Request..." style={{ paddingLeft: '44px', width: '220px', borderRadius: 'var(--radius-full)' }} />
              </div>
              <button className="btn btn-outline" style={{ borderRadius: 'var(--radius-full)' }} onClick={() => showToast('Filters applied', 'info')}>
                <Filter size={18} />
              </button>
            </div>
          </div>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>ULPIN</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {isRefreshing ? (
                  <tr><td colSpan="6" style={{ padding: '64px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>Loading data...</div>
                  </td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan="6" style={{ padding: '64px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', color: 'var(--text-secondary)', borderStyle: 'dashed', borderWidth: '1px', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-color)' }}>
                      <div style={{ backgroundColor: 'var(--status-success-bg)', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
                        <CheckCircle size={32} color="var(--status-success)" />
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--text-primary)', marginBottom: '8px' }}>No verification requests pending.</div>
                      <div style={{ textAlign: 'center', fontSize: '0.875rem' }}>All clear for now.</div>
                    </div>
                  </td></tr>
                ) : requests.map(req => {
                  const readableType = req.type ? req.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown';
                  const readableStatus = req.status ? req.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Pending';
                  
                  return (
                    <tr key={req.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{req.requestId}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{req.ulpin || req.parcel?.ulpin || 'N/A'}</td>
                      <td>{readableType}</td>
                      <td>
                        {req.status === 'COMPLETED' || req.status === 'VERIFIED' ? (
                          <span className="badge badge-success">{readableStatus}</span>
                        ) : req.status === 'ACTION_REQUIRED' ? (
                          <span className="badge badge-error">Action Required</span>
                        ) : (
                          <span className="badge badge-warning">{readableStatus}</span>
                        )}
                      </td>
                      <td className="text-muted">{new Date(req.createdAt || req.date || new Date()).toLocaleDateString()}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-outline" style={{ padding: '8px 16px' }} onClick={() => handleReview(req, readableType)}>
                          Review <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: AI Alerts */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <AlertTriangle color="var(--status-error)" /> Active AI Alerts
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {aiAlerts.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', color: 'var(--text-secondary)', borderStyle: 'dashed', borderWidth: '1px', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-color)' }}>
                <div style={{ backgroundColor: 'var(--status-success-bg)', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
                  <CheckCircle size={32} color="var(--status-success)" />
                </div>
                <div style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--text-primary)', marginBottom: '8px' }}>No active alerts.</div>
                <div style={{ textAlign: 'center', fontSize: '0.875rem' }}>All systems are nominal.</div>
              </div>
            ) : aiAlerts.map(alert => (
              <div key={alert.ulpin} style={{ padding: '20px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-color)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', backgroundColor: alert.severity === 'high' ? 'var(--status-error)' : 'var(--status-warning)' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{alert.ulpin}</div>
                  <span className={`badge badge-${alert.severity === 'high' ? 'error' : 'warning'}`}>{alert.type}</span>
                </div>
                <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '20px', lineHeight: 1.5 }}>{alert.description}</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-primary" style={{ flex: 1, padding: '8px' }} onClick={() => navigate('/explorer')}>Investigate</button>
                  <button className="btn btn-outline" style={{ padding: '8px 16px' }} onClick={() => { dismissAlert(alert.ulpin); showToast('Alert dismissed', 'info'); }}>Dismiss</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 1024px) {
          .officer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default OfficerDashboard;
