> **Title hint (from CLI):** invitation-creation

# Story intake

Fill this template for each story you want planned. Keep it copy-paste-friendly: the planner reads **this file and the files in `attachments/`**, nothing else.

- Folder: `.squad/stories/invitation-creation/invitation-creation/intake.md`
- Binaries (screenshots, PDFs, exports): put them in `attachments/` next to this file and list them below.
- Do **not** rely on external links (tracker URLs, wiki, chat) — the planner cannot open them. Paste the content you want considered.

This is **not** an implementation prompt. It is the input to the plan-generation meta-prompt bundled with squad-kit (`generate-plan.md` in the installed package).

---

## Feature

- **Feature name (display):**
- **Feature slug (folder under `plans/`):** `invitation-creation`

## Tracker (metadata only)

- **Tracker type:** `none`
- **Work item id:** (used in filenames and plan tables; leave blank if tracker type is `none`)
- **Work item type:** Story 
As a couple

I want to enter wedding information

So that my invitation can be generated.

---

## Title

Invitation Creation

## Description

As a couple

I want to enter wedding information

So that my invitation can be generated.

## Acceptance criteria

Enter bride name
Enter groom name
Enter wedding date
Enter wedding time
Enter venue
Enter invitation title
Save invitation as draft

## Attachments

Place files in `attachments/` next to this `intake.md`, then list them here so the planner knows what to open.

| File (relative to this folder) | What it is |
| ------------------------------ | ---------- |
| *(e.g. `attachments/flow.png`)* | *(e.g. UX flow)* |

*(Add rows per file. If none, write "None.")*

---

## Dependencies

- **Blocked by / related ids:** (tracker ids only; optional short note)
- **Depends on:** template-explorer

## Extra notes (optional)

- Anything not captured above (e.g. chat context) — keep short.

## Technical hints (optional)

Backend APIs

POST /api/invitations
GET /api/invitations/:id

Database

Invitation
- id
- title
- brideName
- groomName
- weddingDate
- weddingTime
- venue
- status
- templateId
- createdAt
- updatedAt
## Out of scope

- What this story explicitly does **not** cover:
