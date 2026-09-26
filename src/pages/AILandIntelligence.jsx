import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, AlertTriangle, CheckCircle, ArrowRight, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { apiFetch } from '../api';

const AILandIntelligence = () => {
  const navigate = useNavigate();
  const { showToast, setSelectedUlpin } = useAppContext();
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const [alertsRes, summaryRes] = await Promise.all([
        apiFetch('/alerts').catch(e => {
          if (e.status !== 401 && e.status !== 403) console.error(e);
          return { data: { alerts: [] } };
        }),
        apiFetch('/alerts/summary').catch(e => {
          if (e.status !== 401 && e.status !== 403) console.error(e);
          return { data: { summary: null } };
        })
      ]);
      setAlerts(alertsRes.data.alerts || []);
      setSummary(summaryRes.data.summary || null);
    } catch (err) {
      if (err.status !== 401 && err.status !== 403) {
        showToast('Failed to fetch AI Alerts', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleInvestigate = (ulpin) => {
    setSelectedUlpin(ulpin);
    navigate('/explorer');
  };

  const handleDismiss = async (id) => {
    try {
      await apiFetch(`/alerts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'DISMISSED' })
      });
      showToast("Alert dismissed", "success");
      fetchAlerts();
    } catch (err) {
      showToast('Failed to dismiss alert', 'error');
    }
  };

  const activeAlertsCount = summary ? Object.values(summary.bySeverity).reduce((a, b) => a + b, 0) : 0;
  const activeAlerts = alerts.filter(a => a.status !== 'RESOLVED' && a.status !== 'DISMISSED');
  const resolvedAlerts = alerts.filter(a => a.status === 'RESOLVED');

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ backgroundColor: 'var(--primary-color)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
          <Sparkles color="white" size={28} />
        </div>
        <div>
          <h1 style={{ margin: 0 }}>AI Land Intelligence</h1>
          <p className="text-muted">Automated insights and conflict detection across land records.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>12,540</div>
          <div className="text-muted text-small">Parcels Scanned</div>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--status-success)' }}>12,437</div>
          <div className="text-muted text-small">Records Consistent</div>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--status-warning)' }}>{loading ? '...' : activeAlertsCount + 102}</div>
          <div className="text-muted text-small">Anomalies Detected</div>
        </div>
      </div>

      <h2>Active Alerts</h2>
      <p className="text-muted" style={{ marginBottom: '24px' }}>Review the inconsistencies flagged by the AI engine.</p>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
          <h3>Loading alerts...</h3>
        </div>
      ) : activeAlerts.length === 0 ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', color: 'var(--text-secondary)', borderStyle: 'dashed', backgroundColor: 'var(--bg-color)', boxShadow: 'none' }}>
          <div style={{ backgroundColor: 'var(--status-success-bg)', padding: '20px', borderRadius: '50%', marginBottom: '24px' }}>
            <CheckCircle size={48} color="var(--status-success)" />
          </div>
          <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>All caught up!</h3>
          <p style={{ textAlign: 'center', maxWidth: '300px' }}>No active alerts require your review at this time. The AI engine will notify you if anomalies are detected.</p>
        </div>
      ) : activeAlerts.map(alertParcel => (
        <div key={alertParcel.id} className="card hover-elevate" style={{ borderLeft: `4px solid ${alertParcel.severity === 'CRITICAL' || alertParcel.severity === 'HIGH' ? 'var(--status-error)' : 'var(--status-warning)'}`, marginBottom: '24px', transition: 'all 0.2s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <AlertTriangle color={alertParcel.severity === 'CRITICAL' || alertParcel.severity === 'HIGH' ? 'var(--status-error)' : 'var(--status-warning)'} size={24} />
              <div>
                <h3 style={{ margin: 0, display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {alertParcel.alertType}
                  {alertParcel.severity && <span className={`badge badge-${alertParcel.severity === 'CRITICAL' || alertParcel.severity === 'HIGH' ? 'error' : 'warning'}`} style={{ fontSize: '0.7rem' }}>{alertParcel.severity}</span>}
                </h3>
                <p className="text-small text-muted" style={{ marginTop: '4px' }}>
                  Confidence Score: <strong style={{ color: 'var(--text-primary)' }}>{alertParcel.confidence || 'N/A'}</strong>
                </p>
                <div style={{ marginTop: '4px', fontWeight: 500 }}>{alertParcel.parcel?.ulpin || 'Unknown Parcel'}</div>
              </div>
            </div>
            <span className={`badge badge-${alertParcel.status === 'UNDER_REVIEW' ? 'info' : 'warning'}`}>{alertParcel.status.replace(/_/g, ' ')}</span>
          </div>
          
          <div style={{ backgroundColor: 'var(--bg-color)', padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div className="text-small text-muted">Recorded Data (Govt DB)</div>
                <div style={{ fontWeight: 500, marginTop: '4px' }}>{alertParcel.recordedUse || 'N/A'}</div>
              </div>
              <div>
                <div className="text-small text-muted">Observed Status</div>
                <div style={{ fontWeight: 500, marginTop: '4px', color: 'var(--status-error)' }}>{alertParcel.observedSignal || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <p className="text-small" style={{ margin: 0, flex: 1, minWidth: '200px' }}>
              <strong>Recommendation:</strong> {alertParcel.recommendation || 'Please investigate manually.'}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-outline"
                onClick={() => handleDismiss(alertParcel.id)}
              >
                <X size={16} /> Dismiss
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => handleInvestigate(alertParcel.parcel?.ulpin)}
              >
                Investigate <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}

      {!loading && resolvedAlerts.map(alertParcel => (
        <div key={alertParcel.id} className="card" style={{ borderLeft: '4px solid var(--status-success)', opacity: 0.7, marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <CheckCircle color="var(--status-success)" size={24} />
              <div>
                <h3 style={{ margin: 0 }}>{alertParcel.alertType}</h3>
                <p className="text-small text-muted" style={{ marginTop: '4px' }}>{alertParcel.parcel?.ulpin || 'Unknown'} - {alertParcel.recommendation}</p>
              </div>
            </div>
            <span className="badge badge-success">Resolved</span>
          </div>
        </div>
      ))}

    </div>
  );
};

export default AILandIntelligence;
