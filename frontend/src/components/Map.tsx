import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Landmark } from '../types';

// Fix for default marker icon in Leaflet with Vite/Webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// We need to delete the default icon options to ensure our custom one takes effect
// or simply reset the paths.
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconRetinaUrl: icon, // Re-use regular icon for retina to save import
});

const containerStyle = {
    width: '100%',
    height: '100%' // Height is controlled by parent
};

const defaultCenter: [number, number] = [48.8566, 2.3522]; // Paris

interface MapProps {
    landmarks: Landmark[];
    center?: { lat: number; lng: number };
}

// Component to update map view when center changes
const ChangeView: React.FC<{ center: [number, number] }> = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

const Map: React.FC<MapProps> = ({ landmarks, center }) => {
    const mapCenter: [number, number] = center ? [center.lat, center.lng] : defaultCenter;

    return (
        <MapContainer center={mapCenter} zoom={13} style={containerStyle}>
            <ChangeView center={mapCenter} />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            {landmarks.map((landmark) => {
                const position: [number, number] = [landmark.latitude, landmark.longitude];

                const customIcon = L.divIcon({
                    className: 'custom-marker',
                    html: `<div class="w-12 h-12 rounded-full border-2 border-white shadow-lg overflow-hidden relative group">
                            <img src="${landmark.image_url}" class="w-full h-full object-cover" />
                            <div class="absolute inset-0 bg-brand-primary/20 group-hover:bg-transparent transition-colors"></div>
                           </div>`,
                    iconSize: [48, 48],
                    iconAnchor: [24, 24],
                    popupAnchor: [0, -24]
                });

                return (
                    <Marker key={landmark.id} position={position} icon={customIcon}>
                        <Popup className="custom-popup">
                            <div className="text-center">
                                <h3 className="font-bold text-brand-dark">{landmark.name}</h3>
                                <p className="text-xs text-gray-500">{(landmark.similarity_score * 100).toFixed(0)}% Eşleşme</p>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
};

export default Map;
