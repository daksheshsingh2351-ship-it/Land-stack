import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { X, CheckCircle, AlertTriangle, FileText, Info, Map } from 'lucide-react';
import { apiFetch, setAuthToken } from '../../api';

const SystemDetailsContent = ({ systemId, initialData, closeModal }) => {
  const [system, setSystem] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSystem = async () => {
      if (!systemId) {
        setSystem(initialData);
        setLoading(false);
        return;
      }
      try {
        const response = await apiFetch(`/systems/${systemId}`);
        setSystem(response.data.system);
      } catch (err) {
        console.error(err);
        setSystem(initialData); // Fallback to initial if fetch fails
      } finally {
        setLoading(false);
      }
    };
    fetchSystem();
  }, [systemId, initialData]);

  if (loading) return <div style={{ padding: '24px', textAlign: 'center' }}>Loading system details...</div>;
  if (!system) return <div style={{ padding: '24px', textAlign: 'center' }}>System not found.</div>;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 8px 0' }}>{system.name}</h3>
        <div className="text-small text-muted">{system.systemType || system.department}</div>
      </div>
      <div className="input-group">
        <div style={{ padding: '16px', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="text-muted">Status</span>
            <span style={{ fontWeight: 600, color: system.status === 'CONNECTED' || system.status === 'Connected' ? 'var(--status-success)' : 'var(--status-warning)' }}>
              {system.status.charAt(0).toUpperCase() + system.status.slice(1).toLowerCase()}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="text-muted">API Endpoint</span>
            <span style={{ fontWeight: 500 }}>https://api.gateway.gov.in/v1</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="text-muted">Auth Protocol</span>
            <span style={{ fontWeight: 500 }}>OAuth 2.0 / JWT</span>
          </div>
        </div>
      </div>
      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={closeModal}>Close</button>
      </div>
    </div>
  );
};
const RequestDetailsModal = ({ data }) => {
  const [request, setRequest] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchRequest = async () => {
      if (!data?.id) return;
      try {
        const response = await apiFetch(`/requests/${data.id}`);
        setRequest(response.data.request);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [data?.id]);

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>Loading request details...</div>;
  }

  if (!request) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>Request not found.</div>;
  }

  const readableTitle = request.type ? request.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'RoR Verification';
  const isCompleted = ['COMPLETED', 'VERIFIED'].includes(request.status);
  const isPending = request.status === 'PENDING';
  
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div className="text-small text-muted">Request ID: {request.requestId}</div>
        <h3 style={{ margin: '8px 0' }}>{readableTitle}</h3>
        <div className="text-small">Parcel: <strong>{request.ulpin || 'N/A'}</strong></div>
      </div>

      <div style={{ position: 'relative', paddingLeft: '24px', borderLeft: '2px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: '-33px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--status-success)' }}></div>
          <div style={{ fontWeight: 500 }}>Submitted</div>
          <div className="text-small text-muted">{new Date(request.createdAt).toLocaleString()}</div>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: '-33px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: isCompleted ? 'var(--status-success)' : (!isPending ? 'var(--primary-color)' : 'var(--border-color)') }}></div>
          <div style={{ fontWeight: 500 }}>Under Review</div>
          <div className="text-small text-muted">{request.officerId ? 'Officer assigned' : 'Officer assignment pending'}</div>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: '-33px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: isCompleted ? 'var(--status-success)' : 'var(--border-color)' }}></div>
          <div style={{ fontWeight: 500 }}>{isCompleted ? 'Verified' : 'Pending Verification'}</div>
          <div className="text-small text-muted">{request.resolvedAt ? new Date(request.resolvedAt).toLocaleString() : 'Final status'}</div>
        </div>
      </div>
    </div>
  );
};

