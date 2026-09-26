import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ShieldCheck, Map, Users, ArrowRight, Database, Globe, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const LandingPage = () => {
  const { login, openModal } = useAppContext();
  const navigate = useNavigate();

  const handleLogin = (role) => {
    openModal('login', { role });
  };

  const handleExplore = () => {
    navigate('/explorer');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER */}
      <header className="topbar" style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', maxWidth: '1280px', margin: '0 auto', width: '100%', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Layers size={28} color="var(--primary-color)" />
            <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>LandStack</h1>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button className="btn btn-ghost" onClick={() => handleLogin('Citizen')}>Citizen Portal</button>
            <button className="btn btn-primary" onClick={() => handleLogin('Officer')}>Officer Login</button>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        
        {/* HERO SECTION */}
        <section style={{ width: '100%', padding: '80px 24px', display: 'flex', justifyContent: 'center', overflow: 'hidden', position: 'relative', backgroundColor: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)' }}>
          
          <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40%', height: '60%', background: 'radial-gradient(circle, var(--primary-light) 0%, transparent 70%)', zIndex: 0, opacity: 0.5 }}></div>
          <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '40%', height: '60%', background: 'radial-gradient(circle, var(--status-success-bg) 0%, transparent 70%)', zIndex: 0, opacity: 0.5 }}></div>

          <div style={{ maxWidth: '1280px', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '64px', alignItems: 'center', zIndex: 1 }}>
            
            {/* Left Content */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', backgroundColor: 'white', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '32px', boxShadow: 'var(--shadow-sm)' }}>
                <Globe size={16} color="var(--primary-color)" /> Next-Generation Land Governance
              </div>
              <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '24px', lineHeight: 1.1, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                One Parcel.<br/>One Identity.<br/><span style={{ color: 'var(--primary-color)' }}>Zero Friction.</span>
              </h1>
              <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '48px', lineHeight: 1.6, maxWidth: '500px' }}>
                Unified property records, registration, planning, and taxation under a single Unique Land Parcel Identification Number (ULPIN).
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1.125rem' }} onClick={handleExplore}>
                  Explore GIS Map <ArrowRight size={20} />
                </button>
                <button className="btn btn-outline" style={{ padding: '14px 28px', fontSize: '1.125rem', backgroundColor: 'white' }} onClick={() => handleLogin('Citizen')}>
                  Citizen Services
                </button>
              </div>
            </div>

            {/* Right Map Visualization */}
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', backgroundColor: '#e2e8f0', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color-dark)', overflow: 'hidden', boxShadow: 'var(--shadow-xl)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(var(--border-color) 1px, transparent 1px), linear-gradient(90deg, var(--border-color) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.5 }}></div>
              
              <svg width="120%" height="120%" style={{ position: 'absolute', transform: 'rotate(-5deg) scale(1.1)' }}>
                <polygon points="150,150 350,100 400,300 180,350" fill="var(--surface-color)" stroke="var(--border-color-dark)" strokeWidth="2" opacity="0.8" />
                <polygon points="350,100 550,150 500,400 400,300" fill="var(--surface-color)" stroke="var(--border-color-dark)" strokeWidth="2" opacity="0.8" />
                <polygon points="180,350 400,300 350,550 100,500" fill="var(--surface-color)" stroke="var(--border-color-dark)" strokeWidth="2" opacity="0.8" />
                
                {/* Highlighted Polygon */}
                <polygon points="400,300 500,400 450,550 350,550" fill="rgba(37, 99, 235, 0.15)" stroke="var(--primary-color)" strokeWidth="4" />
                
                <circle cx="425" cy="425" r="8" fill="var(--primary-color)" />
                <circle cx="425" cy="425" r="24" fill="rgba(37, 99, 235, 0.2)" />
              </svg>

              {/* Floating UI Elements */}
              <div style={{ position: 'absolute', top: '32px', right: '32px', backgroundColor: 'var(--surface-color)', padding: '16px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', width: '240px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--status-success)', borderRadius: '50%' }}></div>
                  <div className="text-small text-muted" style={{ fontWeight: 600, letterSpacing: '0.05em' }}>VERIFIED PARCEL</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '16px', fontFamily: 'monospace' }}>ULPIN-MH-000131</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                    <span className="text-small text-muted">Owner</span>
                    <span className="text-small" style={{ fontWeight: 600 }}>R. Sharma</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                    <span className="text-small text-muted">Zoning</span>
                    <span className="text-small text-info" style={{ fontWeight: 600 }}>Residential</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{ width: '100%', padding: '96px 24px', backgroundColor: 'var(--bg-color)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ maxWidth: '1280px', width: '100%' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px' }}>How LandStack Works</h2>
              <p className="text-muted" style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>A unified approach to land governance, bridging the gap between citizens, officers, and spatial data.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
              
              <div className="card hover-elevate" style={{ border: 'none', backgroundColor: 'var(--surface-color)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: 'var(--primary-color)' }}></div>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary-light)', marginBottom: '16px', lineHeight: 1 }}>01</div>
                <h3 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><Map color="var(--primary-color)" /> Identify</h3>
                <p className="text-muted">Every land parcel is assigned a 14-digit alphanumeric Unique Land Parcel Identification Number (ULPIN), linking spatial data with textual records natively.</p>
              </div>

              <div className="card hover-elevate" style={{ border: 'none', backgroundColor: 'var(--surface-color)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: 'var(--primary-color)' }}></div>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary-light)', marginBottom: '16px', lineHeight: 1 }}>02</div>
                <h3 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><Database color="var(--primary-color)" /> Connect</h3>
                <p className="text-muted">Disparate state departments—revenue, registration, and municipal corporations—synchronize their data via secure APIs to maintain a single source of truth.</p>
              </div>

              <div className="card hover-elevate" style={{ border: 'none', backgroundColor: 'var(--surface-color)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: 'var(--primary-color)' }}></div>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary-light)', marginBottom: '16px', lineHeight: 1 }}>03</div>
                <h3 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldCheck color="var(--primary-color)" /> Verify</h3>
                <p className="text-muted">Officers utilize AI-driven discrepancy flags and spatial analysis tools to verify ownership and resolve disputes with confidence.</p>
              </div>

              <div className="card hover-elevate" style={{ border: 'none', backgroundColor: 'var(--surface-color)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: 'var(--primary-color)' }}></div>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary-light)', marginBottom: '16px', lineHeight: 1 }}>04</div>
                <h3 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><Users color="var(--primary-color)" /> Serve</h3>
                <p className="text-muted">Citizens access frictionless services—from downloading encumbrance certificates to raising service requests—all from a unified portal.</p>
              </div>

            </div>
          </div>
        </section>

      </main>

      <footer style={{ padding: '40px 24px', backgroundColor: 'var(--surface-color)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: '1280px', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={24} color="var(--primary-color)" />
            <span style={{ fontWeight: 600 }}>LandStack Demo</span>
          </div>
          <div className="text-small text-muted">
            Internal UI Prototype • Mock Data Enabled
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
