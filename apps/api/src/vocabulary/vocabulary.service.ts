import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

  async learning(userId: number) {
    const profile = await this.prisma.userProfile.findUnique({
      where: {
        userId,
      },
    });

    if (!profile) {
      return {
        success: false,
        message: 'Không tìm thấy hồ sơ học viên',
      };
    }

    const currentScore = profile.currentScore ?? 0;
    const targetScore = profile.targetScore ?? 990;

    let currentStage = 1;

    if (currentScore >= 800) {
      currentStage = 5;
    } else if (currentScore >= 650) {
      currentStage = 4;
    } else if (currentScore >= 500) {
      currentStage = 3;
    } else if (currentScore >= 300) {
      currentStage = 2;
    }

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

    const reviewWords =
      await this.prisma.userVocabularyProgress.count({
        where: {
          userId,
          nextReview: {
            lte: new Date(),
          },
        },
      });

    const topics =
      await this.prisma.vocabulary.findMany({
        where: {
          stage: currentStage,
        },
        distinct: ['topic'],
        select: {
          topic: true,
        },
        orderBy: {
          topic: 'asc',
        },
      });

    return {
      success: true,

      currentStage,

      currentScore,

      targetScore,

      learnedToday,

      newWordsLeft: Math.max(10 - learnedToday, 0),

      reviewWords,

      canUnlockNextStage: false,

      topics: topics.map((x) => x.topic),
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
    // 2. Học từ mới
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

    const remain = Math.max(10 - learnedToday, 0);

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
}