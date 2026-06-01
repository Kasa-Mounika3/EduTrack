# 🎓 EduTrack – Level 3: Real-Time MERN SaaS App (Final Build)

Welcome to the **Level 3** (Final Advanced Level) of EduTrack! This module takes the multi-role layout established in Level 2 and scales it into a production-ready, highly interactive MERN SaaS application. It introduces real-time WebSockets, Apollo GraphQL API services, and a completely polished user interface with modal forms and cascading selectors.

---

## 🚀 Live Production URL Directory

The application is deployed across high-performance containers and static networks:

* **🚀 Deployed Frontend (SPA)**: [https://edutrackf.onrender.com](https://edutrackf.onrender.com)
* **🔌 Deployed Backend API**: [https://edutrack-c38t.onrender.com](https://edutrack-c38t.onrender.com)
* **📊 Deployed GraphQL Server**: [https://edutrack-c38t.onrender.com/graphql](https://edutrack-c38t.onrender.com/graphql)
* **🛠️ Deployed REST base**: [https://edutrack-c38t.onrender.com/api](https://edutrack-c38t.onrender.com/api)

---

## 🌟 Advanced Level 3 Enhancements

### 1. Dual API Capability
The server exposes a **REST API** under `/api/*` for compatibility and standard HTTP CRUD validation, alongside a high-performance **Apollo GraphQL API** under `/graphql` resolving schemas for students, courses, assignments, and teachers.

### 2. Real-Time Socket.io Gateway
A robust WebSocket layer provides instant system synchronization:
- **Instant Messaging**: Seamless school-wide user chat with real-time delivery.
- **Dynamic Announcements**: System broadcasts appear instantly across active user dashboards.
- **Smart Notification Indicators**: Dynamic, unread badges that increment without requiring page reloads.

### 3. Refined UX & Form Modals (Zero Alert/Prompt Boxes)
All old browser-native `alert()` or `prompt()` dialogues have been completely removed and replaced with a modern component system:
- **Add & Edit Teacher Modals**: Proper React-stateful modal dialogs that fully support uploading profile photos, adding multiple sections, selecting departments, and inputting fields (experience, phone, etc.).
- **Cascading Dropdowns**: All forms dynamically fetch Departments, Sections, and Subjects from the backend in real-time. Dropdowns populate cascading data immediately (e.g. creating a department updates the department selector dynamically across subjects and teachers).
- **Graceful States**: Elegant skeleton loaders, empty-state placeholders, smooth hover actions, and toast success indicators.

---

## 📁 Level 3 File Structure

```txt
Level-3/
├── client/              # React SPA (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/  # Layout, Modals, Skeleton Loaders, Chat Panels
│   │   ├── context/     # Auth, Socket, and Theme Providers
│   │   ├── pages/       # Dashboards, Teachers, Students, Marks, Attendance, Reports
│   │   ├── services/    # Axios client, Apollo GraphQL client, Socket listeners
│   │   └── index.css    # Typography, glassmorphism UI, light/dark themes
│   ├── .env.example     # Client local environment configuration
│   └── package.json     # Client package modules
└── server/              # Hybrid Node.js/Express + GraphQL Server
    ├── config/          # DB connections, Socket setup, Apollo server configuration
    ├── controllers/     # REST request controllers
    ├── models/          # Shared Mongoose models (MongoDB 'edutrack')
    ├── schema/          # GraphQL typedefs and resolvers
    ├── sockets/         # Socket event triggers and connection handlers
    └── server.js        # Hybrid REST/GraphQL/Socket startup core
```

---

## ⚙️ Local Setup & Run Guide

### 1. Configure the Server
Navigate to the server directory, install node modules, configure your `.env` variables, and start development:

```bash
cd Level-3/server
copy .env.example .env
npm install
npm run dev
```

#### Server environment file (`server/.env`):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/edutrack
JWT_SECRET=your_long_secure_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 2. Configure the Client
Navigate to the client directory, install packages, establish your `.env` connection, and start Vite:

```bash
cd Level-3/client
copy .env.example .env
npm install
npm run dev
```

#### Client environment file (`client/.env`):
- **For Local Testing**:
  ```env
  VITE_API_BASE_URL=http://localhost:5000/api
  ```
- **For Production Production**:
  ```env
  VITE_API_BASE_URL=https://edutrack-c38t.onrender.com/api
  ```

Open your browser and navigate to `http://localhost:5173`.

---

## 🧪 Interactive Verification Guide

1. **Verify Live Sync**: Open `http://localhost:5173` in two different browser windows (e.g. Chrome and Firefox) logged in under two different accounts.
2. **Real-time Messaging**: Open `/messages` in both windows. Send a message from Account A and watch it appear instantaneously in Account B's viewport.
3. **Modal Operation**: Navigate to the **Teachers** directory as Admin. Click **Add Teacher**. Confirm a modal overlay opens. Input details, assign sections, and click Save. The listing will update immediately in the grid without reload.
4. **GraphQL Verification**: Navigate to `https://edutrack-c38t.onrender.com/graphql` to open the Apollo GraphQL sandbox. Run queries against student records and courses.
