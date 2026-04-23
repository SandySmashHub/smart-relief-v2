# 🛟 Smart Relief Distribution System v2
### Production-Grade MERN Stack Dashboard

A full-screen, dark-themed, glassmorphism SaaS dashboard for matching relief supply (food, water, medicine) with disaster victims — built with React + Tailwind CSS + Node.js + MongoDB.

---

## 🖥️ UI Preview

- **Full-screen layout**: Fixed sidebar + top navbar + scrollable content
- **Dark theme**: Deep navy (`#0a1128`) with mesh gradients
- **Glassmorphism cards**: Blur + transparency on all panels
- **Animated**: Fade-up entry, hover lifts, progress bars
- **Map View**: Leaflet.js + CARTO dark tiles (no API key needed)
- **Toast notifications**: Real-time feedback on all actions

---

## 📁 Folder Structure

```
relief-v2/
├── backend/
│   ├── controllers/
│   │   ├── authController.js       # register, login, getMe
│   │   ├── requestController.js    # create, list, assign, auto-match
│   │   ├── resourceController.js   # add, list, delete
│   │   └── statsController.js      # dashboard stats
│   ├── models/
│   │   ├── User.js                 # name, email, password (hashed), role
│   │   ├── Request.js              # location, type, qty, status, lat, lng
│   │   └── Resource.js             # location, type, qty
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── requestRoutes.js
│   │   ├── resourceRoutes.js
│   │   └── statsRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js       # protect + adminOnly JWT guards
│   ├── server.js
│   ├── seedAdmin.js
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.js      # global auth state
    │   ├── components/
    │   │   ├── AppShell.js         # full-screen layout (sidebar + topbar)
    │   │   ├── StatCard.js         # animated stat cards
    │   │   └── RequestRow.js       # reusable table row
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Dashboard.js        # stats + recent requests + breakdown
    │   │   ├── Requests.js         # submit form + search/filter list
    │   │   ├── MapView.js          # Leaflet map with markers + popups
    │   │   └── AdminPanel.js       # add resources + assign + auto-match
    │   ├── api.js                  # axios instance with JWT interceptor
    │   ├── App.js                  # routes + protected route guards
    │   ├── index.js
    │   └── index.css               # Tailwind + custom design system
    ├── tailwind.config.js
    └── package.json
```

---

## ⚙️ Prerequisites

| Tool        | Version      | Check             |
|-------------|--------------|-------------------|
| Node.js     | v16+         | `node -v`         |
| npm         | v8+          | `npm -v`          |
| MongoDB     | v5+          | `mongod --version`|

**Start MongoDB first:**
- Windows: `mongod` or start from Services
- Mac: `brew services start mongodb-community`
- Linux: `sudo systemctl start mongod`

---

## 🚀 Installation & Run

### Step 1 — Backend

```bash
cd relief-v2/backend
npm install
node seedAdmin.js          # Creates admin@relief.com / admin123
npm run dev                # Starts at http://localhost:5000
```

Expected output:
```
✅ MongoDB connected
🚀 Server → http://localhost:5000
```

### Step 2 — Frontend (new terminal)

```bash
cd relief-v2/frontend
npm install
npm start                  # Opens http://localhost:3000
```

---

## 🔑 Demo Credentials

| Role  | Email              | Password |
|-------|--------------------|----------|
| Admin | admin@relief.com   | admin123 |
| User  | Register new account | Your choice |

---

## 📡 API Reference

| Method | Endpoint                        | Auth     | Description              |
|--------|---------------------------------|----------|--------------------------|
| POST   | `/api/auth/register`            | Public   | Create account           |
| POST   | `/api/auth/login`               | Public   | Login → JWT token        |
| GET    | `/api/auth/me`                  | User     | Get current user         |
| POST   | `/api/requests`                 | User     | Submit help request      |
| GET    | `/api/requests`                 | User     | Get requests (filtered)  |
| POST   | `/api/requests/assign`          | Admin    | Assign resource to req   |
| POST   | `/api/requests/auto-match`      | Admin    | Auto-match all pending   |
| POST   | `/api/resources`                | Admin    | Add resource             |
| GET    | `/api/resources`                | Admin    | List resources           |
| DELETE | `/api/resources/:id`            | Admin    | Remove resource          |
| GET    | `/api/stats`                    | Admin    | Dashboard statistics     |

Query params for GET `/api/requests`: `?type=food&status=Pending&search=Mumbai`

---

## 🗺️ Map Feature

- Uses **Leaflet.js** + **CARTO Dark Tiles** (OpenStreetMap data) — **zero API key needed**
- Markers appear when users enable browser geolocation while submitting requests
- Color-coded: orange=food, cyan=water, violet=medicine, green=assigned
- Click any marker for a popup with full request details

---

## ⚡ Smart Matching Logic

```
Admin clicks "Auto-Match All":
  For each PENDING request:
    Find resource WHERE:
      resource.type === request.type AND
      resource.quantity >= request.quantity
    If found:
      resource.quantity -= request.quantity   ← deduct
      request.status = "Assigned"             ← update
```

Or assign manually per-row in the Admin Panel.

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| `MongoDB connection error` | Run `mongod` first |
| `Module not found: leaflet` | Run `npm install` in frontend folder |
| Map tiles not loading | Check internet connection (loads from CDN) |
| Markers not showing on map | Enable geolocation when submitting requests |
| 401 Unauthorized | Token expired — log out and log in again |
| Port 5000 in use | Change `PORT` in backend `.env` |

---

## 🎨 Design System

All Tailwind utilities are in `src/index.css`:

| Class | Usage |
|-------|-------|
| `.glass` | Glassmorphism card (blur + border) |
| `.btn-primary` | Orange gradient button |
| `.btn-secondary` | Ghost button |
| `.btn-success` | Green gradient button |
| `.input-dark` | Dark themed input |
| `.badge-pending` | Amber status badge |
| `.badge-assigned` | Green status badge |
| `.nav-item` | Sidebar navigation link |
| `.bg-mesh` | Radial gradient background |
| `.text-gradient` | Orange-to-amber text gradient |

---

## 📝 Technologies Used

| Layer | Stack |
|-------|-------|
| Frontend | React 18, React Router v6 |
| Styling | Tailwind CSS with custom design tokens |
| Icons | Lucide React |
| Map | Leaflet.js + react-leaflet + CARTO tiles |
| Notifications | react-hot-toast |
| HTTP | Axios with JWT interceptor |
| Backend | Node.js, Express.js |
| Validation | express-validator |
| Auth | JWT + bcryptjs |
| Database | MongoDB + Mongoose |
