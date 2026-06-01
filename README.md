# 🎓 EduTrack – Smart Student Management System

EduTrack is an enterprise-ready, multi-level progressive academic platform designed to streamline operations for school administrators, teachers, parents, and students. The project is built sequentially across three distinct levels, scaling from a lightweight REST API foundation to a production-grade MERN SaaS application featuring JWT authentication, Apollo GraphQL integration, real-time Socket.io communication, and comprehensive analytics.

---

## 🌟 Architecture & Core Concept

EduTrack is designed as a learning and deployment showcase. All three levels are built on a **single, shared database architecture**. They connect to the exact same MongoDB Atlas database (`edutrack`), allowing academic records, user accounts, and structures to persist and seamlessly evolve as you progress through each level.

```
                  ┌───────────────────────────────────────────────┐
                  │          Shared MongoDB Atlas ("edutrack")     │
                  └───────┬────────────────┬────────────────┬─────┘
                          │                │                │
                          ▼                ▼                ▼
                     ┌─────────┐      ┌─────────┐      ┌─────────┐
                     │ Level 1 │      │ Level 2 │      │ Level 3 │
                     │ (REST)  │      │ (React/ │      │ (REST/  │
                     │         │      │  JWT)   │      │GraphQL/ │
                     │         │      │         │      │Sockets) │
                     └─────────┘      └─────────┘      └─────────┘
```

---

## 📁 Project Directory Structure

```txt
EduTrack/
├── level-1/            # Level 1: Foundation (Admin Student CRUD)
│   ├── backend/        # Node.js + Express + MongoDB Server
│   ├── frontend/       # Vanilla HTML5 + CSS3 + Javascript (Fetch API)
│   └── README.md       # Level 1 Documentation
├── Level-2/            # Level 2: Intermediate (Multi-role Academic Portal)
│   ├── server/         # Node.js + Express + JWT auth Server
│   ├── client/         # React SPA + Vite + Tailwind CSS
│   └── README.md       # Level 2 Documentation
├── Level-3/            # Level 3: Advanced (Real-time MERN SaaS Application)
│   ├── server/         # Express + Apollo GraphQL + Socket.io Server
│   ├── client/         # React SPA + Apollo Client + Socket.io Client
│   └── README.md       # Level 3 Documentation
└── README.md           # Root Project Documentation (This File)
```

---

## 🚀 Progressive Levels Overview

### 🏛️ Level 1 – Foundation (REST CRUD API)
* **Objective**: Build the core student database schema and basic endpoints.
* **Scope**: Admin-only workspace with no authentication, no login credentials, and no role restrictions.
* **Technology Stack**:
  * **Backend**: Node.js, Express.js, MongoDB Atlas, Mongoose
  * **Frontend**: Plain HTML5, Vanilla CSS3, Javascript (Fetch API)
* **Features**: Add student, view students, edit student profiles, and delete student records using traditional REST APIs.

### 🔐 Level 2 – Intermediate (React & JWT Auth)
* **Objective**: Introduce dynamic user roles, robust security, and deep academic relationships.
* **Scope**: Implements secure Login/Logout and maps permissions across 4 roles: Admin, Teacher, Student, and Parent.
* **Technology Stack**:
  * **Backend**: Node.js, Express.js, JWT, Bcrypt, MongoDB Atlas
  * **Frontend**: React (Vite), React Router DOM, Axios, Context API, Tailwind CSS
* **Features**: Dynamic dashboards, Admin management of academic models (Departments, Sections, Subjects), Teacher controls for marking attendance and grade sheets, Student views, Parent child-performance monitoring.

### ⚡ Level 3 – Advanced (SaaS with GraphQL & Real-Time)
* **Objective**: Scale Level 2 into a high-performance, real-time MERN application.
* **Scope**: Combines robust REST endpoints with an Apollo GraphQL API layer and Socket.io for instantaneous updates.
* **Technology Stack**:
  * **Backend**: Node.js, Express.js, Apollo Server (GraphQL), Socket.io, JWT, Mongoose
  * **Frontend**: React (Vite), Apollo Client, Socket.io Client, Tailwind CSS
* **Features**: Live notifications/messages, interactive Add/Edit modals (removing browser prompts), dynamic and cascading department/section/subject dropdown lists, advanced dashboard analytics, profile photo uploads, and light/dark theme toggle.

---

## 🌐 Live Production Deployments

The final advanced application is fully deployed and available online:

* **🚀 Live Frontend App**: [https://edutrackf.onrender.com](https://edutrackf.onrender.com)
* **🔌 Live API Server**: [https://edutrack-c38t.onrender.com](https://edutrack-c38t.onrender.com)
* **📊 GraphQL Endpoint**: [https://edutrack-c38t.onrender.com/graphql](https://edutrack-c38t.onrender.com/graphql)
* **🛠️ REST Endpoint**: [https://edutrack-c38t.onrender.com/api](https://edutrack-c38t.onrender.com/api)

---

## ⚙️ Quick Start Guide

### Prerequisites
- Node.js installed (v16+)
- A MongoDB Atlas Cluster URL

### Run Level 3 (Final App) Locally

#### 1. Setup the Server
```bash
cd Level-3/server
copy .env.example .env
npm install
npm run dev
```

Update the `Level-3/server/.env` file:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/edutrack
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

#### 2. Setup the Client
```bash
cd Level-3/client
copy .env.example .env
npm install
npm run dev
```

Update the `Level-3/client/.env` file:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Open your browser and navigate to `http://localhost:5173`.

---

## 🛠️ API Architecture & Shared Data

EduTrack provides high flexibility. The backend runs REST endpoints alongside the GraphQL endpoint seamlessly:

- **REST Endpoints**: Accessible at `/api/*` for standard CRUD actions and external tool testing.
- **GraphQL Endpoint**: Accessible at `/graphql` using the exact same database models, JWT protection, and validation rules.
- **Real-Time Gateway**: Powered by Socket.io, broadcasting state changes (announcements, academic notifications, or message alerts) instantly.

> [!TIP]
> Ensure all local client setups use `http://localhost:5000/api` as the `VITE_API_BASE_URL` and production environments use `https://edutrack-c38t.onrender.com/api`.
