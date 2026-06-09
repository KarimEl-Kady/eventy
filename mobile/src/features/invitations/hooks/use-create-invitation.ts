import { useMutation } from '@tanstack/react-query';
import { api } from '../../../lib/api/client';
import { Invitation, CreateInvitationPayload } from '../../../types';

export function useCreateInvitation() {
  return useMutation<Invitation, unknown, CreateInvitationPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post('/api/invitations', payload);
      return data;
    },
  });
}
