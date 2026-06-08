export class CreateRsvpDto {
  invitationId: string;
  guestName: string;
  /** "attending" | "not_attending" */
  attendanceStatus: string;
  guestCount: number;
  notes?: string;
}
