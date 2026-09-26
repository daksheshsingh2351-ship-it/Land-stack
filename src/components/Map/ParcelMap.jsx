import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { parcelGeoJSON, mapCenter } from '../../data/geoJsonData';

const LAND_USE_COLORS = {
  "Residential": "#60a5fa", // Blue
  "Commercial": "#fbbf24", // Yellow/Orange
  "Agricultural": "#34d399", // Green
  "Industrial": "#a78bfa", // Purple
  "Public / Institutional": "#f87171" // Red
};

const ZONING_COLORS = {
  "R1 - Residential Zone": "#bfdbfe",
  "C1 - Commercial Zone": "#fef08a",
  "A1 - Agricultural Zone": "#a7f3d0",
  "I1 - Industrial Zone": "#ddd6fe",
  "P1 - Public Zone": "#fecaca"
};

const getFeatureStyle = (feature, selectedUlpin, activeLayer) => {
  const isSelected = feature.properties.ulpin === selectedUlpin;
  const isAlert = feature.properties.status === 'alert';
  
  // Default fill color
  let fillColor = '#e5e7eb'; // Default gray
  
  if (activeLayer === 'cadastral') {
    fillColor = isAlert ? 'var(--status-warning)' : '#e5e7eb';
  }

  return {
    fillColor: isSelected ? 'var(--primary-color)' : fillColor,
    weight: isSelected ? 3 : 1,
    opacity: 1,
    color: isSelected ? '#1e40af' : '#9ca3af',
    fillOpacity: isSelected ? 0.8 : 0.5
  };
};

const MapController = ({ selectedUlpin }) => {
  const map = useMap();
  
  useEffect(() => {
    if (selectedUlpin) {
      // Find the feature
      const feature = parcelGeoJSON.features.find(f => f.properties.ulpin === selectedUlpin);
      if (feature) {
        // Calculate simple centroid from polygon
        const coords = feature.geometry.coordinates[0];
        let latSum = 0, lngSum = 0;
        coords.forEach(coord => {
          lngSum += coord[0];
          latSum += coord[1];
        });
        const centerLat = latSum / coords.length;
        const centerLng = lngSum / coords.length;
        
        map.flyTo([centerLat, centerLng], 18, {
          duration: 0.5
        });
      }
    }
  }, [selectedUlpin, map]);

  return null;
};

const ParcelMap = ({ selectedUlpin, onSelectParcel, activeLayer = 'landUse' }) => {
  const geoJsonRef = useRef();

  useEffect(() => {
    if (geoJsonRef.current) {
      // Re-evaluate styles when layer changes
      geoJsonRef.current.eachLayer((layer) => {
        const feature = layer.feature;
        layer.setStyle(getFeatureStyle(feature, selectedUlpin, activeLayer));
      });
    }
  }, [activeLayer, selectedUlpin]);

  const onEachFeature = (feature, layer) => {
    const tooltipContent = `
      <div style="font-family: 'Inter', sans-serif;">
        <b>${feature.properties.ulpin}</b><br>
        Plot: ${feature.properties.plotNumber}<br>
        Status: ${feature.properties.status === 'alert' ? 'Requires Verification' : 'Verified'}
      </div>
    `;
    layer.bindTooltip(tooltipContent, { className: 'custom-tooltip' });
    
    layer.on({
      click: () => {
        onSelectParcel(feature.properties.ulpin);
      }
    });
  };

  return (
    <MapContainer 
      center={mapCenter} 
      zoom={16} 
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
    >
      <MapController selectedUlpin={selectedUlpin} />
      
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <GeoJSON 
        ref={geoJsonRef}
        data={parcelGeoJSON} 
        style={(feature) => getFeatureStyle(feature, selectedUlpin, activeLayer)}
        onEachFeature={onEachFeature}
      />
    </MapContainer>
  );
};

export default ParcelMap;
