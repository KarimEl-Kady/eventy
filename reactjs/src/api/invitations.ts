const BASE_URL = 'http://localhost:3000';

export interface CreateInvitationPayload {
  title: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  weddingTime: string;
  venue: string;
  templateId: string;
}

export interface Invitation extends CreateInvitationPayload {
  id: string;
  status: string;
  slug: string | null;
  createdAt: string;
  updatedAt: string;
  template?: {
    id: string;
    name: string;
    slug: string;
    thumbnail: string;
    category: string;
    previewImage: string;
    isPremium: boolean;
  };
}

export async function createInvitation(payload: CreateInvitationPayload): Promise<Invitation> {
  const res = await fetch(`${BASE_URL}/api/invitations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create invitation');
  return res.json();
}

export async function fetchInvitation(id: string): Promise<Invitation> {
  const res = await fetch(`${BASE_URL}/api/invitations/${id}`);
  if (!res.ok) throw new Error('Invitation not found');
  return res.json();
}

export async function publishInvitation(id: string): Promise<Invitation> {
  const res = await fetch(`${BASE_URL}/api/invitations/${id}/publish`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Failed to publish invitation');
  return res.json();
}
