'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// This is a workaround for a known issue with react-leaflet and Next.js
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = L.icon({
    iconUrl: icon.src,
    iconRetinaUrl: iconRetina.src,
    shadowUrl: iconShadow.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
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
    const center = markers.reduce((acc, marker) => {
        return [acc[0] + marker.lat, acc[1] + marker.lng];
    }, [0, 0]);
    center[0] = center[0] / markers.length;
    center[1] = center[1] / markers.length;

    return (
        <MapContainer center={[center[0], center[1]]} zoom={9} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }} className='rounded-lg'>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers.map((marker, index) => (
                <Marker key={index} position={[marker.lat, marker.lng]} icon={DefaultIcon}>
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
