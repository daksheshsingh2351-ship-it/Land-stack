import React, { useState } from 'react';
import { Database, Link, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { apiFetch } from '../api';

const SystemCard = ({ id, name, status, initialSync, department }) => {
  const { showToast, openModal } = useAppContext();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    
    try {
      // First, set status to SYNCING
      await apiFetch(`/systems/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'SYNCING' })
      });
      window.dispatchEvent(new Event('refreshSystems'));

      // Simulate a small delay for syncing UX, then set back to CONNECTED
      setTimeout(async () => {
        try {
          await apiFetch(`/systems/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'CONNECTED', lastSyncAt: new Date().toISOString() })
          });
          showToast(`${name} synchronized successfully!`, 'success');
          window.dispatchEvent(new Event('refreshSystems'));
        } catch (err) {
          showToast(`Failed to complete sync for ${name}`, 'error');
        } finally {
          setIsSyncing(false);
        }
      }, 1500);

    } catch (err) {
      showToast(`Failed to sync ${name}`, 'error');
      setIsSyncing(false);
    }
  };

  return (
    <div className="card hover-elevate" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Database size={24} color={status === 'Connected' ? 'var(--status-success)' : 'var(--status-warning)'} />
          <div>
            <h3 style={{ margin: 0 }}>{name}</h3>
            <span className="text-small text-muted">{department}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <span className={`badge ${status === 'Connected' ? 'badge-success' : 'badge-warning'}`}>
            {status}
          </span>
          <button className="btn-ghost text-small" onClick={() => openModal('systemDetails', { id, name, department, status: status })}>View Details</button>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={14} className="text-muted" />
          <span className="text-small text-muted">Last sync: {initialSync}</span>
        </div>
        <button 
          className="btn-ghost text-small" 
          style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '4px' }}
          onClick={handleSync}
          disabled={isSyncing || status === 'Syncing'}
        >
          <RefreshCw size={14} className={(isSyncing || status === 'Syncing') ? "spin" : ""} /> {(isSyncing || status === 'Syncing') ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>
    </div>
  );
};

const ConnectedSystems = () => {
  const { showToast } = useAppContext();
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSystems = async () => {
    try {
      const res = await apiFetch('/systems');
      setSystems(res.data.systems);
    } catch (err) {
      showToast('Failed to fetch connected systems', 'error');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSystems();
    window.addEventListener('refreshSystems', fetchSystems);
    return () => window.removeEventListener('refreshSystems', fetchSystems);
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1>Connected Systems Architecture</h1>
        <p className="text-muted">Monitoring the integration of fragmented government databases via ULPIN.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '64px', backgroundColor: 'var(--surface-color)', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', textAlign: 'center', width: '150px' }}>Revenue (RoR)</div>
          <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', textAlign: 'center', width: '150px' }}>Registration</div>
          <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', textAlign: 'center', width: '150px' }}>Town Planning</div>
          <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', textAlign: 'center', width: '150px' }}>Municipal Corp</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
          <Link size={24} color="var(--primary-color)" />
          <div style={{ padding: '8px 24px', backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: 'var(--radius-full)', fontWeight: 'bold' }}>
            API Integration Layer (ULPIN Matching)
          </div>
          <Link size={24} color="var(--primary-color)" />
        </div>

        <div style={{ padding: '24px 48px', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-lg)', border: '2px solid var(--primary-color)', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--primary-color)', margin: 0 }}>LAND STACK</h2>
          <p className="text-small text-muted" style={{ marginTop: '4px' }}>Unified GIS & Data Platform</p>
        </div>

      </div>

      <h2 style={{ marginBottom: '24px' }}>Integration Status</h2>
      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading systems...</div>
      ) : systems.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>No connected systems found.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {systems.map(sys => {
            const readableStatus = sys.status ? sys.status.charAt(0) + sys.status.slice(1).toLowerCase() : 'Disconnected';
            const initialSync = sys.lastSyncAt ? new Date(sys.lastSyncAt).toLocaleString() : 'Never synced';
            
            return (
              <SystemCard 
                key={sys.id}
                id={sys.id}
                name={sys.name} 
                department={sys.systemType} 
                status={readableStatus} 
                initialSync={initialSync} 
              />
            );
          })}
        </div>
      )}

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ConnectedSystems;
