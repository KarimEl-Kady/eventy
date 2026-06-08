# Story 05 — Public Invitation Page

## Prerequisites

Story 04 completed: [Publish Invitation](../publish-invitation/04-story-publish-invitation.md) — the `Invitation` Prisma model must have `slug String? @unique`; `PATCH /api/invitations/:id/publish` must populate the slug. The public URL format used in Story 04 is `window.location.origin + /i/<slug>` — this story implements that route.

---

## Story Goal

Any guest who receives the public link (`/i/<slug>`) can open it in a browser with no login and see the full styled invitation — rendered with the couple's template and all wedding details. If the slug is invalid or the invitation is not published, a clear "not found" page is shown. The gallery acceptance criterion is interpreted as the template's `previewImage` displayed as a decorative image section (no separate gallery model exists in the current schema).

---

## Context — Read These Files First

1. `docs/architecture.md` — React + Vite + TanStack Query frontend; NestJS + Prisma backend. Authentication: anonymous for MVP.
2. `nestjs/prisma/schema.prisma` — `Invitation` model with `slug String? @unique`, `status String`, and relation to `Template`. Note: only `status = "published"` invitations should be served publicly.
3. `nestjs/src/invitations/invitations.service.ts` — add `findBySlug(slug)` method.
4. `nestjs/src/invitations/invitations.controller.ts` — add `GET /api/public/invitations/:slug`.
5. `reactjs/src/api/invitations.ts` — add `fetchPublicInvitation(slug)`.
6. `reactjs/src/App.tsx` — add `/i/:slug` route.
7. `reactjs/src/components/previews/PreviewRenderer.tsx` — **reuse as-is**; it accepts `invitation: Invitation` and renders the correct template component. The public page uses the same renderer.

---

## Backend Tasks

### 1 — Add `findBySlug` to InvitationsService

**File:** `nestjs/src/invitations/invitations.service.ts` — add after `publish`:

```typescript
async findBySlug(slug: string) {
  const invitation = await this.prisma.invitation.findUnique({
    where: { slug },
    include: { template: true },
  });
  // Return null (not NotFoundException) — controller decides the HTTP status
  if (!invitation || invitation.status !== 'published') return null;
  return invitation;
}
```

---

### 2 — Add public endpoint to InvitationsController

**File:** `nestjs/src/invitations/invitations.controller.ts` — add after the `publish` handler. Import `NotFoundException` if not already imported:

```typescript
@Get('public/:slug')
async findPublic(@Param('slug') slug: string) {
  const invitation = await this.invitationsService.findBySlug(slug);
  if (!invitation) throw new NotFoundException(`Invitation not found or not published`);
  return invitation;
}
```

This registers as `GET /api/invitations/public/:slug` (the controller prefix is `api/invitations`).

> **Note:** The frontend will call `/api/invitations/public/:slug`. Story 04's public URL used `/i/<slug>` only for the browser route — the API path is distinct.

---

## Frontend Tasks

### 3 — Add `fetchPublicInvitation` to API client

**File:** `reactjs/src/api/invitations.ts` — append:

```typescript
export async function fetchPublicInvitation(slug: string): Promise<Invitation> {
  const res = await fetch(`${BASE_URL}/api/invitations/public/${slug}`);
  if (res.status === 404) throw new Error('NOT_FOUND');
  if (!res.ok) throw new Error('Failed to fetch invitation');
  return res.json();
}
```

---

### 4 — Build PublicInvitationPage

**Create file:** `reactjs/src/pages/PublicInvitationPage.tsx`

```tsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchPublicInvitation } from '../api/invitations';
import { PreviewRenderer } from '../components/previews/PreviewRenderer';
import styles from './PublicInvitationPage.module.css';

export function PublicInvitationPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: invitation, isLoading, isError, error } = useQuery({
    queryKey: ['public-invitation', slug],
    queryFn: () => fetchPublicInvitation(slug!),
    enabled: !!slug,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className={styles.centred}>
        <div className={styles.spinner} aria-label="Loading" />
        <p>Loading invitation…</p>
      </div>
    );
  }

  if (isError) {
    const isNotFound = (error as Error).message === 'NOT_FOUND';
    return (
      <div className={styles.centred}>
        <div className={styles.notFoundIcon} aria-hidden="true">💌</div>
        <h1 className={styles.notFoundTitle}>
          {isNotFound ? 'Invitation not found' : 'Something went wrong'}
        </h1>
        <p className={styles.notFoundMsg}>
          {isNotFound
            ? 'This invitation link may be invalid or the invitation has not been published yet.'
            : 'Please try again later.'}
        </p>
      </div>
    );
  }

  if (!invitation) return null;

  const date = new Date(invitation.weddingDate).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* Template-styled invitation preview */}
        <div className={styles.previewSection}>
          <PreviewRenderer invitation={invitation} />
        </div>

        {/* Gallery / preview image section */}
        {invitation.template.previewImage && (
          <section className={styles.gallery} aria-label="Template preview">
            <h2 className={styles.galleryTitle}>Wedding Preview</h2>
            <img
              src={invitation.template.previewImage}
              alt={`${invitation.title} — ${invitation.template.name} design`}
              className={styles.galleryImage}
            />
          </section>
        )}

        {/* Structured wedding details for guests */}
        <section className={styles.details} aria-label="Wedding details">
          <h2 className={styles.detailsTitle}>Wedding Details</h2>
          <dl className={styles.dl}>
            <div className={styles.dlRow}>
              <dt>Couple</dt>
              <dd>{invitation.brideName} &amp; {invitation.groomName}</dd>
            </div>
            <div className={styles.dlRow}>
              <dt>Date</dt>
              <dd>{date}</dd>
            </div>
            <div className={styles.dlRow}>
              <dt>Time</dt>
              <dd>{invitation.weddingTime}</dd>
            </div>
            <div className={styles.dlRow}>
              <dt>Venue</dt>
              <dd>{invitation.venue}</dd>
            </div>
          </dl>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>Made with ❤️ on Eventy</p>
      </footer>
    </div>
  );
}
```

