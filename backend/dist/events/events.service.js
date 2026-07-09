"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const event_schema_1 = require("./schemas/event.schema");
let EventsService = class EventsService {
    constructor(eventModel) {
        this.eventModel = eventModel;
    }
    async create(dto, organizerId, imagePath) {
        return this.eventModel.create({
            ...dto,
            organizer: organizerId,
            availableSeats: dto.totalSeats,
            image: imagePath || '',
        });
    }
    async findAll(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const filter = {};
        if (query.search) {
            filter.title = { $regex: query.search, $options: 'i' };
        }
        if (query.category)
            filter.category = query.category;
        if (query.organizer)
            filter.organizer = query.organizer;
        if (query.location)
            filter.location = { $regex: query.location, $options: 'i' };
        if (query.date)
            filter.date = { $gte: new Date(query.date) };
        if (query.minPrice || query.maxPrice) {
            filter.ticketPrice = {};
            if (query.minPrice)
                filter.ticketPrice.$gte = Number(query.minPrice);
            if (query.maxPrice)
                filter.ticketPrice.$lte = Number(query.maxPrice);
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
    async findOne(id) {
        const event = await this.eventModel
            .findById(id)
            .populate('category', 'name image')
            .populate('organizer', 'name email avatar');
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        return event;
    }
    async findByOrganizer(organizerId) {
        return this.eventModel.find({ organizer: organizerId }).populate('category', 'name').sort({ createdAt: -1 });
    }
    async update(id, dto, currentUser, imagePath) {
        const event = await this.eventModel.findById(id);
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        this.assertOwnerOrAdmin(event, currentUser);
        if (dto.totalSeats && dto.totalSeats !== event.totalSeats) {
            const seatsSold = event.totalSeats - event.availableSeats;
            if (dto.totalSeats < seatsSold) {
                throw new common_1.BadRequestException('Total seats cannot be less than seats already sold');
            }
            event.availableSeats = dto.totalSeats - seatsSold;
        }
        Object.assign(event, dto);
        if (imagePath)
            event.image = imagePath;
        return event.save();
    }
    async remove(id, currentUser) {
        const event = await this.eventModel.findById(id);
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        this.assertOwnerOrAdmin(event, currentUser);
        await this.eventModel.findByIdAndDelete(id);
        return { message: 'Event deleted successfully' };
    }
    assertOwnerOrAdmin(event, currentUser) {
        const isOwner = event.organizer.toString() === currentUser.userId;
        const isAdmin = currentUser.role === 'admin';
        if (!isOwner && !isAdmin) {
            throw new common_1.ForbiddenException('You are not allowed to modify this event');
        }
    }
    async decreaseAvailableSeats(eventId) {
        const event = await this.eventModel.findById(eventId);
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        if (event.availableSeats <= 0) {
            throw new common_1.BadRequestException('No seats available for this event');
        }
        event.availableSeats -= 1;
        await event.save();
        return event;
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(event_schema_1.Event.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], EventsService);
//# sourceMappingURL=events.service.js.map