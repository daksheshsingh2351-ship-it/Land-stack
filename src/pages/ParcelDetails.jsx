import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, FileText, Download, Clock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { apiFetch } from '../api';

const ParcelDetails = () => {
  const { ulpin } = useParams();
  const navigate = useNavigate();
  const { showToast, openModal } = useAppContext();
  
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParcel = async () => {
      try {
        const res = await apiFetch(`/parcels/${ulpin.toUpperCase()}`);
        
        // Map backend response to the frontend's expected format
        const p = res.data.parcel;
        const currentOwnership = p.ownerships?.find(o => o.isCurrent) || {};
        
        setDetails({
          ulpin: p.ulpin,
          plotNumber: p.plotNumber,
          area: p.area,
          areaUnit: p.areaUnit,
          location: p.location,
          lastUpdated: new Date(p.updatedAt).toISOString().split('T')[0],
          
          ownership: {
            ownerName: currentOwnership.ownerName || 'Unknown',
            ownershipStatus: currentOwnership.ownershipStatus || 'Unknown',
            rorStatus: currentOwnership.rorStatus || 'Unknown'
          },
          registration: {
            status: p.registrationStatus || 'Unknown',
            lastTransactionDate: p.lastTransactionDate ? new Date(p.lastTransactionDate).toISOString().split('T')[0] : 'N/A',
            transactionType: p.lastTransactionType || 'N/A',
            documentId: `DOC-${p.id.substring(0,8)}`
          },
          planning: {
            landUse: p.landUse || 'Unknown',
            zoning: p.zoning || 'Unknown',
            buildingPermission: p.buildingPermission || 'Unknown',
            developmentRestrictions: p.developmentRestrictions || 'None'
          },
          financial: {
            propertyTaxStatus: p.propertyTaxStatus || 'Unknown',
            outstandingAmount: p.outstandingAmount || '₹0'
          },
          encumbrance: {
            status: p.encumbranceStatus || 'Unknown',
            mortgage: p.mortgage || 'None'
          },
          utilities: {
            electricity: p.electricity || 'Unknown',
            water: p.water || 'Unknown',
            roadAccess: p.roadAccess || 'Unknown'
          }
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchParcel();
  }, [ulpin]);

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>Loading parcel details...</div>;
  }

  if (!details) {
    return (
      <div style={{ padding: '24px' }}>
        <h2>Parcel Not Found</h2>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const handleDownload = () => {
    showToast("Summary report downloading...", "success");
  };

  const handleServiceRequest = () => {
    openModal('serviceRequest', { ulpin });
  };

  const handleRegistrationHistory = () => {
    // Open a timeline modal simulating history
    openModal('registrationHistory', { 
      title: 'Registration History', 
      ulpin: details.ulpin,
      status: 'Completed' 
    });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', paddingBottom: '64px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="btn btn-ghost" style={{ padding: '8px' }} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ margin: 0 }}>Parcel Details</h1>
      </div>

      <div className="card" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px', padding: '32px' }}>
        <div>
          <div className="text-small text-muted" style={{ marginBottom: '8px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Unique Land Parcel ID (ULPIN)</div>
          <h2 style={{ fontSize: '2rem', margin: 0, fontFamily: 'monospace', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>{details.ulpin}</h2>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="badge badge-success" style={{ fontSize: '0.875rem', padding: '6px 16px', display: 'flex', alignItems: 'center', height: '40px' }}>
            <CheckCircle size={16} style={{ marginRight: '8px' }} /> Verified Record
          </span>
          <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border-color)', margin: '0 8px' }}></div>
          <button className="btn btn-outline" onClick={handleDownload} title="Download Report">
            <Download size={16} /> 
          </button>
          <button className="btn btn-outline" onClick={handleRegistrationHistory}>
            <Clock size={16} /> History
          </button>
          <button className="btn btn-primary" onClick={handleServiceRequest}>
            Request Service
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Overview */}
        <div className="card hover-elevate">
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Parcel Overview</h3>
          <div className="data-row">
            <span className="data-label">Plot Number</span>
            <span className="data-value">{details.plotNumber}</span>
          </div>
          <div className="data-row">
            <span className="data-label">Area</span>
            <span className="data-value">{details.area} {details.areaUnit}</span>
          </div>
          <div className="data-row">
            <span className="data-label">Location</span>
            <span className="data-value" style={{ textAlign: 'right', maxWidth: '60%' }}>{details.location}</span>
          </div>
          <div className="data-row">
            <span className="data-label">Last Updated</span>
            <span className="data-value">{details.lastUpdated}</span>
          </div>
        </div>

        {/* Ownership & RoR */}
        <div className="card hover-elevate">
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Ownership (RoR)</h3>
          <div className="data-row">
            <span className="data-label">Owner Name</span>
            <span className="data-value">{details.ownership.ownerName}</span>
          </div>
          <div className="data-row">
            <span className="data-label">Title Status</span>
            <span className="data-value">
              <span className={`badge ${details.ownership.ownershipStatus === 'Clear Title' ? 'badge-success' : 'badge-error'}`}>
                {details.ownership.ownershipStatus}
              </span>
            </span>
          </div>
          <div className="data-row">
            <span className="data-label">RoR Status</span>
            <span className="data-value">{details.ownership.rorStatus}</span>
          </div>
        </div>

        {/* Registration */}
        <div className="card hover-elevate">
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Registration Info</h3>
          <div className="data-row">
            <span className="data-label">Status</span>
            <span className="data-value">{details.registration.status}</span>
          </div>
          <div className="data-row">
            <span className="data-label">Last Transaction</span>
            <span className="data-value">{details.registration.transactionType} ({details.registration.lastTransactionDate})</span>
          </div>
          <div className="data-row">
            <span className="data-label">Document ID</span>
            <span className="data-value" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', cursor: 'pointer' }}>
              <FileText size={16} /> {details.registration.documentId}
            </span>
          </div>
        </div>

        {/* Planning & Zoning */}
        <div className="card hover-elevate">
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Planning & Zoning</h3>
          <div className="data-row">
            <span className="data-label">Land Use</span>
            <span className="badge badge-info">{details.planning.landUse}</span>
          </div>
          <div className="data-row">
            <span className="data-label">Zoning Code</span>
            <span className="data-value">{details.planning.zoning}</span>
          </div>
          <div className="data-row">
            <span className="data-label">Building Permission</span>
            <span className="data-value">{details.planning.buildingPermission}</span>
          </div>
          <div className="data-row">
            <span className="data-label">Restrictions</span>
            <span className="data-value">{details.planning.developmentRestrictions}</span>
          </div>
        </div>

        {/* Financial & Utilities */}
        <div className="card hover-elevate">
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Financial & Encumbrance</h3>
          <div className="data-row">
            <span className="data-label">Property Tax</span>
            <span className={`badge ${details.financial.propertyTaxStatus.includes('Paid') ? 'badge-success' : 'badge-warning'}`}>
              {details.financial.propertyTaxStatus}
            </span>
          </div>
          <div className="data-row">
            <span className="data-label">Outstanding Dues</span>
            <span className={details.financial.outstandingAmount === '₹0' ? 'data-value text-muted' : 'data-value text-error'}>{details.financial.outstandingAmount}</span>
          </div>
          <div className="data-row">
            <span className="data-label">Encumbrance</span>
            <span className="data-value">{details.encumbrance.status}</span>
          </div>
          <div className="data-row">
            <span className="data-label">Mortgage Detail</span>
            <span className="data-value">{details.encumbrance.mortgage}</span>
          </div>
        </div>

        {/* Utilities */}
        <div className="card hover-elevate">
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Utilities Connection</h3>
          <div className="data-row">
            <span className="data-label">Electricity</span>
            <span className="data-value">{details.utilities.electricity}</span>
          </div>
          <div className="data-row">
            <span className="data-label">Water</span>
            <span className="data-value">{details.utilities.water}</span>
          </div>
          <div className="data-row">
            <span className="data-label">Road Access</span>
            <span className="data-value">{details.utilities.roadAccess}</span>
          </div>
        </div>

      </div>

      <style>{`
        .hover-elevate {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .hover-elevate:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .text-error {
          color: var(--status-error);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default ParcelDetails;
