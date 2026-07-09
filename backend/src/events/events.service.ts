import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventDto } from './dto/query-event.dto';

@Injectable()
export class EventsService {
  constructor(@InjectModel(Event.name) private eventModel: Model<EventDocument>) {}

  async create(dto: CreateEventDto, organizerId: string, imagePath?: string) {
    return this.eventModel.create({
      ...dto,
      organizer: organizerId,
      availableSeats: dto.totalSeats,
      image: imagePath || '',
    });
  }

  async findAll(query: QueryEventDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const filter: any = {};

    if (query.search) {
      filter.title = { $regex: query.search, $options: 'i' };
    }
    if (query.category) filter.category = query.category;
    if (query.organizer) filter.organizer = query.organizer;
    if (query.location) filter.location = { $regex: query.location, $options: 'i' };
    if (query.date) filter.date = { $gte: new Date(query.date) };
    if (query.minPrice || query.maxPrice) {
      filter.ticketPrice = {};
      if (query.minPrice) filter.ticketPrice.$gte = Number(query.minPrice);
      if (query.maxPrice) filter.ticketPrice.$lte = Number(query.maxPrice);
    }

    const skip = (page - 1) * limit;
    const [events, total] = await Promise.all([
      this.eventModel
        .find(filter)
        .populate('category', 'name image')
        .populate('organizer', 'name email avatar')
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit),
      this.eventModel.countDocuments(filter),
    ]);

    return { data: events, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const event = await this.eventModel
      .findById(id)
      .populate('category', 'name image')
      .populate('organizer', 'name email avatar');
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async findByOrganizer(organizerId: string) {
    return this.eventModel.find({ organizer: organizerId }).populate('category', 'name').sort({ createdAt: -1 });
  }

  async update(id: string, dto: UpdateEventDto, currentUser: { userId: string; role: string }, imagePath?: string) {
    const event = await this.eventModel.findById(id);
    if (!event) throw new NotFoundException('Event not found');

    this.assertOwnerOrAdmin(event, currentUser);

    // If total seats changed, keep availableSeats in sync proportionally
    if (dto.totalSeats && dto.totalSeats !== event.totalSeats) {
      const seatsSold = event.totalSeats - event.availableSeats;
      if (dto.totalSeats < seatsSold) {
        throw new BadRequestException('Total seats cannot be less than seats already sold');
      }
      event.availableSeats = dto.totalSeats - seatsSold;
    }

    Object.assign(event, dto);
    if (imagePath) event.image = imagePath;

    return event.save();
  }

  async remove(id: string, currentUser: { userId: string; role: string }) {
    const event = await this.eventModel.findById(id);
    if (!event) throw new NotFoundException('Event not found');

    this.assertOwnerOrAdmin(event, currentUser);

    await this.eventModel.findByIdAndDelete(id);
    return { message: 'Event deleted successfully' };
  }

  // Only the organizer who owns the event, or an admin, may modify/delete it
  private assertOwnerOrAdmin(event: EventDocument, currentUser: { userId: string; role: string }) {
    const isOwner = event.organizer.toString() === currentUser.userId;
    const isAdmin = currentUser.role === 'admin';
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You are not allowed to modify this event');
    }
  }

  // Called by TicketsService when a participant books a ticket
  async decreaseAvailableSeats(eventId: string) {
    const event = await this.eventModel.findById(eventId);
    if (!event) throw new NotFoundException('Event not found');
    if (event.availableSeats <= 0) {
      throw new BadRequestException('No seats available for this event');
    }
    event.availableSeats -= 1;
    await event.save();
    return event;
  }
}
