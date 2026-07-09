import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnnounceDto {
  @ApiProperty({ example: '665f1a2b3c4d5e6f7a8b9c0d' })
  @IsMongoId()
  eventId: string;

  @ApiProperty({ example: 'Venue changed' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'The event has moved to Hall B, same timing.' })
  @IsNotEmpty()
  @IsString()
  message: string;
}
