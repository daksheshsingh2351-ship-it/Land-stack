import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Plus, FileText, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { apiFetch } from '../api';

const MyRequests = () => {
  const { openModal, showToast } = useAppContext();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/requests');
      setRequests(response.data.requests);
    } catch (err) {
      showToast('Failed to load requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    
    // Listen for custom event from GlobalUI if a request is created
    const handleRefresh = () => fetchRequests();
    window.addEventListener('refreshRequests', handleRefresh);
    return () => window.removeEventListener('refreshRequests', handleRefresh);
  }, []);

  // Filter requests locally for search/status if not using backend filters for this UI
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      // Search
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        req.requestId?.toLowerCase().includes(query) || 
        req.id?.toLowerCase().includes(query) || 
        req.ulpin?.toLowerCase().includes(query) || 
        req.type?.toLowerCase().includes(query);
      
      // Status
      const matchesStatus = statusFilter === 'All' || req.status === statusFilter.replace(' ', '_').toUpperCase();
      
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchQuery, statusFilter]);

  const handleView = (req) => {
    openModal('requestDetails', {
      id: req.id,
      title: req.type,
      ulpin: req.ulpin,
      status: req.status
    });
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div style={{ padding: '24px 0 8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>My Requests</h1>
          <p className="text-muted" style={{ fontSize: '1.25rem' }}>Manage and track your service requests and verifications.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal('serviceRequest')} style={{ padding: '12px 24px', fontSize: '1rem' }}>
          <Plus size={20} /> New Request
        </button>
      </div>

      {/* Main Content */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* Filters & Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {['All', 'Under Review', 'Verified', 'Action Required', 'Pending'].map(status => (
              <button 
                key={status}
                className={`btn ${statusFilter === status ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)' }}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search ID, ULPIN, or Type..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '44px', width: '100%', borderRadius: 'var(--radius-full)' }} 
            />
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Type</th>
                <th>ULPIN</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '64px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>Loading requests...</div>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '64px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', color: 'var(--text-secondary)', borderStyle: 'dashed', borderWidth: '1px', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-color)' }}>
                      <div style={{ backgroundColor: 'var(--primary-light)', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
                        <FileText size={32} color="var(--primary-color)" />
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                        {requests.length === 0 ? 'No requests yet.' : 'No requests found matching your filters.'}
                      </div>
                      {requests.length === 0 && (
                        <button className="btn btn-outline" style={{ marginTop: '16px' }} onClick={() => openModal('serviceRequest')}>
                          Create New Request
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : filteredRequests.map(req => {
                const readableType = req.type ? req.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown';
                const readableStatus = req.status ? req.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Pending';
                
                return (
                  <tr key={req.id}>
                    <td style={{ fontWeight: 600 }}>{req.requestId || req.id}</td>
                    <td>{readableType}</td>
                    <td>{req.ulpin || 'N/A'}</td>
                    <td className="text-muted">{new Date(req.createdAt || req.date).toLocaleDateString()}</td>
                    <td>
                      {req.status === 'COMPLETED' || req.status === 'VERIFIED' ? (
                        <span className="badge badge-success">{readableStatus}</span>
                      ) : req.status === 'ACTION_REQUIRED' ? (
                        <span className="badge badge-error">Action Required</span>
                      ) : (
                        <span className="badge badge-warning">{readableStatus}</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-outline" style={{ padding: '8px 16px' }} onClick={() => handleView(req)}>
                        View <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyRequests;
