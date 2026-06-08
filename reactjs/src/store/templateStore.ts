import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Template } from '../api/templates';

interface TemplateStore {
  selectedTemplate: Template | null;
  setSelectedTemplate: (template: Template) => void;
  clearSelectedTemplate: () => void;
}

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set) => ({
      selectedTemplate: null,
      setSelectedTemplate: (template) => set({ selectedTemplate: template }),
      clearSelectedTemplate: () => set({ selectedTemplate: null }),
    }),
    { name: 'eventy-template-selection' }
  )
);
