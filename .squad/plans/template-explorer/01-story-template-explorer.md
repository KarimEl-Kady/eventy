# Story 01 — Template Explorer

## Prerequisites

None. This is the first story in the `template-explorer` feature and has no upstream story dependencies. Prisma and React Router are not yet installed — this story bootstraps both.

---

## Story Goal

A visitor can open the app, browse all available wedding invitation templates displayed in a responsive grid, see each template's name, thumbnail, and category, open a full-screen preview modal for any template, select a template, and have that selection persisted in Zustand store so the subsequent invitation-creation flow can read it.

---

## Context — Read These Files First

1. `docs/architecture.md` — stack overview: NestJS + Prisma + PostgreSQL backend, React + Vite + TanStack Query + Zustand frontend.
2. `nestjs/src/app.module.ts` — root module; add `TemplatesModule` here.
3. `nestjs/src/main.ts` — entry point; note port (`3000`) and add CORS enable call.
4. `nestjs/package.json` — confirm `@prisma/client` and `prisma` are **not** yet installed; install them as part of this story.
5. `reactjs/package.json` — confirm `react-router-dom`, `@tanstack/react-query`, and `zustand` are **not** yet installed; install them as part of this story.
6. `reactjs/src/App.tsx` — current placeholder app; replace routing setup here.
7. `reactjs/src/main.tsx` — wrap app with `QueryClientProvider` here.

---

## Backend Tasks

### 1 — Install and configure Prisma

**File:** `nestjs/package.json` (via install commands — do not edit directly)

Run inside `nestjs/`:
```bash
npm install @prisma/client
npm install --save-dev prisma
npx prisma init --datasource-provider postgresql
```

This creates `nestjs/prisma/schema.prisma` and adds `DATABASE_URL` to `.env`.

---

### 2 — Define the `Template` model

**File:** `nestjs/prisma/schema.prisma`

Add the model after the `datasource` and `generator` blocks:

```prisma
model Template {
  id           String  @id @default(uuid())
  name         String
  slug         String  @unique
  thumbnail    String
  category     String
  previewImage String
  isPremium    Boolean @default(false)
}
```

Run migration:
```bash
cd nestjs
npx prisma migrate dev --name add_template
npx prisma generate
```

---

### 3 — Seed templates

**Create file:** `nestjs/prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const templates = [
    {
      name: 'Garden Romance',
      slug: 'garden-romance',
      thumbnail: 'https://placehold.co/400x300/d4a7b0/ffffff?text=Garden+Romance',
      category: 'Floral',
      previewImage: 'https://placehold.co/800x600/d4a7b0/ffffff?text=Garden+Romance+Preview',
      isPremium: false,
    },
    {
      name: 'Midnight Elegance',
      slug: 'midnight-elegance',
      thumbnail: 'https://placehold.co/400x300/1a1a2e/ffffff?text=Midnight+Elegance',
      category: 'Modern',
      previewImage: 'https://placehold.co/800x600/1a1a2e/ffffff?text=Midnight+Elegance+Preview',
      isPremium: true,
    },
    {
      name: 'Rustic Charm',
      slug: 'rustic-charm',
      thumbnail: 'https://placehold.co/400x300/8b6f47/ffffff?text=Rustic+Charm',
      category: 'Rustic',
      previewImage: 'https://placehold.co/800x600/8b6f47/ffffff?text=Rustic+Charm+Preview',
      isPremium: false,
    },
    {
      name: 'Beach Bliss',
      slug: 'beach-bliss',
      thumbnail: 'https://placehold.co/400x300/5bc0eb/ffffff?text=Beach+Bliss',
      category: 'Beach',
      previewImage: 'https://placehold.co/800x600/5bc0eb/ffffff?text=Beach+Bliss+Preview',
      isPremium: false,
    },
    {
      name: 'Classic White',
      slug: 'classic-white',
      thumbnail: 'https://placehold.co/400x300/f5f5f5/333333?text=Classic+White',
      category: 'Classic',
      previewImage: 'https://placehold.co/800x600/f5f5f5/333333?text=Classic+White+Preview',
      isPremium: false,
    },
    {
      name: 'Golden Luxe',
      slug: 'golden-luxe',
      thumbnail: 'https://placehold.co/400x300/c9a84c/ffffff?text=Golden+Luxe',
      category: 'Luxury',
      previewImage: 'https://placehold.co/800x600/c9a84c/ffffff?text=Golden+Luxe+Preview',
      isPremium: true,
    },
  ];

  for (const t of templates) {
    await prisma.template.upsert({
      where: { slug: t.slug },
      update: {},
      create: t,
    });
  }

  console.log('Seeded templates.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

Add seed script to `nestjs/package.json`:
```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

