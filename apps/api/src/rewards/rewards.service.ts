import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RewardsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get available rewards catalog
   */
  async getRewardsCatalog(category?: string, includeInactive: boolean = false) {
    try {
      const now = new Date();
      
      let whereClause: any = {};
      
      if (!includeInactive) {
        whereClause.isActive = true;
        whereClause.OR = [
          { availableFrom: null },
          { availableFrom: { lte: now } },
        ];
        whereClause.AND = [
          {
            OR: [
              { availableUntil: null },
              { availableUntil: { gte: now } },
            ],
          },
        ];
      }

      if (category) {
        whereClause.category = category;
      }

      const rewards = await this.prisma.reward.findMany({
        where: whereClause,
        orderBy: [
          { isSpecial: "desc" },
          { isLimited: "desc" },
          { pointsCost: "asc" },
        ],
      });

      // Add availability info for limited rewards
      const rewardsWithAvailability = rewards.map((reward) => ({
        ...reward,
        isAvailable: !reward.isLimited || reward.currentQuantity < reward.limitedQuantity!,
        remainingQuantity: reward.isLimited ? Math.max(0, reward.limitedQuantity! - reward.currentQuantity) : null,
        timeRemaining: reward.availableUntil 
          ? Math.max(0, new Date(reward.availableUntil).getTime() - now.getTime())
          : null,
      }));

      return {
        success: true,
        data: {
          rewards: rewardsWithAvailability,
          total: rewardsWithAvailability.length,
        },
      };
    } catch (error) {
      console.error("Error fetching rewards catalog:", error);
      throw new Error("Failed to fetch rewards catalog");
    }
  }

  /**
   * Get user's reward history
   */
  async getUserRewardHistory(userId: number, limit: number = 20) {
    try {
      const history = await this.prisma.rewardRedemption.findMany({
        where: { userId },
        include: {
          reward: {
            select: {
              name: true,
              category: true,
              imageUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
      });

      return {
        success: true,
        data: {
          history,
          total: history.length,
        },
      };
    } catch (error) {
      console.error("Error fetching reward history:", error);
      throw new Error("Failed to fetch reward history");
    }
  }

  /**
   * Redeem a reward
   */
  async redeemReward(userId: number, rewardId: number) {
    try {
      const reward = await this.prisma.reward.findUnique({
        where: { id: rewardId },
      });

      if (!reward) {
        throw new Error("Reward not found");
      }

      if (!reward.isActive) {
        throw new Error("Reward is not available");
      }

      const now = new Date();
      if (reward.availableFrom && now < reward.availableFrom) {
        throw new Error("Reward is not yet available");
      }
      if (reward.availableUntil && now > reward.availableUntil) {
        throw new Error("Reward has expired");
      }

      if (reward.isLimited && reward.currentQuantity >= reward.limitedQuantity!) {
        throw new Error("Reward is out of stock");
      }

      // Check user's points balance
      const userProfile = await this.prisma.userProfile.findUnique({
        where: { userId },
      });

      if (!userProfile) {
        throw new Error("User profile not found");
      }

      if (userProfile.pointsBalance < reward.pointsCost) {
        throw new Error("Insufficient points");
      }

      // Generate redemption code
      const redemptionCode = this.generateRedemptionCode();

      // Create redemption record
      const redemption = await this.prisma.$transaction([
        this.prisma.rewardRedemption.create({
          data: {
            userId,
            rewardId,
            pointsSpent: reward.pointsCost,
            status: "completed",
            redemptionCode,
            redeemedAt: now,
          },
        }),
        this.prisma.userProfile.update({
          where: { userId },
          data: {
            pointsBalance: { decrement: reward.pointsCost },
          },
        }),
        this.prisma.pointsTransaction.create({
          data: {
            userId,
            amount: -reward.pointsCost,
            type: "reward_redemption",
            description: `Đổi phần thưởng: ${reward.name}`,
            sourceType: "reward",
            sourceId: rewardId,
            multiplier: 1.0,
            baseAmount: -reward.pointsCost,
          },
        }),
        ...(reward.isLimited ? [
          this.prisma.reward.update({
            where: { id: rewardId },
            data: {
              currentQuantity: { increment: 1 },
            },
          }),
        ] : []),
      ]);

      // Create notification
      await this.prisma.rewardNotification.create({
        data: {
          userId,
          type: "reward_redeemed",
          title: "Đổi phần thưởng thành công",
          message: `Bạn đã đổi thành công phần thưởng: ${reward.name}`,
          rewardId,
          redemptionId: (redemption[0] as any).id,
        },
      });

      return {
        success: true,
        message: "Reward redeemed successfully",
        data: {
          redemptionCode,
          reward: {
            name: reward.name,
            description: reward.description,
            value: reward.value,
          },
        },
      };
    } catch (error) {
      console.error("Error redeeming reward:", error);
      throw new Error("Failed to redeem reward");
    }
  }

  /**
   * Share a reward
   */
  async shareReward(userId: number, rewardId: number, bonusPoints: number = 0) {
    try {
      const reward = await this.prisma.reward.findUnique({
        where: { id: rewardId },
      });

      if (!reward) {
        throw new Error("Reward not found");
      }

      // Generate share code
      const shareCode = this.generateShareCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

      const share = await this.prisma.rewardShare.create({
        data: {
          userId,
          rewardId,
          shareCode,
          expiresAt,
          bonusPoints,
        },
      });

      return {
        success: true,
        message: "Reward share created successfully",
        data: {
          shareCode,
          shareUrl: `/rewards/share/${shareCode}`,
          expiresAt,
          bonusPoints,
        },
      };
    } catch (error) {
      console.error("Error sharing reward:", error);
      throw new Error("Failed to share reward");
    }
  }

  /**
   * Claim a shared reward
   */
  async claimSharedReward(userId: number, shareCode: string) {
    try {
      const share = await this.prisma.rewardShare.findUnique({
        where: { shareCode },
        include: {
          reward: true,
        },
      });

      if (!share) {
        throw new Error("Invalid share code");
      }

      if (new Date() > share.expiresAt) {
        throw new Error("Share code has expired");
      }

      if (share.currentUses >= share.maxUses) {
        throw new Error("Share code has been used too many times");
      }

      if (share.userId === userId) {
        throw new Error("Cannot claim your own shared reward");
      }

      // Check if user already claimed this share
      const existingClaim = await this.prisma.rewardRedemption.findFirst({
        where: {
          userId,
          rewardId: share.rewardId,
          notes: { contains: shareCode },
        },
      });

      if (existingClaim) {
        throw new Error("You already claimed this shared reward");
      }

      // Award bonus points if applicable
      let pointsAwarded = 0;
      if (share.bonusPoints > 0) {
        await this.prisma.$transaction([
          this.prisma.userProfile.update({
            where: { userId },
            data: {
              pointsBalance: { increment: share.bonusPoints },
              totalPointsEarned: { increment: share.bonusPoints },
            },
          }),
          this.prisma.pointsTransaction.create({
            data: {
              userId,
              amount: share.bonusPoints,
              type: "reward_share_bonus",
              description: `Bonus points from shared reward: ${share.reward.name}`,
              sourceType: "reward_share",
              sourceId: share.id,
              multiplier: 1.0,
              baseAmount: share.bonusPoints,
            },
          }),
        ]);
        pointsAwarded = share.bonusPoints;
      }

      // Update share usage
      await this.prisma.rewardShare.update({
        where: { id: share.id },
        data: {
          currentUses: { increment: 1 },
        },
      });

      // Create notification for the original sharer
      await this.prisma.rewardNotification.create({
        data: {
          userId: share.userId,
          type: "bonus_earned",
          title: "Someone claimed your shared reward",
          message: `Bạn đã nhận thêm điểm khi có người dùng đổi phần thưởng bạn chia sẻ`,
          rewardId: share.rewardId,
          bonusPoints: share.bonusPoints,
        },
      });

      return {
        success: true,
        message: "Shared reward claimed successfully",
        data: {
          reward: share.reward,
          bonusPoints: pointsAwarded,
        },
      };
    } catch (error) {
      console.error("Error claiming shared reward:", error);
      throw new Error("Failed to claim shared reward");
    }
  }

  /**
   * Get reward notifications
   */
  async getRewardNotifications(userId: number, limit: number = 20) {
    try {
      const notifications = await this.prisma.rewardNotification.findMany({
        where: { userId },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
      });

      const unreadCount = await this.prisma.rewardNotification.count({
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
      console.error("Error fetching reward notifications:", error);
      throw new Error("Failed to fetch reward notifications");
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: number, userId: number) {
    try {
      await this.prisma.rewardNotification.updateMany({
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
   * Get reward details
   */
  async getRewardDetails(rewardId: number) {
    try {
      const reward = await this.prisma.reward.findUnique({
        where: { id: rewardId },
      });

      if (!reward) {
        throw new Error("Reward not found");
      }

      return {
        success: true,
        data: reward,
      };
    } catch (error) {
      console.error("Error fetching reward details:", error);
      throw new Error("Failed to fetch reward details");
    }
  }

  /**
   * Generate unique redemption code
   */
  private generateRedemptionCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 12; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Generate unique share code
   */
  private generateShareCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}