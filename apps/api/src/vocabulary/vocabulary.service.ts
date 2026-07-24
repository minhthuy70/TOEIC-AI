import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LearnDto } from './dto/learn.dto';
import { ReviewDto } from './dto/review.dto';

@Injectable()
export class VocabularyService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async healthCheck() {
    const total = await this.prisma.vocabulary.count();

    return {
      success: true,
      totalWords: total,
    };
  }

  async learnWords(userId: number) {

    const profile = await this.prisma.userProfile.findUnique({
      where: {
        userId,
      },
    });

    if (!profile) {
      return {
        success: false,
        message: "Không tìm thấy người dùng",
      };
    }

    const score = profile.currentScore ?? 0;

    let currentStage = 1;

    if (score >= 800) currentStage = 5;
    else if (score >= 650) currentStage = 4;
    else if (score >= 500) currentStage = 3;
    else if (score >= 300) currentStage = 2;

    const reviewWords =
      await this.prisma.userVocabularyProgress.findMany({
        where: {
          userId,
          nextReview: {
            lte: new Date(),
          },
        },
        include: {
          vocabulary: true,
        },
        take: 10,
      });

    if (reviewWords.length > 0) {
      return {
        success: true,
        mode: "REVIEW",
        words: reviewWords.map((x) => ({
          ...x.vocabulary,
          isReview: true,
        })),
      };
    }

    const learned =
      await this.prisma.userVocabularyProgress.findMany({
        where: {
          userId,
        },
        select: {
          vocabularyId: true,
        },
      });

    const learnedIds = learned.map((x) => x.vocabularyId);

    const newWords =
      await this.prisma.vocabulary.findMany({
        where: {
          stage: currentStage,
          id: {
            notIn: learnedIds,
          },
        },
        take: 10,
        orderBy: {
          id: "asc",
        },
      });

    return {
      success: true,
      mode: "NEW",
      words: newWords.map((x) => ({
        ...x,
        isReview: false,
      })),
    };
  }
  async today(userId: number) {
    const profile = await this.prisma.userProfile.findUnique({
      where: {
        userId,
      },
    });

    if (!profile) {
      return {
        success: false,
        message: 'Không tìm thấy học viên',
      };
    }

    const currentScore = profile.currentScore ?? 0;

    let stage = 1;

    if (currentScore >= 800) {
      stage = 5;
    } else if (currentScore >= 650) {
      stage = 4;
    } else if (currentScore >= 500) {
      stage = 3;
    } else if (currentScore >= 300) {
      stage = 2;
    }

    // ==========================
    // 1. Ưu tiên từ cần ôn
    // ==========================

    const reviewWords =
      await this.prisma.userVocabularyProgress.findMany({
        where: {
          userId,
          nextReview: {
            lte: new Date(),
          },
        },

        include: {
          vocabulary: true,
        },

        orderBy: {
          nextReview: 'asc',
        },

        take: 10,
      });

    if (reviewWords.length > 0) {
      return {
        success: true,
        mode: 'REVIEW',

        words: reviewWords.map((x) => ({
          ...x.vocabulary,
          isReview: true,
        })),
      };
    }

    // ==========================
    // 2. Học từ mới (20 từ/ngày)
    // ==========================

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const learnedToday =
      await this.prisma.userVocabularyProgress.count({
        where: {
          userId,
          learnedAt: {
            gte: today,
          },
        },
      });

    const remain = Math.max(20 - learnedToday, 0);

    if (remain === 0) {
      return {
        success: true,
        mode: 'DONE_TODAY',
        words: [],
      };
    }

    const learnedIds =
      await this.prisma.userVocabularyProgress.findMany({
        where: {
          userId,
        },

        select: {
          vocabularyId: true,
        },
      });

    const ids = learnedIds.map((x) => x.vocabularyId);

    const newWords =
      await this.prisma.vocabulary.findMany({
        where: {
          stage,

          id: {
            notIn: ids,
          },
        },

        orderBy: {
          id: 'asc',
        },

        take: remain,
      });

    if (newWords.length > 0) {
      return {
        success: true,

        mode: 'NEW',

        words: newWords.map((x) => ({
          ...x,
          isReview: false,
        })),
      };
    }

    // ==========================
    // 3. Hết từ mới
    // ==========================

    const randomWords =
      await this.prisma.vocabulary.findMany({
        where: {
          stage,
        },

        take: 10,
      });

    return {
      success: true,

      mode: 'PRACTICE',

      words: randomWords.map((x) => ({
        ...x,
        isReview: true,
      })),
    };
  }
  async learn(dto: LearnDto) {

    const exist =
      await this.prisma.userVocabularyProgress.findUnique({

        where: {
          userId_vocabularyId: {
            userId: dto.userId,
            vocabularyId: dto.vocabularyId,
          },
        },

      });

    if (exist) {

      return {
        success: true,
        message: 'Đã học từ này trước đó',
      };

    }

    const now = new Date();

    const nextReview =
      new Date(now.getTime() + 30 * 60 * 1000);

    await this.prisma.userVocabularyProgress.create({

      data: {

        userId: dto.userId,

        vocabularyId: dto.vocabularyId,

        status: 'LEARNING',

        reviewLevel: 1,

        reviewCount: 1,

        learnedAt: now,

        lastReview: now,

        nextReview,

      },

    });

    return {

      success: true,

      message: 'Đã lưu tiến trình học',

      nextReview,

    };

  }
  async review(dto: ReviewDto) {

    const progress =
      await this.prisma.userVocabularyProgress.findUnique({

        where: {

          userId_vocabularyId: {

            userId: dto.userId,

            vocabularyId: dto.vocabularyId,

          },

        },

        include: {
          vocabulary: true,
        },

      });

    if (!progress) {

      return {

        success: false,

        message: 'Từ này chưa được học',

      };

    }

    const nextLevel = progress.reviewLevel + 1;

    // ==========================
    // Kiểm tra nếu user đã mở chặng mới
    // → từ ở chặng cũ sẽ ôn cách 20 ngày
    // ==========================

    const profile = await this.prisma.userProfile.findUnique({
      where: { userId: dto.userId },
    });

    const currentScore = profile?.currentScore ?? 0;
    let userStage = 1;
    if (currentScore >= 800) userStage = 5;
    else if (currentScore >= 650) userStage = 4;
    else if (currentScore >= 500) userStage = 3;
    else if (currentScore >= 300) userStage = 2;

    const wordStage = progress.vocabulary.stage;
    const isOldStage = wordStage < userStage;

    let nextReview = new Date();

    if (isOldStage && nextLevel >= 6) {
      // Từ chặng cũ, đã qua level 5 → ôn cách 20 ngày
      nextReview.setDate(nextReview.getDate() + 20);
    } else {
      // Lộ trình SRS chuẩn
      switch (nextLevel) {
        case 2:
          // Lần 2: sau 3 tiếng
          nextReview.setHours(nextReview.getHours() + 3);
          break;
        case 3:
          // Lần 3: sau 10 tiếng
          nextReview.setHours(nextReview.getHours() + 10);
          break;
        case 4:
          // Lần 4: sau 24 tiếng
          nextReview.setHours(nextReview.getHours() + 24);
          break;
        case 5:
          // Lần 5: sau 3 ngày
          nextReview.setDate(nextReview.getDate() + 3);
          break;
        default:
          // Lần 6+: cách 5 ngày/lần
          nextReview.setDate(nextReview.getDate() + 5);
          break;
      }
    }

    const newStatus = isOldStage && nextLevel >= 6
      ? 'MASTERED'
      : nextLevel >= 6
        ? 'REVIEWING'
        : 'REVIEWING';

    await this.prisma.userVocabularyProgress.update({

      where: {

        userId_vocabularyId: {

          userId: dto.userId,

          vocabularyId: dto.vocabularyId,

        },

      },

      data: {

        reviewLevel: nextLevel,

        reviewCount: {

          increment: 1,

        },

        lastReview: new Date(),

        nextReview,

        status: newStatus,

      },

    });

    return {

      success: true,

      reviewLevel: nextLevel,

      nextReview,

    };

  }

  // ==========================
  // SRS Dashboard Status
  // ==========================
  async getSrsStatus(userId: number) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return { success: false, message: 'Không tìm thấy học viên' };
    }

    const currentScore = profile.currentScore ?? 0;
    let stage = 1;
    if (currentScore >= 800) stage = 5;
    else if (currentScore >= 650) stage = 4;
    else if (currentScore >= 500) stage = 3;
    else if (currentScore >= 300) stage = 2;

    const now = new Date();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Số từ đã học hôm nay
    const learnedToday = await this.prisma.userVocabularyProgress.count({
      where: {
        userId,
        learnedAt: { gte: todayStart },
      },
    });

    // Tổng từ đã học
    const totalLearned = await this.prisma.userVocabularyProgress.count({
      where: { userId },
    });

    // Từ cần ôn ngay
    const reviewNow = await this.prisma.userVocabularyProgress.count({
      where: {
        userId,
        nextReview: { lte: now },
      },
    });

    // Lịch ôn tiếp theo
    const nextReviewRecord = await this.prisma.userVocabularyProgress.findFirst({
      where: {
        userId,
        nextReview: { gt: now },
      },
      orderBy: { nextReview: 'asc' },
      select: { nextReview: true },
    });

    // Đếm theo SRS level
    const levelStats = await this.prisma.userVocabularyProgress.groupBy({
      by: ['reviewLevel'],
      where: { userId },
      _count: { id: true },
    });

    // Đếm từ MASTERED
    const masteredCount = await this.prisma.userVocabularyProgress.count({
      where: {
        userId,
        status: 'MASTERED',
      },
    });

    // Đếm từ đang REVIEWING
    const reviewingCount = await this.prisma.userVocabularyProgress.count({
      where: {
        userId,
        status: 'REVIEWING',
      },
    });

    // Streak: đếm số ngày liên tục có học
    let streak = 0;
    const checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const dayStart = new Date(checkDate);
      const dayEnd = new Date(checkDate);
      dayEnd.setHours(23, 59, 59, 999);

      const count = await this.prisma.userVocabularyProgress.count({
        where: {
          userId,
          learnedAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });

      if (count > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Tổng từ trong chặng hiện tại
    const totalWordsInStage = await this.prisma.vocabulary.count({
      where: { stage },
    });

    // Từ đã học trong chặng hiện tại
    const learnedInStage = await this.prisma.userVocabularyProgress.count({
      where: {
        userId,
        vocabulary: { stage },
      },
    });

    // Phân bố level SRS
    const srsLevels = {};
    for (const stat of levelStats) {
      srsLevels[`level_${stat.reviewLevel}`] = stat._count.id;
    }

    return {
      success: true,
      stage,
      learnedToday,
      dailyGoal: 20,
      remainToday: Math.max(20 - learnedToday, 0),
      totalLearned,
      reviewNow,
      nextReview: nextReviewRecord?.nextReview || null,
      masteredCount,
      reviewingCount,
      streak,
      totalWordsInStage,
      learnedInStage,
      srsLevels,
    };
  }
}