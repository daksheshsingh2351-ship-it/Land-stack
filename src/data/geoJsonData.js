// src/data/geoJsonData.js

// Using Pune base coordinates roughly
const baseLat = 18.5204;
const baseLng = 73.8567;
const offsetLat = 0.0006; 
const offsetLng = 0.0008; 

const features = [];

for (let i = 0; i < 30; i++) {
  // Create a 6x5 grid
  const row = Math.floor(i / 5);
  const col = i % 5;
  
  const lat = baseLat + (row * offsetLat);
  const lng = baseLng + (col * offsetLng);
  
  const ulpinId = 123 + i;
  
  features.push({
    type: "Feature",
    properties: {
      ulpin: `ULPIN-MH-000${ulpinId}`,
      plotNumber: `P-${118 + i}`,
      status: ulpinId === 123 || ulpinId === 125 ? "alert" : "normal"
    },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [lng, lat],
        [lng + offsetLng - 0.00005, lat],
        [lng + offsetLng - 0.00005, lat + offsetLat - 0.00005],
        [lng, lat + offsetLat - 0.00005],
        [lng, lat]
      ]]
    }
  });
}

export const parcelGeoJSON = {
  type: "FeatureCollection",
  features: features
};

export const mapCenter = [baseLat + (3 * offsetLat), baseLng + (2.5 * offsetLng)]; // Center of grid
