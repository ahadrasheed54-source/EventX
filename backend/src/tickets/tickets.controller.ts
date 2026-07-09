import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Tickets')
@ApiBearerAuth()
@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  // Participant books a ticket
  @Post()
  @Roles('participant')
  book(@Body() dto: CreateTicketDto, @CurrentUser() user: any) {
    return this.ticketsService.book(user.userId, dto.eventId);
  }

  // Participant views their own tickets
  @Get('mine')
  @Roles('participant')
  findMine(@CurrentUser() user: any) {
    return this.ticketsService.findMyTickets(user.userId);
  }

  @Delete(':id')
  @Roles('participant')
  cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ticketsService.cancel(id, user.userId);
  }

  // Organizer views registrations for one of their events
  @Get('event/:eventId')
  @Roles('organizer', 'admin')
  findByEvent(@Param('eventId') eventId: string) {
    return this.ticketsService.findByEvent(eventId);
  }

  // Organizer marks a participant as attended
  @Patch(':id/attendance')
  @Roles('organizer', 'admin')
  markAttendance(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ticketsService.markAttendance(id, user.userId);
  }
}
