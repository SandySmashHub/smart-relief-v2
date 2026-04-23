// src/pages/AdminPanel.js
// Full admin control: add resources, view inventory, assign/auto-match requests
import React, { useState, useEffect, useCallback } from 'react';
import API from '../api';
import RequestRow from '../components/RequestRow';
import toast from 'react-hot-toast';
import {
  ShieldCheck, Plus, Package, Zap, Search, Filter,
  Trash2, RefreshCw, Loader2, X, ChevronDown, CheckCircle2
} from 'lucide-react';

// ── Resource selector per row ──────────────────────────────────────────────
function AssignCell({ req, resources, onAssign, busy }) {
  const [selected, setSelected] = useState('');
  const matching = resources.filter(r => r.type === req.type && r.quantity >= req.quantity);

  if (req.status === 'Assigned')
    return <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1"><CheckCircle2 size={12}/>Done</span>;
  if (matching.length === 0)
    return <span className="text-red-400 text-xs">No stock</span>;

  return (
    <div className="flex items-center gap-2 min-w-[220px]">
      <div className="relative flex-1">
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          className="select-dark text-xs py-1.5 pr-7 w-full"
        >
          <option value="">Pick resource…</option>
          {matching.map(r => (
            <option key={r._id} value={r._id}>
              {r.location} (qty: {r.quantity})
            </option>
          ))}
        </select>
        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
      </div>
      <button
        onClick={() => { if (selected) onAssign(req._id, selected, setSelected); }}
        disabled={busy || !selected}
        className="btn-success py-1.5 px-3 text-xs whitespace-nowrap"
      >
        {busy ? <Loader2 size={12} className="animate-spin" /> : 'Assign'}
      </button>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [resources,  setResources]  = useState([]);
  const [requests,   setRequests]   = useState([]);
  const [resForm,    setResForm]    = useState({ location: '', type: 'food', quantity: '' });
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search,     setSearch]     = useState('');
  const [addingRes,  setAddingRes]  = useState(false);
  const [autoMatching, setAutoMatching] = useState(false);
  const [assigningId,  setAssigningId]  = useState(null);
  const [fetching,   setFetching]   = useState(true);

  const fetchAll = useCallback(async () => {
    setFetching(true);
    try {
      const [reqRes, resRes] = await Promise.all([
        API.get('/requests', {
          params: {
            ...(filterType   && { type:   filterType   }),
            ...(filterStatus && { status: filterStatus }),
            ...(search       && { search               }),
          }
        }),
        API.get('/resources'),
      ]);
      setRequests(reqRes.data);
      setResources(resRes.data);
    } catch { toast.error('Failed to load data'); }
    finally  { setFetching(false); }
  }, [filterType, filterStatus, search]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Add resource
  const handleAddResource = async e => {
    e.preventDefault();
    if (!resForm.location.trim()) return toast.error('Location required');
    setAddingRes(true);
    try {
      await API.post('/resources', resForm);
      toast.success('Resource added to inventory!');
      setResForm({ location: '', type: 'food', quantity: '' });
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setAddingRes(false); }
  };

  // Delete resource
  const handleDelete = async (id) => {
    if (!window.confirm('Remove this resource?')) return;
    try {
      await API.delete(`/resources/${id}`);
      toast.success('Resource removed');
      fetchAll();
    } catch { toast.error('Failed to remove'); }
  };

  // Assign resource to request
  const handleAssign = async (requestId, resourceId, resetSelect) => {
    setAssigningId(requestId);
    try {
      const { data } = await API.post('/requests/assign', { requestId, resourceId });
      toast.success(data.message || 'Resource assigned successfully!');
      if (resetSelect) resetSelect('');
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Assignment failed'); }
    finally { setAssigningId(null); }
  };

  // Auto-match all pending
  const handleAutoMatch = async () => {
    setAutoMatching(true);
    try {
      const { data } = await API.post('/requests/auto-match');
      toast.success(`Auto-matched ${data.matched} request(s)!`);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Auto-match failed'); }
    finally { setAutoMatching(false); }
  };

  const totalStock = resources.reduce((s, r) => s + r.quantity, 0);
  const pending = requests.filter(r => r.status === 'Pending').length;

  const typeColors = {
    food:     'text-orange-400 bg-orange-500/10 border-orange-500/20',
    water:    'text-cyan-400   bg-cyan-500/10   border-cyan-500/20',
    medicine: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  };

  return (
    <div className="p-6 space-y-6 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck size={24} className="text-orange-400" />
            Admin Panel
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">Manage inventory and assign relief resources</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={fetchAll} disabled={fetching} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={14} className={fetching ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleAutoMatch}
            disabled={autoMatching || pending === 0}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            {autoMatching
              ? <Loader2 size={14} className="animate-spin" />
              : <Zap size={14} />}
            Auto-Match All ({pending} pending)
          </button>
        </div>
      </div>

      {/* ── Top row: Add Resource + Inventory ──────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* Add Resource Form */}
        <div className="xl:col-span-2 glass p-5">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Plus size={16} className="text-orange-400" />
            Add Resource
          </h3>
          <form onSubmit={handleAddResource} className="space-y-3">
            <div>
              <label className="label">Storage Location</label>
              <input
                type="text"
                value={resForm.location}
                onChange={e => setResForm(p => ({ ...p, location: e.target.value }))}
                className="input-dark"
                placeholder="e.g. Warehouse A, Delhi"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Type</label>
                <select
                  value={resForm.type}
                  onChange={e => setResForm(p => ({ ...p, type: e.target.value }))}
                  className="select-dark"
                >
                  <option value="food">🍱 Food</option>
                  <option value="water">💧 Water</option>
                  <option value="medicine">💊 Medicine</option>
                </select>
              </div>
              <div>
                <label className="label">Quantity</label>
                <input
                  type="number"
                  value={resForm.quantity}
                  onChange={e => setResForm(p => ({ ...p, quantity: e.target.value }))}
                  className="input-dark"
                  placeholder="e.g. 100"
                  min="1"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={addingRes}
            >
              {addingRes
                ? <Loader2 size={14} className="animate-spin" />
                : <Plus size={14} />}
              Add to Inventory
            </button>
          </form>

          {/* Quick stats */}
          <div className="mt-4 pt-4 border-t border-white/8 grid grid-cols-2 gap-2">
            <div className="bg-white/4 rounded-xl p-3 text-center">
              <div className="text-xl font-bold font-mono text-cyan-400">{resources.length}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">Resource Types</div>
            </div>
            <div className="bg-white/4 rounded-xl p-3 text-center">
              <div className="text-xl font-bold font-mono text-orange-400">{totalStock}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">Total Units</div>
            </div>
          </div>
        </div>

        {/* Resource Inventory Table */}
        <div className="xl:col-span-3 glass p-5">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Package size={16} className="text-cyan-400" />
            Inventory
            <span className="ml-auto text-xs text-slate-500 font-normal">{resources.length} entries</span>
          </h3>

          {resources.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <Package size={32} className="mx-auto mb-3 opacity-20" />
              <p>No resources in inventory. Add some above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-64 scroll-area">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-navy-800/80 backdrop-blur-sm">
                  <tr className="border-b border-white/8">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Qty</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map(res => (
                    <tr key={res._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-3 py-2.5 text-slate-300 text-sm">{res.location}</td>
                      <td className="px-3 py-2.5">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${typeColors[res.type]}`}>
                          {res.type === 'food' ? '🍱' : res.type === 'water' ? '💧' : '💊'} {res.type}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`font-mono font-bold text-sm ${res.quantity === 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {res.quantity}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => handleDelete(res._id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Remove resource"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── All Requests Table ──────────────────────────────────────────── */}
      <div className="glass p-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Filter size={16} className="text-orange-400" />
            All Help Requests
            <span className="text-xs text-slate-500 font-normal ml-1">({requests.length} total)</span>
          </h3>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search location…"
                className="input-dark pl-8 py-2 text-sm w-44"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500">
                  <X size={12} />
                </button>
              )}
            </div>

            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="select-dark py-2 text-sm w-32">
              <option value="">All Types</option>
              <option value="food">Food</option>
              <option value="water">Water</option>
              <option value="medicine">Medicine</option>
            </select>

            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="select-dark py-2 text-sm w-32">
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
            </select>
          </div>
        </div>

        {fetching ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-white/4 animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Search size={36} className="mx-auto mb-3 opacity-20" />
            <p>No requests match your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Qty</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Assign</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <RequestRow
                    key={req._id}
                    req={req}
                    showUser={true}
                    action={r => (
                      <AssignCell
                        req={r}
                        resources={resources}
                        onAssign={handleAssign}
                        busy={assigningId === r._id}
                      />
                    )}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
