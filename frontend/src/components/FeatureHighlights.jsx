import React from 'react';
import { Zap, GitFork, Shield, Leaf } from 'lucide-react';

export default function FeatureHighlights() {
  const highlights = [
    {
      id: 1,
      icon: Zap,
      label: 'Nearest Charging Stations',
      color: 'text-[#0a8754]',
      fill: 'fill-[#0a8754]/20'
    },
    {
      id: 2,
      icon: GitFork,
      label: 'Optimized EV Routes',
      color: 'text-[#0a8754]',
      fill: ''
    },
    {
      id: 3,
      icon: Shield,
      label: 'Real-time Road & Traffic',
      color: 'text-[#0a8754]',
      fill: 'fill-[#0a8754]/20'
    },
    {
      id: 4,
      icon: Leaf,
      label: 'Better Battery Efficiency',
      color: 'text-[#0a8754]',
      fill: 'fill-[#0a8754]/20'
    }
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
      {highlights.map((item) => {
        const IconComponent = item.icon;
        return (
          <div 
            key={item.id}
            className="flex items-center gap-2 group cursor-default"
          >
            <div className="flex items-center justify-center">
              <IconComponent className={`w-4 h-4 ${item.color} ${item.fill} transition-transform group-hover:scale-110`} />
            </div>
            <span className="text-xs font-medium text-slate-700 tracking-tight">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
