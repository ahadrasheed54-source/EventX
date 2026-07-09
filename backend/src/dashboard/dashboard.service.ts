import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Event, EventDocument } from '../events/schemas/event.schema';
import { Ticket, TicketDocument } from '../tickets/schemas/ticket.schema';
import { Review, ReviewDocument } from '../reviews/schemas/review.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  // Platform-wide numbers for the admin
  async getAdminStats() {
    const [totalUsers, totalEvents, totalTickets, activeOrganizers, totalReviews, tickets, usersByRole] =
      await Promise.all([
        this.userModel.countDocuments(),
        this.eventModel.countDocuments(),
        this.ticketModel.countDocuments(),
        this.eventModel.distinct('organizer'),
        this.reviewModel.countDocuments(),
        this.ticketModel.find().populate('event', 'ticketPrice'),
        this.userModel.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      ]);

    const revenue = tickets.reduce((sum, t: any) => sum + (t.event?.ticketPrice || 0), 0);

    const recentEvents = await this.eventModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('organizer', 'name')
      .populate('category', 'name');

    return {
      totalUsers,
      totalEvents,
      totalTicketsSold: totalTickets,
      revenue,
      totalReviews,
      activeOrganizers: activeOrganizers.length,
      usersByRole,
      recentEvents,
    };
  }

  // One organizer's own numbers
  async getOrganizerStats(organizerId: string) {
    const myEvents = await this.eventModel.find({ organizer: organizerId });
    const eventIds = myEvents.map((e) => e._id);

    const tickets = await this.ticketModel
      .find({ event: { $in: eventIds } })
      .populate('user', 'name email avatar')
      .populate('event', 'title ticketPrice')
      .sort({ createdAt: -1 });

    const revenue = tickets.reduce((sum, t: any) => sum + (t.event?.ticketPrice || 0), 0);
    const attendedCount = tickets.filter((t) => t.attendanceStatus === 'attended').length;

    return {
      totalEvents: myEvents.length,
      totalTicketsSold: tickets.length,
      revenue,
      attendedCount,
      recentRegistrations: tickets.slice(0, 8),
      events: myEvents,
    };
  }

  // One participant's own numbers
  async getParticipantStats(userId: string) {
    const [tickets, user] = await Promise.all([
      this.ticketModel.find({ user: userId }).populate('event'),
      this.userModel.findById(userId),
    ]);

    const now = new Date();
    const upcoming = tickets.filter((t: any) => t.event && new Date(t.event.date) >= now);

    return {
      registeredEvents: tickets.length,
      upcomingEvents: upcoming.length,
      favoriteEvents: user?.favorites?.length || 0,
      recentTickets: tickets.slice(0, 5),
    };
  }
}
