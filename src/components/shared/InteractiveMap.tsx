'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// This is the robust workaround for a known issue with react-leaflet and Next.js asset handling.
// It ensures that the default icon assets are found correctly.
// This MUST be done once at the module level.
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon.src,
    iconRetinaUrl: markerIcon2x.src,
    shadowUrl: markerShadow.src,
});

type MarkerData = {
    lat: number;
    lng: number;
    name: string;
    location: string;
};

interface InteractiveMapProps {
    markers: MarkerData[];
}

// This component ensures the Leaflet map instance is properly destroyed on unmount.
// This is critical in React's Strict Mode and with HMR.
function MapCleanup() {
  const map = useMap();
  useEffect(() => {
    return () => {
      map.remove(); // This is the key step to destroy the map instance
    };
  }, [map]);
  return null;
}

export default function InteractiveMap({ markers }: InteractiveMapProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);

    // This effect ensures that the DOM node is "clean" before React tries to reuse it,
    // preventing the "Map container is already initialized" error.
    useEffect(() => {
        return () => {
            if (containerRef.current) {
                (containerRef.current as any)._leaflet_id = null;
            }
        };
    }, []);

    if (!markers || markers.length === 0) {
        return <div className="flex items-center justify-center h-full">No location data available.</div>;
    }

    // Calculate the center of the map based on the markers
    const centerLat = markers.reduce((acc, marker) => acc + marker.lat, 0) / markers.length;
    const centerLng = markers.reduce((acc, marker) => acc + marker.lng, 0) / markers.length;
    const center: [number, number] = [centerLat, centerLng];

    return (
        <div ref={containerRef} style={{ height: '100%', width: '100%' }}>
            <MapContainer center={center} zoom={9} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }} className='rounded-lg'>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {markers.map((marker, index) => (
                    <Marker key={index} position={[marker.lat, marker.lng]}>
                        <Popup>
                            <div className="font-sans">
                                <h3 className="font-bold text-base mb-1">{marker.name}</h3>
                                <p className="text-sm m-0">{marker.location}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
                <MapCleanup />
            </MapContainer>
        </div>
    );
}
