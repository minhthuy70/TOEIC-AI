import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MockTestService } from './mock-test.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('mock-test')
@UseGuards(JwtAuthGuard)
export class MockTestController {
  constructor(private readonly mockTestService: MockTestService) {}

  /**
   * Lấy danh sách full test có sẵn
   */
  @Get('tests')
  async getAvailableTests() {
    return this.mockTestService.getAvailableTests();
  }

  /**
   * Bắt đầu full test
   */
  @Post('start')
  async startFullTest(
    @Request() req,
    @Body() body: { testId: number },
  ) {
    const userId = req.user.userId;
    const { testId } = body;

    return this.mockTestService.startFullTest(userId, testId);
  }

  /**
   * Nộp bài full test
   */
  @Post('submit')
  async submitFullTest(
    @Request() req,
    @Body() body: { attemptId: number; answers: Record<number, string> },
  ) {
    const userId = req.user.userId;
    const { attemptId, answers } = body;

    return this.mockTestService.submitFullTest(userId, attemptId, answers);
  }

  /**
   * Lấy lịch sử thi thử
   */
  @Get('history')
  async getHistory(@Request() req) {
    const userId = req.user.userId;
    return this.mockTestService.getTestHistory(userId);
  }

  /**
   * Lấy chi tiết một lần thi
   */
  @Get('attempt/:attemptId')
  async getAttempt(
    @Request() req,
    @Param('attemptId') attemptId: string,
  ) {
    const userId = req.user.userId;
    const attemptIdNumber = Number(attemptId);

    return this.mockTestService.getTestAttempt(userId, attemptIdNumber);
  }

  /**
   * Lấy chi tiết một full test (không tạo attempt)
   */
  @Get('test/:testId')
  async getTest(
    @Request() req,
    @Param('testId') testId: string,
  ) {
    const userId = req.user.userId;
    const testIdNumber = Number(testId);

    return this.mockTestService.startFullTest(userId, testIdNumber);
  }
}