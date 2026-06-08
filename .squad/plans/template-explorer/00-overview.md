# template-explorer — plan overview

Entry point for the **template-explorer** feature. Stories execute in order by their `NN` prefix.

## Stories

| NN | File | Title | Tracker id | Depends on |
|----|------|-------|------------|------------|
| 01 | [01-story-template-explorer.md](01-story-template-explorer.md) | Template Explorer | — | None |

## Dependency notes

Story 01 bootstraps Prisma, React Router, TanStack Query, and Zustand — none of these are installed yet. The `selectedTemplate` written to Zustand in this story is the upstream contract consumed by the invitation-creation feature.
