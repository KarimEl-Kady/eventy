import type { Template } from '../api/templates';
import styles from './TemplateCard.module.css';

interface Props {
  template: Template;
  isSelected: boolean;
  onPreview: (template: Template) => void;
  onSelect: (template: Template) => void;
}

export function TemplateCard({ template, isSelected, onPreview, onSelect }: Props) {
  return (
    <article className={`${styles.card} ${isSelected ? styles.selected : ''}`}>
      <div className={styles.thumbnail}>
        <img src={template.thumbnail} alt={template.name} loading="lazy" />
        {template.isPremium && <span className={styles.premiumBadge}>Premium</span>}
        <button
          className={styles.previewBtn}
          onClick={() => onPreview(template)}
          aria-label={`Preview ${template.name}`}
        >
          Preview
        </button>
      </div>
      <div className={styles.info}>
        <span className={styles.category}>{template.category}</span>
        <h3 className={styles.name}>{template.name}</h3>
        <button
          className={`${styles.selectBtn} ${isSelected ? styles.selectBtnActive : ''}`}
          onClick={() => onSelect(template)}
          id={`select-template-${template.slug}`}
        >
          {isSelected ? '✓ Selected' : 'Select'}
        </button>
      </div>
    </article>
  );
}
