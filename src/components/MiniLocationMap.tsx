import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { TouristLocation, Route, Language } from '../types';
import { getDirectDistance } from '../utils/graphAlgorithms';
import { ExternalLink, Maximize2, MapPin, Layers } from 'lucide-react';

interface MiniLocationMapProps {
  location: TouristLocation;
  allLocations: TouristLocation[];
  routes: Route[];
  language: Language;
  onFocusMainMap?: (id: string) => void;
  height?: string;
  defaultMode?: 'leaflet' | 'google';
}

export const MiniLocationMap: React.FC<MiniLocationMapProps> = ({
  location,
  allLocations,
  routes,
  language,
  onFocusMainMap,
  height = '200px',
  defaultMode = 'leaflet',
}) => {
  const isVi = language === 'vi';
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [mapType, setMapType] = useState<'satellite' | 'leaflet' | 'google'>(defaultMode === 'google' ? 'google' : 'satellite');

  // Initialize or re-render Leaflet Map
  useEffect(() => {
    if (mapType === 'google') {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      return;
    }

    if (!containerRef.current) return;
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(containerRef.current, {
      center: [location.lat, location.lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    });

    if (mapType === 'satellite') {
      // Google Hybrid satellite with road names
      L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
      }).addTo(map);
    } else {
      // Crisp CartoDB Voyager tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map);
    }

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Main location marker
    const mainIcon = L.divIcon({
      className: 'mini-target-marker',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%);">
          <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(225, 29, 72, 0.3); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 28px; height: 28px; border-radius: 50%; background: #e11d48; color: #fff; font-weight: 900; font-size: 12px; border: 2.5px solid #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.45);">
            📍
          </div>
          <div style="position: absolute; bottom: -20px; background: #0f172a; color: #fff; font-size: 10px; font-weight: 800; padding: 1.5px 6px; border-radius: 5px; white-space: nowrap; border: 1px solid rgba(255,255,255,0.3); box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            ${location.label}
          </div>
        </div>
      `,
      iconSize: [0, 0],
    });

    L.marker([location.lat, location.lng], { icon: mainIcon }).addTo(map);

    // Call invalidateSize after container has settled
    const timer1 = setTimeout(() => map.invalidateSize(), 150);
    const timer2 = setTimeout(() => map.invalidateSize(), 400);

    mapRef.current = map;

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      map.remove();
      mapRef.current = null;
    };
  }, [location, allLocations, routes, mapType]);

  // Google Maps embed URL
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${location.lat},${location.lng}&hl=vi&z=15&output=embed`;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#d7ccbb] shadow-inner bg-slate-100 group flex flex-col" style={{ height }}>
      
      {/* Top Map Mode Switcher & Coordinates */}
      <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5">
        <div className="flex items-center p-0.5 bg-white/95 backdrop-blur-md rounded-lg border border-[#d7ccbb] shadow-xs text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setMapType('satellite')}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
              mapType === 'satellite' ? 'bg-[#133654] text-amber-300 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🛰️</span>
            <span>{isVi ? 'Vệ tinh' : 'Satellite'}</span>
          </button>
          <button
            type="button"
            onClick={() => setMapType('leaflet')}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              mapType === 'leaflet' ? 'bg-[#133654] text-white shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isVi ? 'Bản đồ' : 'Map'}
          </button>
          <button
            type="button"
            onClick={() => setMapType('google')}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              mapType === 'google' ? 'bg-[#133654] text-white shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Google Maps
          </button>
        </div>

        <span className="hidden sm:inline-block px-2 py-0.5 rounded-lg bg-white/90 text-slate-800 text-[10px] font-bold shadow-xs border border-slate-200">
          📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
        </span>
      </div>

      {/* Map View Rendering */}
      {mapType !== 'google' ? (
        <div ref={containerRef} className="w-full h-full z-10" />
      ) : (
        <iframe
          title={`Google Maps ${location.fullName}`}
          src={googleMapsEmbedUrl}
          className="w-full h-full border-0 z-10"
          loading="lazy"
          allowFullScreen
        />
      )}

      {/* Action Buttons in bottom-right corner */}
      <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1.5">
        {onFocusMainMap && (
          <button
            type="button"
            onClick={() => onFocusMainMap(location.id)}
            className="px-2.5 py-1 rounded-xl bg-[#133654] hover:bg-[#0f2e48] text-white text-[10px] font-bold shadow-md flex items-center gap-1 transition-all cursor-pointer"
          >
            <Maximize2 className="w-3 h-3" />
            <span>{isVi ? 'Xem bản đồ lớn' : 'Full map'}</span>
          </button>
        )}

        {location.googleMapsUrl && (
          <a
            href={location.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 px-2 rounded-xl bg-white/90 hover:bg-white text-slate-800 text-[10px] font-bold shadow-md border border-[#d7ccbb] flex items-center gap-1 transition-all"
            title={isVi ? 'Mở trong ứng dụng Google Maps' : 'Open in Google Maps'}
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden sm:inline">Chỉ đường</span>
          </a>
        )}
      </div>

    </div>
  );
};
