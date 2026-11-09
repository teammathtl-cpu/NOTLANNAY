import React, { useState } from 'react';
import { MarieHeader } from './components/MarieHeader';
import { GuideShell } from './components/GuideShell';
import { VisualStage } from './components/VisualStage';
import { MapView } from './components/MapView';
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
  runDijkstraWithSteps 
} from './utils/graphAlgorithms';
import { MapPin, School, Sparkles, Ruler } from 'lucide-react';
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
  const [endId, setEndId] = useState<string>('');

  // Active path to highlight across Map & Graph
  const [activePath, setActivePath] = useState<string[]>([
    'TL', 'BH', 'CDX', 'HTTL', 'VMQTG', 'TL'
  ]);

  // Selected location for detail modal and initial active tab ('info' | 'map' | 'distances')
  const [selectedLocation, setSelectedLocation] = useState<TouristLocation | null>(null);
  const [modalInitialTab, setModalInitialTab] = useState<'info' | 'map' | 'distances'>('info');

  // Layout mode for Guide view: 'split' (50/50) | 'wide-list' (full-width stops grid) | 'wide-map'
  const [layoutMode, setLayoutMode] = useState<'split' | 'wide-list' | 'wide-map'>('split');

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
      setEndId(preset.endId || '');
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
    setEndId('');
    setActivePath(['TL', 'BH', 'CDX', 'HTTL', 'VMQTG', 'TL']);
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

            {/* Expansive Full-Width Geographic Map Down Below */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white/95 border border-[#d7ccbb] p-4 rounded-3xl shadow-xs">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#133654] flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-rose-600" />
                    <span>{isVi ? 'Bản Đồ Địa Lý Toàn Cảnh Hà Nội — Kết Nối 14 Điểm Đến' : 'Full Geographic Map of Hanoi — Connecting 14 Landmarks'}</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {isVi 
                      ? 'Hiển thị chi tiết thực địa từng điểm đến, cự ly từng chặng (km) và đường đi thực tế xuất phát từ THPT Thăng Long.' 
                      : 'Real-world street map showing all 14 landmarks, segment distances in km, and active tour route.'}
                  </p>
                </div>

                {/* Quick focus pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                  <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">{isVi ? 'Xem nhanh:' : 'Focus:'}</span>
                  {locations.map(loc => (
                    <button
                      key={loc.id}
                      onClick={() => setSelectedLocation(loc)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                        loc.id === 'TL' 
                          ? 'bg-[#133654] text-white shadow-2xs' 
                          : 'bg-[#f7f1e7] hover:bg-slate-200 text-slate-800 border border-[#d7ccbb]'
                      }`}
                    >
                      {loc.id === 'TL' ? '🏛️ ' : ''}{loc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* High-fidelity Map container */}
              <MapView
                locations={locations}
                routes={routes}
                selectedLocationId={selectedLocation?.id || null}
                onSelectLocation={loc => setSelectedLocation(loc)}
                highlightedPath={activePath}
                language={language}
                onSetStart={id => setStartId(id)}
                onSetEnd={id => setEndId(id)}
                mapHeight="580px"
                selectedIds={selectedIds}
                onToggleItinerary={handleToggleItinerary}
                onSelectItinerary={handleSelectItinerary}
              />
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