Run:
```bash
cd nestjs
npx prisma db seed
```

---

### 4 — Bootstrap PrismaService

**Create file:** `nestjs/src/prisma/prisma.service.ts`

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

**Create file:** `nestjs/src/prisma/prisma.module.ts`

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

---

### 5 — Create TemplatesModule

**Create file:** `nestjs/src/templates/dto/template.dto.ts`

```typescript
export class TemplateDto {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  category: string;
  previewImage: string;
  isPremium: boolean;
}
```

**Create file:** `nestjs/src/templates/templates.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.template.findMany({
      orderBy: { name: 'asc' },
    });
  }

  findOne(slug: string) {
    return this.prisma.template.findUnique({ where: { slug } });
  }
}
```

**Create file:** `nestjs/src/templates/templates.controller.ts`

```typescript
import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { TemplatesService } from './templates.service';

@Controller('api/templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  findAll() {
    return this.templatesService.findAll();
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const template = await this.templatesService.findOne(slug);
    if (!template) throw new NotFoundException(`Template '${slug}' not found`);
    return template;
  }
}
```

**Create file:** `nestjs/src/templates/templates.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';

@Module({
  controllers: [TemplatesController],
  providers: [TemplatesService],
})
export class TemplatesModule {}
```

---

### 6 — Register modules and enable CORS

**File:** `nestjs/src/app.module.ts` — add `PrismaModule` and `TemplatesModule`:

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TemplatesModule } from './templates/templates.module';

