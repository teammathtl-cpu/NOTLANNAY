import React, { useState } from 'react';
import { TouristLocation, Route, PresetSelectionMap, Language } from '../types';
import { 
  Database, 
  Copy, 
  Check, 
  Plus, 
  RotateCcw, 
  Download, 
  Layers, 
  MapPin, 
  Route as RouteIcon,
  Trash2
} from 'lucide-react';
import { calculateHaversineDistance } from '../utils/graphAlgorithms';

interface DataManagerModalProps {
  locations: TouristLocation[];
  setLocations: React.Dispatch<React.SetStateAction<TouristLocation[]>>;
  routes: Route[];
  setRoutes: React.Dispatch<React.SetStateAction<Route[]>>;
  presets: PresetSelectionMap;
  language: Language;
  onResetData: () => void;
}

export const DataManagerModal: React.FC<DataManagerModalProps> = ({
  locations,
  setLocations,
  routes,
  setRoutes,
  presets,
  language,
  onResetData,
}) => {
  const isVi = language === 'vi';
  const [copied, setCopied] = useState(false);

  // New Route Form State
  const [newFrom, setNewFrom] = useState(locations[0]?.id || 'TL');
  const [newTo, setNewTo] = useState(locations[1]?.id || 'BH');
  const [newDistance, setNewDistance] = useState<number>(3.5);

  // Auto-calculate suggested distance when selection changes
  const handleSelectFrom = (id: string) => {
    setNewFrom(id);
    const loc1 = locations.find(l => l.id === id);
    const loc2 = locations.find(l => l.id === newTo);
    if (loc1 && loc2) {
      setNewDistance(calculateHaversineDistance(loc1.lat, loc1.lng, loc2.lat, loc2.lng));
    }
  };

  const handleSelectTo = (id: string) => {
    setNewTo(id);
    const loc1 = locations.find(l => l.id === newFrom);
    const loc2 = locations.find(l => l.id === id);
    if (loc1 && loc2) {
      setNewDistance(calculateHaversineDistance(loc1.lat, loc1.lng, loc2.lat, loc2.lng));
    }
  };

  const handleAddRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFrom === newTo) return;

    // Check if route already exists
    const exists = routes.some(
      r => (r.from === newFrom && r.to === newTo) || (r.from === newTo && r.to === newFrom)
    );
    if (exists) {
      alert(isVi ? 'Tuyến đường giữa hai điểm này đã tồn tại!' : 'Route already exists!');
      return;
    }

    const routeId = `${newFrom}__${newTo}`;
    const newRoute: Route = {
      id: routeId,
      from: newFrom,
      to: newTo,
      distanceKm: Number(newDistance) || 1.0,
    };

    setRoutes(prev => [...prev, newRoute]);
  };

  const handleDeleteRoute = (id: string) => {
    setRoutes(prev => prev.filter(r => r.id !== id));
  };

  // Generate full TypeScript code representation
  const generateTsCode = () => {
    return `import { GraphData, PresetSelectionMap, Route, TouristLocation } from '../types';

/**
 * Du lieu duoc dong bo truc tiep tu Supabase vao ngay 2026-04-07.
 * Neu can cap nhat tiep, chi viec sua file nay va build lai web.
 */

export const INITIAL_LOCATIONS: TouristLocation[] = ${JSON.stringify(locations, null, 2)};

export const INITIAL_ROUTES: Route[] = ${JSON.stringify(routes, null, 2)};

export const INITIAL_GRAPH_DATA: GraphData = {
  locations: INITIAL_LOCATIONS,
  routes: INITIAL_ROUTES,
};

export const PRESET_SELECTIONS: PresetSelectionMap = ${JSON.stringify(presets, null, 2)};
`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateTsCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const code = generateTsCode();
    const blob = new Blob([code], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'graphData.ts';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            <span>{isVi ? 'Đồng bộ Dữ liệu & Quản trị Tuyến đường' : 'Data Sync & Route Management'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isVi 
              ? 'Dữ liệu đồng bộ trực tiếp từ Supabase (2026-04-07). Bạn có thể thêm cung đường, chỉnh sửa và xuất mã nguồn.' 
              : 'Directly synchronized from Supabase. Add connections, adjust weights, and export updated code.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isVi ? 'Khôi phục gốc' : 'Reset Data'}</span>
          </button>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (isVi ? 'Đã sao chép!' : 'Copied!') : (isVi ? 'Sao chép TS' : 'Copy Code')}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isVi ? 'Tải file .ts' : 'Download'}</span>
          </button>
        </div>
      </div>

      {/* Stats counter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">{isVi ? 'Địa danh' : 'Locations'}</div>
          <div className="text-xl font-extrabold text-amber-400">{locations.length}</div>
        </div>
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">{isVi ? 'Tuyến đường (Cạnh đồ thị)' : 'Routes (Edges)'}</div>
          <div className="text-xl font-extrabold text-emerald-400">{routes.length}</div>
        </div>
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">{isVi ? 'Tour đề xuất' : 'Preset Tours'}</div>
          <div className="text-xl font-extrabold text-sky-400">{Object.keys(presets).length}</div>
        </div>
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">{isVi ? 'Trọng tâm khởi hành' : 'Hub Node'}</div>
          <div className="text-sm font-bold text-white truncate">THPT Thăng Long</div>
        </div>
      </div>

      {/* Add New Route Form */}
      <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Plus className="w-4 h-4 text-amber-400" />
          <span>{isVi ? 'Nối tuyến đường mới giữa 2 địa danh' : 'Connect New Route Between Locations'}</span>
        </h3>

        <form onSubmit={handleAddRoute} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              {isVi ? 'Từ điểm:' : 'From:'}
            </label>
            <select
              value={newFrom}
              onChange={e => handleSelectFrom(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
            >
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.label} ({l.id})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              {isVi ? 'Đến điểm:' : 'To:'}
            </label>
            <select
              value={newTo}
              onChange={e => handleSelectTo(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
            >
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.label} ({l.id})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              {isVi ? 'Khoảng cách (km):' : 'Distance (km):'}
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={newDistance}
              onChange={e => setNewDistance(parseFloat(e.target.value) || 0.1)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isVi ? 'Thêm Tuyến' : 'Add Route'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Routes List Table / Scroll */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {isVi ? 'Danh sách các cạnh đồ thị hiện hành' : 'Current Graph Edges'}
        </h3>
        <div className="max-h-56 overflow-y-auto border border-slate-800 rounded-xl bg-slate-950/60 divide-y divide-slate-800/60">
          {routes.map(r => {
            const fromLoc = locations.find(l => l.id === r.from);
            const toLoc = locations.find(l => l.id === r.to);

            return (
              <div key={r.id} className="p-2.5 px-4 flex items-center justify-between text-xs hover:bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200">{fromLoc?.label || r.from}</span>
                  <span className="text-slate-500">↔</span>
                  <span className="font-bold text-slate-200">{toLoc?.label || r.to}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 font-semibold text-[11px] border border-slate-700">
                    {r.distanceKm} km
                  </span>
                  <button
                    onClick={() => handleDeleteRoute(r.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title={isVi ? 'Xóa tuyến này' : 'Delete route'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Code Preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{isVi ? 'Mã TypeScript định dạng (src/data/graphData.ts):' : 'Formatted TypeScript output:'}</span>
          <button
            onClick={handleCopyCode}
            className="text-amber-400 hover:underline flex items-center gap-1"
          >
            <Copy className="w-3 h-3" />
            <span>{isVi ? 'Sao chép nhanh' : 'Copy'}</span>
          </button>
        </div>
        <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 max-h-48 overflow-y-auto overflow-x-auto select-all">
          {generateTsCode().slice(0, 1200)}...
        </pre>
      </div>

    </div>
  );
};
