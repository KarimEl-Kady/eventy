import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../../theme';

interface CategoryFilterProps {
  categories: string[];
  active: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({ categories, active, onSelect }: CategoryFilterProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, active === cat && styles.chipActive]}
            onPress={() => onSelect(cat)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Filter by ${cat}`}
            accessibilityState={{ selected: active === cat }}
          >
            <Text style={[styles.text, active === cat && styles.textActive]}>
              {cat === 'All' ? '✨ All' : cat}
            </Text>
            {active === cat && <View style={styles.dot} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: spacing.md, marginBottom: spacing.xs },
  content: { paddingHorizontal: spacing.lg, gap: spacing.sm, alignItems: 'center' },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 28,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: colors.textPrimary,
    elevation: 3,
    shadowOpacity: 0.12,
  },
  text: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  textActive: { color: '#FFF' },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gold,
    marginTop: spacing.xs,
  },
});
