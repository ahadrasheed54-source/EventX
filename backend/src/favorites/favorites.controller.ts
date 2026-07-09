import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Favorites')
@ApiBearerAuth()
@Controller('favorites')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('participant')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get('mine')
  list(@CurrentUser() user: any) {
    return this.favoritesService.list(user.userId);
  }

  // Toggles favorite status for one event (adds if missing, removes if present)
  @Post(':eventId')
  toggle(@Param('eventId') eventId: string, @CurrentUser() user: any) {
    return this.favoritesService.toggle(user.userId, eventId);
  }
}
