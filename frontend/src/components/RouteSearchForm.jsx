import React, { useState } from 'react';
import { MapPin, Flag, Navigation, CheckCircle2 } from 'lucide-react';

export default function RouteSearchForm() {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fromLocation.trim() && !toLocation.trim()) {
      setFeedback('Please enter your starting location and destination.');
      setTimeout(() => setFeedback(''), 4000);
      return;
    }
    setFeedback(`Searching best EV route from "${fromLocation || 'Current Location'}" to "${toLocation || 'Destination'}"...`);
    setTimeout(() => setFeedback(''), 4000);
  };

  return (
    <div className="w-full max-w-3xl relative">
      <form 
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-2.5 sm:p-3 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.08)] border border-slate-100 flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3 transition-shadow hover:shadow-[0_16px_40px_-6px_rgba(0,0,0,0.12)]"
      >
        {/* From Input */}
        <div className="flex-[1.1] flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-50/70 border border-transparent focus-within:border-emerald-500/30 focus-within:bg-white transition-all">
          <div className="text-[#0a8754] flex-shrink-0">
            <MapPin className="w-5 h-5 fill-[#0a8754]/15 stroke-[#0a8754] stroke-[2.2]" />
          </div>
          <div className="flex-1 min-w-0">
            <label htmlFor="from-location" className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider leading-none mb-1">
              From
            </label>
            <input
              id="from-location"
              type="text"
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
              placeholder="Enter your starting location"
              className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 font-medium focus:outline-none"
            />
          </div>
        </div>

        {/* To Input */}
        <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-50/70 border border-transparent focus-within:border-emerald-500/30 focus-within:bg-white transition-all">
          <div className="text-[#0a8754] flex-shrink-0">
            <Flag className="w-5 h-5 fill-[#0a8754]/15 stroke-[#0a8754] stroke-[2.2]" />
          </div>
          <div className="flex-1 min-w-0">
            <label htmlFor="to-location" className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider leading-none mb-1">
              To
            </label>
            <input
              id="to-location"
              type="text"
              value={toLocation}
              onChange={(e) => setToLocation(e.target.value)}
              placeholder="Enter your destination"
              className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 font-medium focus:outline-none"
            />
          </div>
        </div>

        {/* Primary CTA Button */}
        <button
          type="submit"
          className="flex-shrink-0 bg-[#0a8754] hover:bg-[#087346] active:scale-[0.98] text-white font-medium text-sm px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
        >
          <Navigation className="w-4 h-4 fill-white rotate-45" />
          <span>Find Best Route</span>
        </button>
      </form>

      {/* Visual Feedback Toast */}
      {feedback && (
        <div className="absolute -bottom-10 left-4 right-4 md:left-2 md:right-auto bg-slate-900 text-white text-xs py-2 px-4 rounded-xl shadow-lg flex items-center gap-2 animate-fadeIn z-20">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="truncate">{feedback}</span>
        </div>
      )}
    </div>
  );
}
