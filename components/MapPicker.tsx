'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '@/lib/leaflet-icon-fix';

type LatLng = { lat: number; lng: number };

function ClickHandler({ onPick }: { onPick: (pos: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// 東京駅(デフォルトの中心位置)
const DEFAULT_CENTER: LatLng = { lat: 35.681236, lng: 139.767125 };

export default function MapPicker({
  value,
  onChange,
}: {
  value: LatLng | null;
  onChange: (pos: LatLng) => void;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-black/20 dark:border-white/20">
      <MapContainer
        center={value ?? DEFAULT_CENTER}
        zoom={value ? 13 : 5}
        style={{ height: 300, width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={onChange} />
        {value && <Marker position={value} />}
      </MapContainer>
    </div>
  );
}
