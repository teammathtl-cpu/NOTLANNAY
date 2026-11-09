import React, { useState, useMemo } from 'react';
import { TouristLocation, Route, ModeType, Language } from '../types';
import { getDirectDistance } from '../utils/graphAlgorithms';
import { 
  ArrowRight, 
  RotateCcw, 
  Layers, 
  Compass, 
  Clock, 
  MapPin, 
  Sparkles, 
  School, 
  Car, 
  Bike, 
  Footprints, 
  Share2, 
  Table, 
  Eye, 
  CheckCircle2,
  Navigation
} from 'lucide-react';

interface SubgraphPreviewProps {
  locations: TouristLocation[];
  routes: Route[];
  selectedIds: string[];
  startId: string;
  endId: string;
  previewPath: string[];
  currentMode: ModeType;
  language: Language;
  onAdvanceToResult: () => void;
  onBackToSelect: () => void;
  onSelectLocation?: (loc: TouristLocation) => void;
}

export const SubgraphPreview: React.FC<SubgraphPreviewProps> = ({
  locations,
  routes,
  selectedIds,
  startId,
  endId,
  previewPath,
  currentMode,
  language,
  onAdvanceToResult,
  onBackToSelect,
  onSelectLocation,
}) => {
  const isVi = language === 'vi';
  const [activeTab, setActiveTab] = useState<'path' | 'graph' | 'matrix'>('path');
  const [selectedEdgeInfo, setSelectedEdgeInfo] = useState<{ from: string; to: string; dist: number } | null>(null);

  const locationMap = useMemo(() => new Map(locations.map(l => [l.id, l])), [locations]);

  // Selected locations subset
  const selectedLocations = useMemo(() => {
    return selectedIds.map(id => locationMap.get(id)).filter(Boolean) as TouristLocation[];
  }, [selectedIds, locationMap]);

  // Fallback path if previewPath is empty
  const effectivePath = useMemo(() => {
    if (previewPath && previewPath.length > 1) return previewPath;
    if (currentMode === 'cycle') {
      return [...selectedIds, selectedIds[0]];
    }
    if (currentMode === 'path' || currentMode === 'subset') {
      const remaining = selectedIds.filter(id => id !== startId && id !== endId);
      return [startId, ...remaining, endId].filter(Boolean);
    }
    return selectedIds;
  }, [previewPath, selectedIds, currentMode, startId, endId]);

  // Sequential segments of the tour
  const segments = useMemo(() => {
    const list: Array<{
      fromLoc: TouristLocation;
      toLoc: TouristLocation;
      distanceKm: number;
      stepNumber: number;
    }> = [];

    for (let i = 0; i < effectivePath.length - 1; i++) {
      const u = effectivePath[i];
      const v = effectivePath[i + 1];
      const fromLoc = locationMap.get(u);
      const toLoc = locationMap.get(v);
      if (fromLoc && toLoc) {
        const dist = getDirectDistance(u, v, routes) || 0;
        list.push({
          fromLoc,
          toLoc,
          distanceKm: dist,
          stepNumber: i + 1,
        });
      }
    }
    return list;
  }, [effectivePath, locationMap, routes]);

  // Total tour distance preview
  const totalPreviewDistance = useMemo(() => {
    return segments.reduce((sum, s) => sum + s.distanceKm, 0).toFixed(1);
  }, [segments]);

  // Relative positions for circular subgraph layout
  const graphNodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const count = selectedIds.length;
    if (count === 0) return positions;

    const width = 560;
    const height = 360;
    const cx = width / 2;
    const cy = height / 2;
    const rx = 210;
    const ry = 130;

    selectedIds.forEach((id, idx) => {
      // Place start node (TL) at the top (-PI/2)
      const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / count;
      positions[id] = {
        x: Math.round(cx + rx * Math.cos(angle)),
        y: Math.round(cy + ry * Math.sin(angle)),
      };
    });

    return positions;
  }, [selectedIds]);

  // Subgraph edges between selected nodes
  const subgraphEdges = useMemo(() => {
    const setIds = new Set(selectedIds);
    const seen = new Set<string>();
    const edges: Array<{
      id: string;
      from: string;
      to: string;
      distanceKm: number;
      isTourPath: boolean;
    }> = [];

    // Path edge set for fast check
    const pathEdgeSet = new Set<string>();
    for (let i = 0; i < effectivePath.length - 1; i++) {
      const u = effectivePath[i];
      const v = effectivePath[i + 1];
      pathEdgeSet.add(`${u}__${v}`);
      pathEdgeSet.add(`${v}__${u}`);
    }

    routes.forEach(r => {
      if (setIds.has(r.from) && setIds.has(r.to)) {
        const pairKey = [r.from, r.to].sort().join('__');
        if (!seen.has(pairKey)) {
          seen.add(pairKey);
          edges.push({
            id: r.id,
            from: r.from,
            to: r.to,
            distanceKm: r.distanceKm,
            isTourPath: pathEdgeSet.has(`${r.from}__${r.to}`),
          });
        }
      }
    });

    return edges;
  }, [selectedIds, routes, effectivePath]);

  return (
    <div className="space-y-4">
      
      {/* 1. Header Banner: Mode & Distance Summary */}
      <div className="bg-gradient-to-br from-[#133654] via-[#1a446a] to-[#255780] text-white p-4 sm:p-5 rounded-2xl shadow-sm border border-[#d7ccbb]/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-black tracking-wide mb-1.5">
              <Compass className="w-3.5 h-3.5" />
              <span>{isVi ? 'Bước 2 — Xem Trước Đồ Thị & Dạng Đường Đi' : 'Step 2 — Graph & Path Preview'}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>{isVi ? 'Mô hình hóa lộ trình' : 'Tour Route Model'}:</span>
              <span className="text-amber-300 font-extrabold">{selectedIds.length} {isVi ? 'địa điểm' : 'stops'}</span>
            </h3>
            <p className="text-xs text-white/80 mt-0.5 leading-relaxed">
              {currentMode === 'cycle'
                ? (isVi ? 'Chu trình khép kín xuất phát từ THPT Thăng Long, đi qua các điểm và quay trở về trường.' : 'Closed Hamiltonian loop starting and returning to Thang Long High School.')
                : currentMode === 'path'
                ? (isVi ? 'Đường đi một chiều từ cổng trường đến điểm hẹn kết thúc danh thắng.' : 'One-way Hamiltonian path from school to destination landmark.')
                : (isVi ? 'Đường đi ngắn nhất giữa hai điểm trong tập các địa danh được quan tâm.' : 'Shortest path inside selected subset of landmarks.')}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
              {isVi ? 'Cự ly ước tính sơ bộ' : 'Estimated distance'}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white flex items-baseline justify-end gap-1">
              <span>{totalPreviewDistance}</span>
              <span className="text-xs font-bold text-slate-300">km</span>
            </div>
            <div className="text-[10px] text-white/80 flex items-center justify-end gap-1.5 mt-0.5">
              <span>🛵 ~{Math.round(Number(totalPreviewDistance) * 2.2)} {isVi ? 'phút' : 'mins'}</span>
              <span>•</span>
              <span>{segments.length} {isVi ? 'chặng' : 'legs'}</span>
            </div>
          </div>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-white/15 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('path')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'path'
                ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{isVi ? 'Dạng đường đi theo chặng' : 'Sequential Path Route'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('graph')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'graph'
                ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isVi ? 'Mạng lưới đồ thị con' : 'Interactive Subgraph'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'matrix'
                ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>{isVi ? 'Ma trận khoảng cách tập chọn' : 'Distance Sub-Matrix'}</span>
          </button>
        </div>
      </div>

      {/* 2. TAB CONTENT 1: DẠNG ĐƯỜNG ĐI THEO CHẶNG (SEQUENTIAL ROUTE FLOW) */}
      {activeTab === 'path' && (
        <div className="bg-white border border-[#d7ccbb] p-4 sm:p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#e6ded1]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h4 className="font-black text-sm text-[#133654]">
                {isVi ? 'Chi Tiết Dạng Đường Đi Từng Chặng' : 'Step-by-Step Path Sequence'}
              </h4>
            </div>
            <span className="text-xs font-extrabold text-slate-500">
              {segments.length} {isVi ? 'đoạn nối' : 'segments'}
            </span>
          </div>

          {/* Sequential Step Cards with Midpoint Distance Badges */}
          <div className="space-y-3">
            {segments.map((seg, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === segments.length - 1;

              return (
                <div key={`${seg.fromLoc.id}-${seg.toLoc.id}-${idx}`} className="relative">
                  
                  {/* Origin Stop Card */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#fbf8f3] border border-[#e6ded1] hover:border-[#133654]/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-2xs ${
                        seg.fromLoc.id === 'TL'
                          ? 'bg-[#133654] text-amber-300 border border-amber-400'
                          : 'bg-emerald-600 text-white'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-[#133654] flex items-center gap-2">
                          <span>{seg.fromLoc.label}</span>
                          {seg.fromLoc.id === 'TL' && (
                            <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                              {isVi ? 'Khởi hành' : 'Origin'}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium line-clamp-1">
                          {seg.fromLoc.fullName}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectLocation?.(seg.fromLoc)}
                      className="px-2.5 py-1 text-[11px] font-bold text-[#133654] hover:bg-[#133654]/10 rounded-lg transition-colors cursor-pointer"
                    >
                      {isVi ? 'Chi tiết' : 'Info'}
                    </button>
                  </div>

                  {/* Midpoint Connecting Line & Distance Badge */}
                  <div className="my-1.5 pl-6 flex items-center gap-3 relative">
                    <div className="w-0.5 h-10 bg-gradient-to-b from-amber-400 to-[#133654] ml-1" />
                    
                    <div className="flex-1 flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-gradient-to-r from-amber-50 to-[#fdf9f2] border border-amber-300/80 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-600 font-black text-xs">➔</span>
                        <div className="text-xs font-black text-[#133654]">
                          {isVi ? `Chặng ${seg.stepNumber}` : `Leg ${seg.stepNumber}`}:
                        </div>
                        <div className="px-2 py-0.5 rounded-full bg-[#133654] text-amber-300 font-black text-xs shadow-xs border border-amber-400/50">
                          📍 {seg.distanceKm} km
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-600 font-medium">
                        <span className="flex items-center gap-1">
                          <span>🛵</span>
                          <span>~{Math.round(seg.distanceKm * 2.2)} {isVi ? 'phút xe máy' : 'mins'}</span>
                        </span>
                        <span className="hidden sm:flex items-center gap-1">
                          <span>🚶</span>
                          <span>~{Math.round(seg.distanceKm * 13)} {isVi ? 'phút đi bộ' : 'mins walk'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* If last segment, also render the final destination stop card */}
                  {isLast && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#fbf8f3] border border-[#e6ded1] hover:border-[#133654]/40 transition-colors mt-1.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-2xs ${
                          seg.toLoc.id === 'TL'
                            ? 'bg-[#133654] text-amber-300 border border-amber-400'
                            : 'bg-rose-600 text-white'
                        }`}>
                          {idx + 2}
                        </div>
                        <div>
                          <div className="font-extrabold text-sm text-[#133654] flex items-center gap-2">
                            <span>{seg.toLoc.label}</span>
                            {seg.toLoc.id === 'TL' ? (
                              <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                                {isVi ? 'Về đích (Khép kín)' : 'Finish Loop'}
                              </span>
                            ) : (
                              <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-900 border border-rose-300">
                                {isVi ? 'Điểm kết thúc' : 'Destination'}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium line-clamp-1">
                            {seg.toLoc.fullName}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectLocation?.(seg.toLoc)}
                        className="px-2.5 py-1 text-[11px] font-bold text-[#133654] hover:bg-[#133654]/10 rounded-lg transition-colors cursor-pointer"
                      >
                        {isVi ? 'Chi tiết' : 'Info'}
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. TAB CONTENT 2: MẠNG LƯỚI ĐỒ THỊ CON TƯƠNG TÁC (INTERACTIVE SUBGRAPH SVG) */}
      {activeTab === 'graph' && (
        <div className="bg-white border border-[#d7ccbb] p-4 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#e6ded1]">
            <div>
              <h4 className="font-black text-sm text-[#133654] flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-amber-600" />
                <span>{isVi ? 'Đồ Thị Con — Tập Hợp Các Đỉnh & Cạnh Được Chọn' : 'Subgraph Topology & Edge Weights'}</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isVi ? 'Mỗi cạnh thể hiện khoảng cách trực tiếp (km) ở giữa con đường nối giữa 2 địa danh.' : 'Edges represent direct distances with weights labeled at midpoint.'}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                <span className="text-[10px]">{isVi ? 'Tuyến đi' : 'Tour route'}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span className="text-[10px]">{isVi ? 'Liên kết khác' : 'Other link'}</span>
              </span>
            </div>
          </div>

          {/* SVG Canvas for Subgraph */}
          <div className="relative w-full h-[360px] bg-gradient-to-b from-[#fdfbf7] to-[#f4eee3] rounded-2xl border border-[#d7ccbb] overflow-hidden flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 560 360">
              <defs>
                <filter id="glow-gold-preview" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* 1. Draw Edges */}
              <g className="edges">
                {subgraphEdges.map(edge => {
                  const p1 = graphNodePositions[edge.from];
                  const p2 = graphNodePositions[edge.to];
                  if (!p1 || !p2) return null;

                  const midX = (p1.x + p2.x) / 2;
                  const midY = (p1.y + p2.y) / 2;
                  const isHighlighted = edge.isTourPath;

                  return (
                    <g key={edge.id} className="transition-all">
                      {/* Edge line */}
                      <line
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke={isHighlighted ? '#f59e0b' : '#94a3b8'}
                        strokeWidth={isHighlighted ? 4 : 1.5}
                        strokeDasharray={isHighlighted ? '6 4' : undefined}
                        filter={isHighlighted ? 'url(#glow-gold-preview)' : undefined}
                        opacity={isHighlighted ? 1 : 0.6}
                      />

                      {/* Distance pill in the middle of the edge */}
                      <g
                        transform={`translate(${midX}, ${midY})`}
                        onClick={() => setSelectedEdgeInfo({ from: edge.from, to: edge.to, dist: edge.distanceKm })}
                        className="cursor-pointer"
                      >
                        <rect
                          x={-24}
                          y={-10}
                          width={48}
                          height={20}
                          rx={10}
                          fill={isHighlighted ? '#133654' : '#ffffff'}
                          stroke={isHighlighted ? '#f59e0b' : '#cbd5e1'}
                          strokeWidth={isHighlighted ? 1.5 : 1}
                          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
                        />
                        <text
                          x={0}
                          y={3}
                          textAnchor="middle"
                          fontSize={10}
                          fontWeight="bold"
                          fill={isHighlighted ? '#fef08a' : '#334155'}
                        >
                          {edge.distanceKm}k
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>

              {/* 2. Draw Nodes */}
              <g className="nodes">
                {selectedIds.map((id, idx) => {
                  const pos = graphNodePositions[id];
                  const loc = locationMap.get(id);
                  if (!pos || !loc) return null;

                  const isStart = id === startId || id === 'TL';
                  const isEnd = id === endId && currentMode !== 'cycle';

                  return (
                    <g
                      key={id}
                      transform={`translate(${pos.x}, ${pos.y})`}
                      className="cursor-pointer group"
                      onClick={() => onSelectLocation?.(loc)}
                    >
                      {/* Outer glow ring for start/end */}
                      {isStart && (
                        <circle
                          r={28}
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          strokeDasharray="4 4"
                          className="animate-spin"
                          style={{ transformOrigin: '0 0' }}
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        r={22}
                        fill={isStart ? '#133654' : isEnd ? '#e11d48' : '#047857'}
                        stroke="#ffffff"
                        strokeWidth={2.5}
                        filter="drop-shadow(0 4px 6px rgba(0,0,0,0.25))"
                      />

                      {/* Label badge */}
                      <text
                        x={0}
                        y={-2}
                        textAnchor="middle"
                        fontSize={11}
                        fontWeight="900"
                        fill="#ffffff"
                      >
                        {isStart ? 'TL' : idx + 1}
                      </text>

                      {/* Name label beneath node */}
                      <rect
                        x={-42}
                        y={26}
                        width={84}
                        height={18}
                        rx={5}
                        fill="rgba(15, 23, 42, 0.9)"
                      />
                      <text
                        x={0}
                        y={38}
                        textAnchor="middle"
                        fontSize={9.5}
                        fontWeight="800"
                        fill="#ffffff"
                      >
                        {loc.label.slice(0, 12)}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Edge info tooltip card if clicked */}
            {selectedEdgeInfo && (
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#d7ccbb] shadow-md text-xs font-bold text-[#133654] flex items-center gap-3">
                <span>
                  🛣️ {locationMap.get(selectedEdgeInfo.from)?.label} ↔ {locationMap.get(selectedEdgeInfo.to)?.label}: <strong>{selectedEdgeInfo.dist} km</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedEdgeInfo(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. TAB CONTENT 3: MA TRẬN KHOẢNG CÁCH TẬP CHỌN (SUB-MATRIX) */}
      {activeTab === 'matrix' && (
        <div className="bg-white border border-[#d7ccbb] p-4 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#e6ded1]">
            <h4 className="font-black text-sm text-[#133654] flex items-center gap-1.5">
              <Table className="w-4 h-4 text-[#133654]" />
              <span>{isVi ? 'Bảng Ma Trận Cự Ly Giữa Các Điểm Trong Tập Chọn' : 'Distance Sub-Matrix of Selected Stops'}</span>
            </h4>
            <span className="text-[11px] font-bold text-slate-500">Đơn vị: km</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#e6ded1]">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#f7f1e7] text-[#133654]">
                  <th className="p-2 border border-[#e6ded1] font-black">Điểm</th>
                  {selectedIds.map(colId => (
                    <th key={colId} className="p-2 border border-[#e6ded1] font-black text-center whitespace-nowrap">
                      {locationMap.get(colId)?.label || colId}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedIds.map(rowId => (
                  <tr key={rowId} className="hover:bg-slate-50">
                    <td className="p-2 border border-[#e6ded1] font-bold text-[#133654] bg-[#fbf8f3] whitespace-nowrap">
                      {locationMap.get(rowId)?.label || rowId}
                    </td>
                    {selectedIds.map(colId => {
                      if (rowId === colId) {
                        return (
                          <td key={colId} className="p-2 border border-[#e6ded1] text-center bg-slate-100 text-slate-400 font-bold">
                            0
                          </td>
                        );
                      }
                      const dist = getDirectDistance(rowId, colId, routes);
                      return (
                        <td
                          key={colId}
                          className={`p-2 border border-[#e6ded1] text-center font-extrabold ${
                            dist !== null ? 'text-[#133654]' : 'text-slate-300'
                          }`}
                        >
                          {dist !== null ? `${dist}` : '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Action Toolbar: Back to Select / Advance to Result */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-black text-amber-950 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{isVi ? 'Đã hoàn thành xem trước mô hình đồ thị' : 'Graph model preview complete'}</span>
          </div>
          <div className="text-[11px] text-amber-900 mt-0.5">
            {isVi ? 'Nhấn để xem kết quả giải thuật toán học tối ưu và so sánh các phương án khác nhau.' : 'Proceed to run optimal graph algorithm and view comparative solutions.'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToSelect}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isVi ? 'Chỉnh sửa lại điểm' : 'Edit Stops'}</span>
          </button>

          <button
            type="button"
            onClick={onAdvanceToResult}
            className="px-5 py-2 rounded-xl bg-[#133654] hover:bg-[#0b2438] text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] ring-2 ring-amber-400/50"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>{isVi ? 'Xem kết quả & Lời giải' : 'View Results & Solution'}</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>
        </div>
      </div>

    </div>
  );
};
