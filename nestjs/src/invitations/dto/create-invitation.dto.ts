import { IsString, IsNotEmpty, IsDateString, IsUUID } from 'class-validator';

export class CreateInvitationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  brideName: string;

  @IsString()
  @IsNotEmpty()
  groomName: string;

  /** ISO 8601 date string, e.g. "2025-09-15" */
  @IsDateString()
  weddingDate: string;

  /** HH:mm, e.g. "17:00" */
  @IsString()
  @IsNotEmpty()
  weddingTime: string;

  @IsString()
  @IsNotEmpty()
  venue: string;

  @IsUUID()
  templateId: string;
}
