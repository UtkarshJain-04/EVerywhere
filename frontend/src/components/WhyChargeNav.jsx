import React from 'react';
import { Zap, GitFork, BarChart3, Shield, Leaf } from 'lucide-react';
import FeatureCard from './FeatureCard';

export default function WhyChargeNav() {
  const features = [
    {
      id: 1,
      icon: Zap,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-[#0a8754]',
      title: 'Find Charging Stations',
      description: 'Locate nearby and reliable charging stations along your route with real-time status and reviews.'
    },
    {
      id: 2,
      icon: GitFork,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      title: 'Smart Route Planning',
      description: 'Get the best route based on distance, battery usage, elevation, road conditions and more.'
    },
    {
      id: 3,
      icon: BarChart3,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      title: 'EV Friendly Analysis',
      description: 'Optimized for lower energy consumption, minimal slope and better road quality.'
    },
    {
      id: 4,
      icon: Shield,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      title: 'Real-Time Updates',
      description: 'Stay informed with live traffic, charging station availability and route changes.'
    },
    {
      id: 5,
      icon: Leaf,
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-600',
      title: 'Drive Greener',
      description: 'Make eco-friendly choices and contribute to a cleaner, healthier planet.'
    }
  ];

  return (
    <section id="features" className="w-full bg-white py-12 lg:py-16 border-t border-slate-100">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          {/* Eyebrow & Main Title */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#0a8754] uppercase tracking-wider block">
              WHY CHARGENAV?
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#0d233a] tracking-tight leading-[1.2]">
              Everything You Need for a <br className="hidden sm:inline" />
              <span className="text-[#0a8754]">Seamless EV Journey</span>
            </h2>
          </div>

          {/* Right-side Description */}
          <div className="max-w-md pb-1">
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              From finding charging stations to optimizing your route, ChargeNav makes EV travel easier, smarter and stress-free.
            </p>
          </div>
        </div>

        {/* 5 Feature Cards Grid (Desktop 5-cols, Tablet 2-3 cols, Mobile 1 col) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
          {features.map((item) => (
            <FeatureCard
              key={item.id}
              icon={item.icon}
              iconBg={item.iconBg}
              iconColor={item.iconColor}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
