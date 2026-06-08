export class CreateInvitationDto {
  title: string;
  brideName: string;
  groomName: string;
  /** ISO 8601 date string, e.g. "2025-09-15" */
  weddingDate: string;
  /** HH:mm, e.g. "17:00" */
  weddingTime: string;
  venue: string;
  templateId: string;
}
