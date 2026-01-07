import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Componente interno para capturar o clique
function LocationMarker({ position, setPos }) {
  const map = useMapEvents({
    click(e) {
      setPos(e.latlng);
    },
  });

  // Centralizar o mapa quando position muda
  React.useEffect(() => {
    if (position && map) {
      map.setView(position, 15);
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function MapSelector({ onLocationSelect, position }) {
  // Posição inicial (Centro do Brasil)
  const defaultPosition = [-15.7942, -47.8822]; 

  return (
    <div className="h-64 w-full rounded overflow-hidden border-2 border-gray-300 relative z-0">
      <MapContainer center={position || defaultPosition} zoom={position ? 15 : 4} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPos={onLocationSelect} />
      </MapContainer>
      <p className="text-xs text-gray-500 mt-1 text-center">Clique no mapa para marcar o local exato</p>
    </div>
  );
}