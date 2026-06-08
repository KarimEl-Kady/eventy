import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTemplates } from '../api/templates';
import type { Template } from '../api/templates';
import { useTemplateStore } from '../store/templateStore';
import { TemplateCard } from '../components/TemplateCard';
import { PreviewModal } from '../components/PreviewModal';
import styles from './TemplateExplorerPage.module.css';

const ALL = 'All';

export function TemplateExplorerPage() {
  const { data: templates = [], isLoading, isError } = useQuery({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
  });

  const { selectedTemplate, setSelectedTemplate } = useTemplateStore();
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [activeCategory, setActiveCategory] = useState(ALL);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(templates.map((t) => t.category))).sort();
    return [ALL, ...cats];
  }, [templates]);

  const filtered = useMemo(() =>
    activeCategory === ALL
      ? templates
      : templates.filter((t) => t.category === activeCategory),
    [templates, activeCategory]
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Choose Your Template</h1>
        <p className={styles.subtitle}>Browse our collection of wedding invitation designs</p>
      </header>

      <div className={styles.filterBar} role="group" aria-label="Filter by category">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`${styles.filterBtn} ${activeCategory === cat ? styles.filterBtnActive : ''}`}
            onClick={() => setActiveCategory(cat)}
            id={`filter-${cat.toLowerCase()}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading && <p className={styles.status}>Loading templates…</p>}
      {isError && <p className={styles.status}>Failed to load templates. Is the backend running?</p>}

      {!isLoading && !isError && (
        <div className={styles.grid}>
          {filtered.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplate?.id === template.id}
              onPreview={setPreviewTemplate}
              onSelect={setSelectedTemplate}
            />
          ))}
        </div>
      )}

      <PreviewModal
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onSelect={setSelectedTemplate}
        isSelected={selectedTemplate?.id === previewTemplate?.id}
      />
    </div>
  );
}
