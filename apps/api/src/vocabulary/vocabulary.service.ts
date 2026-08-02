import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { LearnDto } from './dto/learn.dto';
import { ReviewDto } from './dto/review.dto';

@Injectable()
export class VocabularyService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // =====================================================
  // PRIVATE HELPERS
  // =====================================================

  private async getProfile(userId: number) {
    const profile = await this.prisma.userProfile.findUnique({
      where: {
        userId,
      },
    });

    if (!profile) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return profile;
  }

  private getStage(score: number): number {
    if (score >= 800) return 5;
    if (score >= 650) return 4;
    if (score >= 500) return 3;
    if (score >= 300) return 2;
    return 1;
  }

  // =====================================================
  // HEALTH CHECK
  // =====================================================

  async healthCheck() {
    const totalWords = await this.prisma.vocabulary.count();

    return {
      success: true,
      totalWords,
    };
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  async getDashboard(userId: number) {
    const profile = await this.getProfile(userId);

    const stage = this.getStage(profile.currentScore ?? 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalWords,
      learnedToday,
      learning,
      review,
      mastered,
      totalLearned,
      totalStageWords,
    ] = await Promise.all([
      this.prisma.vocabulary.count(),

      this.prisma.userVocabularyProgress.count({
        where: {
          userId,
          learnedAt: {
            gte: today,
          },
        },
      }),

      this.prisma.userVocabularyProgress.count({
        where: {
          userId,
          status: 'LEARNING',
        },
      }),

      this.prisma.userVocabularyProgress.count({
        where: {
          userId,
          status: 'REVIEW',
        },
      }),

      this.prisma.userVocabularyProgress.count({
        where: {
          userId,
          status: 'MASTERED',
        },
      }),

      this.prisma.userVocabularyProgress.count({
        where: {
          userId,
        },
      }),

      this.prisma.vocabulary.count({
        where: {
          stage,
        },
      }),
    ]);

    return {
      success: true,

      stage,

      currentScore: profile.currentScore,

      targetScore: profile.targetScore,

      totalWords,

      totalLearned,

      totalStageWords,

      learnedToday,

      dailyGoal: 20,

      remainToday: Math.max(20 - learnedToday, 0),

      learning,

      review,

      mastered,

      progress:
        totalStageWords === 0
          ? 0
          : Math.round((totalLearned / totalStageWords) * 100),
    };
  }

  // =====================================================
  // TOPICS
  // =====================================================

  async getTopics() {
    const result = await this.prisma.vocabulary.groupBy({
      by: ['topic'],

      _count: {
        id: true,
      },

      orderBy: {
        topic: 'asc',
      },
    });

    return result.map((item) => ({
      topic: item.topic,
      totalWords: item._count.id,
    }));
  }

  // =====================================================
  // LIST WORDS
  // =====================================================

  async getWords(
    page = 1,
    limit = 20,
    topic?: string,
  ) {
    const where = topic
      ? {
          topic,
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.vocabulary.findMany({
        where,

        skip: (page - 1) * limit,

        take: limit,

        orderBy: {
          id: 'asc',
        },
      }),

      this.prisma.vocabulary.count({
        where,
      }),
    ]);

    return {
      success: true,

      total,

      page,

      limit,

      totalPages: Math.ceil(total / limit),

      items,
    };
  }

  // =====================================================
  // WORD DETAIL
  // =====================================================

  async getWord(id: number) {
    const word = await this.prisma.vocabulary.findUnique({
      where: {
        id,
      },
    });

    if (!word) {
      throw new NotFoundException('Không tìm thấy từ vựng');
    }

    return word;
  }
  // =====================================================
  // TODAY LEARNING
  // =====================================================

  async today(userId: number) {
    const profile = await this.getProfile(userId);

    const stage = this.getStage(profile.currentScore ?? 0);

    // ------------------------------------
    // Ưu tiên từ cần ôn
    // ------------------------------------

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
        words: reviewWords.map((item) => ({
          ...item.vocabulary,
          isReview: true,
        })),
      };
    }

    // ------------------------------------
    // Kiểm tra mục tiêu hôm nay
    // ------------------------------------

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

    // ------------------------------------
    // Lấy danh sách đã học
    // ------------------------------------

    const learned =
      await this.prisma.userVocabularyProgress.findMany({
        where: {
          userId,
        },

        select: {
          vocabularyId: true,
        },
      });

    const learnedIds = learned.map(
      (item) => item.vocabularyId,
    );

    // ------------------------------------
    // Từ mới
    // ------------------------------------

    const newWords =
      await this.prisma.vocabulary.findMany({
        where: {
          stage,

          id: {
            notIn: learnedIds,
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

        words: newWords.map((item) => ({
          ...item,
          isReview: false,
        })),
      };
    }

    // ------------------------------------
    // Không còn từ mới
    // ------------------------------------

    const practiceWords =
      await this.prisma.vocabulary.findMany({
        where: {
          stage,
        },

        take: 10,

        orderBy: {
          id: 'asc',
        },
      });

    return {
      success: true,

      mode: 'PRACTICE',

      words: practiceWords.map((item) => ({
        ...item,
        isReview: false,
      })),
    };
  }

  // =====================================================
  // LEARN WORDS
  // (Giữ tương thích API cũ)
  // =====================================================

  async learnWords(userId: number) {
    return this.today(userId);
  }

  // =====================================================
  // SAVE LEARNING
  // =====================================================

  async learn(dto: LearnDto) {
    const exist =
      await this.prisma.userVocabularyProgress.findUnique({
        where: {
          userId_vocabularyId: {
            userId: dto.userId!,
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

    const nextReview = new Date(
      now.getTime() + 30 * 60 * 1000,
    );

    await this.prisma.userVocabularyProgress.create({
      data: {
        userId: dto.userId!,

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

      reviewLevel: 1,

      nextReview,
    };
  }
    // =====================================================
  // REVIEW WORD
  // =====================================================

  async review(dto: ReviewDto) {
    const progress =
      await this.prisma.userVocabularyProgress.findUnique({
        where: {
          userId_vocabularyId: {
            userId: dto.userId!,
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

    const profile = await this.getProfile(dto.userId!);

    const userStage = this.getStage(profile.currentScore ?? 0);

    const wordStage = progress.vocabulary.stage;

    const isOldStage = wordStage < userStage;

    const nextLevel = progress.reviewLevel + 1;

    const nextReview = new Date();

    if (isOldStage && nextLevel >= 6) {
      nextReview.setDate(nextReview.getDate() + 20);
    } else {
      switch (nextLevel) {
        case 2:
          nextReview.setHours(nextReview.getHours() + 3);
          break;

        case 3:
          nextReview.setHours(nextReview.getHours() + 10);
          break;

        case 4:
          nextReview.setHours(nextReview.getHours() + 24);
          break;

        case 5:
          nextReview.setDate(nextReview.getDate() + 3);
          break;

        default:
          nextReview.setDate(nextReview.getDate() + 5);
          break;
      }
    }

    const status =
      nextLevel >= 6
        ? 'MASTERED'
        : 'REVIEW';

    await this.prisma.userVocabularyProgress.update({
      where: {
        userId_vocabularyId: {
          userId: dto.userId!,
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

        status,
      },
    });

    return {
      success: true,

      reviewLevel: nextLevel,

      status,

      nextReview,
    };
  }

  // =====================================================
  // SRS DASHBOARD
  // =====================================================

  async getSrsStatus(userId: number) {
    const profile = await this.getProfile(userId);

    const stage = this.getStage(profile.currentScore ?? 0);

    const now = new Date();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      learnedToday,
      totalLearned,
      reviewNow,
      masteredCount,
      learningCount,
      totalStageWords,
      learnedStage,
      nextReviewRecord,
      levelStats,
    ] = await Promise.all([

      this.prisma.userVocabularyProgress.count({
        where: {
          userId,
          learnedAt: {
            gte: today,
          },
        },
      }),

      this.prisma.userVocabularyProgress.count({
        where: {
          userId,
        },
      }),

      this.prisma.userVocabularyProgress.count({
        where: {
          userId,
          nextReview: {
            lte: now,
          },
        },
      }),

      this.prisma.userVocabularyProgress.count({
        where: {
          userId,
          status: 'MASTERED',
        },
      }),

      this.prisma.userVocabularyProgress.count({
        where: {
          userId,
          status: {
            in: ['LEARNING', 'REVIEW'],
          },
        },
      }),

      this.prisma.vocabulary.count({
        where: {
          stage,
        },
      }),

      this.prisma.userVocabularyProgress.count({
        where: {
          userId,
          vocabulary: {
            stage,
          },
        },
      }),

      this.prisma.userVocabularyProgress.findFirst({
        where: {
          userId,
          nextReview: {
            gt: now,
          },
        },
        orderBy: {
          nextReview: 'asc',
        },
      }),

      this.prisma.userVocabularyProgress.groupBy({
        by: ['reviewLevel'],
        where: {
          userId,
        },
        _count: {
          id: true,
        },
      }),
    ]);

    const srsLevels: Record<string, number> = {};

    levelStats.forEach((item) => {
      srsLevels[`level_${item.reviewLevel}`] =
        item._count.id;
    });

    return {
      success: true,

      stage,

      currentScore: profile.currentScore,

      targetScore: profile.targetScore,

      dailyGoal: 20,

      learnedToday,

      remainToday: Math.max(
        20 - learnedToday,
        0,
      ),

      totalLearned,

      learningCount,

      masteredCount,

      reviewNow,

      nextReview:
        nextReviewRecord?.nextReview ?? null,

      totalStageWords,

      learnedStage,

      progress:
        totalStageWords === 0
          ? 0
          : Math.round(
              (learnedStage / totalStageWords) *
                100,
            ),

      srsLevels,
    };
  }
}