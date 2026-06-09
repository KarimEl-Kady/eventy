import { api } from './client';
import { Rsvp, CreateRsvpPayload } from '../types';

export async function submitRsvp(payload: CreateRsvpPayload): Promise<Rsvp> {
  const { data } = await api.post('/api/rsvps', payload);
  return data;
}

export async function fetchRsvps(invitationId: string): Promise<Rsvp[]> {
  const { data } = await api.get(`/api/invitations/${invitationId}/rsvps`);
  return data;
}
