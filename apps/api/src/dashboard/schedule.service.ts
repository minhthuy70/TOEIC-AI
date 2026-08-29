import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async getSchedules(userId: number) {
    try {
      const schedules = await this.prisma.studySchedule.findMany({
        where: { userId },
        orderBy: [
          { dayOfWeek: "asc" },
          { startTime: "asc" },
        ],
      });

      return {
        success: true,
        schedules,
      };
    } catch (error) {
      console.error("Error fetching study schedules:", error);
      throw new Error("Failed to fetch study schedules");
    }
  }

  async createSchedule(userId: number, dto: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    title: string;
    sessionType: string;
    isRecurring?: boolean;
    reminder?: boolean;
  }) {
    // 1. Validate times format and logical order
    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException("Thời gian bắt đầu phải trước thời gian kết thúc");
    }

    // 2. Conflict detection: Check for overlapping times on the same day
    const conflict = await this.prisma.studySchedule.findFirst({
      where: {
        userId,
        dayOfWeek: dto.dayOfWeek,
        startTime: { lt: dto.endTime },
        endTime: { gt: dto.startTime },
      },
    });

    if (conflict) {
      throw new BadRequestException(
        `Xung đột lịch học: Khung giờ này chồng chéo với phiên học "${conflict.title}" (${conflict.startTime} - ${conflict.endTime})`
      );
    }

    // 3. Create schedule
    const newSchedule = await this.prisma.studySchedule.create({
      data: {
        userId,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        title: dto.title,
        sessionType: dto.sessionType,
        isRecurring: dto.isRecurring ?? true,
        reminder: dto.reminder ?? false,
      },
    });

    return {
      success: true,
      schedule: newSchedule,
      message: "Tạo lịch học mới thành công!",
    };
  }

  async updateSchedule(userId: number, id: number, dto: {
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
    title?: string;
    sessionType?: string;
    isRecurring?: boolean;
    reminder?: boolean;
  }) {
    const existing = await this.prisma.studySchedule.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== userId) {
      throw new NotFoundException("Không tìm thấy phiên học");
    }

    const nextDayOfWeek = dto.dayOfWeek ?? existing.dayOfWeek;
    const nextStartTime = dto.startTime ?? existing.startTime;
    const nextEndTime = dto.endTime ?? existing.endTime;

    if (nextStartTime >= nextEndTime) {
      throw new BadRequestException("Thời gian bắt đầu phải trước thời gian kết thúc");
    }

    // Conflict detection, excluding current item ID
    const conflict = await this.prisma.studySchedule.findFirst({
      where: {
        userId,
        id: { not: id },
        dayOfWeek: nextDayOfWeek,
        startTime: { lt: nextEndTime },
        endTime: { gt: nextStartTime },
      },
    });

    if (conflict) {
      throw new BadRequestException(
        `Xung đột lịch học: Khung giờ này chồng chéo với phiên học "${conflict.title}" (${conflict.startTime} - ${conflict.endTime})`
      );
    }

    const updated = await this.prisma.studySchedule.update({
      where: { id },
      data: {
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        title: dto.title,
        sessionType: dto.sessionType,
        isRecurring: dto.isRecurring,
        reminder: dto.reminder,
      },
    });

    return {
      success: true,
      schedule: updated,
      message: "Cập nhật lịch học thành công!",
    };
  }

  async deleteSchedule(userId: number, id: number) {
    const existing = await this.prisma.studySchedule.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== userId) {
      throw new NotFoundException("Không tìm thấy phiên học");
    }

    await this.prisma.studySchedule.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Đã xóa phiên học khỏi lịch trình!",
    };
  }

  async copySchedule(userId: number, fromDay: number, toDays: number[]) {
    try {
      const sourceSchedules = await this.prisma.studySchedule.findMany({
        where: { userId, dayOfWeek: fromDay },
      });

      if (sourceSchedules.length === 0) {
        throw new BadRequestException("Không có phiên học nào ở ngày nguồn để sao chép");
      }

      await this.prisma.$transaction(async (tx) => {
        // 1. Delete target days' existing schedules
        await tx.studySchedule.deleteMany({
          where: {
            userId,
            dayOfWeek: { in: toDays },
          },
        });

        // 2. Clone to target days
        for (const targetDay of toDays) {
          for (const source of sourceSchedules) {
            await tx.studySchedule.create({
              data: {
                userId,
                dayOfWeek: targetDay,
                startTime: source.startTime,
                endTime: source.endTime,
                title: source.title,
                sessionType: source.sessionType,
                isRecurring: source.isRecurring,
                reminder: source.reminder,
              },
            });
          }
        }
      });

      return {
        success: true,
        message: `Sao chép lịch học thành công sang ${toDays.length} ngày! 🎉`,
      };
    } catch (error) {
      console.error("Error copying schedule:", error);
      throw new BadRequestException(error.message || "Failed to copy schedule");
    }
  }
}
