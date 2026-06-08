# Story 04 — Publish Invitation

## Prerequisites

Story 03 completed: [Invitation Preview](../invitation-preview/03-story-invitation-preview.md) — `InvitationDetailPage` must be the full preview with the disabled "Publish Invitation →" button (`id="publish-invitation-btn"`). `GET /api/invitations/:id` and the `Invitation` Prisma model must exist.

---

## Story Goal

A couple clicks "Publish Invitation →" on the preview page. The backend transitions the invitation from `status = "draft"` to `status = "published"`, generates a unique public **slug**, and returns the full updated invitation. The frontend replaces the disabled button with a copyable public URL and a "Share" state so the couple can immediately share the link with guests.

---

## Context — Read These Files First

1. `docs/architecture.md` — NestJS + Prisma + PostgreSQL backend; React + Vite + TanStack Query frontend.
2. `nestjs/prisma/schema.prisma` — `Invitation` model; add `slug String? @unique` field (nullable so existing draft rows are unaffected). Note `Template.slug` already exists as a pattern.
3. `nestjs/src/invitations/invitations.service.ts` — add `publish(id)` method here.
4. `nestjs/src/invitations/invitations.controller.ts` — add `PATCH /api/invitations/:id/publish` here.
5. `reactjs/src/api/invitations.ts` — add `publishInvitation(id)` function; extend `Invitation` type with `slug: string | null`.
6. `reactjs/src/pages/InvitationDetailPage.tsx` — wire the publish button: replace `disabled` state with `useMutation`, show success UI with the public URL.

---

## Backend Tasks

### 1 — Add `slug` field to Invitation model

**File:** `nestjs/prisma/schema.prisma` — add one field to `Invitation`:

```prisma
model Invitation {
  id          String    @id @default(uuid())
  title       String
  brideName   String
  groomName   String
  weddingDate DateTime
  weddingTime String
  venue       String
  status      String    @default("draft")
  slug        String?   @unique        // ← add: null until published
  templateId  String
  template    Template  @relation(fields: [templateId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

Run:
```bash
cd nestjs
npx prisma migrate dev --name add_invitation_slug
npx prisma generate
```

---

### 2 — Add `publish` method to InvitationsService

**File:** `nestjs/src/invitations/invitations.service.ts` — add after `findOne`:

```typescript
import { ConflictException } from '@nestjs/common';
// At the top of the file, add this import:
// import { randomBytes } from 'crypto';  (Node built-in, no install needed)

async publish(id: string) {
  const invitation = await this.prisma.invitation.findUnique({ where: { id } });
  if (!invitation) throw new NotFoundException(`Invitation '${id}' not found`);
  if (invitation.status === 'published') {
    // Already published — return as-is (idempotent)
    return this.prisma.invitation.findUnique({ where: { id }, include: { template: true } });
  }

  // Generate a short unique slug: first 8 chars of a hex random + suffix
  const { randomBytes } = await import('crypto');
  const publicSlug = randomBytes(4).toString('hex') + '-' + id.slice(0, 4);

  return this.prisma.invitation.update({
    where: { id },
    data: { status: 'published', slug: publicSlug },
    include: { template: true },
  });
}
```

The full updated `invitations.service.ts` imports:

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
```

---

### 3 — Add `PATCH /api/invitations/:id/publish` endpoint

**File:** `nestjs/src/invitations/invitations.controller.ts` — add after the `findOne` handler:

```typescript
import { Controller, Post, Get, Patch, Param, Body } from '@nestjs/common';

@Patch(':id/publish')
publish(@Param('id') id: string) {
  return this.invitationsService.publish(id);
}
```

Full controller decorator list becomes `{ Controller, Post, Get, Patch, Param, Body }`.

---

## Frontend Tasks

### 4 — Extend API client

**File:** `reactjs/src/api/invitations.ts`

1. Add `slug: string | null` to the `Invitation` interface.
2. Add the `publishInvitation` function:

```typescript
export async function publishInvitation(id: string): Promise<Invitation> {
  const res = await fetch(`${BASE_URL}/api/invitations/${id}/publish`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Failed to publish invitation');
  return res.json();
}
```

---

### 5 — Wire publish button in InvitationDetailPage

**File:** `reactjs/src/pages/InvitationDetailPage.tsx`

Add these imports:

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchInvitation, publishInvitation } from '../api/invitations';
```

Inside the component, add after the `useQuery` call:

```tsx
const queryClient = useQueryClient();

const publishMutation = useMutation({
  mutationFn: () => publishInvitation(id!),
  onSuccess: (updated) => {
    queryClient.setQueryData(['invitation', id], updated);
  },
});

const publicUrl = invitation.slug
  ? `${window.location.origin}/i/${invitation.slug}`
  : null;
