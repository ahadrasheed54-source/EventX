import { IsOptional, IsString, MinLength, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatar?: string;

  // Only the admin-only endpoint should ever set this
  @ApiPropertyOptional({ enum: ['admin', 'organizer', 'participant'] })
  @IsOptional()
  @IsIn(['admin', 'organizer', 'participant'])
  role?: string;
}
