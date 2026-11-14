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

  // Fit map bounds helper for active route
  const fitMapToActiveRoute = (map: L.Map, pathIds: string[], locs: TouristLocation[]) => {
    const locMap = new Map(locs.map(l => [l.id, l]));
    const pts: [number, number][] = [];
    pathIds.forEach(id => {
      const l = locMap.get(id);
      if (l) pts.push([l.lat, l.lng]);
    });
    if (pts.length > 1) {
      const bounds = L.latLngBounds(pts);
      map.fitBounds(bounds, { padding: [55, 55], maxZoom: 15, animate: true });
    } else {
      map.setView([21.0285, 105.8250], 13.5);
    }
  };

  // Initialize Map + ResizeObserver
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [21.0285, 105.8250],
      zoom: 13.5,
      zoomControl: false,
    });

    tileLayerGroupRef.current = L.layerGroup().addTo(map);
    applyTileLayers(map, mapStyle);

    L.control.zoom({ position: 'topright' }).addTo(map);

    mapInstanceRef.current = map;
    polylineLayerRef.current = L.layerGroup().addTo(map);
    distanceBadgesLayerRef.current = L.layerGroup().addTo(map);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    if (highlightedPath.length > 1) {
      setTimeout(() => fitMapToActiveRoute(map, highlightedPath, locations), 150);
    }

    return () => {
      resizeObserver.disconnect();
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

  // Auto-fit when highlightedPath changes significantly
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (highlightedPath.length > 1) {
      fitMapToActiveRoute(map, highlightedPath, locations);
    }
  }, [highlightedPath]);

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

    // 1. Draw background arterial routes subtly so active path stands out clearly
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
              color: isSatellite ? '#e2e8f0' : '#64748b',
              weight: 1.4,
              opacity: isSatellite ? 0.32 : 0.25,
              dashArray: '4, 6',
            }
          ).addTo(polylineLayerRef.current);

          if (showDistances && !badgePairs.has(pairKey) && distanceBadgesLayerRef.current) {
            const isHighlightedSeg =
              highlightedPath.length > 1 &&
              highlightedPath.some((id, idx) =>
                idx < highlightedPath.length - 1 &&
                ((highlightedPath[idx] === r.from && highlightedPath[idx + 1] === r.to) ||
                  (highlightedPath[idx] === r.to && highlightedPath[idx + 1] === r.from))
              );
            if (isHighlightedSeg) return;

            const midLat = (fromLoc.lat + toLoc.lat) / 2;
            const midLng = (fromLoc.lng + toLoc.lng) / 2;

            const badgeHtml = `
              <div class="map-distance-badge-arterial" style="
                background: ${isSatellite ? 'rgba(15, 23, 42, 0.78)' : 'rgba(255, 255, 255, 0.88)'};
                color: ${isSatellite ? '#e2e8f0' : '#334155'};
                font-weight: 700;
                font-size: 9px;
                padding: 1px 5px;
                border-radius: 9999px;
                border: 1px solid ${isSatellite ? 'rgba(255, 255, 255, 0.28)' : '#cbd5e1'};
                box-shadow: 0 1px 4px rgba(0,0,0,0.3);
                white-space: nowrap;
                transform: translate(-50%, -50%);
                display: flex;
                align-items: center;
                gap: 2px;
                cursor: pointer;
              ">
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

    // 2. Draw highlighted path polyline with high-contrast casing, bright core, directional arrows & compact distance badges
    if (highlightedPath.length > 1 && polylineLayerRef.current) {
      const pathPoints: [number, number][] = [];
      highlightedPath.forEach(id => {
        const l = locMap.get(id);
        if (l) pathPoints.push([l.lat, l.lng]);
      });

      if (pathPoints.length > 1) {
        // High-contrast dark outer casing so route pops cleanly on satellite & street maps
        L.polyline(pathPoints, {
          color: '#091a2b',
          weight: 9.5,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(polylineLayerRef.current);

        // Bright golden-amber main path
        L.polyline(pathPoints, {
          color: '#f59e0b',
          weight: 5.5,
          opacity: 1,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(polylineLayerRef.current);

        // Crisp luminous center track
        L.polyline(pathPoints, {
          color: '#fef3c7',
          weight: 2.2,
          opacity: 0.95,
          dashArray: '10, 10',
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(polylineLayerRef.current);

        // Directional arrowheads + midpoint distance badges on each segment
        for (let i = 0; i < highlightedPath.length - 1; i++) {
          const u = highlightedPath[i];
          const v = highlightedPath[i + 1];
          const locU = locMap.get(u);
          const locV = locMap.get(v);
          if (!locU || !locV) continue;

          // Directional chevron placed at 74% along the segment
          const arrowLat = locU.lat + (locV.lat - locU.lat) * 0.74;
          const arrowLng = locU.lng + (locV.lng - locU.lng) * 0.74;
          const dLat = locV.lat - locU.lat;
          const dLng = (locV.lng - locU.lng) * Math.cos((locU.lat * Math.PI) / 180);
          const angleDeg = (Math.atan2(dLng, dLat) * 180) / Math.PI;

          const arrowIcon = L.divIcon({
            className: 'map-route-arrow-icon',
            html: `
              <div style="
                transform: translate(-50%, -50%) rotate(${angleDeg}deg);
                width: 14px;
                height: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: none;
              ">
                <svg width="14" height="14" viewBox="0 0 14 14">
                  <path d="M7 1 L12.5 11.5 L7 9 L1.5 11.5 Z" fill="#fef08a" stroke="#091a2b" stroke-width="1.6" stroke-linejoin="round" />
                </svg>
              </div>
            `,
            iconSize: [0, 0],
          });
          L.marker([arrowLat, arrowLng], { icon: arrowIcon, interactive: false }).addTo(polylineLayerRef.current);

          if (showDistances && distanceBadgesLayerRef.current) {
            const pairKey = [u, v].sort().join('__');
            badgePairs.add(pairKey);

            const dist = getDirectDistance(u, v, routes);
            const midLat = (locU.lat + locV.lat) / 2;
            const midLng = (locU.lng + locV.lng) / 2;

            const badgeHtml = `
              <div class="map-distance-badge-tour" style="
                background: #091a2b;
                color: #fff;
                font-weight: 900;
                font-size: 10px;
                padding: 2px 7px;
                border-radius: 9999px;
                border: 1.5px solid #f59e0b;
                box-shadow: 0 2px 8px rgba(0,0,0,0.65);
                white-space: nowrap;
                transform: translate(-50%, -50%);
                display: flex;
                align-items: center;
                gap: 4px;
                cursor: pointer;
                user-select: none;
              ">
                <span style="color: #cbd5e1; font-size: 9px; font-weight: 800;">${i + 1}.</span>
                <span style="color: #fde047; font-size: 10px; font-weight: 900;">${dist !== null ? `${dist} km` : '—'}</span>
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

    // 3. Add Compact, Neat Location Circle Markers
    locations.forEach(loc => {
      const isTL = loc.id === 'TL';
      const pathIndex = highlightedPath.indexOf(loc.id);
      const isPath = pathIndex !== -1;
      const isSelected = selectedLocationId === loc.id;

      let iconHtml = '';
      if (isTL) {
        iconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group" style="transform: translate(-50%, -50%);">
            <div style="position: absolute; width: 26px; height: 26px; border-radius: 50%; background: rgba(245, 158, 11, 0.35); animation: ping 2.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 21px; height: 21px; background: #133654; border-radius: 50%; border: 2px solid #f59e0b; box-shadow: 0 2px 6px rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; font-weight: 900; color: #fef08a; font-size: 8px; letter-spacing: -0.3px;">
              TL
            </div>
            <div style="position: absolute; bottom: -14px; background: rgba(19, 54, 84, 0.94); color: #fef08a; font-weight: 800; font-size: 8.5px; padding: 0.5px 4.5px; border-radius: 4px; border: 1px solid #d7a15e; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.35); line-height: 1.2;">
              ${loc.label}
            </div>
          </div>
        `;
      } else if (isPath) {
        iconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer" style="transform: translate(-50%, -50%);">
            <div style="width: 18px; height: 18px; background: ${isSelected ? '#e11d48' : '#047857'}; border-radius: 50%; border: 1.8px solid #ffffff; box-shadow: 0 2px 5px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; font-weight: 900; color: #fff; font-size: 9px;">
              ${pathIndex + 1}
            </div>
            <div style="position: absolute; bottom: -13px; background: rgba(15, 23, 42, 0.9); color: #ffffff; font-weight: 700; font-size: 8.5px; padding: 0.5px 4.5px; border-radius: 4px; border: 1px solid rgba(148, 163, 184, 0.6); white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.3); line-height: 1.2;">
              ${loc.label}
            </div>
          </div>
        `;
      } else {
        iconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer" style="transform: translate(-50%, -50%);">
            <div style="width: ${isSelected ? 14 : 10}px; height: ${isSelected ? 14 : 10}px; background: ${isSelected ? '#e11d48' : '#ffffff'}; border-radius: 50%; border: 2px solid ${isSelected ? '#ffe4e6' : '#133654'}; box-shadow: 0 1.5px 4px rgba(0,0,0,0.35);"></div>
            <div style="position: absolute; bottom: -12px; background: rgba(255, 255, 255, 0.88); color: #0f172a; font-weight: 700; font-size: 8px; padding: 0.5px 4px; border-radius: 4px; border: 1px solid rgba(203, 213, 225, 0.9); white-space: nowrap; box-shadow: 0 1px 2px rgba(0,0,0,0.2); line-height: 1.15;">
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
  }, [locations, routes, highlightedPath, selectedLocationId, language, showDistances, selectedIds, onToggleItinerary, mapStyle]);

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
    <div className="relative w-full h-full min-h-[640px] rounded-3xl overflow-hidden border border-[#d7ccbb] shadow-sm bg-slate-100 flex flex-col" style={{ height: mapHeight }}>
      
      {/* Top Floating Map Controls */}
      <div className="absolute top-3 left-3 right-12 z-20 flex flex-wrap items-center gap-2">
        
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
          <span>{isVi ? 'Cự ly đường' : 'Road distances'}</span>
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
      <div ref={mapContainerRef} className="w-full flex-1 min-h-[640px] z-10" />

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700/80 text-[11px] font-bold text-white shadow-lg flex items-center gap-2.5 pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#133654] border-2 border-[#f59e0b]" />
            <span className="text-amber-300">THPT Thăng Long</span>
          </div>
          <div className="w-[1px] h-3.5 bg-slate-700" />
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#047857] border border-white" />
            <span>{isVi ? 'Điểm lộ trình' : 'Route stops'}</span>
          </div>
          <div className="w-[1px] h-3.5 bg-slate-700" />
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-1.5 rounded-full bg-[#f59e0b] ring-2 ring-[#091a2b]" />
            <span className="text-slate-200">{isVi ? 'Tuyến đi chính' : 'Active path'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {highlightedPath.length > 1 && (
            <button
              onClick={() => {
                if (mapInstanceRef.current) {
                  fitMapToActiveRoute(mapInstanceRef.current, highlightedPath, locations);
                }
              }}
              className="bg-[#133654]/95 hover:bg-[#133654] text-amber-300 text-xs font-bold px-3 py-1.5 rounded-2xl border border-amber-400/50 shadow-lg transition-colors cursor-pointer"
            >
              {isVi ? '🔍 Phóng to lộ trình' : '🔍 Fit route'}
            </button>
          )}
          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.setView([21.0285, 105.8250], 13.5);
              }
            }}
            className="bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-2xl border border-slate-700/80 shadow-lg transition-colors cursor-pointer"
          >
            {isVi ? '🎯 Trung tâm Hà Nội' : '🎯 Center on Hanoi'}
          </button>
        </div>
      </div>

    </div>
  );
};
