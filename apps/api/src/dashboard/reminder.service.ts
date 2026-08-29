import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ReminderService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(userId: number) {
    try {
      let setting = await this.prisma.studyReminderSetting.findUnique({
        where: { userId },
      });

      if (!setting) {
        setting = await this.prisma.studyReminderSetting.create({
          data: {
            userId,
            enabled: true,
            reminderTime: "20:00",
            reminderType: "push",
            customMessage: "Đã đến giờ học TOEIC rồi, hãy cùng vào ôn luyện để đạt 900+ nhé! 🎯🔥",
            frequency: "daily",
            tasksEnabled: true,
            reviewsEnabled: true,
            testsEnabled: true,
            streakEnabled: true,
            snoozeMinutes: 15,
          },
        });
      }

      return {
        success: true,
        setting,
      };
    } catch (error) {
      console.error("Error getting reminder settings:", error);
      throw new Error("Failed to get reminder settings");
    }
  }

  async updateSettings(userId: number, dto: {
    enabled?: boolean;
    reminderTime?: string;
    reminderType?: string;
    customMessage?: string;
    frequency?: string;
    tasksEnabled?: boolean;
    reviewsEnabled?: boolean;
    testsEnabled?: boolean;
    streakEnabled?: boolean;
    snoozeMinutes?: number;
  }) {
    try {
      // Ensure configuration exists
      await this.getSettings(userId);

      const updated = await this.prisma.studyReminderSetting.update({
        where: { userId },
        data: {
          enabled: dto.enabled,
          reminderTime: dto.reminderTime,
          reminderType: dto.reminderType,
          customMessage: dto.customMessage,
          frequency: dto.frequency,
          tasksEnabled: dto.tasksEnabled,
          reviewsEnabled: dto.reviewsEnabled,
          testsEnabled: dto.testsEnabled,
          streakEnabled: dto.streakEnabled,
          snoozeMinutes: dto.snoozeMinutes,
        },
      });

      return {
        success: true,
        setting: updated,
        message: "Cập nhật cấu hình nhắc nhở học tập thành công!",
      };
    } catch (error) {
      console.error("Error updating reminder settings:", error);
      throw new Error("Failed to update reminder settings");
    }
  }

  async snoozeReminder(userId: number, minutes?: number) {
    try {
      const setting = await this.getSettings(userId);
      const mins = minutes || setting.setting.snoozeMinutes || 15;

      const d = new Date();
      // Add timezone offset to local time calculation
      const offset = d.getTimezoneOffset();
      const localTime = new Date(d.getTime() - offset * 60 * 1000 + mins * 60 * 1000);
      
      const pad = (n: number) => String(n).padStart(2, "0");
      const timeStr = `${pad(localTime.getUTCHours())}:${pad(localTime.getUTCMinutes())}`;

      return {
        success: true,
        snoozedUntil: timeStr,
        message: `Đã hoãn nhắc nhở học tập thêm ${mins} phút. Hệ thống sẽ nhắc lại lúc ${timeStr}!`,
      };
    } catch (error) {
      console.error("Error snoozing reminder:", error);
      throw new Error("Failed to snooze reminder");
    }
  }

  async testReminder(userId: number) {
    try {
      const res = await this.getSettings(userId);
      const s = res.setting;

      if (!s.enabled) {
        return {
          success: false,
          message: "Không thể gửi thông báo vì tính năng nhắc nhở đang bị Tắt",
        };
      }

      return {
        success: true,
        message: "Đã gửi thông báo thử nghiệm thành công!",
        notification: {
          title: "Nhắc nhở học tập TOEIC",
          body: s.customMessage,
          type: s.reminderType,
          frequency: s.frequency,
          time: s.reminderTime,
          icon: "🔔",
        },
      };
    } catch (error) {
      console.error("Error testing reminder:", error);
      throw new Error("Failed to test reminder");
    }
  }
}
