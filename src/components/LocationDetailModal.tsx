import React, { useState, useMemo, useEffect } from 'react';
import { TouristLocation, Language, Route } from '../types';
import { 
  X, 
  MapPin, 
  ExternalLink, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Navigation, 
  School, 
  Clock, 
  Tag, 
  Ruler, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Check, 
  Camera, 
  Upload, 
  Car, 
  Bike, 
  Footprints,
  Compass
} from 'lucide-react';
import { getDirectDistance, calculateTravelTimes, calculateHaversineDistance } from '../utils/graphAlgorithms';
import { MiniLocationMap } from './MiniLocationMap';

interface LocationDetailModalProps {
  location: TouristLocation | null;
  allLocations: TouristLocation[];
  onClose: () => void;
  language: Language;
  onSetStart: (id: string) => void;
  onSetEnd: (id: string) => void;
  routes: Route[];
  onFocusMainMap?: (id: string) => void;
  selectedIds?: string[];
  onToggleItinerary?: (id: string) => void;
  onUpdateLocation?: (updated: TouristLocation) => void;
  initialTab?: 'info' | 'map' | 'distances';
}

export const LocationDetailModal: React.FC<LocationDetailModalProps> = ({
  location,
  allLocations,
  onClose,
  language,
  onSetStart,
  onSetEnd,
  routes,
  onFocusMainMap,
  selectedIds = [],
  onToggleItinerary,
  onUpdateLocation,
  initialTab = 'info',
}) => {
  if (!location) return null;

  const isVi = language === 'vi';
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'distances' | 'map'>(initialTab);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Sync initial tab when location or initialTab changes
  useEffect(() => {
    setActiveTab(initialTab);
    setActiveImageIndex(0);
  }, [location?.id, initialTab]);

  const images = (location.images && location.images.length > 0)
    ? location.images
    : location.imageUrl
    ? [location.imageUrl]
    : ['https://upload.wikimedia.org/wikipedia/commons/0/0a/Ho_chi_minh_mausoleum.jpg'];

  const currentImg = images[activeImageIndex] || images[0];

  const handleApplyCustomUrl = (url: string) => {
    if (!url.trim()) return;
    const cleanUrl = url.trim();
    const updated: TouristLocation = {
      ...location,
      imageUrl: cleanUrl,
      images: [cleanUrl, ...(location.images || []).filter(u => u !== cleanUrl)],
    };
    onUpdateLocation?.(updated);
    setActiveImageIndex(0);
    setShowImageEditor(false);
    setCustomImageUrl('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        handleApplyCustomUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const highlights = (isVi ? location.highlights : (location.highlightsEn || location.highlights)) || [];
  const fullName = isVi ? location.fullName : (location.fullNameEn || location.fullName);
  const description = isVi ? location.description : (location.descriptionEn || location.description);
  const neighborhood = isVi ? location.neighborhood : (location.neighborhoodEn || location.neighborhood);
  const bestFor = isVi ? location.bestFor : (location.bestForEn || location.bestFor);

  // Distance to Thang Long School
  const distToTL = location.id !== 'TL' ? getDirectDistance('TL', location.id, routes) : 0;
  const timesToTL = distToTL !== null ? calculateTravelTimes(distToTL) : null;

  // Distances to ALL other destinations sorted by proximity
  const allDistances = useMemo(() => {
    return allLocations
      .filter(l => l.id !== location.id)
      .map(otherLoc => {
        let dist = getDirectDistance(location.id, otherLoc.id, routes);
        if (dist === null) {
          dist = Math.round(calculateHaversineDistance(location.lat, location.lng, otherLoc.lat, otherLoc.lng) * 1.25 * 10) / 10;
        }
        return {
          location: otherLoc,
          distanceKm: dist,
          times: calculateTravelTimes(dist),
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [location, allLocations, routes]);

  const handleAudioTour = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `${fullName}. ${description}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = isVi ? 'vi-VN' : 'en-US';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleClose = () => {
    if (window.speechSynthesis && isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    onClose();
  };

  const isSelectedInItinerary = selectedIds.includes(location.id);
  const isSchool = location.id === 'TL';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-5xl lg:max-w-6xl max-h-[94vh] bg-[#f8f3eb] border border-[#ded5c7] rounded-3xl md:rounded-[32px] shadow-[0_30px_100px_rgba(15,23,42,0.4)] overflow-hidden flex flex-col text-slate-900"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Main 2-Column Split Layout (like dulichmarie.vercel.app) */}
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] lg:grid-cols-[1.15fr_0.85fr] max-h-[94vh] overflow-hidden">
          
          {/* ================= LEFT COLUMN: Visual Hero Stage ================= */}
          <div className="relative min-h-[300px] md:min-h-[640px] flex flex-col justify-between overflow-hidden bg-slate-950 select-none">
            
            {/* Background Full Cover Image */}
            <img
              src={currentImg}
              alt={fullName}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
              onError={e => {
                (e.currentTarget as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Ho_chi_minh_mausoleum.jpg';
              }}
            />

            {/* Dark Cinematic Gradient Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_35%),linear-gradient(180deg,rgba(15,23,42,0.2)_0%,rgba(15,23,42,0.4)_50%,rgba(15,23,42,0.92)_100%)] pointer-events-none" />

            {/* TOP BAR OVERLAY: Category, School Badge, Close & Change Photo */}
            <div className="relative z-20 p-4 md:p-6 flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 pr-12">
                <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-md">
                  {location.category}
                </span>

                {isSchool && (
                  <span className="rounded-full border border-amber-300/40 bg-[#133654]/85 px-3 py-1 text-[10px] sm:text-xs font-bold text-amber-300 backdrop-blur-md shadow-md flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5" />
                    <span>THPT Thăng Long</span>
                  </span>
                )}

                {isSelectedInItinerary && (
                  <span className="rounded-full border border-emerald-400/40 bg-emerald-600/90 px-3 py-1 text-[10px] sm:text-xs font-bold text-white backdrop-blur-md shadow-md flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{isVi ? 'Đã trong hành trình' : 'In tour'}</span>
                  </span>
                )}
              </div>

              {/* Action Buttons Top Right: Change Photo, Narration, Close */}
              <div className="flex items-center gap-1.5 shrink-0">
                {onUpdateLocation && (
                  <button
                    onClick={() => setShowImageEditor(prev => !prev)}
                    className="h-9 px-3 rounded-full border border-white/25 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-md cursor-pointer"
                    title={isVi ? 'Đổi ảnh đại diện' : 'Change photo'}
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-300" />
                    <span className="hidden sm:inline">{isVi ? 'Đổi ảnh' : 'Change'}</span>
                  </button>
                )}

                <button
                  onClick={handleAudioTour}
                  className={`h-9 px-3 rounded-full border backdrop-blur-md transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-md cursor-pointer ${
                    isSpeaking
                      ? 'border-rose-400 bg-rose-600/90 text-white animate-pulse'
                      : 'border-white/25 bg-black/40 hover:bg-black/60 text-white'
                  }`}
                  title={isVi ? (isSpeaking ? 'Dừng đọc' : 'Nghe thuyết minh âm thanh') : 'Audio Guide'}
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-300" />}
                  <span className="hidden sm:inline">{isSpeaking ? (isVi ? 'Dừng' : 'Stop') : (isVi ? 'Thuyết minh' : 'Audio')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="h-9 w-9 rounded-full border border-white/25 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors flex items-center justify-center shadow-md cursor-pointer"
                  aria-label={isVi ? 'Đóng' : 'Close'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Photo Carousel Navigation Arrows (if multiple photos) */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full border border-white/20 bg-black/35 hover:bg-black/60 text-white backdrop-blur-md transition-all flex items-center justify-center shadow-lg cursor-pointer"
                  aria-label={isVi ? 'Ảnh trước' : 'Previous'}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full border border-white/20 bg-black/35 hover:bg-black/60 text-white backdrop-blur-md transition-all flex items-center justify-center shadow-lg cursor-pointer"
                  aria-label={isVi ? 'Ảnh tiếp' : 'Next'}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* BOTTOM INFO OVERLAY ON HERO IMAGE */}
            <div className="relative z-20 p-5 md:p-7 text-white">
              <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-300 drop-shadow-sm">
                {location.label}
              </div>

              <h2 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight drop-shadow-md">
                {fullName}
              </h2>

              <div className="mt-2 flex items-center gap-1.5 text-xs sm:text-sm text-white/90">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{neighborhood}</span>
              </div>

              {/* Quick stats pills */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                {distToTL !== null && distToTL > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                    <span>📍</span>
                    <span>{distToTL} km {isVi ? 'từ THPT Thăng Long' : 'from school'}</span>
                  </span>
                )}

                {timesToTL && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                    <Clock className="w-3 h-3 text-amber-300" />
                    <span>~{timesToTL.motoMinutes} {isVi ? 'phút xe máy' : 'min moto'}</span>
                  </span>
                )}

                {/* Photo indicator dots */}
                {images.length > 1 && (
                  <div className="ml-auto flex items-center gap-1.5">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          idx === activeImageIndex ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/50 hover:bg-white'
                        }`}
                        title={isVi ? `Ảnh ${idx + 1}` : `Photo ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Photo Editor Drawer Modal */}
            {showImageEditor && (
              <div className="absolute inset-0 z-30 bg-slate-950/92 backdrop-blur-md p-5 flex flex-col justify-between text-white animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      {isVi ? `Đổi ảnh cho ${location.label}` : `Update Photo for ${location.label}`}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowImageEditor(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-md cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 py-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      {isVi ? 'Dán đường dẫn ảnh (URL trực tiếp):' : 'Paste direct image URL:'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={customImageUrl}
                        onChange={e => setCustomImageUrl(e.target.value)}
                        placeholder="https://upload.wikimedia.org/..."
                        className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                      />
                      <button
                        onClick={() => handleApplyCustomUrl(customImageUrl)}
                        disabled={!customImageUrl.trim()}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                      >
                        {isVi ? 'Áp dụng' : 'Apply'}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-xs text-slate-300">
                      {isVi ? 'Hoặc chọn ảnh từ máy tính/thiết bị:' : 'Or upload image file:'}
                    </span>
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all shadow-xs">
                      <Upload className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isVi ? 'Tải tệp ảnh lên' : 'Upload file'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-2 text-right">
                  <button
                    type="button"
                    onClick={() => setShowImageEditor(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    {isVi ? 'Đóng trình đổi ảnh' : 'Close'}
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* ================= RIGHT COLUMN: Spacious Details & Actions ================= */}
          <div className="flex max-h-[94vh] flex-col overflow-hidden bg-[#f8f3eb]">
            
            {/* Top Navigation Tabs */}
            <div className="px-5 pt-4 bg-[#f3ece0] border-b border-[#ded5c7] flex items-center gap-1.5 shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className={`py-2 px-3.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'info'
                    ? 'bg-[#f8f3eb] text-[#133654] border-t-2 border-t-[#133654] shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                📋 {isVi ? 'Thông tin & Giới thiệu' : 'Overview & Info'}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('map')}
                className={`py-2 px-3.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'map'
                    ? 'bg-[#f8f3eb] text-[#133654] border-t-2 border-t-[#133654] shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>{isVi ? 'Bản đồ vị trí' : 'Location Map'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('distances')}
                className={`py-2 px-3.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'distances'
                    ? 'bg-[#f8f3eb] text-[#133654] border-t-2 border-t-[#133654] shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                <Ruler className="w-3.5 h-3.5 text-amber-700" />
                <span>{isVi ? 'Cự ly 13 điểm' : '13 Stop Distances'}</span>
              </button>
            </div>

            {/* Scrollable Main Content Panel */}
            <div className="flex-1 overflow-y-auto px-5 py-5 md:px-7 md:py-6 space-y-4">
              
              {/* TAB 1: OVERVIEW & HIGHLIGHTS */}
              {activeTab === 'info' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  
                  {/* Location Snapshot / Tóm tắt địa danh */}
                  <div className="rounded-[24px] border border-[#ded5c7] bg-white/95 p-4 sm:p-5 shadow-xs">
                    <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
                      {isVi ? 'Tóm tắt địa danh' : 'Location Snapshot'}
                    </div>
                    <p className="mt-2.5 text-sm sm:text-[15px] leading-relaxed text-slate-700 text-justify">
                      {description}
                    </p>
                  </div>

                  {/* 2-Grid: Best For & Suggested Duration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {bestFor && (
                      <div className="rounded-[22px] border border-[#eadfce] bg-[#fffaf2] p-4">
                        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-amber-700" />
                          <span>{isVi ? 'Phù hợp cho' : 'Best for'}</span>
                        </div>
                        <div className="mt-2 text-xs sm:text-sm font-bold leading-snug text-slate-800">
                          {bestFor}
                        </div>
                      </div>
                    )}

                    <div className="rounded-[22px] border border-[#eadfce] bg-[#fffaf2] p-4">
                      <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-700" />
                        <span>{isVi ? 'Thời lượng gợi ý' : 'Suggested duration'}</span>
                      </div>
                      <div className="mt-2 text-xs sm:text-sm font-bold leading-snug text-slate-800">
                        {isSchool ? '15 - 30 phút' : '45 - 90 phút'}
                      </div>
                    </div>
                  </div>

                  {/* Highlights / Điểm nổi bật */}
                  {highlights.length > 0 && (
                    <div className="rounded-[24px] border border-[#ded5c7] bg-white/95 p-4 sm:p-5 shadow-xs">
                      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#d7a15e]" />
                        <span>{isVi ? 'Điểm nổi bật không thể bỏ lỡ' : 'Key Highlights'}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {highlights.map((h, i) => (
                          <span 
                            key={i} 
                            className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/90 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            <span>{h}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Travel Times & Distances from Thang Long School */}
                  {!isSchool && timesToTL && (
                    <div className="rounded-[24px] border border-[#ded5c7] bg-white/95 p-4 sm:p-5 shadow-xs">
                      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-[#133654]" />
                          <span>{isVi ? 'Cự ly & Thời gian di chuyển từ THPT Thăng Long' : 'Travel from Thang Long High School'}</span>
                        </span>
                        <span className="font-black text-[#133654] text-xs">
                          {distToTL} km
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="p-2.5 rounded-xl bg-[#fbf8f3] border border-[#e8ded0] text-center">
                          <Footprints className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                          <div className="text-[10px] text-slate-500 font-semibold">{isVi ? 'Đi bộ' : 'Walk'}</div>
                          <div className="text-xs font-black text-slate-900 mt-0.5">{timesToTL.walkMinutes} {isVi ? 'phút' : 'min'}</div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#fbf8f3] border border-[#e8ded0] text-center">
                          <Bike className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                          <div className="text-[10px] text-slate-500 font-semibold">{isVi ? 'Xe đạp' : 'Bicycle'}</div>
                          <div className="text-xs font-black text-slate-900 mt-0.5">{timesToTL.bikeMinutes} {isVi ? 'phút' : 'min'}</div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#fbf8f3] border border-[#e8ded0] text-center">
                          <Navigation className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                          <div className="text-[10px] text-slate-500 font-semibold">{isVi ? 'Xe máy' : 'Moto'}</div>
                          <div className="text-xs font-black text-slate-900 mt-0.5">{timesToTL.motoMinutes} {isVi ? 'phút' : 'min'}</div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#fbf8f3] border border-[#e8ded0] text-center">
                          <Car className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                          <div className="text-[10px] text-slate-500 font-semibold">{isVi ? 'Ô tô' : 'Car'}</div>
                          <div className="text-xs font-black text-slate-900 mt-0.5">{timesToTL.carMinutes} {isVi ? 'phút' : 'min'}</div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 2: DEDICATED FULL MAP VIEW */}
              {activeTab === 'map' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-600" />
                        <span>{isVi ? `Bản đồ vị trí: ${fullName}` : `Location Map: ${fullName}`}</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {isVi 
                          ? 'Bản đồ tương tác chi tiết, hiển thị tọa độ thực tế và liên kết chỉ đường.' 
                          : 'Interactive map preview with real coordinates.'}
                      </p>
                    </div>

                    {location.googleMapsUrl && (
                      <a
                        href={location.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Google Maps</span>
                      </a>
                    )}
                  </div>

                  <div className="rounded-2xl overflow-hidden border border-[#ded5c7] shadow-sm">
                    <MiniLocationMap
                      location={location}
                      allLocations={allLocations}
                      routes={routes}
                      language={language}
                      height="380px"
                      onFocusMainMap={id => {
                        if (onFocusMainMap) onFocusMainMap(id);
                        handleClose();
                      }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: PROXIMITY TO ALL 13 DESTINATIONS */}
              {activeTab === 'distances' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-[#133654]" />
                      <span>
                        {isVi ? `Khoảng cách từ ${location.label} tới các điểm khác:` : `Distances from ${location.label}:`}
                      </span>
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {isVi ? 'Xếp từ gần nhất' : 'Sorted by distance'}
                    </span>
                  </div>

                  <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
                    {allDistances.map((item, idx) => {
                      const isTL = item.location.id === 'TL';

                      return (
                        <div
                          key={item.location.id}
                          className="pt-2 flex items-center justify-between text-xs hover:bg-white p-2.5 rounded-xl transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                              isTL ? 'bg-[#133654] text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {idx + 1}
                            </span>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1">
                                {isVi ? item.location.fullName : (item.location.fullNameEn || item.location.fullName)}
                                {isTL && <span className="text-[10px] bg-amber-100 text-amber-800 px-1 rounded font-bold">Trường</span>}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {item.location.category} • ~{item.times.motoMinutes} {isVi ? 'phút xe máy' : 'min'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <span className="font-black text-sm text-[#133654] bg-[#fbf8f3] px-2.5 py-1 rounded-lg border border-[#ded5c7]">
                              {item.distanceKm} km
                            </span>

                            <button
                              onClick={() => {
                                onSetStart(location.id);
                                onSetEnd(item.location.id);
                                handleClose();
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#133654] hover:bg-[#0f2e48] text-white text-[10px] font-bold shadow-2xs cursor-pointer"
                            >
                              {isVi ? 'Lập tuyến' : 'Route'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* ================= RIGHT COLUMN FOOTER: Actions Bar ================= */}
            <div className="border-t border-[#ded5c7] bg-white/95 px-5 py-4 md:px-7 shrink-0 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                
                {/* Left Action Buttons: Google Maps link & Tab Switch */}
                <div className="flex flex-wrap items-center gap-2">
                  {location.googleMapsUrl && (
                    <a
                      href={location.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                      <span>Google Maps</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveTab(prev => prev === 'map' ? 'info' : 'map')}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                      activeTab === 'map'
                        ? 'bg-[#133654] text-white'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    <span>{activeTab === 'map' ? (isVi ? 'Xem thông tin' : 'View Info') : (isVi ? 'Xem bản đồ' : 'View Map')}</span>
                  </button>
                </div>

                {/* Right Action Buttons: Itinerary Toggle & Start/End */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSetStart(location.id);
                      handleClose();
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3 py-2 text-xs font-bold transition-colors cursor-pointer"
                    title={isVi ? 'Đặt địa điểm này làm điểm bắt đầu' : 'Set as start'}
                  >
                    <Navigation className="w-3 h-3 text-emerald-600" />
                    <span>{isVi ? 'Điểm đi' : 'Start'}</span>
                  </button>

                  {!isSchool && (
                    <button
                      type="button"
                      onClick={() => {
                        onSetEnd(location.id);
                        handleClose();
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 px-3 py-2 text-xs font-bold transition-colors cursor-pointer"
                      title={isVi ? 'Đặt địa điểm này làm điểm kết thúc' : 'Set as end'}
                    >
                      <MapPin className="w-3 h-3 text-rose-600" />
                      <span>{isVi ? 'Điểm đến' : 'End'}</span>
                    </button>
                  )}

                  {onToggleItinerary && (
                    <button
                      type="button"
                      onClick={() => onToggleItinerary(location.id)}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-black transition-all cursor-pointer shadow-xs ${
                        isSelectedInItinerary
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-[#133654] hover:bg-[#0b2236] text-white'
                      }`}
                    >
                      {isSelectedInItinerary ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>{isVi ? 'Bỏ khỏi hành trình' : 'Remove from trip'}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 text-amber-300" />
                          <span>{isVi ? 'Thêm vào hành trình' : 'Add to trip'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
