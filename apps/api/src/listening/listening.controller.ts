import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
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

  @Get('review-groups')
  async getReviewGroups(@Request() req) {
    return this.listeningService.getReviewGroups(req.user.userId);
  }

  @Get('completed-lessons')
  async getCompletedLessons(@Request() req) {
    return this.listeningService.getCompletedLessons(req.user.userId);
  }

  @Get('review/lesson/:lessonId')
  async getLessonReview(@Request() req, @Param('lessonId') lessonId: string) {
    return this.listeningService.getLessonReview(req.user.userId, Number(lessonId));
  }

  @Get('review/all')
  async getAllLessonReview(@Request() req) {
    return this.listeningService.getAllLessonReview(req.user.userId);
  }

  @Get('group/:id')
  async getGroupById(@Param('id') id: string) {
    return this.listeningService.getGroupById(Number(id));
  }

  @Post('submit-group')
  async submitGroup(
    @Request() req,
    @Body('groupId') groupId: number,
    @Body('score') score: number,
  ) {
    return this.listeningService.submitGroup(req.user.userId, groupId, score);
  }

  @Get('group/:id')
  async getGroupById(@Param('id') id: string) {
    return this.listeningService.getGroupById(Number(id));
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
