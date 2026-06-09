import { api } from './client';
import { Invitation, CreateInvitationPayload } from '../types';

export async function createInvitation(payload: CreateInvitationPayload): Promise<Invitation> {
  const { data } = await api.post('/api/invitations', payload);
  return data;
}

export async function fetchInvitation(id: string): Promise<Invitation> {
  const { data } = await api.get(`/api/invitations/${id}`);
  return data;
}

export async function publishInvitation(id: string): Promise<Invitation> {
  const { data } = await api.patch(`/api/invitations/${id}/publish`);
  return data;
}

export async function fetchPublicInvitation(slug: string): Promise<Invitation> {
  const { data } = await api.get(`/api/invitations/public/${slug}`);
  return data;
}
