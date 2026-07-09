import { PartialType } from '@nestjs/swagger';
import { CreateEventDto } from './create-event.dto';
import { IsIn, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @ApiPropertyOptional({ enum: ['upcoming', 'ongoing', 'completed', 'cancelled'] })
  @IsOptional()
  @IsIn(['upcoming', 'ongoing', 'completed', 'cancelled'])
  status?: string;
}
