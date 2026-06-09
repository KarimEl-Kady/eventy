import { StyleSheet } from 'react-native';
import { colors, spacing, radius } from '@/theme';

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg - 4, paddingBottom: spacing.xxl },

  // Template badge
  templateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md - 4,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F0EBE3',
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: spacing.xl - 4,
  },
  templateThumb: {
    width: 52,
    height: 52,
    borderRadius: radius.sm + 2,
    backgroundColor: '#F0EBE3',
  },
  templateThumbFallback: {
    width: 52,
    height: 52,
    borderRadius: radius.sm + 2,
    backgroundColor: '#F0EBE3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  templateThumbIcon: { fontSize: 22 },
  templateInfo: { flex: 1 },
  templateLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },
  templateName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginTop: 2 },
  changeBtn: {
    paddingHorizontal: spacing.md - 4,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
    backgroundColor: '#F5F3F0',
  },
  changeBtnText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },

  // Header
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs + 2,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },

  // Form layout
  form: { gap: 14 },
  sectionLabel: { marginTop: spacing.sm },
  sectionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  row: { flexDirection: 'row', gap: spacing.md - 4 },

  // Submit
  submitBtn: {
    backgroundColor: colors.gold,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
