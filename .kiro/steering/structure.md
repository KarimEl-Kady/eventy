# Project Structure

```
eventy/
├── nestjs/                  # Backend API (NestJS)
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema (models: Template, Invitation, Rsvp)
│   │   ├── migrations/      # Prisma migrations
│   │   └── seed.ts          # Seed data (templates)
│   ├── src/
│   │   ├── main.ts          # App bootstrap
│   │   ├── app.module.ts    # Root module
│   │   ├── prisma/          # PrismaService (shared DB access)
│   │   ├── templates/       # Templates module (controller, service, dto/)
│   │   ├── invitations/     # Invitations module (controller, service, dto/)
│   │   └── rsvp/            # RSVP module (controller, service, dto/)
│   └── test/                # E2e tests
│
├── reactjs/                 # Web frontend (React + Vite)
│   └── src/
│       ├── api/             # API client functions
│       ├── components/      # Reusable UI components
│       ├── pages/           # Page-level components (routed)
│       ├── store/           # Zustand stores
│       └── assets/          # Static assets
│
├── mobile/                  # Mobile app (Expo / React Native)
│   ├── app/                 # File-based routing (expo-router)
│   │   ├── _layout.tsx      # Root layout with QueryClientProvider
│   │   ├── index.tsx        # Home / template explorer
│   │   ├── invitations/     # new.tsx, [id].tsx
│   │   └── public/          # [slug].tsx (public invitation page)
│   └── src/
│       ├── api/             # API client (Axios-based)
│       ├── components/      # UI components (ui/, form/, previews/)
│       ├── features/        # Feature-scoped screens/logic
│       ├── lib/             # Utilities and helpers
│       ├── store/           # Zustand stores
│       ├── theme/           # Design tokens (colors, spacing, typography)
│       └── types/           # Shared TypeScript types
│
├── docker/                  # Dockerfiles and init scripts
├── docs/                    # Architecture documentation
├── docker-compose.yml       # Service orchestration
└── Makefile                 # Developer shortcuts
```

## Conventions

### Backend (NestJS)
- One module per domain entity (templates, invitations, rsvp)
- Each module contains: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/`
- Prisma is wrapped in a shared `PrismaService` via `PrismaModule`
- Database schema uses a dedicated `eventy` PostgreSQL schema

### Web Frontend (React)
- Pages in `src/pages/`, named `{Feature}Page.tsx`
- Routing defined in `App.tsx` using React Router `<Routes>`
- Server state via TanStack Query; client state via Zustand stores in `src/store/`

### Mobile (Expo)
- File-based routing under `app/` (expo-router)
- Source code in `src/` with feature-based organization
- Theme tokens in `src/theme/` — use these for colors, spacing, and typography
- API layer in `src/api/` with Axios client
- Shared types in `src/types/`
