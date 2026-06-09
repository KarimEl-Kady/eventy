import { api } from './client';
import { Template } from '../types';

export async function fetchTemplates(): Promise<Template[]> {
  const { data } = await api.get('/api/templates');
  return data;
}

export async function fetchTemplateBySlug(slug: string): Promise<Template> {
  const { data } = await api.get(`/api/templates/${slug}`);
  return data;
}
