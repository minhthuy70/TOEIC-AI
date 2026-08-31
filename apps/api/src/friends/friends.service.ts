import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class FriendsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Send friend request
   */
  async sendFriendRequest(userId: number, friendId: number) {
    try {
      if (userId === friendId) {
        throw new Error("Cannot send friend request to yourself");
      }

      const existingFriend = await this.prisma.friend.findFirst({
        where: {
          OR: [
            { userId, friendId },
            { userId: friendId, friendId: userId },
          ],
        },
      });

      if (existingFriend) {
        if (existingFriend.status === "accepted") {
          throw new Error("Already friends");
        }
        if (existingFriend.status === "pending") {
          throw new Error("Friend request already sent");
        }
      }

      await this.prisma.friend.create({
        data: {
          userId,
          friendId,
          status: "pending",
        },
      });

      return {
        success: true,
        message: "Friend request sent successfully",
      };
    } catch (error) {
      console.error("Error sending friend request:", error);
      throw new Error("Failed to send friend request");
    }
  }

  /**
   * Accept friend request
   */
  async acceptFriendRequest(userId: number, friendId: number) {
    try {
      const friendRequest = await this.prisma.friend.findFirst({
        where: {
          userId: friendId,
          friendId: userId,
          status: "pending",
        },
      });

      if (!friendRequest) {
        throw new Error("Friend request not found");
      }

      await this.prisma.friend.update({
        where: { id: friendRequest.id },
        data: { status: "accepted" },
      });

      return {
        success: true,
        message: "Friend request accepted",
      };
    } catch (error) {
      console.error("Error accepting friend request:", error);
      throw new Error("Failed to accept friend request");
    }
  }

  /**
   * Reject friend request
   */
  async rejectFriendRequest(userId: number, friendId: number) {
    try {
      const friendRequest = await this.prisma.friend.findFirst({
        where: {
          userId: friendId,
          friendId: userId,
          status: "pending",
        },
      });

      if (!friendRequest) {
        throw new Error("Friend request not found");
      }

      await this.prisma.friend.delete({
        where: { id: friendRequest.id },
      });

      return {
        success: true,
        message: "Friend request rejected",
      };
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      throw new Error("Failed to reject friend request");
    }
  }

  /**
   * Remove friend
   */
  async removeFriend(userId: number, friendId: number) {
    try {
      await this.prisma.friend.deleteMany({
        where: {
          OR: [
            { userId, friendId },
            { userId: friendId, friendId: userId },
          ],
          status: "accepted",
        },
      });

      return {
        success: true,
        message: "Friend removed successfully",
      };
    } catch (error) {
      console.error("Error removing friend:", error);
      throw new Error("Failed to remove friend");
    }
  }

  /**
   * Get friends list
   */
  async getFriendsList(userId: number) {
    try {
      const friends = await this.prisma.friend.findMany({
        where: {
          userId,
          status: "accepted",
        },
        include: {
          friend: {
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
      });

      return {
        success: true,
        data: {
          friends: friends.map((f) => ({
            userId: f.friendId,
            fullName: f.friend.fullName,
            avatarUrl: f.friend.avatarUrl,
            pointsBalance: f.friend.profile?.pointsBalance || 0,
            streak: f.friend.profile?.streak || 0,
          })),
          total: friends.length,
        },
      };
    } catch (error) {
      console.error("Error getting friends list:", error);
      throw new Error("Failed to get friends list");
    }
  }

  /**
   * Get pending friend requests
   */
  async getPendingRequests(userId: number) {
    try {
      const pendingRequests = await this.prisma.friend.findMany({
        where: {
          friendId: userId,
          status: "pending",
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
      });

      return {
        success: true,
        data: {
          requests: pendingRequests.map((r) => ({
            userId: r.userId,
            fullName: r.user.fullName,
            avatarUrl: r.user.avatarUrl,
            pointsBalance: r.user.profile?.pointsBalance || 0,
            streak: r.user.profile?.streak || 0,
            createdAt: r.createdAt,
          })),
          total: pendingRequests.length,
        },
      };
    } catch (error) {
      console.error("Error getting pending requests:", error);
      throw new Error("Failed to get pending requests");
    }
  }

  /**
   * Search users to add as friends
   */
  async searchUsers(searchTerm: string, userId: number, limit: number = 20) {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          AND: [
            {
              OR: [
                { fullName: { contains: searchTerm, mode: "insensitive" } },
                { email: { contains: searchTerm, mode: "insensitive" } },
              ],
            },
            { id: { not: userId } },
          ],
        },
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
        take: limit,
      });

      // Check which users are already friends
      const friendIds = await this.prisma.friend
        .findMany({
          where: {
            userId,
            status: "accepted",
          },
          select: { friendId: true },
        })
        .then((friends) => friends.map((f) => f.friendId));

      const usersWithFriendStatus = users.map((user) => ({
        userId: user.id,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        pointsBalance: user.profile?.pointsBalance || 0,
        streak: user.profile?.streak || 0,
        isFriend: friendIds.includes(user.id),
      }));

      return {
        success: true,
        data: {
          users: usersWithFriendStatus,
          total: usersWithFriendStatus.length,
        },
      };
    } catch (error) {
      console.error("Error searching users:", error);
      throw new Error("Failed to search users");
    }
  }
}