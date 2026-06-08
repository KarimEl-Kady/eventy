> **Title hint (from CLI):** rvsp

# Story intake

Fill this template for each story you want planned. Keep it copy-paste-friendly: the planner reads **this file and the files in `attachments/`**, nothing else.

- Folder: `.squad/stories/rsvp/rvsp/intake.md`
- Binaries (screenshots, PDFs, exports): put them in `attachments/` next to this file and list them below.
- Do **not** rely on external links (tracker URLs, wiki, chat) — the planner cannot open them. Paste the content you want considered.

This is **not** an implementation prompt. It is the input to the plan-generation meta-prompt bundled with squad-kit (`generate-plan.md` in the installed package).

---

## Feature

- **Feature name (display):**
- **Feature slug (folder under `plans/`):** `rsvp`

## Tracker (metadata only)

- **Tracker type:** `none`
- **Work item id:** (used in filenames and plan tables; leave blank if tracker type is `none`)
- **Work item type:** Story / Bug / Task / Chore / …

External tracker links are **not** followed by the planner. Keep the id for naming and traceability only.

---

## Title

RSVP Management

## Description

Description

As a guest

I want to respond to a wedding invitation

So that the couple knows whether I will attend.

## Acceptance criteria

Guest enters name
Guest selects attendance status
Guest enters guest count
RSVP saved
Couple can view responses

## Attachments

Place files in `attachments/` next to this `intake.md`, then list them here so the planner knows what to open.

| File (relative to this folder) | What it is |
| ------------------------------ | ---------- |
| *(e.g. `attachments/flow.png`)* | *(e.g. UX flow)* |

*(Add rows per file. If none, write "None.")*

---

## Dependencies

- **Blocked by / related ids:** (tracker ids only; optional short note)
- **Depends on:** public-invitation-page

## Extra notes (optional)

- Anything not captured above (e.g. chat context) — keep short.

## Technical hints (optional)

Backend APIs

POST /api/rsvps
GET /api/invitations/:id/rsvps

Database

RSVP
- id
- invitationId
- guestName
- attendanceStatus
- guestCount
- notes
- createdAt
## Out of scope

- What this story explicitly does **not** cover:
