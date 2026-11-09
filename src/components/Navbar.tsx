import React from 'react';
import { 
  Compass, 
  Map as MapIcon, 
  Share2, 
  BookOpen, 
  Database, 
  Sparkles,
  School,
  Languages,
  Ruler
} from 'lucide-react';
import { Language } from '../types';

interface NavbarProps {
  currentTab: 'graph' | 'map' | 'tour' | 'distance' | 'data';
  setCurrentTab: (tab: 'graph' | 'map' | 'tour' | 'distance' | 'data') => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onSelectThangLong: () => void;
  onOpenPreset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  language,
  setLanguage,
  onSelectThangLong,
  onOpenPreset
}) => {
  const isVi = language === 'vi';

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <School className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-base sm:text-lg">
                Hà Nội Tour Explorer
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                THPT Thăng Long
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {isVi ? 'Đồ thị di sản & Lộ trình du lịch thủ đô' : 'Heritage Graph & Capital Tour Planner'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setCurrentTab('graph')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              currentTab === 'graph'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden md:inline">{isVi ? 'Đồ thị Mạng lưới' : 'Network Graph'}</span>
            <span className="md:hidden">{isVi ? 'Đồ thị' : 'Graph'}</span>
          </button>

          <button
            onClick={() => setCurrentTab('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              currentTab === 'map'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span className="hidden md:inline">{isVi ? 'Bản đồ Địa lý' : 'Geo Map'}</span>
            <span className="md:hidden">{isVi ? 'Bản đồ' : 'Map'}</span>
          </button>

          <button
            onClick={() => setCurrentTab('tour')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              currentTab === 'tour'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="hidden md:inline">{isVi ? 'Lịch trình & Tour' : 'Tours & Routing'}</span>
            <span className="md:hidden">{isVi ? 'Tour' : 'Tour'}</span>
          </button>

          <button
            onClick={() => setCurrentTab('distance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              currentTab === 'distance'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Ruler className="w-4 h-4" />
            <span className="hidden md:inline">{isVi ? 'Khoảng cách' : 'Distances'}</span>
            <span className="md:hidden">{isVi ? 'Cự ly' : 'Dist'}</span>
          </button>

          <button
            onClick={() => setCurrentTab('data')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              currentTab === 'data'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Database className="w-4 h-4" />
            <span className="hidden md:inline">{isVi ? 'Quản lý Dữ liệu' : 'Data Sync'}</span>
            <span className="md:hidden">{isVi ? 'Dữ liệu' : 'Data'}</span>
          </button>
        </nav>

        {/* Quick Actions & Language */}
        <div className="flex items-center gap-2">
          {/* Preset Button */}
          <button
            onClick={onOpenPreset}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isVi ? 'Tour Mẫu' : 'Presets'}</span>
          </button>

          {/* Quick jump to THPT Thang Long */}
          <button
            onClick={onSelectThangLong}
            title={isVi ? 'Xem THPT Thăng Long' : 'Focus Thang Long High School'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-amber-400 border border-slate-700 hover:border-amber-500/40 hover:bg-slate-700/80 transition-colors"
          >
            <School className="w-4 h-4" />
            <span className="hidden sm:inline">TL-HN</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(isVi ? 'en' : 'vi')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700/80 text-slate-200 transition-colors"
            title={isVi ? 'Chuyển sang tiếng Anh' : 'Switch to Vietnamese'}
          >
            <Languages className="w-3.5 h-3.5 text-amber-400" />
            <span>{isVi ? 'VI' : 'EN'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
