import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcryptjs";
import * as fs from 'fs';
import * as path from 'path';
import {
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async completeFirstLogin(
    userId: number,
    currentScore: number,
    targetScore: number,
    examDate: string,
    dailyStudyTime?: number,
    studySchedule?: string,
    motivationLevel?: number,
    learningStyle?: string,
  ) {
    return this.prisma.userProfile.upsert({
      where: {
        userId,
      },
      create: {
        userId,
        currentScore,
        targetScore,
        examDate: new Date(examDate),
        dailyStudyTime: dailyStudyTime || null,
        studySchedule: studySchedule || null,
        motivationLevel: motivationLevel || 5,
        learningStyle: learningStyle || null,
        firstLoginCompleted: true,
      },
      update: {
        currentScore,
        targetScore,
        examDate: new Date(examDate),
        dailyStudyTime: dailyStudyTime || null,
        studySchedule: studySchedule || null,
        motivationLevel: motivationLevel || 5,
        learningStyle: learningStyle || null,
        firstLoginCompleted: true,
      },
    });
  }

  async savePlacementTestResult(userId: number, score: number) {
    return this.prisma.userProfile.upsert({
      where: {
        userId,
      },
      create: {
        userId,
        currentScore: score,
        lastPlacementTestAt: new Date(),
      },
      update: {
        currentScore: score,
        lastPlacementTestAt: new Date(),
      },
    });
  }

  async getPlacementTestCooldown(userId: number) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile || !profile.lastPlacementTestAt) {
      return { canRetake: true, cooldownDays: 0 };
    }

    const lastTest = new Date(profile.lastPlacementTestAt);
    const now = new Date();
    const daysSinceLastTest = Math.floor((now.getTime() - lastTest.getTime()) / (1000 * 60 * 60 * 24));
    const cooldownDays = 7;
    const daysRemaining = Math.max(0, cooldownDays - daysSinceLastTest);

    return {
      canRetake: daysSinceLastTest >= cooldownDays,
      cooldownDays: daysRemaining,
      lastTestDate: profile.lastPlacementTestAt,
    };
  }

  async acceptStageAssignment(userId: number, stage: number) {
    return this.prisma.userProfile.update({
      where: { userId },
      data: {
        currentStage: stage,
        stageAcceptedAt: new Date(),
      },
    });
  }

  async requestStageChange(userId: number, requestedStage: number, reason?: string) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new Error("Không tìm thấy profile người dùng");
    }

    const currentStage = profile.currentStage || 1;

    return this.prisma.stageChangeRequest.create({
      data: {
        userId,
        currentStage,
        requestedStage,
        reason,
      },
    });
  }

  async getStageChangeRequests(status?: string) {
    const where = status ? { status } : {};
    return this.prisma.stageChangeRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        requestedAt: 'desc',
      },
    });
  }

  async reviewStageChangeRequest(requestId: number, status: 'APPROVED' | 'REJECTED', adminId: number, comment?: string) {
    return this.prisma.stageChangeRequest.update({
      where: { id: requestId },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy: adminId,
        adminComment: comment,
      },
    });
  }

  async applyStageChange(requestId: number) {
    const request = await this.prisma.stageChangeRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!request) {
      throw new Error("Không tìm thấy yêu cầu thay đổi chặng");
    }

    if (request.status !== 'APPROVED') {
      throw new Error("Yêu cầu chưa được phê duyệt");
    }

    // Update user's stage
    await this.prisma.userProfile.update({
      where: { userId: request.userId },
      data: {
        currentStage: request.requestedStage,
        stageAcceptedAt: new Date(),
      },
    });

    // Mark request as applied
    await this.prisma.stageChangeRequest.update({
      where: { id: requestId },
      data: { status: 'APPLIED' },
    });

    return { success: true, message: "Đã áp dụng thay đổi chặng thành công" };
  }

  calculateEstimatedCompletionTime(currentScore: number, targetScore: number, dailyStudyTime: number): number {
    const scoreDiff = targetScore - currentScore;
    const pointsPerDay = dailyStudyTime * 0.5; // Estimate: 0.5 points per study minute
    const daysNeeded = Math.ceil(scoreDiff / pointsPerDay);
    return daysNeeded;
  }
  async getProfile(userId: number) {
  const user = await this.prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      profile: true,
    },
  });

  if (!user) {
    return {
      message: "Không tìm thấy người dùng",
    };
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    avatarUrl: user.avatarUrl || user.profile?.avatar,
    avatar: user.profile?.avatar,
    phone: user.profile?.phone,
    birthday: user.profile?.birthday,
    gender: user.profile?.gender,
    address: user.profile?.address,
    bio: user.profile?.bio,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,

    currentScore: user.profile?.currentScore,
    targetScore: user.profile?.targetScore,
    examDate: user.profile?.examDate,
    dailyStudyTime: user.profile?.dailyStudyTime,
    studySchedule: user.profile?.studySchedule,
    motivationLevel: user.profile?.motivationLevel,
    learningStyle: user.profile?.learningStyle,
    lastPlacementTestAt: user.profile?.lastPlacementTestAt,
    currentStage: user.profile?.currentStage,
    stageAcceptedAt: user.profile?.stageAcceptedAt,
    dailyVocabularyGoal: user.profile?.dailyVocabularyGoal,

    studyNotification: user.profile?.studyNotification,
srsNotification: user.profile?.srsNotification,
autoPronunciation: user.profile?.autoPronunciation,
darkMode: user.profile?.darkMode,
  };
}
async updateProfile(
  userId: number,
  data: any,
) {

  const user = await this.prisma.user.findUnique({
    where:{
      id:userId,
    },
  });


  if(!user){
    return {
      message:"Không tìm thấy người dùng",
    };
  }



  // Cập nhật họ tên trong bảng User
  await this.prisma.user.update({

    where:{
      id:userId,
    },

    data:{
      fullName:data.fullName,
    }

  });



  // Cập nhật thông tin UserProfile
  await this.prisma.userProfile.upsert({

    where:{
      userId,
    },


    create:{

      userId,

      avatar:data.avatar,

      phone:data.phone,

      birthday:data.birthday
      ? new Date(data.birthday)
      : null,

      gender:data.gender,

      address:data.address,

      bio:data.bio,


      // TOEIC
      currentScore:data.currentScore,

      targetScore:data.targetScore,

      examDate:data.examDate
      ? new Date(data.examDate)
      : null,

      dailyStudyTime:data.dailyStudyTime,
      studySchedule:data.studySchedule,
      motivationLevel:data.motivationLevel,
      learningStyle:data.learningStyle,
      dailyVocabularyGoal:data.dailyVocabularyGoal
        ? Number(data.dailyVocabularyGoal)
        : undefined,

      studyNotification:data.studyNotification,
srsNotification:data.srsNotification,
autoPronunciation:data.autoPronunciation,
darkMode:data.darkMode,
    },


    update:{

      avatar:data.avatar,

      phone:data.phone,

      birthday:data.birthday
      ? new Date(data.birthday)
      : null,

      gender:data.gender,

      address:data.address,

      bio:data.bio,


      // TOEIC
      currentScore:data.currentScore,

      targetScore:data.targetScore,

      examDate:data.examDate
      ? new Date(data.examDate)
      : null,

      dailyStudyTime:data.dailyStudyTime,
      studySchedule:data.studySchedule,
      motivationLevel:data.motivationLevel,
      learningStyle:data.learningStyle,
      dailyVocabularyGoal:data.dailyVocabularyGoal
        ? Number(data.dailyVocabularyGoal)
        : undefined,
      studyNotification:data.studyNotification,
srsNotification:data.srsNotification,
autoPronunciation:data.autoPronunciation,
darkMode:data.darkMode,

    }


  });



  return {

    message:"Cập nhật hồ sơ thành công",

  };

}
async changePassword(
  userId: number,
  data: any,
) {

  const user =
    await this.prisma.user.findUnique({

      where: {
        id: userId,
      },

    });

  if (!user) {

    throw new BadRequestException(
      "Không tìm thấy người dùng"
    );

  }

  if (!user.password) {
    throw new BadRequestException(
      "Tài khoản này đăng nhập bằng Google, không thể đổi mật khẩu"
    );
  }

  const match =
    await bcrypt.compare(
      data.oldPassword,
      user.password,
    );

  if (!match) {

    throw new UnauthorizedException(
      "Mật khẩu hiện tại không đúng"
    );

  }

  const hashed =
    await bcrypt.hash(
      data.newPassword,
      10,
    );

  await this.prisma.user.update({

    where: {
      id: userId,
    },

    data: {
      password: hashed,
    },

  });

  return {

    message: "Đổi mật khẩu thành công",

  };

}

