# Story 06 — RSVP Management

## Prerequisites

Story 05 completed: [Public Invitation Page](../public-invitation-page/05-story-public-invitation-page.md) — `PublicInvitationPage` at `/i/:slug` must be live, as the RSVP form is embedded in it. The `Invitation` model with `id` and `slug` must exist.

---

## Story Goal

A guest visiting the public invitation page at `/i/:slug` can fill in their name, select an attendance status (Attending / Not Attending), and enter a guest count. On submit the RSVP is saved. The couple can view all RSVPs for their invitation by calling `GET /api/invitations/:id/rsvps`. A read-only RSVP list is shown on the couple's `InvitationDetailPage` below the preview.

---

## Context — Read These Files First

1. `docs/architecture.md` — NestJS + Prisma + PostgreSQL backend; React + Vite + TanStack Query frontend. No auth for MVP.
2. `nestjs/prisma/schema.prisma` — add the `Rsvp` model with FK to `Invitation`; add back-relation on `Invitation`.
3. `nestjs/src/app.module.ts` — register `RsvpModule` alongside existing modules.
4. `reactjs/src/pages/PublicInvitationPage.tsx` — embed the RSVP form at the bottom of this page; the `invitation.id` is already available from the query result.
5. `reactjs/src/pages/InvitationDetailPage.tsx` — add a read-only RSVP list section below the preview for the couple to view responses.
6. `reactjs/src/api/invitations.ts` — add `fetchRsvps(invitationId)`.

---

## Backend Tasks

### 1 — Add `Rsvp` model to Prisma schema

**File:** `nestjs/prisma/schema.prisma` — append after `Invitation`:

```prisma
model Rsvp {
  id               String     @id @default(uuid())
  invitationId     String
  invitation       Invitation @relation(fields: [invitationId], references: [id])
  guestName        String
  attendanceStatus String     // "attending" | "not_attending"
  guestCount       Int        @default(1)
  notes            String?
  createdAt        DateTime   @default(now())
}
```

Add back-relation on `Invitation`:

```prisma
model Invitation {
  // ... existing fields ...
  rsvps       Rsvp[]
}
```

Run:
```bash
cd nestjs
npx prisma migrate dev --name add_rsvp
npx prisma generate
```

---

### 2 — Create DTOs

**Create file:** `nestjs/src/rsvp/dto/create-rsvp.dto.ts`

```typescript
export class CreateRsvpDto {
  invitationId: string;
  guestName: string;
  /** "attending" | "not_attending" */
  attendanceStatus: string;
  guestCount: number;
  notes?: string;
}
```

---

### 3 — Create RsvpService

**Create file:** `nestjs/src/rsvp/rsvp.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRsvpDto } from './dto/create-rsvp.dto';

@Injectable()
export class RsvpService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRsvpDto) {
    // Verify invitation exists and is published
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: dto.invitationId },
    });
    if (!invitation || invitation.status !== 'published') {
      throw new NotFoundException('Invitation not found or not published');
    }

    return this.prisma.rsvp.create({
      data: {
        invitationId: dto.invitationId,
        guestName: dto.guestName,
        attendanceStatus: dto.attendanceStatus,
        guestCount: dto.guestCount,
        notes: dto.notes ?? null,
      },
    });
  }

  findByInvitation(invitationId: string) {
    return this.prisma.rsvp.findMany({
      where: { invitationId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
```

---

### 4 — Create RsvpController

**Create file:** `nestjs/src/rsvp/rsvp.controller.ts`

```typescript
import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { RsvpService } from './rsvp.service';
import { CreateRsvpDto } from './dto/create-rsvp.dto';

@Controller('api')
export class RsvpController {
  constructor(private readonly rsvpService: RsvpService) {}

  /** Guest submits RSVP — POST /api/rsvps */
  @Post('rsvps')
  create(@Body() dto: CreateRsvpDto) {
    return this.rsvpService.create(dto);
  }

  /** Couple views RSVPs — GET /api/invitations/:id/rsvps */
  @Get('invitations/:id/rsvps')
  findByInvitation(@Param('id') id: string) {
    return this.rsvpService.findByInvitation(id);
  }
}
```

