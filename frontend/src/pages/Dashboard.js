// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import StatCard from '../components/StatCard';
import RequestRow from '../components/RequestRow';
import {
  FileText, Clock, CheckCircle2, Package, Users,
  TrendingUp, RefreshCw, MapPin, Utensils, Droplets, Pill
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin  = user?.role === 'admin';

  const [stats,    setStats]    = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [reqRes, statsRes] = await Promise.all([
        API.get('/requests'),
        isAdmin ? API.get('/stats') : Promise.resolve(null),
      ]);
      setRequests(reqRes.data);
      if (statsRes) setStats(statsRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // Compute local stats for non-admin
  const localStats = {
    total:    requests.length,
    pending:  requests.filter(r => r.status === 'Pending').length,
    assigned: requests.filter(r => r.status === 'Assigned').length,
  };

  const displayStats = isAdmin && stats ? stats : localStats;

  const recent = requests.slice(0, 8);

  // Type breakdown
  const byType = ['food', 'water', 'medicine'].map(t => ({
    type: t,
    count: requests.filter(r => r.type === t).length,
  }));

  return (
    <div className="p-6 space-y-6 min-h-full">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {isAdmin ? 'Operations Overview' : 'My Dashboard'}
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {isAdmin
              ? 'Live relief distribution status across all zones'
              : `Track your relief requests, ${user?.name?.split(' ')[0]}`}
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="btn-secondary flex items-center gap-2 text-sm"
          disabled={loading}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────── */}
      <div className={`grid gap-4 ${isAdmin ? 'grid-cols-2 xl:grid-cols-5' : 'grid-cols-3'}`}>
        <StatCard
          label="Total Requests"
          value={loading ? null : displayStats.total}
          icon={FileText}
          color="orange"
          sub="All time"
        />
        <StatCard
          label="Pending"
          value={loading ? null : displayStats.pending}
          icon={Clock}
          color="amber"
          sub="Awaiting assignment"
        />
        <StatCard
          label="Assigned"
          value={loading ? null : displayStats.assigned}
          icon={CheckCircle2}
          color="green"
          sub="Successfully matched"
        />
        {isAdmin && (
          <>
            <StatCard
              label="Resource Units"
              value={loading ? null : displayStats.totalResourceUnits}
              icon={Package}
              color="cyan"
              sub="In inventory"
            />
            <StatCard
              label="Total Users"
              value={loading ? null : displayStats.totalUsers}
              icon={Users}
              color="violet"
              sub="Registered"
            />
          </>
        )}
      </div>

      {/* ── Main content grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent requests table — takes 2/3 width */}
        <div className="xl:col-span-2 glass p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-orange-400" />
              Recent Requests
            </h3>
            <span className="text-xs text-slate-500">{requests.length} total</span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FileText size={32} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No requests yet</p>
              <p className="text-xs mt-1">Submit your first relief request</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8">
                    {isAdmin && <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>}
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Qty</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(req => (
                    <RequestRow key={req._id} req={req} showUser={isAdmin} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right column — breakdown + tips */}
        <div className="space-y-4">

          {/* Type breakdown */}
          <div className="glass p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Package size={16} className="text-cyan-400" />
              By Type
            </h3>
            <div className="space-y-3">
              {byType.map(({ type, count }) => {
                const max = Math.max(...byType.map(b => b.count), 1);
                const pct = Math.round((count / max) * 100);
                const cfg = {
                  food:     { icon: Utensils, color: 'bg-orange-500', text: 'text-orange-400', label: 'Food'     },
                  water:    { icon: Droplets, color: 'bg-cyan-500',   text: 'text-cyan-400',   label: 'Water'    },
                  medicine: { icon: Pill,     color: 'bg-violet-500', text: 'text-violet-400', label: 'Medicine' },
                }[type];
                const Icon = cfg.icon;
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <div className={`flex items-center gap-2 text-sm font-medium ${cfg.text}`}>
                        <Icon size={13} />
                        {cfg.label}
                      </div>
                      <span className="text-xs font-mono text-slate-400">{count}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${cfg.color} rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick info card */}
          <div className="glass p-5 border-orange-500/20">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <MapPin size={16} className="text-orange-400" />
              {isAdmin ? 'Quick Actions' : 'How It Works'}
            </h3>
            {isAdmin ? (
              <div className="space-y-2 text-sm text-slate-400">
                <p>→ Go to <span className="text-orange-400 font-medium">Admin Panel</span> to add resources</p>
                <p>→ Use <span className="text-orange-400 font-medium">Auto-Match</span> to assign all at once</p>
                <p>→ Check <span className="text-orange-400 font-medium">Map View</span> for geographic spread</p>
              </div>
            ) : (
              <div className="space-y-2 text-sm text-slate-400">
                <p>1. Submit a request via <span className="text-orange-400 font-medium">Requests</span> page</p>
                <p>2. Admin reviews and assigns resources</p>
                <p>3. Status updates to <span className="text-emerald-400 font-medium">Assigned ✓</span></p>
                <p>4. Relief reaches your location</p>
              </div>
            )}
          </div>

          {/* Fulfillment rate */}
          {!loading && displayStats.total > 0 && (
            <div className="glass p-5">
              <h3 className="font-semibold text-white mb-3">Fulfillment Rate</h3>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold font-mono text-gradient">
                  {Math.round((displayStats.assigned / displayStats.total) * 100)}%
                </span>
                <span className="text-slate-500 text-sm mb-1">assigned</span>
              </div>
              <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.round((displayStats.assigned / displayStats.total) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
