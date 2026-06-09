# Eventy 🎉

A wedding invitation platform where hosts can create beautiful digital invitations from curated templates and guests can RSVP online — no accounts required.

---

## Features

- 📋 **Invitation Builder** — create and customise invitations from a template library
- 🔗 **Public Invitation Pages** — shareable links guests can open without signing in
- ✉️ **RSVP System** — guests submit attendance responses; hosts see a live summary
- 🗂️ **Template Explorer** — browse free and premium invitation designs

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router, TanStack Query, Zustand |
| Backend | NestJS 11, Prisma 7, PostgreSQL 16 |
| API Style | REST |
| DevOps | Docker, Docker Compose |

---

## Project Structure

```
eventy/
├── nestjs/          # NestJS REST API
│   ├── prisma/      # Prisma schema & migrations
│   └── src/
│       ├── templates/    # Template browsing
│       ├── invitations/  # Invitation CRUD
│       └── rsvp/         # RSVP submissions & summary
├── reactjs/         # React / Vite frontend
├── docker/
│   └── postgres/
│       └── init.sql # Creates the `eventy` schema
├── docker-compose.yml
├── Makefile         # Handy shortcuts
└── .env.example
```

---

## Getting Started with Docker

Docker is the recommended way to run the full stack locally. It spins up PostgreSQL, the NestJS API, and the Vite dev server in one command.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) ≥ 24
- [Docker Compose](https://docs.docker.com/compose/) v2 (included with Docker Desktop)
- `make` (optional, for shortcut commands)

### 1. Clone the repo

```bash
git clone <repo-url>
cd eventy
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Edit .env if you need to change credentials (defaults work out of the box)
```

### 3. Start all services

```bash
make up
# or without make:
docker compose up -d --build
```

On first run, Docker builds the images (~1–2 min). Subsequent starts are instant.

### 4. Run database migrations

```bash
make migrate
# or:
docker compose exec api npx prisma migrate deploy
```

### 5. (Optional) Seed the database

```bash
make seed
# or:
docker compose exec api npx prisma db seed
```

### 6. Open the app

| Service | URL |
|---|---|
| React frontend | http://localhost:5173 |
| NestJS API | http://localhost:3000 |
| PostgreSQL | `localhost:5432` (user: `karim`, db: `mydb`) |

---

## Makefile Reference

```bash
make up          # Build images and start all services (detached)
make down        # Stop and remove containers
make restart     # down + up
make logs        # Tail logs for all services
make logs s=api  # Tail logs for a specific service (api | web | postgres)
make migrate     # Run Prisma migrations inside the API container
make seed        # Run the Prisma seed script
make shell-api   # Open a shell inside the API container
make shell-db    # Open a psql session inside the Postgres container
```

---

## Development (without Docker)

If you prefer running services locally:

**API**
```bash
cd nestjs
npm install
# Set DATABASE_URL in nestjs/.env to point at your local Postgres
npx prisma migrate deploy
npm run start:dev
```

**Frontend**
```bash
cd reactjs
npm install
npm run dev
```

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

This project is in active development. See `.squad/plans/` for current feature stories and implementation plans.
