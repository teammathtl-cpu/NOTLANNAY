import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { TouristLocation, Route, Language } from '../types';
import { School, MapPin, ExternalLink, Navigation, Layers, Compass, Eye } from 'lucide-react';
import { getDirectDistance } from '../utils/graphAlgorithms';

interface MapViewProps {
  locations: TouristLocation[];
  routes: Route[];
  selectedLocationId: string | null;
  onSelectLocation: (loc: TouristLocation) => void;
  highlightedPath: string[];
  language: Language;
  onSetStart: (id: string) => void;
  onSetEnd: (id: string) => void;
  mapHeight?: string;
  selectedIds?: string[];
  onToggleItinerary?: (id: string) => void;
  onSelectItinerary?: () => void;
}

export const MapView: React.FC<MapViewProps> = ({
  locations,
  routes,
  selectedLocationId,
  onSelectLocation,
  highlightedPath,
  language,
  onSetStart,
  onSetEnd,
  mapHeight = '100%',
  selectedIds,
  onToggleItinerary,
  onSelectItinerary,
}) => {
  const isVi = language === 'vi';
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const polylineLayerRef = useRef<L.LayerGroup | null>(null);
  const distanceBadgesLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [mapStyle, setMapStyle] = useState<'google-hybrid' | 'esri-satellite' | 'voyager' | 'osm'>('google-hybrid');
  const [showDistances, setShowDistances] = useState<boolean>(true);

  // Helper to get tile layers for current style
  const applyTileLayers = (map: L.Map, style: 'google-hybrid' | 'esri-satellite' | 'voyager' | 'osm') => {
    if (!tileLayerGroupRef.current) {
      tileLayerGroupRef.current = L.layerGroup().addTo(map);
    }
    tileLayerGroupRef.current.clearLayers();

    if (style === 'google-hybrid') {
      // Google Hybrid: Ultra high-resolution satellite imagery + crystal clear road names in Vietnamese
      const googleTile = L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
        attribution: '© Google Maps Satellite & Hybrid Roads',
      });
      googleTile.addTo(tileLayerGroupRef.current);
    } else if (style === 'esri-satellite') {
      // ESRI World Imagery + Transportation & Boundaries Labels overlay
      const esriBase = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: '© Esri, Maxar, Earthstar Geographics',
      });
      const esriRoads = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        opacity: 0.85,
      });
      const esriLabels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        opacity: 0.95,
      });
      esriBase.addTo(tileLayerGroupRef.current);
      esriRoads.addTo(tileLayerGroupRef.current);
      esriLabels.addTo(tileLayerGroupRef.current);
    } else if (style === 'osm') {
      const osmTile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      });
      osmTile.addTo(tileLayerGroupRef.current);
    } else {
      const voyagerTile = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '© CARTO, © OpenStreetMap',
      });
      voyagerTile.addTo(tileLayerGroupRef.current);
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on Hanoi
    const map = L.map(mapContainerRef.current, {
      center: [21.0285, 105.8250],
      zoom: 13,
      zoomControl: false,
    });

    tileLayerGroupRef.current = L.layerGroup().addTo(map);
    applyTileLayers(map, mapStyle);

    L.control.zoom({ position: 'topright' }).addTo(map);

    mapInstanceRef.current = map;
    polylineLayerRef.current = L.layerGroup().addTo(map);
    distanceBadgesLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when mapStyle changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    applyTileLayers(map, mapStyle);
  }, [mapStyle]);

  // Update Markers, Routes, and Distance Badges
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    // Clear old layers
    if (polylineLayerRef.current) polylineLayerRef.current.clearLayers();
    if (distanceBadgesLayerRef.current) distanceBadgesLayerRef.current.clearLayers();

    const locMap = new Map(locations.map(l => [l.id, l]));
    const isSatellite = mapStyle === 'google-hybrid' || mapStyle === 'esri-satellite';
    const badgePairs = new Set<string>();

    // 1. Draw highlighted path polyline with glowing borders & prominent distance badges
    if (highlightedPath.length > 1 && polylineLayerRef.current) {
      const pathPoints: [number, number][] = [];
      highlightedPath.forEach(id => {
        const l = locMap.get(id);
        if (l) pathPoints.push([l.lat, l.lng]);
      });

      if (pathPoints.length > 1) {
        // Glowing halo for satellite and high-contrast navigation
        L.polyline(pathPoints, {
          color: '#f59e0b',
          weight: 10,
          opacity: 0.8,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(polylineLayerRef.current);

        // Core bright path
        L.polyline(pathPoints, {
          color: '#ffffff',
          weight: 5.5,
          opacity: 1,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(polylineLayerRef.current);

        // Vibrant center line
        L.polyline(pathPoints, {
          color: '#0284c7',
          weight: 3.5,
          opacity: 0.95,
          dashArray: '8, 8',
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(polylineLayerRef.current);

        // Add prominent midpoint distance badges on each consecutive segment of the tour
        if (showDistances && distanceBadgesLayerRef.current) {
          for (let i = 0; i < highlightedPath.length - 1; i++) {
            const u = highlightedPath[i];
            const v = highlightedPath[i + 1];
            const locU = locMap.get(u);
            const locV = locMap.get(v);
            if (locU && locV) {
              const pairKey = [u, v].sort().join('__');
              badgePairs.add(pairKey);

              const dist = getDirectDistance(u, v, routes);
              const midLat = (locU.lat + locV.lat) / 2;
              const midLng = (locU.lng + locV.lng) / 2;

              const badgeHtml = `
                <div class="map-distance-badge-tour" style="
                  background: linear-gradient(135deg, #091a2b 0%, #133654 100%);
                  color: #fff;
                  font-weight: 900;
                  font-size: 11px;
                  padding: 3.5px 9px;
                  border-radius: 9999px;
                  border: 2px solid #f59e0b;
                  box-shadow: 0 4px 14px rgba(0,0,0,0.7), 0 0 10px rgba(245,158,11,0.6);
                  white-space: nowrap;
                  transform: translate(-50%, -50%);
                  display: flex;
                  align-items: center;
                  gap: 5px;
                  backdrop-filter: blur(4px);
                  cursor: pointer;
                  user-select: none;
                ">
                  <span style="display:inline-block; width: 6px; height: 6px; border-radius: 50%; background: #10b981; box-shadow: 0 0 6px #10b981;"></span>
                  <span style="color: #cbd5e1; font-size: 9.5px; font-weight: 800;">Chặng ${i + 1}:</span>
                  <span style="color: #fde047; font-size: 11.5px; font-weight: 900; letter-spacing: -0.2px;">${dist !== null ? `${dist} km` : '—'}</span>
                </div>
              `;

              const badgeIcon = L.divIcon({
                className: 'map-distance-badge-icon',
                html: badgeHtml,
                iconSize: [0, 0],
              });

              const badgeMarker = L.marker([midLat, midLng], { icon: badgeIcon }).addTo(distanceBadgesLayerRef.current);
              badgeMarker.bindPopup(`
                <div style="font-family: inherit; font-size: 12px; line-height: 1.5; padding: 4px;" class="text-slate-900">
                  <div style="font-weight: 900; color: #133654; margin-bottom: 2px;">
                    🛣️ Chặng ${i + 1}: ${locU.label} ➔ ${locV.label}
                  </div>
                  <div><strong>Khoảng cách đường đi:</strong> <span style="color: #b45309; font-weight: 800;">${dist !== null ? `${dist} km` : '—'}</span></div>
                  <div style="color: #64748b; font-size: 11px; margin-top: 2px;">
                    🛵 ~${dist ? Math.round(dist * 2.2) : 5} phút xe máy • 🚶 ~${dist ? Math.round(dist * 13) : 25} phút đi bộ
                  </div>
                </div>
              `);
            }
          }
        }
      }
    }

    // 2. Draw background arterial routes with midpoint distance badges
    const drawnArterials = new Set<string>();
    routes
      .filter(r => r.isArterial !== false)
      .forEach(r => {
        const pairKey = [r.from, r.to].sort().join('__');
        if (drawnArterials.has(pairKey)) return;
        drawnArterials.add(pairKey);

        const fromLoc = locMap.get(r.from);
        const toLoc = locMap.get(r.to);
        if (fromLoc && toLoc && polylineLayerRef.current) {
          L.polyline(
            [
              [fromLoc.lat, fromLoc.lng],
              [toLoc.lat, toLoc.lng],
            ],
            {
              color: isSatellite ? '#f8fafc' : '#64748b',
              weight: isSatellite ? 2.5 : 2,
              opacity: isSatellite ? 0.65 : 0.45,
              dashArray: '5, 7',
            }
          ).addTo(polylineLayerRef.current);

          // Add midpoint distance badge in the middle of arterial road if not already highlighted
          if (showDistances && !badgePairs.has(pairKey) && distanceBadgesLayerRef.current) {
            const midLat = (fromLoc.lat + toLoc.lat) / 2;
            const midLng = (fromLoc.lng + toLoc.lng) / 2;

            const badgeHtml = `
              <div class="map-distance-badge-arterial" style="
                background: ${isSatellite ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.95)'};
                color: ${isSatellite ? '#f8fafc' : '#1e293b'};
                font-weight: 800;
                font-size: 10px;
                padding: 1.5px 6.5px;
                border-radius: 9999px;
                border: 1px solid ${isSatellite ? 'rgba(255, 255, 255, 0.4)' : '#cbd5e1'};
                box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                white-space: nowrap;
                transform: translate(-50%, -50%);
                display: flex;
                align-items: center;
                gap: 2.5px;
                backdrop-filter: blur(2px);
                cursor: pointer;
              ">
                <span style="font-size: 9px; opacity: 0.8;">↔</span>
                <span>${r.distanceKm} km</span>
              </div>
            `;

            const badgeIcon = L.divIcon({
              className: 'map-distance-badge-arterial-icon',
              html: badgeHtml,
              iconSize: [0, 0],
            });

            const marker = L.marker([midLat, midLng], { icon: badgeIcon }).addTo(distanceBadgesLayerRef.current);
            marker.bindPopup(`
              <div style="font-family: inherit; font-size: 12px; line-height: 1.4; padding: 4px;" class="text-slate-900">
                <div style="font-weight: 800; color: #133654;">${fromLoc.label} ↔ ${toLoc.label}</div>
                <div>Cự ly giữa 2 điểm: <strong>${r.distanceKm} km</strong></div>
                <div style="color: #64748b; font-size: 11px;">🛵 ~${Math.round(r.distanceKm * 2.2)} phút</div>
              </div>
            `);
          }
        }
      });

    // 3. Add Location Markers
    locations.forEach(loc => {
      const isTL = loc.id === 'TL';
      const pathIndex = highlightedPath.indexOf(loc.id);
      const isPath = pathIndex !== -1;
      const isSelected = selectedLocationId === loc.id;

      let iconHtml = '';
      if (isTL) {
        iconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group" style="transform: translate(-50%, -50%);">
            <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(245, 158, 11, 0.35); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 36px; height: 36px; background: #133654; border-radius: 50%; border: 3px solid #d7a15e; box-shadow: 0 4px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; font-weight: 900; color: #fff; font-size: 11px;">
              🏛️ TL
            </div>
            <div style="position: absolute; bottom: -20px; background: #133654; color: #fef08a; font-weight: 800; font-size: 10px; padding: 1px 6px; border-radius: 6px; border: 1px solid #d7a15e; white-space: nowrap; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
              ${loc.label}
            </div>
          </div>
        `;
      } else if (isPath) {
        iconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer" style="transform: translate(-50%, -50%);">
            <div style="width: 30px; height: 30px; background: #047857; border-radius: 50%; border: 2.5px solid #fff; box-shadow: 0 3px 8px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; font-weight: 900; color: #fff; font-size: 12px;">
              ${pathIndex + 1}
            </div>
            <div style="position: absolute; bottom: -18px; background: rgba(15, 23, 42, 0.95); color: #fff; font-weight: 700; font-size: 9px; padding: 1px 5px; border-radius: 5px; border: 1px solid #475569; white-space: nowrap;">
              ${loc.label}
            </div>
          </div>
        `;
      } else {
        iconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer" style="transform: translate(-50%, -50%);">
            <div style="width: 24px; height: 24px; background: ${isSelected ? '#e11d48' : '#fff'}; border-radius: 50%; border: 2px solid ${isSelected ? '#ffe4e6' : '#133654'}; box-shadow: 0 2px 6px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; font-size: 11px; color: ${isSelected ? '#fff' : '#133654'}; font-weight: 800;">
              📍
            </div>
            <div style="position: absolute; bottom: -18px; background: rgba(255, 255, 255, 0.95); color: #0f172a; font-weight: 700; font-size: 9px; padding: 1px 5px; border-radius: 5px; border: 1px solid #cbd5e1; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
              ${loc.label}
            </div>
          </div>
        `;
      }

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: iconHtml,
        iconSize: [0, 0],
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(map);

      // Popup Content
      const isInTour = selectedIds?.includes(loc.id) || false;

      const popupHtml = `
        <div style="font-family: inherit; width: 240px;" class="p-1 text-slate-900">
          <div class="font-bold text-sm text-slate-900 mb-1">
            ${isVi ? loc.fullName : (loc.fullNameEn || loc.fullName)}
          </div>
          <div class="flex items-center gap-2 mb-2">
            <span class="inline-block px-2 py-0.5 text-[10px] font-bold bg-[#133654]/10 text-[#133654] rounded-full">
              ${loc.category}
            </span>
          </div>
          <p class="text-xs text-slate-600 mb-2 line-clamp-2 leading-relaxed">
            ${isVi ? loc.shortIntro : (loc.shortIntroEn || loc.shortIntro)}
          </p>
          ${!isTL && onToggleItinerary ? `
            <button id="btn-tour-${loc.id}" style="font-size: 11px;" class="w-full mb-1.5 py-1 px-2 rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
              isInTour 
                ? 'bg-emerald-600 hover:bg-rose-600 text-white' 
                : 'bg-[#133654] hover:bg-[#0e273c] text-white'
            }">
              ${isInTour ? (isVi ? '✓ Đã trong hành trình (Bấm để bỏ)' : '✓ In tour (Remove)') : (isVi ? '+ Thêm vào hành trình' : '+ Add to itinerary')}
            </button>
          ` : ''}
          ${isInTour && onSelectItinerary && (selectedIds?.length || 0) >= 2 ? `
            <button id="btn-select-tour-${loc.id}" style="font-size: 11px;" class="w-full mb-2 py-1 px-2 rounded-lg font-bold flex items-center justify-center gap-1 bg-[#133654] hover:bg-[#0b2236] text-amber-300 border border-amber-400/50 cursor-pointer shadow-xs">
              🧭 ${isVi ? 'Chọn hành trình ngay' : 'Select Itinerary Now'}
            </button>
          ` : ''}
          <div class="flex items-center gap-1.5 pt-2 border-t border-slate-200">
            <button id="btn-start-${loc.id}" style="font-size: 11px;" class="flex-1 py-1 px-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold">
              ${isVi ? 'Điểm đi' : 'Start'}
            </button>
            <button id="btn-end-${loc.id}" style="font-size: 11px;" class="flex-1 py-1 px-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold">
              ${isVi ? 'Điểm đến' : 'End'}
            </button>
            <button id="btn-view-${loc.id}" style="font-size: 11px;" class="flex-1 py-1 px-1.5 bg-[#133654] hover:bg-[#0f2e48] text-white rounded-lg font-bold">
              ${isVi ? 'Chi tiết' : 'Info'}
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btnStart = document.getElementById(`btn-start-${loc.id}`);
        const btnEnd = document.getElementById(`btn-end-${loc.id}`);
        const btnView = document.getElementById(`btn-view-${loc.id}`);
        const btnTour = document.getElementById(`btn-tour-${loc.id}`);
        const btnSelectTour = document.getElementById(`btn-select-tour-${loc.id}`);

        if (btnStart) btnStart.onclick = () => onSetStart(loc.id);
        if (btnEnd) btnEnd.onclick = () => onSetEnd(loc.id);
        if (btnView) btnView.onclick = () => onSelectLocation(loc);
        if (btnTour && onToggleItinerary) {
          btnTour.onclick = () => {
            onToggleItinerary(loc.id);
            marker.closePopup();
          };
        }
        if (btnSelectTour && onSelectItinerary) {
          btnSelectTour.onclick = () => {
            marker.closePopup();
            onSelectItinerary();
          };
        }
      });

      marker.on('click', () => {
        onSelectLocation(loc);
      });

      markersRef.current[loc.id] = marker;
    });
  }, [locations, routes, highlightedPath, selectedLocationId, language, showDistances, selectedIds, onToggleItinerary]);

  // Pan to selected location
  useEffect(() => {
    if (selectedLocationId && mapInstanceRef.current) {
      const loc = locations.find(l => l.id === selectedLocationId);
      if (loc) {
        mapInstanceRef.current.panTo([loc.lat, loc.lng], {
          animate: true,
          duration: 0.8,
        });
        const marker = markersRef.current[loc.id];
        if (marker && !marker.isPopupOpen()) {
          marker.openPopup();
        }
      }
    }
  }, [selectedLocationId, locations]);

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-3xl overflow-hidden border border-[#d7ccbb] shadow-sm bg-slate-100 flex flex-col" style={{ height: mapHeight }}>
      
      {/* Top Floating Map Controls */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2">
        
        {/* Tile layer selector */}
        <div className="flex items-center p-1 bg-white/95 backdrop-blur-md rounded-xl border border-[#d7ccbb] shadow-xs text-xs font-bold text-slate-700">
          <button
            onClick={() => setMapStyle('google-hybrid')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              mapStyle === 'google-hybrid' ? 'bg-[#133654] text-amber-300 shadow-xs font-black' : 'hover:bg-slate-100 text-slate-700'
            }`}
            title={isVi ? 'Bản đồ vệ tinh có tên đường phố chi tiết' : 'Satellite Hybrid with roads'}
          >
            <span>🛰️</span>
            <span>{isVi ? 'Vệ tinh chi tiết' : 'Satellite HD'}</span>
          </button>
          <button
            onClick={() => setMapStyle('esri-satellite')}
            className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              mapStyle === 'esri-satellite' ? 'bg-[#133654] text-amber-300 shadow-xs font-black' : 'hover:bg-slate-100 text-slate-700'
            }`}
            title={isVi ? 'Ảnh vệ tinh ArcGIS Esri' : 'Esri Satellite'}
          >
            <span>🌍</span>
            <span>{isVi ? 'Vệ tinh Esri' : 'Esri'}</span>
          </button>
          <button
            onClick={() => setMapStyle('voyager')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              mapStyle === 'voyager' ? 'bg-[#133654] text-white' : 'hover:bg-slate-100'
            }`}
          >
            {isVi ? 'Bản đồ dịu' : 'Voyager'}
          </button>
          <button
            onClick={() => setMapStyle('osm')}
            className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
              mapStyle === 'osm' ? 'bg-[#133654] text-white' : 'hover:bg-slate-100'
            }`}
          >
            {isVi ? 'Phố OSM' : 'OSM'}
          </button>
        </div>

        {/* Toggle distance badges on map */}
        <button
          onClick={() => setShowDistances(!showDistances)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs border transition-all cursor-pointer ${
            showDistances
              ? 'bg-[#133654] text-amber-300 border-[#133654] ring-1 ring-amber-400/50'
              : 'bg-white/95 text-slate-700 border-[#d7ccbb] hover:bg-white'
          }`}
          title={isVi ? 'Bật / tắt số km ở giữa từng cung đường' : 'Toggle distance badges in middle of roads'}
        >
          <Eye className="w-3.5 h-3.5 text-amber-300" />
          <span>{isVi ? 'Khoảng cách giữa con đường' : 'Road distances'}</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${showDistances ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-600'}`}>
            {showDistances ? 'BẬT' : 'TẮT'}
          </span>
        </button>

        {/* Dedicated 'Chọn hành trình' button directly on Map */}
        {selectedIds && selectedIds.length > 0 && onSelectItinerary && (
          <div className="flex items-center gap-1.5 p-1 bg-white/95 backdrop-blur-md rounded-xl border border-[#d7ccbb] shadow-xs text-xs font-bold">
            <span className="px-2 py-0.5 rounded-lg bg-[#f7f1e7] text-[#133654] font-black text-[11px]">
              📍 {isVi ? `Đã chọn: ${selectedIds.length} điểm` : `Selected: ${selectedIds.length}`}
            </span>
            <button
              onClick={onSelectItinerary}
              disabled={selectedIds.length < 2}
              className={`px-3 py-1 rounded-lg font-black text-xs transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
                selectedIds.length >= 2
                  ? 'bg-[#133654] hover:bg-[#0b2438] text-white ring-1 ring-amber-400/60 hover:scale-[1.02]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>🧭 {isVi ? 'Chọn hành trình' : 'Select Itinerary'}</span>
            </button>
          </div>
        )}

      </div>

      {/* Main Leaflet Map */}
      <div ref={mapContainerRef} className="w-full flex-1 min-h-[500px] z-10" />

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700/80 text-xs font-bold text-white shadow-lg flex items-center gap-3 pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#133654] border-2 border-[#d7a15e]" />
            <span className="text-amber-300">THPT Thăng Long</span>
          </div>
          <div className="w-[1px] h-4 bg-slate-700" />
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#047857] border border-white" />
            <span>{isVi ? 'Điểm lộ trình' : 'Route stops'}</span>
          </div>
          <div className="w-[1px] h-4 bg-slate-700" />
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 bg-slate-800 text-amber-300 border border-amber-400 rounded-full text-[10px] font-black">
              Chặng 1: 3.5 km
            </span>
            <span className="text-slate-300">{isVi ? 'Cự ly giữa con đường' : 'Midpoint distance'}</span>
          </div>
        </div>

        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView([21.0285, 105.8250], 13);
            }
          }}
          className="bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-2xl border border-slate-700/80 shadow-lg pointer-events-auto transition-colors cursor-pointer"
        >
          {isVi ? '🎯 Đưa về trung tâm Hà Nội' : '🎯 Center on Hanoi'}
        </button>
      </div>

    </div>
  );
};
