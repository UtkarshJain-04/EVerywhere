import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Leaf, 
  ShieldCheck, 
  Star, 
  Zap, 
  MapPin, 
  Heart, 
  ArrowRight 
} from 'lucide-react';

export default function MoreThanJustAMap() {
  const highlights = [
    {
      icon: Leaf,
      title: 'Sustainable',
      description: 'Supports a cleaner and greener planet.'
    },
    {
      icon: ShieldCheck,
      title: 'Reliable',
      description: 'Real-time and accurate information.'
    },
    {
      icon: Star,
      title: 'Trusted',
      description: 'Reviews and ratings from real users.'
    },
    {
      icon: Zap,
      title: 'Efficient',
      description: 'Saves time and battery life.'
    },
    {
      icon: MapPin,
      title: 'Comprehensive',
      description: 'Wide network of charging stations.'
    },
    {
      icon: Heart,
      title: 'Built for You',
      description: 'Designed for a better EV driving experience.'
    }
  ];

  return (
    <section className="w-full bg-[#fcfdfd] pb-20 sm:pb-24 lg:pb-28">
      <div className="max-w-[1520px] 2xl:max-w-[1640px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-16">
        
        {/* Enclosed Pale Green Banner Card - Generous padding & radius */}
        <div className="bg-[#f3faf6] rounded-[36px] p-8 sm:p-12 lg:p-16 xl:p-18 border border-emerald-100/80 shadow-[0_4px_35px_-5px_rgba(10,135,84,0.06)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-16 items-center">
            
            {/* Left Column: Heading, Subtext & CTA Button */}
            <div className="lg:col-span-5 space-y-4 sm:space-y-5">
              <span className="text-xs sm:text-sm font-bold text-[#0a8754] uppercase tracking-wider block">
                WHY CHARGENAV
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#0d233a] tracking-tight leading-[1.15]">
                More Than Just a Map
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg pt-1">
                ChargeNav is built for the future — combining technology, sustainability and convenience to make EV travel easier, safer and more efficient for everyone.
              </p>

              <div className="pt-4 sm:pt-6">
                <Link
                  to="/"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#0a8754] hover:bg-[#087346] text-white text-sm sm:text-base font-semibold shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span>Start Your Journey</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Right Column: 6 Feature Highlights Grid (3 cols x 2 rows) */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 xl:gap-9">
                {highlights.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="space-y-3">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#0a8754] shadow-xs border border-emerald-100/60">
                        <Icon className="w-6 h-6 fill-emerald-100/50 stroke-[2.2]" />
                      </div>

                      {/* Title */}
                      <h4 className="text-base font-bold text-slate-800 tracking-tight">
                        {item.title}
                      </h4>

                      {/* Description */}
                      <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-normal">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
