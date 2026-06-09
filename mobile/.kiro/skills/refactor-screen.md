# Skill: Refactor a Screen to Feature Architecture

When asked to refactor or improve a screen file, follow these steps:

## Assessment

1. Check if the file is > 150 lines
2. Check if styles are inline or in the same file
3. Check if API calls are made directly in the component
4. Check if there are sub-components defined in the same file

## Extraction Steps

### 1. Extract Styles
Move all `StyleSheet.create({...})` to `./styles.ts`:
```tsx
// styles.ts
import { StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '@/theme';

export const styles = StyleSheet.create({
  // ... moved styles, replacing magic values with tokens
});
```

### 2. Extract Hooks
Move useQuery/useMutation logic to `./hooks/use-{name}.ts`:
```tsx
// hooks/use-templates.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data } = await api.get('/api/templates');
      return data;
    },
  });
}
```

### 3. Extract Components
Move sub-components to `./components/{name}.tsx`:
- Each component gets its own file
- Props interface defined at the top of the file
- Component imports its own styles or uses shared ones

### 4. Clean the Screen
The screen file should only:
- Import hooks, components, and styles
- Orchestrate layout
- Handle loading/error/empty states
- Be under 80 lines ideally

## Checklist After Refactor
- [ ] Screen file < 100 lines
- [ ] No StyleSheet in screen file
- [ ] No raw API calls in screen
- [ ] No inline sub-components
- [ ] All theme values from tokens
- [ ] Accessibility labels present
- [ ] Loading + Error states handled
