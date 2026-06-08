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

export async function fetchPublicInvitation(slug: string): Promise<Invitation> {
  const res = await fetch(`${BASE_URL}/api/invitations/public/${slug}`);
  if (res.status === 404) throw new Error('NOT_FOUND');
  if (!res.ok) throw new Error('Failed to fetch invitation');
  return res.json();
}

export interface Rsvp {
  id: string;
  invitationId: string;
  guestName: string;
  attendanceStatus: string;
  guestCount: number;
  notes: string | null;
  createdAt: string;
}

export interface CreateRsvpPayload {
  invitationId: string;
  guestName: string;
  attendanceStatus: string;
  guestCount: number;
  notes?: string;
}

export async function submitRsvp(payload: CreateRsvpPayload): Promise<Rsvp> {
  const res = await fetch(`${BASE_URL}/api/rsvps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to submit RSVP');
  return res.json();
}

export async function fetchRsvps(invitationId: string): Promise<Rsvp[]> {
  const res = await fetch(`${BASE_URL}/api/invitations/${invitationId}/rsvps`);
  if (!res.ok) throw new Error('Failed to fetch RSVPs');
  return res.json();
}
