# Story 03 — Invitation Preview

## Prerequisites

Story 02 completed: [Invitation Creation](../invitation-creation/02-story-invitation-creation.md) — the `Invitation` Prisma model, `GET /api/invitations/:id`, `InvitationDetailPage` stub, and `useTemplateStore` must all be in place.

---

## Story Goal

When a couple lands on `/invitations/:id` after creating their invitation, they see a full visual preview that renders their wedding data inside the chosen template's style. The preview looks exactly as a guest will see the final invitation. A prominent "Publish" button is present but disabled/stub — it will be wired up in Story 04.

---

## Context — Read These Files First

1. `docs/architecture.md` — React + Vite + TanStack Query frontend; NestJS + Prisma backend.
2. `.squad/plans/invitation-creation/02-story-invitation-creation.md` — `InvitationDetailPage` is a stub at `reactjs/src/pages/InvitationDetailPage.tsx`; this story replaces it. `GET /api/invitations/:id` already returns `{ id, title, brideName, groomName, weddingDate, weddingTime, venue, status, templateId, template: { id, name, slug, thumbnail, category, previewImage, isPremium } }`.
3. `reactjs/src/api/invitations.ts` — `fetchInvitation(id)` and `Invitation` type; extend the `Invitation` interface to include the nested `template` object.
4. `reactjs/src/pages/InvitationDetailPage.tsx` — **replace entirely** with the full preview implementation.
5. `reactjs/src/App.tsx` — route `/invitations/:id` is already registered; no routing changes needed.

---

## Product rules (from story)

- **Show invitation exactly as guest sees it** — the preview must use the template's visual style (background color, typography feel, layout), not a generic card.
- **Render all wedding data** — title, bride name, groom name, date (formatted as "Saturday, September 15 2025"), time, venue.
- No backend changes required.

---

## Frontend Tasks

### 1 — Extend the `Invitation` type

**File:** `reactjs/src/api/invitations.ts` — add the nested `template` field to the `Invitation` interface:

```typescript
import type { Template } from './templates';

export interface Invitation {
  id: string;
  title: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  weddingTime: string;
  venue: string;
  status: string;
  templateId: string;
  template: Template;          // ← add this
  createdAt: string;
  updatedAt: string;
}
```

---

### 2 — Build per-template preview components

Each template category gets its own styled preview. Create one component per template `slug`. The executor should create **all six** components listed below following the same pattern. The component receives `invitation: Invitation` as its only prop.

**Create file:** `reactjs/src/components/previews/GardenRomancePreview.tsx`

```tsx
import type { Invitation } from '../../api/invitations';
import styles from './GardenRomancePreview.module.css';

interface Props { invitation: Invitation; }

export function GardenRomancePreview({ invitation }: Props) {
  const date = new Date(invitation.weddingDate).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  return (
    <div className={styles.card}>
      <div className={styles.floralTop} aria-hidden="true">✿ ❀ ✿</div>
      <p className={styles.label}>Together with their families</p>
      <h1 className={styles.couple}>{invitation.brideName} <span>&amp;</span> {invitation.groomName}</h1>
      <p className={styles.title}>{invitation.title}</p>
      <div className={styles.divider} />
      <p className={styles.date}>{date}</p>
      <p className={styles.time}>at {invitation.weddingTime}</p>
      <p className={styles.venue}>{invitation.venue}</p>
      <div className={styles.floralBottom} aria-hidden="true">✿ ❀ ✿</div>
    </div>
  );
}
```

**Create file:** `reactjs/src/components/previews/GardenRomancePreview.module.css`

