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
}