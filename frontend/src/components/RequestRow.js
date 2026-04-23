// src/components/RequestRow.js
import React from 'react';
import { Utensils, Droplets, Pill, Clock, CheckCircle2 } from 'lucide-react';

const typeConfig = {
  food:     { icon: Utensils, cls: 'badge-food',     label: 'Food'     },
  water:    { icon: Droplets, cls: 'badge-water',    label: 'Water'    },
  medicine: { icon: Pill,     cls: 'badge-medicine', label: 'Medicine' },
};

export default function RequestRow({ req, showUser = false, action }) {
  const tc = typeConfig[req.type] || typeConfig.food;
  const Icon = tc.icon;

  return (
    <tr className="border-b border-white/5 hover:bg-white/3 transition-colors group">
      {showUser && (
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700
                            flex items-center justify-center text-[11px] font-bold text-slate-300">
              {req.userName?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-slate-300 font-medium">{req.userName}</span>
          </div>
        </td>
      )}
      <td className="px-4 py-3">
        <span className="text-sm text-slate-300">{req.location}</span>
      </td>
      <td className="px-4 py-3">
        <span className={tc.cls}>
          <Icon size={11} />
          {tc.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="font-mono text-sm font-semibold text-slate-200">{req.quantity}</span>
      </td>
      <td className="px-4 py-3">
        {req.status === 'Assigned' ? (
          <span className="badge-assigned"><CheckCircle2 size={11} />Assigned</span>
        ) : (
          <span className="badge-pending"><Clock size={11} />Pending</span>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-slate-500">
        {new Date(req.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
      </td>
      {action && <td className="px-4 py-3">{action(req)}</td>}
    </tr>
  );
}
