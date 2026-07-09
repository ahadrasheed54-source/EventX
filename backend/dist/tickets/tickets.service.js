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
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const ticket_schema_1 = require("./schemas/ticket.schema");
const events_service_1 = require("../events/events.service");
const notifications_service_1 = require("../notifications/notifications.service");
let TicketsService = class TicketsService {
    constructor(ticketModel, eventsService, notificationsService) {
        this.ticketModel = ticketModel;
        this.eventsService = eventsService;
        this.notificationsService = notificationsService;
    }
    async book(userId, eventId) {
        const alreadyBooked = await this.ticketModel.findOne({ user: userId, event: eventId });
        if (alreadyBooked) {
            throw new common_1.ConflictException('You already have a ticket for this event');
        }
        await this.eventsService.decreaseAvailableSeats(eventId);
        const ticketNumber = this.generateTicketNumber();
        const ticket = await this.ticketModel.create({
            user: userId,
            event: eventId,
            ticketNumber,
        });
        const event = await this.eventsService.findOne(eventId);
        await this.notificationsService.createForUser(userId, 'Ticket confirmed', `Your ticket for "${event.title}" is confirmed. Ticket #${ticketNumber}.`, eventId);
        return ticket;
    }
    async findMyTickets(userId) {
        return this.ticketModel
            .find({ user: userId })
            .populate({ path: 'event', populate: { path: 'category', select: 'name' } })
            .sort({ createdAt: -1 });
    }
    async findByEvent(eventId) {
        return this.ticketModel.find({ event: eventId }).populate('user', 'name email avatar').sort({ createdAt: -1 });
    }
    async markAttendance(ticketId, organizerId) {
        const ticket = await this.ticketModel.findById(ticketId).populate('event');
        if (!ticket)
            throw new common_1.NotFoundException('Ticket not found');
        const event = ticket.event;
        if (event.organizer.toString() !== organizerId) {
            throw new common_1.ForbiddenException('You do not manage this event');
        }
        ticket.attendanceStatus = 'attended';
        return ticket.save();
    }
    async cancel(ticketId, userId) {
        const ticket = await this.ticketModel.findById(ticketId);
        if (!ticket)
            throw new common_1.NotFoundException('Ticket not found');
        if (ticket.user.toString() !== userId) {
            throw new common_1.ForbiddenException('This is not your ticket');
        }
        await this.ticketModel.findByIdAndDelete(ticketId);
        return { message: 'Ticket cancelled' };
    }
    generateTicketNumber() {
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `EVX-${Date.now().toString().slice(-6)}-${random}`;
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(ticket_schema_1.Ticket.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        events_service_1.EventsService,
        notifications_service_1.NotificationsService])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map