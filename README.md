# 🌾 Sastha Appalam ERP

Full-stack ERP for Sastha Appalam food manufacturing.

## 🚀 Setup (5 minutes)

### 1. Install dependencies

Open VS Code → Terminal → run:

```bash
cd backend
npm install
```

Open another terminal → run:

```bash
cd frontend
npm install
```

### 2. Start Backend

```bash
cd backend
npm run dev
```

You'll see:
```
🌾 Sastha Appalam ERP Backend running on http://localhost:5000
```

### 3. Start Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

Open browser: **http://localhost:3000**

---

## 🔑 Login credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@sastha.com | admin123 |
| Manager | manager@sastha.com | manager123 |
| Supervisor | supervisor@sastha.com | super123 |
| Client | client@sastha.com | client123 |

---

## 📦 Features

- ✅ Real JWT authentication
- ✅ SQLite database (auto-created on first run)
- ✅ Role-based access (Admin/Manager/Supervisor/Client)
- ✅ Full CRUD: Batches, Deliveries, Inventory, Wastage, Employees, Approvals
- ✅ Live production dashboard with real-time clock
- ✅ Neomorphism design (soft shadow UI)
- ✅ Mobile responsive

## 🏗️ Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Auth**: JWT + bcrypt
