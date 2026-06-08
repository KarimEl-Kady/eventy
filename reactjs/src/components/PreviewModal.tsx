import { useEffect } from 'react';
import type { Template } from '../api/templates';
import styles from './PreviewModal.module.css';

interface Props {
  template: Template | null;
  onClose: () => void;
  onSelect: (template: Template) => void;
  isSelected: boolean;
}

export function PreviewModal({ template, onClose, onSelect, isSelected }: Props) {
  useEffect(() => {
    if (!template) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [template, onClose]);

  if (!template) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label={`Preview: ${template.name}`}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close preview">✕</button>
        <img src={template.previewImage} alt={`${template.name} preview`} className={styles.image} />
        <div className={styles.footer}>
          <div>
            <p className={styles.category}>{template.category}</p>
            <h2 className={styles.name}>{template.name}</h2>
          </div>
          <button
            className={`${styles.selectBtn} ${isSelected ? styles.selectBtnActive : ''}`}
            onClick={() => { onSelect(template); onClose(); }}
            id={`modal-select-template-${template.slug}`}
          >
            {isSelected ? '✓ Selected' : 'Use this template'}
          </button>
        </div>
      </div>
    </div>
  );
}
