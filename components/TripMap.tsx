'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '@/lib/leaflet-icon-fix';
import type { Schema } from '@/amplify/data/resource';

type Entry = Schema['Entry']['type'];

export default function TripMap({ entries }: { entries: Entry[] }) {
  const withCoords = entries.filter(
    (e): e is Entry & { lat: number; lng: number } =>
      e.lat != null && e.lng != null,
  );

  if (withCoords.length === 0) return null;

  const center = { lat: withCoords[0].lat, lng: withCoords[0].lng };

  return (
    <div className="overflow-hidden rounded-md border border-black/20 dark:border-white/20">
      <MapContainer center={center} zoom={10} style={{ height: 300, width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withCoords.map((entry) => (
          <Marker key={entry.id} position={{ lat: entry.lat, lng: entry.lng }}>
            <Popup>{entry.placeName}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
