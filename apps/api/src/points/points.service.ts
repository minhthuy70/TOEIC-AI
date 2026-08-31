import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PointsService {
  constructor(private readonly prisma: PrismaService) {}

  // Points configuration
  private readonly POINTS_CONFIG = {
    vocabulary_learn: 5,
    vocabulary_review: 3,
    practice_correct: 2,
    practice_complete: 10,
    test_complete: 50,
    test_perfect: 100,
    grammar_lesson_complete: 15,
    listening_lesson_complete: 20,
    reading_lesson_complete: 20,
  };

  // Streak multiplier configuration
  private readonly STREAK_MULTIPLIERS = {
    0: 1.0,
    3: 1.1,  // 3+ days streak
    7: 1.25, // 7+ days streak
    14: 1.5, // 14+ days streak
    30: 2.0, // 30+ days streak
  };

  /**
   * Calculate streak multiplier based on current streak
   */
  private calculateStreakMultiplier(streak: number): number {
    const thresholds = Object.keys(this.STREAK_MULTIPLIERS)
      .map(Number)
      .sort((a, b) => b - a); // Sort descending

    for (const threshold of thresholds) {
      if (streak >= threshold) {
        return this.STREAK_MULTIPLIERS[threshold];
      }
    }
    return 1.0;
  }

  /**
   * Award points to user for various activities
   */
  async awardPoints(
    userId: number,
    type: string,
    sourceType?: string,
    sourceId?: number | undefined,
    customAmount?: number,
    description?: string
  ) {
    try {
      // Get user profile to check streak
      const userProfile = await this.prisma.userProfile.findUnique({
        where: { userId },
      });

      if (!userProfile) {
        throw new Error("User profile not found");
      }

      // Get base points
      const baseAmount = customAmount || this.POINTS_CONFIG[type] || 0;
      if (baseAmount === 0) {
        return { success: true, points: 0, message: "No points awarded for this activity" };
      }

      // Calculate streak multiplier
      const multiplier = this.calculateStreakMultiplier(userProfile.streak);
      const finalAmount = Math.round(baseAmount * multiplier);

      // Create points transaction
      const transaction = await this.prisma.pointsTransaction.create({
        data: {
          userId,
          amount: finalAmount,
          type,
          description: description || this.getDefaultDescription(type),
          sourceType,
          sourceId,
          multiplier,
          baseAmount,
        },
      });

      // Update user profile
      await this.prisma.userProfile.update({
        where: { userId },
        data: {
          pointsBalance: { increment: finalAmount },
          totalPointsEarned: { increment: finalAmount },
          currentStreakMultiplier: multiplier,
        },
      });

      return {
        success: true,
        points: finalAmount,
        baseAmount,
        multiplier,
        transactionId: transaction.id,
      };
    } catch (error) {
      console.error("Error awarding points:", error);
      throw new Error("Failed to award points");
    }
  }

  /**
   * Get default description for point types
   */
  private getDefaultDescription(type: string): string {
    const descriptions: Record<string, string> = {
      vocabulary_learn: "Học từ vựng mới",
      vocabulary_review: "Ôn tập từ vựng",
      practice_correct: "Trả lời đúng câu hỏi",
      practice_complete: "Hoàn thành bài luyện tập",
      test_complete: "Hoàn thành bài kiểm tra",
      test_perfect: "Đạt điểm tuyệt đối trong bài kiểm tra",
      grammar_lesson_complete: "Hoàn thành bài ngữ pháp",
      listening_lesson_complete: "Hoàn thành bài nghe",
      reading_lesson_complete: "Hoàn thành bài đọc",
      achievement_unlock: "Mở khóa thành tích",
      streak_bonus: "Thưởng chuỗi ngày",
    };
    return descriptions[type] || "Hoạt động học tập";
  }

  /**
   * Get points history for a user
   */
  async getPointsHistory(userId: number, limit: number = 50, offset: number = 0) {
    try {
      const transactions = await this.prisma.pointsTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      });

      const total = await this.prisma.pointsTransaction.count({
        where: { userId },
      });

      return {
        success: true,
        data: {
          transactions,
          total,
          hasMore: offset + limit < total,
        },
      };
    } catch (error) {
      console.error("Error fetching points history:", error);
      throw new Error("Failed to fetch points history");
    }
  }

  /**
   * Get points statistics for a user
   */
  async getPointsStats(userId: number) {
    try {
      const userProfile = await this.prisma.userProfile.findUnique({
        where: { userId },
      });

      if (!userProfile) {
        throw new Error("User profile not found");
      }

      // Get points by type
      const pointsByType = await this.prisma.pointsTransaction.groupBy({
        by: ["type"],
        where: { userId },
        _sum: { amount: true },
        _count: { id: true },
      });

      // Get recent transactions
      const recentTransactions = await this.prisma.pointsTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      });

      // Calculate points earned this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weeklyPoints = await this.prisma.pointsTransaction.aggregate({
        where: {
          userId,
          createdAt: { gte: weekAgo },
          amount: { gt: 0 },
        },
        _sum: { amount: true },
      });

      // Calculate points earned this month
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const monthlyPoints = await this.prisma.pointsTransaction.aggregate({
        where: {
          userId,
          createdAt: { gte: monthAgo },
          amount: { gt: 0 },
        },
        _sum: { amount: true },
      });

      return {
        success: true,
        data: {
          currentBalance: userProfile.pointsBalance,
          totalEarned: userProfile.totalPointsEarned,
          currentMultiplier: userProfile.currentStreakMultiplier,
          weeklyPoints: weeklyPoints._sum.amount || 0,
          monthlyPoints: monthlyPoints._sum.amount || 0,
          pointsByType: pointsByType.map((item) => ({
            type: item.type,
            totalPoints: item._sum.amount || 0,
            count: item._count.id,
          })),
          recentTransactions,
        },
      };
    } catch (error) {
      console.error("Error fetching points stats:", error);
      throw new Error("Failed to fetch points stats");
    }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(
    limit: number = 50,
    offset: number = 0,
    category: string = "global",
    period: string = "all_time"
  ) {
    try {
      let dateFilter = {};
      
      if (period === "weekly") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateFilter = {
          createdAt: { gte: weekAgo },
        };
      } else if (period === "monthly") {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        dateFilter = {
          createdAt: { gte: monthAgo },
        };
      }

      let pointsQuery = {};
      
      if (category === "vocabulary") {
        pointsQuery = {
          sourceType: "vocabulary",
          ...dateFilter,
        };
      } else if (category === "listening") {
        pointsQuery = {
          sourceType: "listening",
          ...dateFilter,
        };
      } else if (category === "reading") {
        pointsQuery = {
          sourceType: "reading",
          ...dateFilter,
        };
      } else {
        pointsQuery = dateFilter;
      }

      // Calculate points for each user based on category and period
      const userPoints = await this.prisma.pointsTransaction.groupBy({
        by: ["userId"],
        where: pointsQuery,
        _sum: { amount: true },
      });

      const pointsMap = new Map(
        userPoints.map((up) => [up.userId, up._sum.amount || 0])
      );

      const users = await this.prisma.userProfile.findMany({
        select: {
          userId: true,
          pointsBalance: true,
          totalPointsEarned: true,
          streak: true,
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
        take: limit,
        skip: offset,
      });

      // Sort users by calculated points
      const sortedUsers = users
        .map((user) => ({
          ...user,
          calculatedPoints: pointsMap.get(user.userId) || 0,
        }))
        .sort((a, b) => b.calculatedPoints - a.calculatedPoints);

      const total = await this.prisma.userProfile.count();

      return {
        success: true,
        data: {
          leaderboard: sortedUsers.map((user, index) => ({
            rank: offset + index + 1,
            userId: user.userId,
            fullName: user.user.fullName,
            avatarUrl: user.user.avatarUrl,
            pointsBalance: category === "global" && period === "all_time" 
              ? user.pointsBalance 
              : user.calculatedPoints,
            totalPointsEarned: user.totalPointsEarned,
            streak: user.streak,
          })),
          total,
          hasMore: offset + limit < total,
          category,
          period,
        },
      };
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      throw new Error("Failed to fetch leaderboard");
    }
  }

  /**
   * Get user's position in leaderboard
   */
  async getUserLeaderboardPosition(
    userId: number,
    category: string = "global",
    period: string = "all_time"
  ) {
    try {
      const userProfile = await this.prisma.userProfile.findUnique({
        where: { userId },
        select: { pointsBalance: true },
      });

      if (!userProfile) {
        throw new Error("User profile not found");
      }

      let dateFilter = {};
      
      if (period === "weekly") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateFilter = {
          createdAt: { gte: weekAgo },
        };
      } else if (period === "monthly") {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        dateFilter = {
          createdAt: { gte: monthAgo },
        };
      }

      let pointsQuery = {};
      
      if (category === "vocabulary") {
        pointsQuery = {
          sourceType: "vocabulary",
          ...dateFilter,
        };
      } else if (category === "listening") {
        pointsQuery = {
          sourceType: "listening",
          ...dateFilter,
        };
      } else if (category === "reading") {
        pointsQuery = {
          sourceType: "reading",
          ...dateFilter,
        };
      } else {
        pointsQuery = dateFilter;
      }

      const userPoints = await this.prisma.pointsTransaction.groupBy({
        by: ["userId"],
        where: pointsQuery,
        _sum: { amount: true },
      });

      const pointsMap = new Map(
        userPoints.map((up) => [up.userId, up._sum.amount || 0])
      );

      const userCalculatedPoints = pointsMap.get(userId) || 0;

      const usersWithHigherPoints = userPoints.filter(
        (up) => (up._sum.amount || 0) > userCalculatedPoints
      ).length;

      const position = usersWithHigherPoints + 1;
      const totalUsers = await this.prisma.userProfile.count();

      return {
        success: true,
        data: {
          position,
          totalUsers,
          pointsBalance: category === "global" && period === "all_time" 
            ? userProfile.pointsBalance 
            : userCalculatedPoints,
          category,
          period,
        },
      };
    } catch (error) {
      console.error("Error fetching user leaderboard position:", error);
      throw new Error("Failed to fetch user leaderboard position");
    }
  }

  /**
   * Get friends leaderboard
   */
  async getFriendsLeaderboard(
    userId: number,
    limit: number = 50,
    offset: number = 0,
    category: string = "global",
    period: string = "all_time"
  ) {
    try {
      const friends = await this.prisma.friend.findMany({
        where: {
          userId,
          status: "accepted",
        },
        select: {
          friendId: true,
        },
      });

      const friendIds = friends.map((f) => f.friendId);
      friendIds.push(userId); // Include current user

      let dateFilter = {};
      
      if (period === "weekly") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateFilter = {
          createdAt: { gte: weekAgo },
        };
      } else if (period === "monthly") {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        dateFilter = {
          createdAt: { gte: monthAgo },
        };
      }

      let pointsQuery: any = {
        userId: { in: friendIds },
      };
      
      if (category === "vocabulary") {
        pointsQuery = {
          ...pointsQuery,
          sourceType: "vocabulary",
          ...dateFilter,
        };
      } else if (category === "listening") {
        pointsQuery = {
          ...pointsQuery,
          sourceType: "listening",
          ...dateFilter,
        };
      } else if (category === "reading") {
        pointsQuery = {
          ...pointsQuery,
          sourceType: "reading",
          ...dateFilter,
        };
      } else {
        pointsQuery = {
          ...pointsQuery,
          ...dateFilter,
        };
      }

      const userPoints = await this.prisma.pointsTransaction.groupBy({
        by: ["userId"],
        where: pointsQuery,
        _sum: { amount: true },
      });

      const pointsMap = new Map(
        userPoints.map((up) => [up.userId, up._sum.amount || 0])
      );

      const users = await this.prisma.userProfile.findMany({
        where: {
          userId: { in: friendIds },
        },
        select: {
          userId: true,
          pointsBalance: true,
          totalPointsEarned: true,
          streak: true,
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
        take: limit,
        skip: offset,
      });

      const sortedUsers = users
        .map((user) => ({
          ...user,
          calculatedPoints: pointsMap.get(user.userId) || 0,
        }))
        .sort((a, b) => b.calculatedPoints - a.calculatedPoints);

      return {
        success: true,
        data: {
          leaderboard: sortedUsers.map((user, index) => ({
            rank: index + 1,
            userId: user.userId,
            fullName: user.user.fullName,
            avatarUrl: user.user.avatarUrl,
            pointsBalance: category === "global" && period === "all_time" 
              ? user.pointsBalance 
              : user.calculatedPoints,
            totalPointsEarned: user.totalPointsEarned,
            streak: user.streak,
            isCurrentUser: user.userId === userId,
          })),
          total: friendIds.length,
          hasMore: offset + limit < friendIds.length,
          category,
          period,
        },
      };
    } catch (error) {
      console.error("Error fetching friends leaderboard:", error);
      throw new Error("Failed to fetch friends leaderboard");
    }
  }

  /**
   * Search leaderboard
   */
  async searchLeaderboard(
    searchTerm: string,
    limit: number = 20,
    category: string = "global",
    period: string = "all_time"
  ) {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          OR: [
            { fullName: { contains: searchTerm, mode: "insensitive" } },
            { email: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          profile: {
            select: {
              userId: true,
              pointsBalance: true,
              totalPointsEarned: true,
              streak: true,
            },
          },
        },
        take: limit,
      });

      let dateFilter = {};
      
      if (period === "weekly") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateFilter = {
          createdAt: { gte: weekAgo },
        };
      } else if (period === "monthly") {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        dateFilter = {
          createdAt: { gte: monthAgo },
        };
      }

      let pointsQuery = {};
      
      if (category === "vocabulary") {
        pointsQuery = {
          sourceType: "vocabulary",
          ...dateFilter,
        };
      } else if (category === "listening") {
        pointsQuery = {
          sourceType: "listening",
          ...dateFilter,
        };
      } else if (category === "reading") {
        pointsQuery = {
          sourceType: "reading",
          ...dateFilter,
        };
      } else {
        pointsQuery = dateFilter;
      }

      const userPoints = await this.prisma.pointsTransaction.groupBy({
        by: ["userId"],
        where: pointsQuery,
        _sum: { amount: true },
      });

      const pointsMap = new Map(
        userPoints.map((up) => [up.userId, up._sum.amount || 0])
      );

      const usersWithProfiles = users.filter((u) => u.profile !== null);

      const sortedUsers = usersWithProfiles
        .map((user) => ({
          ...user,
          calculatedPoints: pointsMap.get(user.profile!.userId) || 0,
        }))
        .sort((a, b) => b.calculatedPoints - a.calculatedPoints);

      return {
        success: true,
        data: {
          leaderboard: sortedUsers.map((user, index) => ({
            rank: index + 1,
            userId: user.profile!.userId,
            fullName: user.fullName,
            avatarUrl: user.avatarUrl,
            pointsBalance: category === "global" && period === "all_time" 
              ? user.profile!.pointsBalance 
              : user.calculatedPoints,
            totalPointsEarned: user.profile!.totalPointsEarned,
            streak: user.profile!.streak,
          })),
          total: sortedUsers.length,
          category,
          period,
        },
      };
    } catch (error) {
      console.error("Error searching leaderboard:", error);
      throw new Error("Failed to search leaderboard");
    }
  }

  /**
   * Compare user with friends
   */
  async compareWithFriends(userId: number) {
    try {
      const friends = await this.prisma.friend.findMany({
        where: {
          userId,
          status: "accepted",
        },
        select: {
          friendId: true,
        },
      });

      const friendIds = friends.map((f) => f.friendId);
      friendIds.push(userId);

      const users = await this.prisma.userProfile.findMany({
        where: {
          userId: { in: friendIds },
        },
        select: {
          userId: true,
          pointsBalance: true,
          totalPointsEarned: true,
          streak: true,
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      });

      const sortedUsers = users.sort((a, b) => b.pointsBalance - a.pointsBalance);
      const currentUserIndex = sortedUsers.findIndex((u) => u.userId === userId);
      const currentUser = sortedUsers[currentUserIndex];

      const comparison = {
        currentUser: {
          rank: currentUserIndex + 1,
          userId: currentUser.userId,
          fullName: currentUser.user.fullName,
          avatarUrl: currentUser.user.avatarUrl,
          pointsBalance: currentUser.pointsBalance,
          streak: currentUser.streak,
        },
        friendsAbove: sortedUsers.slice(0, currentUserIndex).map((user, index) => ({
          rank: index + 1,
          userId: user.userId,
          fullName: user.user.fullName,
          avatarUrl: user.user.avatarUrl,
          pointsBalance: user.pointsBalance,
          streak: user.streak,
        })),
        friendsBelow: sortedUsers.slice(currentUserIndex + 1).map((user, index) => ({
          rank: currentUserIndex + 2 + index,
          userId: user.userId,
          fullName: user.user.fullName,
          avatarUrl: user.user.avatarUrl,
          pointsBalance: user.pointsBalance,
          streak: user.streak,
        })),
        totalFriends: friendIds.length - 1,
      };

      return {
        success: true,
        data: comparison,
      };
    } catch (error) {
      console.error("Error comparing with friends:", error);
      throw new Error("Failed to compare with friends");
    }
  }

  /**
   * Record leaderboard history
   */
  async recordLeaderboardHistory() {
    try {
      const users = await this.prisma.userProfile.findMany({
        select: {
          userId: true,
          pointsBalance: true,
        },
      });

      const sortedUsers = users.sort((a, b) => b.pointsBalance - a.pointsBalance);

      for (const user of sortedUsers) {
        const currentRank = sortedUsers.findIndex((u) => u.userId === user.userId) + 1;

        const lastHistory = await this.prisma.leaderboardHistory.findFirst({
          where: {
            userId: user.userId,
            category: "global",
            period: "all_time",
          },
          orderBy: {
            recordedAt: "desc",
          },
        });

        const previousRank = lastHistory?.currentRank || null;
        const rankChange = previousRank ? previousRank - currentRank : 0;

        await this.prisma.leaderboardHistory.create({
          data: {
            userId: user.userId,
            previousRank,
            currentRank,
            rankChange,
            category: "global",
            period: "all_time",
          },
        });

        // Create notification for significant rank changes
        if (rankChange > 0 && rankChange >= 5) {
          await this.prisma.leaderboardNotification.create({
            data: {
              userId: user.userId,
              type: "rank_up",
              title: "Lên hạng!",
              message: `Bạn đã tăng ${rankChange} hạng trong bảng xếp hạng toàn cầu`,
              previousRank,
              currentRank,
              category: "global",
            },
          });
        } else if (rankChange < 0 && Math.abs(rankChange) >= 5) {
          await this.prisma.leaderboardNotification.create({
            data: {
              userId: user.userId,
              type: "rank_down",
              title: "Xuống hạng",
              message: `Bạn đã giảm ${Math.abs(rankChange)} hạng trong bảng xếp hạng toàn cầu`,
              previousRank,
              currentRank,
              category: "global",
            },
          });
        }
      }

      return {
        success: true,
        message: "Leaderboard history recorded successfully",
      };
    } catch (error) {
      console.error("Error recording leaderboard history:", error);
      throw new Error("Failed to record leaderboard history");
    }
  }

  /**
   * Get leaderboard notifications
   */
  async getLeaderboardNotifications(userId: number, limit: number = 20) {
    try {
      const notifications = await this.prisma.leaderboardNotification.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
      });

      const unreadCount = await this.prisma.leaderboardNotification.count({
        where: {
          userId,
          isRead: false,
        },
      });

      return {
        success: true,
        data: {
          notifications,
          unreadCount,
        },
      };
    } catch (error) {
      console.error("Error fetching leaderboard notifications:", error);
      throw new Error("Failed to fetch leaderboard notifications");
    }
  }

  /**
   * Mark leaderboard notification as read
   */
  async markNotificationAsRead(notificationId: number, userId: number) {
    try {
      await this.prisma.leaderboardNotification.updateMany({
        where: {
          id: notificationId,
          userId,
        },
        data: {
          isRead: true,
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
   * Deduct points (for future redemption features)
   */
  async deductPoints(userId: number, amount: number, reason: string) {
    try {
      const userProfile = await this.prisma.userProfile.findUnique({
        where: { userId },
      });

      if (!userProfile) {
        throw new Error("User profile not found");
      }

      if (userProfile.pointsBalance < amount) {
        throw new Error("Insufficient points balance");
      }

      // Create negative transaction
      const transaction = await this.prisma.pointsTransaction.create({
        data: {
          userId,
          amount: -amount,
          type: "redemption",
          description: reason,
          sourceType: "redemption",
          multiplier: 1.0,
          baseAmount: -amount,
        },
      });

      // Update user profile
      await this.prisma.userProfile.update({
        where: { userId },
        data: {
          pointsBalance: { decrement: amount },
        },
      });

      return {
        success: true,
        pointsDeducted: amount,
        remainingBalance: userProfile.pointsBalance - amount,
        transactionId: transaction.id,
      };
    } catch (error) {
      console.error("Error deducting points:", error);
      throw new Error("Failed to deduct points");
    }
  }
}
