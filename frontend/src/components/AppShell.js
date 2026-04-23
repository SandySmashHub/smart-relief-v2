// src/components/AppShell.js
// Full-screen layout: fixed sidebar + fixed topbar + scrollable content
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, FileText, Map, ShieldCheck,
  LogOut, Zap, Bell, ChevronDown, Menu, X
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/requests',  icon: FileText,         label: 'Requests'  },
  { to: '/map',       icon: Map,              label: 'Map View'  },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U';

  return (
    <div className="flex h-screen w-screen bg-mesh overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className={`
          flex-shrink-0 flex flex-col
          bg-navy-900/80 backdrop-blur-xl border-r border-white/8
          transition-all duration-300 z-30
          ${sidebarOpen ? 'w-60' : 'w-[72px]'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400
                          flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/30">
            <Zap size={18} className="text-white" fill="white" />
          </div>
          {sidebarOpen && (
            <div>
              <div className="text-white font-bold text-base leading-none">SmartRelief</div>
              <div className="text-slate-500 text-[10px] mt-0.5 font-medium tracking-wide uppercase">Distribution v2</div>
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scroll-area">
          <div className={`text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2 px-1 ${!sidebarOpen && 'hidden'}`}>
            Navigation
          </div>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''} ${!sidebarOpen ? 'justify-center px-2' : ''}`
              }
              title={!sidebarOpen ? label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              <div className={`text-[10px] font-bold uppercase tracking-widest text-slate-600 mt-4 mb-2 px-1 ${!sidebarOpen && 'hidden'}`}>
                Admin
              </div>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''} ${!sidebarOpen ? 'justify-center px-2' : ''}`
                }
                title={!sidebarOpen ? 'Admin Panel' : undefined}
              >
                <ShieldCheck size={18} className="flex-shrink-0" />
                {sidebarOpen && <span>Admin Panel</span>}
              </NavLink>
            </>
          )}
        </nav>

        {/* User section */}
        <div className="border-t border-white/8 p-3">
          <button
            onClick={handleLogout}
            className={`nav-item w-full hover:bg-red-500/15 hover:text-red-400 ${!sidebarOpen ? 'justify-center px-2' : ''}`}
            title={!sidebarOpen ? 'Logout' : undefined}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top Navbar */}
        <header className="flex-shrink-0 flex items-center justify-between
                            px-6 py-3 border-b border-white/8
                            bg-navy-900/60 backdrop-blur-xl z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(p => !p)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/8 transition-colors"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="h-5 w-px bg-white/10" />
            <div className="text-slate-400 text-sm hidden sm:block">
              Smart Relief Distribution System
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/8 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
            </button>

            {/* User pill */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 cursor-default">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400
                              flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {initials}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-slate-200 leading-none">{user?.name}</div>
                <div className="text-[10px] text-slate-500 mt-0.5 capitalize">{user?.role}</div>
              </div>
              <ChevronDown size={14} className="text-slate-500 hidden sm:block" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scroll-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
