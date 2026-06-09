import { create } from 'zustand';
import { Template } from '../types';

interface TemplateStore {
  selectedTemplate: Template | null;
  setSelectedTemplate: (template: Template) => void;
  clearSelectedTemplate: () => void;
}

export const useTemplateStore = create<TemplateStore>((set) => ({
  selectedTemplate: null,
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
  clearSelectedTemplate: () => set({ selectedTemplate: null }),
}));
