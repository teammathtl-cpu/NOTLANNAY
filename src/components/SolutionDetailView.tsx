import React, { useState, useMemo } from 'react';
import { TouristLocation, Route, ModeType, Language, AlternativePlan, DijkstraStep } from '../types';
import { getDirectDistance, calculateTravelTimes } from '../utils/graphAlgorithms';
import { 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Layers, 
  Ruler, 
  Navigation, 
  Clock, 
  Sparkles, 
  School, 
  Share2, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Copy, 
  Check, 
  Printer, 
  Info, 
  BookOpen, 
  ChevronRight,
  MapPin,
  Flame,
  ArrowRight
} from 'lucide-react';

interface SolutionDetailViewProps {
  currentMode: ModeType;
  activePlan: AlternativePlan;
  alternativePlans: AlternativePlan[];
  activePlanId: string;
  setActivePlanId: (id: string) => void;
  selectedIds: string[];
  startId: string;
  endId: string;
  locations: TouristLocation[];
  routes: Route[];
  language: Language;
  onOpenDetailModal: (loc: TouristLocation, initialTab?: 'info' | 'map' | 'distances') => void;
  dijkstraRunResult: { path: string[]; totalDistanceKm: number; steps: DijkstraStep[] } | null;
  dijkstraCurrentStep: number;
  setDijkstraCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  isPlayingDijkstra: boolean;
  setIsPlayingDijkstra: (playing: boolean) => void;
  onToggleAudio: () => void;
  isSpeaking: boolean;
}

