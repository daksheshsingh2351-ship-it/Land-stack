import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Map as MapIcon, Layers as LayersIcon, Search, FileText,
  ChevronRight, Download, Clock, X, CheckCircle, ShieldCheck,
  MapPin, BookOpen, MousePointer, Home
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import ParcelMap from '../components/Map/ParcelMap';
import { apiFetch } from '../api';

const LOCATION_DATA = {
  states: ['MH', 'KA'],
  districts: {
    'MH': ['Mumbai', 'Pune', 'Nagpur', 'Thane'],
    'KA': ['Bangalore', 'Mysore', 'Hubli']
  },
  talukas: {
    'Mumbai': ['Andheri', 'Borivali', 'Kurla'],
    'Pune': ['Haveli', 'Shirur', 'Baramati'],
    'Bangalore': ['North', 'South', 'East']
  },
  villages: {
    'Andheri': ['Versova', 'Marol', 'Juhu'],
    'Haveli': ['Hinjewadi', 'Kharadi', 'Wagholi']
  }
};

// ─── Search tab IDs ───────────────────────────────────────────────
const TABS = [
  { id: 'ulpin',    label: 'By ULPIN',      icon: Search },
  { id: 'location', label: 'By Location',   icon: MapPin },
  { id: 'record',   label: 'Land Record',   icon: BookOpen },
  { id: 'map',      label: 'Find on Map',   icon: MousePointer },
  { id: 'mine',     label: 'My Properties', icon: Home },
];

