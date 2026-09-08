# Meru Web Platform

A modern full-stack application for the Meru platform, cleanly organized into dedicated **frontend** and **backend** services.

## Project Structure

```text
meru/
├── frontend/                 # Next.js 16 Client Web Application
│   ├── src/
│   │   ├── app/              # Next.js App Router (Public & Admin UI)
│   │   └── components/       # UI Components (3D Globe, Navigation, Admin)
│   ├── public/               # Public assets (Logos, SVGs)
│   ├── next.config.ts        # Reverse proxy rewrites for /api and /uploads
│   ├── package.json
│   └── .env.example
│
├── backend/                  # Standalone Express + TypeScript API Server
│   ├── src/
│   │   ├── routes/           # REST API routes (Auth, Programs, Media, etc.)
│   │   ├── middleware/       # Session auth & file upload middleware
│   │   ├── lib/              # Auth, Email, Storage, DB handlers
│   │   └── server.ts         # Express server entry point (Port 5000)
│   ├── prisma/               # Prisma ORM schema, migrations, seed
│   ├── data/                 # JSON data store
│   ├── public/uploads/       # Uploaded files & media
│   ├── package.json
│   └── .env.example
│
├── package.json              # Root workspace manager
└── README.md
```

## Quick Start

### 1. Install Dependencies
Run from the root directory to install all dependencies across workspace, backend, and frontend:
```bash
npm run install:all
```

### 2. Set Up Environment Variables
- **Backend:** Copy `backend/.env.example` to `backend/.env`
- **Frontend:** Copy `frontend/.env.example` to `frontend/.env.local`

### 3. Generate Database Client & Seed
```bash
npm run prisma:generate
npm run prisma:seed
```

### 4. Start Development Servers
To run both the backend (port 5000) and frontend (port 3000) simultaneously:
```bash
npm run dev
```

Or run them individually in separate terminals:
```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend
```

## URLs
- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)
- **Backend Healthcheck:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Admin Portal:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
