import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../../lib/api/client';
import { Rsvp, CreateRsvpPayload } from '../../../types';

export function useRsvps(invitationId: string) {
  return useQuery<Rsvp[]>({
    queryKey: ['rsvps', invitationId],
    queryFn: async () => {
      const { data } = await api.get(`/api/invitations/${invitationId}/rsvps`);
      return data;
    },
    enabled: !!invitationId,
  });
}

export function useSubmitRsvp() {
  return useMutation<Rsvp, unknown, CreateRsvpPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post('/api/rsvps', payload);
      return data;
    },
  });
}
