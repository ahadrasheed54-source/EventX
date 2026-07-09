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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../users/schemas/user.schema");
const event_schema_1 = require("../events/schemas/event.schema");
const ticket_schema_1 = require("../tickets/schemas/ticket.schema");
const review_schema_1 = require("../reviews/schemas/review.schema");
let DashboardService = class DashboardService {
    constructor(userModel, eventModel, ticketModel, reviewModel) {
        this.userModel = userModel;
        this.eventModel = eventModel;
        this.ticketModel = ticketModel;
        this.reviewModel = reviewModel;
    }
    async getAdminStats() {
        const [totalUsers, totalEvents, totalTickets, activeOrganizers, totalReviews, tickets, usersByRole] = await Promise.all([
            this.userModel.countDocuments(),
            this.eventModel.countDocuments(),
            this.ticketModel.countDocuments(),
            this.eventModel.distinct('organizer'),
            this.reviewModel.countDocuments(),
            this.ticketModel.find().populate('event', 'ticketPrice'),
            this.userModel.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
        ]);
        const revenue = tickets.reduce((sum, t) => sum + (t.event?.ticketPrice || 0), 0);
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
    async getOrganizerStats(organizerId) {
        const myEvents = await this.eventModel.find({ organizer: organizerId });
        const eventIds = myEvents.map((e) => e._id);
        const tickets = await this.ticketModel
            .find({ event: { $in: eventIds } })
            .populate('user', 'name email avatar')
            .populate('event', 'title ticketPrice')
            .sort({ createdAt: -1 });
        const revenue = tickets.reduce((sum, t) => sum + (t.event?.ticketPrice || 0), 0);
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
    async getParticipantStats(userId) {
        const [tickets, user] = await Promise.all([
            this.ticketModel.find({ user: userId }).populate('event'),
            this.userModel.findById(userId),
        ]);
        const now = new Date();
        const upcoming = tickets.filter((t) => t.event && new Date(t.event.date) >= now);
        return {
            registeredEvents: tickets.length,
            upcomingEvents: upcoming.length,
            favoriteEvents: user?.favorites?.length || 0,
            recentTickets: tickets.slice(0, 5),
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(event_schema_1.Event.name)),
    __param(2, (0, mongoose_1.InjectModel)(ticket_schema_1.Ticket.name)),
    __param(3, (0, mongoose_1.InjectModel)(review_schema_1.Review.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map