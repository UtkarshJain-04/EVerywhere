import React from 'react';
import { Leaf } from 'lucide-react';
import missionImg from '../../assets/about_mission_charging.jpg';

export default function MissionVision() {
  return (
    <section className="w-full bg-white py-14 lg:py-16 border-t border-slate-100">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: OUR MISSION (approx 4.5 cols) */}
          <div className="lg:col-span-4 space-y-3.5">
            <span className="text-xs font-bold text-[#0a8754] uppercase tracking-wider block">
              OUR MISSION
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0d233a] tracking-tight leading-[1.2]">
              Making EV Travel <br />
              Simple, Accessible and Reliable
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal pt-1">
              Our mission is to empower every EV driver with intelligent route planning, real-time insights and reliable charging station information, so they can travel with confidence and contribute to a cleaner planet.
            </p>
          </div>

          {/* Center Column: Mission Illustration Art (approx 4.5 cols) */}
          <div className="lg:col-span-4 flex justify-center items-center">
            <div className="relative w-full max-w-sm rounded-[38px] overflow-hidden shadow-sm border border-emerald-100/60 aspect-[4/3] group">
              <img 
                src={missionImg} 
                alt="EV Charging at modern station illustration" 
                className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[38px]"></div>
            </div>
          </div>

          {/* Right Column: OUR VISION Card (approx 4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-[#f2faf5] rounded-3xl p-6 sm:p-7 border border-emerald-100/80 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100/70 text-[#0a8754] flex items-center justify-center">
                <Leaf className="w-5 h-5 fill-[#0a8754]/20 stroke-[#0a8754] stroke-[2.2]" />
              </div>
              
              <div>
                <span className="text-[11px] font-bold text-[#0a8754] uppercase tracking-wider block mb-1">
                  OUR VISION
                </span>
                <h3 className="text-xl sm:text-[22px] font-bold text-[#0d233a] leading-tight">
                  A Greener Tomorrow
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal pt-1">
                We envision a world where electric mobility is the easiest, safest and most sustainable choice — for individuals, communities and the planet.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