---

### 5 — Create RsvpModule and register it

**Create file:** `nestjs/src/rsvp/rsvp.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { RsvpService } from './rsvp.service';
import { RsvpController } from './rsvp.controller';

@Module({
  controllers: [RsvpController],
  providers: [RsvpService],
})
export class RsvpModule {}
```

**File:** `nestjs/src/app.module.ts` — add import:

```typescript
import { RsvpModule } from './rsvp/rsvp.module';

@Module({
  imports: [PrismaModule, TemplatesModule, InvitationsModule, RsvpModule],
  ...
})
```

---

## Frontend Tasks

### 6 — Add RSVP API functions

**File:** `reactjs/src/api/invitations.ts` — append:

```typescript
export interface Rsvp {
  id: string;
  invitationId: string;
  guestName: string;
  attendanceStatus: string;
  guestCount: number;
  notes: string | null;
  createdAt: string;
}

export interface CreateRsvpPayload {
  invitationId: string;
  guestName: string;
  attendanceStatus: string;
  guestCount: number;
  notes?: string;
}

export async function submitRsvp(payload: CreateRsvpPayload): Promise<Rsvp> {
  const res = await fetch(`${BASE_URL}/api/rsvps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to submit RSVP');
  return res.json();
}

export async function fetchRsvps(invitationId: string): Promise<Rsvp[]> {
  const res = await fetch(`${BASE_URL}/api/invitations/${invitationId}/rsvps`);
  if (!res.ok) throw new Error('Failed to fetch RSVPs');
  return res.json();
}
```

---

### 7 — Build RsvpForm component

**Create file:** `reactjs/src/components/RsvpForm.tsx`

```tsx
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { submitRsvp } from '../api/invitations';
import type { Rsvp } from '../api/invitations';
import styles from './RsvpForm.module.css';

interface Props {
  invitationId: string;
  onSuccess: (rsvp: Rsvp) => void;
}

