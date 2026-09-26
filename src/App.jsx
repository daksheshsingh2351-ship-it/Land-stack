import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

import MainLayout from './components/Layout/MainLayout';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import CitizenPortal from './pages/CitizenPortal';
import OfficerDashboard from './pages/OfficerDashboard';
import LandExplorer from './pages/LandExplorer';
import ParcelDetails from './pages/ParcelDetails';
import MyRequests from './pages/MyRequests';
import AILandIntelligence from './pages/AILandIntelligence';
import ConnectedSystems from './pages/ConnectedSystems';
import GlobalUI from './components/UI/GlobalUI';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <GlobalUI />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          <Route element={<MainLayout />}>
            <Route element={<ProtectedRoute allowedRoles={['CITIZEN', 'OFFICER', 'ADMIN']} />}>
              <Route path="/explorer" element={<LandExplorer />} />
              <Route path="/parcel/:ulpin" element={<ParcelDetails />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['CITIZEN']} />}>
              <Route path="/portal" element={<CitizenPortal />} />
              <Route path="/requests" element={<MyRequests />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['OFFICER', 'ADMIN']} />}>
              <Route path="/dashboard" element={<OfficerDashboard />} />
              <Route path="/intelligence" element={<AILandIntelligence />} />
              <Route path="/systems" element={<ConnectedSystems />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
