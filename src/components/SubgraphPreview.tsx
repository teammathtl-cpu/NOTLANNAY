import React, { useState, useMemo } from 'react';
import { TouristLocation, Route, ModeType, Language, AlternativePlan } from '../types';
import { 
  getDirectDistance, 
  calculateTravelTimes, 
  calculatePathDistance, 
  generateAlternativePlans 
} from '../utils/graphAlgorithms';
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
  Navigation,
  ZoomIn,
  ZoomOut,
  Maximize2,
  BookOpen,
  Info,
  Network,
  Activity,
  Flame,
  Check,
  ChevronRight,
  Flag,
  Map as MapIcon,
  GitBranch,
  Trophy,
  Award,
  ListOrdered,
  TrendingUp,
  Filter
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
  alternativePlans?: AlternativePlan[];
  activePlanId?: string;
  onSelectPlanId?: (id: string) => void;
  onApplyPath?: (path: string[]) => void;
}

/**
 * High-fidelity Mini-Map SVG visualizing an enumerated Hamiltonian Cycle or Path
 */
const PlanMiniMap: React.FC<{
  path: string[];
  locations: TouristLocation[];
  routes: Route[];
  isCycle: boolean;
  isActive: boolean;
  rank?: number;
  layoutMode?: 'geographic' | 'topology';
}> = ({ path, locations, routes, isCycle, isActive, rank, layoutMode = 'geographic' }) => {
  const locationMap = useMemo(() => new Map(locations.map(l => [l.id, l])), [locations]);

  // Extract ordered unique nodes in this tour
  const uniqueNodes = useMemo(() => {
    const list: string[] = [];
    const seen = new Set<string>();
    path.forEach(id => {
      if (!seen.has(id)) {
        seen.add(id);
        list.push(id);
      }
    });
    return list;
  }, [path]);

  // Generate coordinates for mini map (Real-world Geographic vs Topology)
  const positions = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    const count = uniqueNodes.length;
    if (count === 0) return pos;

    if (layoutMode === 'geographic') {
      // Find bounding box from true GPS coordinates (lat, lng)
      let minLat = Infinity, maxLat = -Infinity;
      let minLng = Infinity, maxLng = -Infinity;

      uniqueNodes.forEach(id => {
        const loc = locationMap.get(id);
        if (loc) {
          if (loc.lat < minLat) minLat = loc.lat;
          if (loc.lat > maxLat) maxLat = loc.lat;
          if (loc.lng < minLng) minLng = loc.lng;
          if (loc.lng > maxLng) maxLng = loc.lng;
        }
      });

      // Avoid division by zero
      const spanLat = (maxLat - minLat) || 0.012;
      const spanLng = (maxLng - minLng) || 0.012;

      // Safe viewport margin inside 240 x 152
      const padX = 36;
      const padY = 28;
      const width = 240 - padX * 2; // 168
      const height = 152 - padY * 2; // 96

      uniqueNodes.forEach(id => {
        const loc = locationMap.get(id);
        if (loc) {
          const normX = (loc.lng - minLng) / spanLng;
          // Invert Y so North (larger latitude) is at the TOP
          const normY = (maxLat - loc.lat) / spanLat;

          pos[id] = {
            x: Math.round(padX + normX * width),
            y: Math.round(padY + normY * height),
          };
        } else {
          pos[id] = { x: 120, y: 76 };
        }
      });

      return pos;
    }

    // Theoretical Topology layout
    const cx = 120;
    const cy = 72;

    if (isCycle) {
      const rx = 82;
      const ry = 42;
      uniqueNodes.forEach((id, idx) => {
        const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / count;
        pos[id] = {
          x: Math.round(cx + rx * Math.cos(angle)),
          y: Math.round(cy + ry * Math.sin(angle)),
        };
      });
    } else {
      const startX = 28;
      const endX = 212;
      const stepX = (endX - startX) / Math.max(1, count - 1);
      uniqueNodes.forEach((id, idx) => {
        const x = startX + idx * stepX;
        const wave = Math.sin((idx / Math.max(1, count - 1)) * Math.PI) * 26;
        const y = cy + (idx % 2 === 0 ? -wave * 0.7 : wave * 0.7);
        pos[id] = {
          x: Math.round(x),
          y: Math.round(y),
        };
      });
    }

    return pos;
  }, [uniqueNodes, isCycle, locationMap, layoutMode]);

  // Segments for this mini map
  const segments = useMemo(() => {
    const list: Array<{ from: string; to: string; dist: number }> = [];
    for (let i = 0; i < path.length - 1; i++) {
      const u = path[i];
      const v = path[i + 1];
      const d = getDirectDistance(u, v, routes) || 2.5;
      list.push({ from: u, to: v, dist: d });
    }
    return list;
  }, [path, routes]);

  const isOptimal = rank === 1;

  return (
    <div className={`relative w-full h-[152px] rounded-2xl overflow-hidden border transition-all ${
      isActive 
        ? 'bg-gradient-to-br from-amber-50/90 via-[#fcf8f0] to-[#f7eedf] border-amber-500 shadow-md ring-2 ring-amber-400/50' 
        : isOptimal
        ? 'bg-gradient-to-br from-emerald-50/50 via-[#fbf9f4] to-[#f4eee1] border-emerald-400/80 shadow-2xs hover:border-emerald-500'
        : 'bg-[#faf6ee] border-[#ded5c7] hover:border-slate-400'
    }`}>
      {/* Background grid */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #133654 1px, transparent 0)',
          backgroundSize: '16px 16px',
        }}
      />

      {/* Compass / Orientation indicator */}
      <div className="absolute top-2 right-2 flex items-center gap-1 z-10 pointer-events-none">
        {layoutMode === 'geographic' ? (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-white/95 border border-slate-300/90 shadow-2xs backdrop-blur-xs text-[9px] font-black text-slate-800">
            <span className="text-rose-600 font-black">▲ B</span>
            <span className="text-[7.5px] text-emerald-800 bg-emerald-100/80 px-1 py-0.5 rounded font-black">GPS Thật</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-white/95 border border-slate-300/90 shadow-2xs backdrop-blur-xs text-[9px] font-black text-slate-700">
            <span className="text-[#133654]">🔄</span>
            <span className="text-[7.5px] text-slate-500 font-bold">Topo Elip</span>
          </div>
        )}
      </div>

      {/* Bottom corner GPS badge */}
      <div className="absolute bottom-1.5 left-2 pointer-events-none text-[8.5px] font-bold text-slate-400/90 flex items-center gap-1 z-10">
        {layoutMode === 'geographic' ? (
          <span className="text-slate-500">📍 Tọa độ thực tế Hà Nội</span>
        ) : (
          <span className="text-slate-400">🔄 Sơ đồ chu trình topo</span>
        )}
      </div>

      <svg className="w-full h-full" viewBox="0 0 240 144">
        <defs>
          <marker
            id={`arrow-mini-${rank || 'gen'}-${isActive ? 'active' : 'idle'}`}
            viewBox="0 0 10 10"
            refX="17"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill={isActive ? '#d97706' : isOptimal ? '#059669' : '#2563eb'} />
          </marker>
        </defs>

        {/* Edges */}
        <g>
          {segments.map((seg, idx) => {
            const p1 = positions[seg.from];
            const p2 = positions[seg.to];
            if (!p1 || !p2) return null;

            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;

            return (
              <g key={`mini-seg-${idx}`}>
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={isActive ? '#f59e0b' : isOptimal ? '#10b981' : '#60a5fa'}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  strokeDasharray={isActive ? '4 2' : undefined}
                  markerEnd={`url(#arrow-mini-${rank || 'gen'}-${isActive ? 'active' : 'idle'})`}
                />
                {/* Midpoint distance tag */}
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect
                    x={-15}
                    y={-7}
                    width={30}
                    height={14}
                    rx={7}
                    fill={isActive ? '#133654' : isOptimal ? '#064e3b' : '#ffffff'}
                    stroke={isActive ? '#f59e0b' : isOptimal ? '#34d399' : '#94a3b8'}
                    strokeWidth={0.8}
                  />
                  <text
                    x={0}
                    y={3.5}
                    textAnchor="middle"
                    fontSize={8}
                    fontWeight="800"
                    fill={isActive || isOptimal ? '#fef08a' : '#1e293b'}
                  >
                    {seg.dist}k
                  </text>
                </g>
              </g>
            );
          })}
        </g>

        {/* Nodes */}
        <g>
          {uniqueNodes.map((id, idx) => {
            const pos = positions[id];
            const loc = locationMap.get(id);
            if (!pos) return null;

            const isSchool = id === 'TL';
            const isLast = !isCycle && idx === uniqueNodes.length - 1;
            const isNearBottom = pos.y > 108;

            return (
              <g key={`mini-node-${id}`} transform={`translate(${pos.x}, ${pos.y})`}>
                <circle
                  r={isSchool ? 11 : 9.5}
                  fill={isSchool ? '#133654' : isLast ? '#e11d48' : '#059669'}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
                <text
                  x={0}
                  y={3.5}
                  textAnchor="middle"
                  fontSize={8}
                  fontWeight="900"
                  fill="#ffffff"
                >
                  {isSchool ? 'TL' : isLast ? '🏁' : idx + 1}
                </text>
                
                {/* Micro label pill */}
                <g transform={`translate(0, ${isNearBottom ? -16 : 17})`}>
                  <rect
                    x={-24}
                    y={-7}
                    width={48}
                    height={13}
                    rx={6.5}
                    fill={isActive ? 'rgba(254, 243, 199, 0.95)' : isOptimal ? 'rgba(236, 253, 245, 0.95)' : 'rgba(255, 255, 255, 0.92)'}
                    stroke={isActive ? '#f59e0b' : isOptimal ? '#10b981' : '#cbd5e1'}
                    strokeWidth={0.7}
                  />
                  <text
                    x={0}
                    y={2.6}
                    textAnchor="middle"
                    fontSize={7.2}
                    fontWeight="800"
                    fill="#0f172a"
                  >
                    {loc?.label ? (loc.label.length > 7 ? `${loc.label.slice(0, 6)}…` : loc.label) : id}
                  </text>
                </g>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

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
  alternativePlans: passedAlternativePlans,
  activePlanId: passedActivePlanId,
  onSelectPlanId,
  onApplyPath,
}) => {
  const isVi = language === 'vi';
  const [activeTab, setActiveTab] = useState<'turnbyturn' | 'plans' | 'theory' | 'matrix'>('turnbyturn');
  const [layoutStyle, setLayoutStyle] = useState<'topology' | 'geographic'>('topology');
  const [showWeights, setShowWeights] = useState(true);
  const [showOtherEdges, setShowOtherEdges] = useState(true);
  const [selectedEdgeInfo, setSelectedEdgeInfo] = useState<{ from: string; to: string; dist: number } | null>(null);
  const [scale, setScale] = useState(1);
  const [displayFilter, setDisplayFilter] = useState<'top6' | 'all'>('top6');
  const [miniMapLayout, setMiniMapLayout] = useState<'geographic' | 'topology'>('geographic');

  const locationMap = useMemo(() => new Map(locations.map(l => [l.id, l])), [locations]);

  // Compute all enumerated & sorted alternative plans
  const alternativePlans = useMemo(() => {
    if (passedAlternativePlans && passedAlternativePlans.length > 0) {
      return passedAlternativePlans;
    }
    return generateAlternativePlans(currentMode, selectedIds, startId, endId, routes);
  }, [passedAlternativePlans, currentMode, selectedIds, startId, endId, routes]);

  // Local active plan ID state
  const [localActivePlanId, setLocalActivePlanId] = useState<string>(
    passedActivePlanId || alternativePlans[0]?.id || 'optimal'
  );

  const activePlanId = passedActivePlanId || localActivePlanId;

  // Active alternative plan object
  const activePlan = useMemo(() => {
    return alternativePlans.find(p => p.id === activePlanId) || alternativePlans[0] || null;
  }, [alternativePlans, activePlanId]);

  // Effective path to render
  const effectivePath = useMemo(() => {
    if (activePlan && activePlan.path && activePlan.path.length > 1) {
      return activePlan.path;
    }
    if (previewPath && previewPath.length > 1) {
      return previewPath;
    }
    if (currentMode === 'cycle') {
      const rest = selectedIds.filter(id => id !== 'TL');
      return ['TL', ...rest, 'TL'];
    }
    if (currentMode === 'path' || currentMode === 'subset') {
      const targetEnd = endId || (selectedIds.find(id => id !== 'TL') || 'TL');
      const middle = selectedIds.filter(id => id !== 'TL' && id !== targetEnd);
      return ['TL', ...middle, targetEnd];
    }
    return selectedIds;
  }, [activePlan, previewPath, selectedIds, currentMode, endId]);

  // Handle user selecting a cycle/path
  const handleSelectPlan = (plan: AlternativePlan) => {
    setLocalActivePlanId(plan.id);
    onSelectPlanId?.(plan.id);
    onApplyPath?.(plan.path);
  };

  // Selected locations subset
  const selectedLocations = useMemo(() => {
    return selectedIds.map(id => locationMap.get(id)).filter(Boolean) as TouristLocation[];
  }, [selectedIds, locationMap]);

  // Sequential segments of the active tour
  const segments = useMemo(() => {
    const list: Array<{
      fromLoc: TouristLocation;
      toLoc: TouristLocation;
      distanceKm: number;
      stepNumber: number;
      accumulatedKm: number;
    }> = [];

    let acc = 0;
    for (let i = 0; i < effectivePath.length - 1; i++) {
      const u = effectivePath[i];
      const v = effectivePath[i + 1];
      const fromLoc = locationMap.get(u);
      const toLoc = locationMap.get(v);
      if (fromLoc && toLoc) {
        const dist = getDirectDistance(u, v, routes) || 2.5;
        acc += dist;
        list.push({
          fromLoc,
          toLoc,
          distanceKm: dist,
          stepNumber: i + 1,
          accumulatedKm: Number(acc.toFixed(2)),
        });
      }
    }
    return list;
  }, [effectivePath, locationMap, routes]);

  // Total tour distance preview
  const totalPreviewDistance = useMemo(() => {
    if (activePlan) return activePlan.totalDistanceKm.toFixed(1);
    return segments.reduce((sum, s) => sum + s.distanceKm, 0).toFixed(1);
  }, [activePlan, segments]);

  const travelTimes = useMemo(() => {
    return calculateTravelTimes(Number(totalPreviewDistance) || 0);
  }, [totalPreviewDistance]);

  // Unique nodes in tour order
  const orderedTourNodeIds = useMemo(() => {
    const list: string[] = [];
    const seen = new Set<string>();
    effectivePath.forEach(id => {
      if (!seen.has(id)) {
        seen.add(id);
        list.push(id);
      }
    });
    selectedIds.forEach(id => {
      if (!seen.has(id)) {
        seen.add(id);
        list.push(id);
      }
    });
    return list;
  }, [effectivePath, selectedIds]);

  // Graph Node Positions (Topology vs Geographic)
  const graphNodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const count = orderedTourNodeIds.length;
    if (count === 0) return positions;

    const canvasWidth = 720;
    const canvasHeight = 440;
    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2 + 10;

    if (layoutStyle === 'topology') {
      if (currentMode === 'cycle') {
        const rx = Math.min(270, 160 + count * 15);
        const ry = Math.min(160, 110 + count * 7);

        orderedTourNodeIds.forEach((id, idx) => {
          const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / count;
          positions[id] = {
            x: Math.round(cx + rx * Math.cos(angle)),
            y: Math.round(cy + ry * Math.sin(angle)),
          };
        });
      } else {
        const marginX = 80;
        const availableW = canvasWidth - marginX * 2;
        const stepX = availableW / Math.max(1, count - 1);

        orderedTourNodeIds.forEach((id, idx) => {
          const x = marginX + idx * stepX;
          const wave = Math.sin((idx / Math.max(1, count - 1)) * Math.PI) * 90;
          const y = cy - 40 + (idx % 2 === 0 ? -wave * 0.4 : wave * 0.6);
          positions[id] = {
            x: Math.round(x),
            y: Math.round(y),
          };
        });
      }
    } else {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      selectedLocations.forEach(loc => {
        if (loc.x < minX) minX = loc.x;
        if (loc.x > maxX) maxX = loc.x;
        if (loc.y < minY) minY = loc.y;
        if (loc.y > maxY) maxY = loc.y;
      });

      const padX = (maxX - minX) * 0.15 || 50;
      const padY = (maxY - minY) * 0.15 || 50;
      const spanX = (maxX - minX + padX * 2) || 1;
      const spanY = (maxY - minY + padY * 2) || 1;

      selectedLocations.forEach(loc => {
        const nx = (loc.x - (minX - padX)) / spanX;
        const ny = (loc.y - (minY - padY)) / spanY;
        positions[loc.id] = {
          x: Math.round(70 + nx * 580),
          y: Math.round(70 + ny * 300),
        };
      });
    }

    return positions;
  }, [orderedTourNodeIds, selectedLocations, layoutStyle, currentMode]);

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
      tourIndex?: number;
    }> = [];

    const pathEdgeMap = new Map<string, number>();
    for (let i = 0; i < effectivePath.length - 1; i++) {
      const u = effectivePath[i];
      const v = effectivePath[i + 1];
      pathEdgeMap.set(`${u}__${v}`, i + 1);
      pathEdgeMap.set(`${v}__${u}`, i + 1);
    }

    routes.forEach(r => {
      if (setIds.has(r.from) && setIds.has(r.to)) {
        const pairKey = [r.from, r.to].sort().join('__');
        if (!seen.has(pairKey)) {
          seen.add(pairKey);
          const isTour = pathEdgeMap.has(`${r.from}__${r.to}`);
          edges.push({
            id: r.id,
            from: r.from,
            to: r.to,
            distanceKm: r.distanceKm,
            isTourPath: isTour,
            tourIndex: isTour ? pathEdgeMap.get(`${r.from}__${r.to}`) : undefined,
          });
        }
      }
    });

    return edges;
  }, [selectedIds, routes, effectivePath]);

  // Min and Max distance among all enumerated cycles
  const minDist = alternativePlans[0]?.totalDistanceKm || 0;
  const maxDist = alternativePlans[alternativePlans.length - 1]?.totalDistanceKm || minDist;

  // Filtered displayed plans
  const displayedPlans = useMemo(() => {
    if (displayFilter === 'top6') {
      return alternativePlans.slice(0, 6);
    }
    return alternativePlans;
  }, [alternativePlans, displayFilter]);

  const destinationLoc = locationMap.get(endId) || (selectedLocations.find(l => l.id !== 'TL') || selectedLocations[0]);

  return (
    <div className="space-y-4">
      
      {/* 1. Grand Editorial Header Banner */}
      <div className="bg-gradient-to-br from-[#133654] via-[#1a446a] to-[#255780] text-white p-4 sm:p-6 rounded-3xl shadow-sm border border-[#d7ccbb]/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black tracking-wide">
              {currentMode === 'cycle' ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>{isVi ? 'BÀI TOÁN 1: LIỆT KÊ & SẮP XẾP CHU TRÌNH HAMILTON' : 'PROBLEM 1: HAMILTONIAN CYCLE ENUMERATION & SORTING'}</span>
                </>
              ) : currentMode === 'path' ? (
                <>
                  <Flag className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isVi ? 'BÀI TOÁN 2: LIỆT KÊ & SẮP XẾP ĐƯỜNG ĐI HAMILTON' : 'PROBLEM 2: HAMILTONIAN PATH ENUMERATION & SORTING'}</span>
                </>
              ) : (
                <>
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isVi ? 'BÀI TOÁN 3: XEM TRƯỚC TẬP ĐIỂM CHỌN' : 'PROBLEM 3: SUBSET PREVIEW'}</span>
                </>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {currentMode === 'cycle' ? (
                isVi 
                  ? 'Khám Phá Di Sản Khép Kín — Xuất Phát & Quay Về THPT Thăng Long' 
                  : 'Closed Heritage Loop — Starting & Ending at Thang Long High School'
              ) : currentMode === 'path' ? (
                isVi 
                  ? `Hành Trình Tuyến Tính — Khởi Hành Từ THPT Thăng Long Đến ${destinationLoc?.label || 'Đích'}`
                  : `One-Way Journey — From Thang Long School to ${destinationLoc?.label || 'Finish'}`
              ) : (
                isVi 
                  ? 'Mô Hình Hóa Đồ Thị Tuyến Đường Giữa Các Địa Điểm' 
                  : 'Graph Route Topology Model'
              )}
            </h3>

            <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
              {currentMode === 'cycle' ? (
                isVi 
                  ? 'Phương pháp: Liệt kê toàn bộ các chu trình Hamilton hợp lệ đi qua đầy đủ các địa danh đã chọn, tính tổng quãng đường từng chu trình và sắp xếp tăng dần để tìm ra chu trình ngắn nhất.'
                  : 'Method: Enumerate all valid Hamiltonian cycles, compute each cycle distance, and sort ascending to select the minimum distance cycle.'
              ) : (
                isVi 
                  ? `Phương pháp: Liệt kê tất cả các đường đi Hamilton từ THPT Thăng Long đến ${destinationLoc?.label || 'điểm đích'}, sau đó sắp xếp theo tổng quãng đường để chọn đường đi ngắn nhất.`
                  : `Method: Enumerate all valid Hamiltonian paths from origin to destination and sort ascending by total distance.`
              )}
            </p>
          </div>

          {/* Quick Metrics KPI Pods */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5 shrink-0">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                {isVi ? 'Số điểm ghé thăm' : 'Stops'}
              </div>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {selectedIds.length} <span className="text-xs font-semibold text-slate-300">{isVi ? 'đỉnh' : 'nodes'}</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                {isVi ? 'Chu trình tối ưu (Min)' : 'Optimal Distance'}
              </div>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5 flex items-baseline justify-center gap-1">
                <span>{minDist}</span>
                <span className="text-xs font-semibold text-slate-300">km</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                {isVi ? 'Tổng chu trình hợp lệ' : 'Valid Cycles'}
              </div>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {alternativePlans.length} <span className="text-xs font-semibold text-slate-300">{isVi ? 'phương án' : 'cycles'}</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                {isVi ? 'Đang hiển thị' : 'Viewing Plan'}
              </div>
              <div className="text-xs sm:text-sm font-black text-white mt-1.5 flex items-center justify-center gap-1">
                <span className="bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-lg border border-emerald-400/40">
                  {activePlan?.rank ? `Hạng #${activePlan.rank}` : 'Tối ưu'} ({totalPreviewDistance} km)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Step-by-Step Route Sequence Ribbon */}
      <div className="bg-white border border-[#d7ccbb] p-3.5 sm:p-4 rounded-3xl shadow-xs">
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#e6ded1]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <h4 className="text-xs sm:text-sm font-black text-[#133654]">
              {isVi ? 'Trình Tự Tuyến Đi Đang Xem Trước (Tour Sequence Flow)' : 'Tour Sequence Flow'}
            </h4>
            {activePlan && (
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black ${
                activePlan.rank === 1
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}>
                {activePlan.title}
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold text-slate-500">
            {segments.length} {isVi ? 'chặng kết nối' : 'legs'} • {totalPreviewDistance} km
          </span>
        </div>

        {/* Horizontal Scrollable Stop Breadcrumb Bar */}
        <div className="flex items-center gap-2 overflow-x-auto py-1.5 scrollbar-thin">
          {effectivePath.map((id, idx) => {
            const loc = locationMap.get(id);
            const isFirst = idx === 0;
            const isLast = idx === effectivePath.length - 1;
            const isSchool = id === 'TL';

            return (
              <React.Fragment key={`${id}-${idx}`}>
                <div 
                  onClick={() => loc && onSelectLocation?.(loc)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-black shrink-0 transition-all cursor-pointer shadow-2xs hover:scale-105 ${
                    isSchool
                      ? 'bg-[#133654] text-amber-300 border border-amber-400/60'
                      : isLast && currentMode !== 'cycle'
                      ? 'bg-rose-600 text-white border border-rose-400'
                      : 'bg-[#f7f1e7] text-slate-800 border border-[#ded5c7] hover:border-slate-400'
                  }`}
                  title={loc?.fullName}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    isSchool ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-800'
                  }`}>
                    {idx + 1}
                  </span>
                  <span>{loc?.label || id}</span>
                  {isSchool && isLast && (
                    <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-md font-extrabold">
                      {isVi ? 'Khép chu trình' : 'Loop'}
                    </span>
                  )}
                </div>

                {idx < effectivePath.length - 1 && (
                  <div className="flex items-center gap-1 shrink-0 text-slate-400">
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200 whitespace-nowrap">
                      {segments[idx]?.distanceKm || 0} km
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 3. Grand Interactive Subgraph Visualizer */}
      <div className="bg-white border border-[#d7ccbb] p-4 sm:p-5 rounded-3xl shadow-sm space-y-3">
        {/* Visualizer Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#e6ded1]">
          <div>
            <h4 className="text-sm sm:text-base font-black text-[#133654] flex items-center gap-2">
              <Network className="w-4 h-4 text-indigo-600" />
              <span>
                {currentMode === 'cycle'
                  ? (isVi ? 'Mô Hình Chu Trình Hamilton Khép Kín (Graph Topology)' : 'Hamiltonian Cycle Topology')
                  : (isVi ? 'Mô Hình Đường Đi Hamilton Đơn (Graph Topology)' : 'Hamiltonian Path Topology')}
              </span>
              {activePlan && (
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-black ${
                  activePlan.rank === 1
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  {activePlan.rank === 1 ? '🏆 Hạng #1 (Ngắn nhất)' : `Hạng #${activePlan.rank}`}
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {isVi 
                ? 'Các đỉnh được nối theo trình tự đường đi với khoảng cách km ở giữa mỗi cạnh.' 
                : 'Nodes ordered sequentially with midpoint distance weights on each edge.'}
            </p>
          </div>

          {/* Controls: Layout toggle, weights toggle, zoom */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <div className="flex items-center p-0.5 bg-[#f7f1e7] rounded-xl border border-[#ded5c7]">
              <button
                type="button"
                onClick={() => setLayoutStyle('topology')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  layoutStyle === 'topology' ? 'bg-[#133654] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🔄</span>
                <span>{isVi ? 'Bố cục chu trình' : 'Topology'}</span>
              </button>
              <button
                type="button"
                onClick={() => setLayoutStyle('geographic')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  layoutStyle === 'geographic' ? 'bg-[#133654] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🗺️</span>
                <span>{isVi ? 'Tọa độ thực địa' : 'Spatial'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowWeights(!showWeights)}
              className={`px-2.5 py-1 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                showWeights ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isVi ? 'Cự ly km' : 'Weights'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowOtherEdges(!showOtherEdges)}
              className={`px-2.5 py-1 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                showOtherEdges ? 'bg-indigo-100 text-indigo-900 border-indigo-300' : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isVi ? 'Cạnh phụ' : 'Other links'}</span>
            </button>

            <div className="flex items-center gap-1 bg-[#f7f1e7] p-0.5 rounded-xl border border-[#ded5c7]">
              <button
                type="button"
                onClick={() => setScale(s => Math.min(1.8, s + 0.15))}
                className="p-1 hover:bg-white rounded-lg text-slate-700 transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setScale(s => Math.max(0.6, s - 0.15))}
                className="p-1 hover:bg-white rounded-lg text-slate-700 transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setScale(1)}
                className="p-1 hover:bg-white rounded-lg text-slate-700 transition-colors"
                title="Reset scale"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Subgraph SVG Canvas */}
        <div className="relative w-full h-[460px] bg-gradient-to-b from-[#fefcf8] via-[#fbf7ee] to-[#f4eee1] rounded-2xl border border-[#ded5c7] overflow-hidden flex items-center justify-center select-none shadow-inner">
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #133654 1.2px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          <svg 
            className="w-full h-full transition-transform duration-200" 
            viewBox="0 0 720 440"
            style={{ transform: `scale(${scale})` }}
          >
            <defs>
              <filter id="subgraph-glow-gold" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <marker
                id="arrow-subgraph"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
              </marker>
            </defs>

            {/* 1. Draw non-tour background edges */}
            {showOtherEdges && (
              <g className="other-edges">
                {subgraphEdges.filter(e => !e.isTourPath).map(edge => {
                  const p1 = graphNodePositions[edge.from];
                  const p2 = graphNodePositions[edge.to];
                  if (!p1 || !p2) return null;

                  return (
                    <line
                      key={edge.id}
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke="#cbd5e1"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      opacity={0.7}
                    />
                  );
                })}
              </g>
            )}

            {/* 2. Draw Tour Path Edges with Midpoint Distance Badges */}
            <g className="tour-edges">
              {segments.map((seg, idx) => {
                const p1 = graphNodePositions[seg.fromLoc.id];
                const p2 = graphNodePositions[seg.toLoc.id];
                if (!p1 || !p2) return null;

                const midX = (p1.x + p2.x) / 2;
                const midY = (p1.y + p2.y) / 2;

                return (
                  <g key={`tour-seg-${seg.fromLoc.id}-${seg.toLoc.id}-${idx}`}>
                    <line
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke="#f59e0b"
                      strokeWidth={6}
                      opacity={0.35}
                      filter="url(#subgraph-glow-gold)"
                    />

                    <line
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke="#d97706"
                      strokeWidth={3.5}
                      strokeDasharray="6 3"
                      markerEnd="url(#arrow-subgraph)"
                    />

                    {showWeights && (
                      <g
                        transform={`translate(${midX}, ${midY})`}
                        onClick={() => setSelectedEdgeInfo({ from: seg.fromLoc.id, to: seg.toLoc.id, dist: seg.distanceKm })}
                        className="cursor-pointer group"
                      >
                        <rect
                          x={-28}
                          y={-11}
                          width={56}
                          height={22}
                          rx={11}
                          fill="#133654"
                          stroke="#f59e0b"
                          strokeWidth={1.5}
                          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))"
                          className="group-hover:fill-[#0b2438] transition-colors"
                        />
                        <text
                          x={0}
                          y={4}
                          textAnchor="middle"
                          fontSize={11}
                          fontWeight="900"
                          fill="#fef08a"
                        >
                          {seg.distanceKm} km
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>

            {/* 3. Draw Nodes */}
            <g className="nodes">
              {orderedTourNodeIds.map((id, idx) => {
                const pos = graphNodePositions[id];
                const loc = locationMap.get(id);
                if (!pos || !loc) return null;

                const isSchool = id === 'TL';
                const isLast = id === effectivePath[effectivePath.length - 1] && currentMode !== 'cycle';

                return (
                  <g
                    key={id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    className="cursor-pointer group"
                    onClick={() => onSelectLocation?.(loc)}
                  >
                    {isSchool && (
                      <circle
                        r={30}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        className="animate-spin"
                        style={{ transformOrigin: '0 0', animationDuration: '8s' }}
                      />
                    )}

                    <circle
                      r={23}
                      fill={isSchool ? '#133654' : isLast ? '#e11d48' : '#059669'}
                      stroke="#ffffff"
                      strokeWidth={3}
                      filter="drop-shadow(0 4px 6px rgba(0,0,0,0.25))"
                      className="group-hover:scale-110 transition-transform"
                    />

                    <text
                      x={0}
                      y={-2}
                      textAnchor="middle"
                      fontSize={11}
                      fontWeight="900"
                      fill="#ffffff"
                    >
                      {isSchool ? 'TL' : isLast ? '🏁' : `#${idx + 1}`}
                    </text>

                    {isSchool && (
                      <g transform="translate(0, -29)">
                        <rect x={-18} y={-8} width={36} height={14} rx={4} fill="#f59e0b" />
                        <text x={0} y={2} textAnchor="middle" fontSize={8.5} fontWeight="900" fill="#0f172a">
                          TRƯỜNG
                        </text>
                      </g>
                    )}

                    <g transform="translate(0, 26)">
                      <rect
                        x={-45}
                        y={0}
                        width={90}
                        height={20}
                        rx={6}
                        fill="rgba(19, 54, 84, 0.95)"
                        stroke="#f59e0b"
                        strokeWidth={0.8}
                        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
                      />
                      <text
                        x={0}
                        y={13}
                        textAnchor="middle"
                        fontSize={10}
                        fontWeight="800"
                        fill="#ffffff"
                      >
                        {loc.label.length > 12 ? `${loc.label.slice(0, 11)}…` : loc.label}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Floating Edge Info Card if clicked */}
          {selectedEdgeInfo && (
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-[#d7ccbb] shadow-xl text-xs font-bold text-[#133654] flex items-center gap-3 z-30 animate-in fade-in slide-in-from-bottom-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black">
                🛣️
              </div>
              <div>
                <div className="text-[#133654]">
                  {locationMap.get(selectedEdgeInfo.from)?.label} ↔ {locationMap.get(selectedEdgeInfo.to)?.label}
                </div>
                <div className="text-amber-700 font-black mt-0.5">
                  Cự ly trực tiếp: {selectedEdgeInfo.dist} km
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEdgeInfo(null)}
                className="ml-2 w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>
          )}

          {/* Legend badge at bottom right */}
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#d7ccbb] shadow-xs text-[10px] font-bold text-slate-700 flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#133654] border border-amber-400" />
              <span>THPT Thăng Long</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
              <span>Điểm tham quan</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-1 bg-[#f59e0b] rounded-full" />
              <span>Tuyến đi ({segments.length} chặng)</span>
            </span>
          </div>
        </div>
      </div>

      {/* 4. CORE USER REQUEST: BẢNG LIỆT KÊ TOÀN BỘ CHU TRÌNH HAMILTON HỢP LỆ & MINI-MAPS ĐƯỢC SẮP XẾP TĂNG DẦN THEO QUÃNG ĐƯỜNG */}
      <div className="bg-white border border-[#d7ccbb] p-4 sm:p-5 rounded-3xl shadow-sm space-y-4">
        
        {/* Method & Algorithm Explanation Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-[#fdfbf7] to-indigo-50 border border-amber-200/80 shadow-2xs space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-600" />
              <h4 className="text-sm sm:text-base font-black text-[#133654]">
                {currentMode === 'cycle'
                  ? (isVi ? 'Thuật Toán Duyệt & Sắp Xếp Toàn Bộ Chu Trình Hamilton Hợp Lệ' : 'Hamiltonian Cycle Enumeration & Sorting')
                  : (isVi ? 'Thuật Toán Duyệt & Sắp Xếp Toàn Bộ Đường Đi Hamilton Hợp Lệ' : 'Hamiltonian Path Enumeration & Sorting')}
              </h4>
            </div>
            <span className="text-xs bg-[#133654] text-amber-300 font-black px-3 py-1 rounded-xl">
              {alternativePlans.length} {isVi ? 'chu trình hợp lệ' : 'valid cycles'}
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            {isVi 
              ? <span><strong>Cách làm:</strong> Hệ thống tự động liệt kê tất cả <strong>{alternativePlans.length} chu trình Hamilton khả dĩ</strong> đi qua đầy đủ {selectedIds.length} địa danh xuất phát & quay về THPT Thăng Long. Sau đó tính tổng quãng đường (km) của từng chu trình và <strong>sắp xếp tăng dần từ ngắn nhất đến dài nhất</strong> để chọn ra chu trình tối ưu nhất (Hạng #1).</span>
              : <span><strong>Method:</strong> Enumerated all {alternativePlans.length} valid Hamiltonian cycles, computed total km for each, and sorted ascending to choose the shortest cycle (Rank #1).</span>}
          </p>

          {/* Algorithm stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
              <span className="text-[10px] text-slate-500 font-bold block">{isVi ? 'Chu trình ngắn nhất:' : 'Min Distance:'}</span>
              <span className="text-sm font-black text-emerald-700">🏆 {minDist} km</span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
              <span className="text-[10px] text-slate-500 font-bold block">{isVi ? 'Chu trình dài nhất:' : 'Max Distance:'}</span>
              <span className="text-sm font-black text-rose-700">🐢 {maxDist} km</span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
              <span className="text-[10px] text-slate-500 font-bold block">{isVi ? 'Độ chênh lệch cự ly:' : 'Max Difference:'}</span>
              <span className="text-sm font-black text-amber-800">+{(maxDist - minDist).toFixed(1)} km</span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
              <span className="text-[10px] text-slate-500 font-bold block">{isVi ? 'Số hoán vị chu trình:' : 'Cycle Permutations:'}</span>
              <span className="text-sm font-black text-[#133654]">({selectedIds.length} - 1)! / 2</span>
            </div>
          </div>
        </div>

        {/* View mode filter tabs: Top 6 vs All + Mini-map Layout Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 p-1 bg-[#f7f1e7] rounded-2xl border border-[#ded5c7] text-xs font-bold">
              <button
                type="button"
                onClick={() => setDisplayFilter('top6')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  displayFilter === 'top6' 
                    ? 'bg-[#133654] text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>{isVi ? `Top 6 chu trình ngắn nhất` : `Top 6 Shortest`}</span>
              </button>

              <button
                type="button"
                onClick={() => setDisplayFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  displayFilter === 'all' 
                    ? 'bg-[#133654] text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>{isVi ? `Xem toàn bộ ${alternativePlans.length} chu trình` : `All ${alternativePlans.length} Cycles`}</span>
              </button>
            </div>

            {/* Layout toggle for mini maps */}
            <div className="flex items-center gap-1 p-1 bg-[#f7f1e7] rounded-2xl border border-[#ded5c7] text-xs font-bold">
              <span className="text-[10px] text-slate-500 uppercase px-2 font-black">
                {isVi ? 'Bản đồ con:' : 'Mini-map:'}
              </span>
              <button
                type="button"
                onClick={() => setMiniMapLayout('geographic')}
                className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  miniMapLayout === 'geographic'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={isVi ? 'Sắp xếp đỉnh theo đúng tọa độ GPS thực tế ở Hà Nội (Bắc ở trên, Nam ở dưới)' : 'Arrange nodes according to real Hanoi GPS coordinates'}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{isVi ? 'Bản đồ thực tế (GPS)' : 'Real GPS'}</span>
              </button>

              <button
                type="button"
                onClick={() => setMiniMapLayout('topology')}
                className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  miniMapLayout === 'topology'
                    ? 'bg-[#133654] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={isVi ? 'Sắp xếp đỉnh theo sơ đồ đồ thị hình elip' : 'Arrange nodes on an elliptical topology loop'}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{isVi ? 'Sơ đồ topo (Elip)' : 'Topology'}</span>
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isVi ? 'Đang sắp xếp: Quãng đường tăng dần (Ngắn nhất ➔ Dài nhất)' : 'Sorted: Ascending by distance'}</span>
          </div>
        </div>

        {/* Sorted Grid of Hamiltonian Cycle Cards with Mini-Maps */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayedPlans.map((plan) => {
            const isSelected = plan.id === activePlanId;
            const rank = plan.rank || 1;
            const isOptimal = rank === 1;
            const diffKm = plan.diffKm ?? Number((plan.totalDistanceKm - minDist).toFixed(1));
            const diffPct = plan.diffPercent ?? (minDist > 0 ? Math.round((diffKm / minDist) * 100) : 0);
            const times = calculateTravelTimes(plan.totalDistanceKm);

            return (
              <div
                key={plan.id}
                onClick={() => handleSelectPlan(plan)}
                className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 relative group ${
                  isSelected
                    ? 'bg-gradient-to-br from-amber-50 via-[#fdfbf7] to-orange-50 border-amber-500 shadow-md ring-2 ring-amber-400/40'
                    : isOptimal
                    ? 'bg-gradient-to-br from-emerald-50/60 via-[#fdfcf9] to-[#fbf7ee] border-emerald-400 shadow-xs hover:border-emerald-500'
                    : 'bg-[#fcfaf7] border-[#e6ded1] hover:border-slate-400 hover:bg-white shadow-2xs'
                }`}
              >
                {/* Active selection badge */}
                {isSelected && (
                  <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-xs flex items-center gap-1 z-10">
                    <Check className="w-3 h-3" />
                    <span>{isVi ? 'Đang chọn xem trước' : 'Active'}</span>
                  </div>
                )}

                {/* Card Header & Rank Ribbon */}
                <div className="space-y-1.5 pr-14">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide flex items-center gap-1 shadow-2xs ${
                      isOptimal
                        ? 'bg-emerald-600 text-white'
                        : rank === 2
                        ? 'bg-blue-600 text-white'
                        : rank === 3
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-200 text-slate-800'
                    }`}>
                      {isOptimal ? <Trophy className="w-3 h-3 text-amber-300" /> : <Award className="w-3 h-3" />}
                      <span>
                        {isOptimal 
                          ? (isVi ? 'HẠNG #1: TỐI ƯU NHẤT' : 'RANK #1: OPTIMAL') 
                          : (isVi ? `HẠNG #${rank}: CHU TRÌNH PHỤ` : `RANK #${rank}`)}
                      </span>
                    </span>
                  </div>

                  <h5 className="text-sm font-black text-[#133654] leading-snug group-hover:text-amber-800 transition-colors">
                    {plan.title}
                  </h5>

                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* Distance & Rank comparison pod */}
                <div className={`flex items-center justify-between p-2.5 rounded-2xl border text-xs ${
                  isOptimal ? 'bg-emerald-50/70 border-emerald-200' : 'bg-white border-[#e6ded1]'
                }`}>
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">
                      {isVi ? 'Tổng cự ly chu trình' : 'Total Distance'}
                    </div>
                    <div className={`text-base font-black ${isOptimal ? 'text-emerald-800' : 'text-[#133654]'}`}>
                      {plan.totalDistanceKm} <span className="text-[10px] font-semibold text-slate-400">km</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">
                      {isVi ? 'So với ngắn nhất' : 'Comparison'}
                    </div>
                    {isOptimal ? (
                      <span className="inline-block text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300">
                        ⭐ Tối ưu (0 km)
                      </span>
                    ) : (
                      <span className="inline-block text-[11px] font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300">
                        +{diffKm} km (+{diffPct}%)
                      </span>
                    )}
                  </div>
                </div>

                {/* Vector Mini-Map for this specific cycle */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 px-1">
                    <span className="flex items-center gap-1">
                      <MapIcon className="w-3 h-3 text-slate-400" />
                      <span>{isVi ? `Mini-map chu trình #${rank}:` : `Cycle Mini-Map #${rank}:`}</span>
                    </span>
                    <span>~{times.motoMinutes} {isVi ? 'phút xe máy' : 'mins'}</span>
                  </div>

                  <PlanMiniMap
                    path={plan.path}
                    locations={locations}
                    routes={routes}
                    isCycle={currentMode === 'cycle'}
                    isActive={isSelected}
                    rank={rank}
                    layoutMode={miniMapLayout}
                  />
                </div>

                {/* Stop sequence breadcrumbs */}
                <div className="text-[11px] text-slate-700 font-semibold flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
                  {plan.path.map((id, pIdx) => {
                    const loc = locationMap.get(id);
                    const isLast = pIdx === plan.path.length - 1;
                    return (
                      <React.Fragment key={`${plan.id}-${id}-${pIdx}`}>
                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] whitespace-nowrap ${
                          id === 'TL' 
                            ? 'bg-[#133654] text-amber-300 font-black' 
                            : 'bg-white text-slate-700 border border-[#e6ded1]'
                        }`}>
                          {loc?.label || id}
                        </span>
                        {!isLast && <span className="text-slate-400 text-[10px]">➔</span>}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Select button */}
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    handleSelectPlan(plan);
                  }}
                  className={`w-full py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                    isSelected
                      ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 font-black'
                      : isOptimal
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-white hover:bg-[#133654] hover:text-white text-slate-700 border border-[#d7ccbb]'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isVi ? 'Đang hiển thị trên đồ thị chính' : 'Viewing on Main Stage'}</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isVi ? `Xem chu trình #${rank} trên đồ thị` : `Preview Cycle #${rank}`}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Tabbed Exploratory Section: Turn-by-Turn Guide, Theory & Matrix */}
      <div className="bg-white border border-[#d7ccbb] p-4 sm:p-5 rounded-3xl shadow-xs space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#e6ded1] pb-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('turnbyturn')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'turnbyturn'
                ? 'bg-[#133654] text-white shadow-xs font-black'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{isVi ? '1. Chi tiết từng chặng di chuyển' : '1. Turn-by-Turn Legs'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('plans')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'plans'
                ? 'bg-[#133654] text-white shadow-xs font-black'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>{isVi ? `2. Bảng xếp hạng tất cả ${alternativePlans.length} chu trình` : `2. All ${alternativePlans.length} Cycles`}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('theory')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'theory'
                ? 'bg-[#133654] text-white shadow-xs font-black'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isVi ? '3. Cơ sở lý thuyết đồ thị' : '3. Graph Theory Foundations'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'matrix'
                ? 'bg-[#133654] text-white shadow-xs font-black'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>{isVi ? '4. Ma trận cự ly tập chọn' : '4. Distance Sub-Matrix'}</span>
          </button>
        </div>

        {/* TAB 1: Chi tiết từng chặng */}
        {activeTab === 'turnbyturn' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {segments.map((seg, idx) => {
                const times = calculateTravelTimes(seg.distanceKm);
                return (
                  <div 
                    key={`seg-card-${idx}`}
                    className="p-3.5 rounded-2xl bg-[#fbf8f3] border border-[#e6ded1] hover:border-[#133654]/40 transition-all flex flex-col justify-between space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-lg bg-[#133654] text-amber-300 font-black text-xs">
                        {isVi ? `Chặng ${seg.stepNumber}` : `Leg ${seg.stepNumber}`}
                      </span>
                      <span className="text-xs font-black text-[#133654] bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-lg">
                        📍 {seg.distanceKm} km
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
                      <span className="truncate">{seg.fromLoc.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate text-[#133654]">{seg.toLoc.label}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1.5 border-t border-[#ded5c7]/60">
                      <span className="flex items-center gap-1">
                        <span>🛵 ~{times.motoMinutes} phút</span>
                        <span>•</span>
                        <span>🚶 ~{times.walkMinutes} phút</span>
                      </span>
                      <span className="font-semibold text-slate-500">
                        Lũy kế: {seg.accumulatedKm} km
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Bảng xếp hạng tất cả chu trình đã sắp xếp */}
        {activeTab === 'plans' && (
          <div className="space-y-3">
            <div className="overflow-x-auto rounded-2xl border border-[#ded5c7]">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#f7f1e7] text-[#133654]">
                    <th className="p-3 font-black text-center w-16">{isVi ? 'Thứ hạng' : 'Rank'}</th>
                    <th className="p-3 font-black">{isVi ? 'Tên chu trình' : 'Cycle'}</th>
                    <th className="p-3 font-black">{isVi ? 'Tổng quãng đường' : 'Distance'}</th>
                    <th className="p-3 font-black">{isVi ? 'Độ lệch so với tối ưu' : 'Delta'}</th>
                    <th className="p-3 font-black">{isVi ? 'Thời gian xe máy' : 'Travel Time'}</th>
                    <th className="p-3 font-black">{isVi ? 'Thứ tự các đỉnh' : 'Path Sequence'}</th>
                    <th className="p-3 font-black text-center">{isVi ? 'Xem trên đồ thị' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6ded1]">
                  {alternativePlans.map((plan) => {
                    const isSelected = plan.id === activePlanId;
                    const rank = plan.rank || 1;
                    const isOptimal = rank === 1;
                    const diffKm = plan.diffKm ?? Number((plan.totalDistanceKm - minDist).toFixed(1));
                    const times = calculateTravelTimes(plan.totalDistanceKm);

                    return (
                      <tr 
                        key={`tab-plan-${plan.id}`}
                        className={`hover:bg-[#fbf8f3] transition-colors ${
                          isSelected ? 'bg-amber-50/80 font-bold' : isOptimal ? 'bg-emerald-50/40' : ''
                        }`}
                      >
                        <td className="p-3 text-center whitespace-nowrap">
                          {isOptimal ? (
                            <span className="inline-flex items-center gap-1 font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300">
                              🏆 #1
                            </span>
                          ) : (
                            <span className="font-bold text-slate-700">
                              #{rank}
                            </span>
                          )}
                        </td>

                        <td className="p-3 font-bold text-[#133654]">
                          <div className="flex items-center gap-2">
                            {isSelected && <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />}
                            <span>{plan.title}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-normal mt-0.5 line-clamp-1">
                            {plan.description}
                          </div>
                        </td>

                        <td className="p-3 font-black text-[#133654] whitespace-nowrap">
                          {plan.totalDistanceKm} km
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          {isOptimal ? (
                            <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300">
                              ⭐ Tối ưu (0 km)
                            </span>
                          ) : (
                            <span className="text-[11px] font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300">
                              +{diffKm} km
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-slate-600 whitespace-nowrap">
                          ~{times.motoMinutes} phút
                        </td>

                        <td className="p-3 text-slate-700 font-medium">
                          <span className="line-clamp-1 text-[11px]">
                            {plan.path.map(id => locationMap.get(id)?.label || id).join(' ➔ ')}
                          </span>
                        </td>

                        <td className="p-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleSelectPlan(plan)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-amber-400 text-slate-950 shadow-2xs'
                                : isOptimal
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-[#133654] text-white hover:bg-[#0b2438]'
                            }`}
                          >
                            {isSelected ? (isVi ? '✓ Đang xem' : 'Active') : (isVi ? 'Xem trước' : 'Preview')}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Cơ sở lý thuyết đồ thị */}
        {activeTab === 'theory' && (
          <div className="space-y-3.5 text-xs text-slate-700 leading-relaxed bg-[#fbf8f3] p-4 rounded-2xl border border-[#ded5c7]">
            <div className="flex items-center gap-2 text-sm font-black text-[#133654]">
              <Network className="w-4 h-4 text-indigo-600" />
              <span>
                {currentMode === 'cycle'
                  ? (isVi ? 'Lý Thuyết & Thuật Toán Tìm Chu Trình Hamilton Ngắn Nhất' : 'Hamiltonian Cycle Algorithm Theory')
                  : (isVi ? 'Lý Thuyết & Thuật Toán Tìm Đường Đi Hamilton Ngắn Nhất' : 'Hamiltonian Path Algorithm Theory')}
              </span>
            </div>

            <p>
              {currentMode === 'cycle' ? (
                isVi 
                  ? 'Trong lý thuyết đồ thị, chu trình Hamilton là một chu trình kín trong đồ thị vô hướng G = (V, E) đi qua mỗi đỉnh trong tập V đúng 1 lần và quay trở lại đỉnh xuất phát. Để tìm chu trình ngắn nhất cho nhóm tham quan từ THPT Thăng Long, giải thuật duyệt toàn bộ sinh ra tất cả các hoán vị chu trình, tính tổng độ dài từng chu trình rồi sắp xếp tăng dần để chọn ra chu trình có tổng độ dài nhỏ nhất.'
                  : 'A Hamiltonian cycle visits every vertex in G exactly once and returns to the start vertex. The brute force enumeration generates all permutations, computes their total weights, and sorts them ascending to select the minimum cycle.'
              ) : (
                isVi 
                  ? `Đường đi Hamilton là một đường đi sơ cấp trong đồ thị G = (V, E) đi qua tất cả các đỉnh trong tập V đúng một lần từ THPT Thăng Long đến ${destinationLoc?.label}. Hệ thống duyệt tất cả các hoán vị đường đi và sắp xếp theo quãng đường để chọn phương án tối ưu.`
                  : `A Hamiltonian path is a simple path visiting every vertex in V exactly once. The system enumerates all valid paths and sorts them by distance.`
              )}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-white rounded-xl border border-[#ded5c7] space-y-1">
                <div className="font-black text-[#133654]">1. Quy trình 4 bước giải toán</div>
                <div className="text-[11px] text-slate-600 leading-relaxed">
                  Bước 1: Liệt kê toàn bộ các chu trình hợp lệ.<br />
                  Bước 2: Tính tổng quãng đường km từng chu trình.<br />
                  Bước 3: Sắp xếp các chu trình theo quãng đường tăng dần.<br />
                  Bước 4: Chọn chu trình đầu bảng (Hạng #1) làm lời giải ngắn nhất.
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#ded5c7] space-y-1">
                <div className="font-black text-[#133654]">2. Không gian tìm kiếm hoán vị</div>
                <div className="text-[11px] text-slate-600 leading-relaxed">
                  {currentMode === 'cycle'
                    ? `Với ${selectedIds.length} đỉnh, số chu trình hình học độc lập là (${selectedIds.length} - 1)! / 2. Toàn bộ các chu trình này đã được tính toán và xếp hạng đầy đủ ở trên.`
                    : `Với ${selectedIds.length} đỉnh cố định 2 đầu mút, số đường đi khả dĩ là (${selectedIds.length} - 2)! hoán vị.`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Ma trận cự ly tập chọn */}
        {activeTab === 'matrix' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-black text-xs text-[#133654]">
                {isVi ? `Bảng Ma Trận Cự Ly Giữa ${selectedIds.length} Địa Danh Được Chọn (km)` : 'Distance Matrix (km)'}
              </h5>
              <span className="text-[10px] font-bold text-slate-500">Đơn vị: km</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#ded5c7]">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#f7f1e7] text-[#133654]">
                    <th className="p-2 border border-[#ded5c7] font-black">Điểm</th>
                    {selectedIds.map(colId => (
                      <th key={colId} className="p-2 border border-[#ded5c7] font-black text-center whitespace-nowrap">
                        {locationMap.get(colId)?.label || colId}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedIds.map(rowId => (
                    <tr key={rowId} className="hover:bg-slate-50">
                      <td className="p-2 border border-[#ded5c7] font-bold text-[#133654] bg-[#fbf8f3] whitespace-nowrap">
                        {locationMap.get(rowId)?.label || rowId}
                      </td>
                      {selectedIds.map(colId => {
                        if (rowId === colId) {
                          return (
                            <td key={colId} className="p-2 border border-[#ded5c7] text-center bg-slate-100 text-slate-400 font-bold">
                              0
                            </td>
                          );
                        }
                        const dist = getDirectDistance(rowId, colId, routes);
                        return (
                          <td
                            key={colId}
                            className={`p-2 border border-[#ded5c7] text-center font-extrabold ${
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
      </div>

      {/* 6. Sticky Action Footer Bar */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="text-xs sm:text-sm font-black text-amber-950 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{isVi ? 'Đã hoàn thành rà soát & xếp hạng chu trình' : 'Cycles Enumeration & Ranking Complete'}</span>
          </div>
          <div className="text-[11px] text-amber-900 mt-0.5">
            {isVi 
              ? 'Nhấn nút bên phải để chuyển sang bước xem lời giải chi tiết và hướng dẫn di chuyển thực địa.' 
              : 'Click proceed to view full mathematical formulation and turn-by-turn field guide.'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToSelect}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isVi ? 'Chọn lại điểm' : 'Edit Stops'}</span>
          </button>

          <button
            type="button"
            onClick={onAdvanceToResult}
            className="px-5 py-2.5 rounded-xl bg-[#133654] hover:bg-[#0b2438] text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] ring-2 ring-amber-400/50"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>{isVi ? 'Xem lời giải chi tiết (Bước 3)' : 'View Detailed Solution (Step 3)'}</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>
        </div>
      </div>

    </div>
  );
};
