import { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { fetchTemplates } from '../src/api/templates';
import { useTemplateStore } from '../src/store/templateStore';
import { Template } from '../src/types';
import { colors } from '../src/theme/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;
const ALL = 'All';

const CATEGORY_COLORS: Record<string, string> = {
  Floral: '#F5E6E8',
  Modern: '#E8E4F0',
  Rustic: '#F0EBE3',
  Beach: '#E0F4FF',
  Classic: '#F5F5F5',
  Luxury: '#FDF8EE',
};

export default function TemplateExplorerScreen() {
  const router = useRouter();
  const { selectedTemplate, setSelectedTemplate } = useTemplateStore();
  const [activeCategory, setActiveCategory] = useState(ALL);

  const { data: templates = [], isLoading, isError } = useQuery({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
  });

  const categories: string[] = useMemo(() => {
    const cats: string[] = Array.from(new Set(templates.map((t: Template) => t.category))).sort() as string[];
    return [ALL, ...cats];
  }, [templates]);

  const filtered = useMemo(
    () =>
      activeCategory === ALL
        ? templates
        : templates.filter((t: Template) => t.category === activeCategory),
    [templates, activeCategory]
  );

  const handleSelect = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleContinue = () => {
    router.push('/invitations/new');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.logo}>✨ Eventy</Text>
        </View>
        <Text style={styles.title}>Choose Your Template</Text>
        <Text style={styles.subtitle}>
          Find the perfect design for your wedding invitation
        </Text>
      </View>

      {/* Category Filter */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterChip,
                activeCategory === cat && styles.filterChipActive,
              ]}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterText,
                  activeCategory === cat && styles.filterTextActive,
                ]}
              >
                {cat === 'All' ? '✨ All' : cat}
              </Text>
              {activeCategory === cat && (
                <View style={styles.filterDot} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Loading / Error */}
      {isLoading && (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.loadingText}>Loading templates...</Text>
        </View>
      )}
      {isError && (
        <View style={styles.centerBox}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>
            Failed to load templates.{'\n'}Is the backend running?
          </Text>
        </View>
      )}

      {/* Template Grid */}
      {!isLoading && !isError && (
        <FlatList
          data={filtered}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.card,
                selectedTemplate?.id === item.id && styles.cardSelected,
              ]}
              onPress={() => handleSelect(item)}
              activeOpacity={0.85}
            >
              <View style={[styles.imageWrapper, { backgroundColor: CATEGORY_COLORS[item.category] || '#F0EBE3' }]}>
                <TemplateImage template={item} />
                {item.isPremium && (
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumText}>✦ Premium</Text>
                  </View>
                )}
                {selectedTemplate?.id === item.id && (
                  <View style={styles.selectedOverlay}>
                    <View style={styles.checkCircle}>
                      <Text style={styles.checkMark}>✓</Text>
                    </View>
                  </View>
                )}
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.category}>{item.category}</Text>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* CTA Bar */}
      {selectedTemplate && (
        <View style={styles.ctaBar}>
          <View style={styles.ctaLeft}>
            <Image
              source={{ uri: selectedTemplate.thumbnail }}
              style={styles.ctaThumb}
            />
            <View>
              <Text style={styles.ctaLabel}>Selected</Text>
              <Text style={styles.ctaName}>{selectedTemplate.name}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaBtnText}>Continue →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const CATEGORY_ICONS: Record<string, string> = {
  Floral: '🌸',
  Modern: '✨',
  Rustic: '🌿',
  Beach: '🌊',
  Classic: '🕊️',
  Luxury: '👑',
};

function TemplateImage({ template }: { template: Template }) {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    return (
      <View style={[styledCardStyles.container, { backgroundColor: CATEGORY_COLORS[template.category] || '#F0EBE3' }]}>
        <Text style={styledCardStyles.icon}>{CATEGORY_ICONS[template.category] || '💐'}</Text>
        <Text style={styledCardStyles.name}>{template.name}</Text>
        <View style={styledCardStyles.divider} />
        <Text style={styledCardStyles.category}>{template.category}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: template.thumbnail }}
      style={imgStyles.thumbnail}
      onError={handleError}
    />
  );
}

const styledCardStyles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 3 / 4,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    fontSize: 36,
    marginBottom: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A3728',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  divider: {
    width: 30,
    height: 1.5,
    backgroundColor: 'rgba(0,0,0,0.12)',
    marginVertical: 10,
  },
  category: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

const imgStyles = StyleSheet.create({
  thumbnail: { width: '100%', aspectRatio: 3 / 4 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerTop: {
    marginBottom: 16,
  },
  logo: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gold,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  filterWrapper: { marginTop: 16, marginBottom: 4 },
  filterContent: { paddingHorizontal: 20, gap: 8, alignItems: 'center' },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 28,
    backgroundColor: colors.surface,
    marginRight: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: colors.textPrimary,
    elevation: 3,
    shadowOpacity: 0.12,
  },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: '#FFF' },
  filterDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gold,
    marginTop: 4,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textMuted,
  },
  errorIcon: { fontSize: 32, marginBottom: 8 },
  errorText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  grid: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 },
  row: { gap: 12, marginBottom: 12 },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: 16,
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
  imageWrapper: {
    position: 'relative',
  },
  thumbnail: { width: '100%', aspectRatio: 3 / 4, backgroundColor: 'transparent' },
  premiumBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  premiumText: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
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
  cardInfo: { padding: 12 },
  category: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 3,
  },
  ctaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#F0EBE3',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  ctaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  ctaThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F0EBE3',
  },
  ctaLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  ctaName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  ctaBtn: {
    backgroundColor: colors.gold,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },
  ctaBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
