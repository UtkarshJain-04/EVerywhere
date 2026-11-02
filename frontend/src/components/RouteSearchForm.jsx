import React, { useState } from 'react';
import {
  MapPin,
  Flag,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Crosshair,
  Sliders,
  ChevronDown,
  ChevronUp,
  Loader2,
  Zap,
} from 'lucide-react';

export default function RouteSearchForm({
  onSearchRoute,
  loading = false,
  initialFrom = '',
  initialTo = '',
}) {
  const [fromLocation, setFromLocation] = useState(initialFrom);
  const [toLocation, setToLocation] = useState(initialTo);
  const [battery, setBattery] = useState(50);
  const [minSpeed, setMinSpeed] = useState(0);
  const [showPreferences, setShowPreferences] = useState(false);
  const [locating, setLocating] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: 'info' });

  const showToast = (text, type = 'info') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback({ text: '', type: 'info' }), 4500);
  };

  // Browser Geolocation integration
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'error');
      return;
    }

    setLocating(true);
    showToast('Locating your current GPS coordinates...', 'info');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        const { latitude, longitude } = position.coords;
        const coordString = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        setFromLocation(coordString);
        showToast(`Located current position: ${coordString}`, 'success');
      },
      (error) => {
        setLocating(false);
        let msg = 'Unable to retrieve location.';
        if (error.code === 1) {
          msg = 'Location permission denied. Please enter your location manually.';
        } else if (error.code === 2) {
          msg = 'Location position unavailable. Please enter your location manually.';
        } else if (error.code === 3) {
          msg = 'Location request timed out.';
        }
        showToast(msg, 'error');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!fromLocation.trim() || !toLocation.trim()) {
      showToast('Please enter both a starting location and a destination.', 'error');
      return;
    }

    if (onSearchRoute) {
      onSearchRoute({
        from: fromLocation.trim(),
        to: toLocation.trim(),
        battery: Number(battery),
        minSpeed: Number(minSpeed),
      });
    }
  };

  const applyPreset = (from, to) => {
    setFromLocation(from);
    setToLocation(to);
    if (onSearchRoute) {
      onSearchRoute({
        from,
        to,
        battery: Number(battery),
        minSpeed: Number(minSpeed),
      });
    }
  };

  return (
    <div className="w-full max-w-3xl relative">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-2.5 sm:p-3 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.08)] border border-slate-100 flex flex-col gap-2.5 transition-shadow hover:shadow-[0_16px_40px_-6px_rgba(0,0,0,0.12)]"
      >
        {/* Main Inputs Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3">
          
          {/* From Input with GPS Button */}
          <div className="flex-[1.1] flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-50/70 border border-transparent focus-within:border-emerald-500/30 focus-within:bg-white transition-all">
            <div className="text-[#0a8754] flex-shrink-0">
              <MapPin className="w-5 h-5 fill-[#0a8754]/15 stroke-[#0a8754] stroke-[2.2]" />
            </div>
            <div className="flex-1 min-w-0">
              <label
                htmlFor="from-location"
                className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider leading-none mb-1"
              >
                From
              </label>
              <input
                id="from-location"
                type="text"
                value={fromLocation}
                disabled={loading}
                onChange={(e) => setFromLocation(e.target.value)}
                placeholder="Starting location or coordinates"
                className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 font-medium focus:outline-none"
              />
            </div>
            {/* GPS Locate Button */}
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={locating || loading}
              title="Use current GPS location"
              className="p-1.5 rounded-xl hover:bg-emerald-100/70 text-[#0a8754] hover:text-[#087346] transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              {locating ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#0a8754]" />
              ) : (
                <Crosshair className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* To Input */}
          <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-50/70 border border-transparent focus-within:border-emerald-500/30 focus-within:bg-white transition-all">
            <div className="text-[#0a8754] flex-shrink-0">
              <Flag className="w-5 h-5 fill-[#0a8754]/15 stroke-[#0a8754] stroke-[2.2]" />
            </div>
            <div className="flex-1 min-w-0">
              <label
                htmlFor="to-location"
                className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider leading-none mb-1"
              >
                To
              </label>
              <input
                id="to-location"
                type="text"
                value={toLocation}
                disabled={loading}
                onChange={(e) => setToLocation(e.target.value)}
                placeholder="Enter destination"
                className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 font-medium focus:outline-none"
              />
            </div>
          </div>

          {/* Primary CTA Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex-shrink-0 bg-[#0a8754] hover:bg-[#087346] active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium text-sm px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Finding Route...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 fill-white rotate-45" />
                <span>Find Best Route</span>
              </>
            )}
          </button>
        </div>

        {/* Expandable EV Preferences Row */}
        <div className="px-2 pt-1 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-slate-500">
            <span className="text-[11px] font-medium text-slate-400">Quick routes:</span>
            {[
              { label: 'CP → Hauz Khas', from: 'Connaught Place', to: 'Hauz Khas' },
              { label: 'Dwarka → GK', from: 'Dwarka', to: 'Greater Kailash' },
              { label: 'Okhla → Pitampura', from: 'Okhla', to: 'Pitampura' },
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p.from, p.to)}
                disabled={loading}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-[#0a8754] text-[11px] font-semibold text-slate-600 transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Toggle Preferences Accordion */}
          <button
            type="button"
            onClick={() => setShowPreferences(!showPreferences)}
            className="flex items-center gap-1 text-[11px] font-bold text-[#0a8754] hover:text-[#087346] cursor-pointer ml-auto"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>EV Preferences {showPreferences ? '(Hide)' : '(Battery & Speed)'}</span>
            {showPreferences ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Expanded Preferences Panel */}
        {showPreferences && (
          <div className="mt-1 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs animate-fadeIn">
            {/* Battery Level */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">Starting Battery: {battery}%</label>
                <span className="text-[10px] text-slate-400">Default: 50%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={battery}
                onChange={(e) => setBattery(Number(e.target.value))}
                className="w-full accent-[#0a8754] cursor-pointer"
              />
            </div>

            {/* Minimum Charger Speed */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">
                  Min Speed: {minSpeed > 0 ? `${minSpeed} kW` : 'Any speed'}
                </label>
                <span className="text-[10px] text-slate-400">Python Filter</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: 'Any', value: 0 },
                  { label: '≥ 15 kW', value: 15 },
                  { label: '≥ 25 kW', value: 25 },
                  { label: '30 kW', value: 30 },
                ].map((b) => (
                  <button
                    key={b.value}
                    type="button"
                    onClick={() => setMinSpeed(b.value)}
                    className={`py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                      minSpeed === b.value
                        ? 'bg-[#0a8754] text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Visual Feedback Toast */}
      {feedback.text && (
        <div
          className={`absolute -bottom-11 left-4 right-4 md:left-2 md:right-auto text-xs py-2 px-4 rounded-xl shadow-lg flex items-center gap-2 animate-fadeIn z-20 ${
            feedback.type === 'error'
              ? 'bg-red-900 text-white'
              : feedback.type === 'success'
              ? 'bg-emerald-900 text-white'
              : 'bg-slate-900 text-white'
          }`}
        >
          {feedback.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          )}
          <span className="truncate">{feedback.text}</span>
        </div>
      )}
    </div>
  );
}
