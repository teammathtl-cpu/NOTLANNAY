import React, { useState, useMemo } from 'react';
import { TouristLocation, Route, Language } from '../types';
import { 
  getDirectDistance, 
  calculateTravelTimes, 
  calculateHaversineDistance 
} from '../utils/graphAlgorithms';
import { 
  Ruler, 
  MapPin, 
  Footprints, 
  Bike, 
  Car, 
  Sparkles, 
  School, 
  ArrowRight, 
  ExternalLink, 
  Compass, 
  Layers, 
  BarChart3, 
  Navigation,
  Flame,
  Clock
} from 'lucide-react';

interface DistanceMatrixViewProps {
  locations: TouristLocation[];
  routes: Route[];
  language: Language;
  onSelectRouteForPlanner: (startId: string, endId: string) => void;
  onOpenMap: (locId: string) => void;
  onSelectLocationDetail: (loc: TouristLocation) => void;
}

export const DistanceMatrixView: React.FC<DistanceMatrixViewProps> = ({
  locations,
  routes,
  language,
  onSelectRouteForPlanner,
  onOpenMap,
  onSelectLocationDetail,
}) => {
  const isVi = language === 'vi';

  // State for active pairwise lookup
  const [selectedFromId, setSelectedFromId] = useState<string>('TL');
  const [selectedToId, setSelectedToId] = useState<string>('BH');

  // State for Hub filter
  const [hubFocusId, setHubFocusId] = useState<string>('TL');

  // Search filter for table
  const [filterText, setFilterText] = useState<string>('');

  // Map of location by ID
  const locationMap = useMemo(() => {
    return new Map(locations.map(l => [l.id, l]));
  }, [locations]);

  // Lookup Distance for current pair
  const currentPairDistance = useMemo(() => {
    if (selectedFromId === selectedToId) return 0;
    const direct = getDirectDistance(selectedFromId, selectedToId, routes);
    if (direct !== null) return direct;

    const loc1 = locationMap.get(selectedFromId);
    const loc2 = locationMap.get(selectedToId);
    if (loc1 && loc2) {
      return Math.round(calculateHaversineDistance(loc1.lat, loc1.lng, loc2.lat, loc2.lng) * 1.25 * 10) / 10;
    }
    return 0;
  }, [selectedFromId, selectedToId, routes, locationMap]);

  const travelTimes = useMemo(() => {
    return calculateTravelTimes(currentPairDistance);
  }, [currentPairDistance]);

  const fromLocation = locationMap.get(selectedFromId);
  const toLocation = locationMap.get(selectedToId);

  // Hub Distances sorted
  const hubDistances = useMemo(() => {
    const hubLoc = locationMap.get(hubFocusId);
    if (!hubLoc) return [];

    const list = locations
      .filter(l => l.id !== hubFocusId)
      .map(targetLoc => {
        let dist = getDirectDistance(hubFocusId, targetLoc.id, routes);
        if (dist === null) {
          dist = Math.round(calculateHaversineDistance(hubLoc.lat, hubLoc.lng, targetLoc.lat, targetLoc.lng) * 1.25 * 10) / 10;
        }
        return {
          location: targetLoc,
          distanceKm: dist,
          times: calculateTravelTimes(dist),
        };
      });

    return list.sort((a, b) => a.distanceKm - b.distanceKm);
  }, [hubFocusId, locations, routes, locationMap]);

  // Distance Matrix calculation
  const matrixData = useMemo(() => {
    const matrix: Record<string, Record<string, number>> = {};
    locations.forEach(r => {
      matrix[r.id] = {};
      locations.forEach(c => {
        if (r.id === c.id) {
          matrix[r.id][c.id] = 0;
        } else {
          let d = getDirectDistance(r.id, c.id, routes);
          if (d === null) {
            d = Math.round(calculateHaversineDistance(r.lat, r.lng, c.lat, c.lng) * 1.25 * 10) / 10;
          }
          matrix[r.id][c.id] = d;
        }
      });
    });
    return matrix;
  }, [locations, routes]);

  // Network stats
  const networkStats = useMemo(() => {
    let minDist = Infinity;
    let minPair = '';
    let maxDist = 0;
    let maxPair = '';
    let totalDist = 0;
    let count = 0;

    for (let i = 0; i < locations.length; i++) {
      for (let j = i + 1; j < locations.length; j++) {
        const d = matrixData[locations[i].id]?.[locations[j].id] || 0;
        if (d > 0) {
          totalDist += d;
          count++;
          if (d < minDist) {
            minDist = d;
            minPair = `${locations[i].label} ↔ ${locations[j].label}`;
          }
          if (d > maxDist) {
            maxDist = d;
            maxPair = `${locations[i].label} ↔ ${locations[j].label}`;
          }
        }
      }
    }

    return {
      minDist: minDist === Infinity ? 0 : minDist,
      minPair,
      maxDist,
      maxPair,
      avgDist: count > 0 ? Math.round((totalDist / count) * 10) / 10 : 0,
      totalPairs: count,
    };
  }, [locations, matrixData]);

  // Color shading helper
  const getCellBadgeClass = (distance: number) => {
    if (distance === 0) return 'text-slate-600 bg-slate-900/40';
    if (distance <= 1.5) return 'text-emerald-400 bg-emerald-500/15 font-bold border border-emerald-500/30';
    if (distance <= 3.5) return 'text-teal-300 bg-teal-500/10 font-semibold';
    if (distance <= 6.0) return 'text-amber-300 bg-amber-500/10 font-semibold';
    return 'text-rose-300 bg-rose-500/10 font-medium';
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner & Quick Pairwise Distance Lookup */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Ruler className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                {isVi ? 'Bảng Tra Cứu Khoảng Cách Toàn Diện Hà Nội' : 'Hanoi Comprehensive Distance Matrix & Calculator'}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isVi 
                ? 'Đã bổ sung đầy đủ khoảng cách thực tế giữa 14 địa danh (91 cặp kết nối) xuất phát từ THPT Thăng Long' 
                : 'Fully supplemented realistic road distances across all 14 landmarks (91 pairwise connections) centered at Thang Long High School'}
            </p>
          </div>

          {/* Quick Hub switch */}
          <button
            onClick={() => {
              setSelectedFromId('TL');
              setSelectedToId('BH');
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30 transition-all flex items-center gap-1.5"
          >
            <School className="w-3.5 h-3.5" />
            <span>{isVi ? 'Khoảng cách THPT Thăng Long → Bờ Hồ' : 'Reset to Thang Long → Hoan Kiem'}</span>
          </button>
        </div>

        {/* Pairwise Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Point A */}
          <div className="md:col-span-5 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
            <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between mb-1.5">
              <span>{isVi ? 'Điểm xuất phát (A):' : 'Origin (A):'}</span>
              {selectedFromId === 'TL' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                  {isVi ? 'Trường học' : 'School'}
                </span>
              )}
            </label>
            <select
              value={selectedFromId}
              onChange={e => setSelectedFromId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 font-semibold focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.label} — {isVi ? loc.fullName : (loc.fullNameEn || loc.fullName)}
                </option>
              ))}
            </select>
            {fromLocation && (
              <div className="text-[11px] text-slate-400 mt-1.5 truncate">
                📍 {fromLocation.neighborhood}
              </div>
            )}
          </div>

          {/* Switcher Arrow */}
          <div className="md:col-span-2 flex justify-center">
            <button
              onClick={() => {
                const temp = selectedFromId;
                setSelectedFromId(selectedToId);
                setSelectedToId(temp);
              }}
              title={isVi ? 'Đảo ngược chiều đi' : 'Swap origin & destination'}
              className="p-3 rounded-full bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-slate-700 transition-all shadow-md group cursor-pointer"
            >
              <ArrowRight className="w-4 h-4 group-hover:rotate-180 transition-transform" />
            </button>
          </div>

          {/* Point B */}
          <div className="md:col-span-5 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
            <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between mb-1.5">
              <span>{isVi ? 'Điểm đến (B):' : 'Destination (B):'}</span>
              <span className="text-[10px] text-slate-400">
                {toLocation?.category}
              </span>
            </label>
            <select
              value={selectedToId}
              onChange={e => setSelectedToId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 font-semibold focus:outline-none focus:border-emerald-400 cursor-pointer"
            >
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.label} — {isVi ? loc.fullName : (loc.fullNameEn || loc.fullName)}
                </option>
              ))}
            </select>
            {toLocation && (
              <div className="text-[11px] text-slate-400 mt-1.5 truncate">
                📍 {toLocation.neighborhood}
              </div>
            )}
          </div>

        </div>

        {/* Large Result Distance Showcase */}
        <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-5">
          
          <div className="flex items-center gap-4">
            <div className="text-center sm:text-left">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                {isVi ? 'Khoảng cách di chuyển thực tế:' : 'Actual Road Distance:'}
              </div>
              <div className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight flex items-baseline gap-1 mt-0.5">
                <span>{currentPairDistance}</span>
                <span className="text-base sm:text-lg font-bold text-slate-300">km</span>
              </div>
            </div>

            <div className="h-10 w-[1px] bg-slate-800 hidden sm:block" />

            {/* Travel Time Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-300">
              <div className="bg-slate-900/90 border border-slate-800 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5">
                <Footprints className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400">{isVi ? 'Đi bộ' : 'Walk'}</div>
                  <div className="font-bold text-slate-200">{travelTimes.walkMinutes} {isVi ? 'ph' : 'm'}</div>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5">
                <Bike className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400">{isVi ? 'Xe đạp' : 'Bike'}</div>
                  <div className="font-bold text-slate-200">{travelTimes.bikeMinutes} {isVi ? 'ph' : 'm'}</div>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400">{isVi ? 'Xe máy' : 'Moto'}</div>
                  <div className="font-bold text-slate-200">{travelTimes.motoMinutes} {isVi ? 'ph' : 'm'}</div>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400">{isVi ? 'Calo tiêu thụ' : 'Calories'}</div>
                  <div className="font-bold text-slate-200">{travelTimes.caloriesBurnedWalk} kcal</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => onSelectRouteForPlanner(selectedFromId, selectedToId)}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>{isVi ? 'Lập Lộ Trình Tour' : 'Plan Tour Route'}</span>
            </button>

            {fromLocation && toLocation && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(fromLocation.fullName + ', Hanoi')}&destination=${encodeURIComponent(toLocation.fullName + ', Hanoi')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title={isVi ? 'Mở chỉ đường trên Google Maps' : 'Open in Google Maps'}
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Google Maps</span>
              </a>
            )}
          </div>

        </div>

      </div>

      {/* 2. Network Statistics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400">{isVi ? 'Tổng số cặp khoảng cách' : 'Total Distance Pairs'}</div>
          <div className="text-xl sm:text-2xl font-black text-white mt-1">
            {networkStats.totalPairs} <span className="text-xs font-normal text-slate-400">{isVi ? 'cặp liên kết' : 'pairs'}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400">{isVi ? 'Khoảng cách gần nhất' : 'Shortest Pair'}</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
            {networkStats.minDist} km
          </div>
          <div className="text-[10px] text-slate-400 truncate mt-0.5">{networkStats.minPair}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400">{isVi ? 'Khoảng cách xa nhất' : 'Longest Pair'}</div>
          <div className="text-xl sm:text-2xl font-black text-rose-400 mt-1">
            {networkStats.maxDist} km
          </div>
          <div className="text-[10px] text-slate-400 truncate mt-0.5">{networkStats.maxPair}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400">{isVi ? 'Khoảng cách trung bình' : 'Average Distance'}</div>
          <div className="text-xl sm:text-2xl font-black text-sky-400 mt-1">
            {networkStats.avgDist} km
          </div>
          <div className="text-[10px] text-slate-400 truncate mt-0.5">{isVi ? 'Phù hợp tour trong ngày' : 'Ideal 1-day tours'}</div>
        </div>
      </div>

      {/* 3. Distance from THPT Thang Long / Hub Center */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <School className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-extrabold text-white text-base">
                {isVi ? 'Khoảng Cách Từ Tâm Điểm Đến 13 Danh Thắng Còn Lại' : 'Distances from Hub to All Other Landmarks'}
              </h3>
              <p className="text-xs text-slate-400">
                {isVi 
                  ? 'Sắp xếp theo thứ tự cự ly từ gần nhất đến xa nhất' 
                  : 'Ranked by distance from nearest to farthest'}
              </p>
            </div>
          </div>

          {/* Select Hub */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{isVi ? 'Chọn tâm điểm:' : 'Select Hub:'}</span>
            <select
              value={hubFocusId}
              onChange={e => setHubFocusId(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none"
            >
              {locations.map(l => (
                <option key={l.id} value={l.id}>
                  {l.id === 'TL' ? '🏛️ ' : '📍 '}{l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Distance Progress Bars List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {hubDistances.map((item, idx) => {
            const maxRefKm = 10;
            const percent = Math.min(100, Math.round((item.distanceKm / maxRefKm) * 100));

            return (
              <div
                key={item.location.id}
                onClick={() => {
                  setSelectedFromId(hubFocusId);
                  setSelectedToId(item.location.id);
                }}
                className="group p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-200 group-hover:text-amber-300 transition-colors">
                        {isVi ? item.location.fullName : (item.location.fullNameEn || item.location.fullName)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {item.location.category} • {item.location.label}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-extrabold text-amber-400">
                      {item.distanceKm} <span className="text-xs font-normal text-slate-400">km</span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3 text-sky-400" />
                      <span>{item.times.motoMinutes} {isVi ? 'ph xe máy' : 'min'}</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* 4. Full 14x14 Interactive Distance Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>{isVi ? 'Ma Trận Khoảng Cách Toàn Bộ 14 Địa Danh (14 × 14)' : 'Complete 14 × 14 Distance Matrix Table'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isVi 
                ? 'Nhấp vào bất kỳ ô số nào để tự động thiết lập và tính toán đường đi giữa 2 địa điểm đó.' 
                : 'Click any cell to immediately select the pair and calculate routing.'}
            </p>
          </div>

          {/* Color legend */}
          <div className="flex items-center gap-2 text-[11px] text-slate-300">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500" />
              <span>≤ 1.5 km</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-teal-500/20 border border-teal-500" />
              <span>1.5 - 3.5 km</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-amber-500/20 border border-amber-500" />
              <span>3.5 - 6 km</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-rose-500/20 border border-rose-500" />
              <span>&gt; 6 km</span>
            </span>
          </div>
        </div>

        {/* Scrollable Matrix Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950/70">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-300 border-b border-slate-800">
                <th className="sticky left-0 z-20 bg-slate-900 p-2.5 text-left font-bold text-amber-400 min-w-[120px] border-r border-slate-800">
                  {isVi ? 'Địa điểm' : 'Location'}
                </th>
                {locations.map(col => (
                  <th
                    key={col.id}
                    className="p-2.5 font-bold min-w-[64px] hover:text-amber-400 transition-colors whitespace-nowrap"
                    title={col.fullName}
                  >
                    {col.id === 'TL' ? '🏛️ ' : ''}{col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {locations.map(row => {
                const isRowTL = row.id === 'TL';

                return (
                  <tr
                    key={row.id}
                    className="border-b border-slate-800/60 hover:bg-slate-900/60 transition-colors"
                  >
                    {/* Sticky row label */}
                    <td
                      className={`sticky left-0 z-10 p-2.5 text-left font-semibold border-r border-slate-800 whitespace-nowrap cursor-pointer ${
                        isRowTL ? 'bg-slate-900 text-amber-400' : 'bg-slate-950 text-slate-200'
                      }`}
                      onClick={() => onSelectLocationDetail(row)}
                      title={row.fullName}
                    >
                      {isRowTL ? '🏛️ ' : ''}{row.label}
                    </td>

                    {/* Distance cells */}
                    {locations.map(col => {
                      const dist = matrixData[row.id]?.[col.id] || 0;
                      const isSelectedCell =
                        (selectedFromId === row.id && selectedToId === col.id) ||
                        (selectedFromId === col.id && selectedToId === row.id);

                      return (
                        <td
                          key={col.id}
                          onClick={() => {
                            if (row.id !== col.id) {
                              setSelectedFromId(row.id);
                              setSelectedToId(col.id);
                            }
                          }}
                          className={`p-2 transition-all cursor-pointer ${
                            isSelectedCell
                              ? 'ring-2 ring-amber-400 bg-amber-500/25 font-black text-amber-200'
                              : ''
                          }`}
                        >
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${getCellBadgeClass(dist)}`}
                          >
                            {dist === 0 ? '—' : `${dist}`}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