// ─── Result list shared by multiple tabs ──────────────────────────
const ParcelResultList = ({ results, onSelect, onClear }) => {
  if (!results) return null;
  if (results.length === 0) return (
    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-tertiary)', animation: 'slideUp 0.2s ease' }}>
      <MapIcon size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
      <div style={{ fontWeight: 500 }}>No parcel found</div>
      <button className="btn btn-ghost" style={{ marginTop: '8px', fontSize: '0.875rem' }} onClick={onClear}>Clear &amp; try again</button>
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px', animation: 'slideUp 0.2s ease' }}>
      {results.map(p => (
        <div
          key={p.ulpin}
          className="hover-row"
          onClick={() => onSelect(p.ulpin)}
          style={{ padding: '12px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', cursor: 'pointer', backgroundColor: 'var(--surface-color)' }}
        >
          <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '2px' }}>{p.ulpin}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{p.plotNo || p.plotNumber} · {p.location?.split('(')[0].trim()}</div>
          <div style={{ marginTop: '6px' }}>
            <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{p.planning?.landUse || 'Residential'}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Tab panels ───────────────────────────────────────────────────

// 1. ULPIN
const UlpinTab = ({ onSelect, showToast }) => {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/parcels/${q.trim().toUpperCase()}`);
      if (res.data.parcel) {
        onSelect(res.data.parcel.ulpin);
        setQ('');
      }
    } catch (err) {
      showToast('No parcel found', 'error');
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <p className="text-small text-muted">Enter the 14-digit ULPIN for direct lookup.</p>
      <div style={{ position: 'relative' }}>
        <input
          type="text" className="input-field"
          placeholder="e.g. ULPIN-MH-000131"
          value={q} onChange={e => setQ(e.target.value)}
          style={{ width: '100%', paddingRight: q ? '36px' : '12px' }}
        />
        {q && (
          <button type="button" className="btn-ghost" onClick={() => setQ('')}
            style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', padding: '4px' }}
            title="Clear" aria-label="Clear"><X size={14} /></button>
        )}
      </div>
      <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
        <Search size={15} /> {loading ? 'Locating...' : 'Locate Parcel'}
      </button>
    </form>
  );
};

// 2. Location
const LocationTab = ({ onSelect, showToast }) => {
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [taluka, setTaluka] = useState('');
  const [village, setVillage] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const districts = state ? (LOCATION_DATA.districts[state] || []) : [];
  const talukas  = district ? (LOCATION_DATA.talukas[district] || []) : [];
  const villages = taluka ? (LOCATION_DATA.villages[taluka] || []) : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!state && !district && !taluka && !village) { showToast('Please select at least one location field', 'error'); return; }
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (district) params.append('district', district);
      if (taluka) params.append('taluka', taluka);
      if (village) params.append('village', village);
      
      const response = await apiFetch(`/parcels?${params.toString()}`);
      
      const mapped = response.data.parcels.map(p => ({
        ulpin: p.ulpin,
        plotNo: p.plotNumber,
        plotNumber: p.plotNumber,
        location: p.location,
        planning: { landUse: p.landUse }
      }));
      setResults(mapped);
      if (mapped.length === 0) showToast('No parcels found for this location', 'error');
    } catch (err) {
      showToast('Failed to fetch parcels', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => { setState(''); setDistrict(''); setTaluka(''); setVillage(''); setResults(null); };

  const sel = (val, setter, clearers = []) => { setter(val); clearers.forEach(c => c('')); setResults(null); };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <p className="text-small text-muted">Select location to find parcels in that area.</p>
      <select className="input-field" value={state} onChange={e => sel(e.target.value, setState, [setDistrict, setTaluka, setVillage])}>
        <option value="">— State —</option>
        {LOCATION_DATA.states.map(s => <option key={s}>{s}</option>)}
      </select>
      <select className="input-field" value={district} onChange={e => sel(e.target.value, setDistrict, [setTaluka, setVillage])} disabled={!state}>
        <option value="">— District —</option>
        {districts.map(d => <option key={d}>{d}</option>)}
      </select>
      <select className="input-field" value={taluka} onChange={e => sel(e.target.value, setTaluka, [setVillage])} disabled={!district}>
        <option value="">— Taluka / Tehsil —</option>
        {talukas.map(t => <option key={t}>{t}</option>)}
      </select>
      <select className="input-field" value={village} onChange={e => { setVillage(e.target.value); setResults(null); }} disabled={!taluka}>
        <option value="">— Village / Locality —</option>
        {villages.map(v => <option key={v}>{v}</option>)}
      </select>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
          <Search size={15} /> {loading ? 'Searching...' : 'Search'}
        </button>
        <button type="button" className="btn btn-outline" onClick={handleClear} title="Clear">
          <X size={15} />
        </button>
      </div>
      <ParcelResultList results={results} onSelect={ulpin => { onSelect(ulpin); setResults(null); }} onClear={handleClear} />
    </form>
  );
};

// 3. Land Record
const LandRecordTab = ({ onSelect, showToast }) => {
  const [plotNo, setPlotNo]       = useState('');
  const [surveyNo, setSurveyNo]   = useState('');
  const [gatNum, setGatNum]       = useState('');
  const [khata, setKhata]         = useState('');
  const [results, setResults]     = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!plotNo && !surveyNo && !gatNum && !khata) { showToast('Enter at least one land record field', 'error'); return; }
    
    try {
      const params = new URLSearchParams();
      if (plotNo) params.append('plotNumber', plotNo);
      if (surveyNo) params.append('surveyNo', surveyNo);
      if (gatNum) params.append('gatNumber', gatNum);
      if (khata) params.append('khataNumber', khata);
      
      const response = await apiFetch(`/parcels?${params.toString()}`);
      
      const mapped = response.data.parcels.map(p => ({
        ulpin: p.ulpin,
        plotNo: p.plotNumber,
        plotNumber: p.plotNumber,
        location: p.location,
        planning: { landUse: p.landUse }
      }));
      setResults(mapped);
      if (mapped.length === 0) showToast('No parcel found for this land record', 'error');
    } catch (err) {
      showToast('Search failed', 'error');
    }
  };

  const handleClear = () => { setPlotNo(''); setSurveyNo(''); setGatNum(''); setKhata(''); setResults(null); };

  const Field = ({ label, val, set, ph }) => (
    <div>
      <label className="input-label">{label}</label>
      <input type="text" className="input-field" placeholder={ph}
        value={val} onChange={e => { set(e.target.value); setResults(null); }}
        style={{ width: '100%' }} />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <p className="text-small text-muted">Enter any one or more known land record identifiers.</p>
      <Field label="Plot Number" val={plotNo} set={setPlotNo} ph="e.g. Plot 42 or P-42" />
      <Field label="Survey Number" val={surveyNo} set={setSurveyNo} ph="e.g. SUR-31" />
      <Field label="Gat Number" val={gatNum} set={setGatNum} ph="e.g. GAT-1031" />
      <Field label="Khata / Khasra" val={khata} set={setKhata} ph="e.g. KH-101" />
      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
          <Search size={15} /> Find Parcel
        </button>
        <button type="button" className="btn btn-outline" onClick={handleClear} title="Clear">
          <X size={15} />
        </button>
      </div>
      <ParcelResultList results={results} onSelect={ulpin => { onSelect(ulpin); setResults(null); }} onClear={handleClear} />
    </form>
  );
};

// 4. Find on Map
const FindOnMapTab = ({ showToast }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <div style={{ padding: '14px', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '8px', color: 'var(--primary-color)' }}>
        <MousePointer size={16} /> Interactive Map Mode
      </div>
      <p className="text-small text-muted" style={{ lineHeight: 1.6, margin: 0 }}>
        The map is already interactive. <strong>Click any coloured parcel</strong> on the map to select it and view its full details in the right panel.
      </p>
    </div>
    <div style={{ padding: '12px', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
      <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '8px' }}>Tips</div>
      <ul className="text-small text-muted" style={{ paddingLeft: '16px', lineHeight: 2, margin: 0 }}>
        <li>Scroll to zoom in on the map</li>
        <li>Click a parcel to view its details</li>
        <li>Switch layers in the panel below</li>
        <li>Use <strong>Land Use / Zoning</strong> to see colour-coded parcels</li>
      </ul>
    </div>
    <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}
      onClick={() => showToast('Click any parcel on the map to select it', 'info')}>
      <MousePointer size={15} /> Click a Parcel on the Map
    </button>
  </div>
);

const MyPropertiesTab = ({ onSelect, showToast }) => {
  const { user } = useAppContext();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyProperties = async () => {
      try {
        const response = await apiFetch('/parcels');
        // Filter properties where the user is an owner
        const myProps = response.data.parcels.filter(p => 
          p.ownerships?.some(o => o.ownerName?.toLowerCase() === user?.name?.toLowerCase())
        );
        setProperties(myProps);
      } catch (err) {
        showToast('Failed to load your properties', 'error');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchMyProperties();
    else setLoading(false);
  }, [user, showToast]);

  if (loading) return <div style={{ padding: '24px', textAlign: 'center' }}>Loading your properties...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <p className="text-small text-muted">Properties linked to your account.</p>
      {properties.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)' }}>No properties found linked to your account.</div>
      ) : properties.map(p => (
        <div
          key={p.ulpin}
          className="hover-row"
          onClick={() => onSelect(p.ulpin)}
          style={{ padding: '14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', cursor: 'pointer', backgroundColor: 'var(--surface-color)', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', backgroundColor: 'var(--primary-color)' }} />
          <div style={{ paddingLeft: '8px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '2px' }}>{p.ulpin}</div>
            <div className="text-small text-muted">{p.plotNumber}</div>
            <div className="text-small text-muted">{p.location?.split('(')[0].trim()}</div>
            <div style={{ marginTop: '6px', display: 'flex', gap: '6px' }}>
              <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>My Property</span>
              <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{p.landUse || 'Residential'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────
const LandExplorer = () => {
  const { selectedUlpin, setSelectedUlpin, openModal, showToast } = useAppContext();
  const navigate = useNavigate();
  
  const [activeLayer, setActiveLayer] = useState('cadastral');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [searchTab, setSearchTab] = useState('ulpin');

  useEffect(() => {
    const fetchParcel = async () => {
      if (!selectedUlpin) {
        setSelectedDetails(null);
        return;
      }
      try {
        const response = await apiFetch(`/parcels/${selectedUlpin}`);
        const p = response.data.parcel;
        setSelectedDetails({
          ulpin: p.ulpin,
          plotNo: p.plotNumber,
          plotNumber: p.plotNumber,
          area: p.area,
          areaUnit: p.areaUnit,
          location: p.location,
          planning: {
            landUse: p.landUse,
            zoning: p.zoning,
            buildingPermission: p.buildingPermission
          },
          financial: {
            propertyTaxStatus: p.propertyTaxStatus
          },
          utilities: {
            water: p.water
          },
          ownership: p.ownerships?.[0] ? {
            ownerName: p.ownerships[0].ownerName,
            ownershipType: p.ownerships[0].ownershipType,
            verificationStatus: p.ownerships[0].verificationStatus || 'Verified',
            rorStatus: p.ownerships[0].rorStatus
          } : null
        });
      } catch (err) {
        setSelectedDetails(null);
        showToast('Failed to fetch parcel details', 'error');
      }
    };
    fetchParcel();
  }, [selectedUlpin]);

  // Original ULPIN search kept intact for backward compat (used by CitizenPortal "View Details" flow)
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const response = await apiFetch(`/parcels/${searchQuery.trim().toUpperCase()}`);
      if (response.data.parcel) {
        setSelectedUlpin(response.data.parcel.ulpin);
        setActiveTab('Overview');
      }
    } catch (err) {
      showToast('No parcel found', 'error');
    }
  };

  const handleClear = () => {
    setSelectedUlpin(null);
    setSearchQuery('');
  };

  const handleSelectParcel = (ulpin) => {
    setSelectedUlpin(ulpin);
    setActiveTab('Overview');
  };

  const renderTabContent = () => {
    if (!selectedDetails) return null;

    switch(activeTab) {
      case 'Overview':
        return (
          <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h4 style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Identity</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', backgroundColor: 'var(--border-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--surface-color)' }}>
                  <span className="text-muted">ULPIN</span>
                  <span style={{ fontWeight: 600 }}>{selectedDetails.ulpin}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--surface-color)' }}>
                  <span className="text-muted">Plot Number</span>
                  <span style={{ fontWeight: 500 }}>{selectedDetails.plotNo || selectedDetails.plotNumber || 'Plot 42'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--surface-color)' }}>
                  <span className="text-muted">Area</span>
                  <span style={{ fontWeight: 500 }}>{selectedDetails.area} {selectedDetails.areaUnit}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--surface-color)' }}>
                  <span className="text-muted">Location</span>
                  <span style={{ fontWeight: 500, textAlign: 'right' }}>{selectedDetails.location}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Planning & Zoning</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', backgroundColor: 'var(--border-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--surface-color)' }}>
                  <span className="text-muted">Land Use</span>
                  <span style={{ fontWeight: 500 }}>{selectedDetails.planning?.landUse || 'Residential'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--surface-color)' }}>
                  <span className="text-muted">Zoning</span>
                  <span className="badge badge-info">{selectedDetails.planning?.zoning || 'Residential Zone A'}</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Ownership':
        return (
          <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h4 style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Current Owner</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', backgroundColor: 'var(--border-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--surface-color)' }}>
                  <span className="text-muted">Name</span>
                  <span style={{ fontWeight: 600 }}>{selectedDetails.ownership?.ownerName || 'Owner'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--surface-color)' }}>
                  <span className="text-muted">Ownership Type</span>
                  <span style={{ fontWeight: 500 }}>Individual</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--surface-color)' }}>
                  <span className="text-muted">RoR Status</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--status-success)' }}>
                    <ShieldCheck size={16} /> {selectedDetails.ownership?.verificationStatus || 'Verified'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Services':
        return (
          <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
             <div>
              <h4 style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Active Services</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', backgroundColor: 'var(--border-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--surface-color)' }}>
                  <span className="text-muted">Property Tax</span>
                  <span className="badge badge-success">{selectedDetails.financial?.propertyTaxStatus || 'Paid (2025-26)'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--surface-color)' }}>
                  <span className="text-muted">Water Connection</span>
                  <span className="badge badge-success">{selectedDetails.utilities?.water || 'Active'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--surface-color)' }}>
                  <span className="text-muted">Building Permission</span>
                  <span className={`badge ${selectedDetails.planning?.buildingPermission === 'Approved' ? 'badge-success' : 'badge-warning'}`}>
                    {selectedDetails.planning?.buildingPermission || 'Pending Review'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="tab-content" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Data for {activeTab} is currently being synced from the departmental API.
          </div>
        );
    }
  };

  return (
    <div className="map-container">
      {/* ── Left Sidebar ── */}
      <div className="map-sidebar">

        {/* ── Find Your Land ── */}
        <div style={{ padding: '20px 20px 0 20px', backgroundColor: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
            <MapIcon size={20} color="var(--primary-color)" /> Find Your Land
          </h2>

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '0', marginBottom: '-1px', position: 'relative', zIndex: 2 }}>
            {TABS.map(t => {
              const Icon = t.icon;
              const active = searchTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSearchTab(t.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                    padding: '8px 10px', border: 'none', borderBottom: active ? '2px solid var(--primary-color)' : '2px solid transparent',
                    backgroundColor: active ? 'var(--primary-light)' : 'transparent',
                    color: active ? 'var(--primary-color)' : 'var(--text-secondary)',
                    cursor: 'pointer', borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                    fontWeight: active ? 600 : 400, fontSize: '0.72rem', whiteSpace: 'nowrap',
                    transition: 'all 0.2s', flexShrink: 0,
                  }}
                  title={t.label}
                >
                  <Icon size={15} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--surface-color)', maxHeight: '420px', overflowY: 'auto' }}>
          {searchTab === 'ulpin' && <UlpinTab onSelect={handleSelectParcel} showToast={showToast} />}
          {searchTab === 'location' && <LocationTab onSelect={handleSelectParcel} showToast={showToast} />}
          {searchTab === 'record' && <LandRecordTab onSelect={handleSelectParcel} showToast={showToast} />}
          {searchTab === 'map' && <FindOnMapTab showToast={showToast} />}
          {searchTab === 'mine' && <MyPropertiesTab onSelect={handleSelectParcel} />}
        </div>

        {/* ── Base Layers ── */}
        <div style={{ padding: '20px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-color)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '1rem', color: 'var(--text-secondary)' }}>
            <LayersIcon size={18} /> Base Layers
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', transition: 'border-color 0.2s' }}>
              <input type="radio" name="layerGroup" checked={activeLayer === 'cadastral'} onChange={() => setActiveLayer('cadastral')} style={{ width: '18px', height: '18px' }} />
              <span style={{ fontWeight: 500 }}>Cadastral Boundaries</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', transition: 'border-color 0.2s' }}>
              <input type="radio" name="layerGroup" checked={activeLayer === 'landUse'} onChange={() => setActiveLayer('landUse')} style={{ width: '18px', height: '18px' }} />
              <span style={{ fontWeight: 500 }}>Land Use / Zoning</span>
            </label>
          </div>
          
          {activeLayer === 'landUse' && (
            <div style={{ padding: '16px', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', animation: 'slideUp 0.3s ease' }}>
              <h4 style={{ marginBottom: '16px', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)' }}>Legend</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: "Residential", color: "#60a5fa" },
                  { label: "Commercial", color: "#fbbf24" },
                  { label: "Agricultural", color: "#34d399" },
                  { label: "Industrial", color: "#a78bfa" }
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '16px', height: '16px', backgroundColor: item.color, borderRadius: '4px', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)' }}></div>
                    <span className="text-small" style={{ fontWeight: 500 }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: '24px' }}>
            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={handleClear}>
              Reset Map View
            </button>
          </div>
        </div>
      </div>

      {/* ── Map ── */}
      <div className="map-view">
        <ParcelMap 
          selectedUlpin={selectedUlpin} 
          onSelectParcel={(ulpin) => {
            setSelectedUlpin(ulpin);
            setActiveTab('Overview');
          }} 
          activeLayer={activeLayer}
        />
      </div>

      {/* ── Right Parcel Details Panel ── */}
      {selectedUlpin && selectedDetails ? (
        <div className="map-panel-right drawer-open">
          
          {/* Header */}
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--surface-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div className="text-small" style={{ color: 'var(--status-success)', fontWeight: 600, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} /> CERTIFIED RECORD
              </div>
              <button onClick={handleClear} className="btn-ghost" style={{ padding: '4px', margin: '-4px -4px 0 0' }} title="Close panel" aria-label="Close panel">
                <X size={20} />
              </button>
            </div>
            
            <h2 style={{ fontSize: '1.5rem', margin: '0 0 8px 0', wordBreak: 'break-all', fontFamily: 'monospace' }}>
              {selectedDetails.ulpin}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <MapIcon size={16} /> <span style={{ fontWeight: 500 }}>{selectedDetails.location}</span>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ padding: '0 24px', backgroundColor: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)' }}>
            <div className="tabs-container" style={{ display: 'flex', gap: '24px' }}>
              {['Overview', 'Ownership', 'Services'].map(tab => (
                <div 
                  key={tab} 
                  className={`tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                  style={{ padding: '16px 0' }}
                >
                  {tab}
                </div>
              ))}
            </div>
          </div>

          {/* Scrollable Content */}
          <div style={{ padding: '24px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-color)' }}>
            {renderTabContent()}
          </div>

          {/* Sticky Actions */}
          <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--surface-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-outline" style={{ flex: 1, padding: '12px' }} onClick={() => openModal('registrationHistory', { title: 'Registration History', ulpin: selectedDetails.ulpin, status: 'Completed' })}>
                <Clock size={18} /> History
              </button>
              <button className="btn btn-primary" style={{ flex: 1, padding: '12px' }} onClick={() => showToast("Summary report downloading...", "success")}>
                <Download size={18} /> Export
              </button>
            </div>
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => openModal('serviceRequest', { ulpin: selectedDetails.ulpin })}>
              Request Service
            </button>
          </div>
        </div>
      ) : (
        <div className="map-panel-right" style={{ pointerEvents: 'none', justifyContent: 'center', alignItems: 'center', padding: '32px', textAlign: 'center', backgroundColor: 'var(--bg-color)' }}>
          <MapIcon size={48} color="var(--border-color-dark)" style={{ marginBottom: '24px' }} />
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>No Parcel Selected</h3>
          <p className="text-muted" style={{ lineHeight: 1.6 }}>Select a parcel on the map or use one of the search methods on the left to view certified details.</p>
        </div>
      )}

      <style>{`
        .drawer-open {
          animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .tab-content { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LandExplorer;
