import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors, spacing, radius } from '@/theme';

interface FieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  icon?: string;
  error?: string;
  half?: boolean;
}

export const Field = React.forwardRef<TextInput, FieldProps>(
  ({ label, icon, error, half, ...inputProps }, ref) => {
    return (
      <View style={[styles.container, half && styles.half]}>
        <Text style={styles.label}>
          {icon ? `${icon} ` : ''}{label}
        </Text>
        <TextInput
          ref={ref}
          style={[styles.input, error && styles.inputError]}
          placeholderTextColor={colors.textMuted}
          autoCorrect={false}
          accessibilityLabel={label}
          {...inputProps}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  half: { flex: 1 },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs + 2,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#E8E4DE',
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: '#FFF8F8',
  },
  errorText: {
    fontSize: 11,
    color: colors.error,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
});
