import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

import { ReadingService } from './reading.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Temporarily disable auth guard for testing
// TODO: Re-enable @UseGuards(JwtAuthGuard) after fixing authentication
@Controller('reading')
export class ReadingController {
  constructor(
    private readonly readingService: ReadingService,
  ) {}

  /**
   * =========================================================
   * DAILY STATUS
   * =========================================================
   *
   * Trả về:
   * - stage của user
   * - 2 Part cần học hôm nay
   * - số group đã hoàn thành hôm nay
   * - dailyGoal = 2
   */
  @Get('daily-status')
  async getDailyStatus(@Request() req) {
    return this.readingService.getDailyStatus(
      req.user?.userId || 1, // Default to user ID 1 for testing
    );
  }

  /**
   * =========================================================
   * DAILY LESSONS
   * =========================================================
   *
   * Mỗi ngày:
   * - 2 Part
   * - mỗi Part đúng 1 GROUP
   */
  @Get('daily-lessons')
  async getDailyLessons(@Request() req) {
    return this.readingService.getDailyLessons(
      req.user?.userId || 1, // Default to user ID 1 for testing
    );
  }

  /**
   * =========================================================
   * REVIEW LESSONS
   * =========================================================
   *
   * Chỉ trả về các GROUP đã completed.
   */
  @Get('review-lessons')
  async getReviewLessons(@Request() req) {
    return this.readingService.getReviewLessons(
      req.user?.userId || 1, // Default to user ID 1 for testing
    );
  }

  /**
   * =========================================================
   * COMPLETED LESSONS
   * =========================================================
   *
   * Danh sách lesson có group đã học.
   */
  @Get('completed-lessons')
  async getCompletedLessons(@Request() req) {
    return this.readingService.getCompletedLessons(
      req.user?.userId || 1, // Default to user ID 1 for testing
    );
  }

  /**
   * =========================================================
   * GET LESSON
   * =========================================================
   *
   * Có thể truyền:
   *
   * /reading/lesson/1
   *
   * hoặc:
   *
   * /reading/lesson/1?groupId=10
   *
   * Nếu có groupId -> backend chỉ trả đúng GROUP đó.
   */
  @Get('lesson/:id')
  async getLessonById(
    @Param('id') id: string,
    @Query('groupId') groupId?: string,
  ) {
    return this.readingService.getLessonById(
      Number(id),
      groupId
        ? Number(groupId)
        : undefined,
    );
  }

  /**
   * =========================================================
   * SUBMIT GROUP
   * =========================================================
   *
   * Quan trọng:
   * Reading progress được lưu theo GROUP.
   *
   * Body:
   * {
   *   lessonId: 1,
   *   groupId: 10,
   *   score: 80
   * }
   */
  @Post('submit-lesson')
  async submitLesson(
    @Request() req,
    @Body('lessonId') lessonId: number,
    @Body('groupId') groupId: number,
    @Body('score') score: number,
  ) {
    return this.readingService.submitLesson(
      req.user?.userId || 1, // Default to user ID 1 for testing
      Number(lessonId),
      Number(groupId),
      Number(score),
    );
  }
}