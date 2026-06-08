# public-invitation-page — plan overview

Entry point for the **public-invitation-page** feature. Stories execute in order by their `NN` prefix.

## Stories

| NN | File | Title | Tracker id | Depends on |
|----|------|-------|------------|------------|
| 05 | [05-story-public-invitation-page.md](05-story-public-invitation-page.md) | Public Invitation Page | — | Story 04 (publish-invitation) |

## Dependency notes

Story 05 depends on `Invitation.slug` introduced in Story 04 and reuses `PreviewRenderer` from Story 03. The public API endpoint `GET /api/invitations/public/:slug` is introduced here; no schema migrations are needed.
