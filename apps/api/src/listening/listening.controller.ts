import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ListeningService } from './listening.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Temporarily disable auth guard for testing
// TODO: Re-enable @UseGuards(JwtAuthGuard) after fixing authentication
@Controller('listening')
export class ListeningController {
  constructor(private readonly listeningService: ListeningService) {}

  @Get('dashboard')
  async getDashboard(@Request() req) {
    return this.listeningService.getListeningDashboard(req.user?.userId || 1); // Default to user ID 1 for testing
  }

  @Get('daily-status')
  async getDailyStatus(@Request() req) {
    return this.listeningService.getDailyStatus(req.user?.userId || 1); // Default to user ID 1 for testing
  }

  @Get('daily-groups')
  async getDailyGroups(@Request() req) {
    return this.listeningService.getDailyGroups(req.user?.userId || 1); // Default to user ID 1 for testing
  }

  @Get('review-groups')
  async getReviewGroups(@Request() req) {
    return this.listeningService.getReviewGroups(req.user?.userId || 1); // Default to user ID 1 for testing
  }

  @Get('completed-lessons')
  async getCompletedLessons(@Request() req) {
    return this.listeningService.getCompletedLessons(req.user?.userId || 1); // Default to user ID 1 for testing
  }

  @Get('review/lesson/:lessonId')
  async getLessonReview(@Request() req, @Param('lessonId') lessonId: string) {
    return this.listeningService.getLessonReview(req.user?.userId || 1, Number(lessonId)); // Default to user ID 1 for testing
  }

  @Get('review/all')
  async getAllLessonReview(@Request() req) {
    return this.listeningService.getAllLessonReview(req.user?.userId || 1); // Default to user ID 1 for testing
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
    return this.listeningService.submitGroup(req.user?.userId || 1, groupId, score); // Default to user ID 1 for testing
  }
}
