import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";

import { AuthGuard } from "@nestjs/passport";

import { MockTestService } from "./mock-test.service";

// Temporarily disable auth guard for testing
// TODO: Re-enable @UseGuards(AuthGuard("jwt")) after fixing authentication
@UseGuards(JwtAuthGuard)
@Controller("mock-test")
export class MockTestController {
  constructor(
    private readonly mockTestService: MockTestService,
  ) {}

  // ==========================================================
  // LẤY USER ID
  // ==========================================================

  private getUserId(req: any): number {
    const userId =
      req.user.userId;

    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      throw new BadRequestException(
        "Không xác định được người dùng đăng nhập.",
      );
    }

    return userId;
  }

  // ==========================================================
  // DANH SÁCH ĐỀ
  // GET /mock-test/tests
  // ==========================================================

  @Get("tests")
  async getTests() {
    return this.mockTestService.getTests();
  }

  // ==========================================================
  // MINI TEST (50 CÂU)
  // ==========================================================

  @Post("mini-test/start")
  async startMiniTest(
    @Req() req: any,
    @Body()
    body: {
      parts?: number[];
      timeLimitMinutes?: number;
      totalQuestions?: number;
      testId?: number;
    },
  ) {
    const userId = this.getUserId(req);
    return this.mockTestService.startMiniTest(userId, body);
  }

  @Post("mini-test/submit")
  async submitMiniTest(
    @Req() req: any,
    @Body()
    body: {
      answers: Array<{ questionId: number; optionId: number }>;
      durationSeconds?: number;
      partTimes?: Record<number, number>;
      markedQuestionIds?: number[];
    },
  ) {
    const userId = this.getUserId(req);
    return this.mockTestService.submitMiniTest(userId, body);
  }

  // ==========================================================
  // BẮT ĐẦU THI
  // POST /mock-test/start
  // ==========================================================

  @Post("start")
  async startTest(
    @Req() req: any,

    @Body()
    body: {
      testId: number;
    },
  ) {
    const userId =
      this.getUserId(req);

    const testId =
      Number(body?.testId);

    if (
      !Number.isInteger(testId) ||
      testId <= 0
    ) {
      throw new BadRequestException(
        "testId không hợp lệ.",
      );
    }

    return this.mockTestService.startTest(
      userId,
      testId,
    );
  }

  // ==========================================================
  // NỘP BÀI
  // POST /mock-test/submit
  // ==========================================================

  @Post("submit")
  async submitTest(
    @Req() req: any,

    @Body()
    body: {
      attemptId: number;

      answers: Array<{
        questionId: number;
        optionId: number;
      }>;
    },
  ) {
    const userId =
      this.getUserId(req);

    const attemptId =
      Number(body?.attemptId);

    if (
      !Number.isInteger(attemptId) ||
      attemptId <= 0
    ) {
      throw new BadRequestException(
        "attemptId không hợp lệ.",
      );
    }

    const answers =
      Array.isArray(
        body?.answers,
      )
        ? body.answers
        : [];

    return this.mockTestService.submitTest(
      userId,
      attemptId,
      answers,
    );
  }

  // ==========================================================
  // LỊCH SỬ
  // GET /mock-test/history
  // ==========================================================

  @Get("history")
  async getHistory(
    @Req() req: any,
  ) {
    const userId =
      this.getUserId(req);

    return this.mockTestService.getHistory(
      userId,
    );
  }

  // ==========================================================
  // KẾT QUẢ CHI TIẾT
  //
  // GET /mock-test/result/:attemptId
  //
  // API NÀY TRẢ ĐÁP ÁN ĐÚNG
  // CHỈ SAU KHI BÀI ĐÃ NỘP
  // ==========================================================

  @Get("result/:attemptId")
  async getResult(
    @Req() req: any,

    @Param(
      "attemptId",
      ParseIntPipe,
    )
    attemptId: number,
  ) {
    const userId =
      this.getUserId(req);

    return this.mockTestService.getResult(
      userId,
      attemptId,
    );
  }

  // ==========================================================
  // CHI TIẾT ATTEMPT
  // GET /mock-test/attempt/:attemptId
  // ==========================================================

  @Get("attempt/:attemptId")
  async getAttempt(
    @Req() req: any,

    @Param(
      "attemptId",
      ParseIntPipe,
    )
    attemptId: number,
  ) {
    const userId =
      this.getUserId(req);

    return this.mockTestService.getAttempt(
      userId,
      attemptId,
    );
  }

  // ==========================================================
  // THÔNG TIN TEST
  // GET /mock-test/test/:testId
  // ==========================================================

  @Get("test/:testId")
  async getTest(
    @Param(
      "testId",
      ParseIntPipe,
    )
    testId: number,
  ) {
    return this.mockTestService.getTest(
      testId,
    );
  }
}