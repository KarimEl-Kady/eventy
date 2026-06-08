# Story 02 — Invitation Creation

## Prerequisites

Story 01 completed: [Template Explorer](../template-explorer/01-story-template-explorer.md) — Prisma, React Router, TanStack Query, and Zustand must be installed; `PrismaModule` must be globally registered; `useTemplateStore` must expose `selectedTemplate`.

---

## Story Goal

A couple fills in a form (bride name, groom name, wedding date, wedding time, venue, invitation title) and submits it. The backend persists the invitation as a **draft** linked to the selected template, returns the new invitation's `id`, and the frontend navigates the user to the invitation detail page (stub) so the preview/publish stories can continue from there.

---

## Context — Read These Files First

1. `docs/architecture.md` — stack: NestJS + Prisma + PostgreSQL, React + Vite + TanStack Query + Zustand.
2. `nestjs/prisma/schema.prisma` — add the `Invitation` model here; note the existing `Template` model and its `id` field type (`String @id @default(uuid())`).
3. `nestjs/src/app.module.ts` — register `InvitationsModule` alongside `TemplatesModule`.
4. `nestjs/src/prisma/prisma.module.ts` — already global; `PrismaService` is injectable without re-importing.
5. `.squad/plans/template-explorer/01-story-template-explorer.md` — `useTemplateStore` shape: `{ selectedTemplate: Template | null, setSelectedTemplate, clearSelectedTemplate }`.
6. `reactjs/src/App.tsx` — add `/invitations/new` and `/invitations/:id` routes here.
7. `reactjs/src/store/templateStore.ts` — read `selectedTemplate` from here to pre-fill `templateId` on form submit.

---

## Backend Tasks

### 1 — Add `Invitation` model to Prisma schema

**File:** `nestjs/prisma/schema.prisma` — append after the `Template` model:

```prisma
model Invitation {
  id          String   @id @default(uuid())
  title       String
  brideName   String
  groomName   String
  weddingDate DateTime
  weddingTime String
  venue       String
  status      String   @default("draft")
  templateId  String
  template    Template @relation(fields: [templateId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

Also add the back-relation on `Template`:

```prisma
model Template {
  // ... existing fields ...
  invitations Invitation[]
}
```

Run:
```bash
cd nestjs
npx prisma migrate dev --name add_invitation
npx prisma generate
```

---

### 2 — Create DTOs

**Create file:** `nestjs/src/invitations/dto/create-invitation.dto.ts`

```typescript
export class CreateInvitationDto {
  title: string;
  brideName: string;
  groomName: string;
  /** ISO 8601 date string, e.g. "2025-09-15" */
  weddingDate: string;
  /** HH:mm, e.g. "17:00" */
  weddingTime: string;
  venue: string;
  templateId: string;
}
```

**Create file:** `nestjs/src/invitations/dto/invitation-response.dto.ts`

```typescript
export class InvitationResponseDto {
  id: string;
  title: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  weddingTime: string;
  venue: string;
  status: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
}
```

---

### 3 — Create InvitationsService

**Create file:** `nestjs/src/invitations/invitations.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';

@Injectable()
export class InvitationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInvitationDto) {
    return this.prisma.invitation.create({
      data: {
        title: dto.title,
        brideName: dto.brideName,
        groomName: dto.groomName,
        weddingDate: new Date(dto.weddingDate),
        weddingTime: dto.weddingTime,
        venue: dto.venue,
        templateId: dto.templateId,
        status: 'draft',
      },
      include: { template: true },
    });
  }

  async findOne(id: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id },
      include: { template: true },
    });
    if (!invitation) throw new NotFoundException(`Invitation '${id}' not found`);
    return invitation;
  }
}
```

---

### 4 — Create InvitationsController

**Create file:** `nestjs/src/invitations/invitations.controller.ts`

```typescript
import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';

@Controller('api/invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  create(@Body() dto: CreateInvitationDto) {
    return this.invitationsService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invitationsService.findOne(id);
  }
}
```

---

### 5 — Create InvitationsModule and register it

**Create file:** `nestjs/src/invitations/invitations.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { InvitationsController } from './invitations.controller';

@Module({
  controllers: [InvitationsController],
  providers: [InvitationsService],
})
export class InvitationsModule {}
```

**File:** `nestjs/src/app.module.ts` — add import:

```typescript
import { InvitationsModule } from './invitations/invitations.module';

@Module({
  imports: [PrismaModule, TemplatesModule, InvitationsModule],
  ...
})
```

---

## Frontend Tasks

### 6 — Create API client

**Create file:** `reactjs/src/api/invitations.ts`

```typescript
const BASE_URL = 'http://localhost:3000';

export interface CreateInvitationPayload {
  title: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  weddingTime: string;
  venue: string;
  templateId: string;
}

