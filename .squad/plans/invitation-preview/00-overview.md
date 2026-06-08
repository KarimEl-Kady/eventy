# invitation-preview — plan overview

Entry point for the **invitation-preview** feature. Stories execute in order by their `NN` prefix.

## Stories

| NN | File | Title | Tracker id | Depends on |
|----|------|-------|------------|------------|
| 03 | [03-story-invitation-preview.md](03-story-invitation-preview.md) | Invitation Preview | — | Story 02 (invitation-creation) |

## Dependency notes

Story 03 replaces the `InvitationDetailPage` stub created in Story 02. It depends on `GET /api/invitations/:id` returning the nested `template` object (including `slug`) established in Story 02. No backend changes are introduced.
