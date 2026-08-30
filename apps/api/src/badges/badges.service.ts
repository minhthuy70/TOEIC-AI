import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class BadgesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Seed default badges
   */
  async seedDefaultBadges() {
    const existingCount = await this.prisma.badge.count();
    if (existingCount > 0) return;

    const defaultBadges = [
      // Milestone badges
      {
        name: "Bước đầu tiên",
        description: "Hoàn thành 10 hoạt động học tập",
        category: "milestone",
        criteria: JSON.stringify({ type: "activities", target: 10 }),
        icon: "🎯",
        badgeColor: "blue",
        rarity: "common",
      },
      {
        name: "Người học chăm chỉ",
        description: "Hoàn thành 100 hoạt động học tập",
        category: "milestone",
        criteria: JSON.stringify({ type: "activities", target: 100 }),
        icon: "📚",
        badgeColor: "purple",
        rarity: "rare",
      },
      {
        name: "Cao thủ học tập",
        description: "Hoàn thành 500 hoạt động học tập",
        category: "milestone",
        criteria: JSON.stringify({ type: "activities", target: 500 }),
        icon: "🎓",
        badgeColor: "amber",
        rarity: "epic",
      },
      // Vocabulary badges
      {
        name: "Thợ từ vựng",
        description: "Học 100 từ vựng",
        category: "achievement",
        criteria: JSON.stringify({ type: "vocabulary", target: 100 }),
        icon: "📖",
        badgeColor: "green",
        rarity: "common",
      },
      {
        name: "Bậc thầy từ vựng",
        description: "Học 1000 từ vựng",
        category: "achievement",
        criteria: JSON.stringify({ type: "vocabulary", target: 1000 }),
        icon: "📚",
        badgeColor: "purple",
        rarity: "rare",
      },
      // Practice badges
      {
        name: "Luyện tập chăm chỉ",
        description: "Làm 200 câu hỏi luyện tập",
        category: "achievement",
        criteria: JSON.stringify({ type: "practice", target: 200 }),
        icon: "✍️",
        badgeColor: "blue",
        rarity: "common",
      },
      {
        name: "Chiến binh luyện tập",
        description: "Làm 1000 câu hỏi luyện tập",
        category: "achievement",
        criteria: JSON.stringify({ type: "practice", target: 1000 }),
        icon: "⚔️",
        badgeColor: "red",
        rarity: "epic",
      },
      // Test badges
      {
        name: "Người kiểm tra",
        description: "Hoàn thành 5 bài kiểm tra",
        category: "achievement",
        criteria: JSON.stringify({ type: "test", target: 5 }),
        icon: "📋",
        badgeColor: "amber",
        rarity: "common",
      },
      {
        name: "Thử thách vô địch",
        description: "Hoàn thành 50 bài kiểm tra",
        category: "achievement",
        criteria: JSON.stringify({ type: "test", target: 50 }),
        icon: "🏆",
        badgeColor: "yellow",
        rarity: "legendary",
      },
      // Streak badges
      {
        name: "Khởi đầu tốt",
        description: "Chuỗi học 7 ngày liên tục",
        category: "achievement",
        criteria: JSON.stringify({ type: "streak", target: 7 }),
        icon: "🔥",
        badgeColor: "orange",
        rarity: "common",
      },
      {
        name: "Kiên trì bền bỉ",
        description: "Chuỗi học 30 ngày liên tục",
        category: "achievement",
        criteria: JSON.stringify({ type: "streak", target: 30 }),
        icon: "💪",
        badgeColor: "red",
        rarity: "rare",
      },
      {
        name: "Huyền thoại chuỗi",
        description: "Chuỗi học 100 ngày liên tục",
        category: "achievement",
        criteria: JSON.stringify({ type: "streak", target: 100 }),
        icon: "👑",
        badgeColor: "gold",
        rarity: "legendary",
      },
      // Special badges
      {
        name: "Người đầu tiên",
        description: "Badge đặc biệt cho người dùng đầu tiên",
        category: "special",
        criteria: JSON.stringify({ type: "first_user" }),
        icon: "🌟",
        badgeColor: "pink",
        rarity: "limited",
        isLimited: true,
        limitCount: 10,
      },
      {
        name: "Sáng tạo vô hạn",
        description: "Badge đặc biệt cho người dùng sáng tạo",
        category: "special",
        criteria: JSON.stringify({ type: "creative" }),
        icon: "💡",
        badgeColor: "cyan",
        rarity: "limited",
        isLimited: true,
        limitCount: 100,
      },
    ];

    for (const badgeData of defaultBadges) {
      await this.prisma.badge.create({
        data: badgeData,
      });
    }
  }

  /**
   * Get user badges
   */
  async getUserBadges(userId: number) {
    try {
      const userBadges = await this.prisma.userBadge.findMany({
        where: { userId },
        include: {
          badge: true,
        },
        orderBy: { unlockedAt: "desc" },
      });

      // Get all available badges for progress tracking
      const allBadges = await this.prisma.badge.findMany({
        where: { isActive: true },
      });

      // Calculate progress for each badge
      const badgesWithProgress = await Promise.all(
        allBadges.map(async (badge) => {
          const userBadge = userBadges.find((ub) => ub.badgeId === badge.id);
          const criteria = JSON.parse(badge.criteria);
          
          // Calculate progress based on criteria type
          let progress = 0;
          if (userBadge) {
            progress = userBadge.progress;
          } else {
            // Calculate progress based on user's stats
            progress = await this.calculateBadgeProgress(userId, criteria);
          }

          return {
            ...badge,
            criteria,
            progress: Math.min(progress, 100),
            isUnlocked: !!userBadge,
            unlockedAt: userBadge?.unlockedAt,
            shareCount: userBadge?.shareCount || 0,
            isDisplayed: userBadge?.isDisplayed || false,
          };
        })
      );

      return {
        success: true,
        badges: badgesWithProgress,
        totalBadges: allBadges.length,
        unlockedBadges: userBadges.length,
      };
    } catch (error) {
      console.error("Error fetching user badges:", error);
      throw new Error("Failed to fetch user badges");
    }
  }

  /**
   * Calculate badge progress based on user stats
   */
  private async calculateBadgeProgress(userId: number, criteria: any): Promise<number> {
    try {
      switch (criteria.type) {
        case "vocabulary": {
          const vocabCount = await this.prisma.userVocabularyProgress.count({
            where: { userId, status: { in: ["LEARNING", "MASTERED"] } },
          });
          return Math.round((vocabCount / criteria.target) * 100);
        }
        case "practice": {
          const practiceCount = await this.prisma.practice_sessions.count({
            where: { user_id: userId, completed_at: { not: null } },
          });
          return Math.round((practiceCount / criteria.target) * 100);
        }
        case "test": {
          const testCount = await this.prisma.mock_test_attempts.count({
            where: { user_id: userId, submitted_at: { not: null } },
          });
          return Math.round((testCount / criteria.target) * 100);
        }
        case "streak": {
          const profile = await this.prisma.userProfile.findUnique({
            where: { userId },
          });
          return Math.round((profile?.streak || 0) / criteria.target * 100);
        }
        case "activities": {
          // Count total learning activities
          const vocabCount = await this.prisma.userVocabularyProgress.count({
            where: { userId },
          });
          const practiceCount = await this.prisma.practice_sessions.count({
            where: { user_id: userId, completed_at: { not: null } },
          });
          const testCount = await this.prisma.mock_test_attempts.count({
            where: { user_id: userId, submitted_at: { not: null } },
          });
          const totalActivities = vocabCount + practiceCount + testCount;
          return Math.round((totalActivities / criteria.target) * 100);
        }
        default:
          return 0;
      }
    } catch (error) {
      console.error("Error calculating badge progress:", error);
      return 0;
    }
  }

  /**
   * Unlock badge for user
   */
  async unlockBadge(userId: number, badgeId: number) {
    try {
      const existing = await this.prisma.userBadge.findUnique({
        where: {
          userId_badgeId: {
            userId,
            badgeId,
          },
        },
      });

      if (existing) {
        throw new Error("Badge already unlocked");
      }

      const badge = await this.prisma.badge.findUnique({
        where: { id: badgeId },
      });

      if (!badge) {
        throw new Error("Badge not found");
      }

      // Check if limited badge has reached limit
      if (badge.isLimited && badge.limitCount) {
        const unlockedCount = await this.prisma.userBadge.count({
          where: { badgeId },
        });
        if (unlockedCount >= badge.limitCount) {
          throw new Error("Limited badge has reached its limit");
        }
      }

      // Create user badge
      const userBadge = await this.prisma.userBadge.create({
        data: {
          userId,
          badgeId,
          progress: 100,
        },
      });

      return {
        success: true,
        badge: userBadge,
        message: `Badge "${badge.name}" unlocked!`,
      };
    } catch (error) {
      console.error("Error unlocking badge:", error);
      throw new Error("Failed to unlock badge");
    }
  }

  /**
   * Update badge display setting
   */
  async updateBadgeDisplay(userId: number, badgeId: number, isDisplayed: boolean) {
    try {
      const userBadge = await this.prisma.userBadge.update({
        where: {
          userId_badgeId: {
            userId,
            badgeId,
          },
        },
        data: { isDisplayed },
      });

      return {
        success: true,
        userBadge,
      };
    } catch (error) {
      console.error("Error updating badge display:", error);
      throw new Error("Failed to update badge display");
    }
  }

  /**
   * Share badge
   */
  async shareBadge(userId: number, badgeId: number) {
    try {
      const userBadge = await this.prisma.userBadge.update({
        where: {
          userId_badgeId: {
            userId,
            badgeId,
          },
        },
        data: { shareCount: { increment: 1 } },
      });

      const badge = await this.prisma.badge.findUnique({
        where: { id: badgeId },
      });

      return {
        success: true,
        shareCount: userBadge.shareCount,
        badge,
      };
    } catch (error) {
      console.error("Error sharing badge:", error);
      throw new Error("Failed to share badge");
    }
  }

  /**
   * Get all available badges
   */
  async getAllBadges() {
    try {
      const badges = await this.prisma.badge.findMany({
        where: { isActive: true },
        orderBy: { rarity: "asc" },
      });

      return {
        success: true,
        badges,
      };
    } catch (error) {
      console.error("Error fetching all badges:", error);
      throw new Error("Failed to fetch badges");
    }
  }
}
