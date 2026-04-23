// src/pages/MapView.js
// Interactive map using Leaflet.js + OpenStreetMap (100% free, no API key)
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import API from '../api';
import toast from 'react-hot-toast';
import { MapPin, RefreshCw, Locate, Info } from 'lucide-react';

// Fix Leaflet default icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored icons for each type + status
const makeIcon = (color) =>
  L.divIcon({
    className: '',
    html: `
      <div style="
        width:32px; height:32px; border-radius:50% 50% 50% 0;
        background:${color}; border:3px solid #0f172a;
        transform:rotate(-45deg); box-shadow:0 4px 12px rgba(0,0,0,0.4);
      "></div>`,
    iconSize:   [32, 32],
    iconAnchor: [16, 32],
    popupAnchor:[0, -34],
  });

const icons = {
  food_pending:      makeIcon('#f97316'),
  food_assigned:     makeIcon('#22c55e'),
  water_pending:     makeIcon('#06b6d4'),
  water_assigned:    makeIcon('#22c55e'),
  medicine_pending:  makeIcon('#8b5cf6'),
  medicine_assigned: makeIcon('#22c55e'),
};

const userIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:18px; height:18px; border-radius:50%;
    background:#3b82f6; border:3px solid white;
    box-shadow:0 0 0 4px rgba(59,130,246,0.3);
  "></div>`,
  iconSize:   [18, 18],
  iconAnchor: [9, 9],
});

// Component to fly to a position
function FlyTo({ pos }) {
  const map = useMap();
  useEffect(() => { if (pos) map.flyTo(pos, 13, { duration: 1.5 }); }, [pos, map]);
  return null;
}

export default function MapView() {
  const [requests, setRequests] = useState([]);
  const [userPos,  setUserPos]  = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [locating, setLocating] = useState(false);
  const [filter,   setFilter]   = useState('all');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/requests');
      setRequests(data);
    } catch { toast.error('Failed to load map data'); }
    finally  { setLoading(false); }
  };

  useEffect(() => {
    fetchRequests();
    detectLocation(false); // silent on page load
  }, []);

  const detectLocation = (showToast = true) => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(coords);
        setFlyTarget(coords);
        if (showToast) toast.success('Centered on your location');
        setLocating(false);
      },
      () => {
        if (showToast) toast.error('Location access denied');
        setLocating(false);
      }
    );
  };

  // Only show requests that have lat/lng
  const mappable = requests.filter(r =>
    r.lat && r.lng &&
    (filter === 'all' || r.type === filter || r.status === filter)
  );

  const defaultCenter = userPos || [20.5937, 78.9629]; // India center fallback

  const typeEmoji = { food: '🍱', water: '💧', medicine: '💊' };

  return (
    <div className="p-6 space-y-4 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Map View</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Geographic distribution of relief requests
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter */}
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="select-dark py-2 text-sm w-36"
          >
            <option value="all">All Requests</option>
            <option value="food">Food Only</option>
            <option value="water">Water Only</option>
            <option value="medicine">Medicine Only</option>
            <option value="Pending">Pending Only</option>
            <option value="Assigned">Assigned Only</option>
          </select>

          <button
            onClick={() => detectLocation(true)}
            disabled={locating}
            className="btn-secondary flex items-center gap-2 text-sm py-2"
          >
            <Locate size={14} className={locating ? 'animate-pulse text-cyan-400' : ''} />
            My Location
          </button>

          <button
            onClick={fetchRequests}
            disabled={loading}
            className="btn-secondary flex items-center gap-2 text-sm py-2"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="glass px-4 py-3 flex items-center gap-6 flex-wrap">
        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Legend:</span>
        {[
          { color: '#f97316', label: 'Food (Pending)'     },
          { color: '#06b6d4', label: 'Water (Pending)'    },
          { color: '#8b5cf6', label: 'Medicine (Pending)' },
          { color: '#22c55e', label: 'Any (Assigned)'     },
          { color: '#3b82f6', label: 'Your Location'      },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-slate-400">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
            {label}
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'On Map',    value: mappable.length, color: 'text-orange-400' },
          { label: 'Total',     value: requests.length, color: 'text-slate-300'  },
          { label: 'Pending',   value: requests.filter(r=>r.status==='Pending').length,  color: 'text-amber-400'  },
          { label: 'Assigned',  value: requests.filter(r=>r.status==='Assigned').length, color: 'text-emerald-400'},
        ].map(({ label, value, color }) => (
          <div key={label} className="glass px-4 py-3 text-center">
            <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="glass overflow-hidden" style={{ height: 'calc(100vh - 380px)', minHeight: '400px' }}>
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-slate-500">
              <RefreshCw size={32} className="mx-auto mb-3 animate-spin opacity-40" />
              <p>Loading map data…</p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={defaultCenter}
            zoom={5}
            style={{ height: '100%', width: '100%', background: '#0f172a' }}
          >
            {/* OpenStreetMap dark tile */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
              maxZoom={19}
            />

            {flyTarget && <FlyTo pos={flyTarget} />}

            {/* User location */}
            {userPos && (
              <>
                <Marker position={userPos} icon={userIcon}>
                  <Popup>
                    <div style={{ color: '#e2e8f0', fontFamily: 'DM Sans, sans-serif' }}>
                      <strong>📍 Your Location</strong>
                      <br />
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {userPos[0].toFixed(4)}, {userPos[1].toFixed(4)}
                      </span>
                    </div>
                  </Popup>
                </Marker>
                <Circle
                  center={userPos}
                  radius={5000}
                  pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.08, weight: 1 }}
                />
              </>
            )}

            {/* Request markers */}
            {mappable.map(req => {
              const iconKey = `${req.type}_${req.status}`;
              const icon = icons[iconKey] || icons['food_pending'];
              return (
                <Marker key={req._id} position={[req.lat, req.lng]} icon={icon}>
                  <Popup minWidth={200}>
                    <div style={{ fontFamily: 'DM Sans, sans-serif', color: '#e2e8f0', lineHeight: '1.6' }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>
                        {typeEmoji[req.type]} {req.type.charAt(0).toUpperCase() + req.type.slice(1)} Request
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                        <div>📍 {req.location}</div>
                        <div>📦 Quantity: <strong style={{ color: '#e2e8f0' }}>{req.quantity}</strong></div>
                        <div>👤 {req.userName}</div>
                        <div style={{ marginTop: '6px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '99px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: req.status === 'Assigned' ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)',
                            color: req.status === 'Assigned' ? '#22c55e' : '#f59e0b',
                            border: `1px solid ${req.status === 'Assigned' ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`,
                          }}>
                            {req.status === 'Assigned' ? '✓ Assigned' : '⏳ Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>

      {/* Info note */}
      {mappable.length === 0 && !loading && (
        <div className="glass px-4 py-3 flex items-center gap-2 text-sm text-slate-400">
          <Info size={15} className="text-cyan-400 flex-shrink-0" />
          No requests with location data. Markers appear when users enable geolocation while submitting requests.
        </div>
      )}
    </div>
  );
}
