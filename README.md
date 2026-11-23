# MERN Ticketing CRM

A full-stack enterprise-grade Customer Relationship Management (CRM) and ticketing platform built with the MERN stack (MongoDB, Express, React, Node.js). Features role-based access for **Admin**, **Support Staff (Employee)**, and **Customers**, coupled with real-time Socket.io updates, SLA tracking, AI-powered ticket triage, live in-ticket chat, audit logging, and automated CI/CD.

---

## Key Features

- **Role-Based Access Control (RBAC):** Distinct dashboards and access scopes for Admins, Employees, and Customers, secured via HTTP-only JWT refresh cookies and short-lived bearer access tokens.
- **Ticket Lifecycle Management:** Complete CRUD workflows with priority levels (Low, Medium, High), categories (Bug, Billing, Feature Request, Support, Other), status progressions (Open, Running, On Hold, Completed), and screenshot uploads via Multer + Cloudinary.
- **SLA Tracking & Auto-Escalation:** Background cron monitor tracking priority-based deadlines (High: 4h, Medium: 24h, Low: 48h) with automated breach alerts and status auto-escalation.
- **AI Ticket Triage & Urgency Sentiment:** Intelligent NLP heuristic engine predicting ticket category, urgency priority, and customer emotional sentiment (`Frustrated`, `Positive`, `Neutral`), featuring an interactive one-click auto-detect assistant in the ticket creation modal.
- **Real-Time Ticket Discussion / Chat:** Live in-ticket messaging threads between customers and support staff powered by Socket.io room broadcasts with instantaneous cross-party in-app notification alerts.
- **Interactive Audit History Timeline:** Audit log tracking recording ticket creation, assignment changes, status progressions, SLA auto-escalations, and comments with an interactive modal timeline.
- **Data Exporting (CSV):** Role-scoped and filter-preserving CSV ticket data exports conforming to RFC 4180 standards.
- **Interactive Analytics Dashboard:** Real-time metrics, status breakdowns, priority distribution, and weekly trends rendered with Recharts.
- **Full-Text Search, Filtering & Pagination:** High-performance compound indexes supporting multi-term text search, date range selectors, and configurable pagination limits.
- **Automated CI/CD:** GitHub Actions workflow running automated server test suites, client linter, and production build checks on every push and pull request.

---

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide Icons, React Hook Form, Zod, Recharts, Socket.io Client
- **Backend:** Node.js 22, Express 5, Mongoose 9, Socket.io, Multer, Cloudinary, Node-Cron, JWT, BcryptJS
- **Database:** MongoDB & MongoDB Atlas
- **Testing:** Node.js native test runner (`node:test`, `node:assert`), ESLint
- **DevOps & Deployment:** Docker, Docker Compose, GitHub Actions, Vercel/Netlify, Render/Railway

---

## Project Roadmap

- [x] **Phase 0** — GitHub Setup
- [x] **Phase 1** — Project Setup (client + server scaffolding)
- [x] **Phase 2** — Authentication & Role-Based Access
- [x] **Phase 3** — Ticket Management (CRUD)
- [x] **Phase 4** — File Uploads (Cloudinary)
- [x] **Phase 5** — React Frontend & Dashboards
- [x] **Phase 6** — Real-Time Notifications (Socket.io)
- [x] **Phase 7** — Analytics & Reporting Dashboards
- [x] **Phase 8** — Search, Filter & Pagination
- [x] **Phase 9** — Advanced Features (SLA tracking, AI triage, audit logs, chat, exports)
- [x] **Phase 10** — Testing & CI/CD
- [x] **Phase 11** — Deployment Setup & Documentation

---

## Quick Start (Local Development)

### Prerequisites

- [Node.js](https://nodejs.org/) v20 or v22
- [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas connection string
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/sanikakhupire/mern-ticketing-crm.git
cd mern-ticketing-crm
```

### 2. Configure Environment Variables

**Backend (`server/.env`):**
```bash
cp server/.env.example server/.env
```
Fill in the values in `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/mern-ticketing-crm
CLIENT_URL=http://localhost:5173
JWT_ACCESS_SECRET=your_jwt_access_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

**Frontend (`client/.env`):**
```bash
cp client/.env.example client/.env
```
Ensure the API endpoints are configured:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Install Dependencies and Run

**Start Backend Server:**
```bash
cd server
npm install
npm run dev
# Server listens on http://localhost:5000
```

**Start Frontend Application (in a new terminal):**
```bash
cd client
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

---

## Running Automated Tests

### Backend Test Suite
The server utilizes the native Node.js test runner (`node:test`) with in-memory request processing and unit tests for AI triage, audit logging, and health routes:
```bash
cd server
npm test
```

### Frontend Validation & Linting
```bash
cd client
npm run lint    # ESLint validation
npm test        # Form schema unit tests
npm run build   # Production Vite compilation
```

---

## Docker Deployment (Full-Stack Containerization)

To spin up the entire platform (MongoDB, Backend, and Frontend) locally with Docker Compose:

```bash
docker compose up --build
```
- Frontend: `http://localhost`
- Backend API: `http://localhost:5000/api`
- MongoDB: `localhost:27017`

---

## Production Cloud Deployment Guides

### 1. Database (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a Database User with read/write privileges.
3. Whitelist Network Access (`0.0.0.0/0` for cloud host connectivity).
4. Obtain your connection string: `mongodb+srv://<user>:<password>@cluster.mongodb.net/mern-crm?retryWrites=true&w=majority`.

### 2. Backend (Render / Railway)
- **Render:**
  - Create a new **Web Service** connected to your repository.
  - Set Root Directory: `server`.
  - Build Command: `npm install`.
  - Start Command: `npm start`.
  - Add Environment Variables matching `server/.env.example`.
  - Alternatively, use the included [`render.yaml`](./render.yaml) blueprint.

### 3. Frontend (Vercel / Netlify)
- **Vercel:**
  - Import your repository into [Vercel](https://vercel.com).
  - Set Root Directory: `client`.
  - Framework Preset: `Vite`.
  - Environment Variables:
    - `VITE_API_URL`: `https://your-backend-service.onrender.com/api`
    - `VITE_SOCKET_URL`: `https://your-backend-service.onrender.com`
  - Client-side routing is handled by the included [`client/vercel.json`](./client/vercel.json).
- **Netlify:**
  - Build command: `npm run build`, Publish directory: `dist`.
  - Client-side routing is pre-configured via [`client/public/_redirects`](./client/public/_redirects).

---

## License

This project is licensed under the [MIT License](LICENSE).
