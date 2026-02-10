# Survey Monetization System

## Project Overview

A complete survey testing system with password-based access control. Users enter a password to access and complete surveys, receiving personalized results based on their answers.

**Current Version:** MVP v1.0
**Status:** Completed
**Date:** 2026-02-04

## Core Features

- Password verification with expiration (12-hour validity)
- Survey workflow with progress tracking
- Result calculation and display (voting and scoring modes)
- Full CRUD for survey questions
- Password generation and management
- Basic data statistics
- Answer records查询

## Tech Stack

### Backend
- Node.js + NestJS
- MySQL 8.0+
- TypeORM
- class-validator

### Frontend
- H5 User Side: Vue 3 + Vite + Vant UI
- Admin Panel: Vue 3 + Vite + Element Plus
- State Management: Pinia
- Router: Vue Router
- HTTP: Axios

## Project Structure

```
survey-monetization/
├── backend/              # NestJS backend
│   ├── src/
│   │   ├── entities/    # Data entities
│   │   ├── modules/     # Business modules
│   │   ├── common/      # Shared components
│   │   └── main.ts      # Entry point
│   └── .env.example     # Environment config
│
├── h5/                  # H5 user interface
│   ├── src/
│   │   ├── views/       # Page components
│   │   ├── stores/      # State management
│   │   ├── router/      # Router config
│   │   └── api/         # API client
│
├── admin/               # Admin panel
│   ├── src/
│   │   ├── views/       # Page components
│   │   ├── stores/      # State management
│   │   ├── router/      # Router config
│   │   └── api/         # API client
│
└── database/
    └── schema.sql       # Database schema (8 tables)
```

## Quick Start

### Requirements

- Node.js >= 18.0.0
- MySQL >= 8.0
- npm or pnpm

### 1. Clone & Install

```bash
git clone https://github.com/parilion/survey-monetization.git
cd survey-monetization
```

### 2. Database Setup

```bash
mysql -u root -p < database/schema.sql
```

### 3. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run start:dev
```

Backend runs at: http://localhost:3000

### 4. H5 Frontend

```bash
cd h5
npm install
npm run dev
```

H5 runs at: http://localhost:5173

### 5. Admin Panel

```bash
cd admin
npm install
npm run dev
```

Admin panel runs at: http://localhost:5174

**Default Admin:**
- Username: `admin`
- Password: `admin123`

## API Documentation

See: [backend/API.md](./backend/API.md)

## License

MIT
