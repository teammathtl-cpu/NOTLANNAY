import React, { useState, useRef, useEffect, useMemo } from 'react';
import { TouristLocation, Route, Language } from '../types';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  School, 
  Navigation, 
  Maximize2,
  Info,
  Layers,
  Sparkles
} from 'lucide-react';

interface GraphCanvasProps {
  locations: TouristLocation[];
  routes: Route[];
  selectedLocationId: string | null;
  onSelectLocation: (loc: TouristLocation) => void;
  highlightedPath: string[]; // List of location IDs in active path
  language: Language;
  onSetStart: (id: string) => void;
  onSetEnd: (id: string) => void;
  startId: string | null;
  endId: string | null;
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'Di sản học đường': { bg: 'bg-amber-500/20', border: 'border-amber-400', text: 'text-amber-400' },
  'Danh lam thắng cảnh': { bg: 'bg-emerald-500/20', border: 'border-emerald-400', text: 'text-emerald-400' },
  'Di tích lịch sử': { bg: 'bg-rose-500/20', border: 'border-rose-400', text: 'text-rose-400' },
  'Mua sắm': { bg: 'bg-purple-500/20', border: 'border-purple-400', text: 'text-purple-400' },
  'Công viên': { bg: 'bg-teal-500/20', border: 'border-teal-400', text: 'text-teal-400' },
};

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  locations,
  routes,
  selectedLocationId,
  onSelectLocation,
  highlightedPath,
  language,
  onSetStart,
  onSetEnd,
  startId,
  endId,
}) => {
  const isVi = language === 'vi';
  const containerRef = useRef<HTMLDivElement>(null);

  // Position state allowing drag of nodes
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Pan and Zoom
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [showWeights, setShowWeights] = useState(true);
  const [showAllRoutes, setShowAllRoutes] = useState(false);

  // Initialize or reset positions from locations
  useEffect(() => {
    const initialPos: Record<string, { x: number; y: number }> = {};
    locations.forEach(loc => {
      initialPos[loc.id] = { x: loc.x, y: loc.y };
    });
    setNodePositions(initialPos);
  }, [locations]);

  // Active path set for quick lookup
  const activePathEdges = useMemo(() => {
    const set = new Set<string>();
    if (highlightedPath.length > 1) {
      for (let i = 0; i < highlightedPath.length - 1; i++) {
        const u = highlightedPath[i];
        const v = highlightedPath[i + 1];
        set.add(`${u}__${v}`);
        set.add(`${v}__${u}`);
      }
    }
    return set;
  }, [highlightedPath]);

  // Deduplicated undirected routes so bidirectional edges don't overlap labels
  const uniqueUndirectedRoutes = useMemo(() => {
    const seen = new Set<string>();
    const list: Route[] = [];
    routes.forEach(r => {
      const pairKey = [r.from, r.to].sort().join('__');
      if (!seen.has(pairKey)) {
        seen.add(pairKey);
        list.push(r);
      }
    });
    return list;
  }, [routes]);

  const arterialCount = useMemo(() => {
    return uniqueUndirectedRoutes.filter(r => r.isArterial !== false).length;
  }, [uniqueUndirectedRoutes]);

  // Center view on mount
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPan({ x: (rect.width - 700) / 2, y: 50 });
    }
  }, []);

  const handleMouseDownNode = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const pos = nodePositions[id] || { x: 0, y: 0 };
    setDraggingNode(id);
    setDragOffset({
      x: (e.clientX - pan.x) / scale - pos.x,
      y: (e.clientY - pan.y) / scale - pos.y,
    });
  };

  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNode) {
      const newX = (e.clientX - pan.x) / scale - dragOffset.x;
      const newY = (e.clientY - pan.y) / scale - dragOffset.y;
      setNodePositions(prev => ({
        ...prev,
        [draggingNode]: { x: Math.round(newX), y: Math.round(newY) }
      }));
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setScale(prev => Math.min(2.5, Math.max(0.4, prev * zoomFactor)));
  };

  const handleReset = () => {
    setScale(1);
    const initialPos: Record<string, { x: number; y: number }> = {};
    locations.forEach(loc => {
      initialPos[loc.id] = { x: loc.x, y: loc.y };
    });
    setNodePositions(initialPos);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPan({ x: (rect.width - 700) / 2, y: 50 });
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full min-h-[550px] bg-slate-950 overflow-hidden select-none cursor-grab active:cursor-grabbing border border-slate-800 rounded-2xl shadow-2xl flex flex-col"
      onMouseDown={handleMouseDownCanvas}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Grid Pattern Background */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #f59e0b 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Floating Controls Bar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 text-slate-300 shadow-xl">
        <button
          onClick={() => setScale(s => Math.min(2.5, s + 0.15))}
          className="p-2 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
          title={isVi ? 'Phóng to' : 'Zoom In'}
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setScale(s => Math.max(0.4, s - 0.15))}
          className="p-2 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
          title={isVi ? 'Thu nhỏ' : 'Zoom Out'}
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
          title={isVi ? 'Đặt lại góc nhìn & vị trí' : 'Reset View'}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-5 bg-slate-800 mx-1" />
        <button
          onClick={() => setShowWeights(!showWeights)}
          className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
            showWeights ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{isVi ? 'Trọng số km' : 'Weights'}</span>
        </button>
        <button
          onClick={() => setShowAllRoutes(!showAllRoutes)}
          className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
            showAllRoutes ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'hover:bg-slate-800 text-slate-400'
          }`}
          title={isVi ? `Chuyển đổi giữa tuyến đường chính và toàn bộ ${uniqueUndirectedRoutes.length} liên kết` : `Toggle all ${uniqueUndirectedRoutes.length} links vs arterial`}
        >
          <span>
            {showAllRoutes
              ? (isVi ? `Tất cả ${uniqueUndirectedRoutes.length} tuyến` : `All ${uniqueUndirectedRoutes.length} Edges`)
              : (isVi ? `${arterialCount} Tuyến chính` : 'Arterial Routes')}
          </span>
        </button>
      </div>

      {/* Path status badge if active */}
      {highlightedPath.length > 0 && (
        <div className="absolute top-4 right-4 z-20 bg-amber-500/10 border border-amber-500/30 backdrop-blur-md px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-xl">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <div className="text-xs">
            <span className="text-amber-300 font-semibold">
              {isVi ? 'Đang hiển thị lộ trình:' : 'Active Route:'}
            </span>{' '}
            <span className="text-slate-200">
              {highlightedPath.length} {isVi ? 'điểm dừng' : 'stops'}
            </span>
          </div>
        </div>
      )}

      {/* Interactive SVG Layer */}
      <svg
        className="w-full h-full"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: '0 0',
        }}
      >
        <defs>
          <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        {/* 1. Routes (Edges) */}
        <g className="routes-group">
          {uniqueUndirectedRoutes
            .filter(route => {
              if (showAllRoutes) return true;
              if (activePathEdges.has(`${route.from}__${route.to}`)) return true;
              return route.isArterial !== false;
            })
            .map(route => {
            const fromPos = nodePositions[route.from];
            const toPos = nodePositions[route.to];
            if (!fromPos || !toPos) return null;

            const isHighlighted = activePathEdges.has(`${route.from}__${route.to}`);
            const midX = (fromPos.x + toPos.x) / 2;
            const midY = (fromPos.y + toPos.y) / 2;

            return (
              <g key={route.id} className="transition-all">
                {/* Edge line */}
                <line
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  stroke={isHighlighted ? '#f59e0b' : '#334155'}
                  strokeWidth={isHighlighted ? 4 : 1.5}
                  strokeDasharray={isHighlighted ? '6 4' : undefined}
                  className={isHighlighted ? 'animate-pulse' : ''}
                  filter={isHighlighted ? 'url(#glow-gold)' : undefined}
                />

                {/* Edge Weight (distance km) */}
                {showWeights && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x={-18}
                      y={-10}
                      width={36}
                      height={20}
                      rx={6}
                      fill={isHighlighted ? '#1e293b' : '#0f172a'}
                      stroke={isHighlighted ? '#f59e0b' : '#475569'}
                      strokeWidth={isHighlighted ? 1.5 : 1}
                    />
                    <text
                      x={0}
                      y={4}
                      textAnchor="middle"
                      fill={isHighlighted ? '#fbbf24' : '#94a3b8'}
                      fontSize={10}
                      fontWeight={isHighlighted ? '700' : '500'}
                    >
                      {route.distanceKm}k
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* 2. Locations (Nodes) */}
        <g className="nodes-group">
          {locations.map(loc => {
            const pos = nodePositions[loc.id] || { x: loc.x, y: loc.y };
            const isSelected = selectedLocationId === loc.id;
            const isPathNode = highlightedPath.includes(loc.id);
            const isStart = startId === loc.id;
            const isEnd = endId === loc.id;
            const isThangLong = loc.id === 'TL';

            const catColor = CATEGORY_COLORS[loc.category] || {
              bg: 'bg-slate-700',
              border: 'border-slate-500',
              text: 'text-slate-300'
            };

            const pathIndex = highlightedPath.indexOf(loc.id);

            return (
              <g
                key={loc.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onMouseDown={e => handleMouseDownNode(e, loc.id)}
                onClick={() => onSelectLocation(loc)}
                className="cursor-pointer group"
              >
                {/* Highlight halo when selected or part of path */}
                {(isSelected || isThangLong || isPathNode) && (
                  <circle
                    r={isThangLong ? 34 : 28}
                    fill={isThangLong ? '#f59e0b' : isSelected ? '#38bdf8' : '#10b981'}
                    opacity={isThangLong ? 0.25 : 0.2}
                    className="animate-ping"
                    style={{ animationDuration: '3s' }}
                  />
                )}

                {/* Node Outer Circle */}
                <circle
                  r={isThangLong ? 26 : 20}
                  fill={isThangLong ? '#1e1b4b' : isSelected ? '#0369a1' : '#0f172a'}
                  stroke={
                    isStart
                      ? '#10b981'
                      : isEnd
                      ? '#ef4444'
                      : isThangLong
                      ? '#f59e0b'
                      : isSelected
                      ? '#38bdf8'
                      : isPathNode
                      ? '#fbbf24'
                      : '#475569'
                  }
                  strokeWidth={isThangLong || isSelected || isStart || isEnd ? 3 : 1.5}
                  filter={isThangLong ? 'url(#glow-gold)' : undefined}
                />

                {/* Node Icon or Order Badge */}
                {isPathNode ? (
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#ffffff"
                    fontSize={12}
                    fontWeight="800"
                  >
                    {pathIndex + 1}
                  </text>
                ) : isThangLong ? (
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#fbbf24"
                    fontSize={12}
                    fontWeight="900"
                  >
                    TL
                  </text>
                ) : (
                  <circle
                    r={6}
                    fill={isPathNode ? '#fbbf24' : '#64748b'}
                  />
                )}

                {/* Start / End mini badges */}
                {isStart && (
                  <g transform="translate(14, -14)">
                    <rect x={-4} y={-4} width={24} height={14} rx={4} fill="#10b981" />
                    <text x={8} y={7} fontSize={8} fontWeight="800" fill="#ffffff" textAnchor="middle">
                      START
                    </text>
                  </g>
                )}
                {isEnd && (
                  <g transform="translate(14, 10)">
                    <rect x={-4} y={-4} width={24} height={14} rx={4} fill="#ef4444" />
                    <text x={8} y={7} fontSize={8} fontWeight="800" fill="#ffffff" textAnchor="middle">
                      END
                    </text>
                  </g>
                )}

                {/* Node Label Text */}
                <g transform={`translate(0, ${isThangLong ? 38 : 32})`}>
                  <rect
                    x={-((loc.label.length * 7) / 2 + 10)}
                    y={-10}
                    width={loc.label.length * 7 + 20}
                    height={20}
                    rx={6}
                    fill="#090d16"
                    stroke={isThangLong ? '#d97706' : '#334155'}
                    strokeWidth={isThangLong ? 1.5 : 1}
                    opacity={0.95}
                  />
                  <text
                    x={0}
                    y={3}
                    textAnchor="middle"
                    fill={isThangLong ? '#fbbf24' : '#e2e8f0'}
                    fontSize={11}
                    fontWeight={isThangLong ? '800' : '600'}
                  >
                    {loc.label}
                  </text>
                </g>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Bottom Hint / Info Bar */}
      <div className="absolute bottom-3 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2 pointer-events-auto">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            {isVi 
              ? 'Kéo thả để điều chỉnh đỉnh đồ thị • Click vào điểm để xem chi tiết & đặt lộ trình' 
              : 'Drag nodes to customize graph layout • Click node to inspect & route'}
          </span>
        </div>

        {/* Category Legend */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 pointer-events-auto">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>THPT Thăng Long</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>{isVi ? 'Danh thắng' : 'Scenic'}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span>{isVi ? 'Di tích lịch sử' : 'History'}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span>{isVi ? 'Mua sắm' : 'Shopping'}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
