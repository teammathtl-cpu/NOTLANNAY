import React, { useState, useMemo } from 'react';
import { TouristLocation, Language } from '../types';
import { Search, MapPin, School, ArrowRight, Sparkles, Filter } from 'lucide-react';

interface LocationsListProps {
  locations: TouristLocation[];
  selectedLocationId: string | null;
  onSelectLocation: (loc: TouristLocation) => void;
  language: Language;
  onSetStart: (id: string) => void;
  onSetEnd: (id: string) => void;
}

export const LocationsList: React.FC<LocationsListProps> = ({
  locations,
  selectedLocationId,
  onSelectLocation,
  language,
  onSetStart,
  onSetEnd,
}) => {
  const isVi = language === 'vi';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(locations.map(l => l.category)));
    return ['all', ...cats];
  }, [locations]);

  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      const matchCat = selectedCategory === 'all' || loc.category === selectedCategory;
      const term = searchTerm.toLowerCase().trim();
      if (!term) return matchCat;

      const nameVi = loc.fullName.toLowerCase();
      const nameEn = (loc.fullNameEn || '').toLowerCase();
      const label = loc.label.toLowerCase();
      const desc = loc.description.toLowerCase();
      const addr = loc.neighborhood.toLowerCase();

      const matchSearch =
        nameVi.includes(term) ||
        nameEn.includes(term) ||
        label.includes(term) ||
        desc.includes(term) ||
        addr.includes(term);

      return matchCat && matchSearch;
    });
  }, [locations, selectedCategory, searchTerm]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3 h-full">
      
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder={isVi ? 'Tìm kiếm danh lam, di tích...' : 'Search locations...'}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
          >
            ×
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-2.5 py-1 rounded-lg font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat === 'all' ? (isVi ? 'Tất cả' : 'All') : cat}
          </button>
        ))}
      </div>

      {/* List count */}
      <div className="text-[11px] text-slate-400 flex items-center justify-between px-1">
        <span>
          {isVi ? `Hiển thị ${filteredLocations.length} địa điểm` : `Showing ${filteredLocations.length} spots`}
        </span>
      </div>

      {/* Scrollable Locations List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[500px]">
        {filteredLocations.map(loc => {
          const isSelected = selectedLocationId === loc.id;
          const isThangLong = loc.id === 'TL';

          return (
            <div
              key={loc.id}
              onClick={() => onSelectLocation(loc)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex gap-3 group ${
                isSelected
                  ? 'bg-slate-800 border-amber-500/80 shadow-md shadow-amber-500/10'
                  : isThangLong
                  ? 'bg-slate-950/80 border-amber-500/30 hover:border-amber-500/60'
                  : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
              }`}
            >
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-800 shrink-0 relative">
                <img
                  src={loc.imageUrl || (loc.images && loc.images[0]) || ''}
                  alt={loc.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={e => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=300&q=80';
                  }}
                />
                {isThangLong && (
                  <div className="absolute top-0 left-0 bg-amber-500 text-slate-950 p-0.5 rounded-br">
                    <School className="w-3 h-3" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-amber-300 transition-colors">
                      {isVi ? loc.fullName : (loc.fullNameEn || loc.fullName)}
                    </h4>
                  </div>
                  <span className="inline-block text-[10px] text-amber-400 font-medium">
                    {loc.category}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-800/50">
                  <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                    {loc.label}
                  </span>
                  
                  <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onSetStart(loc.id);
                      }}
                      className="text-[10px] bg-slate-800 hover:bg-emerald-600 hover:text-white px-1.5 py-0.5 rounded text-slate-300"
                      title={isVi ? 'Đặt làm điểm bắt đầu' : 'Start'}
                    >
                      {isVi ? 'Đi' : 'Start'}
                    </button>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onSetEnd(loc.id);
                      }}
                      className="text-[10px] bg-slate-800 hover:bg-rose-600 hover:text-white px-1.5 py-0.5 rounded text-slate-300"
                      title={isVi ? 'Đặt làm điểm đến' : 'End'}
                    >
                      {isVi ? 'Đến' : 'End'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
