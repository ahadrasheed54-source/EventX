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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notification_schema_1 = require("./schemas/notification.schema");
const ticket_schema_1 = require("../tickets/schemas/ticket.schema");
const event_schema_1 = require("../events/schemas/event.schema");
let NotificationsService = class NotificationsService {
    constructor(notificationModel, ticketModel, eventModel) {
        this.notificationModel = notificationModel;
        this.ticketModel = ticketModel;
        this.eventModel = eventModel;
    }
    async findMine(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total, unreadCount] = await Promise.all([
            this.notificationModel.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
            this.notificationModel.countDocuments({ user: userId }),
            this.notificationModel.countDocuments({ user: userId, readStatus: false }),
        ]);
        return { data, total, page, totalPages: Math.ceil(total / limit), unreadCount };
    }
    async markRead(id, userId) {
        const notification = await this.notificationModel.findOne({ _id: id, user: userId });
        if (!notification)
            throw new common_1.NotFoundException('Notification not found');
        notification.readStatus = true;
        return notification.save();
    }
    async markAllRead(userId) {
        await this.notificationModel.updateMany({ user: userId, readStatus: false }, { readStatus: true });
        return { message: 'All notifications marked as read' };
    }
    async announce(dto, currentUser) {
        const event = await this.eventModel.findById(dto.eventId);
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        const isOwner = event.organizer.toString() === currentUser.userId;
        if (!isOwner && currentUser.role !== 'admin') {
            throw new common_1.ForbiddenException('You do not manage this event');
        }
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
    async createForUser(userId, title, message, eventId) {
        return this.notificationModel.create({ user: userId, title, message, event: eventId });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __param(1, (0, mongoose_1.InjectModel)(ticket_schema_1.Ticket.name)),
    __param(2, (0, mongoose_1.InjectModel)(event_schema_1.Event.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map