import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(@InjectModel(Review.name) private reviewModel: Model<ReviewDocument>) {}

  async create(userId: string, dto: CreateReviewDto) {
    const existing = await this.reviewModel.findOne({ user: userId, event: dto.eventId });
    if (existing) {
      throw new ConflictException('You already reviewed this event');
    }

    return this.reviewModel.create({
      user: userId,
      event: dto.eventId,
      rating: dto.rating,
      comment: dto.comment || '',
    });
  }

  // Public: reviews for a single event, newest first
  async findByEvent(eventId: string, page = 1, limit = 10) {
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
        { $match: { event: new Types.ObjectId(eventId) } },
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

  async findMine(userId: string) {
    return this.reviewModel.find({ user: userId }).populate('event', 'title image date').sort({ createdAt: -1 });
  }

  // Admin can delete any review; a participant can delete their own
  async remove(id: string, currentUser: { userId: string; role: string }) {
    const review = await this.reviewModel.findById(id);
    if (!review) throw new NotFoundException('Review not found');

    const isOwner = review.user.toString() === currentUser.userId;
    const isAdmin = currentUser.role === 'admin';
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You are not allowed to delete this review');
    }

    await this.reviewModel.findByIdAndDelete(id);
    return { message: 'Review deleted successfully' };
  }
}
