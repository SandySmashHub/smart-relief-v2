// src/pages/Requests.js
import React, { useState, useEffect, useCallback } from 'react';
import API from '../api';
import RequestRow from '../components/RequestRow';
import toast from 'react-hot-toast';
import {
  Send, Search, Filter, MapPin, Loader2,
  Utensils, Droplets, Pill, X
} from 'lucide-react';

export default function Requests() {
  const [form, setForm]         = useState({ location: '', type: 'food', quantity: '', lat: null, lng: null });
  const [requests, setRequests] = useState([]);
  const [search, setSearch]     = useState('');
  const [filterType, setFilter] = useState('');
  const [filterStatus, setFStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fetching, setFetching]   = useState(true);
  const [geoLoading, setGeoLoading] = useState(false);

  const fetchRequests = useCallback(async () => {
    setFetching(true);
    try {
      const params = {};
      if (filterType)   params.type   = filterType;
      if (filterStatus) params.status = filterStatus;
      if (search)       params.search = search;
      const { data } = await API.get('/requests', { params });
      setRequests(data);
    } catch { toast.error('Failed to load requests'); }
    finally  { setFetching(false); }
  }, [filterType, filterStatus, search]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  // Auto-detect location via browser geolocation
  const detectLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setForm(p => ({
          ...p,
          lat: latitude,
          lng: longitude,
          location: p.location || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        }));
        toast.success('Location detected!');
        setGeoLoading(false);
      },
      () => { toast.error('Could not detect location'); setGeoLoading(false); }
    );
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.location.trim()) return toast.error('Please enter your location');
    if (Number(form.quantity) < 1) return toast.error('Quantity must be at least 1');
    setSubmitting(true);
    try {
      await API.post('/requests', form);
      toast.success('Help request submitted successfully!');
      setForm({ location: '', type: 'food', quantity: '', lat: null, lng: null });
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  const typeIcons = { food: Utensils, water: Droplets, medicine: Pill };

  const filtered = requests.filter(r => {
    const matchSearch = !search || r.location.toLowerCase().includes(search.toLowerCase());
    const matchType   = !filterType   || r.type === filterType;
    const matchStatus = !filterStatus || r.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="p-6 space-y-6 min-h-full">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Relief Requests</h2>
        <p className="text-slate-400 text-sm mt-0.5">Submit a new request or track existing ones</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Submit Form ──────────────────────────────────────────── */}
        <div className="xl:col-span-1">
          <div className="glass p-5 sticky top-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Send size={16} className="text-orange-400" />
              New Request
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Location */}
              <div>
                <label className="label">Your Location</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                    className="input-dark flex-1"
                    placeholder="e.g. Sector 5, Mumbai"
                    required
                  />
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={geoLoading}
                    className="px-3 py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/25
                               text-cyan-400 hover:bg-cyan-500/25 transition-colors flex-shrink-0"
                    title="Auto-detect location"
                  >
                    {geoLoading
                      ? <Loader2 size={15} className="animate-spin" />
                      : <MapPin size={15} />}
                  </button>
                </div>
                {form.lat && (
                  <p className="text-[11px] text-cyan-400/70 mt-1 font-mono">
                    📍 {form.lat?.toFixed(4)}, {form.lng?.toFixed(4)}
                  </p>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="label">Type of Relief</label>
                <div className="grid grid-cols-3 gap-2">
                  {['food', 'water', 'medicine'].map(t => {
                    const Icon = typeIcons[t];
                    const active = form.type === t;
                    return (
                      <button
                        key={t} type="button"
                        onClick={() => setForm(p => ({ ...p, type: t }))}
                        className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-semibold
                          transition-all duration-150 capitalize
                          ${active
                            ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                            : 'bg-white/3 border-white/10 text-slate-400 hover:bg-white/8'
                          }`}
                      >
                        <Icon size={16} />
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="label">Quantity (units)</label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
                  className="input-dark"
                  placeholder="e.g. 10"
                  min="1"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2"
                disabled={submitting}
              >
                {submitting
                  ? <><Loader2 size={15} className="animate-spin" /> Submitting…</>
                  : <><Send size={15} /> Submit Request</>}
              </button>
            </form>

            {/* Request count summary */}
            <div className="mt-4 pt-4 border-t border-white/8 grid grid-cols-2 gap-2 text-center">
              <div className="bg-amber-500/10 rounded-lg py-2">
                <div className="text-lg font-bold font-mono text-amber-400">
                  {requests.filter(r => r.status === 'Pending').length}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wide">Pending</div>
              </div>
              <div className="bg-emerald-500/10 rounded-lg py-2">
                <div className="text-lg font-bold font-mono text-emerald-400">
                  {requests.filter(r => r.status === 'Assigned').length}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wide">Assigned</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Requests List ────────────────────────────────────────── */}
        <div className="xl:col-span-2 glass p-5">
          {/* Filters bar */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-dark pl-9 py-2"
                placeholder="Search by location…"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Filter size={14} className="text-slate-500" />
              <select value={filterType} onChange={e => setFilter(e.target.value)} className="select-dark py-2 text-sm w-32">
                <option value="">All Types</option>
                <option value="food">Food</option>
                <option value="water">Water</option>
                <option value="medicine">Medicine</option>
              </select>
              <select value={filterStatus} onChange={e => setFStatus(e.target.value)} className="select-dark py-2 text-sm w-32">
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Assigned">Assigned</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {fetching ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-white/4 animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Search size={36} className="mx-auto mb-3 opacity-20" />
              <p className="font-medium">No requests found</p>
              <p className="text-xs mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Qty</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(req => (
                    <RequestRow key={req._id} req={req} showUser={false} />
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-slate-600 mt-3 text-right">
                Showing {filtered.length} of {requests.length} requests
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
