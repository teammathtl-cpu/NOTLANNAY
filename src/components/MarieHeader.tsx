import React from 'react';
import { 
  School, 
  RotateCcw, 
  Languages, 
  Ruler, 
  Database, 
  Compass, 
  Sparkles,
  ArrowRight,
  Repeat,
  Route as RouteIcon
} from 'lucide-react';
import { ModeType, Language } from '../types';

interface MarieHeaderProps {
  currentMode: ModeType;
  setCurrentMode: (mode: ModeType) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onReset: () => void;
  onOpenPreset: () => void;
  activeView: 'guide' | 'matrix' | 'data';
  setActiveView: (view: 'guide' | 'matrix' | 'data') => void;
}

export const MarieHeader: React.FC<MarieHeaderProps> = ({
  currentMode,
  setCurrentMode,
  language,
  setLanguage,
  onReset,
  onOpenPreset,
  activeView,
  setActiveView,
}) => {
  const isVi = language === 'vi';

  const modes = [
    {
      id: 'cycle' as ModeType,
      labelVi: 'Bài 1 — Chu Trình Hamilton',
      labelEn: 'Mode 1 — Hamiltonian Cycle',
      descVi: 'Vòng khép kín',
      descEn: 'Closed loop',
      color: 'bg-[#133654]',
      hoverColor: 'hover:bg-[#0f2e48]',
      activeBorder: 'border-cyan-300 ring-2 ring-cyan-400/40',
      icon: Repeat,
    },
    {
      id: 'path' as ModeType,
      labelVi: 'Bài 2 — Đường Đi Hamilton',
      labelEn: 'Mode 2 — Hamiltonian Path',
      descVi: 'Đi một chiều',
      descEn: 'One-way path',
      color: 'bg-[#6b2745]',
      hoverColor: 'hover:bg-[#571f38]',
      activeBorder: 'border-pink-300 ring-2 ring-pink-400/40',
      icon: ArrowRight,
    },
    {
      id: 'subset' as ModeType,
      labelVi: 'Bài 3 — Đường Đi Ngắn Nhất',
      labelEn: 'Mode 3 — Shortest Path',
      descVi: 'Trong tập chọn',
      descEn: 'On subset',
      color: 'bg-[#82501f]',
      hoverColor: 'hover:bg-[#6a4018]',
      activeBorder: 'border-amber-300 ring-2 ring-amber-400/40',
      icon: RouteIcon,
    },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-[#d7ccbb]/90 bg-[#f7f1e7]/95 backdrop-blur-xl shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5">
        
        {/* Top bar: Brand + Top actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-[#e6ded1]">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#133654] via-[#1f4f73] to-[#d7a15e] p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-[#fbf8f3] rounded-[14px] flex items-center justify-center text-[#133654]">
                <School className="w-5 h-5 text-[#133654]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-[#133654]">
                  {isVi ? 'Du Lịch Vòng Quanh Thăng Long' : 'Thang Long Tour Explorer'}
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-[#133654]/10 text-[#133654] border border-[#133654]/20">
                  THPT Thăng Long
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                {isVi ? 'Hà Nội • Khám phá di sản thủ đô & ứng dụng toán học đồ thị' : 'Hanoi Heritage Tour & Graph Theory Applications'}
              </p>
            </div>
          </div>

          {/* Right Nav buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* View toggles */}
            <div className="flex items-center p-1 bg-[#ede4d4] rounded-xl border border-[#d7ccbb]">
              <button
                onClick={() => setActiveView('guide')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeView === 'guide'
                    ? 'bg-[#133654] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isVi ? 'Hành trình' : 'Tours'}
              </button>

              <button
                onClick={() => setActiveView('matrix')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  activeView === 'matrix'
                    ? 'bg-[#133654] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Ruler className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{isVi ? 'Ma trận khoảng cách' : 'Distances'}</span>
                <span className="md:hidden">{isVi ? 'Cự ly' : 'Dist'}</span>
              </button>

              <button
                onClick={() => setActiveView('data')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  activeView === 'data'
                    ? 'bg-[#133654] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{isVi ? 'Dữ liệu' : 'Data'}</span>
              </button>
            </div>

            {/* Quick preset button */}
            <button
              onClick={onOpenPreset}
              className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#d7a15e]/20 hover:bg-[#d7a15e]/30 text-[#82501f] text-xs font-bold border border-[#d7a15e]/50 transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#82501f]" />
              <span>{isVi ? 'Nạp mẫu' : 'Preset'}</span>
            </button>

            {/* Reset */}
            <button
              onClick={onReset}
              className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-[#d7ccbb] transition-colors"
              title={isVi ? 'Đặt lại mặc định' : 'Reset defaults'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Language toggle */}
            <button
              onClick={() => setLanguage(isVi ? 'en' : 'vi')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/80 hover:bg-white text-slate-800 text-xs font-bold border border-[#d7ccbb] transition-colors"
              title={isVi ? 'Chuyển sang tiếng Anh' : 'Switch to Vietnamese'}
            >
              <Languages className="w-3.5 h-3.5 text-[#133654]" />
              <span>{isVi ? 'VI' : 'EN'}</span>
            </button>
          </div>

        </div>

        {/* Bottom bar: 3 Core Mode Tabs (Bài 1, Bài 2, Bài 3) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2.5">
          {modes.map(m => {
            const isActive = currentMode === m.id;
            const Icon = m.icon;

            return (
              <button
                key={m.id}
                onClick={() => {
                  setCurrentMode(m.id);
                  if (activeView !== 'guide') setActiveView('guide');
                }}
                className={`relative px-3 py-2 rounded-2xl text-left transition-all duration-200 cursor-pointer text-white shadow-sm flex items-center justify-between ${
                  m.color
                } ${m.hoverColor} ${
                  isActive ? `ring-3 ring-offset-2 ring-offset-[#f7f1e7] ${m.activeBorder} scale-[1.01]` : 'opacity-85 hover:opacity-100'
                }`}
              >
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                    {isVi ? m.descVi : m.descEn}
                  </div>
                  <div className="text-xs sm:text-sm font-black text-white truncate">
                    {isVi ? m.labelVi : m.labelEn}
                  </div>
                </div>

                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-white text-slate-900' : 'bg-white/20 text-white'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
