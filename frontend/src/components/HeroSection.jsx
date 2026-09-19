import React from 'react';
import { Zap } from 'lucide-react';
import RouteSearchForm from './RouteSearchForm';
import FeatureHighlights from './FeatureHighlights';
import PhoneMockup from './PhoneMockup';
import heroBgImage from '../assets/hero_ev_road.jpg';

export default function HeroSection() {
  return (
    <section id="home" className="relative w-full overflow-hidden bg-slate-100">
      {/* Background Image: Scenic Coastal Road with Modern White EV */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url(${heroBgImage})` }}
      >
        {/* Soft Left-to-Right White Gradient Overlay for Text Readability while keeping car vibrant */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 via-35% to-transparent lg:via-white/65 lg:via-40% lg:to-transparent"></div>
        {/* Subtle Bottom Fade */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent"></div>
      </div>

      {/* Main Content Container - Aligned with Navbar Logo via same max-w and horizontal padding */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 pt-7 pb-10 sm:pt-8 sm:pb-12 lg:pt-8 lg:pb-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Hero Text & Search Form */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4 sm:space-y-4.5">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200/90 shadow-2xs">
              <Zap className="w-3.5 h-3.5 text-[#0a8754] fill-[#0a8754]" />
              <span className="text-[10.5px] font-bold tracking-wider text-slate-700 uppercase">
                EV ROUTE PLANNER & CHARGING STATION FINDER
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] xl:text-[46px] font-extrabold tracking-tight leading-[1.16]">
              <span className="block text-[#0d233a]">
                Smarter Routes for a
              </span>
              <span className="block text-[#0a8754]">
                Greener Tomorrow
              </span>
            </h1>

            {/* Description */}
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-lg font-normal">
              ChargeNav helps you find the best EV routes with nearby charging stations, real-time insights and smart optimization for a safer, smoother and more efficient journey.
            </p>

            {/* Route Search Form */}
            <div className="pt-1">
              <RouteSearchForm />
            </div>

            {/* Feature Highlights */}
            <div className="pt-0.5">
              <FeatureHighlights />
            </div>
          </div>

          {/* Right Column: Phone Mockup - Completely Static, No Hover or Movement */}
          <div className="lg:col-span-5 xl:col-span-4 flex justify-center lg:justify-end items-center lg:items-start lg:pt-1">
            <div className="w-auto select-none">
              <PhoneMockup />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
