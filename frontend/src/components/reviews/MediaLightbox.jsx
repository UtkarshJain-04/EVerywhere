import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, User, Star, ShieldCheck, Play } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export default function MediaLightbox({
  mediaList = [],
  currentIndex = 0,
  onClose,
  onNext,
  onPrev,
}) {
  const currentItem = mediaList[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && mediaList.length > 1) onNext();
      if (e.key === 'ArrowLeft' && mediaList.length > 1) onPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev, mediaList.length]);

  if (!currentItem) return null;

  const getMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const isVideo = currentItem.type === 'video' || (currentItem.mimeType && currentItem.mimeType.startsWith('video/'));

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/95 backdrop-blur-md transition-opacity duration-200"
      onClick={onClose}
    >
      {/* Top Bar with Media Counter & Close Button */}
      <div
        className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between text-white z-10 bg-gradient-to-b from-black/80 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs sm:text-sm font-bold bg-white/10 px-3 py-1 rounded-full border border-white/20">
            {currentIndex + 1} of {mediaList.length}
          </span>
          {currentItem.uploaderName && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300">
              <span className="font-semibold text-white">{currentItem.uploaderName}</span>
              {currentItem.isVerifiedVisit && (
                <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified Visit</span>
                </span>
              )}
              {currentItem.userRating > 0 && (
                <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{currentItem.userRating}★</span>
                </span>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Media Content Area */}
      <div
        className="relative max-w-5xl max-h-[82vh] w-full px-4 flex items-center justify-center select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {isVideo ? (
          <video
            src={getMediaUrl(currentItem.url)}
            controls
            autoPlay
            className="max-h-[78vh] max-w-full rounded-2xl shadow-2xl border border-white/10 object-contain bg-black"
          />
        ) : (
          <img
            src={getMediaUrl(currentItem.url)}
            alt={currentItem.originalName || 'Station Media'}
            className="max-h-[78vh] max-w-full rounded-2xl shadow-2xl border border-white/10 object-contain"
          />
        )}
      </div>

      {/* Navigation Arrows */}
      {mediaList.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/30 text-white transition-all cursor-pointer backdrop-blur-sm"
            title="Previous (Left Arrow)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/30 text-white transition-all cursor-pointer backdrop-blur-sm"
            title="Next (Right Arrow)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
    </div>
  );
}