```css
.card {
  background: linear-gradient(160deg, #fdf6f0 0%, #f5e6e8 100%);
  border: 2px solid #d4a7b0;
  border-radius: 4px;
  padding: 56px 48px;
  text-align: center;
  font-family: 'Georgia', serif;
  max-width: 480px;
  margin: 0 auto;
  box-shadow: 0 8px 40px rgba(212, 167, 176, 0.25);
}
.floralTop, .floralBottom { color: #d4a7b0; font-size: 1.3rem; letter-spacing: 0.5em; margin-bottom: 20px; }
.floralBottom { margin-top: 20px; margin-bottom: 0; }
.label { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.15em; color: #a07080; margin: 0 0 16px; }
.couple { font-size: 2.2rem; font-weight: 400; color: #5a2d40; margin: 0 0 8px; line-height: 1.2; }
.couple span { font-style: italic; font-size: 1.8rem; }
.title { font-size: 0.9rem; color: #a07080; letter-spacing: 0.1em; margin: 0 0 24px; font-style: italic; }
.divider { width: 60px; height: 1px; background: #d4a7b0; margin: 0 auto 24px; }
.date { font-size: 1rem; color: #5a2d40; margin: 0 0 6px; font-weight: 600; }
.time { font-size: 0.9rem; color: #7a4d5a; margin: 0 0 10px; }
.venue { font-size: 0.95rem; color: #7a4d5a; margin: 0; font-style: italic; }
```

---

Create the remaining five previews with the same `{ invitation: Invitation }` prop pattern. Use distinct visual identities:

**`MidnightElegancePreview`** — `nestjs/prisma/schema.prisma` slug `midnight-elegance`. Dark theme: `background: #0f0f1a`, white/silver text, thin gold accent lines, serif headings.

**`RusticCharmPreview`** — slug `rustic-charm`. Warm beige/kraft-paper feel (`background: #f5ede0`), earthy brown text (`#4a3728`), simple dashed borders, sans-serif uppercase labels.

**`BeachBlissPreview`** — slug `beach-bliss`. Sky-to-ocean gradient (`#e0f4ff → #b8e4f7`), coral accents (`#e8836a`), light sans-serif, wave-inspired divider (Unicode `〰〰〰`).

**`ClassicWhitePreview`** — slug `classic-white`. All-white background, charcoal text (`#2c2c2c`), thin black borders, uppercase spaced-letter labels, Times New Roman / serif font stack.

**`GoldenLuxePreview`** — slug `golden-luxe`. Deep navy background (`#0a1628`), gold text (`#c9a84c`) for names/headings, ivory body text, decorative diamond separator `◆`.

Each component and CSS module follows exactly the same file structure as `GardenRomancePreview` above. Place all six in `reactjs/src/components/previews/`.

---

### 3 — Build PreviewRenderer — the template router

**Create file:** `reactjs/src/components/previews/PreviewRenderer.tsx`

```tsx
import type { Invitation } from '../../api/invitations';
import { GardenRomancePreview }   from './GardenRomancePreview';
import { MidnightElegancePreview } from './MidnightElegancePreview';
import { RusticCharmPreview }      from './RusticCharmPreview';
import { BeachBlissPreview }       from './BeachBlissPreview';
import { ClassicWhitePreview }     from './ClassicWhitePreview';
import { GoldenLuxePreview }       from './GoldenLuxePreview';

const PREVIEW_MAP: Record<string, React.ComponentType<{ invitation: Invitation }>> = {
  'garden-romance':    GardenRomancePreview,
  'midnight-elegance': MidnightElegancePreview,
  'rustic-charm':      RusticCharmPreview,
  'beach-bliss':       BeachBlissPreview,
  'classic-white':     ClassicWhitePreview,
  'golden-luxe':       GoldenLuxePreview,
};

interface Props { invitation: Invitation; }

export function PreviewRenderer({ invitation }: Props) {
  const Component = PREVIEW_MAP[invitation.template.slug];
  if (!Component) {
    return (
      <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
        Preview not available for this template.
      </div>
    );
  }
  return <Component invitation={invitation} />;
}
```

---

### 4 — Replace InvitationDetailPage with the full preview

**File:** `reactjs/src/pages/InvitationDetailPage.tsx` — **replace entirely**:

```tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchInvitation } from '../api/invitations';
import { PreviewRenderer } from '../components/previews/PreviewRenderer';
import styles from './InvitationDetailPage.module.css';

export function InvitationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: invitation, isLoading, isError } = useQuery({
    queryKey: ['invitation', id],
    queryFn: () => fetchInvitation(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className={styles.status}>Loading invitation…</div>;
  if (isError || !invitation) return <div className={styles.status}>Invitation not found.</div>;

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate('/templates')} id="back-to-templates">
          ← Back to templates
        </button>
        <div className={styles.statusPill}>
          {invitation.status === 'draft' ? '📝 Draft' : '✅ Published'}
        </div>
      </div>

      <h1 className={styles.pageTitle}>Preview</h1>
      <p className={styles.pageSubtitle}>This is exactly how your guests will see your invitation.</p>

      <div className={styles.previewWrapper}>
        <PreviewRenderer invitation={invitation} />
      </div>

      <div className={styles.actions}>
        <button
          id="publish-invitation-btn"
          className={styles.publishBtn}
          disabled
          title="Publishing coming in the next step"
        >
          Publish Invitation →
        </button>
        <p className={styles.publishHint}>Publishing will make your invitation available via a public link.</p>
      </div>
    </div>
  );
}
```

**File:** `reactjs/src/pages/InvitationDetailPage.module.css` — **replace entirely**:

```css
.page {
  min-height: 100vh;
  background: #f9f6f2;
  padding: 32px 24px 80px;
  font-family: 'Inter', sans-serif;
}

.status {
  text-align: center;
  padding: 80px 24px;
  color: #888;
  font-family: 'Inter', sans-serif;
}

.topBar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 640px;
  margin: 0 auto 28px;
}

.backBtn {
  background: none;
  border: none;
  color: #666;
  font-size: 0.87rem;
  cursor: pointer;
  padding: 6px 0;
  transition: color 0.15s;
}
.backBtn:hover { color: #1a1a1a; }

.statusPill {
  background: #fff;
  border: 1.5px solid #e0d9cc;
  border-radius: 999px;
  padding: 4px 14px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #7a6a50;
}

.pageTitle {
  text-align: center;
  font-size: 1.6rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 6px;
  letter-spacing: -0.02em;
}

.pageSubtitle {
  text-align: center;
  font-size: 0.9rem;
  color: #888;
  margin: 0 0 36px;
}

.previewWrapper {
  max-width: 560px;
  margin: 0 auto 40px;
}

.actions {
  text-align: center;
}

.publishBtn {
  padding: 14px 48px;
  background: #c9a84c;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: not-allowed;
  opacity: 0.5;
  letter-spacing: 0.01em;
}

.publishHint {
  margin-top: 10px;
  font-size: 0.8rem;
  color: #aaa;
}
```

---

## Verification Steps

1. **Frontend builds:**
   ```bash
   cd reactjs && npm run build
   ```

2. **Frontend runs:**
   ```bash
   cd reactjs && npm run dev
   ```

3. **Manual flow:**
   - Complete Stories 01 and 02 flow: select a template → fill form → submit
   - Land on `/invitations/:id` — confirm the full template-styled preview renders (not the old stub card)
   - Confirm all wedding fields appear: title, bride & groom names, formatted date, time, venue
   - Confirm the "Publish Invitation →" button is visible but disabled
   - Click "← Back to templates" — confirm it navigates to `/templates`
   - Navigate directly to `/invitations/<valid-id>` — preview loads correctly
   - Navigate to `/invitations/nonexistent-id` — "Invitation not found." message shown

4. **Regression:**
   - `GET /api/invitations/:id` still returns the nested `template` object — confirm with `curl http://localhost:3000/api/invitations/<id> | json_pp`
   - Template Explorer page and creation form are unaffected

---

## Done Criteria

- [ ] `InvitationDetailPage` renders the full template-styled preview (not the generic stub card)
- [ ] All 6 template slugs have a corresponding preview component with distinct visual styling
- [ ] Preview displays: invitation title, bride name, groom name, formatted date, time, and venue
- [ ] The formatted date reads as long-form (e.g. "Saturday, September 15 2025")
- [ ] "Publish Invitation →" button is present and disabled
- [ ] "← Back to templates" button navigates to `/templates`
- [ ] Unknown template slug falls back to a graceful "Preview not available" message
- [ ] No backend changes were made

**STOP HERE. Report to the user and wait for confirmation before proceeding to Story 04.**
