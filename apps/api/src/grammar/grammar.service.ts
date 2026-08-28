import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { CompleteLessonDto } from "./dto/complete-lesson.dto";
import { StartExerciseDto, SubmitExerciseDto } from "./dto/exercise.dto";

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

    // Lấy các bài học cùng chủ đề để điều hướng và hiển thị danh sách
    const siblingLessons = await this.prisma.grammarLesson.findMany({
      where: { categoryId: lesson.categoryId },
      orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
      include: {
        progresses: {
          where: { userId },
        },
      },
    });

    const currentIndex = siblingLessons.findIndex((l) => l.id === lessonId);
    const previousLesson =
      currentIndex > 0
        ? {
            id: siblingLessons[currentIndex - 1].id,
            title: siblingLessons[currentIndex - 1].title,
          }
        : null;
    const nextLesson =
      currentIndex >= 0 && currentIndex < siblingLessons.length - 1
        ? {
            id: siblingLessons[currentIndex + 1].id,
            title: siblingLessons[currentIndex + 1].title,
          }
        : null;

    // Lấy các chủ đề liên quan trong cùng chặng
    const relatedCategories = await this.prisma.grammarCategory.findMany({
      where: {
        stage: lesson.category.stage,
        id: { not: lesson.categoryId },
      },
      take: 4,
      select: {
        id: true,
        name: true,
        stage: true,
        description: true,
      },
    });

    let difficulty = "Cơ bản";
    if (lesson.category.stage >= 5) difficulty = "Nâng cao";
    else if (lesson.category.stage >= 3) difficulty = "Trung cấp";

    return {
      id: lesson.id,
      title: lesson.title,
      content: lesson.content,
      displayOrder: lesson.displayOrder,
      testId: lesson.testId,
      difficulty,
      lessonIndex: currentIndex + 1,
      totalLessonsInCategory: siblingLessons.length,

      category: {
        id: lesson.category.id,
        name: lesson.category.name,
        description: lesson.category.description,
        stage: lesson.category.stage,
      },

      progress: {
        completed:
          lesson.progresses[0]?.completed ?? false,
        score:
          lesson.progresses[0]?.score ?? 0,
        lastStudied:
          lesson.progresses[0]?.lastStudied ?? null,
      },

      previousLesson,
      nextLesson,
      siblingLessons: siblingLessons.map((s, idx) => ({
        id: s.id,
        title: s.title,
        order: idx + 1,
        completed: s.progresses[0]?.completed ?? false,
        score: s.progresses[0]?.score ?? 0,
      })),
      relatedCategories,
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
          score: dto.score ?? 100,
          lastStudied: new Date(),
        },

        update: {
          completed: true,
          score: dto.score ?? 100,
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

  // =====================================================
  // 5. DANH SÁCH BÀI TẬP NGỮ PHÁP THEO CHỦ ĐỀ
  // =====================================================

  async getExercisesList(userId: number) {
    const categories = await this.prisma.grammarCategory.findMany({
      orderBy: [{ stage: "asc" }, { displayOrder: "asc" }, { id: "asc" }],
      include: {
        lessons: {
          include: {
            progresses: {
              where: { userId },
            },
          },
        },
      },
    });

    return categories.map((cat) => {
      const totalLessons = cat.lessons.length;
      let completedLessons = 0;
      let scoreSum = 0;
      let scoredCount = 0;

      for (const l of cat.lessons) {
        if (l.progresses[0]?.completed) {
          completedLessons++;
          const sc = l.progresses[0]?.score ?? 0;
          scoreSum += sc;
          scoredCount++;
        }
      }

      const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      const accuracy = scoredCount > 0 ? Math.round(scoreSum / scoredCount) : 0;

      let difficulty = "Cơ bản";
      if (cat.stage >= 5) difficulty = "Nâng cao";
      else if (cat.stage >= 3) difficulty = "Trung cấp";

      return {
        id: cat.id,
        name: cat.name,
        description: cat.description,
        stage: cat.stage,
        difficulty,
        totalLessons,
        completedLessons,
        progress,
        accuracy,
        estimatedQuestions: Math.max(totalLessons * 5, 10),
      };
    });
  }

  // =====================================================
  // 6. KHỞI TẠO BÀI TẬP NGỮ PHÁP (START EXERCISE)
  // =====================================================

  private shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  async startExercise(userId: number, dto: StartExerciseDto) {
    const count = dto.questionCount || 10;
    let targetTestIds: number[] = [];
    let categoryName = "Tổng hợp ngữ pháp TOEIC";
    let stage = dto.stage || 1;

    if (dto.categoryId) {
      const cat = await this.prisma.grammarCategory.findUnique({
        where: { id: dto.categoryId },
        include: { lessons: true },
      });
      if (cat) {
        categoryName = cat.name;
        stage = cat.stage;
        targetTestIds = cat.lessons
          .map((l) => l.testId)
          .filter((t): t is number => t !== null && t !== undefined);
      }
    }

    // Tìm câu hỏi ngữ pháp (Part 5 hoặc testId liên quan)
    let questionsRaw: any[] = [];

    if (targetTestIds.length > 0) {
      questionsRaw = await this.prisma.questions.findMany({
        where: {
          question_groups: {
            test_id: { in: targetTestIds },
          },
        },
        include: {
          options: {
            orderBy: { display_order: "asc" },
          },
          question_groups: true,
        },
      });
    }

    // Nếu không đủ câu hỏi từ testId, bổ sung từ ngân hàng câu hỏi Part 5
    if (questionsRaw.length < count) {
      const part5Questions = await this.prisma.questions.findMany({
        where: {
          question_groups: {
            part: 5,
          },
        },
        include: {
          options: {
            orderBy: { display_order: "asc" },
          },
          question_groups: true,
        },
        take: 100,
      });

      const existingIds = new Set(questionsRaw.map((q) => q.id));
      for (const q of part5Questions) {
        if (!existingIds.has(q.id)) {
          questionsRaw.push(q);
        }
      }
    }

    if (questionsRaw.length === 0) {
      throw new NotFoundException("Chưa có ngân hàng câu hỏi phù hợp cho chủ đề này.");
    }

    const shuffled = this.shuffle(questionsRaw).slice(0, count);

    const questions = shuffled.map((q, idx) => ({
      id: q.id,
      questionNumber: idx + 1,
      questionText: q.question_text || "Chọn đáp án đúng nhất để hoàn thành câu:",
      options: q.options.map((opt: any) => ({
        id: opt.id,
        label: opt.option_label || String.fromCharCode(65 + opt.display_order),
        text: opt.option_text || "",
      })),
      knowledge: q.question_groups?.knowledge || "Ngữ pháp Part 5",
    }));

    return {
      success: true,
      categoryId: dto.categoryId || null,
      categoryName,
      stage,
      difficulty: dto.difficulty || (stage >= 5 ? "Nâng cao" : stage >= 3 ? "Trung cấp" : "Cơ bản"),
      totalQuestions: questions.length,
      isTimed: dto.isTimed ?? true,
      timeLimitSeconds: (dto.isTimed ?? true) ? questions.length * 45 : null,
      questions,
    };
  }

  // =====================================================
  // 7. NỘP BÀI TẬP NGỮ PHÁP (SUBMIT EXERCISE)
  // =====================================================

  async submitExercise(userId: number, dto: SubmitExerciseDto) {
    const questionIds = dto.answers.map((a) => a.questionId);

    const questionsInDb = await this.prisma.questions.findMany({
      where: { id: { in: questionIds } },
      include: {
        options: true,
        question_groups: true,
      },
    });

    const questionMap = new Map(questionsInDb.map((q) => [q.id, q]));

    let correctCount = 0;
    const results: any[] = [];
    const incorrectQuestions: any[] = [];

    for (const ans of dto.answers) {
      const q = questionMap.get(ans.questionId);
      if (!q) continue;

      const correctOpt = q.options.find((o: any) => o.is_correct);
      const selectedOpt = q.options.find((o: any) => o.id === ans.optionId);

      const isCorrect = !!(selectedOpt && selectedOpt.is_correct);
      if (isCorrect) correctCount++;

      // Xây dựng quy tắc ngữ pháp tham chiếu và ví dụ
      const grammarRule = q.question_groups?.knowledge
        ? `Quy tắc trọng tâm: ${q.question_groups.knowledge}`
        : "Quy tắc ngữ pháp TOEIC: Áp dụng hòa hợp chủ ngữ - vị ngữ, cấu trúc thì và từ loại.";

      const relatedExample = "Ví dụ tham khảo: She has completed the quarterly report before the deadline.";

      const resultItem = {
        questionId: q.id,
        questionText: q.question_text,
        selectedOptionId: ans.optionId,
        selectedLabel: selectedOpt?.option_label || "",
        selectedText: selectedOpt?.option_text || "",
        correctOptionId: correctOpt?.id || 0,
        correctLabel: correctOpt?.option_label || "",
        correctText: correctOpt?.option_text || "",
        isCorrect,
        explanation: q.explanation || "Xem lại vị trí từ loại và thì của động từ trong câu để chọn đáp án chính xác.",
        grammarRule,
        relatedExample,
        options: q.options.map((o: any) => ({
          id: o.id,
          label: o.option_label,
          text: o.option_text,
          isCorrect: !!o.is_correct,
        })),
      };

      results.push(resultItem);
      if (!isCorrect) {
        incorrectQuestions.push(resultItem);
      }
    }

    const totalQuestions = dto.answers.length;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const accuracy = score;

    // Cập nhật tiến độ nếu có categoryId
    if (dto.categoryId) {
      const firstLesson = await this.prisma.grammarLesson.findFirst({
        where: { categoryId: dto.categoryId },
      });
      if (firstLesson) {
        await this.prisma.userGrammarProgress.upsert({
          where: {
            userId_lessonId: {
              userId,
              lessonId: firstLesson.id,
            },
          },
          create: {
            userId,
            lessonId: firstLesson.id,
            completed: score >= 70,
            score,
            lastStudied: new Date(),
          },
          update: {
            completed: score >= 70,
            score: Math.max(score, 0),
            lastStudied: new Date(),
          },
        });
      }
    }

    return {
      success: true,
      totalQuestions,
      correctCount,
      incorrectCount: totalQuestions - correctCount,
      score,
      accuracy,
      durationSeconds: dto.durationSeconds || 0,
      results,
      incorrectQuestions,
    };
  }
}