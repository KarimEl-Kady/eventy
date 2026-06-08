# invitation-creation — plan overview

Entry point for the **invitation-creation** feature. Stories execute in order by their `NN` prefix.

## Stories

| NN | File | Title | Tracker id | Depends on |
|----|------|-------|------------|------------|
| 02 | [02-story-invitation-creation.md](02-story-invitation-creation.md) | Invitation Creation | — | Story 01 (template-explorer) |

## Dependency notes

Story 02 reads `selectedTemplate` from the Zustand store written by Story 01. It also adds the `Invitation` model to the Prisma schema established in Story 01, and adds two new routes to `App.tsx`. The `InvitationDetailPage` created here is a stub — it will be replaced/extended by the invitation-preview story.
