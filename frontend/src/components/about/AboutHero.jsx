import React from 'react';
import { Zap } from 'lucide-react';
import heroBgImage from '../../assets/hero_ev_road.jpg';

export default function AboutHero() {
  return (
    <section className="relative w-full overflow-hidden bg-slate-100">
      {/* Background Image: Scenic Coastal Road with Modern White EV */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url(${heroBgImage})` }}
      >
        {/* Soft Left-to-Right White Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 via-35% to-transparent lg:via-white/65 lg:via-40% lg:to-transparent"></div>
        {/* Subtle Bottom Fade to pure white */}
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white to-transparent"></div>
      </div>

      {/* Main Content Container - Aligned with Navbar Logo via same max-w and horizontal padding */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 py-10 sm:py-12 lg:py-16 w-full">
        <div className="max-w-2xl space-y-4 sm:space-y-5">
          
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200/90 shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-[#0a8754] fill-[#0a8754]" />
            <span className="text-[10.5px] font-bold tracking-wider text-slate-700 uppercase">
              ABOUT CHARGENAV
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-extrabold tracking-tight leading-[1.16]">
            <span className="block text-[#0d233a]">
              Driving the Future of
            </span>
            <span className="block">
              <span className="text-[#0d233a]">Sust</span>
              <span className="text-[#0a8754]">ainable Mobility</span>
            </span>
          </h1>

          {/* Description */}
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xl font-normal">
            ChargeNav is more than just a route planner — it's a step towards a cleaner, smarter and more sustainable future. We're building technology that makes EV travel easier, safer and more efficient for everyone.
          </p>

        </div>
      </div>
    </section>
  );
}
