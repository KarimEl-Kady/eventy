import { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTemplates } from './hooks/use-templates';
import { useTemplateStore } from '../../store/templateStore';
import { CategoryFilter } from './components/category-filter';
import { TemplateCard } from './components/template-card';
import { Loading } from '../../components/ui/loading';
import { ErrorState } from '../../components/ui/error-state';
import { Template } from '../../types';
import { styles } from './styles';

const ALL = 'All';

export function TemplatesScreen() {
  const router = useRouter();
  const { selectedTemplate, setSelectedTemplate } = useTemplateStore();
  const [activeCategory, setActiveCategory] = useState(ALL);
  const { data: templates = [], isLoading, isError, refetch } = useTemplates();

  const categories: string[] = useMemo(() => {
    const cats = Array.from(new Set(templates.map((t: Template) => t.category))).sort() as string[];
    return [ALL, ...cats];
  }, [templates]);

  const filtered = useMemo(
    () => activeCategory === ALL ? templates : templates.filter((t: Template) => t.category === activeCategory),
    [templates, activeCategory]
  );

  if (isLoading) return <Loading message="Loading templates..." />;
  if (isError) return <ErrorState message="Failed to load templates. Is the backend running?" onRetry={refetch} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>✨ Eventy</Text>
        <Text style={styles.title}>Choose Your Template</Text>
        <Text style={styles.subtitle}>Find the perfect design for your wedding invitation</Text>
      </View>

      <CategoryFilter categories={categories} active={activeCategory} onSelect={setActiveCategory} />

      <FlatList
        data={filtered}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TemplateCard
            template={item}
            isSelected={selectedTemplate?.id === item.id}
            onSelect={setSelectedTemplate}
          />
        )}
      />

      {selectedTemplate && (
        <View style={styles.ctaBar}>
          <View style={styles.ctaLeft}>
            <Image source={{ uri: selectedTemplate.thumbnail }} style={styles.ctaThumb} />
            <View>
              <Text style={styles.ctaLabel}>Selected</Text>
              <Text style={styles.ctaName}>{selectedTemplate.name}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/invitations/new')} activeOpacity={0.8}>
            <Text style={styles.ctaBtnText}>Continue →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
