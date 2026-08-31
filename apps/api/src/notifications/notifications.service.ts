import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

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
      sentCount = 0;

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
                  lastActivityDate: true,
                },
              },
            },
          },
        },
      });

      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      sentCount = 0;

      for (const pref of usersWithPreferences) {
        const profile = pref.user.profile;
        if (profile && profile.streak > 0) {
          const lastActivity = profile.lastActivityDate ? new Date(profile.lastActivityDate) : null;
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

      sentCount = 0;
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
}