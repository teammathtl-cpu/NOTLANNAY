import React, { useState, useMemo, useEffect } from 'react';
import { 
  TouristLocation, 
  Route, 
  ModeType, 
  StepType, 
  Language, 
  PresetSelectionMap,
  DijkstraStep,
  AlternativePlan
} from '../types';
import { 
  getDirectDistance, 
  calculateTravelTimes,
  solveHamiltonianCycle,
  solveHamiltonianPath,
  runDijkstraWithSteps,
  generateAlternativePlans,
  calculatePathDistance
} from '../utils/graphAlgorithms';
import { 
  Sparkles, 
  Check, 
  Plus, 
  Minus, 
  ArrowRight, 
  RotateCcw, 
  School, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Clock, 
  Footprints, 
  Bike, 
  Car, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  ExternalLink,
  MapPin,
  Flame,
  Search,
  Filter,
  Maximize2,
  Ruler,
  Compass
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MiniLocationMap } from './MiniLocationMap';
import { SubgraphPreview } from './SubgraphPreview';
import { SolutionDetailView } from './SolutionDetailView';

interface GuideShellProps {
  locations: TouristLocation[];
  routes: Route[];
  currentMode: ModeType;
  currentStep: StepType;
  setCurrentStep: (step: StepType) => void;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  startId: string;
  setStartId: (id: string) => void;
  endId: string;
  setEndId: (id: string) => void;
  language: Language;
  presets: PresetSelectionMap;
  onApplyPathToMap: (path: string[]) => void;
  onOpenDetailModal: (loc: TouristLocation, initialTab?: 'info' | 'map' | 'distances') => void;
  activePath: string[];
  onSelectItinerary?: () => void;
  isExpandedView?: boolean;
  onToggleExpandedView?: () => void;
}

