import React, { useState } from 'react';
import { TouristLocation, Route, Language } from '../types';
import { MapView } from './MapView';
import { GraphCanvas } from './GraphCanvas';
import { 
  Map as MapIcon, 
  Share2, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Sparkles, 
  School,
  Layers,
  Compass
} from 'lucide-react';

interface VisualStageProps {
  locations: TouristLocation[];
  routes: Route[];
  selectedLocationId: string | null;
  onSelectLocation: (loc: TouristLocation) => void;
  activePath: string[];
  language: Language;
  onSetStart: (id: string) => void;
  onSetEnd: (id: string) => void;
  startId: string;
  endId: string;
  selectedIds?: string[];
  onToggleItinerary?: (id: string) => void;
  onSelectItinerary?: () => void;
}

export const VisualStage: React.FC<VisualStageProps> = ({
  locations,
  routes,
  selectedLocationId,
  onSelectLocation,
  activePath,
  language,
  onSetStart,
  onSetEnd,
  startId,
  endId,
  selectedIds,
  onToggleItinerary,
  onSelectItinerary,
}) => {
  const isVi = language === 'vi';
  const [viewMode, setViewMode] = useState<'map' | 'graph'>('map');

  return (
    <div className="relative w-full h-full min-h-[720px] bg-[#fbf8f3] border border-[#d7ccbb] rounded-3xl shadow-sm overflow-hidden flex flex-col">
      
      {/* Top Controls Toolbar */}
      <div className="p-3 bg-[#f7f1e7] border-b border-[#e6ded1] flex flex-wrap items-center justify-between gap-2 z-20">
        
        {/* Switch between Map and Graph */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-white rounded-xl border border-[#d7ccbb] shadow-2xs">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-[#133654] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>{isVi ? 'Bản đồ Địa lý' : 'Geo Map'}</span>
            </button>

            <button
              onClick={() => setViewMode('graph')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'graph'
                  ? 'bg-[#133654] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isVi ? 'Đồ thị Mạng lưới' : 'Network Graph'}</span>
            </button>
          </div>

          {/* Action button: Chọn hành trình */}
          {onSelectItinerary && (
            <button
              onClick={onSelectItinerary}
              disabled={!selectedIds || selectedIds.length < 2}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer ${
                selectedIds && selectedIds.length >= 2
                  ? 'bg-[#133654] hover:bg-[#0b2236] text-white ring-2 ring-amber-400/50 hover:scale-[1.02]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              title={isVi ? 'Tính toán & chọn hành trình tối ưu' : 'Compute & Select Itinerary'}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isVi ? 'Chọn hành trình' : 'Select Itinerary'}</span>
              {selectedIds && selectedIds.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                  {selectedIds.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Route status banner */}
        {activePath.length > 0 && (
          <div className="flex items-center gap-2 bg-[#d7a15e]/20 border border-[#d7a15e]/60 px-3 py-1 rounded-xl text-xs font-bold text-[#82501f]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isVi ? `Lộ trình: ${activePath.length} điểm dừng` : `Active: ${activePath.length} stops`}</span>
          </div>
        )}

      </div>

      {/* Visual Canvas / Map Container */}
      <div className="flex-1 relative w-full h-full min-h-[660px]">
        {viewMode === 'map' ? (
          <MapView
            locations={locations}
            routes={routes}
            selectedLocationId={selectedLocationId}
            onSelectLocation={onSelectLocation}
            highlightedPath={activePath}
            language={language}
            onSetStart={onSetStart}
            onSetEnd={onSetEnd}
            selectedIds={selectedIds}
            onToggleItinerary={onToggleItinerary}
            onSelectItinerary={onSelectItinerary}
          />
        ) : (
          <GraphCanvas
            locations={locations}
            routes={routes}
            selectedLocationId={selectedLocationId}
            onSelectLocation={onSelectLocation}
            highlightedPath={activePath}
            language={language}
            onSetStart={onSetStart}
            onSetEnd={onSetEnd}
            startId={startId}
            endId={endId}
          />
        )}
      </div>

    </div>
  );
};
