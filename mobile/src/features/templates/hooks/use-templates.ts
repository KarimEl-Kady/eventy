import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api/client';
import { Template } from '../../../types';

export function useTemplates() {
  return useQuery<Template[]>({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data } = await api.get('/api/templates');
      return data;
    },
  });
}
