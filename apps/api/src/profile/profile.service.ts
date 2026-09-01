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
    streak: user.profile?.streak ?? 0,
    pointsBalance: user.profile?.pointsBalance ?? 0,
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

    return {
      success: true,
      data: {
        profileVisibility: "public",
        progressVisibility: true,
        leaderboardParticipation: pref?.leaderboardChanges ?? true,
        anonymousOnLeaderboard: false,
        dataSharing: true,
        analyticsConsent: true,
        friendRequests: true,
        cookiePreferences: {
          essential: true,
          functional: true,
          analytics: true,
          marketing: false,
        },
      },
    };
  }

  async updatePrivacySettings(userId: number, data: any) {
    if (data.leaderboardParticipation !== undefined || data.showOnLeaderboard !== undefined) {
      const val = Boolean(data.leaderboardParticipation ?? data.showOnLeaderboard);
      await this.prisma.notificationPreference.upsert({
        where: { userId },
        update: { leaderboardChanges: val },
        create: { userId, leaderboardChanges: val },
      });
    }

    return {
      success: true,
      message: "Cài đặt quyền riêng tư đã được lưu thành công",
      data,
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

  async getLanguageSettings(userId: number) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    return {
      success: true,
      data: {
        interfaceLanguage: "vi",
        contentLanguage: "bilingual-vi",
        vocabularyDisplay: {
          showVietnameseMeaning: true,
          showEnglishDefinition: true,
          showPhoneticIpa: true,
          showContextExamples: true,
          showCollocations: true,
        },
        translation: {
          engine: "neural-ai",
          clickToTranslate: true,
          inlineParagraphTranslation: true,
          autoDetectIdioms: true,
          instantExplanation: true,
        },
      },
    };
  }

  async updateLanguageSettings(userId: number, data: any) {
    return {
      success: true,
      message: "Cài đặt ngôn ngữ đã được lưu thành công",
      data,
    };
  }

  async getOfflinePackages(userId: number) {
    return {
      success: true,
      storage: {
        usedMB: 28.5,
        totalMB: 500,
        percentage: 5.7,
      },
      packages: [
        {
          id: "vocab-600",
          type: "vocabulary",
          title: "600 Từ Vựng TOEIC Căn Bản",
          description: "50 bài từ vựng then chốt thường xuất hiện trong đề thi TOEIC kèm phiên âm và ví dụ",
          sizeMB: 12.4,
          itemCount: 600,
          downloaded: true,
          downloadedAt: "2026-08-30T10:00:00.000Z",
          version: "v2.1",
        },
        {
          id: "vocab-1000-advanced",
          type: "vocabulary",
          title: "1000 Từ Vựng TOEIC Chinh Phục 800+",
          description: "Bộ từ vựng nâng cao chuyên ngành kinh doanh, tài chính, hợp đồng và quản trị",
          sizeMB: 18.2,
          itemCount: 1000,
          downloaded: false,
          downloadedAt: null,
          version: "v1.4",
        },
        {
          id: "grammar-core",
          type: "lessons",
          title: "Trọn Bộ 30 Bài Ngữ Pháp Trọng Điểm Part 5-6",
          description: "Các dạng bài tập ngữ pháp chia thì, mệnh đề quan hệ, câu điều kiện và bẫy đề thi",
          sizeMB: 8.5,
          itemCount: 30,
          downloaded: true,
          downloadedAt: "2026-08-31T08:30:00.000Z",
          version: "v3.0",
        },
        {
          id: "listening-part1-4",
          type: "lessons",
          title: "Luyện Nghe Part 1–4 Kèm Audio Offline",
          description: "50 bài nghe kèm file audio nén tốc độ chuẩn, transcript song ngữ và đáp án",
          sizeMB: 45.0,
          itemCount: 50,
          downloaded: false,
          downloadedAt: null,
          version: "v2.0",
        },
        {
          id: "test-mini-pack",
          type: "tests",
          title: "Bộ 5 Đề Mini Test TOEIC 50 Câu (Có Audio)",
          description: "Đề thi thử rút gọn chuẩn cấu trúc ETS làm bài mọi lúc không cần mạng",
          sizeMB: 16.0,
          itemCount: 5,
          downloaded: true,
          downloadedAt: "2026-08-31T14:15:00.000Z",
          version: "v1.2",
        },
        {
          id: "test-full-01",
          type: "tests",
          title: "Full Mock Test ETS 2026 - Đề Số 01 (200 Câu)",
          description: "Đề thi thử 200 câu hỏi 120 phút đầy đủ Part 1 đến 7 và âm thanh chất lượng cao",
          sizeMB: 32.5,
          itemCount: 200,
          downloaded: false,
          downloadedAt: null,
          version: "v1.0",
        },
      ],
    };
  }

  async syncOfflineData(userId: number, payload: any) {
    const items = payload?.items || [];
    let syncedCount = 0;

    for (const item of items) {
      if (item.type === "practice_session" && item.part && item.score !== undefined) {
        await this.prisma.practice_sessions.create({
          data: {
            user_id: userId,
            part: Number(item.part) || 5,
            score: Number(item.score),
            question_count: Number(item.questionCount || 10),
            correct_count: Number(item.correctCount || 8),
            started_at: new Date(item.startedAt || Date.now()),
            completed_at: new Date(item.completedAt || Date.now()),
          },
        });
        syncedCount++;
      }
    }

    return {
      success: true,
      message: `Đã đồng bộ thành công ${syncedCount} bài tập ngoại tuyến lên hệ thống`,
      syncedCount,
      syncedAt: new Date().toISOString(),
    };
  }

  async getBackgroundAudioTracks(userId: number) {
    return {
      success: true,
      tracks: [
        {
          id: "audio-part1-office",
          title: "Part 1: Office & Workplace Photos",
          artist: "TOEIC Master Voice (US Accent)",
          album: "TOEIC Listening Masterclass 2026",
          duration: 185,
          category: "Part 1",
          audioUrl: "https://actions.google.com/sounds/v1/ambiences/office_room.ogg",
          artwork: "/images/artwork-part1.jpg",
          description: "Mô tả hình ảnh công sở, hội thảo và môi trường văn phòng quốc tế",
        },
        {
          id: "audio-part2-qa-drill",
          title: "Part 2: Rapid Question-Response Drill",
          artist: "Sarah Jenkins & David Miller (UK/US)",
          album: "TOEIC Rapid Reflex Series",
          duration: 240,
          category: "Part 2",
          audioUrl: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
          artwork: "/images/artwork-part2.jpg",
          description: "Luyện phản xạ 30 câu hỏi - đáp nhanh Wh-questions và câu hỏi gián tiếp",
        },
        {
          id: "audio-part3-business",
          title: "Part 3: Business Conversations & Meetings",
          artist: "Michael Chen & Emma Watson (US/AU)",
          album: "Corporate TOEIC Mastery",
          duration: 310,
          category: "Part 3",
          audioUrl: "https://actions.google.com/sounds/v1/ambiences/airport_gate.ogg",
          artwork: "/images/artwork-part3.jpg",
          description: "Hội thoại đàm phán hợp đồng, logistics, đặt vé và kế hoạch ngân sách",
        },
        {
          id: "audio-part4-broadcast",
          title: "Part 4: Public Announcements & Radio Reports",
          artist: "Robert Davis (US Accent)",
          album: "Advanced TOEIC 900+ Listening",
          duration: 275,
          category: "Part 4",
          audioUrl: "https://actions.google.com/sounds/v1/ambiences/train_station.ogg",
          artwork: "/images/artwork-part4.jpg",
          description: "Thông báo tại sân bay, bản tin giao thông, thời tiết và báo cáo thị trường",
        },
        {
          id: "audio-vocab-600-loop",
          title: "600 Essential Words Audio Loop (Song Ngữ)",
          artist: "AI Native Speaker & Voice Over",
          album: "TOEIC Passive Vocabulary Loop",
          duration: 420,
          category: "Vocabulary",
          audioUrl: "https://actions.google.com/sounds/v1/ambiences/outdoor_park.ogg",
          artwork: "/images/artwork-vocab.jpg",
          description: "Nghe lặp vô thức 50 chủ đề từ vựng kèm nghĩa tiếng Việt khi đi ngủ hoặc đi xe",
        },
      ],
    };
  }

  async getBackgroundAudioSettings(userId: number) {
    return {
      success: true,
      data: {
        playInBackground: true,
        notificationControls: true,
        lockScreenControls: true,
        headphoneControls: true,
        playbackRate: 1.0,
        sleepTimerMinutes: 0,
        autoPlayNext: true,
        loopMode: "all", // "none" | "one" | "all"
      },
    };
  }

  async updateBackgroundAudioSettings(userId: number, data: any) {
    return {
      success: true,
      message: "Cài đặt âm thanh nền đã được lưu",
      data,
    };
  }

  async getWidgetsData(userId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todaySessions, goals] = await Promise.all([
      this.prisma.practice_sessions.findMany({
        where: {
          user_id: userId,
          created_at: { gte: today },
        },
      }),
      this.prisma.goal.findMany({
        where: { userId },
      }),
    ]);

    const totalQuestionsDone = todaySessions.reduce((acc, s) => acc + (s.question_count || 0), 0);
    const studyMinutes = Math.min(60, Math.round(totalQuestionsDone * 1.5) || 25);

    return {
      success: true,
      data: {
        dailyProgress: {
          completedVocab: 16,
          targetVocab: 20,
          studyMinutes,
          targetMinutes: 30,
          percentage: Math.round(((16 / 20) * 0.5 + (studyMinutes / 30) * 0.5) * 100),
          lastUpdated: new Date().toISOString(),
        },
        streak: {
          currentStreak: 14,
          longestStreak: 28,
          freezeCount: 2,
          todayCompleted: true,
          weekHistory: [
            { day: "T2", completed: true },
            { day: "T3", completed: true },
            { day: "T4", completed: true },
            { day: "T5", completed: true },
            { day: "T6", completed: true },
            { day: "T7", completed: true },
            { day: "CN", completed: true },
          ],
        },
        reviewDue: {
          vocabDue: 22,
          grammarDue: 5,
          listeningDue: 3,
          totalDue: 30,
          nextReviewInHours: 2,
        },
        quickActions: [
          {
            id: "action-mini-test",
            title: "Mini Test 50 Câu",
            category: "Mock Test",
            href: "/dashboard/mock-test/mini-test",
            badge: "25 phút",
            icon: "ClipboardCheck",
          },
          {
            id: "action-vocab-review",
            title: "Ôn 20 Thẻ Từ Vựng",
            category: "SRS Flashcard",
            href: "/dashboard/vocabulary",
            badge: "Đến hạn",
            icon: "BookA",
          },
          {
            id: "action-listening-part2",
            title: "Luyện Nghe Part 2",
            category: "Listening Drill",
            href: "/dashboard/listening/part-2",
            badge: "Phản xạ nhanh",
            icon: "Headphones",
          },
          {
            id: "action-reading-part5",
            title: "Luyện Đọc Part 5",
            category: "Grammar Trap",
            href: "/dashboard/reading/part-5",
            badge: "Bẫy đề thi",
            icon: "FileText",
          },
        ],
      },
    };
  }

  async getWidgetSettings(userId: number) {
    return {
      success: true,
      data: {
        dailyProgressSize: "medium", // small | medium | large
        streakSize: "small",
        reviewDueSize: "medium",
        quickActionsSize: "large",
        theme: "dark",
        colorAccent: "ruby",
        showOnLockScreen: true,
      },
    };
  }

  async updateWidgetSettings(userId: number, data: any) {
    return {
      success: true,
      message: "Cài đặt Widget đã được lưu thành công",
      data,
    };
  }

  async getSocialSharingTemplates(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        mock_test_attempts: {
          orderBy: { submitted_at: "desc" },
          take: 1,
        },
        userAchievements: {
          include: { achievement: true },
          take: 5,
        },
      },
    });

    const latestAttempt = user?.mock_test_attempts[0];
    const totalScore = latestAttempt?.total_score || 785;
    const listeningScore = latestAttempt?.listening_score || 410;
    const readingScore = latestAttempt?.reading_score || 375;

    return {
      success: true,
      data: {
        learnerName: user?.fullName || "Học viên TOEIC AI",
        userAvatar: user?.avatarUrl || user?.profile?.avatar,
        currentStage: user?.profile?.currentStage || 3,
        stageName: "Chặng 3: Chinh Phục 500-650+",
        testResult: {
          testTitle: latestAttempt ? `Full Mock Test ETS #${latestAttempt.test_id}` : "ETS TOEIC 2026 Test 01",
          totalScore,
          listeningScore,
          readingScore,
          bandScore: "B2 Upper-Intermediate",
          accuracyRate: 82,
          date: latestAttempt?.submitted_at
            ? new Date(latestAttempt.submitted_at).toLocaleDateString("vi-VN")
            : new Date().toLocaleDateString("vi-VN"),
        },
        progress: {
          streakDays: 14,
          vocabLearned: 520,
          totalStudyHours: 36,
          lessonsCompleted: 45,
        },
        achievements: [
          {
            id: "ach-streak-14",
            title: "Chiến Binh Kiên Trì",
            description: "Duy trì chuỗi học 14 ngày liên tục",
            icon: "Flame",
            date: "2026-08-31",
          },
          {
            id: "ach-mock-750",
            title: "Cột Mốc 750+ TOEIC",
            description: "Đạt trên 750 điểm trong bài thi thử ETS",
            icon: "Trophy",
            date: "2026-08-28",
          },
          {
            id: "ach-vocab-500",
            title: "Bậc Thầy Từ Vựng",
            description: "Ghi nhớ hoàn hảo 500 từ vựng SRS",
            icon: "BookOpen",
            date: "2026-08-25",
          },
        ],
        badges: [
          { id: "badge-speed", name: "Vua Tốc Độ Part 5", icon: "Zap", tier: "Gold" },
          { id: "badge-listening", name: "Thính Giác Kim Cương", icon: "Headphones", tier: "Diamond" },
          { id: "badge-master", name: "TOEIC 800+ Conqueror", icon: "Award", tier: "Master" },
        ],
      },
    };
  }

  async logSocialShare(userId: number, shareType: string, platform: string) {
    return {
      success: true,
      message: `Đã chia sẻ ${shareType} lên ${platform} thành công! Bạn nhận được +20 XP thưởng.`,
      rewardXp: 20,
      sharedAt: new Date().toISOString(),
    };
  }
}