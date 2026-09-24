import React from 'react';
import featuresHeroBg from '../../assets/features_hero_ev.jpg';

export default function FeaturesHero() {
  return (
    <section className="relative w-full overflow-hidden bg-slate-100 border-b border-slate-100 min-h-[480px] sm:min-h-[540px] lg:min-h-[600px] flex items-center">
      {/* Background Image: Coastal Mountain Highway with White EV and Green Charger */}
      <div 
        className="absolute inset-0 bg-cover bg-[position:75%_center] lg:bg-right-center bg-no-repeat z-0"
        style={{ backgroundImage: `url(${featuresHeroBg})` }}
      >
        {/* Smooth Left-to-Right White Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 via-42% md:via-white/85 md:via-48% to-transparent"></div>
        {/* Mobile vertical overlay to ensure readability on small screens */}
        <div className="absolute inset-0 bg-white/70 sm:hidden"></div>
        {/* Subtle Bottom Fade */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent"></div>
      </div>

      {/* Hero Content Container - Broad Desktop Width */}
      <div className="relative z-10 max-w-[1520px] 2xl:max-w-[1640px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-16 py-16 sm:py-20 lg:py-28 w-full">
        <div className="max-w-2xl lg:max-w-3xl space-y-4 sm:space-y-5">
          
          {/* Eyebrow Label */}
          <span className="text-xs sm:text-sm font-bold text-[#0a8754] tracking-widest uppercase block">
            OUR FEATURES
          </span>

          {/* Main Title - Large, bold, two lines */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[62px] font-extrabold text-[#0d233a] tracking-tight leading-[1.12]">
            Everything You Need <br />
            for a <span className="text-[#0a8754]">Smarter EV Journey</span>
          </h1>

          {/* Description Paragraph */}
          <p className="text-slate-600 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl font-normal pt-1">
            ChargeNav brings together real-time route planning, nearby charging station information, and smart features to help you travel further with confidence.
          </p>

        </div>
      </div>
    </section>
  );
}