export function RsvpForm({ invitationId, onSuccess }: Props) {
  const [guestName, setGuestName] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState('attending');
  const [guestCount, setGuestCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => submitRsvp({ invitationId, guestName, attendanceStatus, guestCount, notes: notes || undefined }),
    onSuccess,
    onError: () => setFormError('Could not submit your RSVP. Please try again.'),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!guestName.trim()) { setFormError('Please enter your name.'); return; }
    mutation.mutate();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.title}>RSVP</h2>
      <p className={styles.subtitle}>Let the couple know if you'll be there</p>

      <div className={styles.field}>
        <label htmlFor="rsvp-name">Your Name</label>
        <input
          id="rsvp-name"
          type="text"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder="Full name"
        />
      </div>

      <div className={styles.field}>
        <label>Attendance</label>
        <div className={styles.toggleGroup} role="group" aria-label="Attendance status">
          {['attending', 'not_attending'].map((status) => (
            <button
              key={status}
              type="button"
              id={`rsvp-status-${status}`}
              className={`${styles.toggle} ${attendanceStatus === status ? styles.toggleActive : ''}`}
              onClick={() => setAttendanceStatus(status)}
            >
              {status === 'attending' ? '✓ Attending' : '✗ Not Attending'}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="rsvp-count">Number of Guests</label>
        <input
          id="rsvp-count"
          type="number"
          min={1}
          max={20}
          value={guestCount}
          onChange={(e) => setGuestCount(Number(e.target.value))}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="rsvp-notes">Notes <span className={styles.optional}>(optional)</span></label>
        <input
          id="rsvp-notes"
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Dietary requirements, etc."
        />
      </div>

      {formError && <p className={styles.error} role="alert">{formError}</p>}

      <button
        id="submit-rsvp"
        type="submit"
        className={styles.submitBtn}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Sending…' : 'Send RSVP'}
      </button>
    </form>
  );
}
```

**Create file:** `reactjs/src/components/RsvpForm.module.css`

```css
.form {
  background: #fff;
  border-radius: 14px;
  padding: 32px;
  box-shadow: 0 2px 20px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 18px;
  font-family: 'Inter', sans-serif;
}

.title {
  font-size: 1.3rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 4px;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 0.85rem;
  color: #888;
  margin: 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #555;
}

.optional {
  font-weight: 400;
  text-transform: none;
  color: #aaa;
  letter-spacing: 0;
  font-size: 0.78rem;
}

.field input {
  padding: 10px 14px;
  border: 1.5px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #1a1a1a;
  outline: none;
  transition: border-color 0.18s;
}

.field input:focus { border-color: #c9a84c; }

.toggleGroup {
  display: flex;
  gap: 10px;
}

.toggle {
  flex: 1;
  padding: 10px;
  border: 1.5px solid #ddd;
  border-radius: 8px;
  background: #fff;
  color: #555;
  font-size: 0.87rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s;
}

.toggle:hover { border-color: #c9a84c; color: #c9a84c; }

.toggleActive {
  background: #c9a84c;
  border-color: #c9a84c;
  color: #fff;
}

.error {
  font-size: 0.85rem;
  color: #c0392b;
  margin: 0;
}

.submitBtn {
  padding: 12px;
  background: #c9a84c;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.97rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

.submitBtn:hover:not(:disabled) { background: #b8962e; transform: translateY(-1px); }
.submitBtn:disabled { opacity: 0.6; cursor: not-allowed; }
```

---

### 8 — Embed RsvpForm in PublicInvitationPage

**File:** `reactjs/src/pages/PublicInvitationPage.tsx`

Add imports:

```tsx
import { useState } from 'react';
import { RsvpForm } from '../components/RsvpForm';
import type { Rsvp } from '../api/invitations';
```

Inside the component, add state after existing hooks:

```tsx
const [submittedRsvp, setSubmittedRsvp] = useState<Rsvp | null>(null);
```

At the bottom of `<main>`, after the `details` section, add:

```tsx
<section className={styles.rsvpSection} aria-label="RSVP">
  {submittedRsvp ? (
    <div className={styles.rsvpSuccess}>
      <span className={styles.rsvpSuccessIcon}>🎉</span>
      <h2 className={styles.rsvpSuccessTitle}>
        {submittedRsvp.attendanceStatus === 'attending'
          ? "You're coming!"
          : 'Response recorded'}
      </h2>
      <p className={styles.rsvpSuccessMsg}>
        Thank you, <strong>{submittedRsvp.guestName}</strong>. Your RSVP has been sent.
      </p>
    </div>
  ) : (
    <RsvpForm invitationId={invitation.id} onSuccess={setSubmittedRsvp} />
  )}
</section>
```

Append to `PublicInvitationPage.module.css`:

```css
.rsvpSection { width: 100%; }

.rsvpSuccess {
  background: #fff;
  border-radius: 14px;
  border: 1.5px solid #d4edda;
  padding: 36px 32px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
}

.rsvpSuccessIcon { font-size: 2.4rem; }

.rsvpSuccessTitle {
  font-size: 1.2rem;
  font-weight: 800;
  color: #1a6b3c;
  margin: 0;
}

.rsvpSuccessMsg {
  font-size: 0.9rem;
  color: #555;
  margin: 0;
}
```

---

### 9 — Add RSVP list to InvitationDetailPage (couple view)

**File:** `reactjs/src/pages/InvitationDetailPage.tsx`

Add imports:

```tsx
import { useQuery } from '@tanstack/react-query';
import { fetchRsvps } from '../api/invitations';
import type { Rsvp } from '../api/invitations';
```

Inside the component, add after the existing `useQuery` for the invitation:

```tsx
const { data: rsvps = [] } = useQuery<Rsvp[]>({
  queryKey: ['rsvps', id],
  queryFn: () => fetchRsvps(id!),
  enabled: !!id,
});
```

Add below the `<div className={styles.actions}>` block:

```tsx
{rsvps.length > 0 && (
  <div className={styles.rsvpList}>
    <h2 className={styles.rsvpListTitle}>Responses ({rsvps.length})</h2>
    <ul className={styles.rsvpItems}>
      {rsvps.map((r) => (
        <li key={r.id} className={styles.rsvpItem}>
          <span className={styles.rsvpName}>{r.guestName}</span>
          <span className={`${styles.rsvpStatus} ${r.attendanceStatus === 'attending' ? styles.attending : styles.notAttending}`}>
            {r.attendanceStatus === 'attending' ? '✓ Attending' : '✗ Not Attending'}
          </span>
          <span className={styles.rsvpCount}>{r.guestCount} guest{r.guestCount !== 1 ? 's' : ''}</span>
        </li>
      ))}
    </ul>
  </div>
)}
```

Append to `InvitationDetailPage.module.css`:

```css
.rsvpList {
  max-width: 560px;
  margin: 32px auto 0;
  background: #fff;
  border-radius: 12px;
  padding: 24px 28px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
}

.rsvpListTitle {
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a1a;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin: 0 0 16px;
}

.rsvpItems {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rsvpItem {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f0ebe3;
  font-size: 0.9rem;
}

.rsvpItem:last-child { border-bottom: none; }

.rsvpName { flex: 1; font-weight: 600; color: #1a1a1a; }

.rsvpStatus {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
}

.attending    { background: #d4edda; color: #1a6b3c; }
.notAttending { background: #fde8e8; color: #8b1a1a; }

.rsvpCount { font-size: 0.82rem; color: #888; white-space: nowrap; }
```

---

## Verification Steps

1. **Backend migration runs:**
   ```bash
   cd nestjs && npx prisma migrate dev --name add_rsvp
   ```

2. **Backend builds:**
   ```bash
   cd nestjs && npm run build
   ```

3. **API responds:**
   ```bash
   cd nestjs && npm run start:dev

   # Submit an RSVP (replace <invitationId> with a published invitation id):
   curl -X POST http://localhost:3000/api/rsvps \
     -H 'Content-Type: application/json' \
     -d '{"invitationId":"<id>","guestName":"Jane Smith","attendanceStatus":"attending","guestCount":2}' | json_pp
   # Expect: RSVP object with id and createdAt

   # Fetch RSVPs for an invitation:
   curl http://localhost:3000/api/invitations/<id>/rsvps | json_pp
   # Expect: array containing the submitted RSVP

   # Submit RSVP for a draft invitation:
   # Expect: HTTP 404
   ```

4. **Frontend runs:**
   ```bash
   cd reactjs && npm run dev
   ```

5. **Manual flow (guest):**
   - Open `/i/<slug>` — RSVP form appears below the invitation preview and details
   - Leave name blank, click "Send RSVP" → validation error shown
   - Fill name, toggle "Not Attending", set guest count to 1, submit → success banner replaces the form: "Response recorded. Thank you, Jane Smith."
   - Submit again from another browser/tab with a different name and "Attending"

6. **Manual flow (couple):**
   - Open `/invitations/<id>` — "Responses (2)" section appears below the publish actions
   - Each row shows guest name, attending/not-attending pill, and guest count
   - Rows are ordered newest-first

7. **Regression:**
   - `/templates`, `/invitations/new`, `/invitations/:id` preview, and `/i/:slug` public page unaffected

---

## Done Criteria

- [x] `Rsvp` Prisma model created with all fields; migration applied
- [x] `POST /api/rsvps` saves an RSVP and returns the created record
- [x] `POST /api/rsvps` returns 404 for a draft or non-existent invitation
- [x] `GET /api/invitations/:id/rsvps` returns all RSVPs for an invitation ordered newest-first
- [x] RSVP form appears on the public invitation page (`/i/:slug`)
- [x] Guest name is required; empty submission shows a validation error
- [x] Attendance toggle switches between "Attending" and "Not Attending"
- [x] On success, the form is replaced by a thank-you confirmation banner
- [x] Couple's `/invitations/:id` page shows a "Responses" list when RSVPs exist
- [x] Each response row shows guest name, attendance status (colour-coded pill), and guest count