**Create file:** `reactjs/src/pages/PublicInvitationPage.module.css`

```css
.page {
  min-height: 100vh;
  background: #faf8f5;
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
}

.centred {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-family: 'Inter', sans-serif;
  color: #888;
  text-align: center;
  padding: 24px;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e0d9cc;
  border-top-color: #c9a84c;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.notFoundIcon { font-size: 3rem; }

.notFoundTitle {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.notFoundMsg {
  font-size: 0.9rem;
  color: #888;
  max-width: 340px;
  margin: 0;
  line-height: 1.6;
}

.main {
  flex: 1;
  max-width: 640px;
  margin: 0 auto;
  width: 100%;
  padding: 48px 24px 64px;
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.previewSection { width: 100%; }

.gallery { text-align: center; }

.galleryTitle {
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a1a;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 16px;
}

.galleryImage {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  display: block;
}

.details {
  background: #fff;
  border-radius: 12px;
  padding: 28px 32px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
}

.detailsTitle {
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a1a;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 20px;
}

.dl { margin: 0; }

.dlRow {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 10px 0;
  border-bottom: 1px solid #f0ebe3;
  gap: 16px;
}

.dlRow:last-child { border-bottom: none; }

.dlRow dt {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9e9e9e;
  white-space: nowrap;
}

.dlRow dd {
  font-size: 0.95rem;
  color: #1a1a1a;
  font-weight: 500;
  margin: 0;
  text-align: right;
}

.footer {
  text-align: center;
  padding: 20px;
  font-size: 0.78rem;
  color: #bbb;
  border-top: 1px solid #eee;
}
```

---

### 5 — Register `/i/:slug` route

**File:** `reactjs/src/App.tsx` — add import and route:

```tsx
import { PublicInvitationPage } from './pages/PublicInvitationPage';

// Inside <Routes>:
<Route path="/i/:slug" element={<PublicInvitationPage />} />
```

Full `App.tsx` routes after this story:

```tsx
<Routes>
  <Route path="/"                element={<Navigate to="/templates" replace />} />
  <Route path="/templates"       element={<TemplateExplorerPage />} />
  <Route path="/invitations/new" element={<InvitationCreationPage />} />
  <Route path="/invitations/:id" element={<InvitationDetailPage />} />
  <Route path="/i/:slug"         element={<PublicInvitationPage />} />
</Routes>
```

---

## Verification Steps

1. **Backend builds:**
   ```bash
   cd nestjs && npm run build
   ```

2. **API responds:**
   ```bash
   cd nestjs && npm run start:dev

   # Using a slug from a published invitation:
   curl http://localhost:3000/api/invitations/public/<slug> | json_pp
   # Expect: full invitation object with nested template

   # Non-existent slug:
   curl -i http://localhost:3000/api/invitations/public/bad-slug
   # Expect: HTTP 404
   
   # Draft invitation slug (if any draft somehow had a slug):
   # Expect: HTTP 404 (service returns null for non-published)
   ```

3. **Frontend runs:**
   ```bash
   cd reactjs && npm run dev
   ```

4. **Manual flow:**
   - Complete Stories 01–04: select template → create → preview → publish
   - Copy the public URL shown in the share box (e.g. `http://localhost:5173/i/abc123ef-ab12`)
   - Open it in a new tab (or incognito window to simulate a guest)
   - Confirm: spinner → full template-styled preview renders → gallery image shows → wedding details card shows couple, date, time, venue
   - Navigate to `http://localhost:5173/i/nonexistent` → "Invitation not found" screen with 💌 icon
   - Confirm no login or authentication is required to view the page

5. **Regression:**
   - `/templates`, `/invitations/new`, `/invitations/:id` all still work
   - `GET /api/invitations/:id` (private, by UUID) unchanged

---

## Done Criteria

- [ ] `GET /api/invitations/public/:slug` returns the invitation for a published slug
- [ ] `GET /api/invitations/public/:slug` returns 404 for an unknown slug
- [ ] `GET /api/invitations/public/:slug` returns 404 for a draft invitation's slug (if slug somehow exists)
- [ ] `/i/:slug` renders the full template-styled invitation using `PreviewRenderer`
- [ ] Wedding details section shows couple names, formatted date, time, and venue
- [ ] Template `previewImage` is displayed as the gallery section
- [ ] Invalid slug shows the "Invitation not found" error page
- [ ] No authentication is required to access `/i/:slug`
- [ ] Loading spinner is shown while the query is in flight
