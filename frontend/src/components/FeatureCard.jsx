import React from 'react';

export default function FeatureCard({ icon: Icon, title, description, iconBg, iconColor }) {
  return (
    <div className="flex flex-col items-start p-4 rounded-2xl transition-all duration-200 hover:bg-slate-50/80 group">
      {/* Icon Container with subtle background tint */}
      <div className={`w-12 h-12 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center mb-4 transition-transform group-hover:scale-105 shadow-2xs`}>
        <Icon className="w-5 h-5 stroke-[2.2]" />
      </div>

      {/* Card Title */}
      <h3 className="text-sm font-bold text-[#0d233a] mb-2 leading-snug group-hover:text-[#0a8754] transition-colors">
        {title}
      </h3>

      {/* Card Description */}
      <p className="text-xs text-slate-500 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
