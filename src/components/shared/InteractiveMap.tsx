'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// This is a workaround for a known issue with react-leaflet and Next.js
// It ensures that the default icon assets are found correctly.
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
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

export default function InteractiveMap({ markers }: InteractiveMapProps) {
    if (!markers || markers.length === 0) {
        return <div className="flex items-center justify-center h-full">No location data available.</div>;
    }

    // Calculate the center of the map based on the markers
    const centerLat = markers.reduce((acc, marker) => acc + marker.lat, 0) / markers.length;
    const centerLng = markers.reduce((acc, marker) => acc + marker.lng, 0) / markers.length;
    const center: [number, number] = [centerLat, centerLng];

    // IMPORTANT: A unique key forces React to re-create the component when the center changes,
    // which cleanly destroys and re-initializes the Leaflet map instance.
    // This prevents the "Map container is already initialized" error in React's Strict Mode.
    const mapKey = `${center[0]}-${center[1]}`;

    return (
        <MapContainer key={mapKey} center={center} zoom={9} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }} className='rounded-lg'>
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
        </MapContainer>
    );
}
