import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class LevelsService {
  constructor(private readonly prisma: PrismaService) {}

  // XP configuration
  private readonly XP_CONFIG = {
    vocabulary_learn: 10,
    vocabulary_review: 5,
    practice_correct: 3,
    practice_complete: 20,
    test_complete: 100,
    test_perfect: 200,
    grammar_lesson_complete: 30,
    listening_lesson_complete: 40,
    reading_lesson_complete: 40,
    achievement_unlock: 50,
  };

  // Level XP requirements (exponential growth)
  private readonly LEVEL_XP_REQUIREMENTS = {
    1: 0,
    2: 100,
    3: 300,
    4: 600,
    5: 1000,
    6: 1500,
    7: 2100,
    8: 2800,
    9: 3600,
    10: 4500,
    11: 5500,
    12: 6600,
    13: 7800,
    14: 9100,
    15: 10500,
    16: 12000,
    17: 13600,
    18: 15300,
    19: 17100,
    20: 19000,
    25: 30000,
    30: 45000,
    40: 80000,
    50: 125000,
  };

  /**
   * Calculate XP required for a specific level
   */
  private getXpForLevel(level: number): number {
    if (this.LEVEL_XP_REQUIREMENTS[level]) {
      return this.LEVEL_XP_REQUIREMENTS[level];
    }
    // Formula for levels beyond 50: 500 * level^2
    return 500 * level * level;
  }

  /**
   * Calculate level from total XP
   */
  private getLevelFromXp(totalXp: number): number {
    let level = 1;
    while (level < 100 && totalXp >= this.getXpForLevel(level + 1)) {
      level++;
    }
    return level;
  }

  /**
   * Award XP to user for various activities
   */
  async awardXp(
    userId: number,
    type: string,
    sourceType?: string,
    sourceId?: number,
    customXp?: number,
    description?: string
  ) {
    try {
      // Get user profile
      const userProfile = await this.prisma.userProfile.findUnique({
        where: { userId },
      });

      if (!userProfile) {
        throw new Error("User profile not found");
      }

      // Get base XP
      const baseXp = customXp || this.XP_CONFIG[type] || 0;
      if (baseXp === 0) {
        return { success: true, xp: 0, message: "No XP awarded for this activity" };
      }

      // Calculate new totals
      const newXpEarned = userProfile.totalXpEarned + baseXp;
      const newLevel = this.getLevelFromXp(newXpEarned);
      const currentLevelXp = this.getXpForLevel(newLevel);
      const nextLevelXp = this.getXpForLevel(newLevel + 1);
      const xpToNextLevel = nextLevelXp - newXpEarned;
      const xpProgress = newXpEarned - currentLevelXp;
      const xpProgressPercent = nextLevelXp > currentLevelXp 
        ? Math.round((xpProgress / (nextLevelXp - currentLevelXp)) * 100)
        : 100;

      // Check if user leveled up
      const leveledUp = newLevel > userProfile.level;
      let levelUpReward: any = null;

      if (leveledUp) {
        // Create user level record
        await this.prisma.userLevel.create({
          data: {
            userId,
            levelId: newLevel,
            xpEarned: newXpEarned,
          },
        });

        // Get level rewards
        const level = await this.prisma.level.findUnique({
          where: { levelNumber: newLevel },
        });

        if (level?.rewards) {
          levelUpReward = JSON.parse(level.rewards);
          
          // Award points if included in rewards
          if (levelUpReward?.points) {
            await this.prisma.userProfile.update({
              where: { userId },
              data: { pointsBalance: { increment: levelUpReward.points } },
            });
          }
        }

        // Create level-up notification
        await this.prisma.levelUpNotification.create({
          data: {
            userId,
            newLevel,
            previousLevel: userProfile.level,
            xpEarned: baseXp,
            rewards: levelUpReward ? JSON.stringify(levelUpReward) : null,
          },
        });
      }

      // Update user profile
      await this.prisma.userProfile.update({
        where: { userId },
        data: {
          xp: { increment: baseXp },
          totalXpEarned: newXpEarned,
          level: newLevel,
          xpToNextLevel,
        },
      });

      return {
        success: true,
        xp: baseXp,
        totalXp: newXpEarned,
        level: newLevel,
        leveledUp,
        levelUpReward,
        xpProgress: xpProgressPercent,
        xpToNextLevel,
      };
    } catch (error) {
      console.error("Error awarding XP:", error);
      throw new Error("Failed to award XP");
    }
  }

  /**
   * Get user level information
   */
  async getUserLevelInfo(userId: number) {
    try {
      const userProfile = await this.prisma.userProfile.findUnique({
        where: { userId },
      });

      if (!userProfile) {
        throw new Error("User profile not found");
      }

      const currentLevelXp = this.getXpForLevel(userProfile.level);
      const nextLevelXp = this.getXpForLevel(userProfile.level + 1);
      const xpProgress = userProfile.totalXpEarned - currentLevelXp;
      const xpProgressPercent = nextLevelXp > currentLevelXp 
        ? Math.round((xpProgress / (nextLevelXp - currentLevelXp)) * 100)
        : 100;

      // Get current level details
      const currentLevel = await this.prisma.level.findUnique({
        where: { levelNumber: userProfile.level },
      });

      // Get next level details
      const nextLevel = await this.prisma.level.findUnique({
        where: { levelNumber: userProfile.level + 1 },
      });

      // Get user's achieved levels
      const userLevels = await this.prisma.userLevel.findMany({
        where: { userId },
        include: {
          level: true,
        },
        orderBy: { levelId: "desc" },
      });

      return {
        success: true,
        currentLevel: userProfile.level,
        totalXp: userProfile.totalXpEarned,
        currentXp: userProfile.xp,
        xpToNextLevel: userProfile.xpToNextLevel,
        xpProgress: xpProgressPercent,
        currentLevelInfo: currentLevel,
        nextLevelInfo: nextLevel,
        achievedLevels: userLevels,
      };
    } catch (error) {
      console.error("Error fetching user level info:", error);
      throw new Error("Failed to fetch user level info");
    }
  }

  /**
   * Get all available levels
   */
  async getAllLevels() {
    try {
      const levels = await this.prisma.level.findMany({
        where: { isActive: true },
        orderBy: { levelNumber: "asc" },
      });

      return {
        success: true,
        levels,
      };
    } catch (error) {
      console.error("Error fetching levels:", error);
      throw new Error("Failed to fetch levels");
    }
  }

  /**
   * Seed default levels
   */
  async seedDefaultLevels() {
    const existingCount = await this.prisma.level.count();
    if (existingCount > 0) return;

    const defaultLevels = [
      { levelNumber: 1, name: "Người mới bắt đầu", description: "Bắt đầu hành trình học TOEIC", xpRequired: 0, icon: "🌱", color: "green" },
      { levelNumber: 2, name: "Học sinh chăm chỉ", description: "Đã tích lũy 100 XP", xpRequired: 100, icon: "📚", color: "blue" },
      { levelNumber: 3, name: "Người học trung cấp", description: "Đã tích lũy 300 XP", xpRequired: 300, icon: "🎓", color: "purple" },
      { levelNumber: 5, name: "Cao thủ", description: "Đã tích lũy 1000 XP", xpRequired: 1000, icon: "⭐", color: "amber" },
      { levelNumber: 10, name: "Bậc thầy", description: "Đã tích lũy 4500 XP", xpRequired: 4500, icon: "👑", color: "yellow" },
      { levelNumber: 20, name: "Huyền thoại", description: "Đã tích lũy 19000 XP", xpRequired: 19000, icon: "🏆", color: "red" },
      { levelNumber: 30, name: "Siêu thiên tài", description: "Đã tích lũy 45000 XP", xpRequired: 45000, icon: "💎", color: "cyan" },
      { levelNumber: 50, name: "Thần thánh", description: "Đã tích lũy 125000 XP", xpRequired: 125000, icon: "🌟", color: "pink" },
    ];

    for (const levelData of defaultLevels) {
      await this.prisma.level.create({
        data: {
          ...levelData,
          rewards: JSON.stringify({ points: levelData.levelNumber * 10 }),
        },
      });
    }
  }

  /**
   * Get level-up notifications for user
   */
  async getLevelUpNotifications(userId: number) {
    try {
      const notifications = await this.prisma.levelUpNotification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      return {
        success: true,
        notifications,
        unreadCount: notifications.filter(n => !n.isRead).length,
      };
    } catch (error) {
      console.error("Error fetching level-up notifications:", error);
      throw new Error("Failed to fetch level-up notifications");
    }
  }

  /**
   * Mark level-up notification as read
   */
  async markNotificationAsRead(notificationId: number, userId: number) {
    try {
      const notification = await this.prisma.levelUpNotification.update({
        where: { 
          id: notificationId,
          userId,
        },
        data: { isRead: true },
      });

      return {
        success: true,
        notification,
      };
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw new Error("Failed to mark notification as read");
    }
  }
}