export const SolutionDetailView: React.FC<SolutionDetailViewProps> = ({
  currentMode,
  activePlan,
  alternativePlans,
  activePlanId,
  setActivePlanId,
  selectedIds,
  startId,
  endId,
  locations,
  routes,
  language,
  onOpenDetailModal,
  dijkstraRunResult,
  dijkstraCurrentStep,
  setDijkstraCurrentStep,
  isPlayingDijkstra,
  setIsPlayingDijkstra,
  onToggleAudio,
  isSpeaking,
}) => {
  const isVi = language === 'vi';
  const [activeTab, setActiveTab] = useState<'math' | 'turnbyturn' | 'plans' | 'matrix'>('math');
  const [copied, setCopied] = useState(false);

  const locationMap = useMemo(() => new Map(locations.map(l => [l.id, l])), [locations]);

  // Sequential segments of the chosen optimal path
  const segments = useMemo(() => {
    const list: Array<{
      fromLoc: TouristLocation;
      toLoc: TouristLocation;
      distanceKm: number;
      accumulatedKm: number;
      stepNumber: number;
    }> = [];

    let acc = 0;
    for (let i = 0; i < activePlan.path.length - 1; i++) {
      const u = activePlan.path[i];
      const v = activePlan.path[i + 1];
      const fromLoc = locationMap.get(u);
      const toLoc = locationMap.get(v);
      if (fromLoc && toLoc) {
        const dist = getDirectDistance(u, v, routes) || 0;
        acc += dist;
        list.push({
          fromLoc,
          toLoc,
          distanceKm: dist,
          accumulatedKm: Math.round(acc * 10) / 10,
          stepNumber: i + 1,
        });
      }
    }
    return list;
  }, [activePlan.path, locationMap, routes]);

  const travelStats = useMemo(() => {
    return calculateTravelTimes(activePlan.totalDistanceKm);
  }, [activePlan.totalDistanceKm]);

  // Mode title and mathematical description
  const modeMeta = useMemo(() => {
    if (currentMode === 'cycle') {
      return {
        lessonTitleVi: 'BÀI 1 — BÀI TOÁN CHU TRÌNH HAMILTON TỐI ƯU (XUẤT PHÁT & KẾT THÚC CÙNG LÀ 1 ĐỊA ĐIỂM)',
        lessonTitleEn: 'LESSON 1 — OPTIMAL HAMILTONIAN CYCLE (SAME START & END LOCATION)',
        mathObjectiveVi: 'Điểm xuất phát và điểm kết thúc mặc định cùng là 1 địa điểm (THPT Thăng Long). Tìm chu trình đơn khép kín C = (TL, v₂, v₃, ..., vₙ, TL) xuất phát từ trường, ghé thăm tất cả các danh thắng đã chọn đúng 1 lần và quay trở về trường sao cho tổng trọng số cự ly L(C) = ∑ w(e) đạt giá trị nhỏ nhất (Minimum).',
        mathObjectiveEn: 'Origin and destination are the exact same location (Thang Long High School). Find a closed Hamiltonian cycle starting from school, visiting each stop once and returning to school minimizing total distance.',
        complexityVi: `Không gian tìm kiếm hoán vị: (${selectedIds.length - 1})! / 2 chu trình ứng viên đối xứng.`,
        complexityEn: `Search space: (${selectedIds.length - 1})! / 2 symmetric cycle permutations.`,
      };
    } else if (currentMode === 'path') {
      return {
        lessonTitleVi: 'BÀI 2 — BÀI TOÁN ĐƯỜNG ĐI HAMILTON MỘT CHIỀU NGẮN NHẤT',
        lessonTitleEn: 'LESSON 2 — SHORTEST ONE-WAY HAMILTONIAN PATH',
        mathObjectiveVi: `Tìm đường đi đơn P = (TL, v₂, ..., vₙ₋₁, ${locationMap.get(endId)?.label || 'Đích'}) xuất phát từ THPT Thăng Long, đi qua tất cả các điểm đã chọn và kết thúc tại ${locationMap.get(endId)?.label || 'Điểm hẹn'} sao cho L(P) đạt giá trị nhỏ nhất.`,
        mathObjectiveEn: `Find a one-way Hamiltonian path starting at TL, visiting all intermediate stops, and concluding at ${locationMap.get(endId)?.label || 'Destination'} with minimum distance.`,
        complexityVi: `Không gian tìm kiếm: (${Math.max(1, selectedIds.length - 2)})! hoán vị thứ tự ghé thăm các điểm trung gian.`,
        complexityEn: `Permutation space: (${Math.max(1, selectedIds.length - 2)})! orderings of intermediate stops.`,
      };
    } else {
      return {
        lessonTitleVi: 'BÀI 3 — THUẬT TOÁN DIJKSTRA TÌM ĐƯỜNG ĐI NGẮN NHẤT TRONG TẬP CHỌN',
        lessonTitleEn: 'LESSON 3 — DIJKSTRA SHORTEST PATH ON CHOSEN SUBSET',
        mathObjectiveVi: `Áp dụng thuật toán nhãn khoảng cách Dijkstra để tìm đường đi ngắn nhất từ đỉnh nguồn s = TL đến đỉnh đích t = ${locationMap.get(endId)?.label || 'Đích'} chỉ sử dụng các cạnh và đỉnh thuộc tập hợp đã chọn.`,
        mathObjectiveEn: `Apply Dijkstra distance labeling algorithm from source s = TL to target t restricted strictly to the chosen subset nodes.`,
        complexityVi: `Độ phức tạp thuật toán: O(|V|²), bảo đảm tìm ra đường đi ngắn nhất toàn cục không phụ thuộc thứ tự cảm tính.`,
        complexityEn: `Algorithm complexity: O(|V|²), guaranteed optimal shortest path.`,
      };
    }
  }, [currentMode, selectedIds.length, endId, locationMap]);

  // Copy solution text
  const handleCopySolution = () => {
    const text = `
=== ${isVi ? modeMeta.lessonTitleVi : modeMeta.lessonTitleEn} ===
THPT Thăng Long - Hà Nội

Tổng cự ly tối ưu: ${activePlan.totalDistanceKm} km
Thời gian xe máy ước tính: ~${travelStats.motoMinutes} phút
Thời gian đi bộ ước tính: ~${travelStats.walkMinutes} phút

Lộ trình chi tiết:
${activePlan.path.map((id, i) => `${i + 1}. ${locationMap.get(id)?.fullName || id}`).join(' ➔ ')}

Từng chặng:
${segments.map(s => `• Chặng ${s.stepNumber}: ${s.fromLoc.label} ➔ ${s.toLoc.label}: ${s.distanceKm} km (Tích lũy: ${s.accumulatedKm} km)`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-4">

      {/* 1. Grand Result Banner in dulichmarie editorial style */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#102c3f] via-[#133654] to-[#1f4f73] text-white shadow-md border border-[#d7ccbb]/40 relative overflow-hidden">
        
        {/* Subtle decorative background pattern */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[11px] font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isVi ? 'Lời Giải Tối Ưu Đã Được Chứng Minh' : 'Optimal Solution Verified'}</span>
            </div>
            
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {isVi ? modeMeta.lessonTitleVi : modeMeta.lessonTitleEn}
            </h3>

            <p className="text-xs text-white/85 max-w-2xl mt-1 leading-relaxed font-medium">
              {isVi ? modeMeta.mathObjectiveVi : modeMeta.mathObjectiveEn}
            </p>
          </div>

          {/* Metric Counter Card */}
          <div className="bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/20 text-right shrink-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
              {isVi ? 'Tổng chiều dài tối ưu' : 'Optimal Tour Length'}
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white flex items-baseline justify-end gap-1.5 mt-0.5">
              <span className="tracking-tight text-amber-300">{activePlan.totalDistanceKm}</span>
              <span className="text-sm font-bold text-white/80">km</span>
            </div>
            <div className="text-[11px] text-white/90 font-medium mt-1 flex items-center justify-end gap-2">
              <span>{segments.length} {isVi ? 'chặng nối' : 'legs'}</span>
              <span>•</span>
              <span>{activePlan.path.length} {isVi ? 'điểm dừng' : 'stops'}</span>
            </div>
          </div>
        </div>

        {/* Highlight Stats Strip (Motorbike, Walking, Energy) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-white/15 relative z-10 text-xs font-semibold">
          <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm p-2 rounded-xl border border-white/10">
            <span className="text-base">🛵</span>
            <div>
              <div className="text-[10px] text-white/70">{isVi ? 'Thời gian xe máy' : 'Motorbike time'}</div>
              <div className="font-extrabold text-amber-300 text-xs sm:text-sm">~{travelStats.motoMinutes} {isVi ? 'phút' : 'mins'}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm p-2 rounded-xl border border-white/10">
            <span className="text-base">🚶</span>
            <div>
              <div className="text-[10px] text-white/70">{isVi ? 'Thời gian đi bộ' : 'Walking time'}</div>
              <div className="font-extrabold text-white text-xs sm:text-sm">~{travelStats.walkMinutes} {isVi ? 'phút' : 'mins'}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm p-2 rounded-xl border border-white/10">
            <span className="text-base">🔥</span>
            <div>
              <div className="text-[10px] text-white/70">{isVi ? 'Tiêu hao calo' : 'Calories burned'}</div>
              <div className="font-extrabold text-emerald-300 text-xs sm:text-sm">~{travelStats.caloriesBurnedWalk} kcal</div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm p-2 rounded-xl border border-white/10">
            <span className="text-base">🏛️</span>
            <div>
              <div className="text-[10px] text-white/70">
                {currentMode === 'cycle' 
                  ? (isVi ? 'Xuất phát & Về đích' : 'Start & Finish') 
                  : (isVi ? 'Khởi hành từ' : 'Origin')}
              </div>
              <div className="font-extrabold text-white text-xs truncate">
                {currentMode === 'cycle' ? 'THPT Thăng Long (Khép kín)' : 'THPT Thăng Long'}
              </div>
            </div>
          </div>
        </div>

        {/* Top Solution Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mt-4 pt-3.5 border-t border-white/15 relative z-10">
          {/* Audio narration button */}
          <button
            type="button"
            onClick={onToggleAudio}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
              isSpeaking
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-300" />}
            <span>
              {isSpeaking 
                ? (isVi ? 'Dừng phát thuyết minh' : 'Stop Narration') 
                : (isVi ? 'Nghe thuyết minh audio guide' : 'Listen to Audio Guide')}
            </span>
          </button>

          {/* Copy and Print buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySolution}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
              title={isVi ? 'Sao chép kết quả lời giải vào clipboard' : 'Copy solution'}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-300" />}
              <span>{copied ? (isVi ? 'Đã sao chép!' : 'Copied!') : (isVi ? 'Sao chép lời giải' : 'Copy')}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
              title={isVi ? 'In bài toán và lời giải chi tiết' : 'Print solution report'}
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>{isVi ? 'In lời giải' : 'Print'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* 2. Navigation Tabs for the Solution View */}
      <div className="flex items-center gap-2 p-1.5 bg-[#ede4d4] rounded-2xl border border-[#d7ccbb] overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('math')}
          className={`flex-1 py-2 px-3.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'math'
              ? 'bg-[#133654] text-amber-300 shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>{isVi ? '1. Lời giải toán học chi tiết' : '1. Math Solution & Proof'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('turnbyturn')}
          className={`flex-1 py-2 px-3.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'turnbyturn'
              ? 'bg-[#133654] text-amber-300 shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <Navigation className="w-4 h-4 text-emerald-400" />
          <span>{isVi ? '2. Lộ trình thực địa từng chặng' : '2. Turn-by-Turn Guide'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('plans')}
          className={`flex-1 py-2 px-3.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'plans'
              ? 'bg-[#133654] text-amber-300 shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <Share2 className="w-4 h-4 text-sky-400" />
          <span>{isVi ? '3. Đối chiếu phương án' : '3. Alternative Plans'}</span>
          {alternativePlans.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
              {alternativePlans.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('matrix')}
          className={`flex-1 py-2 px-3.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'matrix'
              ? 'bg-[#133654] text-amber-300 shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <Ruler className="w-4 h-4 text-purple-400" />
          <span>{isVi ? '4. Ma trận cự ly nghiệm' : '4. Solution Matrix'}</span>
        </button>
      </div>

      {/* 3. TAB 1: LỜI GIẢI TOÁN HỌC CHI TIẾT (MATHEMATICAL PROOF & FORMULATION) */}
      {activeTab === 'math' && (
        <div className="space-y-4">
          
          {/* Card: Mathematical Modeling */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#d7ccbb] shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-[#133654] pb-2 border-b border-[#e6ded1]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#133654]" />
              <h4 className="font-black text-sm uppercase tracking-wide">
                {isVi ? 'I. Mô Hình Toán Học Đồ Thị & Hàm Mục Tiêu' : 'I. Graph Mathematical Formulation'}
              </h4>
            </div>

            <div className="text-xs text-slate-700 space-y-2 leading-relaxed">
              <p>
                {isVi ? (
                  <>
                    Xét đồ thị trọng số vô hướng <strong>G = (V, E, W)</strong>, trong đó:
                  </>
                ) : (
                  <>
                    Consider the weighted undirected graph <strong>G = (V, E, W)</strong>:
                  </>
                )}
              </p>

              <div className="p-3 rounded-xl bg-[#fbf8f3] border border-[#e6ded1] space-y-1 font-mono text-[11px] text-slate-800">
                <div>• V = {'{'} {selectedIds.map(id => locationMap.get(id)?.label || id).join(', ')} {'}'} (|V| = {selectedIds.length} đỉnh)</div>
                {currentMode === 'cycle' ? (
                  <div>• s = t = THPT Thăng Long (Điểm xuất phát và điểm kết thúc cùng là 1 địa điểm mặc định tạo thành chu trình khép kín C)</div>
                ) : (
                  <>
                    <div>• s = THPT Thăng Long (đỉnh xuất phát khởi hành)</div>
                    {endId && <div>• t = {locationMap.get(endId)?.label || endId} (đỉnh kết thúc danh thắng)</div>}
                  </>
                )}
                <div>• w(u, v): Khoảng cách mạng lưới đường bộ thực tế tại thủ đô Hà Nội giữa 2 danh thắng u và v (km)</div>
              </div>

              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300/80">
                <div className="font-bold text-amber-950 text-xs mb-1">
                  {isVi ? 'Hàm mục tiêu tối ưu cự ly:' : 'Objective Function:'}
                </div>
                <div className="font-mono text-xs font-black text-[#133654]">
                  {currentMode === 'cycle'
                    ? 'min L(C) = w(TL, v₂) + w(v₂, v₃) + ... + w(vₙ, TL)'
                    : currentMode === 'path'
                    ? `min L(P) = w(TL, v₂) + ... + w(vₙ₋₁, ${locationMap.get(endId)?.label || 'Đích'})`
                    : `min dist(TL, ${locationMap.get(endId)?.label || 'Đích'}) trong tập con V`}
                </div>
                <div className="text-[11px] text-amber-900 mt-1">
                  {modeMeta.complexityVi}
                </div>
              </div>
            </div>
          </div>

          {/* Card: Turn-by-turn Proof Calculation */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#d7ccbb] shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e6ded1]">
              <div className="flex items-center gap-2 text-[#133654]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <h4 className="font-black text-sm uppercase tracking-wide">
                  {isVi ? 'II. Chi Tiết Tính Toán Từng Chặng Của Nghiệm Tối Ưu' : 'II. Step-by-Step Distance Calculation'}
                </h4>
              </div>
              <span className="text-xs font-black text-emerald-700">
                ∑ = {activePlan.totalDistanceKm} km
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#e6ded1]">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#f7f1e7] text-[#133654]">
                    <th className="p-2.5 font-black text-center w-12">#</th>
                    <th className="p-2.5 font-black">{isVi ? 'Điểm xuất phát' : 'From'}</th>
                    <th className="p-2.5 font-black text-center w-8">➔</th>
                    <th className="p-2.5 font-black">{isVi ? 'Điểm đến' : 'To'}</th>
                    <th className="p-2.5 font-black text-right">{isVi ? 'Cự ly chặng' : 'Leg km'}</th>
                    <th className="p-2.5 font-black text-right">{isVi ? 'Cự ly tích lũy' : 'Cumulative'}</th>
                    <th className="p-2.5 font-black text-right">{isVi ? 'Thời gian xe máy' : 'Moto time'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6ded1]">
                  {segments.map((seg, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 text-center font-bold text-slate-500">{seg.stepNumber}</td>
                      <td className="p-2.5 font-extrabold text-[#133654]">{seg.fromLoc.label}</td>
                      <td className="p-2.5 text-center text-amber-500 font-black">➔</td>
                      <td className="p-2.5 font-extrabold text-slate-900">{seg.toLoc.label}</td>
                      <td className="p-2.5 text-right font-black text-amber-600">
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                          {seg.distanceKm} km
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-bold text-slate-700">{seg.accumulatedKm} km</td>
                      <td className="p-2.5 text-right text-slate-500 font-medium">~{Math.round(seg.distanceKm * 2.2)} ph</td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50 font-black text-[#133654] border-t-2 border-emerald-300">
                    <td colSpan={4} className="p-2.5 text-right uppercase tracking-wider text-emerald-950 font-black">
                      {isVi ? 'Tổng chiều dài hành trình nghiệm (L*):' : 'Total Path Distance (L*):'}
                    </td>
                    <td className="p-2.5 text-right text-emerald-800 text-sm">
                      {activePlan.totalDistanceKm} km
                    </td>
                    <td className="p-2.5 text-right text-emerald-800 text-sm">
                      {activePlan.totalDistanceKm} km
                    </td>
                    <td className="p-2.5 text-right text-emerald-800">
                      ~{travelStats.motoMinutes} ph
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Pedagogical mathematical commentary */}
            <div className="p-3.5 rounded-xl bg-[#fbf8f3] border border-[#d7ccbb] text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#133654] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#133654]">
                  {isVi ? 'Nhận xét sư phạm & thực tiễn:' : 'Pedagogical Note:'}
                </span>{' '}
                {currentMode === 'cycle' ? (
                  isVi 
                    ? `Chu trình khép kín này đảm bảo thỏa mãn điều kiện Hamilton đơn (không lặp lại bất kỳ danh thắng nào trừ điểm xuất phát Thăng Long). Bất đẳng thức tam giác được bảo toàn, không xuất hiện hiện tượng quay xe ngoằn ngoèo, tận dụng tối đa trục giao thông xuyên tâm và các đường vành đai thủ đô.`
                    : 'The closed Hamiltonian cycle visits each stop once without sub-tours, respecting triangle inequality.'
                ) : currentMode === 'path' ? (
                  isVi
                    ? `Đường đi một chiều tối ưu nối THPT Thăng Long tới ${locationMap.get(endId)?.label || 'Điểm kết thúc'} đảm bảo ghé thăm đủ ${selectedIds.length} danh thắng với thời gian di chuyển tổng thể ngắn nhất.`
                    : 'Optimal one-way Hamiltonian path connecting origin to destination with minimum travel time.'
                ) : (
                  isVi
                    ? `Thuật toán Dijkstra đảm bảo tính tối ưu toàn cục nhờ nguyên lý Bellman: mọi chặng con của một đường đi ngắn nhất đều là đường đi ngắn nhất giữa hai điểm đầu cuối của chặng đó.`
                    : 'Dijkstra guarantees global optimality via Bellman principle of optimality.'
                )}
              </div>
            </div>
          </div>

          {/* SPECIAL DIJKSTRA TABLE & PLAYER IF MODE 3 */}
          {currentMode === 'subset' && dijkstraRunResult && (
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#d7ccbb] shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#e6ded1]">
                <div className="flex items-center gap-2 text-[#133654]">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <h4 className="font-black text-sm uppercase tracking-wide">
                    {isVi ? 'III. Bảng Ma Trận Các Bước Lặp Thuật Toán Dijkstra' : 'III. Dijkstra Algorithm Iteration Matrix'}
                  </h4>
                </div>

                {/* Player Controls */}
                <div className="flex items-center gap-1.5 p-1 bg-amber-50 rounded-xl border border-amber-300">
                  <button
                    type="button"
                    onClick={() => setDijkstraCurrentStep(prev => Math.max(0, prev - 1))}
                    disabled={dijkstraCurrentStep === 0}
                    className="p-1 rounded-lg bg-white border border-amber-300 text-slate-700 disabled:opacity-40 cursor-pointer"
                    title={isVi ? 'Bước trước' : 'Previous step'}
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPlayingDijkstra(!isPlayingDijkstra)}
                    className="px-2.5 py-1 rounded-lg bg-[#82501f] text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    {isPlayingDijkstra ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlayingDijkstra ? (isVi ? 'Dừng' : 'Pause') : (isVi ? 'Chạy tự động' : 'Play')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDijkstraCurrentStep(prev => Math.min(dijkstraRunResult.steps.length - 1, prev + 1))}
                    disabled={dijkstraCurrentStep >= dijkstraRunResult.steps.length - 1}
                    className="p-1 rounded-lg bg-white border border-amber-300 text-slate-700 disabled:opacity-40 cursor-pointer"
                    title={isVi ? 'Bước tiếp theo' : 'Next step'}
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-bold text-amber-900 px-1.5">
                    {dijkstraCurrentStep + 1} / {dijkstraRunResult.steps.length}
                  </span>
                </div>
              </div>

              {/* Current Step Explanation Box */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-xs font-semibold text-amber-950 leading-relaxed">
                <span className="font-extrabold uppercase text-[10px] bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full mr-2">
                  {isVi ? `Bước ${dijkstraCurrentStep + 1}` : `Step ${dijkstraCurrentStep + 1}`}
                </span>
                {isVi 
                  ? dijkstraRunResult.steps[dijkstraCurrentStep]?.explanationVi 
                  : dijkstraRunResult.steps[dijkstraCurrentStep]?.explanationEn}
              </div>

              {/* Step Table */}
              <div className="overflow-x-auto rounded-xl border border-[#e6ded1]">
                <table className="w-full text-xs text-center border-collapse">
                  <thead>
                    <tr className="bg-[#f7f1e7] text-[#133654]">
                      <th className="p-2 border border-[#e6ded1] font-black">{isVi ? 'Bước lặp' : 'Step'}</th>
                      <th className="p-2 border border-[#e6ded1] font-black">{isVi ? 'Đỉnh xét (u)' : 'Selected u'}</th>
                      {selectedIds.map(nodeId => (
                        <th key={nodeId} className="p-2 border border-[#e6ded1] font-black whitespace-nowrap">
                          {locationMap.get(nodeId)?.label || nodeId}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dijkstraRunResult.steps.slice(0, dijkstraCurrentStep + 1).map((step, idx) => {
                      const isCurrentActiveRow = idx === dijkstraCurrentStep;
                      return (
                        <tr
                          key={idx}
                          className={`border-b border-[#e6ded1] ${
                            isCurrentActiveRow ? 'bg-amber-100/60 font-black' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="p-2 border border-[#e6ded1] font-bold text-slate-600">k = {step.stepIndex}</td>
                          <td className="p-2 border border-[#e6ded1] font-extrabold text-[#133654] bg-white">
                            {locationMap.get(step.currentNode)?.label || step.currentNode}
                          </td>
                          {selectedIds.map(nodeId => {
                            const d = step.distances[nodeId];
                            const prev = step.previous[nodeId];
                            const isVisited = step.visitedNodes.includes(nodeId);
                            const isCurrentNode = step.currentNode === nodeId;

                            return (
                              <td
                                key={nodeId}
                                className={`p-2 border border-[#e6ded1] ${
                                  isCurrentNode 
                                    ? 'bg-amber-300 text-slate-950 font-black' 
                                    : isVisited 
                                    ? 'bg-emerald-50 text-emerald-900 font-bold' 
                                    : 'text-slate-700'
                                }`}
                              >
                                {d === Infinity ? '∞' : `${d}k`}
                                {prev && d !== Infinity && (
                                  <span className="text-[9px] block text-slate-500 font-normal">
                                    ←{locationMap.get(prev)?.label || prev}
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Backtracking Path Representation */}
              <div className="p-3 rounded-xl bg-slate-900 text-amber-300 font-mono text-xs flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-slate-400 font-normal mr-2">{isVi ? 'Truy vết đỉnh đích về nguồn:' : 'Backtracking path:'}</span>
                  <strong>{dijkstraRunResult.path.join(' ➔ ')}</strong>
                </div>
                <div className="text-white font-bold">
                  {isVi ? 'Cự ly ngắn nhất:' : 'Shortest distance:'} <span className="text-amber-400 text-sm">{dijkstraRunResult.totalDistanceKm} km</span>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 4. TAB 2: LỘ TRÌNH THỰC ĐỊA TỪNG CHẶNG (TURN-BY-TURN HERITAGE GUIDE) */}
      {activeTab === 'turnbyturn' && (
        <div className="bg-white border border-[#d7ccbb] p-4 sm:p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#e6ded1]">
            <h4 className="font-black text-sm text-[#133654] flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-600" />
              <span>{isVi ? 'Hướng Dẫn Lộ Trình & Thuyết Minh Các Điểm Đến' : 'Turn-by-Turn Field Guide'}</span>
            </h4>
            <span className="text-xs font-bold text-slate-500">
              {activePlan.path.length} {isVi ? 'điểm dừng chân' : 'stops'}
            </span>
          </div>

          <div className="space-y-4">
            {activePlan.path.map((nodeId, idx) => {
              const loc = locationMap.get(nodeId);
              if (!loc) return null;
              const isSchool = nodeId === 'TL';
              const nextId = activePlan.path[idx + 1];
              const segmentKm = nextId ? getDirectDistance(nodeId, nextId, routes) : null;

              return (
                <div key={`${nodeId}-${idx}`} className="space-y-2">
                  
                  {/* Location card with photo and editorial highlights */}
                  <div
                    onClick={() => onOpenDetailModal(loc)}
                    className="p-3.5 bg-[#fbf8f3] hover:bg-white border border-[#d7ccbb] hover:border-[#133654] rounded-2xl transition-all cursor-pointer shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Photo Thumbnail */}
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-[#d7ccbb]">
                        <img
                          src={loc.imageUrl || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200&q=80'}
                          alt={loc.fullName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className={`absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                          isSchool ? 'bg-amber-400 text-slate-900' : 'bg-[#133654] text-white'
                        }`}>
                          {idx + 1}
                        </div>
                      </div>

                      <div>
                        <div className="font-black text-sm text-[#133654] flex items-center gap-2">
                          <span>{loc.label}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#133654]/10 text-[#133654]">
                            {loc.category}
                          </span>
                          {isSchool && (
                            <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">
                              {isVi ? 'Trường' : 'Origin'}
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-slate-800 line-clamp-1">
                          {loc.fullName}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 line-clamp-1">
                          <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>{loc.neighborhood}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl bg-white group-hover:bg-[#133654] text-[#133654] group-hover:text-white border border-[#d7ccbb] text-xs font-bold transition-colors cursor-pointer shrink-0 self-end sm:self-center"
                    >
                      {isVi ? 'Khám phá di sản ➔' : 'Explore ➔'}
                    </button>
                  </div>

                  {/* Midpoint Connecting Highway Badge between stops */}
                  {nextId && segmentKm !== null && (
                    <div className="pl-6 flex items-center gap-3 relative py-0.5">
                      <div className="w-0.5 h-8 bg-gradient-to-b from-amber-400 to-[#133654] ml-1" />
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-amber-300 shadow-2xs text-[11px] font-bold text-[#133654]">
                        <span className="text-amber-500 font-black">↓</span>
                        <span>{isVi ? 'Chặng' : 'Leg'} {idx + 1}:</span>
                        <span className="px-2 py-0.2 bg-[#133654] text-amber-300 rounded-full font-black text-[11px]">
                          {segmentKm} km
                        </span>
                        <span className="text-slate-500 font-medium hidden sm:inline">
                          (🛵 ~{Math.round(segmentKm * 2.2)} ph)
                        </span>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. TAB 3: ĐỐI CHIẾU CÁC PHƯƠNG ÁN HÀNH TRÌNH (ALTERNATIVE PLANS) */}
      {activeTab === 'plans' && (
        <div className="bg-white border border-[#d7ccbb] p-4 sm:p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#e6ded1]">
            <h4 className="font-black text-sm text-[#133654] flex items-center gap-2">
              <Share2 className="w-4 h-4 text-sky-600" />
              <span>{isVi ? 'So Sánh Các Phương Án Lựa Chọn Hành Trình Khác Nhau' : 'Alternative Route Comparison'}</span>
            </h4>
            <span className="text-xs font-bold text-slate-500">
              {alternativePlans.length} {isVi ? 'phương án khả dĩ' : 'plans'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {alternativePlans.map((plan, idx) => {
              const isSelected = plan.id === activePlanId;
              const diffPercent = ((plan.totalDistanceKm - activePlan.totalDistanceKm) / (activePlan.totalDistanceKm || 1) * 100).toFixed(0);

              return (
                <div
                  key={plan.id}
                  onClick={() => setActivePlanId(plan.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#133654] text-white border-[#133654] shadow-md ring-2 ring-amber-400/50'
                      : 'bg-[#fbf8f3] hover:bg-white text-slate-800 border-[#d7ccbb]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        idx === 0 
                          ? (isSelected ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-900') 
                          : (isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700')
                      }`}>
                        {idx === 0 ? (isVi ? '⭐ Tối ưu nhất' : '⭐ Optimal') : `${isVi ? 'Phương án' : 'Option'} ${idx + 1}`}
                      </span>

                      {idx > 0 && (
                        <span className={`text-[10px] font-bold ${isSelected ? 'text-amber-300' : 'text-slate-500'}`}>
                          +{diffPercent}%
                        </span>
                      )}
                    </div>

                    <h5 className="font-extrabold text-xs sm:text-sm mt-1 leading-snug">
                      {isVi ? plan.title : plan.titleEn}
                    </h5>

                    <p className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${isSelected ? 'text-white/80' : 'text-slate-600'}`}>
                      {isVi ? plan.description : plan.descriptionEn}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/15 flex items-baseline justify-between">
                    <span className="text-[11px] font-semibold">{isVi ? 'Tổng chiều dài:' : 'Total Distance:'}</span>
                    <span className={`text-base font-black ${isSelected ? 'text-amber-300' : 'text-[#133654]'}`}>
                      {plan.totalDistanceKm} km
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. TAB 4: MA TRẬN CỰ LY NGHIỆM (DISTANCE MATRIX OF SELECTED PATH) */}
      {activeTab === 'matrix' && (
        <div className="bg-white border border-[#d7ccbb] p-4 sm:p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#e6ded1]">
            <h4 className="font-black text-sm text-[#133654] flex items-center gap-2">
              <Ruler className="w-4 h-4 text-purple-600" />
              <span>{isVi ? 'Bảng Ma Trận Cự Ly Thực Tế Giữa Các Điểm Trong Lời Giải' : 'Distance Matrix of Solution Path'}</span>
            </h4>
            <span className="text-[11px] font-bold text-slate-500">Đơn vị: km</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#e6ded1]">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-[#f7f1e7] text-[#133654]">
                  <th className="p-2 border border-[#e6ded1] font-black text-left">{isVi ? 'Từ / Đến' : 'From / To'}</th>
                  {Array.from(new Set(activePlan.path)).map(id => (
                    <th key={id} className="p-2 border border-[#e6ded1] font-black whitespace-nowrap">
                      {locationMap.get(id)?.label || id}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from(new Set(activePlan.path)).map(rowId => (
                  <tr key={rowId} className="hover:bg-slate-50">
                    <td className="p-2 border border-[#e6ded1] font-extrabold text-left text-[#133654] bg-[#fbf8f3] whitespace-nowrap">
                      {locationMap.get(rowId)?.label || rowId}
                    </td>
                    {Array.from(new Set(activePlan.path)).map(colId => {
                      if (rowId === colId) {
                        return (
                          <td key={colId} className="p-2 border border-[#e6ded1] text-slate-300 font-bold bg-slate-50">
                            0
                          </td>
                        );
                      }
                      const dist = getDirectDistance(rowId, colId, routes);
                      return (
                        <td
                          key={colId}
                          className={`p-2 border border-[#e6ded1] font-extrabold ${
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
  );
};
