// src/components/StatCard.js
import React from 'react';

export default function StatCard({ label, value, icon: Icon, color, sub }) {
  const colors = {
    orange: { glow: 'shadow-orange-500/20', icon: 'from-orange-500 to-amber-400',   text: 'text-orange-400', ring: 'ring-orange-500/20' },
    cyan:   { glow: 'shadow-cyan-500/20',   icon: 'from-cyan-500 to-blue-500',       text: 'text-cyan-400',   ring: 'ring-cyan-500/20'   },
    green:  { glow: 'shadow-emerald-500/20',icon: 'from-emerald-500 to-teal-400',    text: 'text-emerald-400',ring: 'ring-emerald-500/20' },
    violet: { glow: 'shadow-violet-500/20', icon: 'from-violet-500 to-purple-500',   text: 'text-violet-400', ring: 'ring-violet-500/20'  },
    amber:  { glow: 'shadow-amber-500/20',  icon: 'from-amber-500 to-yellow-400',    text: 'text-amber-400',  ring: 'ring-amber-500/20'   },
  };
  const c = colors[color] || colors.orange;

  return (
    <div className={`stat-card shadow-lg ${c.glow} hover:scale-[1.02] transition-transform duration-200 cursor-default`}>
      {/* Background decoration */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${c.icon} opacity-10 blur-xl`} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">{label}</p>
          <p className={`text-4xl font-bold font-mono ${c.text} leading-none`}>
            {value ?? <span className="animate-pulse">—</span>}
          </p>
          {sub && <p className="text-xs text-slate-500 mt-2">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.icon} flex items-center justify-center
                         shadow-lg ring-4 ${c.ring} flex-shrink-0`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
}
