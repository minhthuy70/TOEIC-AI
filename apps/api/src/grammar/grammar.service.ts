import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { CompleteLessonDto } from "./dto/complete-lesson.dto";

@Injectable()
export class GrammarService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // =====================================================
  // 0. GRAMMAR DASHBOARD
  // =====================================================

  async getDashboard(userId: number) {
    // 1. Lấy thông tin user profile
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    const currentScore = user?.profile?.currentScore ?? 0;
    let userStage = 1;
    if (currentScore >= 800) userStage = 5;
    else if (currentScore >= 650) userStage = 4;
    else if (currentScore >= 500) userStage = 3;
    else if (currentScore >= 300) userStage = 2;

    // 2. Lấy tất cả chủ đề ngữ pháp kèm bài học và tiến độ của user
    const categories = await this.prisma.grammarCategory.findMany({
      orderBy: [
        { stage: "asc" },
        { displayOrder: "asc" },
        { id: "asc" },
      ],
      include: {
        lessons: {
          orderBy: [
            { displayOrder: "asc" },
            { id: "asc" },
          ],
          include: {
            progresses: {
              where: { userId },
            },
          },
        },
      },
    });

    let totalLessonsCount = 0;
    let totalCompletedLessonsCount = 0;
    let totalScoreSum = 0;
    let scoredLessonsCount = 0;
    let highAccuracyCount = 0; // >= 80
    let mediumAccuracyCount = 0; // 60 - 79
    let lowAccuracyCount = 0; // < 60

    const processedCategories = categories.map((cat) => {
      const totalLessons = cat.lessons.length;
      totalLessonsCount += totalLessons;

      let completedLessons = 0;
      let catScoreSum = 0;
      let catScoredCount = 0;
      let latestStudied: Date | null = null;
      let nextUncompletedLesson: { id: number; title: string } | null = null;

      for (const lesson of cat.lessons) {
        const prog = lesson.progresses[0];
        if (prog?.completed) {
          completedLessons++;
          totalCompletedLessonsCount++;
          const sc = prog.score ?? 0;
          catScoreSum += sc;
          catScoredCount++;
          totalScoreSum += sc;
          scoredLessonsCount++;

          if (sc >= 80) highAccuracyCount++;
          else if (sc >= 60) mediumAccuracyCount++;
          else lowAccuracyCount++;

          if (prog.lastStudied) {
            const d = new Date(prog.lastStudied);
            if (!latestStudied || d > latestStudied) {
              latestStudied = d;
            }
          }
        } else if (!nextUncompletedLesson) {
          nextUncompletedLesson = {
            id: lesson.id,
            title: lesson.title,
          };
        }
      }

      const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      const accuracy = catScoredCount > 0 ? Math.round(catScoreSum / catScoredCount) : 0;

      // Mastered: 100% hoàn thành hoặc >= 80% tiến độ với accuracy >= 80%
      const isMastered = (progress === 100 && accuracy >= 70) || (progress === 100 && catScoredCount === 0);
      const isLearning = progress > 0 && !isMastered;
      const isNotStarted = progress === 0;
      // Weak topic: đã học ít nhất 1 bài nhưng accuracy < 60% hoặc có bài dưới 60%
      const isWeak = catScoredCount > 0 && accuracy < 60;

      return {
        id: cat.id,
        name: cat.name,
        description: cat.description,
        stage: cat.stage,
        displayOrder: cat.displayOrder,
        totalLessons,
        completedLessons,
        progress,
        accuracy,
        isMastered,
        isLearning,
        isNotStarted,
        isWeak,
        lastStudied: latestStudied,
        nextLesson: nextUncompletedLesson,
      };
    });

    const totalCategoriesCount = processedCategories.length;
    const masteredTopics = processedCategories.filter((c) => c.isMastered);
    const learningTopics = processedCategories.filter((c) => c.isLearning);
    const weakTopics = processedCategories.filter((c) => c.isWeak);
    const notStartedTopics = processedCategories.filter((c) => c.isNotStarted);

    const overallProgress = totalLessonsCount > 0
      ? Math.round((totalCompletedLessonsCount / totalLessonsCount) * 100)
      : 0;

    const overallAccuracy = scoredLessonsCount > 0
      ? Math.round(totalScoreSum / scoredLessonsCount)
      : 0;

    // 3. Tiến độ theo 5 chặng
    const stageDefinitions = [
      { stage: 1, name: "Chặng 1", range: "0–300", title: "Xây dựng nền tảng", color: "from-red-600 to-red-500" },
      { stage: 2, name: "Chặng 2", range: "300–500", title: "Củng cố nền tảng", color: "from-orange-600 to-orange-500" },
      { stage: 3, name: "Chặng 3", range: "500–650", title: "Thành thạo mức TB", color: "from-yellow-600 to-yellow-500" },
      { stage: 4, name: "Chặng 4", range: "650–800", title: "Nâng cao", color: "from-blue-600 to-blue-500" },
      { stage: 5, name: "Chặng 5", range: "800–990", title: "Hoàn thiện", color: "from-green-600 to-green-500" },
    ];

    const stageProgress = stageDefinitions.map((def) => {
      const stageCats = processedCategories.filter((c) => c.stage === def.stage);
      const totalStageLessons = stageCats.reduce((sum, c) => sum + c.totalLessons, 0);
      const completedStageLessons = stageCats.reduce((sum, c) => sum + c.completedLessons, 0);
      const completedStageCats = stageCats.filter((c) => c.progress === 100).length;
      const progress = totalStageLessons > 0 ? Math.round((completedStageLessons / totalStageLessons) * 100) : 0;

      // Accuracy của stage
      let stageScoreSum = 0;
      let stageScoredCount = 0;
      for (const cat of stageCats) {
        if (cat.completedLessons > 0) {
          stageScoreSum += cat.accuracy * cat.completedLessons;
          stageScoredCount += cat.completedLessons;
        }
      }
      const accuracy = stageScoredCount > 0 ? Math.round(stageScoreSum / stageScoredCount) : 0;

      return {
        stage: def.stage,
        name: def.name,
        range: def.range,
        title: def.title,
        color: def.color,
        isCurrent: def.stage === userStage,
        totalCategories: stageCats.length,
        completedCategories: completedStageCats,
        totalLessons: totalStageLessons,
        completedLessons: completedStageLessons,
        progress,
        accuracy,
        topics: stageCats,
      };
    });

    // 4. Lấy lịch sử học gần đây
    const recentProgresses = await this.prisma.userGrammarProgress.findMany({
      where: {
        userId,
        completed: true,
        lastStudied: { not: null },
      },
      orderBy: { lastStudied: "desc" },
      take: 5,
      include: {
        lesson: {
          include: {
            category: true,
          },
        },
      },
    });

    const recentActivities = recentProgresses.map((p) => ({
      id: p.id,
      lessonId: p.lessonId,
      lessonTitle: p.lesson.title,
      categoryId: p.lesson.categoryId,
      categoryName: p.lesson.category.name,
      stage: p.lesson.category.stage,
      score: p.score ?? 0,
      lastStudied: p.lastStudied,
    }));

    return {
      success: true,
      userStage,
      overview: {
        totalCategories: totalCategoriesCount,
        masteredCategories: masteredTopics.length,
        learningCategories: learningTopics.length,
        notStartedCategories: notStartedTopics.length,
        weakCategories: weakTopics.length,
        totalLessons: totalLessonsCount,
        completedLessons: totalCompletedLessonsCount,
        overallProgress,
        overallAccuracy,
      },
      accuracy: {
        overall: overallAccuracy,
        totalScored: scoredLessonsCount,
        highCount: highAccuracyCount,
        mediumCount: mediumAccuracyCount,
        lowCount: lowAccuracyCount,
      },
      masteredTopics,
      learningTopics,
      weakTopics,
      notStartedTopics,
      stages: stageProgress,
      recentActivities,
    };
  }

  // =====================================================
  // 1. LẤY DANH SÁCH CHỦ ĐỀ
  // =====================================================

  async getCategories(userId: number) {
    const categories =
      await this.prisma.grammarCategory.findMany({
        orderBy: [
          {
            stage: "asc",
          },
          {
            displayOrder: "asc",
          },
          {
            id: "asc",
          },
        ],

        include: {
          lessons: {
            orderBy: [
              {
                displayOrder: "asc",
              },
              {
                id: "asc",
              },
            ],

            include: {
              progresses: {
                where: {
                  userId,
                },
              },
            },
          },
        },
      });

    return categories.map((category) => {
      const totalLessons = category.lessons.length;

      const completedLessons =
        category.lessons.filter(
          (lesson) =>
            lesson.progresses[0]?.completed === true,
        ).length;

      const progress =
        totalLessons > 0
          ? Math.round(
              (completedLessons / totalLessons) * 100,
            )
          : 0;

      return {
        id: category.id,
        name: category.name,
        description: category.description,
        stage: category.stage,
        displayOrder: category.displayOrder,

        totalLessons,
        completedLessons,
        progress,
      };
    });
  }

  // =====================================================
  // 2. CHI TIẾT CHỦ ĐỀ
  // =====================================================

  async getCategory(
    categoryId: number,
    userId: number,
  ) {
    const category =
      await this.prisma.grammarCategory.findUnique({
        where: {
          id: categoryId,
        },

        include: {
          lessons: {
            orderBy: [
              {
                displayOrder: "asc",
              },
              {
                id: "asc",
              },
            ],

            include: {
              progresses: {
                where: {
                  userId,
                },
              },
            },
          },
        },
      });

    if (!category) {
      throw new NotFoundException(
        "Không tìm thấy chủ đề ngữ pháp",
      );
    }

    const totalLessons = category.lessons.length;

    const completedLessons =
      category.lessons.filter(
        (lesson) =>
          lesson.progresses[0]?.completed === true,
      ).length;

    const progress =
      totalLessons > 0
        ? Math.round(
            (completedLessons / totalLessons) * 100,
          )
        : 0;

    return {
      id: category.id,
      name: category.name,
      description: category.description,
      stage: category.stage,
      displayOrder: category.displayOrder,

      totalLessons,
      completedLessons,
      progress,

      lessons: category.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        content: lesson.content,
        displayOrder: lesson.displayOrder,
        testId: lesson.testId,

        completed:
          lesson.progresses[0]?.completed ?? false,

        score:
          lesson.progresses[0]?.score ?? 0,

        lastStudied:
          lesson.progresses[0]?.lastStudied ?? null,
      })),
    };
  }

  // =====================================================
  // 3. CHI TIẾT BÀI HỌC
  // =====================================================

  async getLesson(
    lessonId: number,
    userId: number,
  ) {
    const lesson =
      await this.prisma.grammarLesson.findUnique({
        where: {
          id: lessonId,
        },

        include: {
          category: true,

          progresses: {
            where: {
              userId,
            },
          },
        },
      });

    if (!lesson) {
      throw new NotFoundException(
        "Không tìm thấy bài học",
      );
    }

    return {
      id: lesson.id,
      title: lesson.title,
      content: lesson.content,
      displayOrder: lesson.displayOrder,
      testId: lesson.testId,

      category: {
        id: lesson.category.id,
        name: lesson.category.name,
      },

      progress: {
        completed:
          lesson.progresses[0]?.completed ?? false,

        score:
          lesson.progresses[0]?.score ?? 0,

        lastStudied:
          lesson.progresses[0]?.lastStudied ?? null,
      },
    };
  }

  // =====================================================
  // 4. HOÀN THÀNH BÀI HỌC
  // =====================================================

  async completeLesson(
    lessonId: number,
    userId: number,
    dto: CompleteLessonDto,
  ) {
    // Kiểm tra lesson tồn tại
    const lesson =
      await this.prisma.grammarLesson.findUnique({
        where: {
          id: lessonId,
        },
      });

    if (!lesson) {
      throw new NotFoundException(
        "Không tìm thấy bài học",
      );
    }

    // Upsert progress
    const progress =
      await this.prisma.userGrammarProgress.upsert({
        where: {
          userId_lessonId: {
            userId,
            lessonId,
          },
        },

        create: {
          userId,
          lessonId,
          completed: true,
          score: dto.score,
          lastStudied: new Date(),
        },

        update: {
          completed: true,
          score: dto.score,
          lastStudied: new Date(),
        },
      });

    return {
      success: true,

      message: "Đã hoàn thành bài học",

      progress: {
        id: progress.id,
        lessonId: progress.lessonId,
        completed: progress.completed,
        score: progress.score,
        lastStudied: progress.lastStudied,
      },
    };
  }
}