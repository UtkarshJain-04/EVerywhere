import React from 'react';
import { Leaf, Users, Shield, Handshake, Star } from 'lucide-react';

export default function OurValues() {
  const values = [
    {
      id: 1,
      icon: Leaf,
      title: 'Innovation',
      description: 'Using technology to solve real-world EV challenges.'
    },
    {
      id: 2,
      icon: Users,
      title: 'Customer First',
      description: 'Building solutions that make EV travel simple and stress-free.'
    },
    {
      id: 3,
      icon: Shield,
      title: 'Sustainability',
      description: 'Driving cleaner choices for a healthier planet.'
    },
    {
      id: 4,
      icon: Handshake,
      title: 'Trust',
      description: 'Providing accurate, reliable and transparent information.'
    },
    {
      id: 5,
      icon: Star,
      title: 'Excellence',
      description: 'Committed to continuous improvement and better experiences.'
    }
  ];

  return (
    <section className="w-full bg-[#f9faf9] py-14 lg:py-16 border-t border-slate-100">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Heading & Description (approx 3.5 cols) */}
          <div className="lg:col-span-4 space-y-2.5">
            <span className="text-xs font-bold text-[#0a8754] uppercase tracking-wider block">
              OUR VALUES
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0d233a] tracking-tight leading-tight">
              What Drives Us
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm pt-1">
              Our values guide every decision we make and shape the experience we create for our users, partners and the planet.
            </p>
          </div>

          {/* Right Column: 5 Values Cards in a Row (approx 8 cols) */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
              {values.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div 
                    key={item.id}
                    className="bg-white/80 backdrop-blur-xs rounded-2xl p-4 border border-slate-200/50 shadow-2xs hover:bg-white transition-all group"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-[#e8f7ee] text-[#0a8754] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <IconComponent className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <h3 className="text-sm font-bold text-[#0d233a] mb-1.5 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[11.5px] text-slate-500 leading-relaxed font-normal">
                      {item.description}
                    </p>
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
