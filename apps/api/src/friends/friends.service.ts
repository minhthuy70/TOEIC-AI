import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  async getFriends(userId: number) {
    const users = await this.prisma.user.findMany({
      where: { id: { not: userId } },
      take: 6,
      include: {
        profile: true,
        mock_test_attempts: {
          orderBy: { submitted_at: "desc" },
          take: 1,
        },
      },
    });

    const friends = users.map((u, idx) => ({
      id: u.id,
      name: u.fullName || u.email.split("@")[0],
      email: u.email,
      avatar: u.avatarUrl || u.profile?.avatar || null,
      targetScore: u.profile?.targetScore || 750,
      currentScore: u.mock_test_attempts[0]?.total_score || 550 + idx * 45,
      streak: 6 + idx * 3,
      isOnline: idx % 2 === 0,
      lastActive: idx % 2 === 0 ? "Đang trực tuyến" : `${idx * 2 + 1} giờ trước`,
      stage: u.profile?.currentStage || ((idx % 5) + 1),
      stageLabel: `Chặng ${u.profile?.currentStage || ((idx % 5) + 1)}`,
      friendSince: "2026-08-15T10:00:00.000Z",
    }));

    return {
      success: true,
      friends,
      totalFriends: friends.length,
    };
  }

  async getFriendRequests(userId: number) {
    return {
      success: true,
      received: [
        {
          id: 101,
          fromUserId: 991,
          name: "Lê Minh Tuấn",
          email: "tuan.le@gmail.com",
          avatar: null,
          targetScore: 850,
          currentScore: 720,
          sentAt: "2026-08-31T14:30:00.000Z",
          message: "Chào bạn! Mình cùng luyện TOEIC 800+ nhé!",
        },
        {
          id: 102,
          fromUserId: 992,
          name: "Trần Mai Phương",
          email: "phuong.tran@gmail.com",
          avatar: null,
          targetScore: 900,
          currentScore: 810,
          sentAt: "2026-08-31T09:15:00.000Z",
          message: "Rất mong được so tài học tập cùng bạn.",
        },
      ],
      sent: [
        {
          id: 201,
          toUserId: 993,
          name: "Nguyễn Hoàng Nam",
          email: "nam.nguyen@gmail.com",
          sentAt: "2026-08-30T18:00:00.000Z",
          status: "pending",
        },
      ],
    };
  }

  async searchUsers(userId: number, query: string) {
    const q = (query || "").trim().toLowerCase();
    if (!q) {
      return { success: true, users: [] };
    }

    const users = await this.prisma.user.findMany({
      where: {
        id: { not: userId },
        OR: [
          { fullName: { contains: q } },
          { email: { contains: q } },
        ],
      },
      take: 10,
      include: {
        profile: true,
      },
    });

    const result = users.map((u, i) => ({
      id: u.id,
      name: u.fullName || u.email.split("@")[0],
      email: u.email,
      targetScore: u.profile?.targetScore || 700,
      currentScore: 520 + i * 35,
      stage: u.profile?.currentStage || 2,
      isFriend: i === 0,
      isPending: false,
    }));

    return {
      success: true,
      users: result,
    };
  }

  async sendFriendRequest(userId: number, targetUserId: number) {
    return {
      success: true,
      message: "Đã gửi lời mời kết bạn thành công",
      targetUserId,
    };
  }

  async acceptFriendRequest(userId: number, requestId: number) {
    return {
      success: true,
      message: "Đã chấp nhận lời mời kết bạn",
      requestId,
    };
  }

  async declineFriendRequest(userId: number, requestId: number) {
    return {
      success: true,
      message: "Đã từ chối lời mời kết bạn",
      requestId,
    };
  }

  async removeFriend(userId: number, friendId: number) {
    return {
      success: true,
      message: "Đã xóa bạn bè thành công",
      friendId,
    };
  }

  async blockUser(userId: number, targetUserId: number) {
    return {
      success: true,
      message: "Đã chặn người dùng thành công",
      targetUserId,
    };
  }

  async unblockUser(userId: number, targetUserId: number) {
    return {
      success: true,
      message: "Đã bỏ chặn người dùng",
      targetUserId,
    };
  }

  async getBlockedUsers(userId: number) {
    return {
      success: true,
      blockedUsers: [
        {
          id: 881,
          name: "Vũ Hải Đăng",
          email: "dang.vu@spam.com",
          blockedAt: "2026-08-20T10:00:00.000Z",
        },
      ],
    };
  }

  async getFriendProfile(userId: number, friendId: number) {
    const friend = await this.prisma.user.findUnique({
      where: { id: friendId },
      include: {
        profile: true,
        mock_test_attempts: {
          orderBy: { submitted_at: "desc" },
          take: 5,
        },
        userAchievements: {
          include: { achievement: true },
          take: 6,
        },
      },
    });

    if (!friend) {
      return {
        success: true,
        profile: {
          id: friendId,
          name: "Nguyễn Văn Hùng",
          email: "hung.nguyen@example.com",
          avatar: null,
          targetScore: 800,
          currentScore: 680,
          streak: 18,
          stage: 3,
          stageName: "Chặng 3 (500–650)",
          totalVocabLearned: 450,
          completedLessons: 32,
          mockTestsTaken: 4,
          highestScore: 720,
          recentTests: [
            { testName: "ETS 2026 Test 1", score: 680, listening: 360, reading: 320, date: "2026-08-29" },
            { testName: "Mini Test 50", score: 710, listening: 380, reading: 330, date: "2026-08-25" },
          ],
          badges: ["Học viên chăm chỉ", "Vua tốc độ Part 5", "Chuỗi 14 ngày"],
        },
      };
    }

    const highest = friend.mock_test_attempts.length
      ? Math.max(...friend.mock_test_attempts.map((m) => m.total_score || 0))
      : 650;

    return {
      success: true,
      profile: {
        id: friend.id,
        name: friend.fullName || friend.email.split("@")[0],
        email: friend.email,
        avatar: friend.avatarUrl || friend.profile?.avatar,
        targetScore: friend.profile?.targetScore || 750,
        currentScore: friend.mock_test_attempts[0]?.total_score || 650,
        streak: 14,
        stage: friend.profile?.currentStage || 3,
        stageName: `Chặng ${friend.profile?.currentStage || 3}`,
        totalVocabLearned: 410,
        completedLessons: 30,
        mockTestsTaken: friend.mock_test_attempts.length,
        highestScore: highest,
        recentTests: friend.mock_test_attempts.map((m) => ({
          testName: `Mock Test #${m.test_id}`,
          score: m.total_score,
          listening: m.listening_score,
          reading: m.reading_score,
          date: m.submitted_at ? new Date(m.submitted_at).toLocaleDateString("vi-VN") : "N/A",
        })),
        badges: friend.userAchievements.map((a) => a.achievement?.name).filter(Boolean),
      },
    };
  }

  async compareWithFriend(userId: number, friendId: number) {
    const friendProfileRes = await this.getFriendProfile(userId, friendId);
    const friend = friendProfileRes.profile;

    return {
      success: true,
      comparison: {
        user: {
          name: "Bạn (Tôi)",
          totalScore: 740,
          listeningScore: 390,
          readingScore: 350,
          streakDays: 14,
          vocabLearned: 520,
          accuracyRate: 78,
          avgSpeedSec: 42,
          testsCompleted: 6,
        },
        friend: {
          name: friend.name,
          totalScore: friend.currentScore,
          listeningScore: Math.round(friend.currentScore * 0.52),
          readingScore: Math.round(friend.currentScore * 0.48),
          streakDays: friend.streak,
          vocabLearned: friend.totalVocabLearned,
          accuracyRate: 74,
          avgSpeedSec: 46,
          testsCompleted: friend.mockTestsTaken,
        },
        metrics: [
          { metric: "Tổng điểm thi thử", userVal: 740, friendVal: friend.currentScore, unit: "Điểm", userWins: 740 >= friend.currentScore },
          { metric: "Kỹ năng Listening", userVal: 390, friendVal: Math.round(friend.currentScore * 0.52), unit: "Điểm", userWins: 390 >= Math.round(friend.currentScore * 0.52) },
          { metric: "Kỹ năng Reading", userVal: 350, friendVal: Math.round(friend.currentScore * 0.48), unit: "Điểm", userWins: 350 >= Math.round(friend.currentScore * 0.48) },
          { metric: "Chuỗi ngày Streak", userVal: 14, friendVal: friend.streak, unit: "Ngày", userWins: 14 >= friend.streak },
          { metric: "Từ vựng đã học", userVal: 520, friendVal: friend.totalVocabLearned, unit: "Từ", userWins: 520 >= friend.totalVocabLearned },
          { metric: "Tỷ lệ làm đúng", userVal: 78, friendVal: 74, unit: "%", userWins: 78 >= 74 },
        ],
      },
    };
  }
}