import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ReadingService } from './reading.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reading')
@UseGuards(JwtAuthGuard)
export class ReadingController {
  constructor(private readonly readingService: ReadingService) {}

  @Get('daily-status')
  async getDailyStatus(@Request() req) {
    return this.readingService.getDailyStatus(req.user.userId);
  }

  @Get('daily-lessons')
  async getDailyLessons(@Request() req) {
    return this.readingService.getDailyLessons(req.user.userId);
  }

  @Get('review-lessons')
  async getReviewLessons(@Request() req) {
    return this.readingService.getReviewLessons(req.user.userId);
  }

  @Get('completed-lessons')
  async getCompletedLessons(@Request() req) {
    return this.readingService.getCompletedLessons(req.user.userId);
  }

  @Get('lesson/:id')
  async getLessonById(@Param('id') id: string) {
    return this.readingService.getLessonById(Number(id));
  }

  @Post('submit-lesson')
  async submitLesson(
    @Request() req,
    @Body('lessonId') lessonId: number,
    @Body('score') score: number,
  ) {
    return this.readingService.submitLesson(req.user.userId, lessonId, score);
  }
}
