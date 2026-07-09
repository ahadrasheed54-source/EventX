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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const review_schema_1 = require("./schemas/review.schema");
let ReviewsService = class ReviewsService {
    constructor(reviewModel) {
        this.reviewModel = reviewModel;
    }
    async create(userId, dto) {
        const existing = await this.reviewModel.findOne({ user: userId, event: dto.eventId });
        if (existing) {
            throw new common_1.ConflictException('You already reviewed this event');
        }
        return this.reviewModel.create({
            user: userId,
            event: dto.eventId,
            rating: dto.rating,
            comment: dto.comment || '',
        });
    }
    async findByEvent(eventId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [data, total, avg] = await Promise.all([
            this.reviewModel
                .find({ event: eventId })
                .populate('user', 'name avatar')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            this.reviewModel.countDocuments({ event: eventId }),
            this.reviewModel.aggregate([
                { $match: { event: new mongoose_2.Types.ObjectId(eventId) } },
                { $group: { _id: null, avgRating: { $avg: '$rating' } } },
            ]),
        ]);
        return {
            data,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            averageRating: avg[0]?.avgRating ? Number(avg[0].avgRating.toFixed(1)) : 0,
        };
    }
    async findMine(userId) {
        return this.reviewModel.find({ user: userId }).populate('event', 'title image date').sort({ createdAt: -1 });
    }
    async remove(id, currentUser) {
        const review = await this.reviewModel.findById(id);
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        const isOwner = review.user.toString() === currentUser.userId;
        const isAdmin = currentUser.role === 'admin';
        if (!isOwner && !isAdmin) {
            throw new common_1.ForbiddenException('You are not allowed to delete this review');
        }
        await this.reviewModel.findByIdAndDelete(id);
        return { message: 'Review deleted successfully' };
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(review_schema_1.Review.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map