export interface Template {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  category: string;
  previewImage: string;
  isPremium: boolean;
}

const BASE_URL = 'http://localhost:3000';

export async function fetchTemplates(): Promise<Template[]> {
  const res = await fetch(`${BASE_URL}/api/templates`);
  if (!res.ok) throw new Error('Failed to fetch templates');
  return res.json();
}
