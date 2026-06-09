import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '@/theme';

interface ErrorStateProps {
  icon?: string;
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  icon = '⚠️',
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={onRetry}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Retry"
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  icon: { fontSize: 40, marginBottom: spacing.md },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  message: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  retryBtn: {
    marginTop: spacing.lg,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: colors.gold,
    borderRadius: 10,
  },
  retryText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
});
