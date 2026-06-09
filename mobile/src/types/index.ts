export interface Template {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  category: string;
  previewImage: string;
  isPremium: boolean;
}

export interface Invitation {
  id: string;
  title: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  weddingTime: string;
  venue: string;
  status: string;
  slug: string | null;
  templateId: string;
  template: Template;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvitationPayload {
  title: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  weddingTime: string;
  venue: string;
  templateId: string;
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
