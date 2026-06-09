---
inclusion: auto
---

# Mobile App Coding Standards

## Component Structure

Every screen/component file should follow this order:
1. Imports
2. Types/interfaces
3. Component (export default for screens)
4. Sub-components (if small and only used here)
5. NO styles in this file (import from ./styles.ts)

## Screen Template

```tsx
// features/my-feature/my-feature-screen.tsx
import { View, Text } from 'react-native';
import { useMyData } from './hooks/use-my-data';
import { MyComponent } from './components/my-component';
import { Loading } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { styles } from './styles';

export function MyFeatureScreen() {
  const { data, isLoading, isError } = useMyData();

  if (isLoading) return <Loading />;
  if (isError) return <ErrorState message="Failed to load" />;

  return (
    <View style={styles.container}>
      <MyComponent data={data} />
    </View>
  );
}
```

## Custom Hook Template

```tsx
// features/my-feature/hooks/use-my-data.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { MyType } from '@/types';

export function useMyData() {
  return useQuery<MyType[]>({
    queryKey: ['my-data'],
    queryFn: async () => {
      const { data } = await api.get('/api/my-endpoint');
      return data;
    },
  });
}
```

## Styles Template

```tsx
// features/my-feature/styles.ts
import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
});
```

## Rules

- Max 150 lines per file (split if larger)
- One component per file
- Props interfaces defined in the same file above the component
- No `any` types — use `unknown` and type narrow
- Always add `accessibilityLabel` to interactive elements
- Use `TouchableOpacity` with `activeOpacity={0.7}` for buttons
- Prefer `FlatList` over `ScrollView` for lists
- Always handle loading, error, and empty states
- Use React Query for all API calls (never raw useEffect + fetch)