const GlobalUI = () => {
  const { user, toastMessage, toastType, activeModal, closeModal, showToast, login } = useAppContext();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [loginError, setLoginError] = useState(null);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // Reset register mode when modal opens/closes
  React.useEffect(() => {
    if (!activeModal) {
      setIsRegisterMode(false);
      setLoginError(null);
    }
  }, [activeModal]);

  // Local settings state
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  const handleRealLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);
    try {
      const email = e.target.elements.email.value;
      const password = e.target.elements.password.value;
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      setAuthToken(data.data.token);
      login(data.data.user);
      closeModal();
      showToast('Login successful!', 'success');
      
      const role = data.data.user.role;
      navigate(role === 'CITIZEN' ? '/portal' : '/dashboard');
    } catch (err) {
      setLoginError(err.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRealRegister = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);
    try {
      const name = e.target.elements.name.value;
      const email = e.target.elements.email.value;
      const password = e.target.elements.password.value;
      
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role: 'CITIZEN' }) // Force citizen
      });
      
      setAuthToken(data.data.token);
      login(data.data.user);
      closeModal();
      showToast('Registration successful!', 'success');
      navigate('/portal');
    } catch (err) {
      setLoginError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleServiceRequestSubmit = async (e) => {
    e.preventDefault();
    
    // Get form data
    const typeValue = e.target.elements.serviceType.value;
    const ulpin = e.target.elements.ulpin.value;
    const description = e.target.elements.description?.value || '';
    
    const typeMap = {
      'ror': 'UPDATE_ROR_DETAILS',
      'boundary': 'BOUNDARY_VERIFICATION',
      'registration': 'REGISTRATION_INFO',
      'landuse': 'LAND_USE_VERIFICATION',
      'tax': 'PROPERTY_TAX_ISSUE'
    };
    
    setIsSubmitting(true);

    try {
      // First, get the parcel ID for the ULPIN
      const parcelRes = await apiFetch(`/parcels/${ulpin.trim().toUpperCase()}`);
      if (!parcelRes.data.parcel) throw new Error('Parcel not found');
      
      const parcelId = parcelRes.data.parcel.id;
      
      await apiFetch('/requests', {
        method: 'POST',
        body: JSON.stringify({
          parcelId,
          type: typeMap[typeValue] || 'OTHER',
          description
        })
      });
      
      closeModal();
      showToast("Request submitted successfully.", "success");
      window.dispatchEvent(new Event('refreshRequests'));
    } catch (err) {
      showToast(err.message || 'Failed to submit request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (id, status, message) => {
    const statusMap = {
      'Verified': 'VERIFIED',
      'Pending Info': 'ACTION_REQUIRED',
      'Action Required': 'ACTION_REQUIRED'
    };
    
    setIsSubmitting(true);
    try {
      await apiFetch(`/officer/requests/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({
          status: statusMap[status] || 'PENDING',
          description: message
        })
      });
      showToast(message, status === 'Verified' ? 'success' : status === 'Action Required' ? 'error' : 'info');
      closeModal();
      window.dispatchEvent(new Event('refreshDashboard'));
    } catch (err) {
      showToast(err.message || 'Failed to update request status', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: toastType === 'success' ? 'var(--status-success-bg)' : toastType === 'error' ? 'var(--status-error-bg)' : 'var(--status-info-bg)',
          color: toastType === 'success' ? 'var(--status-success-text)' : toastType === 'error' ? 'var(--status-error-text)' : 'var(--status-info-text)',
          padding: '12px 24px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 9999,
          border: `1px solid ${toastType === 'success' ? 'var(--status-success)' : toastType === 'error' ? 'var(--status-error)' : 'var(--status-info)'}`
        }}>
          {toastType === 'success' ? <CheckCircle size={20} /> : toastType === 'error' ? <AlertTriangle size={20} /> : <Info size={20} />}
          <span style={{ fontWeight: 500 }}>{toastMessage}</span>
        </div>
      )}

      {/* Modal Overlay */}
      {activeModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9998, backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            backgroundColor: 'var(--surface-color)', borderRadius: 'var(--radius-xl)',
            width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: 'var(--shadow-xl)', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-color)', position: 'sticky', top: 0, zIndex: 10 }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
                {activeModal.type === 'serviceRequest' && 'Request Service'}
                {activeModal.type === 'requestDetails' && 'Request Details'}
                {activeModal.type === 'verification' && 'Review Verification'}
                {activeModal.type === 'systemDetails' && 'System Details'}
                {activeModal.type === 'settings' && 'Settings'}
                {activeModal.type === 'help' && 'Help & Support'}
                {activeModal.type === 'login' && (isRegisterMode ? `Register as Citizen` : `Login as ${activeModal.data?.role || 'User'}`)}
              </h2>
              <button onClick={closeModal} className="btn-ghost" style={{ padding: '8px', margin: '-8px', borderRadius: '50%' }} title="Close" aria-label="Close">
                <X size={20} />
              </button>
            </div>

            {/* Modal Content - Login/Register */}
            {activeModal.type === 'login' && (
              <form onSubmit={isRegisterMode ? handleRealRegister : handleRealLogin} style={{ padding: '24px' }}>
                {loginError && (
                  <div style={{ padding: '12px', backgroundColor: 'var(--status-error-bg)', color: 'var(--status-error)', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                    {loginError}
                  </div>
                )}
                {isRegisterMode && (
                  <div className="input-group">
                    <label className="input-label">Full Name</label>
                    <input type="text" name="name" className="input-field" required placeholder="Enter your full name" />
                  </div>
                )}
                <div className="input-group">
                  <label className="input-label">Email</label>
                  <input type="email" name="email" className="input-field" required defaultValue={!isRegisterMode ? (activeModal.data?.role === 'Citizen' ? 'ramesh@example.com' : 'desai@landstack.gov.in') : ''} placeholder="Enter your email" />
                </div>
                <div className="input-group">
                  <label className="input-label">Password</label>
                  <input type="password" name="password" className="input-field" required defaultValue={!isRegisterMode ? (activeModal.data?.role === 'Citizen' ? 'citizen123' : 'officer123') : ''} placeholder="Enter your password" />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px' }}>
                  {activeModal.data?.role === 'Citizen' ? (
                    <button type="button" className="btn-ghost" style={{ padding: 0 }} onClick={() => { setIsRegisterMode(!isRegisterMode); setLoginError(null); }}>
                      {isRegisterMode ? 'Already have an account? Login' : "Don't have an account? Register"}
                    </button>
                  ) : (
                    <div></div>
                  )}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" className="btn btn-outline" onClick={closeModal} disabled={isSubmitting}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? (isRegisterMode ? 'Registering...' : 'Logging in...') : (isRegisterMode ? 'Register' : 'Login')}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Modal Content - Service Request */}
            {activeModal.type === 'serviceRequest' && (
              <form onSubmit={handleServiceRequestSubmit} style={{ padding: '24px' }}>
                <div className="input-group">
                  <label className="input-label">Select Service Type</label>
                  <select name="serviceType" className="input-field" required>
                    <option value="">-- Select --</option>
                    <option value="ror">RoR Verification</option>
                    <option value="boundary">Boundary Verification</option>
                    <option value="registration">Registration Information</option>
                    <option value="landuse">Land Use Verification</option>
                    <option value="tax">Property Tax Issue</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">ULPIN</label>
                  <input type="text" name="ulpin" className="input-field" defaultValue={activeModal.data?.ulpin || ''} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Description</label>
                  <textarea className="input-field" rows="4" required></textarea>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                  <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            )}

            {/* Modal Content - Request Details Timeline */}
            {activeModal.type === 'requestDetails' && (
              <RequestDetailsModal data={activeModal.data} />
            )}

            {/* Modal Content - Registration History Timeline */}
            {activeModal.type === 'registrationHistory' && (
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ margin: '0 0 8px 0' }}>{activeModal.data?.title || 'Registration History'}</h3>
                  <div className="text-small text-muted">{activeModal.data?.ulpin}</div>
                </div>

                <div style={{ position: 'relative', paddingLeft: '24px', borderLeft: '2px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-33px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--status-success)' }}></div>
                    <div style={{ fontWeight: 500 }}>Initial Registration</div>
                    <div className="text-small text-muted">Oct 12, 2015</div>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-33px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--status-success)' }}></div>
                    <div style={{ fontWeight: 500 }}>Ownership Transfer</div>
                    <div className="text-small text-muted">Jan 05, 2019</div>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-33px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--status-success)' }}></div>
                    <div style={{ fontWeight: 500 }}>Mortgage Added</div>
                    <div className="text-small text-muted">Mar 22, 2021</div>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-33px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--status-success)' }}></div>
                    <div style={{ fontWeight: 500 }}>Verified Record</div>
                    <div className="text-small text-muted">Current State</div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Content - Officer Verification */}
            {activeModal.type === 'verification' && (
              <div style={{ padding: '24px' }}>
                <div style={{ backgroundColor: 'var(--bg-color)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0 }}>{activeModal.data?.ulpin}</h4>
                    {activeModal.data?.requestId && (
                      <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>ID: {activeModal.data.requestId.substring(0,8)}...</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="text-small text-muted">Type: {activeModal.data?.type || 'Verification'}</div>
                    {activeModal.data?.creatorName && (
                      <div className="text-small text-muted">Submitted by: <strong>{activeModal.data.creatorName}</strong></div>
                    )}
                  </div>
                </div>

                {activeModal.data?.description && (
                  <div style={{ marginBottom: '24px' }}>
                    <h5 style={{ margin: '0 0 8px 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Citizen Description</h5>
                    <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', lineHeight: '1.5', backgroundColor: 'var(--surface-color)' }}>
                      {activeModal.data.description}
                    </div>
                  </div>
                )}

                {activeModal.data?.hasAlert && (
                  <div style={{ padding: '12px', backgroundColor: 'var(--status-warning-bg)', color: 'var(--status-warning-text)', borderRadius: 'var(--radius-md)', marginBottom: '24px', display: 'flex', gap: '8px' }}>
                    <AlertTriangle size={16} />
                    <span className="text-small">AI Flag: Anomaly detected requiring manual override.</span>
                  </div>
                )}

                <div className="input-group">
                  <label className="input-label">Officer Remarks</label>
                  <textarea className="input-field" rows="3"></textarea>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleVerify(activeModal.data?.id, 'Verified', 'Record Verified Successfully')}>
                    Verify & Approve
                  </button>
                  <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleVerify(activeModal.data?.id, 'Pending Info', 'More Information Requested')}>
                    Request More Information
                  </button>
                  <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', color: 'var(--status-error)', borderColor: 'var(--status-error)' }} onClick={() => handleVerify(activeModal.data?.id, 'Action Required', 'Issue Flagged')}>
                    Flag Issue
                  </button>
                </div>
              </div>
            )}
            {/* Modal Content - Settings */}
            {activeModal.type === 'settings' && (
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Account Profile</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', fontSize: '1.25rem', fontWeight: 600 }}>
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{user?.name || 'User'}</div>
                      <div className="text-small text-muted">{user?.email || 'user@example.com'}</div>
                      <span className="badge badge-info" style={{ marginTop: '4px', display: 'inline-block' }}>{user?.role || 'Guest'}</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Preferences</h3>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>Email Notifications</div>
                      <div className="text-small text-muted">Receive alerts via email</div>
                    </div>
                    <div 
                      onClick={() => setEmailNotifs(!emailNotifs)} 
                      style={{ 
                        width: '44px', height: '24px', borderRadius: '12px', 
                        backgroundColor: emailNotifs ? 'var(--primary-color)' : 'var(--border-color)', 
                        position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s' 
                      }}>
                      <div style={{ 
                        width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white', 
                        position: 'absolute', top: '2px', left: emailNotifs ? '22px' : '2px', 
                        transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' 
                      }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>Push Notifications</div>
                      <div className="text-small text-muted">Receive in-app push alerts</div>
                    </div>
                    <div 
                      onClick={() => setPushNotifs(!pushNotifs)} 
                      style={{ 
                        width: '44px', height: '24px', borderRadius: '12px', 
                        backgroundColor: pushNotifs ? 'var(--primary-color)' : 'var(--border-color)', 
                        position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s' 
                      }}>
                      <div style={{ 
                        width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white', 
                        position: 'absolute', top: '2px', left: pushNotifs ? '22px' : '2px', 
                        transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' 
                      }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                  <button type="button" className="btn btn-primary" onClick={() => { showToast("Settings saved", "success"); closeModal(); }}>Save & Close</button>
                </div>
              </div>
            )}

            {/* Modal Content - Help & Support */}
            {activeModal.type === 'help' && (
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <p className="text-muted">Welcome to the LandStack support center. Here are some quick guides to help you navigate the system.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600, color: 'var(--primary-color)' }}>
                      <Map size={18} /> Land Explorer & Parcel Details
                    </div>
                    <div className="text-small">Navigate to the <strong>Land Explorer</strong> to search for a parcel using its 14-digit ULPIN. Clicking on a parcel will display its full details and registration history.</div>
                  </div>

                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600, color: 'var(--primary-color)' }}>
                      <FileText size={18} /> Service Requests
                    </div>
                    <div className="text-small">You can submit a new service request directly from a parcel's details page. Track the status of your submissions in the <strong>My Requests</strong> section.</div>
                  </div>

                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600, color: 'var(--primary-color)' }}>
                      <Info size={18} /> Notifications
                    </div>
                    <div className="text-small">Important updates from AI Alerts and Officer Assignments will appear in your top-right notifications bell.</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                  <h4 style={{ margin: '0 0 8px 0' }}>Contact Support</h4>
                  <p className="text-small text-muted" style={{ margin: 0 }}>For further assistance, please contact your designated LandStack administrator or IT support desk.</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                  <button className="btn btn-outline" onClick={closeModal}>Close</button>
                </div>
              </div>
            )}

            {/* Modal Content - System Details */}
            {activeModal.type === 'systemDetails' && (
              <SystemDetailsContent systemId={activeModal.data?.id} initialData={activeModal.data} closeModal={closeModal} />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalUI;