```

Replace the `<div className={styles.actions}>` block with:

```tsx
<div className={styles.actions}>
  {publicUrl ? (
    <div className={styles.shareBox}>
      <p className={styles.shareLabel}>🎉 Your invitation is live!</p>
      <div className={styles.urlRow}>
        <input
          id="public-url-input"
          className={styles.urlInput}
          readOnly
          value={publicUrl}
          onFocus={(e) => e.target.select()}
        />
        <button
          id="copy-url-btn"
          className={styles.copyBtn}
          onClick={() => navigator.clipboard.writeText(publicUrl)}
        >
          Copy
        </button>
      </div>
      <a
        id="open-public-url"
        href={publicUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.openLink}
      >
        Open public page →
      </a>
    </div>
  ) : (
    <>
      <button
        id="publish-invitation-btn"
        className={styles.publishBtn}
        disabled={publishMutation.isPending}
        onClick={() => publishMutation.mutate()}
      >
        {publishMutation.isPending ? 'Publishing…' : 'Publish Invitation →'}
      </button>
      {publishMutation.isError && (
        <p className={styles.publishError} role="alert">Failed to publish. Please try again.</p>
      )}
      <p className={styles.publishHint}>Publishing will make your invitation available via a public link.</p>
    </>
  )}
</div>
```

---

### 6 — Add publish/share styles

**File:** `reactjs/src/pages/InvitationDetailPage.module.css` — append at the end:

```css
.shareBox {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 1.5px solid #d4edda;
  border-radius: 12px;
  padding: 24px 28px;
  max-width: 480px;
  margin: 0 auto;
}

.shareLabel {
  font-size: 1rem;
  font-weight: 700;
  color: #1a6b3c;
  margin: 0;
}

.urlRow {
  display: flex;
  width: 100%;
  gap: 8px;
}

.urlInput {
  flex: 1;
  padding: 9px 12px;
  border: 1.5px solid #ddd;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #333;
  background: #fafafa;
  outline: none;
}

.copyBtn {
  padding: 9px 18px;
  background: #c9a84c;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.copyBtn:hover { background: #b8962e; }

.openLink {
  font-size: 0.85rem;
  color: #c9a84c;
  font-weight: 600;
  text-decoration: none;
}
.openLink:hover { text-decoration: underline; }

.publishBtn {
  padding: 14px 48px;
  background: #c9a84c;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.01em;
  transition: background 0.2s, transform 0.1s;
}
.publishBtn:hover:not(:disabled) {
  background: #b8962e;
  transform: translateY(-1px);
}
.publishBtn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.publishError {
  font-size: 0.85rem;
  color: #c0392b;
  margin: 4px 0 0;
}

.publishHint {
  margin-top: 8px;
  font-size: 0.8rem;
  color: #aaa;
}
```

> **Note:** Remove the old `.publishBtn` block that had `opacity: 0.5; cursor: not-allowed` hardcoded — it is replaced by the rules above.

---

## Verification Steps

1. **Backend migration runs:**
   ```bash
   cd nestjs && npx prisma migrate dev --name add_invitation_slug
   ```

2. **Backend builds:**
   ```bash
   cd nestjs && npm run build
   ```

3. **API responds:**
   ```bash
   cd nestjs && npm run start:dev

   # Publish an existing draft (replace <id>):
   curl -X PATCH http://localhost:3000/api/invitations/<id>/publish | json_pp
   # Expect: { status: "published", slug: "<8hex>-<4chars>", ... }

   # Calling publish again is idempotent:
   curl -X PATCH http://localhost:3000/api/invitations/<id>/publish | json_pp
   # Expect: same slug returned, no error
   ```

4. **Frontend runs:**
   ```bash
   cd reactjs && npm run dev
   ```

5. **Manual flow:**
   - Complete the full flow (Stories 01–03): select template → create invitation → land on preview
   - "Publish Invitation →" button is **enabled** and clickable (not disabled like the Story 03 stub)
   - Click publish → button shows "Publishing…" briefly → replaced by green share box with the public URL
   - Click "Copy" → URL is in clipboard
   - "Open public page →" link opens in a new tab (404 expected until Story 05 — Public Invitation Page)
   - Refresh `/invitations/:id` — share box still shows (invitation is published, `slug` is non-null)
   - Calling publish on an already-published invitation returns the same slug (idempotent)

6. **Regression:**
   - Existing drafts (no `slug`) still load correctly on `/invitations/:id` — publish button visible and enabled
   - Template Explorer and creation form unaffected

---

## Done Criteria

- [ ] `Invitation` Prisma model has `slug String? @unique`
- [ ] `PATCH /api/invitations/:id/publish` transitions status to `"published"` and sets a unique slug
- [ ] Calling publish on an already-published invitation returns the same record without error
- [ ] "Publish Invitation →" button on the preview page is **enabled** and triggers the API call
- [ ] After publish, the button area is replaced by a share box showing the public URL
- [ ] "Copy" button copies the URL to the clipboard
- [ ] "Open public page →" opens the public URL in a new tab
- [ ] Refreshing `/invitations/:id` after publish preserves the share box state

**STOP HERE. Report to the user and wait for confirmation before proceeding to Story 05.**