export const GuideShell: React.FC<GuideShellProps> = ({
  locations,
  routes,
  currentMode,
  currentStep,
  setCurrentStep,
  selectedIds,
  setSelectedIds,
  startId,
  setStartId,
  endId,
  setEndId,
  language,
  presets,
  onApplyPathToMap,
  onOpenDetailModal,
  activePath,
  onSelectItinerary,
  isExpandedView = false,
  onToggleExpandedView,
}) => {
  const isVi = language === 'vi';
  const locationMap = useMemo(() => new Map(locations.map(l => [l.id, l])), [locations]);

  // Mode: Preset (Mẫu gợi ý sẵn mặc định) vs Custom free pick
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Search & Filter in Step 1
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Alternative comparison plan in Step 3
  const [activePlanId, setActivePlanId] = useState<string>('optimal');

  // Audio narrator state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Active mini map preview for specific card
  const [openMiniMapId, setOpenMiniMapId] = useState<string | null>(null);

  // View option: show clear geo maps on all location cards (default false to keep cards clean and spacious)
  const [showMapOnAllCards, setShowMapOnAllCards] = useState<boolean>(false);

  // Dijkstra Player state in Step 3
  const [dijkstraCurrentStep, setDijkstraCurrentStep] = useState<number>(0);
  const [isPlayingDijkstra, setIsPlayingDijkstra] = useState<boolean>(false);

  // Mode rules & copy
  const modeConfig = useMemo(() => {
    if (currentMode === 'cycle') {
      return {
        requiredCount: 5,
        titleVi: 'Bài 1 — Chu Trình Hamilton Khép Kín (Xuất phát & Kết thúc tại THPT Thăng Long)',
        titleEn: 'Lesson 1 — Closed Hamiltonian Cycle (Origin & Destination at Thang Long High School)',
        storyVi: 'Xuất phát từ THPT Thăng Long, ghé thăm các danh lam thắng cảnh tiêu biểu quanh thủ đô Hà Nội và quay trở về trường. Điểm xuất phát và điểm kết thúc là cùng một địa điểm (THPT Thăng Long), tạo thành một chu trình Hamilton khép kín hoàn chỉnh.',
        storyEn: 'Start at Thang Long High School, explore iconic Hanoi heritage spots, and return to the school. Origin and destination are the exact same location, forming a complete closed Hamiltonian loop.',
        needVi: 'Yêu cầu: Điểm xuất phát và kết thúc cùng là 1 địa điểm mặc định (THPT Thăng Long). Tìm chu trình ngắn nhất đi qua mỗi điểm đúng 1 lần.',
        needEn: 'Requirement: Start and finish at the same location (Thang Long High School). Find the shortest cycle visiting each stop exactly once.',
        bgGradient: 'from-[#102c3f] via-[#1f4f73] to-[#d7a15e]',
        btnBg: 'bg-[#133654] hover:bg-[#0f2e48]',
      };
    } else if (currentMode === 'path') {
      return {
        requiredCount: 5,
        titleVi: 'Từ cổng trường đến một điểm hẹn cuối',
        titleEn: 'From school gate to a final destination',
        storyVi: 'Chuyến tham quan xuất phát từ THPT Thăng Long và kết thúc tại một danh thắng trọng điểm (như Lăng Bác, Hoàng Thành hay Hồ Gươm), mô phỏng nhu cầu thực tế của một hành trình một chiều có chủ đích.',
        storyEn: 'A tour that begins at Thang Long High School and concludes at a specific landmark such as the Mausoleum or Citadel in one continuous path.',
        needVi: 'Nhu cầu: Tìm đường đi Hamilton ngắn nhất từ trường tới điểm kết thúc, đi qua tất cả các điểm đã chọn.',
        needEn: 'Need: Find the shortest one-way Hamiltonian path from school to destination visiting all selected stops.',
        bgGradient: 'from-[#4a182f] via-[#6b2745] to-[#d7a15e]',
        btnBg: 'bg-[#6b2745] hover:bg-[#571f38]',
      };
    } else {
      return {
        requiredCount: 2,
        titleVi: 'Đi nhanh nhất từ điểm đầu đến điểm cuối (Dijkstra)',
        titleEn: 'Fastest route from start to finish (Dijkstra)',
        storyVi: 'Bạn có thể khoanh chọn một tập hợp các địa điểm quan tâm, rồi yêu cầu hệ thống tìm đường đi ngắn nhất từ trường tới điểm hẹn chỉ trong tập đó, có giải thuật Dijkstra từng bước minh họa.',
        storyEn: 'Select any subset of locations and let the Dijkstra algorithm compute the shortest path restricted strictly to that chosen subset with step-by-step player.',
        needVi: 'Nhu cầu: Tìm đường đi ngắn nhất giữa hai địa điểm trong chính tập điểm đã chọn.',
        needEn: 'Need: Find shortest path between origin and destination inside the chosen subset.',
        bgGradient: 'from-[#42220b] via-[#82501f] to-[#d7a15e]',
        btnBg: 'bg-[#82501f] hover:bg-[#6a4018]',
      };
    }
  }, [currentMode]);

  // Is selection ready to run
  const isSelectionReady = useMemo(() => {
    if (isCustomMode) {
      if (currentMode === 'cycle') return selectedIds.length >= 2;
      if (currentMode === 'path') return selectedIds.length >= 2;
      return selectedIds.length >= 2;
    }
    if (currentMode === 'cycle') return selectedIds.length === 5;
    if (currentMode === 'path') return selectedIds.length === 5 && !!endId && endId !== startId;
    return selectedIds.length >= 2 && !!endId && endId !== startId;
  }, [isCustomMode, currentMode, selectedIds, endId, startId]);

  // Hint message
  const selectionHint = useMemo(() => {
    const count = selectedIds.length;
    if (isCustomMode) {
      if (count < 2) {
        return isVi 
          ? `Tự chọn địa điểm: Đang chọn ${count} điểm. Vui lòng chọn ít nhất 2 địa điểm.` 
          : `Custom mode: ${count} selected. Please select at least 2 stops.`;
      }
      return isVi 
        ? `Đã tự chọn ${count} địa điểm. Nhấn "Chọn hành trình" để tính đường đi tối ưu!` 
        : `${count} custom stops selected. Click "Select Itinerary" to calculate!`;
    }
    if (currentMode === 'cycle') {
      if (count < 5) return isVi ? `Mẫu có sẵn: Cần thêm ${5 - count} điểm nữa (tổng 5 điểm).` : `Preset: Need ${5 - count} more stops (5 total).`;
      return isVi ? 'Đã đủ 5 điểm mẫu. Sẵn sàng chọn hành trình.' : '5 preset stops ready. Click Select Itinerary.';
    } else if (currentMode === 'path') {
      if (count < 5) return isVi ? `Mẫu có sẵn: Cần thêm ${5 - count} điểm nữa.` : `Preset: Need ${5 - count} more stops.`;
      if (!endId || endId === startId) return isVi ? 'Đã đủ 5 điểm. Hãy chọn điểm kết thúc bên dưới.' : 'Choose destination endpoint below.';
      return isVi ? 'Đã sẵn sàng chạy lộ trình một chiều.' : 'Ready to run one-way path.';
    } else {
      if (count < 2) return isVi ? `Cần thêm ít nhất ${2 - count} điểm.` : `Need at least ${2 - count} more stops.`;
      if (!endId || endId === startId) return isVi ? 'Chọn điểm kết thúc để chạy Dijkstra.' : 'Select destination endpoint.';
      return isVi ? `Đã có ${count} điểm trong tập chọn. Sẵn sàng chạy Dijkstra.` : `${count} stops in subset. Ready for Dijkstra.`;
    }
  }, [isCustomMode, currentMode, selectedIds, endId, startId, isVi]);

  // Alternative Plans & Results
  const alternativePlans = useMemo(() => {
    if (!isSelectionReady) return [];
    return generateAlternativePlans(currentMode, selectedIds, startId, endId, routes);
  }, [isSelectionReady, currentMode, selectedIds, startId, endId, routes]);

  // Active chosen plan
  const activePlan = useMemo(() => {
    return alternativePlans.find(p => p.id === activePlanId) || alternativePlans[0] || null;
  }, [alternativePlans, activePlanId]);

  // Dijkstra Player Steps (in Mode 3)
  const dijkstraRunResult = useMemo(() => {
    if (currentMode !== 'subset' || !isSelectionReady) return null;
    return runDijkstraWithSteps(startId, endId, selectedIds, routes, locations);
  }, [currentMode, isSelectionReady, startId, endId, selectedIds, routes, locations]);

  // Auto-apply path to map when plan changes
  useEffect(() => {
    if (activePlan && (currentStep === 'preview' || currentStep === 'result')) {
      onApplyPathToMap(activePlan.path);
    }
  }, [activePlan, currentStep]);

  // Dijkstra Player timer
  useEffect(() => {
    let interval: any = null;
    if (isPlayingDijkstra && dijkstraRunResult) {
      interval = setInterval(() => {
        setDijkstraCurrentStep(prev => {
          if (prev >= dijkstraRunResult.steps.length - 1) {
            setIsPlayingDijkstra(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1400);
    }
    return () => clearInterval(interval);
  }, [isPlayingDijkstra, dijkstraRunResult]);

  // Load Preset
  const handleLoadPreset = () => {
    const preset = presets[currentMode];
    if (preset) {
      setIsCustomMode(false);
      setSelectedIds(preset.ids);
      setStartId(preset.startId);
      setEndId(currentMode === 'cycle' ? 'TL' : (preset.endId || ''));
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
    }
  };

  // Clear Selection for manual fresh start
  const handleClearSelection = () => {
    setIsCustomMode(true);
    setSelectedIds(['TL']);
    setEndId(currentMode === 'cycle' ? 'TL' : '');
  };

  // Execute 'Chọn hành trình'
  const handleExecuteSelectItinerary = () => {
    if (onSelectItinerary) {
      onSelectItinerary();
      return;
    }
    if (selectedIds.length < 2) {
      alert(isVi ? 'Vui lòng chọn ít nhất 2 địa điểm để tạo hành trình!' : 'Please select at least 2 locations to build a tour!');
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
    if (activePlan) {
      onApplyPathToMap(activePlan.path);
    }
    setCurrentStep('preview');
    confetti({ particleCount: 40, spread: 65, origin: { y: 0.75 } });
  };

  // Toggle location selection
  const handleToggleLocation = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(x => x !== id));
      if (endId === id) setEndId('');
    } else {
      if (!isCustomMode && (currentMode === 'cycle' || currentMode === 'path') && selectedIds.length >= 5) {
        // Automatically switch to custom mode so the user is not frustrated!
        setIsCustomMode(true);
      }
      setSelectedIds(prev => [...prev, id]);
    }
  };

  // Trigger audio guide
  const handleToggleAudio = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!activePlan) return;
    const pathLocs = activePlan.path.map(id => locationMap.get(id)).filter(Boolean) as TouristLocation[];

    let text = '';
    if (isVi) {
      text = `Chào mừng bạn đến với lộ trình tham quan xuất phát từ THPT Thăng Long Hà Nội. 
      Tổng chiều dài hành trình là ${activePlan.totalDistanceKm} ki-lô-mét. 
      Hành trình lần lượt đi qua: ${pathLocs.map(l => l.fullName).join(', ')}. Chúc bạn có một chuyến đi tuyệt vời!`;
    } else {
      text = `Welcome to the heritage tour starting from Thang Long High School Hanoi. 
      Total route distance is ${activePlan.totalDistanceKm} kilometers. 
      The tour visits: ${pathLocs.map(l => l.fullNameEn || l.fullName).join(', ')}. Enjoy your trip!`;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isVi ? 'vi-VN' : 'en-US';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Filtered locations for Step 1
  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      const matchCat = categoryFilter === 'all' || loc.category === categoryFilter;
      const term = searchTerm.toLowerCase().trim();
      if (!term) return matchCat;
      const matchSearch =
        loc.fullName.toLowerCase().includes(term) ||
        (loc.fullNameEn || '').toLowerCase().includes(term) ||
        loc.label.toLowerCase().includes(term) ||
        loc.neighborhood.toLowerCase().includes(term);
      return matchCat && matchSearch;
    });
  }, [locations, categoryFilter, searchTerm]);

  // Categories
  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(locations.map(l => l.category)))];
  }, [locations]);

  return (
    <div className="flex flex-col h-full bg-[#fbf8f3] border border-[#d7ccbb] rounded-3xl shadow-sm overflow-hidden text-slate-900">
      
      {/* 1. Mode Hero Banner (Editorial Gradient Header) */}
      <div className={`p-5 sm:p-6 bg-gradient-to-br ${modeConfig.bgGradient} text-white relative overflow-hidden shadow-xs`}>
        <div className="flex flex-wrap items-start justify-between gap-3 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold backdrop-blur-md mb-2">
              <School className="w-3.5 h-3.5" />
              <span>{isVi ? 'Khởi hành từ THPT Thăng Long' : 'Origin: Thang Long High School'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {isVi ? modeConfig.titleVi : modeConfig.titleEn}
            </h2>
            <p className="text-xs text-white/90 leading-relaxed max-w-2xl mt-1">
              {isVi ? modeConfig.storyVi : modeConfig.storyEn}
            </p>
          </div>

          {/* Selection Mode switch & actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="flex items-center p-1 bg-black/25 backdrop-blur-md rounded-xl border border-white/20 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setIsCustomMode(true);
                  if (selectedIds.length === 0) setSelectedIds(['TL']);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  isCustomMode
                    ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
                title={isVi ? 'Tự do chọn các địa điểm theo ý muốn mà không tự động chọn sẵn' : 'Manually pick locations without preset'}
              >
                <span>🎯</span>
                <span>{isVi ? 'Tự chọn địa điểm' : 'Custom Pick'}</span>
              </button>

              <button
                type="button"
                onClick={handleLoadPreset}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  !isCustomMode
                    ? 'bg-white text-[#133654] font-black shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
                title={isVi ? 'Tự động nạp mẫu 5 địa điểm theo bài học' : 'Load 5 preset locations'}
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{isVi ? 'Mẫu gợi ý sẵn' : 'Preset'}</span>
              </button>
            </div>

            <button
              onClick={handleClearSelection}
              className="px-3 py-1.5 rounded-xl bg-black/20 hover:bg-black/35 text-white/90 hover:text-white text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
              title={isVi ? 'Xóa để tự chọn danh sách địa điểm mới' : 'Clear selection'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isVi ? 'Tự chọn mới' : 'Reset'}</span>
            </button>
          </div>
        </div>

        {/* Rule badge */}
        <div className="mt-3 pt-3 border-t border-white/20 flex flex-wrap items-center justify-between gap-2 text-xs text-white/90">
          <div className="font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>
              {isCustomMode
                ? (isVi ? 'Chế độ Tự chọn: Bạn có thể tự do bấm chọn bất kỳ địa danh nào bên dưới (từ 2 điểm trở lên).' : 'Custom mode: Freely select any stops below (2+ stops).')
                : (isVi ? modeConfig.needVi : modeConfig.needEn)}
            </span>
          </div>
          <div className="px-2.5 py-0.5 rounded-full bg-black/30 font-bold text-[11px] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{isVi ? `Đã chọn: ${selectedIds.length} địa điểm` : `Selected: ${selectedIds.length} stops`}</span>
          </div>
        </div>
      </div>

      {/* 2. Stepper Tabs (1. Chọn điểm → 2. Xem trước đồ thị → 3. Kết quả & Lời giải) */}
      <div className="border-b border-[#e6ded1] bg-[#f7f1e7] p-2 flex items-center gap-2">
        <button
          onClick={() => setCurrentStep('select')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            currentStep === 'select'
              ? 'bg-white text-[#133654] shadow-xs border border-[#d7ccbb]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-[#133654]/10 text-[#133654] flex items-center justify-center text-[10px]">
            1
          </span>
          <span>{isVi ? 'Chọn điểm' : 'Select stops'}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#133654]/10 text-[#133654]">
            {selectedIds.length}
          </span>
        </button>

        <button
          onClick={() => {
            if (isSelectionReady) setCurrentStep('preview');
          }}
          disabled={!isSelectionReady}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
            currentStep === 'preview'
              ? 'bg-white text-[#133654] shadow-xs border border-[#d7ccbb]'
              : isSelectionReady
              ? 'text-slate-600 hover:text-slate-900 hover:bg-white/50 cursor-pointer'
              : 'text-slate-400 opacity-50 cursor-not-allowed'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-[#133654]/10 text-[#133654] flex items-center justify-center text-[10px]">
            2
          </span>
          <span>{isVi ? 'Xem trước đồ thị' : 'Preview graph'}</span>
        </button>

        <button
          onClick={() => {
            if (isSelectionReady) {
              setCurrentStep('result');
              confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
            }
          }}
          disabled={!isSelectionReady}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
            currentStep === 'result'
              ? 'bg-white text-[#133654] shadow-xs border border-[#d7ccbb]'
              : isSelectionReady
              ? 'text-slate-600 hover:text-slate-900 hover:bg-white/50 cursor-pointer'
              : 'text-slate-400 opacity-50 cursor-not-allowed'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-[#133654]/10 text-[#133654] flex items-center justify-center text-[10px]">
            3
          </span>
          <span>{isVi ? 'Kết quả & Lời giải' : 'Run result'}</span>
        </button>
      </div>

      {/* 3. Stepper Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        
        {/* STEP 1: CHỌN ĐIỂM */}
        {currentStep === 'select' && (
          <div className="space-y-4">
            
            {/* Status bar & Action button */}
            <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs ${
              isSelectionReady
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center gap-2">
                {isSelectionReady ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span className="font-semibold text-xs leading-relaxed">{selectionHint}</span>
              </div>

              {/* Dedicated 'Chọn hành trình' button */}
              <button
                type="button"
                onClick={handleExecuteSelectItinerary}
                disabled={!isSelectionReady}
                className={`px-4 py-2 rounded-xl font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isSelectionReady
                    ? 'bg-[#133654] hover:bg-[#0b2438] text-white ring-2 ring-amber-400/50 hover:scale-[1.02]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                }`}
                title={isVi ? 'Nhấn để tạo và hiển thị lộ trình tối ưu' : 'Click to select and view optimal tour'}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>{isVi ? 'Chọn hành trình' : 'Select Itinerary'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
              </button>
            </div>

            {/* For Mode 1 (Cycle): Show explicit same start & end location indicator */}
            {currentMode === 'cycle' && (
              <div className="bg-gradient-to-r from-amber-50 to-[#fdfbf7] border border-amber-300 p-3.5 rounded-2xl shadow-2xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#133654] text-amber-300 flex items-center justify-center font-black text-xs shrink-0 shadow-xs border border-amber-400/50">
                    🏛️ TL
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#133654] flex items-center gap-2">
                      <span>{isVi ? 'Bài 1: Điểm xuất phát và kết thúc cùng là 1 địa điểm mặc định' : 'Lesson 1: Origin & Destination are the same location'}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                      {isVi 
                        ? '🏛️ THPT Thăng Long (Khởi hành) ➔ Tham quan các điểm đã chọn ➔ 🏛️ THPT Thăng Long (Khép kín một vòng)'
                        : '🏛️ Thang Long High School (Origin) ➔ Selected stops ➔ 🏛️ Thang Long High School (Finish loop)'}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 whitespace-nowrap hidden sm:inline-block">
                  ✓ {isVi ? 'Chu trình khép kín' : 'Closed Loop'}
                </span>
              </div>
            )}

            {/* Target End Point Selector for Mode 2 (Path) and Mode 3 (Subset) */}
            {(currentMode === 'path' || currentMode === 'subset') && (
              <div className="bg-white border border-[#d7ccbb] p-3.5 rounded-2xl shadow-2xs space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>
                    {isVi ? 'Chọn điểm kết thúc hành trình (Điểm cuối):' : 'Select tour destination (End point):'}
                  </span>
                  <span className="text-[11px] text-rose-600 font-semibold">
                    {endId ? (locationMap.get(endId)?.label || endId) : (isVi ? 'Chưa chọn' : 'None')}
                  </span>
                </label>
                <select
                  value={endId}
                  onChange={e => setEndId(e.target.value)}
                  className="w-full bg-[#fbf8f3] border border-[#d7ccbb] rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#133654] cursor-pointer"
                >
                  <option value="">{isVi ? '-- Nhấn để chọn điểm kết thúc --' : '-- Select destination --'}</option>
                  {selectedIds
                    .filter(id => id !== 'TL')
                    .map(id => {
                      const loc = locationMap.get(id);
                      if (!loc) return null;
                      return (
                        <option key={id} value={id}>
                          🏁 {loc.label} — {isVi ? loc.fullName : (loc.fullNameEn || loc.fullName)}
                        </option>
                      );
                    })}
                </select>
              </div>
            )}

            {/* Search & Filter Bar + Map toggle and View mode */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder={isVi ? 'Tìm kiếm danh thắng Hà Nội...' : 'Search Hanoi landmarks...'}
                  className="w-full bg-white border border-[#d7ccbb] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#133654]"
                />
              </div>

              {/* Category selector */}
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="bg-white border border-[#d7ccbb] rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">{isVi ? 'Tất cả danh mục' : 'All categories'}</option>
                {categories.filter(c => c !== 'all').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Optional Expanded View Toggle */}
              {onToggleExpandedView && (
                <button
                  type="button"
                  onClick={onToggleExpandedView}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    isExpandedView
                      ? 'bg-[#133654] text-white border-[#133654] shadow-2xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-[#d7ccbb]'
                  }`}
                  title={isVi ? (isExpandedView ? 'Thu về chia đôi màn hình' : 'Mở rộng giao diện danh sách địa điểm') : 'Toggle view'}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>{isExpandedView ? (isVi ? 'Thu gọn' : 'Split') : (isVi ? 'Mở rộng giao diện' : 'Expand')}</span>
                </button>
              )}
            </div>

            {/* Location Cards Grid - Spacious, wide cards inspired by dulichmarie.vercel.app */}
            <div className={`grid gap-3.5 sm:gap-4 ${isExpandedView ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
              {filteredLocations.map(loc => {
                const isSelected = selectedIds.includes(loc.id);
                const isSchool = loc.id === 'TL';
                const isEnd = endId === loc.id;
                const isStart = startId === loc.id;
                const distToSchool = isSchool ? 0 : getDirectDistance('TL', loc.id, routes);
                const timesToSchool = distToSchool !== null ? calculateTravelTimes(distToSchool) : null;
                const selectedIndex = selectedIds.indexOf(loc.id);

                // 2 closest destinations
                const nearestOthers = locations
                  .filter(other => other.id !== loc.id)
                  .map(other => ({
                    label: other.label,
                    dist: getDirectDistance(loc.id, other.id, routes) || 3.0,
                  }))
                  .sort((a, b) => a.dist - b.dist)
                  .slice(0, 2);

                return (
                  <div
                    key={loc.id}
                    onClick={() => handleToggleLocation(loc.id)}
                    className={`group relative rounded-[24px] border text-left transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? isStart
                          ? 'ring-2 ring-blue-500 border-blue-400 bg-white shadow-md'
                          : isEnd
                          ? 'ring-2 ring-rose-500 border-rose-400 bg-white shadow-md'
                          : 'ring-2 ring-emerald-500 border-emerald-400 bg-white shadow-md'
                        : 'border-[#ded5c7] bg-white/95 hover:bg-white hover:-translate-y-0.5 hover:shadow-lg'
                    }`}
                  >
                    {/* Cover Photo Banner with Overlay */}
                    <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-slate-900">
                      <img
                        src={loc.imageUrl || (loc.images && loc.images[0]) || ''}
                        alt={loc.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => {
                          (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80';
                        }}
                      />

                      {/* Dark gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-black/25 pointer-events-none" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 z-10 pointer-events-none">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-xs">
                            {loc.category}
                          </span>

                          {isSchool && (
                            <span className="rounded-full border border-amber-300/40 bg-[#133654]/90 px-2 py-0.5 text-[10px] font-bold text-amber-200 backdrop-blur-md shadow-xs flex items-center gap-1">
                              <School className="w-3 h-3" />
                              <span>Trường</span>
                            </span>
                          )}
                        </div>

                        {/* Selection Status Badge */}
                        {isSelected && (
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black text-white shadow-md flex items-center gap-1 backdrop-blur-md ${
                            isStart ? 'bg-blue-600' : isEnd ? 'bg-rose-600' : 'bg-emerald-600'
                          }`}>
                            <span>✓</span>
                            <span>{isStart ? 'Xuất phát' : isEnd ? 'Đích' : `#${selectedIndex + 1}`}</span>
                          </span>
                        )}
                      </div>

                      {/* Bottom Title on Image */}
                      <div className="absolute inset-x-0 bottom-0 p-3.5 text-white z-10 pointer-events-none">
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300 drop-shadow-sm">
                          {loc.label}
                        </div>
                        <h4 className="mt-0.5 text-base sm:text-lg font-black text-white leading-snug drop-shadow-md line-clamp-1">
                          {isVi ? loc.fullName : (loc.fullNameEn || loc.fullName)}
                        </h4>
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-white/85">
                          <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                          <span className="truncate">{loc.neighborhood}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Body: Details & Travel Time */}
                    <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        {/* Distance & Travel time pill */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] text-slate-600 bg-[#f7f1e7] px-2.5 py-1.5 rounded-xl border border-[#ded5c7]/70">
                          <span className="font-semibold text-slate-700 flex items-center gap-1">
                            <Compass className="w-3.5 h-3.5 text-[#133654]" />
                            <span>{isSchool ? (isVi ? 'Điểm trường gốc' : 'Origin') : `${distToSchool} km ${isVi ? 'từ THPT Thăng Long' : 'from school'}`}</span>
                          </span>
                          {!isSchool && timesToSchool && (
                            <span className="font-bold text-[#133654]">
                              ~{timesToSchool.motoMinutes} {isVi ? 'phút xe máy' : 'min'}
                            </span>
                          )}
                        </div>

                        {/* Description Snippet */}
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {isVi ? loc.shortIntro || loc.description : (loc.shortIntroEn || loc.descriptionEn || loc.description)}
                        </p>

                        {/* Nearest Neighbors */}
                        <div className="text-[10px] text-slate-500 flex items-center justify-between">
                          <span className="font-medium text-slate-400">{isVi ? 'Gần:' : 'Near:'}</span>
                          <span className="truncate max-w-[200px] text-slate-700 font-semibold">
                            {nearestOthers.map(n => `${n.label} (${n.dist}km)`).join(' • ')}
                          </span>
                        </div>
                      </div>

                      {/* Action Footer: Dedicated Buttons */}
                      <div className="pt-2.5 border-t border-[#ded5c7]/80 flex flex-wrap items-center justify-between gap-2">
                        {/* Map Buttons: Google Maps & Xem bản đồ */}
                        <div className="flex items-center gap-1.5">
                          {loc.googleMapsUrl && (
                            <a
                              href={loc.googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1 text-[11px] font-bold transition-colors shadow-2xs"
                              title="Mở Google Maps"
                            >
                              <ExternalLink className="w-3 h-3 text-blue-600" />
                              <span>Google Maps</span>
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              onOpenDetailModal(loc, 'map');
                            }}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1 text-[11px] font-bold transition-colors shadow-2xs cursor-pointer"
                            title={isVi ? 'Nhấn để xem bản đồ vị trí điểm này' : 'View on map'}
                          >
                            <MapPin className="w-3 h-3 text-rose-600" />
                            <span>{isVi ? 'Xem bản đồ' : 'Map'}</span>
                          </button>
                        </div>

                        {/* Right Action Buttons */}
                        <div className="flex items-center gap-1.5 ml-auto">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              onOpenDetailModal(loc, 'info');
                            }}
                            className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-[#ded5c7] text-[11px] font-semibold cursor-pointer shadow-2xs"
                          >
                            {isVi ? 'Chi tiết' : 'Info'}
                          </button>

                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              handleToggleLocation(loc.id);
                            }}
                            className={`py-1 px-3 rounded-full text-[11px] font-black flex items-center gap-1 transition-all cursor-pointer shadow-2xs ${
                              isSelected
                                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-700/20'
                                : 'bg-[#133654] hover:bg-[#0e273c] text-white shadow-[#133654]/20'
                            }`}
                            title={isVi ? (isSelected ? 'Bỏ khỏi hành trình' : 'Thêm vào hành trình') : 'Toggle'}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-3 h-3 text-white" />
                                <span>{isVi ? 'Bỏ chọn' : 'Remove'}</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3 text-amber-300" />
                                <span>{isVi ? 'Thêm' : 'Add'}</span>
                              </>
                            )}
                          </button>

                          {(currentMode === 'path' || currentMode === 'subset') && isSelected && !isSchool && (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                setEndId(loc.id);
                              }}
                              className={`px-2 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                                isEnd ? 'bg-rose-600 text-white' : 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-200'
                              }`}
                              title={isVi ? 'Đặt làm điểm kết thúc' : 'Set as destination'}
                            >
                              {isEnd ? '🏁 Đích' : 'Chọn đích'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sticky Action Footer: Chọn hành trình */}
            <div className="sticky bottom-0 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-3.5 bg-white/95 backdrop-blur-md border-t border-[#d7ccbb] shadow-lg rounded-b-3xl z-20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto max-w-full">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#133654] whitespace-nowrap shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{isVi ? `Đã chọn: ${selectedIds.length} địa điểm` : `Selected: ${selectedIds.length} stops`}</span>
                </div>
                <div className="flex items-center gap-1 overflow-x-auto max-w-[260px] sm:max-w-[340px] pb-0.5">
                  {selectedIds.map(id => {
                    const loc = locationMap.get(id);
                    if (!loc) return null;
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#f7f1e7] border border-[#d7ccbb] text-slate-800 whitespace-nowrap shrink-0"
                      >
                        <span>{loc.id === 'TL' ? '🏛️' : '📍'} {loc.label}</span>
                        {loc.id !== 'TL' && (
                          <button
                            type="button"
                            onClick={() => handleToggleLocation(id)}
                            className="text-slate-400 hover:text-rose-600 ml-0.5 cursor-pointer font-bold"
                            title={isVi ? 'Bỏ điểm này' : 'Remove stop'}
                          >
                            ✕
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
                  title={isVi ? 'Làm trống để tự chọn danh sách mới' : 'Reset to custom pick'}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isVi ? 'Tự chọn mới' : 'Reset'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExecuteSelectItinerary}
                  disabled={selectedIds.length < 2}
                  className={`px-5 py-2 rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    selectedIds.length >= 2
                      ? 'bg-[#133654] hover:bg-[#0b2438] text-white ring-2 ring-amber-400/50 hover:scale-[1.02]'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                  }`}
                  title={isVi ? 'Nhấn để tạo và hiển thị lộ trình tối ưu' : 'Click to calculate and view optimal tour'}
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>{isVi ? 'Chọn hành trình' : 'Select Itinerary'}</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* STEP 2: XEM TRƯỚC ĐỒ THỊ & DẠNG ĐƯỜNG ĐI */}
        {currentStep === 'preview' && (
          <SubgraphPreview
            locations={locations}
            routes={routes}
            selectedIds={selectedIds}
            startId={startId}
            endId={endId}
            previewPath={activePlan?.path || []}
            currentMode={currentMode}
            language={language}
            alternativePlans={alternativePlans}
            activePlanId={activePlanId}
            onSelectPlanId={id => {
              setActivePlanId(id);
              const found = alternativePlans.find(p => p.id === id);
              if (found) onApplyPathToMap(found.path);
            }}
            onApplyPath={path => onApplyPathToMap(path)}
            onSelectLocation={loc => onOpenDetailModal(loc, 'info')}
            onAdvanceToResult={() => {
              setCurrentStep('result');
              confetti({ particleCount: 45, spread: 80, origin: { y: 0.75 } });
            }}
            onBackToSelect={() => setCurrentStep('select')}
          />
        )}

        {/* STEP 3: KẾT QUẢ & LỜI GIẢI CHI TIẾT */}
        {currentStep === 'result' && activePlan && (
          <SolutionDetailView
            currentMode={currentMode}
            activePlan={activePlan}
            alternativePlans={alternativePlans}
            activePlanId={activePlanId}
            setActivePlanId={setActivePlanId}
            selectedIds={selectedIds}
            startId={startId}
            endId={endId}
            locations={locations}
            routes={routes}
            language={language}
            onOpenDetailModal={onOpenDetailModal}
            dijkstraRunResult={dijkstraRunResult}
            dijkstraCurrentStep={dijkstraCurrentStep}
            setDijkstraCurrentStep={setDijkstraCurrentStep}
            isPlayingDijkstra={isPlayingDijkstra}
            setIsPlayingDijkstra={setIsPlayingDijkstra}
            onToggleAudio={handleToggleAudio}
            isSpeaking={isSpeaking}
          />
        )}

      </div>

    </div>
  );
};
