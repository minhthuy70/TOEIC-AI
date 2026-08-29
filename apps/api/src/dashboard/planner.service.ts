import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PlannerService {
  constructor(private readonly prisma: PrismaService) {}

  private getStartAndEndOfDay(dateStr: string) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new BadRequestException("Định dạng ngày không hợp lệ. Vui lòng dùng YYYY-MM-DD");
    }
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return { start, end, dayOfWeek: date.getDay() };
  }

  async getDailyTasks(userId: number, dateStr: string) {
    const { start, end } = this.getStartAndEndOfDay(dateStr);

    try {
      const tasks = await this.prisma.dailyTask.findMany({
        where: {
          userId,
          taskDate: {
            gte: start,
            lte: end,
          },
        },
        orderBy: { displayOrder: "asc" },
      });

      return {
        success: true,
        tasks,
      };
    } catch (error) {
      console.error("Error fetching daily tasks:", error);
      throw new Error("Failed to fetch daily tasks");
    }
  }

  async createTask(userId: number, dto: {
    title: string;
    duration: number;
    notes?: string;
    reminder?: boolean;
    taskDate: string;
  }) {
    const { start, end } = this.getStartAndEndOfDay(dto.taskDate);

    // Find the next display order for that day
    const maxOrder = await this.prisma.dailyTask.aggregate({
      where: {
        userId,
        taskDate: {
          gte: start,
          lte: end,
        },
      },
      _max: { displayOrder: true },
    });
    const nextOrder = (maxOrder._max.displayOrder ?? -1) + 1;

    const newTask = await this.prisma.dailyTask.create({
      data: {
        userId,
        title: dto.title,
        duration: dto.duration,
        notes: dto.notes,
        reminder: dto.reminder ?? false,
        taskDate: start,
        displayOrder: nextOrder,
        completed: false,
      },
    });

    return {
      success: true,
      task: newTask,
      message: "Thêm nhiệm vụ mới thành công!",
    };
  }

  async updateTask(userId: number, id: number, dto: {
    title?: string;
    duration?: number;
    notes?: string;
    reminder?: boolean;
    completed?: boolean;
  }) {
    const existing = await this.prisma.dailyTask.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== userId) {
      throw new NotFoundException("Không tìm thấy nhiệm vụ");
    }

    const updated = await this.prisma.dailyTask.update({
      where: { id },
      data: {
        title: dto.title,
        duration: dto.duration,
        notes: dto.notes,
        reminder: dto.reminder,
        completed: dto.completed,
      },
    });

    return {
      success: true,
      task: updated,
      message: "Cập nhật nhiệm vụ thành công!",
    };
  }

  async deleteTask(userId: number, id: number) {
    const existing = await this.prisma.dailyTask.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== userId) {
      throw new NotFoundException("Không tìm thấy nhiệm vụ");
    }

    await this.prisma.dailyTask.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Đã xóa nhiệm vụ khỏi kế hoạch ngày!",
    };
  }

  async reorderTasks(userId: number, taskIds: number[]) {
    try {
      await this.prisma.$transaction(async (tx) => {
        for (let i = 0; i < taskIds.length; i++) {
          await tx.dailyTask.updateMany({
            where: { id: taskIds[i], userId },
            data: { displayOrder: i },
          });
        }
      });

      return {
        success: true,
        message: "Sắp xếp lại nhiệm vụ thành công!",
      };
    } catch (error) {
      console.error("Error reordering tasks:", error);
      throw new BadRequestException("Sắp xếp lại nhiệm vụ thất bại");
    }
  }

  async getCombinedTimeline(userId: number, dateStr: string) {
    const { start, end, dayOfWeek } = this.getStartAndEndOfDay(dateStr);

    try {
      // 1. Fetch weekly recurring study schedules for this day of week
      const weeklySchedules = await this.prisma.studySchedule.findMany({
        where: { userId, dayOfWeek },
        orderBy: { startTime: "asc" },
      });

      // 2. Fetch custom tasks for this specific date
      const customTasks = await this.prisma.dailyTask.findMany({
        where: {
          userId,
          taskDate: {
            gte: start,
            lte: end,
          },
        },
        orderBy: { displayOrder: "asc" },
      });

      return {
        success: true,
        weeklySchedules,
        customTasks,
      };
    } catch (error) {
      console.error("Error building combined timeline:", error);
      throw new Error("Failed to build combined timeline");
    }
  }
}
