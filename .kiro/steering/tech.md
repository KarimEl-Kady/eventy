# Tech Stack & Build System

## Backend — NestJS (nestjs/)
- **Runtime**: Node.js + TypeScript
- **Framework**: NestJS 11
- **ORM**: Prisma 7 with PostgreSQL 16
- **Validation**: class-validator + class-transformer
- **Rate Limiting**: @nestjs/throttler
- **Testing**: Jest + ts-jest, Supertest for e2e
- **Linting**: ESLint + Prettier

### Backend Commands (run inside `nestjs/` or via Docker)
```bash
npm run start:dev      # Dev server with watch
npm run build          # Compile to dist/
npm run lint           # ESLint with auto-fix
npm run format         # Prettier
npm run test           # Unit tests
npm run test:e2e       # End-to-end tests
npx prisma migrate dev # Create/apply migrations
npx prisma db seed     # Seed database
npx prisma generate    # Regenerate Prisma client
```

## Web Frontend — React (reactjs/)
- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8
- **Routing**: React Router 7
- **State**: Zustand 5 (client state), TanStack Query 5 (server state)
- **Linting**: ESLint

### Web Frontend Commands (run inside `reactjs/`)
```bash
npm run dev       # Vite dev server (port 5173)
npm run build     # Type-check + production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

## Mobile — Expo / React Native (mobile/)
- **Framework**: Expo SDK 54, React Native 0.77
- **Routing**: expo-router 4 (file-based)
- **State**: Zustand 5 (client state), TanStack Query 5 (server state)
- **HTTP**: Axios
- **Language**: TypeScript

### Mobile Commands (run inside `mobile/`)
```bash
npm start           # Expo dev server
npm run web         # Web target
npm run android     # Android target
npm run ios         # iOS target
```

## Infrastructure
- **Orchestration**: Docker Compose
- **Database**: PostgreSQL 16 (Alpine) — port 5432
- **API**: port 3000
- **Web**: port 5173

### Docker / Makefile Commands (run from repo root)
```bash
make up         # Build & start all services
make down       # Stop containers
make restart    # down + up
make logs       # Tail all logs (or `make logs s=api`)
make migrate    # Run Prisma migrations in API container
make seed       # Run Prisma seed in API container
make shell-api  # Shell into API container
make shell-db   # psql session
```

## API Style
- REST API
- Base URL: http://localhost:3000
- No authentication for MVP (anonymous invitations)
