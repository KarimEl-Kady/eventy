import { IsString, IsNotEmpty, IsIn, IsInt, Min, Max, IsOptional, IsUUID } from 'class-validator';

export class CreateRsvpDto {
  @IsUUID()
  invitationId: string;

  @IsString()
  @IsNotEmpty()
  guestName: string;

  @IsIn(['attending', 'not_attending'])
  attendanceStatus: string;

  @IsInt()
  @Min(1)
  @Max(20)
  guestCount: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
