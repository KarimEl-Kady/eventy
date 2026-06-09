# Skill: Create a New Feature Module

When asked to create a new feature for the mobile app, follow this structure:

## Steps

1. Create the feature directory: `src/features/{feature-name}/`
2. Create sub-directories: `components/`, `hooks/`
3. Create files:
   - `{feature-name}-screen.tsx` — the main screen component
   - `styles.ts` — all StyleSheet definitions
   - `hooks/use-{feature-name}.ts` — data fetching hook
   - `components/` — feature-specific components (one per file)
4. Create the route re-export in `app/`:
   ```tsx
   export { FeatureScreen as default } from '@/features/{feature-name}/{feature-name}-screen';
   ```

## File Templates

### Screen (`{feature-name}-screen.tsx`)
```tsx
import { View } from 'react-native';
import { use{FeatureName} } from './hooks/use-{feature-name}';
import { Loading } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { styles } from './styles';

export function {FeatureName}Screen() {
  const { data, isLoading, isError, refetch } = use{FeatureName}();

  if (isLoading) return <Loading />;
  if (isError) return <ErrorState message="Failed to load" onRetry={refetch} />;

  return (
    <View style={styles.container}>
      {/* Screen content */}
    </View>
  );
}
```

### Hook (`hooks/use-{feature-name}.ts`)
```tsx
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { {Type} } from '@/types';

export function use{FeatureName}() {
  return useQuery<{Type}[]>({
    queryKey: ['{feature-name}'],
    queryFn: async () => {
      const { data } = await api.get('/api/{endpoint}');
      return data;
    },
  });
}
```

### Styles (`styles.ts`)
```tsx
import { StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
```

## Rules
- Max 150 lines per file
- Separate concerns: screen orchestrates, hooks fetch, components render
- Import theme tokens, never use magic values
- Always handle loading, error, empty states
- Add accessibility labels to all interactive elements
