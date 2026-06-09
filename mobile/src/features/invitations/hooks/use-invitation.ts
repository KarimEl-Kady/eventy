import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api/client';
import { Invitation } from '../../../types';

export function useInvitation(id: string) {
  return useQuery<Invitation>({
    queryKey: ['invitation', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/invitations/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function usePublishInvitation(id: string) {
  const queryClient = useQueryClient();

  return useMutation<Invitation>({
    mutationFn: async () => {
      const { data } = await api.patch(`/api/invitations/${id}/publish`);
      return data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['invitation', id], updated);
    },
  });
}
