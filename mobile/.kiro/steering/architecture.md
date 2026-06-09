---
inclusion: auto
---

# Mobile App Architecture & Conventions

This project follows a **feature-oriented architecture** with Expo Router file-based routing. Based on the [Obytes React Native Starter](https://starter.obytes.com/getting-started/project-structure/) and [Expo official recommendations](https://expo.dev/blog/expo-app-folder-structure-best-practices).

## Folder Structure

```
mobile/
├── app/                    # Expo Router — thin route re-exports only
│   ├── _layout.tsx
│   ├── index.tsx           → re-exports from features/templates
│   ├── invitations/
│   │   ├── new.tsx         → re-exports from features/invitations
│   │   └── [id].tsx        → re-exports from features/invitations
│   └── public/
│       └── [slug].tsx      → re-exports from features/public
├── src/
│   ├── features/           # Feature modules (self-contained)
│   │   ├── templates/
│   │   │   ├── templates-screen.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-templates.ts
│   │   │   ├── components/
│   │   │   │   ├── template-card.tsx
│   │   │   │   ├── template-grid.tsx
│   │   │   │   ├── category-filter.tsx
│   │   │   │   └── template-image.tsx
│   │   │   └── styles.ts
│   │   ├── invitations/
│   │   │   ├── create-screen.tsx
│   │   │   ├── detail-screen.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-create-invitation.ts
│   │   │   │   └── use-invitation.ts
│   │   │   ├── components/
│   │   │   │   ├── invitation-form.tsx
│   │   │   │   ├── invitation-card.tsx
│   │   │   │   ├── publish-section.tsx
│   │   │   │   └── rsvp-list.tsx
│   │   │   └── styles.ts
│   │   ├── public/
│   │   │   ├── public-invitation-screen.tsx
│   │   │   ├── components/
│   │   │   │   ├── invitation-preview.tsx
│   │   │   │   ├── rsvp-form.tsx
│   │   │   │   └── wedding-details.tsx
│   │   │   └── styles.ts
│   │   └── rsvp/
│   │       ├── hooks/
│   │       │   └── use-rsvp.ts
│   │       └── components/
│   │           └── rsvp-form.tsx
│   ├── components/         # Shared UI primitives (design system)
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── text.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── loading.tsx
│   │   │   └── error-state.tsx
│   │   └── form/
│   │       ├── field.tsx
│   │       ├── form-section.tsx
│   │       └── date-input.tsx
│   ├── lib/                # Core infrastructure
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   └── provider.tsx
│   │   ├── hooks/
│   │   │   └── use-network.ts
│   │   └── utils/
│   │       └── format.ts
│   ├── store/              # Global Zustand stores
│   │   ├── template-store.ts
│   │   └── invitation-store.ts
│   ├── theme/              # Design tokens
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── typography.ts
│   │   └── index.ts
│   └── types/              # Shared TypeScript types
│       └── index.ts
```

## Key Rules

### 1. Route files are thin re-exports
```tsx
// app/index.tsx
export { TemplatesScreen as default } from '@/features/templates/templates-screen';
```

### 2. Each feature is self-contained
A feature folder contains:
- `*-screen.tsx` — the screen component
- `components/` — feature-specific components
- `hooks/` — feature-specific hooks (data fetching, mutations)
- `styles.ts` — all StyleSheet definitions for the feature

### 3. No inline styles
All styles live in a separate `styles.ts` file per feature. Screens import styles:
```tsx
import { styles } from './styles';
```

### 4. Hooks encapsulate logic
Extract all data fetching, mutations, and business logic into custom hooks:
```tsx
// features/templates/hooks/use-templates.ts
export function useTemplates() {
  return useQuery({ queryKey: ['templates'], queryFn: fetchTemplates });
}
```

### 5. Shared UI goes in components/ui/
When a component is used in 2+ features with no feature-specific logic, promote it to `src/components/ui/`.

### 6. No barrel exports (index.ts)
Import directly from the file to avoid fast refresh issues:
```tsx
// ✅ Good
import { Button } from '@/components/ui/button';
// ❌ Bad
import { Button } from '@/components/ui';
```

### 7. Naming conventions
- Screens: `kebab-case-screen.tsx`
- Components: `kebab-case.tsx`
- Hooks: `use-kebab-case.ts`
- Styles: `styles.ts`
- Types: PascalCase (`Template`, `Invitation`)

### 8. Import patterns
- Within same feature → relative imports (`./components/card`)
- Cross-feature → absolute (`@/features/auth/use-auth-store`)
- Design system → absolute (`@/components/ui/button`)
- Lib → absolute (`@/lib/api/client`)

## API Layer
- Axios client in `src/lib/api/client.ts`
- Feature-specific API functions live inside the feature's `hooks/` as React Query hooks
- No raw API calls in screen components

## State Management
- **Server state**: TanStack React Query (useQuery, useMutation)
- **Client state**: Zustand (minimal — only for cross-screen state like selected template)
- **Form state**: useState within the form component

## Styling
- StyleSheet.create in a separate `styles.ts` file
- Theme tokens (colors, spacing, typography) imported from `@/theme`
- No magic numbers — use spacing scale (4, 8, 12, 16, 20, 24, 32)