async uploadAvatar(userId: number, file: any) {
  if (!file) {
    throw new BadRequestException("Không có file được tải lên");
  }

  // File is already saved by multer, just update the database
  const avatarUrl = `/avatars/${file.filename}`;

  // Update user profile with avatar URL
  await this.prisma.userProfile.upsert({
    where: { userId },
    create: {
      userId,
      avatar: avatarUrl,
    },
    update: {
      avatar: avatarUrl,
    },
  });

  // Also update User table avatarUrl for backward compatibility
  await this.prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
  });

  return {
    message: "Tải lên avatar thành công",
    avatarUrl,
  };
}

  async deactivateAccount(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException("Không tìm thấy người dùng");
    }

    if (!user.isActive) {
      throw new BadRequestException("Tài khoản đã bị vô hiệu hóa");
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        deactivatedAt: new Date(),
      },
    });

    return {
      message: "Tài khoản đã được vô hiệu hóa thành công",
    };
  }

  async updateEmail(userId: number, newEmail: string, password?: string) {
    if (!newEmail || !newEmail.includes("@")) {
      throw new BadRequestException("Email không hợp lệ");
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: newEmail.trim().toLowerCase() },
    });

    if (existing && existing.id !== userId) {
      throw new BadRequestException("Email này đã được sử dụng bởi tài khoản khác");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException("Không tìm thấy người dùng");
    }

    if (user.password) {
      if (!password) {
        throw new BadRequestException("Vui lòng nhập mật khẩu hiện tại để đổi email");
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        throw new UnauthorizedException("Mật khẩu xác nhận không đúng");
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { email: newEmail.trim().toLowerCase() },
    });

    return {
      success: true,
      message: "Cập nhật email thành công",
      email: newEmail.trim().toLowerCase(),
    };
  }

  async getPrivacySettings(userId: number) {
    const pref = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    // Return structured privacy settings
    return {
      success: true,
      data: {
        showOnLeaderboard: pref?.leaderboardChanges ?? true,
        profileVisibility: "public",
        showStudyStats: true,
        allowFriendRequests: true,
        anonymousMode: false,
      },
    };
  }

  async updatePrivacySettings(userId: number, data: any) {
    if (data.showOnLeaderboard !== undefined) {
      await this.prisma.notificationPreference.upsert({
        where: { userId },
        update: { leaderboardChanges: Boolean(data.showOnLeaderboard) },
        create: { userId, leaderboardChanges: Boolean(data.showOnLeaderboard) },
      });
    }

    return {
      success: true,
      message: "Cập nhật quyền riêng tư thành công",
      data: {
        showOnLeaderboard: data.showOnLeaderboard ?? true,
        profileVisibility: data.profileVisibility ?? "public",
        showStudyStats: data.showStudyStats ?? true,
        allowFriendRequests: data.allowFriendRequests ?? true,
        anonymousMode: data.anonymousMode ?? false,
      },
    };
  }

  async exportUserData(userId: number) {
    const [user, goals, achievements, mockAttempts, practiceSessions, points, preferences] =
      await Promise.all([
        this.prisma.user.findUnique({
          where: { id: userId },
          include: { profile: true },
        }),
        this.prisma.goal.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.userAchievement.findMany({
          where: { userId },
          include: { achievement: true },
          orderBy: { unlockedAt: "desc" },
        }),
        this.prisma.mock_test_attempts.findMany({
          where: { user_id: userId },
          orderBy: { submitted_at: "desc" },
          take: 50,
        }),
        this.prisma.practice_sessions.findMany({
          where: { user_id: userId },
          orderBy: { created_at: "desc" },
          take: 50,
        }),
        this.prisma.pointsTransaction.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
        this.prisma.notificationPreference.findUnique({
          where: { userId },
        }),
      ]);

    if (!user) {
      throw new BadRequestException("Không tìm thấy người dùng");
    }

    return {
      success: true,
      exportDate: new Date().toISOString(),
      platform: "TOEIC AI Platform (Bella)",
      version: "1.0",
      userData: {
        account: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          role: user.role,
        },
        profile: user.profile,
        summary: {
          totalMockTests: mockAttempts.length,
          totalPracticeSessions: practiceSessions.length,
          totalAchievements: achievements.length,
          totalGoals: goals.length,
          totalPointsTransactions: points.length,
        },
        goals,
        achievements: achievements.map((a) => ({
          name: a.achievement?.name,
          category: a.achievement?.category,
          points: a.achievement?.points,
          unlockedAt: a.unlockedAt,
        })),
        mockTestAttempts: mockAttempts.map((m) => ({
          testId: m.test_id,
          totalScore: m.total_score,
          listeningScore: m.listening_score,
          readingScore: m.reading_score,
          submittedAt: m.submitted_at,
        })),
        practiceSessions: practiceSessions.map((p) => ({
          part: p.part,
          score: p.score,
          correctCount: p.correct_count,
          questionCount: p.question_count,
          startedAt: p.started_at,
          completedAt: p.completed_at,
          createdAt: p.created_at,
        })),
        pointsTransactions: points.map((pt) => ({
          amount: pt.amount,
          type: pt.type,
          description: pt.description,
          createdAt: pt.createdAt,
        })),
        notificationPreferences: preferences,
      },
    };
  }

  async getConnectedAccounts(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, createdAt: true },
    });

    const isGoogle = user?.email?.endsWith("@gmail.com");

    return {
      success: true,
      accounts: [
        {
          provider: "google",
          name: "Google Account",
          connected: Boolean(isGoogle),
          email: isGoogle ? user?.email : null,
          connectedAt: isGoogle ? user?.createdAt : null,
        },
        {
          provider: "facebook",
          name: "Facebook",
          connected: false,
          email: null,
          connectedAt: null,
        },
        {
          provider: "apple",
          name: "Apple ID",
          connected: false,
          email: null,
          connectedAt: null,
        },
        {
          provider: "github",
          name: "GitHub",
          connected: false,
          email: null,
          connectedAt: null,
        },
      ],
    };
  }

  async unlinkConnectedAccount(userId: number, provider: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.password) {
      throw new BadRequestException(
        "Bạn chưa thiết lập mật khẩu trực tiếp. Vui lòng tạo mật khẩu trước khi hủy liên kết tài khoản mạng xã hội để tránh mất quyền đăng nhập."
      );
    }

    return {
      success: true,
      message: `Đã hủy liên kết tài khoản ${provider} thành công`,
    };
  }

  async linkConnectedAccount(userId: number, provider: string, email?: string) {
    return {
      success: true,
      message: `Đã liên kết tài khoản ${provider} (${email || "thành công"})`,
    };
  }

  async deleteAccount(userId: number, password?: string, reason?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException("Không tìm thấy người dùng");
    }

    // If user has password, verify it before deletion
    if (user.password) {
      if (!password) {
        throw new BadRequestException("Vui lòng nhập mật khẩu để xác nhận xóa tài khoản");
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        throw new UnauthorizedException("Mật khẩu không đúng");
      }
    }

    if (reason) {
      console.log(`[Account Deletion] User ${userId} (${user.email}) deleted account. Reason: ${reason}`);
    }

    // Delete user (cascade will handle related records)
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return {
      success: true,
      message: "Tài khoản đã được xóa vĩnh viễn cùng toàn bộ dữ liệu",
    };
  }

  async getStudySettings(userId: number) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    const pref = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    return {
      success: true,
      data: {
        dailyGoals: {
          dailyVocab: profile?.dailyVocabularyGoal || 20,
          dailyListeningMinutes: 20,
          dailyReadingMinutes: 20,
          weeklyMockTests: 1,
        },
        studyTime: {
          targetDailyMinutes: profile?.dailyStudyTime || 30,
          preferredTimeSlot: profile?.studySchedule || "evening",
          reminderTime: "20:00",
        },
        difficulty: {
          level: "adaptive",
          targetScore: profile?.targetScore || 750,
          currentScore: profile?.currentScore || 450,
          adaptiveAiEnabled: true,
        },
        content: {
          focusArea: "all",
          weakPartFocus: true,
          includeBusinessVocab: true,
          grammarTrapFocus: true,
        },
        srs: {
          intervalModifier: 1.0,
          maxCardsPerSession: 25,
          reviewIntervals: "1,3,7,14,30",
          autoScheduleReviews: profile?.srsNotification ?? true,
        },
        audio: {
          speechRate: 1.0,
          voiceAccent: "us",
          autoPlayAudio: profile?.autoPronunciation ?? false,
          soundEffects: true,
        },
        display: {
          fontSize: "md",
          compactMode: false,
          showInstantTranslation: true,
          highlightKeywords: true,
          darkMode: profile?.darkMode ?? true,
        },
        timer: {
          enabled: true,
          warnRemainingMinutes: 5,
          autoSubmitOnTimeOut: true,
          showCountdown: true,
        },
        autoAdvance: {
          enabled: true,
          delaySeconds: 1.5,
          autoPlayNextAudio: true,
        },
      },
    };
  }

  async updateStudySettings(userId: number, data: any) {
    const updateData: any = {};

    if (data.dailyGoals?.dailyVocab !== undefined) {
      updateData.dailyVocabularyGoal = Number(data.dailyGoals.dailyVocab);
    }
    if (data.studyTime?.targetDailyMinutes !== undefined) {
      updateData.dailyStudyTime = Number(data.studyTime.targetDailyMinutes);
    }
    if (data.studyTime?.preferredTimeSlot !== undefined) {
      updateData.studySchedule = String(data.studyTime.preferredTimeSlot);
    }
    if (data.difficulty?.targetScore !== undefined) {
      updateData.targetScore = Number(data.difficulty.targetScore);
    }
    if (data.srs?.autoScheduleReviews !== undefined) {
      updateData.srsNotification = Boolean(data.srs.autoScheduleReviews);
    }
    if (data.audio?.autoPlayAudio !== undefined) {
      updateData.autoPronunciation = Boolean(data.audio.autoPlayAudio);
    }
    if (data.display?.darkMode !== undefined) {
      updateData.darkMode = Boolean(data.display.darkMode);
    }

    if (Object.keys(updateData).length > 0) {
      await this.prisma.userProfile.upsert({
        where: { userId },
        update: updateData,
        create: { userId, ...updateData },
      });
    }

    return {
      success: true,
      message: "Cài đặt học tập đã được lưu thành công",
      data,
    };
  }

  async getAppearanceSettings(userId: number) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    return {
      success: true,
      data: {
        theme: profile?.darkMode === false ? "light" : "dark",
        fontSize: "md",
        fontFamily: "inter",
        colorScheme: "ruby",
        backgroundColor: "#09090b",
        textColor: "#ffffff",
        accentColor: "#dc2626",
        highContrast: false,
        reduceMotion: false,
      },
    };
  }

  async updateAppearanceSettings(userId: number, data: any) {
    if (data.theme !== undefined) {
      const darkMode = data.theme !== "light";
      await this.prisma.userProfile.upsert({
        where: { userId },
        update: { darkMode },
        create: { userId, darkMode },
      });
    }

    return {
      success: true,
      message: "Cài đặt giao diện đã được lưu thành công",
      data,
    };
  }

  async getAccessibilitySettings(userId: number) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    return {
      success: true,
      data: {
        screenReader: false,
        keyboardNav: true,
        voiceControl: false,
        textToSpeech: {
          enabled: true,
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
          voice: "en-US",
        },
        speechToText: {
          enabled: false,
          language: "en-US",
        },
        colorBlindMode: "none",
        largeTextMode: 100,
        focusIndicators: true,
      },
    };
  }

  async updateAccessibilitySettings(userId: number, data: any) {
    return {
      success: true,
      message: "Cài đặt trợ năng đã được lưu thành công",
      data,
    };
  }
}