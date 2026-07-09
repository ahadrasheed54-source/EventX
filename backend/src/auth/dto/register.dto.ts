import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Ayesha Khan' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'ayesha@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @MinLength(6)
  password: string;

  // Only 'organizer' or 'participant' can self-register.
  // Admin accounts must be created manually / seeded.
  @ApiPropertyOptional({ enum: ['organizer', 'participant'], default: 'participant' })
  @IsOptional()
  @IsIn(['organizer', 'participant'])
  role?: string;
}
