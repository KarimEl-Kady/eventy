# rsvp — plan overview

Entry point for the **rsvp** feature. Stories execute in order by their `NN` prefix.

## Stories

| NN | File | Title | Tracker id | Depends on |
|----|------|-------|------------|------------|
| 06 | [06-story-rsvp.md](06-story-rsvp.md) | RSVP Management | — | Story 05 (public-invitation-page) |

## Dependency notes

Story 06 adds the `Rsvp` model with FK to `Invitation` (Story 02). The RSVP form is embedded in `PublicInvitationPage` (Story 05). The RSVP list is added to `InvitationDetailPage` (Story 03). No routes change.
