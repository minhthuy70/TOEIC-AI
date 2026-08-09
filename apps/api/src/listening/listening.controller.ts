import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ListeningService } from './listening.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('listening')
@UseGuards(JwtAuthGuard)
export class ListeningController {
  constructor(private readonly listeningService: ListeningService) {}

  @Get('daily-status')
  async getDailyStatus(@Request() req) {
    return this.listeningService.getDailyStatus(req.user.userId);
  }

  @Get('daily-groups')
  async getDailyGroups(@Request() req) {
    return this.listeningService.getDailyGroups(req.user.userId);
  }

  @Post('submit-group')
  async submitGroup(
    @Request() req,
    @Body('groupId') groupId: number,
    @Body('score') score: number,
  ) {
    return this.listeningService.submitGroup(req.user.userId, groupId, score);
  }
}
