import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { Ticket, TicketDocument } from '../tickets/schemas/ticket.schema';
import { Event, EventDocument } from '../events/schemas/event.schema';
import { AnnounceDto } from './dto/announce.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  async findMine(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total, unreadCount] = await Promise.all([
      this.notificationModel.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      this.notificationModel.countDocuments({ user: userId }),
      this.notificationModel.countDocuments({ user: userId, readStatus: false }),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit), unreadCount };
  }

  async markRead(id: string, userId: string) {
    const notification = await this.notificationModel.findOne({ _id: id, user: userId });
    if (!notification) throw new NotFoundException('Notification not found');
    notification.readStatus = true;
    return notification.save();
  }

  async markAllRead(userId: string) {
    await this.notificationModel.updateMany({ user: userId, readStatus: false }, { readStatus: true });
    return { message: 'All notifications marked as read' };
  }

  // Organizer/Admin: notify every ticket holder of one of their events
  async announce(dto: AnnounceDto, currentUser: { userId: string; role: string }) {
    const event = await this.eventModel.findById(dto.eventId);
    if (!event) throw new NotFoundException('Event not found');

    const isOwner = event.organizer.toString() === currentUser.userId;
    if (!isOwner && currentUser.role !== 'admin') {
      throw new ForbiddenException('You do not manage this event');
    }

    // Save the latest announcement text on the event itself too
    event.announcement = dto.message;
    await event.save();

    const tickets = await this.ticketModel.find({ event: dto.eventId }).select('user');
    if (tickets.length === 0) {
      return { message: 'Announcement saved. No registered participants to notify yet.' };
    }

    const notifications = tickets.map((t) => ({
      user: t.user,
      title: dto.title,
      message: dto.message,
      event: event._id,
    }));
    await this.notificationModel.insertMany(notifications);

    return { message: `Announcement sent to ${tickets.length} participant(s)` };
  }

  // Used internally (e.g. by TicketsService) to notify a single user
  async createForUser(userId: string, title: string, message: string, eventId?: string) {
    return this.notificationModel.create({ user: userId, title, message, event: eventId });
  }
}
