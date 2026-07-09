import { IsNotEmpty, IsString, IsDateString, IsNumber, Min, IsMongoId, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: 'Tech Conference 2026' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'A full day of talks on modern web development.' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: '665f1a2b3c4d5e6f7a8b9c0d' })
  @IsMongoId()
  category: string;

  @ApiProperty({ example: '2026-09-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '10:00 AM' })
  @IsNotEmpty()
  @IsString()
  time: string;

  @ApiProperty({ example: 'Expo Center' })
  @IsNotEmpty()
  @IsString()
  venue: string;

  @ApiProperty({ example: 'Lahore, Pakistan' })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({ example: 1500 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  ticketPrice: number;

  @ApiProperty({ example: 200 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  totalSeats: number;

  @ApiPropertyOptional({ example: 'Doors open 30 minutes early.' })
  @IsOptional()
  @IsString()
  announcement?: string;
}
