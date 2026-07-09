import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { CategoriesModule } from './categories/categories.module';
import { TicketsModule } from './tickets/tickets.module';
import { ReviewsModule } from './reviews/reviews.module';
import { NotificationsModule } from './notifications/notifications.module';
import { FavoritesModule } from './favorites/favorites.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    // Load .env once, available everywhere via ConfigService
    ConfigModule.forRoot({ isGlobal: true }),

    // Connect to MongoDB using the URI from .env
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventx'),

    // Serve uploaded images at http://localhost:5000/uploads/...
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    AuthModule,
    UsersModule,
    EventsModule,
    CategoriesModule,
    TicketsModule,
    ReviewsModule,
    NotificationsModule,
    FavoritesModule,
    DashboardModule,
  ],
})
export class AppModule {}
