import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ChallengesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get available challenges for a user
   */
  async getAvailableChallenges(userId: number, type?: string) {
    try {
      const now = new Date();
      
      let whereClause: any = {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      };

      if (type) {
        whereClause.type = type;
      }

      const challenges = await this.prisma.challenge.findMany({
        where: whereClause,
        include: {
          badgeReward: {
            select: {
              id: true,
              name: true,
              icon: true,
              badgeColor: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Filter out challenges the user has already completed or declined
      const userChallengeIds = await this.prisma.userChallenge.findMany({
        where: {
          userId,
          status: { in: ["completed", "declined"] },
        },
        select: { challengeId: true },
      });

      const excludedIds = new Set(userChallengeIds.map((uc) => uc.challengeId));

      const availableChallenges = challenges.filter(
        (c) => !excludedIds.has(c.id)
      );

      // Check which challenges the user has accepted
      const acceptedChallengeIds = await this.prisma.userChallenge.findMany({
        where: {
          userId,
          status: "accepted",
        },
        select: { challengeId: true },
      });

      const acceptedIds = new Set(acceptedChallengeIds.map((uc) => uc.challengeId));

      const challengesWithStatus = availableChallenges.map((challenge) => ({
        ...challenge,
        userStatus: acceptedIds.has(challenge.id) ? "accepted" : "available",
      }));

      return {
        success: true,
        data: {
          challenges: challengesWithStatus,
          total: challengesWithStatus.length,
        },
      };
    } catch (error) {
      console.error("Error fetching available challenges:", error);
      throw new Error("Failed to fetch available challenges");
    }
  }

  /**
   * Get user's active challenges
   */
  async getUserChallenges(userId: number) {
    try {
      const userChallenges = await this.prisma.userChallenge.findMany({
        where: {
          userId,
          status: { in: ["accepted", "completed"] },
        },
        include: {
          challenge: {
            include: {
              badgeReward: {
                select: {
                  id: true,
                  name: true,
                  icon: true,
                  badgeColor: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Get progress for each challenge
      const challengesWithProgress = await Promise.all(
        userChallenges.map(async (uc) => {
          const progress = await this.prisma.challengeProgress.findMany({
            where: {
              userId,
              challengeId: uc.challengeId,
            },
            orderBy: {
              recordedAt: "desc",
            },
            take: 1,
          });

          const latestProgress = progress[0] || null;

          return {
            ...uc,
            currentProgress: latestProgress?.currentValue || 0,
            targetValue: uc.challenge.targetValue,
            progressPercentage: latestProgress
              ? Math.round((latestProgress.currentValue / uc.challenge.targetValue) * 100)
              : 0,
          };
        })
      );

      return {
        success: true,
        data: {
          challenges: challengesWithProgress,
          total: challengesWithProgress.length,
        },
      };
    } catch (error) {
      console.error("Error fetching user challenges:", error);
      throw new Error("Failed to fetch user challenges");
    }
  }

  /**
   * Accept a challenge
   */
  async acceptChallenge(userId: number, challengeId: number) {
    try {
      const challenge = await this.prisma.challenge.findUnique({
        where: { id: challengeId },
      });

      if (!challenge) {
        throw new Error("Challenge not found");
      }

      if (!challenge.isActive) {
        throw new Error("Challenge is not active");
      }

      const now = new Date();
      if (now < challenge.startDate || now > challenge.endDate) {
        throw new Error("Challenge is not currently available");
      }

      if (challenge.maxParticipants && challenge.currentParticipants >= challenge.maxParticipants) {
        throw new Error("Challenge has reached maximum participants");
      }

      const existingUserChallenge = await this.prisma.userChallenge.findUnique({
        where: {
          userId_challengeId: {
            userId,
            challengeId,
          },
        },
      });

      if (existingUserChallenge) {
        if (existingUserChallenge.status === "accepted") {
          throw new Error("Challenge already accepted");
        }
        if (existingUserChallenge.status === "completed") {
          throw new Error("Challenge already completed");
        }
        if (existingUserChallenge.status === "declined") {
          throw new Error("Challenge previously declined");
        }
      }

      await this.prisma.$transaction([
        this.prisma.userChallenge.create({
          data: {
            userId,
            challengeId,
            status: "accepted",
            acceptedAt: now,
          },
        }),
        this.prisma.challenge.update({
          where: { id: challengeId },
          data: {
            currentParticipants: { increment: 1 },
          },
        }),
      ]);

      return {
        success: true,
        message: "Challenge accepted successfully",
      };
    } catch (error) {
      console.error("Error accepting challenge:", error);
      throw new Error("Failed to accept challenge");
    }
  }

  /**
   * Decline a challenge
   */
  async declineChallenge(userId: number, challengeId: number) {
    try {
      const existingUserChallenge = await this.prisma.userChallenge.findUnique({
        where: {
          userId_challengeId: {
            userId,
            challengeId,
          },
        },
      });

      if (existingUserChallenge && existingUserChallenge.status === "completed") {
        throw new Error("Cannot decline completed challenge");
      }

      await this.prisma.userChallenge.upsert({
        where: {
          userId_challengeId: {
            userId,
            challengeId,
          },
        },
        update: {
          status: "declined",
        },
        create: {
          userId,
          challengeId,
          status: "declined",
        },
      });

      return {
        success: true,
        message: "Challenge declined",
      };
    } catch (error) {
      console.error("Error declining challenge:", error);
      throw new Error("Failed to decline challenge");
    }
  }

  /**
   * Update challenge progress
   */
  async updateChallengeProgress(
    userId: number,
    challengeId: number,
    progressType: string,
    currentValue: number
  ) {
    try {
      const userChallenge = await this.prisma.userChallenge.findUnique({
        where: {
          userId_challengeId: {
            userId,
            challengeId,
          },
        },
        include: {
          challenge: true,
        },
      });

      if (!userChallenge || userChallenge.status !== "accepted") {
        throw new Error("Challenge not accepted");
      }

      const challenge = userChallenge.challenge;

      // Record progress
      await this.prisma.challengeProgress.create({
        data: {
          userId,
          challengeId,
          progressType,
          currentValue,
          targetValue: challenge.targetValue,
        },
      });

      // Update user challenge progress
      await this.prisma.userChallenge.update({
        where: {
          userId_challengeId: {
            userId,
            challengeId,
          },
        },
        data: {
          progress: currentValue,
        },
      });

      // Check if challenge is completed
      if (currentValue >= challenge.targetValue) {
        await this.completeChallenge(userId, challengeId);
      }

      return {
        success: true,
        message: "Progress updated",
      };
    } catch (error) {
      console.error("Error updating challenge progress:", error);
      throw new Error("Failed to update challenge progress");
    }
  }

  /**
   * Complete a challenge and award rewards
   */
  async completeChallenge(userId: number, challengeId: number) {
    try {
      const userChallenge = await this.prisma.userChallenge.findUnique({
        where: {
          userId_challengeId: {
            userId,
            challengeId,
          },
        },
        include: {
          challenge: {
            include: {
              badgeReward: true,
            },
          },
        },
      });

      if (!userChallenge || userChallenge.status === "completed") {
        return { success: true, message: "Challenge already completed" };
      }

      const challenge = userChallenge.challenge;
      const rewards: any = {
        points: challenge.pointsReward,
        badges: [],
      };

      // Award points
      if (challenge.pointsReward > 0) {
        await this.prisma.userProfile.update({
          where: { userId },
          data: {
            pointsBalance: { increment: challenge.pointsReward },
            totalPointsEarned: { increment: challenge.pointsReward },
          },
        });

        // Create points transaction
        await this.prisma.pointsTransaction.create({
          data: {
            userId,
            amount: challenge.pointsReward,
            type: "challenge_complete",
            description: `Hoàn thành thử thách: ${challenge.title}`,
            sourceType: "challenge",
            sourceId: challengeId,
            multiplier: 1.0,
            baseAmount: challenge.pointsReward,
          },
        });
      }

      // Award badge
      if (challenge.badgeRewardId) {
        const existingBadge = await this.prisma.userBadge.findUnique({
          where: {
            userId_badgeId: {
              userId,
              badgeId: challenge.badgeRewardId,
            },
          },
        });

        if (!existingBadge) {
          await this.prisma.userBadge.create({
            data: {
              userId,
              badgeId: challenge.badgeRewardId,
            },
          });
          rewards.badges.push(challenge.badgeReward);
        }
      }

      // Update user challenge status
      await this.prisma.userChallenge.update({
        where: {
          userId_challengeId: {
            userId,
            challengeId,
          },
        },
        data: {
          status: "completed",
          completedAt: new Date(),
          score: challenge.targetValue,
          rewardsReceived: JSON.stringify(rewards),
        },
      });

      return {
        success: true,
        message: "Challenge completed successfully",
        data: rewards,
      };
    } catch (error) {
      console.error("Error completing challenge:", error);
      throw new Error("Failed to complete challenge");
    }
  }

  /**
   * Get challenge leaderboard
   */
  async getChallengeLeaderboard(challengeId: number, limit: number = 20) {
    try {
      const completedChallenges = await this.prisma.userChallenge.findMany({
        where: {
          challengeId,
          status: "completed",
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              profile: {
                select: {
                  pointsBalance: true,
                  streak: true,
                },
              },
            },
          },
        },
        orderBy: {
          completedAt: "asc",
        },
        take: limit,
      });

      const leaderboard = completedChallenges.map((uc, index) => ({
        rank: index + 1,
        userId: uc.userId,
        fullName: uc.user.fullName,
        avatarUrl: uc.user.avatarUrl,
        pointsBalance: uc.user.profile?.pointsBalance || 0,
        streak: uc.user.profile?.streak || 0,
        score: uc.score,
        completedAt: uc.completedAt,
      }));

      return {
        success: true,
        data: {
          leaderboard,
          total: leaderboard.length,
        },
      };
    } catch (error) {
      console.error("Error fetching challenge leaderboard:", error);
      throw new Error("Failed to fetch challenge leaderboard");
    }
  }

  /**
   * Get challenge history for a user
   */
  async getChallengeHistory(userId: number, limit: number = 20) {
    try {
      const history = await this.prisma.userChallenge.findMany({
        where: {
          userId,
          status: { in: ["completed", "declined", "failed"] },
        },
        include: {
          challenge: {
            select: {
              title: true,
              type: true,
              category: true,
              pointsReward: true,
              badgeReward: {
                select: {
                  name: true,
                  icon: true,
                },
              },
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
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
      console.error("Error fetching challenge history:", error);
      throw new Error("Failed to fetch challenge history");
    }
  }

  /**
   * Create custom challenge
   */
  async createCustomChallenge(userId: number, challengeData: any) {
    try {
      const {
        title,
        description,
        category,
        criteria,
        targetValue,
        pointsReward,
        difficulty,
        startDate,
        endDate,
        maxParticipants,
      } = challengeData;

      const challenge = await this.prisma.challenge.create({
        data: {
          title,
          description,
          type: "custom",
          category,
          criteria: JSON.stringify(criteria),
          targetValue,
          rewards: JSON.stringify({ points: pointsReward }),
          pointsReward,
          difficulty: difficulty || "medium",
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          maxParticipants,
          createdBy: userId,
          isActive: true,
        },
      });

      return {
        success: true,
        message: "Custom challenge created successfully",
        data: challenge,
      };
    } catch (error) {
      console.error("Error creating custom challenge:", error);
      throw new Error("Failed to create custom challenge");
    }
  }

  /**
   * Get challenge details
   */
  async getChallengeDetails(challengeId: number) {
    try {
      const challenge = await this.prisma.challenge.findUnique({
        where: { id: challengeId },
        include: {
          badgeReward: {
            select: {
              id: true,
              name: true,
              icon: true,
              badgeColor: true,
              description: true,
            },
          },
          creator: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      });

      if (!challenge) {
        throw new Error("Challenge not found");
      }

      return {
        success: true,
        data: challenge,
      };
    } catch (error) {
      console.error("Error fetching challenge details:", error);
      throw new Error("Failed to fetch challenge details");
    }
  }
}