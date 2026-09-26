import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Map, FileText, CheckCircle, Clock, ArrowRight, AlertTriangle, Layers, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { apiFetch } from '../api';

const CitizenPortal = () => {
  const navigate = useNavigate();
  const { setSelectedUlpin, openModal, showToast, user } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  React.useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await apiFetch('/requests');
        setRequests(response.data.requests);
      } catch (err) {
        console.error("Failed to load requests", err);
      } finally {
        setLoadingRequests(false);
      }
    };
    fetchRequests();
    
    const handleRefresh = () => fetchRequests();
    window.addEventListener('refreshRequests', handleRefresh);
    return () => window.removeEventListener('refreshRequests', handleRefresh);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    setIsSearching(true);
    setSearchResult(null);
    
    try {
      const res = await apiFetch(`/parcels/${searchQuery.trim().toUpperCase()}`);
      if (res.data.parcel) {
        setSearchResult(res.data.parcel);
      }
    } catch (err) {
      showToast("No parcel found. Please verify ULPIN.", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const handleOpenExplorer = () => {
    if (searchResult) {
      setSelectedUlpin(searchResult.ulpin);
    }
    navigate('/explorer');
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Welcome Section */}
      <div style={{ padding: '24px 0 8px 0' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Welcome back, Citizen</h1>
        <p className="text-muted" style={{ fontSize: '1.25rem' }}>Access your land records, verify properties, and submit service requests.</p>
      </div>

      {/* LARGE SEARCH PANEL */}
      <div className="card hover-elevate" style={{ padding: '48px 32px', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', backgroundImage: 'radial-gradient(circle at right top, var(--primary-light) 0%, transparent 50%)' }}>
        <div style={{ maxWidth: '800px' }}>
          <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Search size={28} color="var(--primary-color)" /> Find a Land Parcel
          </h2>
          <p className="text-muted" style={{ marginBottom: '24px', fontSize: '1.125rem' }}>Enter a ULPIN (e.g., ULPIN-MH-000123) or Plot Number to view certified records.</p>
          
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, position: 'relative', minWidth: '300px' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Search ULPIN or Plot Number..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '16px 24px', fontSize: '1.125rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-color)' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0 32px', fontSize: '1.125rem', borderRadius: 'var(--radius-full)' }} disabled={isSearching}>
              {isSearching ? <span className="skeleton" style={{ width: '60px', height: '24px', display: 'inline-block' }}></span> : 'Search Records'}
            </button>
          </form>

          {searchResult && (
            <div style={{ marginTop: '32px', padding: '24px', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)', animation: 'slideUp 0.3s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '12px', backgroundColor: 'var(--status-success-bg)', borderRadius: 'var(--radius-md)', color: 'var(--status-success)' }}>
                  <CheckCircle size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '4px' }}>{searchResult.ulpin}</div>
                  <div className="text-muted">{searchResult.location}</div>
                </div>
              </div>
              <button className="btn btn-primary" onClick={handleOpenExplorer}>View Details <ArrowRight size={16} /></button>
            </div>
          )}
        </div>
      </div>

      {/* TWO COLUMN SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
        
        {/* Explore Map */}
        <div className="card hover-elevate" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-md)', display: 'inline-block', marginBottom: '24px', width: 'fit-content' }}>
            <Map size={32} color="var(--primary-color)" />
          </div>
          <h2 style={{ marginBottom: '16px' }}>Explore GIS Map</h2>
          <p className="text-muted" style={{ flex: 1, marginBottom: '32px', fontSize: '1.125rem', lineHeight: 1.6 }}>
            Visually browse land parcels, view zoning boundaries, and identify properties natively on our interactive spatial map.
          </p>
          <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} onClick={() => navigate('/explorer')}>
            Open Map Explorer <ArrowRight size={16} />
          </button>
        </div>

        {/* My Requests */}
        <div className="card hover-elevate" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--status-warning-bg)', borderRadius: 'var(--radius-md)', display: 'inline-block' }}>
              <FileText size={32} color="var(--status-warning)" />
            </div>
            <button className="btn btn-primary" onClick={() => openModal('serviceRequest')}>
              + New Request
            </button>
          </div>
          <h2 style={{ marginBottom: '16px' }}>My Requests</h2>
          
          <div style={{ flex: 1, overflowX: 'auto', margin: '0 -24px', padding: '0 24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 0', color: 'var(--text-secondary)', fontWeight: 600 }}>Request Details</th>
                  <th style={{ padding: '12px 0', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loadingRequests ? (
                  <tr><td colSpan="2" style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    <div style={{ fontWeight: 500 }}>Loading requests...</div>
                  </td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan="2" style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    <FileText size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                    <div style={{ fontWeight: 500 }}>No service requests yet.</div>
                  </td></tr>
                ) : requests.slice(0, 3).map(req => (
                  <tr key={req.id} style={{ borderBottom: '1px solid var(--border-color)' }} className="hover-row">
                    <td style={{ padding: '16px 0' }}>
                      <div style={{ fontWeight: 600 }}>{req.type}</div>
                      <div className="text-small text-muted" style={{ marginTop: '4px' }}>{req.id}</div>
                    </td>
                    <td style={{ padding: '16px 0', textAlign: 'right' }}>
                      {req.status === 'Completed' || req.status === 'Verified' ? (
                        <span className="badge badge-success">Verified</span>
                      ) : req.status === 'Action Required' ? (
                        <span className="badge badge-error">Action Required</span>
                      ) : (
                        <span className="badge badge-warning">{req.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }} onClick={() => navigate('/requests')}>
            View All Requests <ChevronRight size={16} />
          </button>
        </div>

      </div>

      {/* Recent Searches */}
      <div>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text-secondary)' }}>
          <Clock size={20} /> Recent Searches
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {['ULPIN-MH-000140', 'ULPIN-MH-000125', 'ULPIN-MH-000133', 'ULPIN-MH-000118'].map(id => (
            <div key={id} className="card hover-elevate" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setSearchQuery(id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Layers size={16} className="text-muted" />
                <span style={{ fontWeight: 600 }}>{id}</span>
              </div>
              <ChevronRight size={16} className="text-muted" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default CitizenPortal;
