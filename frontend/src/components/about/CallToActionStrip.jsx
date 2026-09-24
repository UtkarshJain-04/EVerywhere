import React from 'react';
import { Leaf, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CallToActionStrip() {
  return (
    <section className="w-full bg-white pb-14 lg:pb-16">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14">
        
        <div className="bg-[#f0f9f3] border border-emerald-200/70 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs relative overflow-hidden">
          {/* Decorative subtle background leaf motif */}
          <div className="absolute right-40 -bottom-8 opacity-10 pointer-events-none">
            <Leaf className="w-32 h-32 text-[#0a8754]" />
          </div>

          {/* Left: Icon & Text */}
          <div className="flex items-center gap-3.5 sm:gap-4 relative z-10 text-center sm:text-left flex-col sm:flex-row">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#0a8754] flex items-center justify-center shadow-xs flex-shrink-0">
              <Leaf className="w-5 h-5 fill-[#0a8754]/20 stroke-[#0a8754] stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10.5px] font-bold text-[#0a8754] uppercase tracking-wider block mb-0.5">
                BE PART OF THE CHANGE
              </span>
              <h4 className="text-sm sm:text-base md:text-lg font-bold text-[#0d233a] leading-tight">
                Together for a Cleaner, Greener Tomorrow
              </h4>
            </div>
          </div>

          {/* Right: CTA Button */}
          <Link
            to="/#features"
            className="relative z-10 flex-shrink-0 bg-[#0a8754] hover:bg-[#087346] active:scale-[0.98] text-white text-xs sm:text-sm font-medium px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm shadow-emerald-700/20"
          >
            <span>Explore Features</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

        </div>

      </div>
    </section>
  );
}
