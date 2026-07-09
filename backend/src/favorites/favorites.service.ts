import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class FavoritesService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async list(userId: string) {
    const user = await this.userModel.findById(userId).populate({
      path: 'favorites',
      populate: { path: 'category', select: 'name' },
    });
    if (!user) throw new NotFoundException('User not found');
    return user.favorites;
  }

  // Adds the event if not already favorited, removes it if it is (toggle)
  async toggle(userId: string, eventId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const index = user.favorites.findIndex((id) => id.toString() === eventId);
    let isFavorite: boolean;

    if (index === -1) {
      user.favorites.push(eventId as any);
      isFavorite = true;
    } else {
      user.favorites.splice(index, 1);
      isFavorite = false;
    }

    await user.save();
    return { isFavorite };
  }
}
