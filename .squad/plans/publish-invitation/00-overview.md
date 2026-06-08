# publish-invitation — plan overview

Entry point for the **publish-invitation** feature. Stories execute in order by their `NN` prefix.

## Stories

| NN | File | Title | Tracker id | Depends on |
|----|------|-------|------------|------------|
| 04 | [04-story-publish-invitation.md](04-story-publish-invitation.md) | Publish Invitation | — | Story 03 (invitation-preview) |

## Dependency notes

Story 04 introduces `slug String? @unique` on the `Invitation` model established in Story 02. The `slug` field is the public URL token consumed by Story 05 (public-invitation-page). Story 04 also activates the disabled "Publish Invitation →" button rendered in Story 03.
