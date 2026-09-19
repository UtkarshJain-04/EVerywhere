import React from 'react';
import footerBgImage from '../assets/footer_mountains.jpg';

export default function Footer() {
  return (
    <footer className="relative w-full h-28 sm:h-32 overflow-hidden flex items-center justify-center select-none">
      {/* Scenic Mountain Background Image with Dark Atmospheric Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url(${footerBgImage})` }}
      >
        <div className="absolute inset-0 bg-slate-950/75 backdrop-brightness-75"></div>
      </div>

      {/* Centered Brand Tagline */}
      <div className="relative z-10 px-4 text-center">
        <p className="text-[11px] sm:text-xs md:text-sm font-semibold text-slate-200 tracking-[0.25em] uppercase">
          CHARGENAV &nbsp;—&nbsp; SMARTER ROUTES.&nbsp; CHARGED JOURNEYS.
        </p>
      </div>
    </footer>
  );
}
