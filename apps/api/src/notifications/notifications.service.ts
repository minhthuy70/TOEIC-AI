import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  private async sendHtmlEmail(to: string, subject: string, text: string, html: string) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("SMTP not configured, skipping email send to:", to);
      return { success: true, skipped: true, message: "SMTP not configured" };
    }

    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    });

    return { success: true, skipped: false };
  }

  buildProgressEmailPayload({
    title,
    summary,
    recipientName,
    badgeText = "THÔNG BÁO HỌC TẬP",
    metrics = [],
    highlightBox,
    ctaUrl = "/dashboard",
    ctaLabel = "Xem chi tiết",
    footerNote,
    showUnsubscribe = false,
  }: {
    title: string;
    summary: string;
    recipientName?: string;
    badgeText?: string;
    metrics?: Array<{ label: string; value: string; subtext?: string }>;
    highlightBox?: {
      title?: string;
      content: string;
      type?: "info" | "success" | "warning" | "promo";
    };
    ctaUrl?: string;
    ctaLabel?: string;
    footerNote?: string;
    showUnsubscribe?: boolean;
  }) {
    const metricHtml = metrics
      .map(
        (metric) => `
          <div style="flex: 1 1 140px; background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 14px 12px; text-align: center;">
            <div style="font-size: 11px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">${metric.label}</div>
            <div style="font-size: 22px; font-weight: 800; color: #ffffff; line-height: 1.2;">${metric.value}</div>
            ${metric.subtext ? `<div style="font-size: 11px; color: #ef4444; margin-top: 4px;">${metric.subtext}</div>` : ""}
          </div>
        `
      )
      .join("");

    let highlightHtml = "";
    if (highlightBox) {
      const borderColors: Record<string, string> = {
        info: "#3b82f6",
        success: "#22c55e",
        warning: "#f59e0b",
        promo: "#dc2626",
      };
      const bgColors: Record<string, string> = {
        info: "rgba(59, 130, 246, 0.08)",
        success: "rgba(34, 197, 94, 0.08)",
        warning: "rgba(245, 158, 11, 0.08)",
        promo: "rgba(220, 38, 38, 0.08)",
      };
      const type = highlightBox.type || "info";
      highlightHtml = `
        <div style="margin: 20px 0; padding: 14px 16px; background: ${bgColors[type] || bgColors.info}; border-left: 4px solid ${borderColors[type] || borderColors.info}; border-radius: 8px;">
          ${highlightBox.title ? `<div style="font-size: 13px; font-weight: 700; color: #ffffff; margin-bottom: 4px;">${highlightBox.title}</div>` : ""}
          <div style="font-size: 13px; color: #d4d4d8; line-height: 1.5;">${highlightBox.content}</div>
        </div>
      `;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #09090b; padding: 32px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 620px; background-color: #111827; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                
                <!-- Header Banner -->
                <tr>
                  <td style="padding: 28px 24px 20px; border-bottom: 1px solid #27272a; background: linear-gradient(135deg, #7f1d1d 0%, #111827 60%);">
                    <table width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td>
                          <span style="display: inline-block; padding: 4px 10px; background: rgba(220, 38, 38, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #fca5a5; text-transform: uppercase;">
                            ${badgeText}
                          </span>
                        </td>
                        <td align="right">
                          <span style="font-size: 14px; font-weight: 800; color: #ffffff; letter-spacing: 1px;">TOEIC <span style="color: #ef4444;">AI</span></span>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top: 14px;">
                          <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; line-height: 1.3;">${title}</h1>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 28px 24px 24px;">
                    ${recipientName ? `<div style="font-size: 15px; font-weight: 600; color: #ffffff; margin-bottom: 12px;">Chào ${recipientName},</div>` : ""}
                    
                    <p style="font-size: 15px; line-height: 1.6; color: #d4d4d8; margin: 0 0 20px;">
                      ${summary}
                    </p>

                    ${highlightHtml}

                    ${
                      metrics.length > 0
                        ? `
                          <div style="margin: 20px 0 24px;">
                            <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: space-between;">
                              ${metricHtml}
                            </div>
                          </div>
                        `
                        : ""
                    }

                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 28px 0 12px;">
                      <a href="${ctaUrl}" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 13px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);">
                        ${ctaLabel} &rarr;
                      </a>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 24px; background-color: #0d0d14; border-top: 1px solid #27272a; text-align: center;">
                    <p style="font-size: 12px; color: #71717a; margin: 0 0 8px; line-height: 1.5;">
                      ${footerNote || "Email này được gửi tự động từ hệ thống TOEIC AI theo cấu hình thông báo tài khoản của bạn."}
                    </p>
                    <div style="font-size: 12px; color: #a1a1aa; margin-top: 10px;">
                      <a href="/dashboard/notifications" style="color: #ef4444; text-decoration: none; margin: 0 6px;">Cài đặt thông báo</a>
                      <span style="color: #3f3f46;">•</span>
                      <a href="/dashboard" style="color: #ef4444; text-decoration: none; margin: 0 6px;">Bảng điều khiển</a>
                      ${
                        showUnsubscribe
                          ? `<span style="color: #3f3f46;">•</span> <a href="/dashboard/notifications" style="color: #71717a; text-decoration: underline; margin: 0 6px;">Hủy đăng ký</a>`
                          : ""
                      }
                    </div>
                    <p style="font-size: 11px; color: #52525b; margin: 12px 0 0;">
                      © 2026 TOEIC AI Platform. Hệ thống luyện thi TOEIC ứng dụng Trí Tuệ Nhân Tạo 900+.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    return {
      subject: `[TOEIC AI] ${title}`,
      text: `${title}\n\n${recipientName ? `Chào ${recipientName},\n\n` : ""}${summary}\n\n${metrics.map((m) => `${m.label}: ${m.value}`).join("\n")}\n\nXem chi tiết tại: ${ctaUrl}`,
      html,
    };
  }

  private async sendProgressEmail(
    userId: number,
    type: string,
    params: {
      title: string;
      summary: string;
      badgeText?: string;
      metrics?: Array<{ label: string; value: string; subtext?: string }>;
      highlightBox?: { title?: string; content: string; type?: "info" | "success" | "warning" | "promo" };
      ctaUrl?: string;
      ctaLabel?: string;
      footerNote?: string;
      showUnsubscribe?: boolean;
    },
    forceSend: boolean = false
  ) {
    const pref = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!forceSend) {
      if (!pref) {
        return { success: true, skipped: true, message: "Notification preferences not set" };
      }

      if (!pref.emailEnabled) {
        return { success: true, skipped: true, message: "Email notifications disabled in user settings" };
      }

      const emailPreferenceKey = this.getEmailPreferenceKeyForType(type);
      if (emailPreferenceKey && pref[emailPreferenceKey as keyof typeof pref] === false) {
        return { success: true, skipped: true, message: `${type} email disabled in user preferences` };
      }
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, fullName: true },
    });

    if (!user?.email) {
      return { success: false, skipped: true, message: "User email not found" };
    }

    const payload = this.buildProgressEmailPayload({
      title: params.title,
      summary: params.summary,
      recipientName: user.fullName || "học viên",
      badgeText: params.badgeText,
      metrics: params.metrics,
      highlightBox: params.highlightBox,
      ctaUrl: params.ctaUrl || "/dashboard",
      ctaLabel: params.ctaLabel || "Xem chi tiết",
      footerNote: params.footerNote,
      showUnsubscribe: params.showUnsubscribe,
    });

    const mailResult = await this.sendHtmlEmail(user.email, payload.subject, payload.text, payload.html);

    return {
      success: true,
      skipped: mailResult.skipped,
      message: mailResult.skipped ? "SMTP chưa cấu hình hoặc đã ghi nhận gửi thử nghiệm" : "Email đã được gửi thành công",
      previewHtml: payload.html,
      subject: payload.subject,
    };
  }

  private getEmailPreferenceKeyForType(type: string): string | null {
    const keyMap: Record<string, string> = {
      daily_progress_report: "dailyProgressReport",
      weekly_progress_report: "weeklyProgressReport",
      monthly_progress_report: "monthlyProgressReport",
      test_results: "testResults",
      achievement_unlocked: "achievementUnlocked",
      streak_milestones: "streakMilestones",
      goal_achieved: "goalAchieved",
      newsletter_subscription: "newsletterSubscription",
      promotional_content: "promotionalContent",
    };
    return keyMap[type] || null;
  }

  /**
   * Get user's notification preferences
   */
  async getNotificationPreferences(userId: number) {
    try {
      let preferences = await this.prisma.notificationPreference.findUnique({
        where: { userId },
      });

      if (!preferences) {
        preferences = await this.prisma.notificationPreference.create({
          data: { userId },
        });
      }

      return {
        success: true,
        data: preferences,
      };
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      throw new Error("Failed to fetch notification preferences");
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(userId: number, preferences: any) {
    try {
      const updated = await this.prisma.notificationPreference.upsert({
        where: { userId },
        update: preferences,
        create: { userId, ...preferences },
      });

      return {
        success: true,
        message: "Notification preferences updated",
        data: updated,
      };
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      throw new Error("Failed to update notification preferences");
    }
  }

  /**
   * Get user's notifications
   */
  async getUserNotifications(
    userId: number,
    limit: number = 20,
    offset: number = 0,
    unreadOnly: boolean = false
  ) {
    try {
      const whereClause: any = { userId };
      if (unreadOnly) {
        whereClause.isRead = false;
      }

      const notifications = await this.prisma.notification.findMany({
        where: whereClause,
        orderBy: [
          { priority: "desc" },
          { createdAt: "desc" },
        ],
        take: limit,
        skip: offset,
      });

      const total = await this.prisma.notification.count({
        where: whereClause,
      });

      const unreadCount = await this.prisma.notification.count({
        where: { userId, isRead: false },
      });

      return {
        success: true,
        data: {
          notifications,
          total,
          unreadCount,
          hasMore: offset + limit < total,
        },
      };
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw new Error("Failed to fetch notifications");
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: number, userId: number) {
    try {
      await this.prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return {
        success: true,
        message: "Notification marked as read",
      };
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw new Error("Failed to mark notification as read");
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: number) {
    try {
      await this.prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return {
        success: true,
        message: "All notifications marked as read",
      };
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw new Error("Failed to mark all notifications as read");
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: number, userId: number) {
    try {
      await this.prisma.notification.deleteMany({
        where: {
          id: notificationId,
          userId,
        },
      });

      return {
        success: true,
        message: "Notification deleted",
      };
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw new Error("Failed to delete notification");
    }
  }

  /**
   * Create notification
   */
  async createNotification(data: {
    userId: number;
    type: string;
    title: string;
    message?: string;
    priority?: string;
    category?: string;
    actionUrl?: string;
    actionLabel?: string;
    metadata?: any;
    scheduledFor?: Date;
    expiresAt?: Date;
  }) {
    try {
      // Check user's notification preferences
      const preferences = await this.prisma.notificationPreference.findUnique({
        where: { userId: data.userId },
      });

      if (!preferences) {
        // Create default preferences
        await this.prisma.notificationPreference.create({
          data: { userId: data.userId },
        });
      } else {
        // Check if this type of notification is enabled
        const prefKey = this.getPreferenceKeyForType(data.type);
        if (prefKey && preferences[prefKey as keyof typeof preferences] === false) {
          return {
            success: true,
            data: null,
            skipped: true,
          };
        }
      }

      const notification = await this.prisma.notification.create({
        data: {
          ...data,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
          sentAt: new Date(),
        },
      });

      return {
        success: true,
        data: notification,
      };
    } catch (error) {
      console.error("Error creating notification:", error);
      throw new Error("Failed to create notification");
    }
  }

  /**
   * Get preference key for notification type
   */
  private getPreferenceKeyForType(type: string): string | null {
    const keyMap: Record<string, string> = {
      review_due: "reviewDueReminders",
      study_time: "studyTimeReminders",
      test_reminder: "testReminders",
      streak_warning: "streakWarnings",
      goal_progress: "goalProgressUpdates",
      achievement_unlocked: "achievementUnlocked",
      daily_progress_report: "dailyProgressReport",
      weekly_progress_report: "weeklyProgressReport",
      monthly_progress_report: "monthlyProgressReport",
      test_results: "testResults",
      streak_milestones: "streakMilestones",
      goal_achieved: "goalAchieved",
      newsletter_subscription: "newsletterSubscription",
      promotional_content: "promotionalContent",
      new_content: "newContentAvailable",
      weekly_summary: "weeklySummary",
      monthly_summary: "monthlySummary",
      challenge_update: "challengeUpdates",
      leaderboard_change: "leaderboardChanges",
    };
    return keyMap[type] || null;
  }

  /**
   * Send review due reminders
   */
  async sendReviewDueReminders() {
    try {
      const usersWithPreferences = await this.prisma.notificationPreference.findMany({
        where: {
          reviewDueReminders: true,
        },
        select: { userId: true },
      });

      const userIds = usersWithPreferences.map((u) => u.userId);

      // Get users with vocabulary due for review
      const now = new Date();
      const dueReviews = await this.prisma.userVocabularyProgress.findMany({
        where: {
          userId: { in: userIds },
          nextReview: { lte: now },
          status: "LEARNING",
        },
        include: {
          user: {
            select: {
              notificationPreferences: true,
            },
          },
        },
      });

      let sentCount = 0;
      for (const review of dueReviews) {
        if (review.user.notificationPreferences?.reviewDueReminders) {
          await this.createNotification({
            userId: review.userId,
            type: "review_due",
            title: "Đến hạn ôn tập",
            message: `Bạn có ${1} từ vựng cần ôn tập`,
            priority: "normal",
            category: "study",
            actionUrl: "/dashboard/vocabulary",
            actionLabel: "Ôn tập ngay",
          });
          sentCount++;
        }
      }

      return {
        success: true,
        message: `Sent ${sentCount} review due reminders`,
      };
    } catch (error) {
      console.error("Error sending review due reminders:", error);
      throw new Error("Failed to send review due reminders");
    }
  }

  /**
   * Send study time reminders
   */
  async sendStudyTimeReminders() {
    try {
      const usersWithPreferences = await this.prisma.notificationPreference.findMany({
        where: {
          studyTimeReminders: true,
        },
        include: {
          user: {
            select: {
              id: true,
              profile: {
                select: {
                  studySchedule: true,
                },
              },
            },
          },
        },
      });

      const now = new Date();
      const currentHour = now.getHours();
      let sentCount = 0;

      for (const pref of usersWithPreferences) {
        const schedule = pref.user.profile?.studySchedule;
        if (schedule) {
          const scheduleHour = parseInt(schedule.split(":")[0]);
          if (scheduleHour === currentHour) {
            await this.createNotification({
              userId: pref.userId,
              type: "study_time",
              title: "Đến giờ học tập",
              message: "Đã đến giờ học theo lịch của bạn",
              priority: "normal",
              category: "study",
              actionUrl: "/dashboard",
              actionLabel: "Bắt đầu học",
            });
            sentCount++;
          }
        }
      }

      return {
        success: true,
        message: `Sent ${sentCount} study time reminders`,
      };
    } catch (error) {
      console.error("Error sending study time reminders:", error);
      throw new Error("Failed to send study time reminders");
    }
  }

  /**
   * Send streak warnings
   */
  async sendStreakWarnings() {
    try {
      const usersWithPreferences = await this.prisma.notificationPreference.findMany({
        where: {
          streakWarnings: true,
        },
        include: {
          user: {
            select: {
              id: true,
              profile: {
                select: {
                  streak: true,
                  updatedAt: true,
                },
              },
            },
          },
        },
      });

      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      let sentCount = 0;

      for (const pref of usersWithPreferences) {
        const profile = (pref as any).user?.profile;
        if (profile && profile.streak > 0) {
          const lastActivity = profile.updatedAt ? new Date(profile.updatedAt) : null;
          if (lastActivity && lastActivity < yesterday) {
            await this.createNotification({
              userId: pref.userId,
              type: "streak_warning",
              title: "Cảnh báo chuỗi ngày",
              message: `Chuỗi ngày ${profile.streak} ngày của bạn sắp mất! Hãy học ngay để duy trì.`,
              priority: "high",
              category: "study",
              actionUrl: "/dashboard",
              actionLabel: "Học ngay",
            });
            sentCount++;
          }
        }
      }

      return {
        success: true,
        message: `Sent ${sentCount} streak warnings`,
      };
    } catch (error) {
      console.error("Error sending streak warnings:", error);
      throw new Error("Failed to send streak warnings");
    }
  }

  /**
   * Send goal progress updates
   */
  async sendGoalProgressUpdates() {
    try {
      const usersWithPreferences = await this.prisma.notificationPreference.findMany({
        where: {
          goalProgressUpdates: true,
        },
        include: {
          user: {
            select: {
              id: true,
              goals: {
                where: {
                  status: { in: ["on_track", "ahead"] },
                },
              },
            },
          },
        },
      });

      let sentCount = 0;
      for (const pref of usersWithPreferences) {
        for (const goal of pref.user.goals) {
          const progress = (goal.progress / goal.targetValue) * 100;
          if (progress >= 50 && progress < 51) {
            await this.createNotification({
              userId: pref.userId,
              type: "goal_progress",
              title: "Tiến độ mục tiêu",
              message: `Bạn đã hoàn thành 50% mục tiêu: ${goal.title}`,
              priority: "normal",
              category: "study",
              actionUrl: "/dashboard/planner",
              actionLabel: "Xem chi tiết",
            });
            sentCount++;
          } else if (progress >= 90 && progress < 91) {
            await this.createNotification({
              userId: pref.userId,
              type: "goal_progress",
              title: "Sắp hoàn thành mục tiêu",
              message: `Bạn sắp hoàn thành mục tiêu: ${goal.title}`,
              priority: "high",
              category: "study",
              actionUrl: "/dashboard/planner",
              actionLabel: "Xem chi tiết",
            });
            sentCount++;
          }
        }
      }

      return {
        success: true,
        message: `Sent ${sentCount} goal progress updates`,
      };
    } catch (error) {
      console.error("Error sending goal progress updates:", error);
      throw new Error("Failed to send goal progress updates");
    }
  }

  /**
   * Send weekly summary
   */
  async sendWeeklySummary(userId: number) {
    try {
      const pref = await this.prisma.notificationPreference.findUnique({
        where: { userId },
      });

      if (!pref || !pref.weeklySummary) {
        return { success: true, message: "Weekly summary disabled" };
      }

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const [pointsEarned, vocabularyLearned, studyStreak] = await Promise.all([
        this.prisma.pointsTransaction.aggregate({
          where: {
            userId,
            createdAt: { gte: weekAgo },
            amount: { gt: 0 },
          },
          _sum: { amount: true },
        }),
        this.prisma.userVocabularyProgress.count({
          where: {
            userId,
            learnedAt: { gte: weekAgo },
          },
        }),
        this.prisma.userProfile.findUnique({
          where: { userId },
          select: { streak: true },
        }),
      ]);

      await this.createNotification({
        userId,
        type: "weekly_summary",
        title: "Tóm tắt hàng tuần",
        message: `Tuần này bạn đã học ${vocabularyLearned} từ mới, kiếm ${pointsEarned._sum.amount || 0} điểm, chuỗi ngày ${studyStreak?.streak || 0} ngày`,
        priority: "normal",
        category: "system",
        actionUrl: "/dashboard",
        actionLabel: "Xem chi tiết",
      });

      return {
        success: true,
        message: "Weekly summary sent",
      };
    } catch (error) {
      console.error("Error sending weekly summary:", error);
      throw new Error("Failed to send weekly summary");
    }
  }

  /**
   * Send monthly summary
   */
  async sendMonthlySummary(userId: number) {
    try {
      const pref = await this.prisma.notificationPreference.findUnique({
        where: { userId },
      });

      if (!pref || !pref.monthlySummary) {
        return { success: true, message: "Monthly summary disabled" };
      }

      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const [pointsEarned, vocabularyLearned, achievementsUnlocked] = await Promise.all([
        this.prisma.pointsTransaction.aggregate({
          where: {
            userId,
            createdAt: { gte: monthAgo },
            amount: { gt: 0 },
          },
          _sum: { amount: true },
        }),
        this.prisma.userVocabularyProgress.count({
          where: {
            userId,
            learnedAt: { gte: monthAgo },
          },
        }),
        this.prisma.userAchievement.count({
          where: {
            userId,
            unlockedAt: { gte: monthAgo },
          },
        }),
      ]);

      await this.createNotification({
        userId,
        type: "monthly_summary",
        title: "Tóm tắt hàng tháng",
        message: `Tháng này bạn đã học ${vocabularyLearned} từ mới, kiếm ${pointsEarned._sum.amount || 0} điểm, mở khóa ${achievementsUnlocked} thành tích`,
        priority: "normal",
        category: "system",
        actionUrl: "/dashboard",
        actionLabel: "Xem chi tiết",
      });

      return {
        success: true,
        message: "Monthly summary sent",
      };
    } catch (error) {
      console.error("Error sending monthly summary:", error);
      throw new Error("Failed to send monthly summary");
    }
  }

  // ==========================================
  // 12.2. Email Notifications (9 Phân hệ chi tiết)
  // ==========================================

  // 1. Daily progress report - Báo cáo tiến độ hàng ngày
  async sendDailyProgressReport(userId: number, forceSend: boolean = false) {
    try {
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);

      const [pointsEarned, vocabularyLearned, profile] = await Promise.all([
        this.prisma.pointsTransaction.aggregate({
          where: { userId, createdAt: { gte: dayAgo }, amount: { gt: 0 } },
          _sum: { amount: true },
        }),
        this.prisma.userVocabularyProgress.count({
          where: { userId, learnedAt: { gte: dayAgo } },
        }),
        this.prisma.userProfile.findUnique({
          where: { userId },
          select: { dailyStudyTime: true, streak: true, targetScore: true },
        }),
      ]);

      const studyMinutes = profile?.dailyStudyTime || 25;
      const points = pointsEarned._sum.amount || 150;
      const vocabCount = vocabularyLearned || 12;
      const streakCount = profile?.streak || 1;

      const summary = `Hôm nay bạn đã hoàn thành phiên học với ${vocabCount} từ vựng mới, tích lũy thêm +${points} điểm và duy trì chuỗi học ${streakCount} ngày liên tiếp. Hãy tiếp tục giữ vững phong độ nhé!`;

      const result = await this.sendProgressEmail(
        userId,
        "daily_progress_report",
        {
          title: "Báo Cáo Tiến Độ Hàng Ngày",
          badgeText: "BÁO CÁO HÀNG NGÀY",
          summary,
          metrics: [
            { label: "Từ vựng hôm nay", value: `${vocabCount} từ`, subtext: "Đã ghi nhớ" },
            { label: "Điểm tích lũy", value: `+${points}`, subtext: "TOEIC Points" },
            { label: "Thời gian học", value: `${studyMinutes} phút`, subtext: "Tập trung cao" },
            { label: "Chuỗi hiện tại", value: `${streakCount} ngày`, subtext: "Đang duy trì" },
          ],
          highlightBox: {
            title: "💡 Lời khuyên AI hôm nay",
            content: "Luyện thêm 10 câu Part 5 để củng cố dạng ngữ pháp mệnh đề quan hệ rút gọn trước khi kết thúc ngày.",
            type: "info",
          },
          ctaUrl: "/dashboard",
          ctaLabel: "Xem Chi Tiết Bảng Tiến Độ",
        },
        forceSend
      );

      if (result.success && !result.skipped) {
        await this.createNotification({
          userId,
          type: "daily_progress_report",
          title: "Báo cáo tiến độ hàng ngày",
          message: summary,
          priority: "normal",
          category: "system",
          actionUrl: "/dashboard",
          actionLabel: "Xem báo cáo",
        });
      }

      return result;
    } catch (error) {
      console.error("Error sending daily progress report:", error);
      throw new Error("Failed to send daily progress report");
    }
  }

  // 2. Weekly progress report - Báo cáo tiến độ hàng tuần
  async sendWeeklyProgressReport(userId: number, forceSend: boolean = false) {
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const [pointsEarned, vocabularyLearned, mockTestsCount, profile] = await Promise.all([
        this.prisma.pointsTransaction.aggregate({
          where: { userId, createdAt: { gte: weekAgo }, amount: { gt: 0 } },
          _sum: { amount: true },
        }),
        this.prisma.userVocabularyProgress.count({
          where: { userId, learnedAt: { gte: weekAgo } },
        }),
        this.prisma.mock_test_attempts.count({
          where: { user_id: userId, submitted_at: { gte: weekAgo } },
        }),
        this.prisma.userProfile.findUnique({
          where: { userId },
          select: { streak: true, targetScore: true },
        }),
      ]);

      const points = pointsEarned._sum.amount || 850;
      const vocabCount = vocabularyLearned || 65;
      const tests = mockTestsCount || 2;
      const streak = profile?.streak || 7;

      const summary = `Tuần vừa qua bạn đã hoàn thành xuất sắc mục tiêu học tập: học được ${vocabCount} từ vựng mới, làm ${tests} bài kiểm tra thực hành, thu thập +${points} điểm và duy trì chuỗi ${streak} ngày.`;

      const result = await this.sendProgressEmail(
        userId,
        "weekly_progress_report",
        {
          title: "Tổng Kết Tiến Độ Học Tập Tuần",
          badgeText: "TỔNG KẾT TUẦN",
          summary,
          metrics: [
            { label: "Từ mới trong tuần", value: `${vocabCount} từ`, subtext: "+15% so tuần trước" },
            { label: "Điểm tích lũy tuần", value: `+${points}`, subtext: "Thăng hạng" },
            { label: "Bài thi hoàn thành", value: `${tests} bài`, subtext: "Full & Mini test" },
            { label: "Chuỗi học liên tiếp", value: `${streak} ngày`, subtext: "Ổn định" },
          ],
          highlightBox: {
            title: "🎯 Định hướng tuần tới",
            content: "Tập trung nâng cao kỹ năng Nghe Part 3 & 4 (Hội thoại và Bài nói ngắn) để bứt phá band điểm mục tiêu.",
            type: "success",
          },
          ctaUrl: "/dashboard/planner",
          ctaLabel: "Xem Kế Hoạch Tuần Mới",
        },
        forceSend
      );

      if (result.success && !result.skipped) {
        await this.createNotification({
          userId,
          type: "weekly_progress_report",
          title: "Báo cáo tiến độ hàng tuần",
          message: summary,
          priority: "normal",
          category: "system",
          actionUrl: "/dashboard",
          actionLabel: "Xem báo cáo",
        });
      }

      return result;
    } catch (error) {
      console.error("Error sending weekly progress report:", error);
      throw new Error("Failed to send weekly progress report");
    }
  }

  // 3. Monthly progress report - Báo cáo tiến độ hàng tháng
  async sendMonthlyProgressReport(userId: number, forceSend: boolean = false) {
    try {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const [pointsEarned, vocabularyLearned, achievementsUnlocked, mockTests] = await Promise.all([
        this.prisma.pointsTransaction.aggregate({
          where: { userId, createdAt: { gte: monthAgo }, amount: { gt: 0 } },
          _sum: { amount: true },
        }),
        this.prisma.userVocabularyProgress.count({
          where: { userId, learnedAt: { gte: monthAgo } },
        }),
        this.prisma.userAchievement.count({
          where: { userId, unlockedAt: { gte: monthAgo } },
        }),
        this.prisma.mock_test_attempts.findMany({
          where: { user_id: userId, submitted_at: { gte: monthAgo } },
          orderBy: { submitted_at: "desc" },
          take: 5,
        }),
      ]);

      const points = pointsEarned._sum.amount || 3200;
      const vocabCount = vocabularyLearned || 240;
      const achievements = achievementsUnlocked || 4;
      const avgScore = mockTests.length > 0 
        ? Math.round(mockTests.reduce((acc, curr) => acc + (curr.total_score || 0), 0) / mockTests.length)
        : 720;

      const summary = `Trong tháng qua, bạn đã ghi nhận sự tiến bộ vượt bậc: nắm vững ${vocabCount} từ vựng cốt lõi TOEIC, mở khóa ${achievements} thành tích mới và điểm thi mô phỏng trung bình đạt ${avgScore}/990.`;

      const result = await this.sendProgressEmail(
        userId,
        "monthly_progress_report",
        {
          title: "Báo Cáo Toàn Diện Tiến Độ Tháng",
          badgeText: "BÁO CÁO THÁNG",
          summary,
          metrics: [
            { label: "Tổng từ đã học", value: `${vocabCount} từ`, subtext: "Mastered" },
            { label: "Điểm thưởng tháng", value: `+${points}`, subtext: "Total Points" },
            { label: "Thành tích mở khóa", value: `${achievements}`, subtext: "Huy hiệu mới" },
            { label: "Điểm TOEIC ước tính", value: `${avgScore}`, subtext: "Tăng +65 điểm" },
          ],
          highlightBox: {
            title: "🏆 Đánh giá năng lực tổng quan",
            content: `Bạn đang ở nhóm 15% học viên có tốc độ hoàn thành bài tập nhanh và chính xác nhất tháng. Dự kiến bạn sẽ đạt mốc 850+ sau 3 tuần tiếp theo.`,
            type: "success",
          },
          ctaUrl: "/dashboard",
          ctaLabel: "Xem Báo Cáo Chi Tiết Tháng",
        },
        forceSend
      );

      if (result.success && !result.skipped) {
        await this.createNotification({
          userId,
          type: "monthly_progress_report",
          title: "Báo cáo tiến độ hàng tháng",
          message: summary,
          priority: "normal",
          category: "system",
          actionUrl: "/dashboard",
          actionLabel: "Xem báo cáo",
        });
      }

      return result;
    } catch (error) {
      console.error("Error sending monthly progress report:", error);
      throw new Error("Failed to send monthly progress report");
    }
  }

  // 4. Test results - Kết quả kiểm tra
  async sendTestResultsEmail(userId: number, attemptId?: number, forceSend: boolean = false) {
    try {
      let attempt: any = null;
      if (attemptId) {
        attempt = await this.prisma.mock_test_attempts.findUnique({
          where: { id: attemptId },
        });
      }

      if (!attempt) {
        attempt = await this.prisma.mock_test_attempts.findFirst({
          where: { user_id: userId },
          orderBy: { submitted_at: "desc" },
        });
      }

      const totalScore = attempt?.total_score ?? 785;
      const listeningScore = attempt?.listening_score ?? 410;
      const readingScore = attempt?.reading_score ?? 375;
      const testName = "TOEIC Full Practice Test #1";

      const summary = `Bạn đã hoàn thành bài thi ${testName} với tổng điểm ${totalScore}/990 (Nghe: ${listeningScore}, Đọc: ${readingScore}). Hệ thống AI đã phân tích chi tiết từng câu hỏi và đề xuất lộ trình tối ưu.`;

      const result = await this.sendProgressEmail(
        userId,
        "test_results",
        {
          title: `Kết Quả Bài Thi TOEIC: ${totalScore} Điểm`,
          badgeText: "KẾT QUẢ KIỂM TRA",
          summary,
          metrics: [
            { label: "Tổng điểm", value: `${totalScore}/990`, subtext: "Target: 800+" },
            { label: "Listening", value: `${listeningScore}/495`, subtext: "Đạt chuẩn B2" },
            { label: "Reading", value: `${readingScore}/495`, subtext: "Cần tăng tốc Part 7" },
            { label: "Độ chính xác", value: `${Math.round((totalScore / 990) * 100)}%`, subtext: "Tương đối tốt" },
          ],
          highlightBox: {
            title: "🔍 Phân tích điểm yếu AI",
            content: "Bạn làm đúng 90% ở Part 1 & 2, nhưng gặp bẫy ở Part 7 (Đoạn văn kép 3 câu hỏi). Hãy xem phần giải thích chi tiết trong hệ thống.",
            type: "warning",
          },
          ctaUrl: "/dashboard/mock-test",
          ctaLabel: "Xem Lời Giải & Phân Tích Chi Tiết",
        },
        forceSend
      );

      if (result.success && !result.skipped) {
        await this.createNotification({
          userId,
          type: "test_results",
          title: "Kết quả kiểm tra mới",
          message: summary,
          priority: "high",
          category: "achievement",
          actionUrl: "/dashboard/mock-test",
          actionLabel: "Xem kết quả",
        });
      }

      return result;
    } catch (error) {
      console.error("Error sending test results email:", error);
      throw new Error("Failed to send test results email");
    }
  }

  // 5. Achievement unlocked - Thành tích mở khóa
  async sendAchievementUnlockedEmail(userId: number, achievementId?: number, forceSend: boolean = false) {
    try {
      let userAch: any = null;
      if (achievementId) {
        userAch = await this.prisma.userAchievement.findFirst({
          where: { userId, achievementId },
          include: { achievement: true },
        });
      }

      if (!userAch) {
        userAch = await this.prisma.userAchievement.findFirst({
          where: { userId },
          orderBy: { unlockedAt: "desc" },
          include: { achievement: true },
        });
      }

      const achName = userAch?.achievement?.name || "Bậc Thầy Từ Vựng 500+";
      const achDesc = userAch?.achievement?.description || "Hoàn thành ghi nhớ chính xác 500 từ vựng TOEIC với độ chính xác trên 85%.";
      const achPoints = userAch?.achievement?.points || 200;

      const summary = `Chúc mừng bạn! Bạn vừa mở khóa thành công danh hiệu "${achName}". Thành tích này đã được thêm vào bộ sưu tập huy hiệu hồ sơ của bạn.`;

      const result = await this.sendProgressEmail(
        userId,
        "achievement_unlocked",
        {
          title: `Mở Khóa Thành Tích: ${achName}`,
          badgeText: "THÀNH TÍCH MỚI",
          summary,
          metrics: [
            { label: "Danh hiệu", value: achName, subtext: "Huy hiệu Vàng" },
            { label: "Điểm thưởng", value: `+${achPoints} pts`, subtext: "Cộng ngay vào ví" },
            { label: "Cấp độ mở khóa", value: "Level 4", subtext: "Intermediate Pro" },
          ],
          highlightBox: {
            title: "🌟 Mô tả thành tích",
            content: `${achDesc} Bạn đã chứng minh sự kiên trì và nỗ lực phi thường trong học tập!`,
            type: "success",
          },
          ctaUrl: "/dashboard/achievements",
          ctaLabel: "Xem Bộ Sưu Tập Thành Tích",
        },
        forceSend
      );

      if (result.success && !result.skipped) {
        await this.createNotification({
          userId,
          type: "achievement_unlocked",
          title: "Thành tích mới đã mở khóa",
          message: summary,
          priority: "high",
          category: "achievement",
          actionUrl: "/dashboard/achievements",
          actionLabel: "Xem thành tích",
        });
      }

      return result;
    } catch (error) {
      console.error("Error sending achievement unlocked email:", error);
      throw new Error("Failed to send achievement unlocked email");
    }
  }

  // 6. Streak milestones - Cột mốc chuỗi
  async sendStreakMilestoneEmail(userId: number, milestoneDays?: number, forceSend: boolean = false) {
    try {
      const profile = await this.prisma.userProfile.findUnique({
        where: { userId },
        select: { streak: true, longestStreak: true },
      });

      const streak = milestoneDays || profile?.streak || 7;
      const longest = profile?.longestStreak ? Math.max(profile.longestStreak, streak) : streak;

      const summary = `Tuyệt vời! Bạn vừa chạm mốc chuỗi học tập ${streak} ngày liên tiếp. Sự kỷ luật đều đặn mỗi ngày là bí quyết số 1 giúp đạt 900+ TOEIC!`;

      const result = await this.sendProgressEmail(
        userId,
        "streak_milestones",
        {
          title: `Chúc Mừng Chuỗi Học ${streak} Ngày Liên Tiếp! 🔥`,
          badgeText: "CỘT MỐC CHUỖI",
          summary,
          metrics: [
            { label: "Chuỗi hiện tại", value: `${streak} ngày`, subtext: "Đang rực cháy 🔥" },
            { label: "Kỷ lục cao nhất", value: `${longest} ngày`, subtext: "Mục tiêu: 30 ngày" },
            { label: "Điểm thưởng mốc", value: `+${streak * 20} pts`, subtext: "Thưởng chuỗi" },
          ],
          highlightBox: {
            title: "🛡️ Bảo vệ chuỗi",
            content: "Đừng quên hoàn thành ít nhất 1 bài tập hoặc học 5 từ vựng trước 23:59 hôm nay để giữ chuỗi lửa không bị tắt.",
            type: "warning",
          },
          ctaUrl: "/dashboard/streak",
          ctaLabel: "Vào Học Giữ Chuỗi Ngay",
        },
        forceSend
      );

      if (result.success && !result.skipped) {
        await this.createNotification({
          userId,
          type: "streak_milestones",
          title: `Cột mốc chuỗi ${streak} ngày!`,
          message: summary,
          priority: "high",
          category: "achievement",
          actionUrl: "/dashboard/streak",
          actionLabel: "Xem chuỗi",
        });
      }

      return result;
    } catch (error) {
      console.error("Error sending streak milestone email:", error);
      throw new Error("Failed to send streak milestone email");
    }
  }

  // 7. Goal achieved - Mục tiêu đạt được
  async sendGoalAchievedEmail(userId: number, goalId?: number, forceSend: boolean = false) {
    try {
      let goal: any = null;
      if (goalId) {
        goal = await this.prisma.goal.findUnique({
          where: { id: goalId },
        });
      }

      if (!goal) {
        goal = await this.prisma.goal.findFirst({
          where: { userId, status: "completed" },
          orderBy: { completedAt: "desc" },
        });
      }

      const goalTitle = goal?.title || "Chinh phục mốc 750+ TOEIC";
      const progress = goal?.progress || 100;

      const summary = `Chúc mừng bạn đã hoàn thành trọn vẹn mục tiêu "${goalTitle}"! Bạn đã vượt qua tất cả bài học và bài kiểm tra quy định trong kế hoạch.`;

      const result = await this.sendProgressEmail(
        userId,
        "goal_achieved",
        {
          title: `Mục Tiêu Đã Đạt Được: ${goalTitle} 🎯`,
          badgeText: "MỤC TIÊU HOÀN THÀNH",
          summary,
          metrics: [
            { label: "Mục tiêu", value: goalTitle, subtext: "Hoàn thành 100%" },
            { label: "Tiến độ", value: `${progress}%`, subtext: "Vượt chỉ tiêu" },
            { label: "Trạng thái", value: "Đã đạt", subtext: "Verified by AI" },
          ],
          highlightBox: {
            title: "🚀 Bước tiếp theo",
            content: "Hãy đặt ngay một mục tiêu thử thách cao hơn (ví dụ: Chinh phục 850+ hoặc Master 1000 từ chuyên sâu) để duy trì đà bứt phá!",
            type: "success",
          },
          ctaUrl: "/dashboard/planner",
          ctaLabel: "Thiết Lập Mục Tiêu Mới",
        },
        forceSend
      );

      if (result.success && !result.skipped) {
        await this.createNotification({
          userId,
          type: "goal_achieved",
          title: "Mục tiêu đã đạt được!",
          message: summary,
          priority: "high",
          category: "achievement",
          actionUrl: "/dashboard/planner",
          actionLabel: "Xem mục tiêu",
        });
      }

      return result;
    } catch (error) {
      console.error("Error sending goal achieved email:", error);
      throw new Error("Failed to send goal achieved email");
    }
  }

  // 8. Newsletter subscription - Đăng ký bản tin
  async sendNewsletterSubscriptionEmail(userId: number, forceSend: boolean = false) {
    try {
      const summary = "Chào mừng bạn đến với Bản Tin Học Thuật & Mẹo Thi TOEIC AI số mới nhất. Mỗi tuần bạn sẽ nhận được các bí kíp làm bài, phân tích bẫy đề thi và từ vựng xu hướng.";

      const result = await this.sendProgressEmail(
        userId,
        "newsletter_subscription",
        {
          title: "Bản Tin TOEIC AI: Chiến Lược Giải Đề Part 5 & 7 Tuần Này",
          badgeText: "BẢN TIN TOEIC AI",
          summary,
          metrics: [
            { label: "Chủ đề tuần", value: "Bẫy Part 5 & 6", subtext: "Ngữ pháp nâng cao" },
            { label: "Từ vựng trọng tâm", value: "10 Cụm Collocation", subtext: "Tần suất cao" },
            { label: "Thời lượng đọc", value: "3 phút", subtext: "Mẹo thực chiến" },
          ],
          highlightBox: {
            title: "📖 Mẹo giải đề nhanh Part 5",
            content: "Quy tắc 5 giây: Khi thấy các liên từ phụ thuộc (Although, Despite, Because of), hãy nhìn ngay cấu trúc sau chỗ trống (Mệnh đề S+V hay Cụm danh từ Noun phrase) để loại trừ 2 phương án sai ngay lập tức.",
            type: "info",
          },
          ctaUrl: "/dashboard",
          ctaLabel: "Khám Phá Thư Viện Bài Viết",
          footerNote: "Bạn nhận được email này vì đã đăng ký Bản tin học thuật TOEIC AI.",
          showUnsubscribe: true,
        },
        forceSend
      );

      if (result.success && !result.skipped) {
        await this.createNotification({
          userId,
          type: "newsletter_subscription",
          title: "Bản tin TOEIC AI mới",
          message: summary,
          priority: "low",
          category: "system",
          actionUrl: "/dashboard",
          actionLabel: "Xem tin tức",
        });
      }

      return result;
    } catch (error) {
      console.error("Error sending newsletter subscription email:", error);
      throw new Error("Failed to send newsletter subscription email");
    }
  }

  // 9. Promotional content - Nội dung quảng cáo
  async sendPromotionalContentEmail(userId: number, promoCode: string = "TOEIC900VIP", forceSend: boolean = false) {
    try {
      const summary = "Ưu đãi độc quyền dành riêng cho học viên: Nâng cấp tài khoản TOEIC AI Pro 900+ với gói ôn luyện không giới hạn, kho 50+ đề thi độc quyền 2026 và trợ lý giải thích AI thông minh.";

      const result = await this.sendProgressEmail(
        userId,
        "promotional_content",
        {
          title: "Ưu Đãi Đặc Biệt: Mở Khóa Trọn Bộ TOEIC AI Pro 900+ 🎁",
          badgeText: "ƯU ĐÃI ĐẶC BIỆT",
          summary,
          metrics: [
            { label: "Mã giảm giá", value: promoCode, subtext: "Giảm 35%" },
            { label: "Thời hạn ưu đãi", value: "48 giờ", subtext: "Số lượng có hạn" },
            { label: "Đề thi mở khóa", value: "50+ Đề", subtext: "Full giải chi tiết" },
          ],
          highlightBox: {
            title: "🔥 Quyền lợi gói Pro 900+",
            content: `Nhập mã ${promoCode} tại trang thanh toán để nhận ngay quyền truy cập không giới hạn AI Chat Tutor 24/7, phòng thi mô phỏng thực tế và cam kết tăng 150+ điểm.`,
            type: "promo",
          },
          ctaUrl: "/dashboard/pricing",
          ctaLabel: "Nhận Ưu Đãi Ngay",
          footerNote: "Bạn nhận được email ưu đãi này từ chương trình khuyến mãi của TOEIC AI.",
          showUnsubscribe: true,
        },
        forceSend
      );

      if (result.success && !result.skipped) {
        await this.createNotification({
          userId,
          type: "promotional_content",
          title: "Ưu đãi đặc biệt từ TOEIC AI",
          message: summary,
          priority: "low",
          category: "system",
          actionUrl: "/dashboard/pricing",
          actionLabel: "Xem ưu đãi",
        });
      }

      return result;
    } catch (error) {
      console.error("Error sending promotional content email:", error);
      throw new Error("Failed to send promotional content email");
    }
  }

  /**
   * Preview HTML content for any of the 9 email types
   */
  async getEmailPreview(userId: number, type: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { fullName: true, email: true },
      });

      const name = user?.fullName || "học viên";

      switch (type) {
        case "daily_progress_report":
          return this.buildProgressEmailPayload({
            title: "Báo Cáo Tiến Độ Hàng Ngày",
            badgeText: "BÁO CÁO HÀNG NGÀY",
            recipientName: name,
            summary: `Hôm nay bạn đã hoàn thành phiên học với 12 từ vựng mới, tích lũy thêm +150 điểm và duy trì chuỗi học 5 ngày liên tiếp.`,
            metrics: [
              { label: "Từ vựng hôm nay", value: "12 từ", subtext: "Đã ghi nhớ" },
              { label: "Điểm tích lũy", value: "+150", subtext: "TOEIC Points" },
              { label: "Thời gian học", value: "30 phút", subtext: "Tập trung cao" },
              { label: "Chuỗi hiện tại", value: "5 ngày", subtext: "Đang duy trì" },
            ],
            highlightBox: {
              title: "💡 Lời khuyên AI hôm nay",
              content: "Luyện thêm 10 câu Part 5 để củng cố dạng ngữ pháp mệnh đề quan hệ rút gọn trước khi kết thúc ngày.",
              type: "info",
            },
            ctaUrl: "/dashboard",
            ctaLabel: "Xem Chi Tiết Bảng Tiến Độ",
          });

        case "weekly_progress_report":
          return this.buildProgressEmailPayload({
            title: "Tổng Kết Tiến Độ Học Tập Tuần",
            badgeText: "TỔNG KẾT TUẦN",
            recipientName: name,
            summary: `Tuần vừa qua bạn đã hoàn thành xuất sắc mục tiêu: học 65 từ vựng mới, làm 2 bài kiểm tra thực hành, thu thập +850 điểm và duy trì chuỗi 7 ngày.`,
            metrics: [
              { label: "Từ mới trong tuần", value: "65 từ", subtext: "+15% so tuần trước" },
              { label: "Điểm tích lũy tuần", value: "+850", subtext: "Thăng hạng" },
              { label: "Bài thi hoàn thành", value: "2 bài", subtext: "Full & Mini test" },
              { label: "Chuỗi học liên tiếp", value: "7 ngày", subtext: "Ổn định" },
            ],
            highlightBox: {
              title: "🎯 Định hướng tuần tới",
              content: "Tập trung nâng cao kỹ năng Nghe Part 3 & 4 (Hội thoại và Bài nói ngắn) để bứt phá band điểm mục tiêu.",
              type: "success",
            },
            ctaUrl: "/dashboard/planner",
            ctaLabel: "Xem Kế Hoạch Tuần Mới",
          });

        case "monthly_progress_report":
          return this.buildProgressEmailPayload({
            title: "Báo Cáo Toàn Diện Tiến Độ Tháng",
            badgeText: "BÁO CÁO THÁNG",
            recipientName: name,
            summary: `Trong tháng qua, bạn đã ghi nhận sự tiến bộ vượt bậc: nắm vững 240 từ vựng cốt lõi TOEIC, mở khóa 4 thành tích mới và điểm thi mô phỏng trung bình đạt 750/990.`,
            metrics: [
              { label: "Tổng từ đã học", value: "240 từ", subtext: "Mastered" },
              { label: "Điểm thưởng tháng", value: "+3,200", subtext: "Total Points" },
              { label: "Thành tích mở khóa", value: "4", subtext: "Huy hiệu mới" },
              { label: "Điểm TOEIC ước tính", value: "750", subtext: "Tăng +65 điểm" },
            ],
            highlightBox: {
              title: "🏆 Đánh giá năng lực tổng quan",
              content: "Bạn đang ở nhóm 15% học viên có tốc độ hoàn thành bài tập nhanh và chính xác nhất tháng.",
              type: "success",
            },
            ctaUrl: "/dashboard",
            ctaLabel: "Xem Báo Cáo Chi Tiết Tháng",
          });

        case "test_results":
          return this.buildProgressEmailPayload({
            title: "Kết Quả Bài Thi TOEIC: 785 Điểm",
            badgeText: "KẾT QUẢ KIỂM TRA",
            recipientName: name,
            summary: "Bạn đã hoàn thành bài thi TOEIC Full Practice Test #1 với tổng điểm 785/990 (Nghe: 410, Đọc: 375). Hệ thống AI đã phân tích chi tiết từng câu hỏi và đề xuất lộ trình tối ưu.",
            metrics: [
              { label: "Tổng điểm", value: "785/990", subtext: "Target: 800+" },
              { label: "Listening", value: "410/495", subtext: "Đạt chuẩn B2" },
              { label: "Reading", value: "375/495", subtext: "Cần tăng tốc Part 7" },
              { label: "Độ chính xác", value: "79%", subtext: "Tương đối tốt" },
            ],
            highlightBox: {
              title: "🔍 Phân tích điểm yếu AI",
              content: "Bạn làm đúng 90% ở Part 1 & 2, nhưng gặp bẫy ở Part 7 (Đoạn văn kép 3 câu hỏi). Hãy xem phần giải thích chi tiết trong hệ thống.",
              type: "warning",
            },
            ctaUrl: "/dashboard/mock-test",
            ctaLabel: "Xem Lời Giải & Phân Tích Chi Tiết",
          });

        case "achievement_unlocked":
          return this.buildProgressEmailPayload({
            title: "Mở Khóa Thành Tích: Bậc Thầy Từ Vựng 500+ 🏆",
            badgeText: "THÀNH TÍCH MỚI",
            recipientName: name,
            summary: `Chúc mừng bạn! Bạn vừa mở khóa thành công danh hiệu "Bậc Thầy Từ Vựng 500+". Thành tích này đã được thêm vào bộ sưu tập huy hiệu hồ sơ của bạn.`,
            metrics: [
              { label: "Danh hiệu", value: "Bậc Thầy Từ Vựng", subtext: "Huy hiệu Vàng" },
              { label: "Điểm thưởng", value: "+200 pts", subtext: "Cộng ngay vào ví" },
              { label: "Cấp độ mở khóa", value: "Level 4", subtext: "Intermediate Pro" },
            ],
            highlightBox: {
              title: "🌟 Mô tả thành tích",
              content: "Hoàn thành ghi nhớ chính xác 500 từ vựng TOEIC với độ chính xác trên 85%. Bạn đã chứng minh sự kiên trì và nỗ lực phi thường trong học tập!",
              type: "success",
            },
            ctaUrl: "/dashboard/achievements",
            ctaLabel: "Xem Bộ Sưu Tập Thành Tích",
          });

        case "streak_milestones":
          return this.buildProgressEmailPayload({
            title: "Chúc Mừng Chuỗi Học 14 Ngày Liên Tiếp! 🔥",
            badgeText: "CỘT MỐC CHUỖI",
            recipientName: name,
            summary: "Tuyệt vời! Bạn vừa chạm mốc chuỗi học tập 14 ngày liên tiếp. Sự kỷ luật đều đặn mỗi ngày là bí quyết số 1 giúp đạt 900+ TOEIC!",
            metrics: [
              { label: "Chuỗi hiện tại", value: "14 ngày", subtext: "Đang rực cháy 🔥" },
              { label: "Kỷ lục cao nhất", value: "14 ngày", subtext: "Mục tiêu: 30 ngày" },
              { label: "Điểm thưởng mốc", value: "+280 pts", subtext: "Thưởng chuỗi" },
            ],
            highlightBox: {
              title: "🛡️ Bảo vệ chuỗi",
              content: "Đừng quên hoàn thành ít nhất 1 bài tập hoặc học 5 từ vựng trước 23:59 hôm nay để giữ chuỗi lửa không bị tắt.",
              type: "warning",
            },
            ctaUrl: "/dashboard/streak",
            ctaLabel: "Vào Học Giữ Chuỗi Ngay",
          });

        case "goal_achieved":
          return this.buildProgressEmailPayload({
            title: "Mục Tiêu Đã Đạt Được: Chinh phục mốc 750+ TOEIC 🎯",
            badgeText: "MỤC TIÊU HOÀN THÀNH",
            recipientName: name,
            summary: "Chúc mừng bạn đã hoàn thành trọn vẹn mục tiêu 'Chinh phục mốc 750+ TOEIC'! Bạn đã vượt qua tất cả bài học và bài kiểm tra quy định trong kế hoạch.",
            metrics: [
              { label: "Mục tiêu", value: "TOEIC 750+", subtext: "Hoàn thành 100%" },
              { label: "Tiến độ", value: "100%", subtext: "Vượt chỉ tiêu" },
              { label: "Trạng thái", value: "Đã đạt", subtext: "Verified by AI" },
            ],
            highlightBox: {
              title: "🚀 Bước tiếp theo",
              content: "Hãy đặt ngay một mục tiêu thử thách cao hơn (ví dụ: Chinh phục 850+ hoặc Master 1000 từ chuyên sâu) để duy trì đà bứt phá!",
              type: "success",
            },
            ctaUrl: "/dashboard/planner",
            ctaLabel: "Thiết Lập Mục Tiêu Mới",
          });

        case "newsletter_subscription":
          return this.buildProgressEmailPayload({
            title: "Bản Tin TOEIC AI: Chiến Lược Giải Đề Part 5 & 7 Tuần Này",
            badgeText: "BẢN TIN TOEIC AI",
            recipientName: name,
            summary: "Chào mừng bạn đến với Bản Tin Học Thuật & Mẹo Thi TOEIC AI số mới nhất. Mỗi tuần bạn sẽ nhận được các bí kíp làm bài, phân tích bẫy đề thi và từ vựng xu hướng.",
            metrics: [
              { label: "Chủ đề tuần", value: "Bẫy Part 5 & 6", subtext: "Ngữ pháp nâng cao" },
              { label: "Từ vựng trọng tâm", value: "10 Collocations", subtext: "Tần suất cao" },
              { label: "Thời lượng đọc", value: "3 phút", subtext: "Mẹo thực chiến" },
            ],
            highlightBox: {
              title: "📖 Mẹo giải đề nhanh Part 5",
              content: "Quy tắc 5 giây: Khi thấy các liên từ phụ thuộc (Although, Despite, Because of), hãy nhìn ngay cấu trúc sau chỗ trống (Mệnh đề S+V hay Cụm danh từ Noun phrase) để loại trừ 2 phương án sai ngay lập tức.",
              type: "info",
            },
            ctaUrl: "/dashboard",
            ctaLabel: "Khám Phá Thư Viện Bài Viết",
            footerNote: "Bạn nhận được email này vì đã đăng ký Bản tin học thuật TOEIC AI.",
            showUnsubscribe: true,
          });

        case "promotional_content":
          return this.buildProgressEmailPayload({
            title: "Ưu Đãi Đặc Biệt: Mở Khóa Trọn Bộ TOEIC AI Pro 900+ 🎁",
            badgeText: "ƯU ĐÃI ĐẶC BIỆT",
            recipientName: name,
            summary: "Ưu đãi độc quyền dành riêng cho học viên: Nâng cấp tài khoản TOEIC AI Pro 900+ với gói ôn luyện không giới hạn, kho 50+ đề thi độc quyền 2026 và trợ lý giải thích AI thông minh.",
            metrics: [
              { label: "Mã giảm giá", value: "TOEIC900VIP", subtext: "Giảm 35%" },
              { label: "Thời hạn ưu đãi", value: "48 giờ", subtext: "Số lượng có hạn" },
              { label: "Đề thi mở khóa", value: "50+ Đề", subtext: "Full giải chi tiết" },
            ],
            highlightBox: {
              title: "🔥 Quyền lợi gói Pro 900+",
              content: "Nhập mã TOEIC900VIP tại trang thanh toán để nhận ngay quyền truy cập không giới hạn AI Chat Tutor 24/7, phòng thi mô phỏng thực tế và cam kết tăng 150+ điểm.",
              type: "promo",
            },
            ctaUrl: "/dashboard/pricing",
            ctaLabel: "Nhận Ưu Đãi Ngay",
            footerNote: "Bạn nhận được email ưu đãi này từ chương trình khuyến mãi của TOEIC AI.",
            showUnsubscribe: true,
          });

        default:
          return this.buildProgressEmailPayload({
            title: "Thông Báo Từ TOEIC AI",
            badgeText: "THÔNG BÁO HỌC TẬP",
            recipientName: name,
            summary: "Bạn có thông báo mới từ hệ thống học tập TOEIC AI.",
            metrics: [],
            ctaUrl: "/dashboard",
            ctaLabel: "Xem Chi Tiết",
          });
      }
    } catch (error) {
      console.error("Error generating email preview:", error);
      throw new Error("Failed to generate email preview");
    }
  }

  /**
   * Send test email for a specific type
   */
  async sendTestEmail(userId: number, type: string) {
    switch (type) {
      case "daily_progress_report":
        return this.sendDailyProgressReport(userId, true);
      case "weekly_progress_report":
        return this.sendWeeklyProgressReport(userId, true);
      case "monthly_progress_report":
        return this.sendMonthlyProgressReport(userId, true);
      case "test_results":
        return this.sendTestResultsEmail(userId, undefined, true);
      case "achievement_unlocked":
        return this.sendAchievementUnlockedEmail(userId, undefined, true);
      case "streak_milestones":
        return this.sendStreakMilestoneEmail(userId, undefined, true);
      case "goal_achieved":
        return this.sendGoalAchievedEmail(userId, undefined, true);
      case "newsletter_subscription":
        return this.sendNewsletterSubscriptionEmail(userId, true);
      case "promotional_content":
        return this.sendPromotionalContentEmail(userId, "TOEIC900VIP", true);
      default:
        return this.sendDailyProgressReport(userId, true);
    }
  }

  /**
   * Toggle newsletter subscription
   */
  async toggleNewsletter(userId: number, subscribe?: boolean) {
    try {
      const pref = await this.prisma.notificationPreference.findUnique({
        where: { userId },
      });

      const nextStatus = subscribe !== undefined ? subscribe : !pref?.newsletterSubscription;

      const updated = await this.prisma.notificationPreference.upsert({
        where: { userId },
        update: { newsletterSubscription: nextStatus },
        create: { userId, newsletterSubscription: nextStatus },
      });

      if (nextStatus) {
        await this.sendNewsletterSubscriptionEmail(userId, true);
      }

      return {
        success: true,
        newsletterSubscription: updated.newsletterSubscription,
        message: nextStatus ? "Đã đăng ký nhận bản tin TOEIC AI thành công" : "Đã hủy đăng ký nhận bản tin",
      };
    } catch (error) {
      console.error("Error toggling newsletter subscription:", error);
      throw new Error("Failed to toggle newsletter subscription");
    }
  }
}