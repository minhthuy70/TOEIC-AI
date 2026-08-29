import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
  ParseIntPipe,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PlannerService } from "./planner.service";

@UseGuards(JwtAuthGuard)
@Controller("dashboard/planner")
export class PlannerController {
  constructor(private readonly plannerService: PlannerService) {}

  private getTodayString(): string {
    const d = new Date();
    // Offset local timezone
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split("T")[0];
  }

  @Get("tasks")
  async getDailyTasks(
    @Req() req: any,
    @Query("date") date?: string
  ) {
    try {
      const userId = req.user.userId;
      const targetDate = date || this.getTodayString();
      return await this.plannerService.getDailyTasks(userId, targetDate);
    } catch (error) {
      console.error("Get daily tasks error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: error.status || 500 },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("tasks")
  async createTask(
    @Req() req: any,
    @Body() dto: {
      title: string;
      duration: number;
      notes?: string;
      reminder?: boolean;
      taskDate?: string;
    }
  ) {
    try {
      const userId = req.user.userId;
      const payload = {
        ...dto,
        taskDate: dto.taskDate || this.getTodayString(),
      };
      return await this.plannerService.createTask(userId, payload);
    } catch (error) {
      console.error("Create daily task error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: error.status || 500 },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put("tasks/:id")
  async updateTask(
    @Req() req: any,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: {
      title?: string;
      duration?: number;
      notes?: string;
      reminder?: boolean;
      completed?: boolean;
    }
  ) {
    try {
      const userId = req.user.userId;
      return await this.plannerService.updateTask(userId, id, dto);
    } catch (error) {
      console.error("Update daily task error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: error.status || 500 },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete("tasks/:id")
  async deleteTask(
    @Req() req: any,
    @Param("id", ParseIntPipe) id: number
  ) {
    try {
      const userId = req.user.userId;
      return await this.plannerService.deleteTask(userId, id);
    } catch (error) {
      console.error("Delete daily task error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: error.status || 500 },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("tasks/reorder")
  async reorderTasks(
    @Req() req: any,
    @Body() dto: {
      taskIds: number[];
    }
  ) {
    try {
      const userId = req.user.userId;
      return await this.plannerService.reorderTasks(userId, dto.taskIds);
    } catch (error) {
      console.error("Reorder tasks error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: error.status || 500 },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("timeline")
  async getCombinedTimeline(
    @Req() req: any,
    @Query("date") date?: string
  ) {
    try {
      const userId = req.user.userId;
      const targetDate = date || this.getTodayString();
      return await this.plannerService.getCombinedTimeline(userId, targetDate);
    } catch (error) {
      console.error("Get combined timeline error:", error);
      throw new HttpException(
        { message: error.message || "Internal server error", statusCode: error.status || 500 },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
