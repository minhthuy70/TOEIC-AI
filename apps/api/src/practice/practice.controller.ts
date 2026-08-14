import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PracticeService } from './practice.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('practice')
@UseGuards(JwtAuthGuard)
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  /**
   * Bắt đầu luyện tập - lấy câu hỏi theo Part
   */
  @Post('start')
  async startPractice(
    @Request() req,
    @Body() body: { part: number; questionCount?: number; random?: boolean },
  ) {
    const userId = req.user.userId;
    const { part, questionCount, random } = body;

    return this.practiceService.getPracticeQuestions(userId, part, questionCount, random);
  }

  /**
   * Nộp bài luyện tập
   */
  @Post('submit')
  async submitPractice(
    @Request() req,
    @Body() body: { sessionId: number; answers: Record<number, string> },
  ) {
    const userId = req.user.userId;
    const { sessionId, answers } = body;

    return this.practiceService.submitPractice(userId, sessionId, answers);
  }

  /**
   * Lấy lịch sử luyện tập
   */
  @Get('history')
  async getHistory(
    @Request() req,
    @Query('part') part?: string,
  ) {
    const userId = req.user.userId;
    const partNumber = part ? Number(part) : undefined;

    return this.practiceService.getPracticeHistory(userId, partNumber);
  }

  /**
   * Lấy chi tiết một session luyện tập
   */
  @Get('session/:sessionId')
  async getSession(
    @Request() req,
    @Param('sessionId') sessionId: string,
  ) {
    const userId = req.user.userId;
    const sessionIdNumber = Number(sessionId);

    return this.practiceService.getPracticeSession(userId, sessionIdNumber);
  }

  /**
   * Lấy danh sách câu hỏi cho một Part (không tạo session)
   */
  @Get('questions')
  async getQuestions(
    @Request() req,
    @Query('part') part: string,
    @Query('questionCount') questionCount?: string,
    @Query('random') random?: string,
  ) {
    const userId = req.user.userId;
    const partNumber = Number(part);
    const questionCountNumber = questionCount ? Number(questionCount) : undefined;
    const isRandom = random === 'true';

    return this.practiceService.getPracticeQuestions(userId, partNumber, questionCountNumber, isRandom);
  }
}