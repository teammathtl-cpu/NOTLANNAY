import React, { useState, useMemo } from 'react';
import { MarieHeader } from './components/MarieHeader';
import { GuideShell } from './components/GuideShell';
import { VisualStage } from './components/VisualStage';
import { MapView } from './components/MapView';
import { GraphCanvas } from './components/GraphCanvas';
import { DistanceMatrixView } from './components/DistanceMatrixView';
import { DataManagerModal } from './components/DataManagerModal';
import { LocationDetailModal } from './components/LocationDetailModal';
import { 
  INITIAL_LOCATIONS, 
  INITIAL_ROUTES, 
  PRESET_SELECTIONS 
} from './data/graphData';
import { 
  TouristLocation, 
  Route, 
  Language, 
  ModeType, 
  StepType 
} from './types';
import { 
  solveHamiltonianCycle, 
  solveHamiltonianPath, 
  runDijkstraWithSteps,
  getDirectDistance 
} from './utils/graphAlgorithms';
import { 
  MapPin, 
  School, 
  Sparkles, 
  Ruler, 
  Network, 
  Layers, 
  Compass, 
  ArrowRight,
  Eye,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [locations, setLocations] = useState<TouristLocation[]>(INITIAL_LOCATIONS);
  const [routes, setRoutes] = useState<Route[]>(INITIAL_ROUTES);
  const [language, setLanguage] = useState<Language>('vi');

  // Core Marie Curie style states
  const [currentMode, setCurrentMode] = useState<ModeType>('cycle');
  const [currentStep, setCurrentStep] = useState<StepType>('select');
  const [activeView, setActiveView] = useState<'guide' | 'matrix' | 'data'>('guide');

  // Selected stop IDs for the current tour mode
  const [selectedIds, setSelectedIds] = useState<string[]>(PRESET_SELECTIONS.cycle.ids);
  const [startId, setStartId] = useState<string>('TL');
  const [endId, setEndId] = useState<string>('TL');

  // Active path to highlight across Map & Graph
  const [activePath, setActivePath] = useState<string[]>([
    'TL', 'DHBKHN', 'CVTN', 'VMQTG', 'LCT', 'HT', 'TL'
  ]);

  // Selected location for detail modal and initial active tab ('info' | 'map' | 'distances')
  const [selectedLocation, setSelectedLocation] = useState<TouristLocation | null>(null);
  const [modalInitialTab, setModalInitialTab] = useState<'info' | 'map' | 'distances'>('info');

  // Layout mode for Guide view: 'split' (50/50) | 'wide-list' (full-width stops grid) | 'wide-map'
  const [layoutMode, setLayoutMode] = useState<'split' | 'wide-list' | 'wide-map'>('split');

  // Bottom view mode: 'both' (side-by-side) | 'graph' (full graph) | 'map' (full map)
  const [bottomViewMode, setBottomViewMode] = useState<'both' | 'graph' | 'map'>('both');

  // Total distance of active route
  const activePathDistance = useMemo(() => {
    if (activePath.length < 2) return 0;
    let total = 0;
    for (let i = 0; i < activePath.length - 1; i++) {
      const u = activePath[i];
      const v = activePath[i + 1];
      const d = getDirectDistance(u, v, routes);
      if (d !== null) total += d;
    }
    return Number(total.toFixed(2));
  }, [activePath, routes]);

  const handleOpenDetailModal = (loc: TouristLocation, initialTab: 'info' | 'map' | 'distances' = 'info') => {
    setSelectedLocation(loc);
    setModalInitialTab(initialTab);
  };

  const isVi = language === 'vi';

  // Handle Mode Switch
  const handleSwitchMode = (mode: ModeType) => {
    setCurrentMode(mode);
    setCurrentStep('select');
    const preset = PRESET_SELECTIONS[mode];
    if (preset) {
      setSelectedIds(preset.ids);
      setStartId(preset.startId);
      setEndId(mode === 'cycle' ? 'TL' : (preset.endId || ''));
    }
  };

  // Reset to initial defaults
  const handleReset = () => {
    setLocations(INITIAL_LOCATIONS);
    setRoutes(INITIAL_ROUTES);
    setCurrentMode('cycle');
    setCurrentStep('select');
    setSelectedIds(PRESET_SELECTIONS.cycle.ids);
    setStartId('TL');
    setEndId('TL');
    setActivePath(['TL', 'DHBKHN', 'CVTN', 'VMQTG', 'LCT', 'HT', 'TL']);
  };

  const handleOpenPreset = () => {
    const preset = PRESET_SELECTIONS[currentMode];
    if (preset) {
      setSelectedIds(preset.ids);
      setStartId(preset.startId);
      if (preset.endId) setEndId(preset.endId);
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
    }
  };

  const handleToggleItinerary = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Dedicated 'Chọn hành trình' handler
  const handleSelectItinerary = () => {
    if (selectedIds.length < 2) {
      alert(isVi ? 'Vui lòng chọn ít nhất 2 địa điểm để tạo hành trình!' : 'Please select at least 2 locations to build an itinerary!');
      return;
    }

    let targetEnd = endId;
    if ((currentMode === 'path' || currentMode === 'subset') && (!targetEnd || targetEnd === startId)) {
      const validEnds = selectedIds.filter(id => id !== startId);
      if (validEnds.length > 0) {
        targetEnd = validEnds[validEnds.length - 1];
        setEndId(targetEnd);
      }
    }

    let calculatedPath: string[] = [];
    if (currentMode === 'cycle') {
      const res = solveHamiltonianCycle(selectedIds, startId, routes);
      calculatedPath = res.shortestCycle;
    } else if (currentMode === 'path') {
      const res = solveHamiltonianPath(selectedIds, startId, targetEnd || 'VMQTG', routes);
      calculatedPath = res.shortestPath;
    } else {
      const res = runDijkstraWithSteps(startId, targetEnd || 'VMQTG', selectedIds, routes, locations);
      calculatedPath = res.path;
    }

    setActivePath(calculatedPath);
    setCurrentStep('preview');
    confetti({ particleCount: 40, spread: 65, origin: { y: 0.75 } });
  };

  const handleUpdateLocation = (updatedLoc: TouristLocation) => {
    setLocations(prev => prev.map(loc => loc.id === updatedLoc.id ? updatedLoc : loc));
    setSelectedLocation(updatedLoc);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.72),transparent_28%),linear-gradient(180deg,#f5efe4_0%,#efe7da_52%,#ece3d5_100%)] text-slate-900 flex flex-col font-sans">
      
      {/* Editorial Header (Du Lịch Vòng Quanh Thăng Long) */}
      <MarieHeader
        currentMode={currentMode}
        setCurrentMode={handleSwitchMode}
        language={language}
        setLanguage={setLanguage}
        onReset={handleReset}
        onOpenPreset={handleOpenPreset}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Container - Expansive width */}
      <main className="flex-1 max-w-[1640px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5">
        
        {/* VIEW 1: Guide & Visual Stage (Core Tour Explorer layout) */}
        {activeView === 'guide' && (
          <div className="space-y-4">
            
            {/* View Layout Switcher Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white/85 backdrop-blur-md border border-[#d7ccbb] px-4 py-2.5 rounded-2xl shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">{isVi ? 'Bố cục xem:' : 'Layout view:'}</span>
                <div className="flex items-center p-0.5 bg-[#f7f1e7] rounded-xl border border-[#ded5c7] text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setLayoutMode('split')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      layoutMode === 'split' ? 'bg-[#133654] text-white shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>🔲</span>
                    <span>{isVi ? 'Chia đôi màn hình' : 'Split View'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLayoutMode('wide-list')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      layoutMode === 'wide-list' ? 'bg-[#133654] text-white shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>⛶</span>
                    <span>{isVi ? 'Mở rộng danh sách địa điểm' : 'Expanded Stops View'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLayoutMode('wide-map')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      layoutMode === 'wide-map' ? 'bg-[#133654] text-white shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>🗺️</span>
                    <span>{isVi ? 'Mở rộng bản đồ' : 'Expanded Map'}</span>
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-500 font-medium hidden sm:block">
                {isVi ? 'Giao diện mỗi địa điểm được thiết kế rộng rãi, hình ảnh lớn và nút xem bản đồ tiện lợi' : 'Spacious stop cards with dedicated map buttons'}
              </div>
            </div>

            {/* Top Layout Grid Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
              
              {/* Left Column: Interactive Guide Shell */}
              {(layoutMode === 'split' || layoutMode === 'wide-list') && (
                <div className={`${layoutMode === 'wide-list' ? 'lg:col-span-12' : 'lg:col-span-6 xl:col-span-6'} flex flex-col h-full transition-all duration-300`}>
                  <GuideShell
                    locations={locations}
                    routes={routes}
                    currentMode={currentMode}
                    currentStep={currentStep}
                    setCurrentStep={setCurrentStep}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                    startId={startId}
                    setStartId={setStartId}
                    endId={endId}
                    setEndId={setEndId}
                    language={language}
                    presets={PRESET_SELECTIONS}
                    onApplyPathToMap={path => setActivePath(path)}
                    onOpenDetailModal={(loc, tab) => handleOpenDetailModal(loc, tab)}
                    activePath={activePath}
                    onSelectItinerary={handleSelectItinerary}
                    isExpandedView={layoutMode === 'wide-list'}
                    onToggleExpandedView={() => setLayoutMode(prev => prev === 'wide-list' ? 'split' : 'wide-list')}
                  />
                </div>
              )}

              {/* Right Column: Visual Stage (Map & Graph Canvas) */}
              {(layoutMode === 'split' || layoutMode === 'wide-map') && (
                <div className={`${layoutMode === 'wide-map' ? 'lg:col-span-12' : 'lg:col-span-6 xl:col-span-6'} flex flex-col h-full transition-all duration-300`}>
                  <VisualStage
                    locations={locations}
                    routes={routes}
                    selectedLocationId={selectedLocation?.id || null}
                    onSelectLocation={loc => handleOpenDetailModal(loc, 'info')}
                    activePath={activePath}
                    language={language}
                    onSetStart={id => setStartId(id)}
                    onSetEnd={id => setEndId(id)}
                    startId={startId}
                    endId={endId}
                    selectedIds={selectedIds}
                    onToggleItinerary={handleToggleItinerary}
                    onSelectItinerary={handleSelectItinerary}
                  />
                </div>
              )}

            </div>

            {/* Comprehensive Bottom Section: Graph Preview & Satellite Geographic Map */}
            <div className="space-y-4 pt-4 border-t-2 border-[#ded5c7]">
              {/* Header card with view mode switcher and route summary */}
              <div className="bg-white/95 border border-[#d7ccbb] p-4 sm:p-5 rounded-3xl shadow-xs space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-xl font-black text-[#133654] flex items-center gap-2.5">
                      <Network className="w-5 h-5 text-indigo-600" />
                      <span>{isVi ? 'Xem Trước Đồ Thị Mạng Lưới & Bản Đồ Vệ Tinh Cuối Trang' : 'Network Graph Preview & Satellite Map at Page Bottom'}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      {isVi 
                        ? 'Đối sánh trực quan mô hình lý thuyết đồ thị (đỉnh V, cạnh E có trọng số cự ly km) và thực địa vệ tinh toàn cảnh 14 điểm đến Thăng Long - Hà Nội.' 
                        : 'Visual side-by-side comparison between the theoretical graph network (vertices V, weighted edges E) and real-world satellite map.'}
                    </p>
                  </div>

                  {/* Mode switcher tabs */}
                  <div className="flex items-center p-1 bg-[#f7f1e7] rounded-2xl border border-[#ded5c7] text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setBottomViewMode('both')}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                        bottomViewMode === 'both' 
                          ? 'bg-[#133654] text-white shadow-xs' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>⚡</span>
                      <span>{isVi ? 'Song song cả hai' : 'Side-by-Side'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBottomViewMode('graph')}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                        bottomViewMode === 'graph' 
                          ? 'bg-indigo-600 text-white shadow-xs' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Network className="w-3.5 h-3.5" />
                      <span>{isVi ? 'Xem trước đồ thị' : 'Graph Preview'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBottomViewMode('map')}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                        bottomViewMode === 'map' 
                          ? 'bg-rose-600 text-white shadow-xs' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{isVi ? 'Bản đồ vệ tinh' : 'Satellite Map'}</span>
                    </button>
                  </div>
                </div>

                {/* Active Path Sequence Strip */}
                {activePath.length > 0 && (
                  <div className="bg-[#fcfaf7] border border-[#e6dcce] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        {isVi ? 'Lộ trình đang xem trước:' : 'Active Route Preview:'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {activePath.map((id, idx) => {
                          const loc = locations.find(l => l.id === id);
                          const isStart = idx === 0;
                          const isEnd = idx === activePath.length - 1;
                          return (
                            <React.Fragment key={`${id}-${idx}`}>
                              <button
                                onClick={() => loc && setSelectedLocation(loc)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                                  id === 'TL'
                                    ? 'bg-[#133654] text-white shadow-2xs'
                                    : isStart || isEnd
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'bg-white text-slate-700 border border-[#ded5c7] hover:border-slate-400'
                                }`}
                              >
                                <span>{loc ? loc.label : id}</span>
                              </button>
                              {idx < activePath.length - 1 && (
                                <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-xl font-black">
                        {isVi ? 'Tổng cự ly:' : 'Distance:'} {activePathDistance} km
                      </span>
                      <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-xl font-bold">
                        {activePath.length} {isVi ? 'điểm dừng' : 'stops'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Quick focus landmark pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full pt-1 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">{isVi ? 'Tiêu điểm:' : 'Focus:'}</span>
                  {locations.map(loc => (
                    <button
                      key={loc.id}
                      onClick={() => setSelectedLocation(loc)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                        selectedLocation?.id === loc.id
                          ? 'bg-amber-500 text-slate-900 font-black shadow-xs ring-2 ring-amber-300'
                          : loc.id === 'TL' 
                          ? 'bg-[#133654] text-white shadow-2xs' 
                          : 'bg-[#f7f1e7] hover:bg-slate-200 text-slate-800 border border-[#d7ccbb]'
                      }`}
                    >
                      {loc.id === 'TL' ? '🏛️ ' : ''}{loc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Visual Display: Side-by-Side OR Single Expanded */}
              {bottomViewMode === 'both' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {/* Left Column: Graph Network Preview */}
                  <div className="flex flex-col bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                    <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Network className="w-4 h-4 text-amber-400" />
                        <span className="text-xs sm:text-sm font-bold text-white">
                          {isVi ? '1. Đồ thị mạng lưới lý thuyết (Graph Preview)' : '1. Graph Network Model'}
                        </span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">
                          {locations.length} {isVi ? 'đỉnh V' : 'nodes'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 hidden sm:inline">
                        {isVi ? 'Kéo thả đỉnh • Bật/tắt trọng số km' : 'Drag nodes • Toggle weights'}
                      </span>
                    </div>
                    <div className="h-[600px] w-full relative">
                      <GraphCanvas
                        locations={locations}
                        routes={routes}
                        selectedLocationId={selectedLocation?.id || null}
                        onSelectLocation={loc => setSelectedLocation(loc)}
                        highlightedPath={activePath}
                        language={language}
                        onSetStart={id => setStartId(id)}
                        onSetEnd={id => setEndId(id)}
                        startId={startId}
                        endId={endId}
                      />
                    </div>
                  </div>

                  {/* Right Column: Geographic Satellite & Street Map */}
                  <div className="flex flex-col bg-white border border-[#d7ccbb] rounded-3xl overflow-hidden shadow-xl">
                    <div className="px-4 py-3 bg-[#f7f1e7] border-b border-[#d7ccbb] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-rose-600" />
                        <span className="text-xs sm:text-sm font-black text-[#133654]">
                          {isVi ? '2. Bản đồ địa lý thực địa & Vệ tinh (Geographic Map)' : '2. Real-World Geographic Map'}
                        </span>
                        <span className="text-[10px] bg-rose-100 text-rose-700 font-semibold px-2 py-0.5 rounded-full border border-rose-200">
                          Vệ tinh / Street
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 hidden sm:inline">
                        {isVi ? 'Nhãn cự ly km giữa đường' : 'Road distance badges'}
                      </span>
                    </div>
                    <div className="h-[600px] w-full relative">
                      <MapView
                        locations={locations}
                        routes={routes}
                        selectedLocationId={selectedLocation?.id || null}
                        onSelectLocation={loc => setSelectedLocation(loc)}
                        highlightedPath={activePath}
                        language={language}
                        onSetStart={id => setStartId(id)}
                        onSetEnd={id => setEndId(id)}
                        mapHeight="600px"
                        selectedIds={selectedIds}
                        onToggleItinerary={handleToggleItinerary}
                        onSelectItinerary={handleSelectItinerary}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Full-Width Graph Preview Mode */}
              {bottomViewMode === 'graph' && (
                <div className="flex flex-col bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                  <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4 text-amber-400" />
                      <span className="text-sm sm:text-base font-bold text-white">
                        {isVi ? 'Đồ thị mạng lưới toàn cảnh — 14 Điểm đến Thăng Long Hà Nội' : 'Full Graph Network — 14 Hanoi Landmarks'}
                      </span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">
                        {locations.length} {isVi ? 'đỉnh' : 'nodes'} • {routes.length} {isVi ? 'tuyến cạnh' : 'edges'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      {isVi ? 'Kéo thả đỉnh tự do • Cuộn chuột phóng to/thu nhỏ • Bật/tắt trọng số' : 'Interactive node dragging & zooming'}
                    </span>
                  </div>
                  <div className="h-[640px] w-full relative">
                    <GraphCanvas
                      locations={locations}
                      routes={routes}
                      selectedLocationId={selectedLocation?.id || null}
                      onSelectLocation={loc => setSelectedLocation(loc)}
                      highlightedPath={activePath}
                      language={language}
                      onSetStart={id => setStartId(id)}
                      onSetEnd={id => setEndId(id)}
                      startId={startId}
                      endId={endId}
                    />
                  </div>
                </div>
              )}

              {/* Full-Width Map Mode */}
              {bottomViewMode === 'map' && (
                <div className="flex flex-col bg-white border border-[#d7ccbb] rounded-3xl overflow-hidden shadow-xl">
                  <div className="px-4 py-3 bg-[#f7f1e7] border-b border-[#d7ccbb] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-rose-600" />
                      <span className="text-sm sm:text-base font-black text-[#133654]">
                        {isVi ? 'Bản Đồ Địa Lý Thực Địa Toàn Cảnh Hà Nội' : 'Full Geographic Street & Satellite Map'}
                      </span>
                      <span className="text-[10px] bg-rose-100 text-rose-700 font-semibold px-2 py-0.5 rounded-full border border-rose-200">
                        GPS & Vệ tinh
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 hidden sm:inline">
                      {isVi ? 'Hiển thị nhãn cự ly km ở giữa các cung đường' : 'Road midpoint distance labels'}
                    </span>
                  </div>
                  <div className="h-[640px] w-full relative">
                    <MapView
                      locations={locations}
                      routes={routes}
                      selectedLocationId={selectedLocation?.id || null}
                      onSelectLocation={loc => setSelectedLocation(loc)}
                      highlightedPath={activePath}
                      language={language}
                      onSetStart={id => setStartId(id)}
                      onSetEnd={id => setEndId(id)}
                      mapHeight="640px"
                      selectedIds={selectedIds}
                      onToggleItinerary={handleToggleItinerary}
                      onSelectItinerary={handleSelectItinerary}
                    />
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* VIEW 2: Distance Matrix & Comprehensive Calculator */}
        {activeView === 'matrix' && (
          <DistanceMatrixView
            locations={locations}
            routes={routes}
            language={language}
            onSelectRouteForPlanner={(from, to) => {
              setStartId(from);
              setEndId(to);
              setCurrentMode('subset');
              setSelectedIds(Array.from(new Set(['TL', from, to])));
              setActiveView('guide');
              setCurrentStep('result');
            }}
            onOpenMap={locId => {
              const loc = locations.find(l => l.id === locId);
              if (loc) setSelectedLocation(loc);
              setActiveView('guide');
            }}
            onSelectLocationDetail={loc => setSelectedLocation(loc)}
          />
        )}

        {/* VIEW 3: Data Manager & Supabase Sync */}
        {activeView === 'data' && (
          <DataManagerModal
            locations={locations}
            setLocations={setLocations}
            routes={routes}
            setRoutes={setRoutes}
            presets={PRESET_SELECTIONS}
            language={language}
            onResetData={handleReset}
          />
        )}

      </main>

      {/* Location Detail Modal */}
      <LocationDetailModal
        location={selectedLocation}
        allLocations={locations}
        onClose={() => setSelectedLocation(null)}
        language={language}
        onSetStart={id => setStartId(id)}
        onSetEnd={id => setEndId(id)}
        routes={routes}
        onFocusMainMap={id => {
          const loc = locations.find(l => l.id === id);
          if (loc) setSelectedLocation(loc);
        }}
        selectedIds={selectedIds}
        onToggleItinerary={handleToggleItinerary}
        onUpdateLocation={handleUpdateLocation}
        initialTab={modalInitialTab}
      />

      {/* Footer in Dulichmarie style */}
      <footer className="border-t border-[#d7ccbb]/70 bg-[#f7f1e7]/80 py-4 text-center text-xs text-slate-600">
        <p className="font-medium">
          {isVi 
            ? '© 2026 THPT Thăng Long - Hà Nội • Mô hình hóa bài toán đồ thị du lịch học đường: Chu trình Hamilton & Thuật toán Dijkstra' 
            : '© 2026 Thang Long High School - Hanoi • Heritage Tourism Graph Theory: Hamiltonian Cycles & Dijkstra Algorithm'}
        </p>
      </footer>

    </div>
  );
}
