# Eventy 🎉

A wedding invitation platform where couples create beautiful digital invitations from curated templates and guests can RSVP online — no accounts required.

---

## Features

- 📋 **Invitation Builder** — create and customise invitations from a template library
- 🔗 **Public Invitation Pages** — shareable links guests can open without signing in
- ✉️ **RSVP System** — guests submit attendance responses; couples see a live summary
- 🗂️ **Template Explorer** — browse free and premium invitation designs
- 📱 **Mobile App** — full-featured React Native app with Expo

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend (Web) | React 19, TypeScript, Vite, React Router, TanStack Query, Zustand |
| Frontend (Mobile) | React Native, Expo, Expo Router, TanStack Query, Zustand, Axios |
| Backend | NestJS 11, Prisma 7, PostgreSQL 16 |
| API Style | REST |
| DevOps | Docker, Docker Compose |

---

## Project Structure

```
eventy/
├── nestjs/          # NestJS REST API
│   ├── prisma/      # Prisma schema, migrations & seed
│   └── src/
│       ├── templates/    # Template browsing
│       ├── invitations/  # Invitation CRUD & publish
│       └── rsvp/         # RSVP submissions & listing
├── reactjs/         # React / Vite web frontend
├── mobile/          # React Native / Expo mobile app
│   ├── app/         # Expo Router screens
│   │   ├── index.tsx             # Template Explorer
│   │   ├── invitations/new.tsx   # Create Invitation
│   │   ├── invitations/[id].tsx  # Preview, Publish & RSVP list
│   │   └── public/[slug].tsx     # Guest view + RSVP form
│   └── src/
│       ├── api/          # Axios API client
│       ├── store/        # Zustand stores
│       ├── theme/        # Colors & styling
│       └── types/        # Shared TypeScript types
├── docker/
│   ├── api/         # API Dockerfile
│   ├── web/         # Web Dockerfile
│   └── postgres/    # DB init script
├── scripts/         # Utility scripts
├── docker-compose.yml
├── package.json     # Root scripts for running all services
└── .env             # Default environment variables
```

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 22
- [Docker](https://docs.docker.com/get-docker/) ≥ 24
- [Expo Go](https://expo.dev/go) app on your phone (for mobile testing)

### 1. Clone the repo

```bash
git clone https://github.com/KarimEl-Kady/eventy.git
cd eventy
```

### 2. Install root dependencies

```bash
npm install
```

### 3. Run everything

```bash
npm run dev
```

This starts:
- **Docker** (PostgreSQL + NestJS API + React Web)
- **Expo** (Mobile app dev server)

### 4. Open the apps

| Service | URL |
|---|---|
| React Web | http://localhost:5173 |
| Mobile (browser) | http://localhost:8081 |
| Mobile (phone) | Scan QR code in Expo terminal |
| NestJS API | http://localhost:3000 |
| PostgreSQL | localhost:5432 |

---

## Available Scripts

Run from the project root:

| Command | Description |
|---|---|
| `npm run dev` | Start everything (Docker + Expo) |
| `npm run back` | Backend only (NestJS) |
| `npm run front` | Web frontend only (Vite) |
| `npm run mobile` | Mobile app only (Expo) |
| `npm run front:back` | Web + Backend |
| `npm run mobile:back` | Mobile + Backend |
| `npm run all` | All three without Docker (needs local DB) |
| `npm run docker:up` | Docker only (DB + API + Web) |
| `npm run docker:down` | Stop Docker containers |
| `npm run install:all` | Install deps in all sub-projects |
| `npm run info` | Show running service URLs |

---

## Docker Setup

Docker handles PostgreSQL, the API, and the web frontend. Migrations and seed data run automatically on startup.

```bash
# Start all containers
docker compose up --build

# Stop
docker compose down
```

Default credentials (no `.env` needed):

| Setting | Value |
|---|---|
| DB User | `postgres` |
| DB Password | `postgres` |
| DB Name | `eventy` |
| DB Schema | `eventy` |

---

## Mobile App

The mobile app runs on Android and iOS via Expo Go.

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone. The app connects to the API at your machine's LAN IP (configured in `mobile/src/api/client.ts`).

### Mobile Screens

1. **Template Explorer** — browse templates with category filtering
2. **Create Invitation** — form to enter wedding details
3. **Invitation Detail** — preview, publish, share link, view RSVPs
4. **Public Invitation** — guest view with RSVP form

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/templates` | List all templates |
| GET | `/api/templates/:slug` | Get template by slug |
| POST | `/api/invitations` | Create draft invitation |
| GET | `/api/invitations/:id` | Get invitation by ID |
| PATCH | `/api/invitations/:id/publish` | Publish invitation |
| GET | `/api/invitations/public/:slug` | Get public invitation |
| POST | `/api/rsvps` | Submit RSVP |
| GET | `/api/invitations/:id/rsvps` | List RSVPs for invitation |

---

## Database Schema

```
eventy (schema)
├── Template     — invitation design templates
├── Invitation   — created invitations (linked to a template)
└── Rsvp         — guest RSVP responses (linked to an invitation)
```

---

## Contributing

This project is in active development. See `.squad/plans/` for feature stories and implementation plans.
