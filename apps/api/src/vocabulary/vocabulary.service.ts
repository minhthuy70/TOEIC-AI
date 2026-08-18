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

  private async getStreak(userId: number): Promise<number> {
    const progress = await this.prisma.userVocabularyProgress.findMany({
      where: {
        userId,
        learnedAt: { not: null },
      },
      select: {
        learnedAt: true,
      },
      orderBy: {
        learnedAt: 'desc',
      },
    });

    if (progress.length === 0) return 0;

    const dates = new Set(
      progress.map((p) => {
        const d = new Date(p.learnedAt!);
        return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      })
    );

    let streak = 0;
    const current = new Date();
    current.setHours(0, 0, 0, 0);

    // Check if user has learned anything today or yesterday to start counting
    const todayStr = `${current.getFullYear()}-${current.getMonth() + 1}-${current.getDate()}`;
    current.setDate(current.getDate() - 1);
    const yesterdayStr = `${current.getFullYear()}-${current.getMonth() + 1}-${current.getDate()}`;

    if (!dates.has(todayStr) && !dates.has(yesterdayStr)) {
      return 0;
    }

    let checkDate = dates.has(todayStr) ? new Date() : current;
    checkDate.setHours(0, 0, 0, 0);

    while (true) {
      const dateStr = `${checkDate.getFullYear()}-${checkDate.getMonth() + 1}-${checkDate.getDate()}`;
      if (dates.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
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

  async getTopics(userId: number) {
    // Lấy tất cả từ vựng group theo topic để đếm tổng số từ
    const allTopics = await this.prisma.vocabulary.groupBy({
      by: ['topic'],
      _count: {
        id: true,
      },
      orderBy: {
        topic: 'asc',
      },
    });

    // Lấy tiến độ học của user
    const userProgress = await this.prisma.userVocabularyProgress.findMany({
      where: {
        userId,
        status: { not: 'NEW' }, // Đã học
      },
      select: {
        vocabulary: {
          select: {
            topic: true
          }
        }
      }
    });

    // Đếm số từ đã học theo từng topic
    const progressMap: Record<string, number> = {};
    for (const p of userProgress) {
      const topic = p.vocabulary?.topic;
      if (topic) {
        progressMap[topic] = (progressMap[topic] || 0) + 1;
      }
    }

    return allTopics.map((item, index) => {
      const topicName = item.topic || "Khác";
      const words = item._count.id;
      const done = progressMap[item.topic] || 0;
      
      // Auto-assign colors and icons dynamically
      const colors = [
        "from-blue-600 to-blue-500",
        "from-cyan-600 to-cyan-500",
        "from-green-600 to-green-500",
        "from-purple-600 to-purple-500",
        "from-pink-600 to-pink-500",
        "from-orange-600 to-orange-500",
        "from-yellow-600 to-yellow-500",
        "from-indigo-600 to-indigo-500",
      ];
      
      const icons = ["🏢", "✈️", "🏦", "📊", "👥", "🚢", "🤝", "💻", "📚", "🛒", "🏥", "🏭", "🏠", "🎨", "🎬", "🎵"];

      return {
        id: index + 1,
        label: topicName,
        icon: icons[index % icons.length],
        words,
        done,
        color: colors[index % colors.length],
      };
    });
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

    const now = new Date();
    const nextReview = new Date(
      now.getTime() + 30 * 60 * 1000,
    );

    if (exist) {
      if (exist.status !== 'NEW') {
        return {
          success: true,
          message: 'Đã học từ này trước đó',
        };
      }

      await this.prisma.userVocabularyProgress.update({
        where: {
          id: exist.id,
        },
        data: {
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
        message: 'Đã cập nhật tiến trình học',
        reviewLevel: 1,
        nextReview,
      };
    }

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

if (
  progress.status !== 'MASTERED' &&
  progress.nextReview &&
  progress.nextReview > new Date()
) {
  return {
    success: false,
    message: 'Chưa đến thời gian ôn tập',
  };
}

const nextLevel = Math.min(progress.reviewLevel + 1, 8);
const nextReview = new Date();

    switch (nextLevel) {
      case 2: // 3 hours
        nextReview.setHours(nextReview.getHours() + 3);
        break;

      case 3: // 10 hours
        nextReview.setHours(nextReview.getHours() + 10);
        break;

      case 4: // 24 hours
        nextReview.setHours(nextReview.getHours() + 24);
        break;

      case 5: // 3 days
        nextReview.setDate(nextReview.getDate() + 3);
        break;

      case 6: // 5 days
        nextReview.setDate(nextReview.getDate() + 5);
        break;

      case 7: // 20 days
        nextReview.setDate(nextReview.getDate() + 20);
        break;

      default: // Mastered or fallback
        nextReview.setDate(nextReview.getDate() + 20);
        break;
    }

    const status =
      nextLevel >= 8
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
      streak,
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
          status: { not: 'MASTERED' },
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
          status: { not: 'MASTERED' },
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
          status: { not: 'MASTERED' },
        },
        _count: {
          id: true,
        },
      }),
      this.getStreak(userId),
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
      streak,
    };
  }

  // =====================================================
  // LESSONS
  // =====================================================

  async getLessons(userId: number) {
    const profile = await this.getProfile(userId);
    const stage = this.getStage(profile.currentScore ?? 0);

    // Get all vocabulary words in the stage sorted by ID ascending
    const words = await this.prisma.vocabulary.findMany({
      where: { stage },
      orderBy: { id: 'asc' },
      select: { id: true },
    });

    // Get user's progress for this stage
    const progress = await this.prisma.userVocabularyProgress.findMany({
      where: {
        userId,
        vocabulary: { stage },
        status: { not: 'NEW' },
      },
      select: { vocabularyId: true },
    });

    const learnedSet = new Set(progress.map((p) => p.vocabularyId));

    const totalWords = words.length;
    const lessonsCount = Math.ceil(totalWords / 20);
    const lessons: any[] = [];

    let previousCompleted = true; // Lesson 1 is always unlocked because index 0 previous is true

    for (let i = 0; i < lessonsCount; i++) {
      const lessonNumber = i + 1;
      const lessonWords = words.slice(i * 20, (i + 1) * 20);
      
      const totalInLesson = lessonWords.length;
      const learnedInLesson = lessonWords.filter((w) => learnedSet.has(w.id)).length;
      const isCompleted = learnedInLesson === totalInLesson && totalInLesson > 0;

      let status: 'completed' | 'in_progress' | 'locked' = 'locked';
      if (isCompleted) {
        status = 'completed';
      } else if (previousCompleted) {
        status = 'in_progress';
      }

      lessons.push({
        lessonNumber,
        totalWords: totalInLesson,
        learnedWords: learnedInLesson,
        status,
      });

      previousCompleted = isCompleted;
    }

    return {
      success: true,
      stage,
      totalLessons: lessonsCount,
      lessons,
    };
  }

  async getLessonWords(userId: number, lessonNumber: number) {
    const profile = await this.getProfile(userId);
    const stage = this.getStage(profile.currentScore ?? 0);

    const words = await this.prisma.vocabulary.findMany({
      where: { stage },
      orderBy: { id: 'asc' },
    });

    const totalWords = words.length;
    const lessonsCount = Math.ceil(totalWords / 20);

    if (lessonNumber < 1 || lessonNumber > lessonsCount) {
      throw new NotFoundException('Không tìm thấy bài học');
    }

    const lessonWords = words.slice((lessonNumber - 1) * 20, lessonNumber * 20);
    const wordIds = lessonWords.map((w) => w.id);

    const progress = await this.prisma.userVocabularyProgress.findMany({
      where: {
        userId,
        vocabularyId: { in: wordIds },
      },
    });

    const progressMap = new Map(progress.map((p) => [p.vocabularyId, p]));

    const wordsWithProgress = lessonWords.map((w) => {
      const prog = progressMap.get(w.id);
      return {
        ...w,
        status: prog?.status || 'NEW',
        reviewLevel: prog?.reviewLevel || 0,
        learnedAt: prog?.learnedAt || null,
        nextReview: prog?.nextReview || null,
        isReview: (prog && prog.nextReview) ? prog.nextReview <= new Date() && prog.status !== 'MASTERED' : false,
      };
    });

    return {
      success: true,
      lessonNumber,
      words: wordsWithProgress,
    };
  }

  // =====================================================
  // SRS REVIEW LEVELS
  // =====================================================

  async getReviewLevels(userId: number) {
    const now = new Date();

    const progress = await this.prisma.userVocabularyProgress.findMany({
      where: {
        userId,
        status: { not: 'MASTERED' },
        nextReview: { lte: now },
      },
      select: {
        reviewLevel: true,
      },
    });

    // We have 7 levels:
    // 1: 30 minutes, 2: 3 hours, 3: 10 hours, 4: 24 hours, 5: 3 days, 6: 5 days, 7: 20 days
    const counts = {
      level_1: 0,
      level_2: 0,
      level_3: 0,
      level_4: 0,
      level_5: 0,
      level_6: 0,
      level_7: 0,
    };

    progress.forEach((p) => {
      const key = `level_${p.reviewLevel}`;
      if (key in counts) {
        counts[key as keyof typeof counts]++;
      }
    });

    return {
      success: true,
      levels: [
        { level: 1, label: '30 phút', icon: '🔔', count: counts.level_1 },
        { level: 2, label: '3 giờ', icon: '⏰', count: counts.level_2 },
        { level: 3, label: '10 giờ', icon: '🌙', count: counts.level_3 },
        { level: 4, label: '24 giờ', icon: '📅', count: counts.level_4 },
        { level: 5, label: '3 ngày', icon: '🗓️', count: counts.level_5 },
        { level: 6, label: '5 ngày', icon: '🔄', count: counts.level_6 },
        { level: 7, label: '20 ngày', icon: '✅', count: counts.level_7 },
      ],
    };
  }

  async getReviewWords(userId: number, level: number) {
    const now = new Date();

    const progress = await this.prisma.userVocabularyProgress.findMany({
      where: {
        userId,
        reviewLevel: level,
        status: { not: 'MASTERED' },
        nextReview: { lte: now },
      },
      include: {
        vocabulary: true,
      },
      orderBy: {
        nextReview: 'asc',
      },
    });

    return {
      success: true,
      level,
      words: progress.map((p) => ({
        ...p.vocabulary,
        status: p.status,
        reviewLevel: p.reviewLevel,
        nextReview: p.nextReview,
        isReview: true,
      })),
    };
  }

  // =====================================================
  // FILTERED VOCABULARY
  // =====================================================

  async getWordsFiltered(
    userId: number,
    query: {
      stage?: number;
      topic?: string;
      search?: string;
      sort?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    },
  ) {
    const profile = await this.getProfile(userId);
    const userMaxStage = this.getStage(profile.currentScore ?? 0);

    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const sort = query.sort === 'desc' ? 'desc' : 'asc';

    // Build Prisma where conditions
    const where: any = {};

    // Filter by stage: if not specified or "all" stage, query all stages up to userMaxStage
    if (query.stage) {
      const requestedStage = Number(query.stage);
      where.stage = requestedStage <= userMaxStage ? requestedStage : userMaxStage;
    } else {
      where.stage = { lte: userMaxStage };
    }

    if (query.topic) {
      where.topic = query.topic;
    }

    if (query.search) {
      const searchLower = query.search.trim().toLowerCase();
      where.OR = [
        { english: { contains: searchLower, mode: 'insensitive' } },
        { vietnamese: { contains: searchLower, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.vocabulary.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          english: sort,
        },
      }),
      this.prisma.vocabulary.count({
        where,
      }),
    ]);

    // Fetch user progress for these returned items
    const itemIds = items.map((item) => item.id);
    const progress = await this.prisma.userVocabularyProgress.findMany({
      where: {
        userId,
        vocabularyId: { in: itemIds },
      },
    });

    const progressMap = new Map(progress.map((p) => [p.vocabularyId, p]));

    const itemsWithProgress = items.map((w) => {
      const prog = progressMap.get(w.id);
      return {
        ...w,
        status: prog?.status || 'NEW',
        reviewLevel: prog?.reviewLevel || 0,
        isReview: (prog && prog.nextReview) ? prog.nextReview <= new Date() && prog.status !== 'MASTERED' : false,
      };
    });

    return {
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items: itemsWithProgress,
    };
  }
}