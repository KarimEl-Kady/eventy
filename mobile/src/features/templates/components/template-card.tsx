import { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Template } from '../../../types';
import { colors, spacing, radius } from '../../../theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const CATEGORY_COLORS: Record<string, string> = {
  Floral: '#F5E6E8',
  Modern: '#E8E4F0',
  Rustic: '#F0EBE3',
  Beach: '#E0F4FF',
  Classic: '#F5F5F5',
  Luxury: '#FDF8EE',
};

const CATEGORY_ICONS: Record<string, string> = {
  Floral: '🌸',
  Modern: '✨',
  Rustic: '🌿',
  Beach: '🌊',
  Classic: '🕊️',
  Luxury: '👑',
};

interface TemplateCardProps {
  template: Template;
  isSelected: boolean;
  onSelect: (template: Template) => void;
}

export function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  const [imageError, setImageError] = useState(false);
  const bgColor = CATEGORY_COLORS[template.category] || '#F0EBE3';

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={() => onSelect(template)}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Select ${template.name} template`}
      accessibilityState={{ selected: isSelected }}
    >
      <View style={[styles.imageWrapper, { backgroundColor: bgColor }]}>
        {imageError ? (
          <View style={styles.fallback}>
            <Text style={styles.fallbackIcon}>
              {CATEGORY_ICONS[template.category] || '💐'}
            </Text>
            <Text style={styles.fallbackName}>{template.name}</Text>
            <View style={styles.fallbackDivider} />
            <Text style={styles.fallbackCategory}>{template.category}</Text>
          </View>
        ) : (
          <Image
            source={{ uri: template.thumbnail }}
            style={styles.thumbnail}
            onError={() => setImageError(true)}
          />
        )}
        {template.isPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>✦ Premium</Text>
          </View>
        )}
        {isSelected && (
          <View style={styles.selectedOverlay}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkMark}>✓</Text>
            </View>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.category}>{template.category}</Text>
        <Text style={styles.name} numberOfLines={1}>{template.name}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: colors.gold,
    shadowColor: colors.gold,
    shadowOpacity: 0.2,
  },
  imageWrapper: { position: 'relative' },
  thumbnail: { width: '100%', aspectRatio: 3 / 4 },
  fallback: {
    width: '100%',
    aspectRatio: 3 / 4,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  fallbackIcon: { fontSize: 36, marginBottom: spacing.md },
  fallbackName: { fontSize: 14, fontWeight: '700', color: '#4A3728', textAlign: 'center' },
  fallbackDivider: { width: 30, height: 1.5, backgroundColor: 'rgba(0,0,0,0.12)', marginVertical: 10 },
  fallbackCategory: { fontSize: 10, fontWeight: '600', color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: 1 },
  premiumBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: radius.lg,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  premiumText: { color: colors.gold, fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(201, 168, 76, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  info: { padding: spacing.md },
  category: { fontSize: 10, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  name: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginTop: 3 },
});
