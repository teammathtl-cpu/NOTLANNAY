import React, { useState } from 'react';
import { 
  TouristLocation, 
  Route, 
  PathResult, 
  Language, 
  PresetSelectionMap 
} from '../types';
import { 
  findShortestPath, 
  solveTour 
} from '../utils/graphAlgorithms';
import { 
  Compass, 
  Sparkles, 
  Route as RouteIcon, 
  Clock, 
  ArrowRight, 
  MapPin, 
  CheckCircle2, 
  School, 
  Footprints, 
  Bike, 
  Car, 
  Volume2, 
  VolumeX,
  Play,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ItineraryPanelProps {
  locations: TouristLocation[];
  routes: Route[];
  startId: string;
  setStartId: (id: string) => void;
  endId: string;
  setEndId: (id: string) => void;
  onApplyPath: (path: string[], result?: PathResult) => void;
  language: Language;
  presets: PresetSelectionMap;
  onSelectLocation: (loc: TouristLocation) => void;
}

export const ItineraryPanel: React.FC<ItineraryPanelProps> = ({
  locations,
  routes,
  startId,
  setStartId,
  endId,
  setEndId,
  onApplyPath,
  language,
  presets,
  onSelectLocation,
}) => {
  const isVi = language === 'vi';

  // Mode: 'dijkstra' | 'presets' | 'multistop'
  const [mode, setMode] = useState<'dijkstra' | 'presets' | 'multistop'>('presets');

  // Multi-stop selected IDs
  const [selectedMultiIds, setSelectedMultiIds] = useState<string[]>(['TL', 'BH', 'HTTL', 'LCT']);
  const [returnToStart, setReturnToStart] = useState<boolean>(true);

  // Active calculated result
  const [activeResult, setActiveResult] = useState<PathResult | null>(null);

  // Audio Speech state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Run Dijkstra
  const handleCalculateDijkstra = () => {
    if (!startId || !endId) return;
    const res = findShortestPath(startId, endId, routes, locations);
    if (res) {
      setActiveResult(res);
      onApplyPath(res.path, res);
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
    } else {
      setActiveResult(null);
      onApplyPath([]);
    }
  };

  // Run Preset
  const handleApplyPreset = (key: string) => {
    const preset = presets[key];
    if (!preset) return;
    setStartId(preset.startId);
    if (preset.endId) setEndId(preset.endId);

    // Compute detailed path
    const res = solveTour(preset.ids, routes, locations, preset.startId === preset.endId);
    const locationMap = new Map(locations.map(l => [l.id, l]));

    // Construct steps
    const steps = [];
    for (let i = 0; i < res.path.length - 1; i++) {
      const fromLoc = locationMap.get(res.path[i]);
      const toLoc = locationMap.get(res.path[i + 1]);
      if (fromLoc && toLoc) {
        steps.push({
          from: fromLoc,
          to: toLoc,
          distanceKm: 1.5 // approximate or lookup
        });
      }
    }

    const fullResult: PathResult = {
      path: res.path,
      totalDistanceKm: res.totalDistanceKm,
      steps
    };

    setActiveResult(fullResult);
    onApplyPath(res.path, fullResult);
    confetti({ particleCount: 40, spread: 70, origin: { y: 0.7 } });
  };

  // Run Multi-Stop TSP
  const handleCalculateTour = () => {
    if (selectedMultiIds.length < 2) return;
    const tourRes = solveTour(selectedMultiIds, routes, locations, returnToStart);
    const locationMap = new Map(locations.map(l => [l.id, l]));

    const steps = [];
    for (let i = 0; i < tourRes.path.length - 1; i++) {
      const fromLoc = locationMap.get(tourRes.path[i]);
      const toLoc = locationMap.get(tourRes.path[i + 1]);
      if (fromLoc && toLoc) {
        steps.push({
          from: fromLoc,
          to: toLoc,
          distanceKm: 2.0
        });
      }
    }

    const fullResult: PathResult = {
      path: tourRes.path,
      totalDistanceKm: tourRes.totalDistanceKm,
      steps
    };

    setActiveResult(fullResult);
    onApplyPath(tourRes.path, fullResult);
    confetti({ particleCount: 45, spread: 80, origin: { y: 0.75 } });
  };

  // Audio Guide narration
  const handleToggleSpeech = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!activeResult || activeResult.path.length === 0) return;

    const locationMap = new Map(locations.map(l => [l.id, l]));
    const pathLocations = activeResult.path
      .map(id => locationMap.get(id))
      .filter(Boolean) as TouristLocation[];

    let speechText = '';
    if (isVi) {
      speechText = `Chào mừng quý khách đến với hành trình khám phá Hà Nội kết nối từ trường Trung học phổ thông Thăng Long. 
      Tổng chiều dài lộ trình là ${activeResult.totalDistanceKm} ki-lô-mét qua ${pathLocations.length} điểm dừng.
      Các điểm đến bao gồm: ${pathLocations.map(l => l.fullName).join(', ')}. Chúc bạn có một chuyến trải nghiệm thật nhiều ý nghĩa!`;
    } else {
      speechText = `Welcome to Hanoi heritage tour starting from Thang Long High School. 
      Total route distance is ${activeResult.totalDistanceKm} kilometers across ${pathLocations.length} stops.
      Stops include: ${pathLocations.map(l => l.fullNameEn || l.fullName).join(', ')}. Have a wonderful journey!`;
    }

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = isVi ? 'vi-VN' : 'en-US';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-5">
      
      {/* Tab Switcher inside Panel */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
        <button
          onClick={() => setMode('presets')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'presets'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isVi ? 'Tour Đề xuất' : 'Presets'}</span>
        </button>

        <button
          onClick={() => setMode('dijkstra')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'dijkstra'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <RouteIcon className="w-3.5 h-3.5" />
          <span>{isVi ? 'Đường ngắn nhất' : 'Shortest Path'}</span>
        </button>

        <button
          onClick={() => setMode('multistop')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'multistop'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>{isVi ? 'Tự chọn điểm' : 'Custom TSP'}</span>
        </button>
      </div>

      {/* Mode 1: Presets */}
      {mode === 'presets' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            {isVi 
              ? 'Các hành trình tiêu biểu được thiết kế xuất phát từ THPT Thăng Long:' 
              : 'Curated itineraries departing from Thang Long High School:'}
          </p>

          <div className="grid grid-cols-1 gap-2.5">
            {Object.entries(presets).map(([key, p]) => (
              <div
                key={key}
                onClick={() => handleApplyPreset(key)}
                className="group p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-200 group-hover:text-amber-300 transition-colors flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    {p.label}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {p.ids.length} {isVi ? 'điểm' : 'stops'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode 2: Dijkstra Shortest Path */}
      {mode === 'dijkstra' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>{isVi ? 'Điểm bắt đầu:' : 'Start Location:'}</span>
                <button
                  type="button"
                  onClick={() => setStartId('TL')}
                  className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                >
                  <School className="w-3 h-3" /> THPT Thăng Long
                </button>
              </label>
              <select
                value={startId}
                onChange={e => setStartId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.label} - {isVi ? loc.fullName : (loc.fullNameEn || loc.fullName)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                {isVi ? 'Điểm kết thúc:' : 'Destination:'}
              </label>
              <select
                value={endId}
                onChange={e => setEndId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.label} - {isVi ? loc.fullName : (loc.fullNameEn || loc.fullName)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleCalculateDijkstra}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RouteIcon className="w-4 h-4" />
            <span>{isVi ? 'Tìm Đường Đi Ngắn Nhất (Dijkstra)' : 'Find Shortest Path'}</span>
          </button>
        </div>
      )}

      {/* Mode 3: Multi-Stop TSP */}
      {mode === 'multistop' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>{isVi ? 'Chọn các địa danh muốn ghé thăm:' : 'Select stops to visit:'}</span>
            <button
              onClick={() => setSelectedMultiIds(locations.map(l => l.id))}
              className="text-amber-400 hover:underline"
            >
              {isVi ? 'Chọn tất cả' : 'Select all'}
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 border border-slate-800 rounded-xl p-2 bg-slate-950/60">
            {locations.map(loc => {
              const isChecked = selectedMultiIds.includes(loc.id);
              return (
                <label
                  key={loc.id}
                  className={`flex items-center justify-between p-1.5 px-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                    isChecked ? 'bg-amber-500/15 border border-amber-500/30 text-amber-200' : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedMultiIds(prev => [...prev, loc.id]);
                        } else {
                          setSelectedMultiIds(prev => prev.filter(id => id !== loc.id));
                        }
                      }}
                      className="rounded accent-amber-500"
                    />
                    <span className="font-medium text-slate-200">{loc.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 truncate max-w-[150px]">
                    {loc.category}
                  </span>
                </label>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={returnToStart}
                onChange={e => setReturnToStart(e.target.checked)}
                className="accent-amber-500 rounded"
              />
              <span>{isVi ? 'Khép kín vòng tròn (Trở lại điểm đầu)' : 'Return to starting stop'}</span>
            </label>
          </div>

          <button
            onClick={handleCalculateTour}
            disabled={selectedMultiIds.length < 2}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Compass className="w-4 h-4" />
            <span>{isVi ? 'Tối Ưu Tuyến Tham Quan (TSP Solver)' : 'Optimize Tour Order'}</span>
          </button>
        </div>
      )}

      {/* Result Display Card */}
      {activeResult && activeResult.path.length > 0 && (
        <div className="mt-2 p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-4">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="text-xs text-slate-400">{isVi ? 'Tổng chiều dài:' : 'Total Distance:'}</div>
              <div className="text-xl font-extrabold text-amber-400">
                {activeResult.totalDistanceKm} km
              </div>
            </div>

            {/* Travel Time Estimations */}
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-1" title={isVi ? 'Đi bộ (~4km/h)' : 'Walk (~4km/h)'}>
                <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                <span>{Math.round((activeResult.totalDistanceKm / 4) * 60)} {isVi ? 'ph' : 'min'}</span>
              </div>
              <div className="flex items-center gap-1" title={isVi ? 'Xe đạp (~15km/h)' : 'Bicycle (~15km/h)'}>
                <Bike className="w-3.5 h-3.5 text-sky-400" />
                <span>{Math.round((activeResult.totalDistanceKm / 15) * 60)} {isVi ? 'ph' : 'min'}</span>
              </div>
              <div className="flex items-center gap-1" title={isVi ? 'Xe máy/Taxi (~30km/h)' : 'Motorbike/Taxi (~30km/h)'}>
                <Car className="w-3.5 h-3.5 text-amber-400" />
                <span>{Math.round((activeResult.totalDistanceKm / 30) * 60)} {isVi ? 'ph' : 'min'}</span>
              </div>
            </div>
          </div>

          {/* Audio Guide Narration Button */}
          <button
            onClick={handleToggleSpeech}
            className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
              isSpeaking
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            <span>
              {isSpeaking 
                ? (isVi ? 'Dừng thuyết minh tour' : 'Stop Audio Guide')
                : (isVi ? 'Nghe thuyết minh hành trình tự động' : 'Listen to Tour Narration')}
            </span>
          </button>

          {/* Sequential Path Steps */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300">
              {isVi ? 'Thứ tự các điểm dừng:' : 'Stop sequence:'}
            </div>
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
              {activeResult.path.map((nodeId, idx) => {
                const loc = locations.find(l => l.id === nodeId);
                if (!loc) return null;
                const isThangLong = loc.id === 'TL';

                return (
                  <div
                    key={`${nodeId}-${idx}`}
                    onClick={() => onSelectLocation(loc)}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900 hover:bg-slate-800 cursor-pointer border border-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isThangLong ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-200'
                      }`}>
                        {idx + 1}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          {isVi ? loc.fullName : (loc.fullNameEn || loc.fullName)}
                          {isThangLong && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 rounded">
                              Trường
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {loc.neighborhood}
                        </div>
                      </div>
                    </div>

                    <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