export interface Invitation extends CreateInvitationPayload {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export async function createInvitation(payload: CreateInvitationPayload): Promise<Invitation> {
  const res = await fetch(`${BASE_URL}/api/invitations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create invitation');
  return res.json();
}

export async function fetchInvitation(id: string): Promise<Invitation> {
  const res = await fetch(`${BASE_URL}/api/invitations/${id}`);
  if (!res.ok) throw new Error('Invitation not found');
  return res.json();
}
```

---

### 7 — Create InvitationCreationPage

**Create file:** `reactjs/src/pages/InvitationCreationPage.tsx`

```tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { createInvitation } from '../api/invitations';
import { useTemplateStore } from '../store/templateStore';
import styles from './InvitationCreationPage.module.css';

const EMPTY = { title: '', brideName: '', groomName: '', weddingDate: '', weddingTime: '', venue: '' };

export function InvitationCreationPage() {
  const navigate = useNavigate();
  const { selectedTemplate } = useTemplateStore();
  const [fields, setFields] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedTemplate) navigate('/templates', { replace: true });
  }, [selectedTemplate, navigate]);

  const mutation = useMutation({
    mutationFn: () =>
      createInvitation({ ...fields, templateId: selectedTemplate!.id }),
    onSuccess: (data) => navigate(`/invitations/${data.id}`),
    onError: () => setError('Something went wrong. Please try again.'),
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFields((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const missing = Object.entries(fields).find(([, v]) => !v.trim());
    if (missing) { setError('Please fill in all fields.'); return; }
    mutation.mutate();
  }

  if (!selectedTemplate) return null;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.templateBadge}>
          <img src={selectedTemplate.thumbnail} alt={selectedTemplate.name} className={styles.templateThumb} />
          <span className={styles.templateName}>{selectedTemplate.name}</span>
        </div>

        <h1 className={styles.title}>Create Your Invitation</h1>
        <p className={styles.subtitle}>Fill in your wedding details below</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <Field id="title"       label="Invitation Title" name="title"       value={fields.title}       onChange={handleChange} placeholder="e.g. Sarah & James Wedding" />
          <div className={styles.row}>
            <Field id="brideName" label="Bride's Name"     name="brideName"  value={fields.brideName}  onChange={handleChange} placeholder="Bride's full name" />
            <Field id="groomName" label="Groom's Name"     name="groomName"  value={fields.groomName}  onChange={handleChange} placeholder="Groom's full name" />
          </div>
          <div className={styles.row}>
            <Field id="weddingDate" label="Wedding Date" name="weddingDate" type="date" value={fields.weddingDate} onChange={handleChange} />
            <Field id="weddingTime" label="Wedding Time" name="weddingTime" type="time" value={fields.weddingTime} onChange={handleChange} />
          </div>
          <Field id="venue" label="Venue" name="venue" value={fields.venue} onChange={handleChange} placeholder="e.g. The Grand Ballroom, Cairo" />

          {error && <p className={styles.errorMsg} role="alert">{error}</p>}

          <button
            id="submit-invitation"
            type="submit"
            className={styles.submitBtn}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Saving…' : 'Save Draft →'}
          </button>
        </form>
      </div>
    </div>
  );
}

interface FieldProps {
  id: string; label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string;
}
function Field({ id, label, name, value, onChange, placeholder, type = 'text' }: FieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <input id={id} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  );
}
```

**Create file:** `reactjs/src/pages/InvitationCreationPage.module.css`

```css
.page {
  min-height: 100vh;
  background: #f9f6f2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  font-family: 'Inter', sans-serif;
}

.card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.10);
  padding: 40px;
  width: 100%;
  max-width: 580px;
}

.templateBadge {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
  padding: 10px 14px;
  background: #fdf8ee;
  border: 1.5px solid #e8d9a0;
  border-radius: 10px;
}

.templateThumb {
  width: 48px;
  height: 36px;
  object-fit: cover;
  border-radius: 6px;
}

.templateName {
  font-size: 0.85rem;
  font-weight: 600;
  color: #8a6c1e;
}

.title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 6px;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 0.9rem;
  color: #6b6b6b;
  margin: 0 0 28px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #444;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.field input {
  padding: 10px 14px;
  border: 1.5px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #1a1a1a;
  transition: border-color 0.18s;
  outline: none;
}

.field input:focus {
  border-color: #c9a84c;
}

.errorMsg {
  font-size: 0.85rem;
  color: #c0392b;
  margin: 0;
}

.submitBtn {
  margin-top: 8px;
  padding: 13px;
  background: #c9a84c;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
  letter-spacing: 0.01em;
}

.submitBtn:hover:not(:disabled) {
  background: #b8962e;
  transform: translateY(-1px);
}

.submitBtn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

---

### 8 — Create InvitationDetailPage (stub)

This page is the landing target after creation and will be fully implemented in the invitation-preview story.

**Create file:** `reactjs/src/pages/InvitationDetailPage.tsx`

```tsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchInvitation } from '../api/invitations';
import styles from './InvitationDetailPage.module.css';

export function InvitationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['invitation', id],
    queryFn: () => fetchInvitation(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className={styles.status}>Loading invitation…</div>;
  if (isError || !data) return <div className={styles.status}>Invitation not found.</div>;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <span className={styles.badge}>Draft</span>
        <h1 className={styles.title}>{data.title}</h1>
        <p className={styles.couple}>{data.brideName} &amp; {data.groomName}</p>
        <p className={styles.meta}>{data.venue}</p>
        <p className={styles.meta}>{new Date(data.weddingDate).toLocaleDateString()} · {data.weddingTime}</p>
        <p className={styles.note}>Invitation saved. Preview and publish coming next.</p>
      </div>
    </div>
  );
}
```

**Create file:** `reactjs/src/pages/InvitationDetailPage.module.css`

```css
.page {
  min-height: 100vh;
  background: #f9f6f2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  font-family: 'Inter', sans-serif;
}

.status {
  text-align: center;
  padding: 80px 24px;
  color: #888;
  font-family: 'Inter', sans-serif;
}

.card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.10);
  padding: 48px 40px;
  max-width: 480px;
  width: 100%;
  text-align: center;
}

