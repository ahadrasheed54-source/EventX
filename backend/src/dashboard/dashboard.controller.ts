import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @Roles('admin')
  admin() {
    return this.dashboardService.getAdminStats();
  }

  @Get('organizer')
  @Roles('organizer', 'admin')
  organizer(@CurrentUser() user: any) {
    return this.dashboardService.getOrganizerStats(user.userId);
  }

  @Get('participant')
  @Roles('participant')
  participant(@CurrentUser() user: any) {
    return this.dashboardService.getParticipantStats(user.userId);
  }
}