@Module({
  imports: [PrismaModule, TemplatesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**File:** `nestjs/src/main.ts` — enable CORS so the React dev server can call the API:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: 'http://localhost:5173' });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

---

## Frontend Tasks

### 7 — Install frontend dependencies

Run inside `reactjs/`:
```bash
npm install react-router-dom @tanstack/react-query zustand
```

---

### 8 — Create API client

**Create file:** `reactjs/src/api/templates.ts`

```typescript
export interface Template {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  category: string;
  previewImage: string;
  isPremium: boolean;
}

const BASE_URL = 'http://localhost:3000';

export async function fetchTemplates(): Promise<Template[]> {
  const res = await fetch(`${BASE_URL}/api/templates`);
  if (!res.ok) throw new Error('Failed to fetch templates');
  return res.json();
}
```

---

### 9 — Create Zustand store for selected template

**Create file:** `reactjs/src/store/templateStore.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Template } from '../api/templates';

interface TemplateStore {
  selectedTemplate: Template | null;
  setSelectedTemplate: (template: Template) => void;
  clearSelectedTemplate: () => void;
}

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set) => ({
      selectedTemplate: null,
      setSelectedTemplate: (template) => set({ selectedTemplate: template }),
      clearSelectedTemplate: () => set({ selectedTemplate: null }),
    }),
    { name: 'eventy-template-selection' }
  )
);
```

---

### 10 — Build TemplateCard component

**Create file:** `reactjs/src/components/TemplateCard.tsx`

```tsx
import type { Template } from '../api/templates';
import styles from './TemplateCard.module.css';

interface Props {
  template: Template;
  isSelected: boolean;
  onPreview: (template: Template) => void;
  onSelect: (template: Template) => void;
}

export function TemplateCard({ template, isSelected, onPreview, onSelect }: Props) {
  return (
    <article className={`${styles.card} ${isSelected ? styles.selected : ''}`}>
      <div className={styles.thumbnail}>
        <img src={template.thumbnail} alt={template.name} loading="lazy" />
        {template.isPremium && <span className={styles.premiumBadge}>Premium</span>}
        <button
          className={styles.previewBtn}
          onClick={() => onPreview(template)}
          aria-label={`Preview ${template.name}`}
        >
          Preview
        </button>
      </div>
      <div className={styles.info}>
        <span className={styles.category}>{template.category}</span>
        <h3 className={styles.name}>{template.name}</h3>
        <button
          className={`${styles.selectBtn} ${isSelected ? styles.selectBtnActive : ''}`}
          onClick={() => onSelect(template)}
          id={`select-template-${template.slug}`}
        >
          {isSelected ? '✓ Selected' : 'Select'}
        </button>
      </div>
    </article>
  );
}
```

**Create file:** `reactjs/src/components/TemplateCard.module.css`

```css
.card {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 2px solid transparent;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);
}

.selected {
  border-color: #c9a84c;
  box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.25);
}

.thumbnail {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4/3;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.card:hover .thumbnail img {
  transform: scale(1.04);
}

.premiumBadge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #c9a84c;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 3px 8px;
  border-radius: 20px;
  text-transform: uppercase;
}

.previewBtn {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  opacity: 0;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 18px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.card:hover .previewBtn {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.info {
  padding: 14px 16px 16px;
}

.category {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9e9e9e;
  font-weight: 600;
}

.name {
  margin: 4px 0 12px;
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a1a;
}

.selectBtn {
  width: 100%;
  padding: 8px 0;
  border: 2px solid #c9a84c;
  border-radius: 8px;
  background: transparent;
  color: #c9a84c;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.selectBtn:hover {
  background: #c9a84c;
  color: #fff;
}

.selectBtnActive {
  background: #c9a84c;
  color: #fff;
}
```

---

### 11 — Build PreviewModal component

**Create file:** `reactjs/src/components/PreviewModal.tsx`

```tsx
import { useEffect } from 'react';
import type { Template } from '../api/templates';
import styles from './PreviewModal.module.css';

interface Props {
  template: Template | null;
  onClose: () => void;
  onSelect: (template: Template) => void;
  isSelected: boolean;
}

export function PreviewModal({ template, onClose, onSelect, isSelected }: Props) {
  useEffect(() => {
    if (!template) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [template, onClose]);

  if (!template) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label={`Preview: ${template.name}`}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close preview">✕</button>
        <img src={template.previewImage} alt={`${template.name} preview`} className={styles.image} />
        <div className={styles.footer}>
          <div>
            <p className={styles.category}>{template.category}</p>
            <h2 className={styles.name}>{template.name}</h2>
          </div>
          <button
            className={`${styles.selectBtn} ${isSelected ? styles.selectBtnActive : ''}`}
            onClick={() => { onSelect(template); onClose(); }}
            id={`modal-select-template-${template.slug}`}
          >
            {isSelected ? '✓ Selected' : 'Use this template'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Create file:** `reactjs/src/components/PreviewModal.module.css`

```css
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
  animation: fadeIn 0.18s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.modal {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  max-width: 760px;
  width: 100%;
  position: relative;
  animation: slideUp 0.22s ease;
}

@keyframes slideUp {
  from { transform: translateY(24px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

.closeBtn {
  position: absolute;
  top: 12px;
  right: 14px;
  background: rgba(0,0,0,0.5);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 1rem;
  cursor: pointer;
  z-index: 2;
  line-height: 1;
}

.image {
  width: 100%;
  display: block;
  max-height: 460px;
  object-fit: cover;
}

.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  gap: 16px;
}

.category {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9e9e9e;
  font-weight: 600;
  margin: 0;
}

.name {
  margin: 4px 0 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
}

.selectBtn {
  padding: 10px 28px;
  border: 2px solid #c9a84c;
  border-radius: 8px;
  background: transparent;
  color: #c9a84c;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s ease, color 0.2s ease;
}

.selectBtn:hover,
.selectBtnActive {
  background: #c9a84c;
  color: #fff;
}
```

---

### 12 — Build TemplateExplorerPage

**Create file:** `reactjs/src/pages/TemplateExplorerPage.tsx`

```tsx
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTemplates } from '../api/templates';
import type { Template } from '../api/templates';
import { useTemplateStore } from '../store/templateStore';
import { TemplateCard } from '../components/TemplateCard';
import { PreviewModal } from '../components/PreviewModal';
import styles from './TemplateExplorerPage.module.css';

const ALL = 'All';

export function TemplateExplorerPage() {
  const { data: templates = [], isLoading, isError } = useQuery({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
  });

  const { selectedTemplate, setSelectedTemplate } = useTemplateStore();
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [activeCategory, setActiveCategory] = useState(ALL);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(templates.map((t) => t.category))).sort();
    return [ALL, ...cats];
  }, [templates]);

  const filtered = useMemo(() =>
    activeCategory === ALL
      ? templates
      : templates.filter((t) => t.category === activeCategory),
    [templates, activeCategory]
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Choose Your Template</h1>
        <p className={styles.subtitle}>Browse our collection of wedding invitation designs</p>
      </header>

      <div className={styles.filterBar} role="group" aria-label="Filter by category">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`${styles.filterBtn} ${activeCategory === cat ? styles.filterBtnActive : ''}`}
            onClick={() => setActiveCategory(cat)}
            id={`filter-${cat.toLowerCase()}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading && <p className={styles.status}>Loading templates…</p>}
      {isError && <p className={styles.status}>Failed to load templates. Is the backend running?</p>}

      {!isLoading && !isError && (
        <div className={styles.grid}>
          {filtered.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplate?.id === template.id}
              onPreview={setPreviewTemplate}
              onSelect={setSelectedTemplate}
            />
          ))}
        </div>
      )}

      <PreviewModal
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onSelect={setSelectedTemplate}
        isSelected={selectedTemplate?.id === previewTemplate?.id}
      />
    </div>
  );
}
```

**Create file:** `reactjs/src/pages/TemplateExplorerPage.module.css`

```css
.page {
  min-height: 100vh;
  background: #f9f6f2;
  padding: 40px 24px 64px;
  font-family: 'Inter', sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 32px;
}

.title {
  font-size: 2rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 8px;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 1rem;
  color: #6b6b6b;
  margin: 0;
}

.filterBar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 32px;
}

.filterBtn {
  padding: 6px 18px;
  border-radius: 999px;
  border: 1.5px solid #ddd;
  background: #fff;
  color: #555;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
}

.filterBtn:hover {
  border-color: #c9a84c;
  color: #c9a84c;
}

.filterBtnActive {
  background: #c9a84c;
  border-color: #c9a84c;
  color: #fff;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.status {
  text-align: center;
  color: #888;
  margin-top: 48px;
  font-size: 0.95rem;
}
```

---

### 13 — Wire up routing and providers

**File:** `reactjs/src/main.tsx` — add `QueryClientProvider`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
```

**File:** `reactjs/src/App.tsx` — replace with router:

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { TemplateExplorerPage } from './pages/TemplateExplorerPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/templates" replace />} />
        <Route path="/templates" element={<TemplateExplorerPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

Add Google Fonts import to `reactjs/index.html` `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
```

---

## Verification Steps

1. **Backend builds:**
   ```bash
   cd nestjs && npm run build
   ```

2. **Backend runs and API responds:**
   ```bash
   cd nestjs && npm run start:dev
   # In a second terminal:
   curl http://localhost:3000/api/templates | json_pp
   # Expect: JSON array with 6 template objects
   curl http://localhost:3000/api/templates/garden-romance | json_pp
   # Expect: single template object
   ```

3. **Frontend runs:**
   ```bash
   cd reactjs && npm run dev
   # Open http://localhost:5173 → redirects to /templates
   ```

4. **Frontend checklist (manual):**
   - Grid renders template cards with thumbnail, name, and category
   - Category filter buttons appear and filter the grid correctly
   - Hovering a card reveals the "Preview" button
   - Clicking "Preview" opens the modal with the large image
   - Pressing Escape closes the modal
   - Clicking "Select" / "Use this template" highlights the card with a gold border
   - Refreshing the page preserves the selected template (Zustand `persist`)

5. **Regression:** No existing routes or modules are removed. `AppController` and `AppService` remain intact.

---

## Done Criteria

- [x] `GET /api/templates` returns all templates as a JSON array
- [x] `GET /api/templates/:slug` returns a single template or 404
- [x] Database contains at least 6 seeded templates
- [x] `/templates` page renders a responsive grid
- [x] Each card shows thumbnail, name, and category
- [x] Premium badge is visible on premium templates
- [x] Category filter chips filter the grid
- [x] Preview modal opens on "Preview" click and closes on Escape or backdrop click
- [x] Selecting a template highlights it with a gold border in the grid
- [x] Selected template is stored in Zustand and persisted across page refreshes

**STOP HERE. Report to the user and wait for confirmation before proceeding to Story 02.**
