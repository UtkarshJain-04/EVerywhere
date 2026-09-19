import React from 'react';
import { ArrowLeft, MoreVertical, Zap, MapPin, Compass, Clock, BatteryCharging, Wifi, Signal } from 'lucide-react';

export default function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[215px] sm:w-[225px] select-none pointer-events-none">
      {/* Phone Outer Chassis - Completely Static, No Hover or Movement */}
      <div className="relative rounded-[36px] bg-slate-950 p-2 shadow-[0_20px_45px_-12px_rgba(0,0,0,0.3)] border-[3.5px] border-slate-800 ring-1 ring-black/40">
        
        {/* Dynamic Island / Speaker Pill */}
        <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-16 h-3 bg-slate-950 rounded-full z-30 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-slate-800 mr-1.5"></div>
          <div className="w-1 h-1 rounded-full bg-slate-900"></div>
        </div>

        {/* Screen Bezel / Container */}
        <div className="relative w-full h-[420px] sm:h-[435px] bg-slate-50 rounded-[28px] overflow-hidden flex flex-col justify-between border border-slate-200/40">
          
          {/* Status Bar */}
          <div className="relative z-20 pt-2 px-4 flex items-center justify-between text-[10px] font-semibold text-slate-800">
            <span>9:41</span>
            <div className="flex items-center gap-1 text-slate-700">
              <Signal className="w-2.5 h-2.5" />
              <Wifi className="w-2.5 h-2.5" />
              <div className="w-3.5 h-1.5 border border-slate-700 rounded-[1px] p-[0.5px] flex items-center">
                <div className="w-full h-full bg-slate-800 rounded-[0.5px]"></div>
              </div>
            </div>
          </div>

          {/* Phone In-App Header */}
          <div className="relative z-20 px-3 py-1.5 flex items-center justify-between border-b border-slate-200/70 bg-white/90 backdrop-blur-sm shadow-2xs">
            <div className="p-0.5 text-slate-700">
              <ArrowLeft className="w-3.5 h-3.5" />
            </div>
            <div className="text-center">
              <h3 className="text-[11px] font-bold text-slate-800 leading-none">Your Route</h3>
              <span className="text-[9px] font-medium text-[#0a8754]">Optimized for EV</span>
            </div>
            <div className="p-0.5 text-slate-700">
              <MoreVertical className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Interactive Map Canvas Mockup */}
          <div className="relative flex-1 bg-[#e4eef4] overflow-hidden">
            
            {/* Topographic / Coastline Background Shapes */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d4eaf7" />
                  <stop offset="100%" stopColor="#c3e0f2" />
                </linearGradient>
                <linearGradient id="landGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f4f9f4" />
                  <stop offset="100%" stopColor="#eaf3ea" />
                </linearGradient>
              </defs>

              {/* Water background */}
              <rect width="100%" height="100%" fill="url(#waterGrad)" />

              {/* Landmass contours */}
              <path
                d="M -20,-20 L 180,-20 Q 160,50 110,90 T 210,180 T 130,290 L 250,320 L 250,-20 Z"
                fill="url(#landGrad)"
                stroke="#c9dec9"
                strokeWidth="1.2"
              />
              <path
                d="M -20,190 Q 50,220 30,290 T -20,350 Z"
                fill="url(#landGrad)"
                stroke="#c9dec9"
                strokeWidth="1"
              />

              {/* Secondary Road Grid Lines */}
              <path d="M 25,10 Q 95,50 150,110" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.8" />
              <path d="M 135,70 Q 175,120 160,190" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeOpacity="0.7" />
              <path d="M 70,160 Q 120,210 170,255" fill="none" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.75" />

              {/* Primary Blue Route Polyline */}
              <path
                d="M 40,35 C 70,45 85,95 125,110 C 160,125 125,185 160,215"
                fill="none"
                stroke="#2563eb"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_2px_4px_rgba(37,99,235,0.4)]"
              />
            </svg>

            {/* Charging Station Markers along route */}
            {/* Station 1 */}
            <div className="absolute top-[26px] left-[32px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-5 h-5 rounded-full bg-[#0a8754] flex items-center justify-center text-white shadow-sm ring-1.5 ring-white">
                <Zap className="w-3 h-3 fill-white" />
              </div>
            </div>

            {/* Station 2 */}
            <div className="absolute top-[108px] left-[124px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-5 h-5 rounded-full bg-[#0a8754] flex items-center justify-center text-white shadow-sm ring-1.5 ring-white">
                <Zap className="w-3 h-3 fill-white" />
              </div>
            </div>

            {/* Station 3 (Off route) */}
            <div className="absolute top-[72px] left-[170px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-[#0a8754] flex items-center justify-center text-white shadow-sm ring-1.5 ring-white opacity-90">
                <Zap className="w-2.5 h-2.5 fill-white" />
              </div>
            </div>

            {/* Station 4 */}
            <div className="absolute top-[168px] left-[138px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-5 h-5 rounded-full bg-[#0a8754] flex items-center justify-center text-white shadow-sm ring-1.5 ring-white">
                <Zap className="w-3 h-3 fill-white" />
              </div>
            </div>

            {/* Destination Marker (Red pin) - Static, No animation */}
            <div className="absolute top-[215px] left-[160px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-sm ring-1.5 ring-white">
                <MapPin className="w-3 h-3 fill-white stroke-rose-500" />
              </div>
            </div>
          </div>

          {/* Bottom Details Floating Card */}
          <div className="relative z-20 m-2 p-2.5 bg-white rounded-xl shadow-[0_4px_12px_-2px_rgba(0,0,0,0.1)] border border-slate-100 space-y-1.5">
            
            {/* Stat Row: Distance */}
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1 text-slate-500">
                <Compass className="w-3 h-3 text-slate-400" />
                <span>Distance</span>
              </div>
              <span className="font-bold text-slate-800">142 km</span>
            </div>

            {/* Stat Row: Estimated Time */}
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1 text-slate-500">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Estimated Time</span>
              </div>
              <span className="font-bold text-slate-800">2 h 48 min</span>
            </div>

            {/* Stat Row: Charging Stops */}
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1 text-slate-500">
                <BatteryCharging className="w-3 h-3 text-[#0a8754]" />
                <span>Charging Stops</span>
              </div>
              <span className="font-bold text-slate-800">2 stops</span>
            </div>

            {/* View Details Button */}
            <div className="w-full py-1.5 bg-[#0a8754] text-white text-[10px] font-semibold rounded-lg text-center shadow-xs">
              View Details
            </div>
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="pb-1 flex justify-center">
            <div className="w-20 h-0.5 bg-slate-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
