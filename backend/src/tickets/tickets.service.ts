import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket, TicketDocument } from './schemas/ticket.schema';
import { EventsService } from '../events/events.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
    private eventsService: EventsService,
    private notificationsService: NotificationsService,
  ) {}

  // Participant registers/books a ticket for an event
  async book(userId: string, eventId: string) {
    const alreadyBooked = await this.ticketModel.findOne({ user: userId, event: eventId });
    if (alreadyBooked) {
      throw new ConflictException('You already have a ticket for this event');
    }

    // Throws if no seats left - also decrements availableSeats
    await this.eventsService.decreaseAvailableSeats(eventId);

    const ticketNumber = this.generateTicketNumber();

    const ticket = await this.ticketModel.create({
      user: userId,
      event: eventId,
      ticketNumber,
    });

    // Fire-and-forget style confirmation notification (does not block booking on failure)
    const event = await this.eventsService.findOne(eventId);
    await this.notificationsService.createForUser(
      userId,
      'Ticket confirmed',
      `Your ticket for "${(event as any).title}" is confirmed. Ticket #${ticketNumber}.`,
      eventId,
    );

    return ticket;
  }

  async findMyTickets(userId: string) {
    return this.ticketModel
      .find({ user: userId })
      .populate({ path: 'event', populate: { path: 'category', select: 'name' } })
      .sort({ createdAt: -1 });
  }

  // Organizer: everyone registered for one of their events
  async findByEvent(eventId: string) {
    return this.ticketModel.find({ event: eventId }).populate('user', 'name email avatar').sort({ createdAt: -1 });
  }

  async markAttendance(ticketId: string, organizerId: string) {
    const ticket = await this.ticketModel.findById(ticketId).populate('event');
    if (!ticket) throw new NotFoundException('Ticket not found');

    const event: any = ticket.event;
    if (event.organizer.toString() !== organizerId) {
      throw new ForbiddenException('You do not manage this event');
    }

    ticket.attendanceStatus = 'attended';
    return ticket.save();
  }

  async cancel(ticketId: string, userId: string) {
    const ticket = await this.ticketModel.findById(ticketId);
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ticket.user.toString() !== userId) {
      throw new ForbiddenException('This is not your ticket');
    }
    await this.ticketModel.findByIdAndDelete(ticketId);
    return { message: 'Ticket cancelled' };
  }

  private generateTicketNumber(): string {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `EVX-${Date.now().toString().slice(-6)}-${random}`;
  }
}
