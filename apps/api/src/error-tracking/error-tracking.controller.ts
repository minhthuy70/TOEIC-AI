import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ErrorTrackingService, AddErrorLogDto } from "./error-tracking.service";

@UseGuards(JwtAuthGuard)
@Controller("error-log")
export class ErrorTrackingController {
  constructor(private readonly errorTrackingService: ErrorTrackingService) {}

  private getUserId(req: any): number {
    const userId = req.user?.userId;
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new BadRequestException("User ID không hợp lệ.");
    }
    return userId;
  }

  // ==========================================================
  // GET /error-log
  // ==========================================================
  @Get()
  async getErrorLogs(
    @Req() req: any,
    @Query("errorType") errorType?: string,
    @Query("part") part?: string,
    @Query("dateRange") dateRange?: string,
    @Query("status") status?: string,
    @Query("search") search?: string,
    @Query("sortBy") sortBy?: string,
    @Query("sortOrder") sortOrder?: "asc" | "desc",
  ) {
    const userId = this.getUserId(req);
    return this.errorTrackingService.getErrorLogs(userId, {
      errorType,
      part: part ? Number(part) : undefined,
      dateRange,
      status,
      search,
      sortBy,
      sortOrder,
    });
  }

  // ==========================================================
  // GET /error-log/analysis (8.2 ERROR ANALYSIS)
  // ==========================================================
  @Get("analysis")
  async getErrorAnalysis(@Req() req: any) {
    const userId = this.getUserId(req);
    return this.errorTrackingService.getErrorAnalysis(userId);
  }

  // ==========================================================
  // 8.3 ERROR DRILLS ENDPOINTS
  // ==========================================================
  @Post("drill/generate")
  async generateDrill(
    @Req() req: any,
    @Body() body: { mode?: "top10" | "type" | "all"; errorType?: string; limit?: number; part?: number },
  ) {
    const userId = this.getUserId(req);
    return this.errorTrackingService.generateDrill(userId, body);
  }

  @Post("drill/submit")
  async submitDrill(
    @Req() req: any,
    @Body() payload: { results: Array<{ errorLogId: number; isCorrect: boolean; selectedOption: string }>; durationSeconds: number },
  ) {
    const userId = this.getUserId(req);
    return this.errorTrackingService.submitDrill(userId, payload);
  }

  @Post("drill/schedule")
  async scheduleDrill(
    @Req() req: any,
    @Body() dto: { errorType?: string; repeatInDays: number; note?: string },
  ) {
    const userId = this.getUserId(req);
    return this.errorTrackingService.scheduleDrill(userId, dto);
  }

  // ==========================================================
  // GET /error-log/:id
  // ==========================================================
  @Get(":id")
  async getErrorLogDetail(
    @Req() req: any,
    @Param("id", ParseIntPipe) id: number,
  ) {
    const userId = this.getUserId(req);
    return this.errorTrackingService.getErrorLogDetail(userId, id);
  }

  // ==========================================================
  // POST /error-log
  // ==========================================================
  @Post()
  async addErrorLog(
    @Req() req: any,
    @Body() dto: AddErrorLogDto,
  ) {
    const userId = this.getUserId(req);
    return this.errorTrackingService.addErrorLog(userId, dto);
  }

  // ==========================================================
  // PATCH /error-log/:id/status
  // ==========================================================
  @Patch(":id/status")
  async updateStatus(
    @Req() req: any,
    @Param("id", ParseIntPipe) id: number,
    @Body("status") status: "active" | "resolved",
  ) {
    const userId = this.getUserId(req);
    if (!status || (status !== "active" && status !== "resolved")) {
      throw new BadRequestException("Trạng thái phải là 'active' hoặc 'resolved'.");
    }
    return this.errorTrackingService.updateStatus(userId, id, status);
  }

  // ==========================================================
  // PATCH /error-log/:id/note
  // ==========================================================
  @Patch(":id/note")
  async updateNote(
    @Req() req: any,
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { userNote: string; errorType?: string },
  ) {
    const userId = this.getUserId(req);
    return this.errorTrackingService.updateNote(userId, id, body.userNote, body.errorType);
  }

  // ==========================================================
  // DELETE /error-log/:id
  // ==========================================================
  @Delete(":id")
  async deleteErrorLog(
    @Req() req: any,
    @Param("id", ParseIntPipe) id: number,
  ) {
    const userId = this.getUserId(req);
    return this.errorTrackingService.deleteErrorLog(userId, id);
  }
}