.badge {
  display: inline-block;
  background: #f0e9d2;
  color: #8a6c1e;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 4px 12px;
  border-radius: 999px;
  margin-bottom: 16px;
}

.title {
  font-size: 1.7rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 8px;
}

.couple {
  font-size: 1.1rem;
  font-weight: 600;
  color: #c9a84c;
  margin: 0 0 12px;
}

.meta {
  font-size: 0.9rem;
  color: #666;
  margin: 4px 0;
}

.note {
  margin-top: 24px;
  font-size: 0.85rem;
  color: #aaa;
  border-top: 1px solid #eee;
  padding-top: 16px;
}
```

---

### 9 — Register routes

**File:** `reactjs/src/App.tsx` — add the two new routes:

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TemplateExplorerPage } from './pages/TemplateExplorerPage';
import { InvitationCreationPage } from './pages/InvitationCreationPage';
import { InvitationDetailPage } from './pages/InvitationDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/templates" replace />} />
        <Route path="/templates" element={<TemplateExplorerPage />} />
        <Route path="/invitations/new" element={<InvitationCreationPage />} />
        <Route path="/invitations/:id" element={<InvitationDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

### 10 — Add "Create Invitation" CTA to TemplateExplorerPage

**File:** `reactjs/src/pages/TemplateExplorerPage.tsx`

Add the import and the sticky CTA bar that appears once a template is selected. Add after the grid closing tag:

```tsx
import { useNavigate } from 'react-router-dom';

// inside component, after existing hooks:
const navigate = useNavigate();

// after the </div> closing the grid, add:
{selectedTemplate && (
  <div className={styles.ctaBar}>
    <span>Template selected: <strong>{selectedTemplate.name}</strong></span>
    <button
      id="create-invitation-cta"
      className={styles.ctaBtn}
      onClick={() => navigate('/invitations/new')}
    >
      Continue →
    </button>
  </div>
)}
```

Add to `TemplateExplorerPage.module.css`:

```css
.ctaBar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1a1a1a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 32px;
  font-size: 0.9rem;
  z-index: 100;
  animation: slideUp 0.25s ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

.ctaBtn {
  background: #c9a84c;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 28px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.ctaBtn:hover {
  background: #b8962e;
}
```

---

## Verification Steps

1. **Backend migration runs:**
   ```bash
   cd nestjs && npx prisma migrate dev --name add_invitation
   ```

2. **Backend builds:**
   ```bash
   cd nestjs && npm run build
   ```

3. **API responds:**
   ```bash
   cd nestjs && npm run start:dev
   # Create an invitation (replace <templateId> with a real seeded id):
   curl -X POST http://localhost:3000/api/invitations \
     -H 'Content-Type: application/json' \
     -d '{"title":"Our Big Day","brideName":"Sarah","groomName":"James","weddingDate":"2025-09-15","weddingTime":"17:00","venue":"The Grand Ballroom","templateId":"<templateId>"}' | json_pp
   # Expect: invitation object with id and status="draft"

   curl http://localhost:3000/api/invitations/<id> | json_pp
   # Expect: same object
   ```

4. **Frontend runs:**
   ```bash
   cd reactjs && npm run dev
   ```

5. **Manual flow:**
   - Go to `/templates`, select a template → sticky "Continue →" bar appears at bottom
   - Click "Continue →" → `/invitations/new` loads with selected template badge
   - Leave a field empty → validation message appears without submitting
   - Fill all fields, click "Save Draft →" → navigates to `/invitations/<id>` showing the detail stub
   - Visiting `/invitations/new` with no template selected → redirects to `/templates`

---

## Done Criteria

- [x] `POST /api/invitations` creates a draft invitation linked to a template and returns the full object
- [x] `GET /api/invitations/:id` returns the invitation or 404
- [x] `InvitationCreationPage` shows the selected template badge and all 6 fields
- [x] Client-side validation blocks submit when any field is empty
- [x] Submitting navigates to `/invitations/:id`
- [x] Visiting `/invitations/new` with no template selected redirects to `/templates`
- [x] Selecting a template on `/templates` shows the sticky "Continue →" CTA bar

**STOP HERE. Report to the user and wait for confirmation before proceeding to Story 03.**
