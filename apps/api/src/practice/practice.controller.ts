import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Query,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";

import { PracticeService } from "./practice.service";
import { SubmitPracticeDto } from "./dto/submit-practice.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

// Temporarily disable auth guard for testing
// TODO: Re-enable @UseGuards(JwtAuthGuard) after fixing authentication
@Controller("practice")
export class PracticeController {
  constructor(
    private readonly practiceService: PracticeService,
  ) {}

  // ============================================================
  // LẤY USER ID CỦA NGƯỜI ĐANG ĐĂNG NHẬP
  //
  // JwtStrategy hiện tại của project trả về:
  //
  // {
  //   userId: payload.sub,
  //   email: payload.email,
  //   role: payload.role
  // }
  //
  // Vì vậy phần Luyện tập phải dùng req.user.userId
  // ============================================================

  private getUserId(req: any): number {
    const userId = Number(req?.user?.userId) || 1; // Default to user ID 1 for testing

    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      throw new UnauthorizedException(
        "Không xác định được người dùng đăng nhập",
      );
    }

    return userId;
  }

  // ============================================================
  // START PRACTICE
  //
  // GET /practice/start/:part
  //
  // Ví dụ:
  // GET /practice/start/1
  // GET /practice/start/2
  // ...
  // GET /practice/start/7
  // ============================================================

  @Get("start/:part")
  async startPractice(
    @Param("part", ParseIntPipe) part: number,
    @Query("count") countStr: string,
    @Req() req: any,
  ) {
    if (part < 1 || part > 7) {
      throw new BadRequestException(
        "Part phải nằm trong khoảng từ 1 đến 7",
      );
    }

    const userId = this.getUserId(req);

    const count = countStr === "all" ? 999 : parseInt(countStr, 10);
    const validCount = isNaN(count) ? undefined : count;

    return this.practiceService.startPractice(
      userId,
      part,
      validCount,
    );
  }

  // ============================================================
  // SUBMIT PRACTICE
  //
  // POST /practice/submit
  // ============================================================

  @Post("submit")
  async submitPractice(
    @Body() dto: SubmitPracticeDto,
    @Req() req: any,
  ) {
    const userId = this.getUserId(req);

    return this.practiceService.submitPractice(
      userId,
      dto,
    );
  }

  // ============================================================
  // HISTORY
  //
  // GET /practice/history
  // ============================================================

  @Get("history")
  async getHistory(@Req() req: any) {
    const userId = this.getUserId(req);

    return this.practiceService.getHistory(
      userId,
    );
  }

  // ============================================================
  // HISTORY DETAIL
  //
  // GET /practice/history/:id
  // ============================================================

  @Get("history/:id")
  async getHistoryDetail(
    @Param("id", ParseIntPipe) sessionId: number,
    @Req() req: any,
  ) {
    const userId = this.getUserId(req);

    return this.practiceService.getHistoryDetail(
      userId,
      sessionId,
    );
  }
}