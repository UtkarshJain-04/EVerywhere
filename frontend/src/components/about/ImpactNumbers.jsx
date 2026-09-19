import React from 'react';
import { Users, BatteryCharging, GitFork, Leaf } from 'lucide-react';
import impactBgImg from '../../assets/about_impact_sunset.jpg';

export default function ImpactNumbers() {
  const stats = [
    {
      id: 1,
      icon: Users,
      value: '1000+',
      label: 'Future Users'
    },
    {
      id: 2,
      icon: BatteryCharging,
      value: '500+',
      label: 'Charging Stations (Planned)'
    },
    {
      id: 3,
      icon: GitFork,
      value: '100+',
      label: 'Planned Routes'
    },
    {
      id: 4,
      icon: Leaf,
      value: '1+',
      label: 'Cleaner Planet'
    }
  ];

  return (
    <section className="w-full bg-white py-14 lg:py-16 border-t border-slate-100">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: OUR IMPACT Hero Card (approx 5 cols) */}
          <div className="lg:col-span-5 relative rounded-3xl overflow-hidden shadow-sm min-h-[300px] sm:min-h-[320px] flex flex-col justify-end p-7 sm:p-8 group">
            {/* Background Sunset Coastal Highway */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${impactBgImg})` }}
            ></div>
            
            {/* Dark Atmospheric Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-slate-950/30"></div>

            {/* Content */}
            <div className="relative z-10 space-y-2">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                OUR IMPACT
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                Cleaner Roads. <br />
                Brighter Futures.
              </h3>
              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-sm pt-1 font-normal">
                Every route we optimize helps reduce emissions and supports a more sustainable tomorrow.
              </p>
            </div>
          </div>

          {/* Right Column: THE NUMBERS & Stats Grid (approx 7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between py-1 space-y-6">
            
            {/* Text Header */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#0a8754] uppercase tracking-wider block">
                THE NUMBERS
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                <span className="text-[#0d233a]">Building a Greener </span>
                <span className="text-[#0a8754]">EV Ecosystem</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl font-normal pt-1">
                While we're still growing, our vision is already creating an impact. Here's what we aim to achieve with ChargeNav and our community of EV drivers.
              </p>
            </div>

            {/* 4 Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
              {stats.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div 
                    key={item.id}
                    className="bg-[#f9faf9] border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between hover:bg-white hover:shadow-2xs transition-all"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-100/70 text-[#0a8754] flex items-center justify-center mb-3">
                      <IconComponent className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-[#0d233a] tracking-tight block">
                        {item.value}
                      </span>
                      <span className="text-xs text-slate-500 font-medium leading-tight block mt-0.5">
                        {item.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
