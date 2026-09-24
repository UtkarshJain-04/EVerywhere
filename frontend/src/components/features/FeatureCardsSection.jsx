import React from 'react';
import { 
  Route as RouteIcon, 
  Zap, 
  Clock, 
  Leaf, 
  Layers, 
  Smartphone, 
  CheckCircle2, 
  ChevronRight, 
  MapPin, 
  Star,
  Coffee,
  Fuel
} from 'lucide-react';
import cardScenicRoad from '../../assets/features_scenic_road.jpg';
import stationThumb from '../../assets/features_station_thumb.jpg';

export default function FeatureCardsSection() {
  return (
    <section className="w-full bg-[#fcfdfd] py-16 sm:py-20 lg:py-24">
      <div className="max-w-[1520px] 2xl:max-w-[1640px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-16">
        
        {/* 6 Feature Cards in a 3-Column x 2-Row Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-9">
          
          {/* ================= CARD 1: SMART ROUTE PLANNING ================= */}
          <div className="bg-white rounded-[32px] p-7 sm:p-8 xl:p-9 border border-slate-100/90 shadow-[0_4px_30px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between">
            <div>
              {/* Header Icon */}
              <div className="w-13 h-13 rounded-2xl bg-[#eaf7f0] flex items-center justify-center text-[#0a8754] mb-5">
                <RouteIcon className="w-6 h-6 stroke-[2.2]" />
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl xl:text-[26px] font-bold text-[#0d233a] tracking-tight">
                Smart Route Planning
              </h3>
              <p className="text-sm xl:text-[14.5px] text-slate-500 leading-relaxed mt-2.5 mb-6">
                Find the best route with real-time traffic, distance, travel time and charging station stops.
              </p>
            </div>

            {/* Content Split: Left Checklist + Right Vertical Phone Mockup */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 mt-2">
              {/* Checklist */}
              <div className="space-y-3.5 flex-1 w-full sm:w-auto">
                {[
                  'Optimized route suggestions',
                  'Travel time & distance',
                  'Lower energy consumption'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-[13.5px] font-medium text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-[#0a8754] fill-emerald-100/60 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Phone Mockup on Right */}
              <div className="w-[165px] xl:w-[175px] shrink-0 rounded-[28px] bg-slate-900 p-2 shadow-xl border-2 border-slate-800 select-none">
                {/* Speaker Notch */}
                <div className="w-12 h-2 bg-slate-950 rounded-full mx-auto mb-1.5"></div>

                {/* Phone Screen Canvas */}
                <div className="relative w-full h-[245px] bg-[#eef5f8] rounded-[20px] overflow-hidden flex flex-col justify-between border border-slate-200/50">
                  {/* Topographic Background Map */}
                  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <rect width="100%" height="100%" fill="#dff0fa" />
                    <path d="M 0,0 L 175,0 L 175,245 L 90,245 Q 60,180 110,130 T 30,50 L 0,30 Z" fill="#ebf5ec" />
                    <path d="M 10,25 Q 90,65 160,110" fill="none" stroke="#ffffff" strokeWidth="2.5" />
                    <path d="M 40,120 Q 100,150 160,225" fill="none" stroke="#ffffff" strokeWidth="2.5" />
                    {/* Primary Green Route Line */}
                    <path 
                      d="M 50,35 C 65,75 110,85 90,135 C 70,175 125,185 130,225" 
                      fill="none" 
                      stroke="#0a8754" 
                      strokeWidth="3.5" 
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  {/* Charging Station Pins along Route */}
                  <div className="absolute top-9 left-[75px] w-5 h-5 rounded-full bg-[#0a8754] text-white flex items-center justify-center shadow-md ring-1.5 ring-white">
                    <Zap className="w-2.5 h-2.5 fill-white" />
                  </div>
                  <div className="absolute top-[90px] left-[92px] w-5 h-5 rounded-full bg-[#0a8754] text-white flex items-center justify-center shadow-md ring-1.5 ring-white">
                    <Zap className="w-2.5 h-2.5 fill-white" />
                  </div>
                  <div className="absolute top-[145px] left-[62px] w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md ring-1.5 ring-white">
                    <MapPin className="w-2.5 h-2.5 fill-white stroke-blue-500" />
                  </div>

                  <div className="flex-1"></div>

                  {/* Bottom Float Card inside Phone */}
                  <div className="relative z-10 m-2 p-2 bg-white/95 backdrop-blur-xs rounded-xl shadow-md border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-800">Best Route</div>
                    <div className="text-[9px] font-medium text-slate-500">2 h 45 min · 120 km</div>
                    <button 
                      type="button"
                      className="mt-1.5 w-full py-1 bg-[#0a8754] text-white text-[9.5px] font-semibold rounded-md shadow-2xs"
                    >
                      View Route
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* ================= CARD 2: NEARBY CHARGING STATIONS ================= */}
          <div className="bg-white rounded-[32px] p-7 sm:p-8 xl:p-9 border border-slate-100/90 shadow-[0_4px_30px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between">
            <div>
              {/* Header Icon */}
              <div className="w-13 h-13 rounded-2xl bg-[#eaf7f0] flex items-center justify-center text-[#0a8754] mb-5">
                <Fuel className="w-6 h-6 stroke-[2.2]" />
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl xl:text-[26px] font-bold text-[#0d233a] tracking-tight">
                Nearby Charging Stations
              </h3>
              <p className="text-sm xl:text-[14.5px] text-slate-500 leading-relaxed mt-2.5 mb-6">
                Discover available charging stations along your route with real-time availability and approximate waiting time.
              </p>

              {/* Checklist */}
              <div className="space-y-3.5 mb-8">
                {[
                  'Live station status',
                  'Charger types & speed',
                  'Approximate waiting time'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-[13.5px] font-medium text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-[#0a8754] fill-emerald-100/60 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Visual: Floating Pin + GreenVolt Station Card */}
            <div className="relative pt-4">
              {/* Floating Map Pin on Top Right */}
              <div className="flex justify-end pr-8 -mb-4 relative z-10">
                <div className="w-10 h-10 rounded-full bg-[#0a8754] flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 ring-4 ring-emerald-50">
                  <MapPin className="w-4.5 h-4.5 fill-white stroke-[#0a8754]" />
                </div>
              </div>

              {/* Station Card */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_6px_30px_-5px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  {/* Left Circle Bolt */}
                  <div className="w-11 h-11 rounded-full bg-[#0a8754] flex items-center justify-center text-white shadow-sm shrink-0">
                    <Zap className="w-5 h-5 fill-white" />
                  </div>

                  {/* Station Info */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                        GreenVolt Charging Station
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#eaf7f0] text-[#0a8754] border border-emerald-200/50">
                        Available
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span>📍 2.4 km</span>
                      <span>·</span>
                      <span>8 min</span>
                    </div>

                    <div className="text-xs text-slate-500">
                      DC Fast Charger (50 kW)
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 pt-0.5">
                      <Clock className="w-3.5 h-3.5 text-[#0a8754]" />
                      <span>~ 12 min waiting</span>
                    </div>
                  </div>
                </div>

                <div className="text-slate-300 pr-1">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>


          {/* ================= CARD 3: ESTIMATED WAITING TIME ================= */}
          <div className="bg-white rounded-[32px] p-7 sm:p-8 xl:p-9 border border-slate-100/90 shadow-[0_4px_30px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
            <div>
              {/* Header Icon */}
              <div className="w-13 h-13 rounded-2xl bg-[#eaf7f0] flex items-center justify-center text-[#0a8754] mb-5">
                <Clock className="w-6 h-6 stroke-[2.2]" />
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl xl:text-[26px] font-bold text-[#0d233a] tracking-tight">
                Estimated Waiting Time
              </h3>
              <p className="text-sm xl:text-[14.5px] text-slate-500 leading-relaxed mt-2.5 mb-6">
                Get the approximate waiting time for charging stations so you can plan better and save time.
              </p>

              {/* Checklist */}
              <div className="space-y-3.5 mb-8">
                {[
                  'Real-time availability',
                  'Waiting time at stations',
                  'Plan ahead, avoid delays'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-[13.5px] font-medium text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-[#0a8754] fill-emerald-100/60 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Visual: Prominent Waiting Time Card with Decorative Leaf */}
            <div className="relative pt-4">
              {/* Decorative Mint Leaf in Background */}
              <div className="absolute right-0 bottom-1 pointer-events-none opacity-20">
                <svg width="105" height="105" viewBox="0 0 100 100" fill="none">
                  <path d="M10,80 Q50,90 80,50 T70,10 Q20,30 10,80 Z" fill="#0a8754" />
                </svg>
              </div>

              {/* Waiting Time Card */}
              <div className="relative z-10 bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-[0_6px_30px_-5px_rgba(0,0,0,0.08)] flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-13 h-13 rounded-full bg-[#eaf7f0] flex items-center justify-center text-[#0a8754] shrink-0">
                    <Clock className="w-7 h-7 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500">
                      Approx. Waiting Time
                    </div>
                    <div className="text-3xl sm:text-[34px] font-extrabold text-[#0d233a] leading-none mt-1">
                      12 min
                    </div>
                  </div>
                </div>

                <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#eaf7f0] text-[#0a8754] border border-emerald-200/60">
                  Available
                </span>
              </div>
            </div>
          </div>


          {/* ================= CARD 4: CLEAN & SAFE ROUTES ================= */}
          <div className="bg-white rounded-[32px] p-7 sm:p-8 xl:p-9 border border-slate-100/90 shadow-[0_4px_30px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between">
            <div>
              {/* Header Icon */}
              <div className="w-13 h-13 rounded-2xl bg-[#eaf7f0] flex items-center justify-center text-[#0a8754] mb-5">
                <Leaf className="w-6 h-6 stroke-[2.2]" />
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl xl:text-[26px] font-bold text-[#0d233a] tracking-tight">
                Clean & Safe Routes
              </h3>
              <p className="text-sm xl:text-[14.5px] text-slate-500 leading-relaxed mt-2.5 mb-6">
                Get routes with lower battery-health reduction, less slope and smoother roads for a safer and more efficient trip.
              </p>

              {/* Checklist */}
              <div className="space-y-3.5 mb-8">
                {[
                  'Lower battery drain',
                  'Avoids steep slopes',
                  'Clean & well-maintained roads'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-[13.5px] font-medium text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-[#0a8754] fill-emerald-100/60 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Visual: Large Scenic Road Landscape Photo */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden h-44 sm:h-48 w-full shadow-inner border border-slate-100">
                <img 
                  src={cardScenicRoad} 
                  alt="Scenic coastal highway with clean and safe roads" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent"></div>
              </div>

              {/* Floating Leaf Icon on Top Right */}
              <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-[#0a8754] flex items-center justify-center text-white shadow-md ring-3 ring-white">
                <Leaf className="w-5 h-5 fill-white" />
              </div>
            </div>
          </div>


          {/* ================= CARD 5: DETAILED STATION INFORMATION ================= */}
          <div className="bg-white rounded-[32px] p-7 sm:p-8 xl:p-9 border border-slate-100/90 shadow-[0_4px_30px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between">
            <div>
              {/* Header Icon */}
              <div className="w-13 h-13 rounded-2xl bg-[#eaf7f0] flex items-center justify-center text-[#0a8754] mb-5">
                <Layers className="w-6 h-6 stroke-[2.2]" />
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl xl:text-[26px] font-bold text-[#0d233a] tracking-tight">
                Detailed Station Information
              </h3>
              <p className="text-sm xl:text-[14.5px] text-slate-500 leading-relaxed mt-2.5 mb-6">
                View complete details about each charging station including amenities, reviews and confidence level.
              </p>

              {/* Checklist */}
              <div className="space-y-3.5 mb-8">
                {[
                  'Charging rates & connectors',
                  'Reviews & ratings',
                  'Station confidence level'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-[13.5px] font-medium text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-[#0a8754] fill-emerald-100/60 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Visual: Detailed CityCharge Station Card */}
            <div>
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_6px_30px_-5px_rgba(0,0,0,0.08)] space-y-3.5">
                {/* Station Row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <img 
                      src={stationThumb} 
                      alt="CityCharge Station" 
                      className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0 shadow-2xs"
                    />
                    <div className="space-y-0.5">
                      <h4 className="text-sm sm:text-base font-bold text-slate-800">
                        CityCharge Station
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                        <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                          4.3
                        </span>
                        <span className="text-slate-400">(124 reviews)</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        📍 2.4 km · 8 min
                      </div>
                      <div className="pt-0.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0a8754] text-white">
                          High Confidence
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-slate-300 pr-1">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>

                {/* Bottom Connector Badges */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs font-medium text-slate-700">
                    <Zap className="w-3.5 h-3.5 text-[#0a8754]" />
                    CCS
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs font-medium text-slate-700">
                    <Zap className="w-3.5 h-3.5 text-[#0a8754]" />
                    Type 2
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs font-medium text-slate-700">
                    <Coffee className="w-3.5 h-3.5 text-slate-400" />
                    Amenities
                  </span>
                </div>
              </div>
            </div>
          </div>


          {/* ================= CARD 6: USER-FRIENDLY EXPERIENCE ================= */}
          <div className="bg-white rounded-[32px] p-7 sm:p-8 xl:p-9 border border-slate-100/90 shadow-[0_4px_30px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
            <div>
              {/* Header Icon */}
              <div className="w-13 h-13 rounded-2xl bg-[#eaf7f0] flex items-center justify-center text-[#0a8754] mb-5">
                <Smartphone className="w-6 h-6 stroke-[2.2]" />
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl xl:text-[26px] font-bold text-[#0d233a] tracking-tight">
                User-Friendly Experience
              </h3>
              <p className="text-sm xl:text-[14.5px] text-slate-500 leading-relaxed mt-2.5 mb-6">
                A clean, simple and intuitive interface designed for every EV driver.
              </p>
            </div>

            {/* Content Split: Left Checklist + Right Vertical Phone Mockup with floating leaves */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 mt-2 relative">
              {/* Checklist */}
              <div className="space-y-3.5 flex-1 w-full sm:w-auto">
                {[
                  'Easy sign up & login',
                  'Modern and clean UI',
                  'Personalised experience'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-[13.5px] font-medium text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-[#0a8754] fill-emerald-100/60 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Phone Mockup with Login/Sign Up */}
              <div className="relative shrink-0">
                {/* Decorative leaves */}
                <div className="absolute -left-6 bottom-4 pointer-events-none opacity-25">
                  <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
                    <path d="M10,80 Q50,90 80,50 T70,10 Q20,30 10,80 Z" fill="#0a8754" />
                  </svg>
                </div>
                <div className="absolute -right-4 top-8 pointer-events-none opacity-30">
                  <svg width="55" height="55" viewBox="0 0 100 100" fill="none">
                    <path d="M90,20 Q50,10 20,50 T30,90 Q80,70 90,20 Z" fill="#0a8754" />
                  </svg>
                </div>

                <div className="relative z-10 w-[165px] xl:w-[175px] rounded-[28px] bg-slate-900 p-2 shadow-xl border-2 border-slate-800 select-none">
                  {/* Speaker Notch */}
                  <div className="w-12 h-2 bg-slate-950 rounded-full mx-auto mb-1.5"></div>

                  {/* Phone Screen Canvas */}
                  <div className="relative w-full h-[245px] bg-white rounded-[20px] overflow-hidden flex flex-col justify-between items-center p-3.5 border border-slate-200/50">
                    <div className="w-full flex justify-between items-center text-[8.5px] text-slate-400 font-semibold px-0.5">
                      <span>9:41</span>
                      <span>5G 100%</span>
                    </div>

                    {/* Brand Logo & Name */}
                    <div className="flex flex-col items-center text-center my-auto">
                      <div className="w-11 h-11 rounded-full bg-[#0a8754] flex items-center justify-center shadow-sm text-white mb-2">
                        <Zap className="w-5 h-5 fill-white" />
                      </div>
                      <span className="text-base font-extrabold text-[#0d233a] tracking-tight">
                        ChargeNav
                      </span>
                      <span className="text-[8.5px] font-medium text-slate-400 tracking-tight mt-0.5">
                        Smart Routes. Charged Journeys.
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full space-y-1.5 pb-1">
                      <button
                        type="button"
                        className="w-full py-2 text-center text-[10.5px] font-semibold text-white bg-[#0a8754] rounded-lg shadow-xs hover:bg-[#087346] transition-colors"
                      >
                        Login
                      </button>
                      <button
                        type="button"
                        className="w-full py-2 text-center text-[10.5px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        Sign Up
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
