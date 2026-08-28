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

  // =====================================================
  // 8. TÀI LIỆU THAM KHẢO NGỮ PHÁP (GRAMMAR REFERENCE)
  // =====================================================

  private readonly GRAMMAR_REFERENCE_DATA = [
    {
      id: 1,
      title: "12 Thì trong tiếng Anh & Dấu hiệu nhận biết TOEIC",
      category: "tenses",
      categoryLabel: "Các thì (Tenses)",
      stage: 1,
      summary: "Tổng hợp công thức, cách dùng và dấu hiệu nhận biết 12 thì thường gặp nhất trong đề thi TOEIC Part 5 & 6.",
      formula: "Hiện tại đơn: S + V(s/es) | Hiện tại hoàn thành: S + have/has + V3/ed | Quá khứ đơn: S + V2/ed",
      explanation: "Trong bài thi TOEIC, câu hỏi về thì thường kiểm tra khả năng nhận diện các trạng từ chỉ thời gian (time markers) như 'already', 'since', 'recently', 'every month', 'yesterday' để chia thì tương ứng của động từ chính.",
      quickTable: {
        headers: ["Thì", "Công thức khẳng định", "Dấu hiệu nhận biết trong TOEIC"],
        rows: [
          ["Hiện tại đơn (Present Simple)", "S + V(s/es)", "always, usually, every day/month, frequently"],
          ["Hiện tại tiếp diễn (Present Cont.)", "S + am/is/are + V-ing", "now, right now, currently, at the moment"],
          ["Hiện tại hoàn thành (Present Perfect)", "S + have/has + V3/ed", "already, just, recently, since, for, so far"],
          ["Quá khứ đơn (Past Simple)", "S + V2/ed", "yesterday, ago, last week/month, in 2020"],
          ["Quá khứ tiếp diễn (Past Cont.)", "S + was/were + V-ing", "while, when (hành động đang diễn ra thì có xen vào)"],
          ["Quá khứ hoàn thành (Past Perfect)", "S + had + V3/ed", "by the time + Quá khứ đơn, before, after"],
          ["Tương lai đơn (Future Simple)", "S + will + V-inf", "tomorrow, next week, upcoming, soon, shortly"],
          ["Tương lai hoàn thành (Future Perfect)", "S + will have + V3/ed", "by the time + Hiện tại đơn, by next year"],
        ],
      },
      examples: [
        {
          en: "The marketing director has recently approved the annual budget.",
          vi: "Giám đốc tiếp thị gần đây đã phê duyệt ngân sách hàng năm.",
          analysis: "Dấu hiệu 'recently' yêu cầu chia thì Hiện tại hoàn thành (has approved).",
        },
        {
          en: "Mr. Henderson will travel to Singapore next Monday for the conference.",
          vi: "Ông Henderson sẽ đến Singapore vào thứ Hai tới để tham dự hội nghị.",
          analysis: "Dấu hiệu 'next Monday' yêu cầu chia thì Tương lai đơn (will travel).",
        },
      ],
      exceptions: [
        "Các động từ trạng thái (stative verbs) như 'know', 'believe', 'understand', 'contain' không dùng ở thì tiếp diễn.",
        "Mệnh đề trạng ngữ chỉ thời gian bắt đầu bằng 'when', 'as soon as', 'until' không dùng thì tương lai 'will' mà dùng Hiện tại đơn để chỉ tương lai.",
      ],
      commonErrors: [
        {
          incorrect: "By the time he arrives tomorrow, we will finish the report.",
          correct: "By the time he arrives tomorrow, we will have finished the report.",
          note: "Cấu trúc 'By the time + S + V(hiện tại)' vế chính phải dùng Tương lai hoàn thành.",
        },
        {
          incorrect: "She is knowing the answer to the customer's question.",
          correct: "She knows the answer to the customer's question.",
          note: "'Know' là động từ trạng thái, không chia tiếp diễn.",
        },
      ],
      toeicTips: [
        "Luôn gạch chân trạng từ thời gian trong câu trước khi nhìn vào 4 đáp án.",
        "Nếu trong câu có 'since + mốc thời gian', mệnh đề chính 95% chọn thì Hiện tại hoàn thành (have/has + V3).",
      ],
    },
    {
      id: 2,
      title: "Trật tự & Vị trí Từ loại (Nouns, Adjectives, Adverbs)",
      category: "parts_of_speech",
      categoryLabel: "Từ loại (Parts of Speech)",
      stage: 1,
      summary: "Quy tắc xác định vị trí danh từ, tính từ, trạng từ và động từ trong câu hỏi Part 5 TOEIC.",
      formula: "a/an/the + Adv + Adj + Noun | Be + Adj | Verb + Object + Adv",
      explanation: "Khoảng 30% câu hỏi Part 5 kiểm tra từ loại (cùng gốc từ nhưng khác đuôi như -tion, -ive, -ly, -ment). Xác định thành phần còn thiếu trong cụm danh từ hoặc sau động từ tobe/liên động từ là chìa khóa giải quyết.",
      quickTable: {
        headers: ["Từ loại", "Hậu tố (Đuôi từ) phổ biến", "Vị trí trong câu TOEIC"],
        rows: [
          ["Danh từ (Noun)", "-tion, -sion, -ment, -ance, -ence, -ity, -er, -or", "Làm chủ ngữ, sau mạo từ/tính từ sở hữu/giới từ"],
          ["Tính từ (Adjective)", "-ful, -less, -ive, -able, -ible, -al, -ous, -ic", "Đứng trước danh từ, đứng sau 'be', 'seem', 'remain'"],
          ["Trạng từ (Adverb)", "-ly (quick -> quickly, careful -> carefully)", "Bổ nghĩa cho động từ thường, tính từ, trạng từ khác hoặc cả câu"],
          ["Động từ (Verb)", "-ize, -ate, -en, -ify", "Đứng sau chủ ngữ, sau trợ động từ (can, must, will)"],
        ],
      },
      examples: [
        {
          en: "The company offers extremely competitive salaries to new employees.",
          vi: "Công ty đưa ra mức lương cực kỳ cạnh tranh cho nhân viên mới.",
          analysis: "Cấu trúc: Adv (extremely) + Adj (competitive) + Noun (salaries).",
        },
        {
          en: "The new software operates efficiently even under heavy network traffic.",
          vi: "Phần mềm mới hoạt động hiệu quả ngay cả khi lưu lượng mạng cao.",
          analysis: "Trạng từ 'efficiently' bổ nghĩa cho động từ thường 'operates'.",
        },
      ],
      exceptions: [
        "Một số từ tận cùng bằng '-ly' nhưng là Tính từ: 'friendly', 'timely', 'costly', 'orderly', 'lovely'.",
        "Danh từ đếm được số ít bắt buộc phải có mạo từ (a/an/the) hoặc từ hạn định đứng trước.",
      ],
      commonErrors: [
        {
          incorrect: "The manager was impressed by her professional prepared presentation.",
          correct: "The manager was impressed by her professionally prepared presentation.",
          note: "Cần dùng trạng từ 'professionally' để bổ nghĩa cho tính từ phân từ 'prepared'.",
        },
      ],
      toeicTips: [
        "Nếu chỗ trống nằm giữa Tobe và Tính từ, 100% chọn Trạng từ (-ly): Be + [ Adv ] + Adj.",
        "Nếu chỗ trống nằm giữa 'a/an/the' và Danh từ, chọn Tính từ: The + [ Adj ] + Noun.",
      ],
    },
    {
      id: 3,
      title: "Giới từ & Liên từ (Prepositions vs Conjunctions)",
      category: "parts_of_speech",
      categoryLabel: "Từ loại (Parts of Speech)",
      stage: 2,
      summary: "Phân biệt liên từ (nối 2 mệnh đề) và giới từ (đi với cụm danh từ/V-ing) trong các ngữ cảnh nhượng bộ, nguyên nhân.",
      formula: "Liên từ + Clause (S + V) | Giới từ + Noun Phrase / V-ing",
      explanation: "Bài thi TOEIC luôn bẫy học viên giữa cặp Liên từ - Giới từ có cùng nghĩa (Ví dụ: Although vs Despite, Because vs Because of, While vs During).",
      quickTable: {
        headers: ["Ý nghĩa", "Liên từ (+ Clause S + V)", "Giới từ (+ Noun / V-ing)"],
        rows: [
          ["Mặc dù, Dù cho (Nhượng bộ)", "Although, Even though, Though", "Despite, In spite of, Regardless of"],
          ["Bởi vì (Nguyên nhân)", "Because, Since, As, Now that", "Because of, Due to, Owing to, On account of"],
          ["Trong khi / Trong suốt", "While (+ S + V)", "During (+ Noun), Throughout"],
          ["Miễn là / Với điều kiện", "Provided that, As long as, In case", "In case of (+ Noun)"],
        ],
      },
      examples: [
        {
          en: "Despite the heavy rain, the outdoor ceremony went ahead as planned.",
          vi: "Mặc dù trời mưa to, buổi lễ ngoài trời vẫn diễn ra theo đúng kế hoạch.",
          analysis: "Sau chỗ trống là cụm danh từ 'the heavy rain' -> Chọn giới từ 'Despite'.",
        },
        {
          en: "Because the shipment was delayed, we could not fulfill the order on time.",
          vi: "Bởi vì lô hàng bị hoãn, chúng tôi đã không thể hoàn thành đơn hàng đúng hạn.",
          analysis: "Sau chỗ trống là mệnh đề 'the shipment was delayed' (S + V) -> Chọn liên từ 'Because'.",
        },
      ],
      exceptions: [
        "'While' có thể đi với V-ing khi rút gọn chủ ngữ: 'While travelling in Europe, she visited 5 countries.'",
        "'Due to' thường đứng sau động từ tobe, 'Because of' bổ nghĩa cho động từ hành động.",
      ],
      commonErrors: [
        {
          incorrect: "Although the high price, many customers bought the product.",
          correct: "Despite the high price, many customers bought the product.",
          note: "'The high price' là cụm danh từ, không dùng 'Although'.",
        },
      ],
      toeicTips: [
        "Nhìn ngay sau chỗ trống: Nếu thấy có động từ chia thì (S + V) -> Loại ngay giới từ (Despite, Because of, During).",
        "Nếu sau chỗ trống chỉ có Cụm danh từ (Noun phrase) -> Chọn Giới từ.",
      ],
    },
    {
      id: 4,
      title: "Sự hòa hợp Chủ ngữ & Vị ngữ (Subject-Verb Agreement)",
      category: "structures",
      categoryLabel: "Cấu trúc đặc biệt",
      stage: 2,
      summary: "Quy tắc chia động từ số ít hoặc số nhiều theo từng loại chủ ngữ phức hợp trong đề thi TOEIC.",
      formula: "S(số ít) + V(s/es/is/was/has) | S(số nhiều) + V(nguyên mẫu/are/were/have)",
      explanation: "Đề thi TOEIC thường chèn các cụm giới từ, mệnh đề quan hệ hoặc cụm đồng vị ngữ vào giữa chủ ngữ và động từ chính nhằm đánh lừa người học.",
      quickTable: {
        headers: ["Chủ ngữ đặc biệt", "Quy tắc chia động từ", "Ví dụ"],
        rows: [
          ["Each / Every / Either / Neither", "Chia số ÍT", "Each of the participants is required to register."],
          ["S1 + with / along with / together with + S2", "Chia theo S1", "The CEO, along with his assistants, has arrived."],
          ["Neither S1 nor S2 / Either S1 or S2", "Chia theo S2 (gần động từ nhất)", "Neither the manager nor the employees were informed."],
          ["The number of + N(số nhiều)", "Chia số ÍT", "The number of applicants has increased."],
          ["A number of + N(số nhiều)", "Chia số NHIỀU", "A number of applicants have applied."],
          ["Danh từ không đếm được (information, luggage)", "Chia số ÍT", "The information is confidential."],
        ],
      },
      examples: [
        {
          en: "The results of the preliminary investigation are expected next week.",
          vi: "Kết quả của cuộc điều tra sơ bộ dự kiến sẽ có vào tuần tới.",
          analysis: "Chủ ngữ chính là 'The results' (số nhiều), bỏ qua cụm giới từ 'of the preliminary investigation' -> Động từ chia 'are'.",
        },
      ],
      exceptions: [
        "Tên công ty, tổ chức dù có tận cùng là 's' (như Siemens, Airlines) vẫn là danh từ số ít.",
        "Các khoảng thời gian, tiền bạc, khoảng cách dù có 's' vẫn chia số ít (Ví dụ: 'Ten million dollars is a large sum.').",
      ],
      commonErrors: [
        {
          incorrect: "The list of approved vendors have been updated.",
          correct: "The list of approved vendors has been updated.",
          note: "Chủ ngữ là 'The list' (số ít), không phải 'vendors'.",
        },
      ],
      toeicTips: [
        "Luôn gạch bỏ cụm giới từ bắt đầu bằng 'of', 'in', 'at', 'with', 'for' đứng sau danh từ đầu câu để tìm chủ ngữ thật.",
      ],
    },
    {
      id: 5,
      title: "Câu bị động & Thể sai khiến (Passive Voice & Causative)",
      category: "structures",
      categoryLabel: "Cấu trúc đặc biệt",
      stage: 3,
      summary: "Cấu trúc câu bị động ở các thì và thể sai khiến (have/get something done) rất phổ biến trong giao tiếp công việc.",
      formula: "Bị động: S + be + V3/ed (+ by O) | Sai khiến: have/get + O(vật) + V3/ed",
      explanation: "Nếu chủ ngữ là đối tượng tiếp nhận hành động (vật, văn bản, đơn hàng) và sau chỗ trống KHÔNG CÓ tân ngữ (Object) trực tiếp, câu đó 90% ở dạng Bị động.",
      quickTable: {
        headers: ["Dạng câu", "Cấu trúc chủ động", "Cấu trúc bị động"],
        rows: [
          ["Hiện tại đơn", "S + V(s/es) + O", "S + am/is/are + V3/ed"],
          ["Hiện tại hoàn thành", "S + have/has + V3 + O", "S + have/has + been + V3/ed"],
          ["Động từ khuyết thiếu (Modal)", "S + modal + V-inf + O", "S + modal + be + V3/ed"],
          ["Thể sai khiến (Causative)", "have sb do sth / get sb to do sth", "have / get + sth + V3/ed (nhờ ai làm gì)"],
        ],
      },
      examples: [
        {
          en: "All safety regulations must be strictly followed by all factory workers.",
          vi: "Tất cả các quy định an toàn phải được tuân thủ nghiêm ngặt bởi tất cả công nhân nhà máy.",
          analysis: "Chủ ngữ 'regulations' (quy định) + Modal verb 'must' -> Dạng bị động 'must be followed'.",
        },
        {
          en: "We need to have our office air conditioner repaired before summer.",
          vi: "Chúng tôi cần bảo dưỡng máy điều hòa văn phòng trước mùa hè.",
          analysis: "Cấu trúc sai khiến: have + O(vật: air conditioner) + V3 (repaired).",
        },
      ],
      exceptions: [
        "Nội động từ (intransitive verbs) như 'happen', 'occur', 'arrive', 'exist', 'remain' KHÔNG BAO GIỜ chia bị động.",
      ],
      commonErrors: [
        {
          incorrect: "The conference was happened in Tokyo last month.",
          correct: "The conference happened in Tokyo last month.",
          note: "'Happen' là nội động từ, không dùng bị động.",
        },
      ],
      toeicTips: [
        "Nếu sau chỗ trống có 'by + tân ngữ' -> Chọn đáp án dạng Bị động (be + V3/ed).",
        "Nếu sau chỗ trống không có Danh từ làm tân ngữ -> Nghiêng về đáp án Bị động.",
      ],
    },
    {
      id: 6,
      title: "Mệnh đề quan hệ & Rút gọn mệnh đề quan hệ (Relative Clauses)",
      category: "clauses",
      categoryLabel: "Mệnh đề (Clauses)",
      stage: 3,
      summary: "Cách dùng đại từ quan hệ (Who, Whom, Which, That, Whose) và kỹ thuật rút gọn mệnh đề quan hệ dạng V-ing, V3/ed, To-V.",
      formula: "Chủ động rút gọn: V-ing | Bị động rút gọn: V3/ed",
      explanation: "Rút gọn mệnh đề quan hệ là một trong những điểm ngữ pháp phân loại điểm cao nhất trong TOEIC Part 5. Khi hai mệnh đề chung chủ ngữ, ta lược bỏ đại từ quan hệ và tobe, đưa động từ về V-ing (chủ động) hoặc V3/ed (bị động).",
      quickTable: {
        headers: ["Đại từ quan hệ", "Thay thế cho", "Vai trò trong mệnh đề"],
        rows: [
          ["Who", "Danh từ chỉ Người", "Làm Chủ ngữ hoặc Tân ngữ (Who + V / Who + S + V)"],
          ["Whom", "Danh từ chỉ Người", "Chỉ làm Tân ngữ (Whom + S + V hoặc Giới từ + Whom)"],
          ["Which", "Danh từ chỉ Vật/Sự việc", "Làm Chủ ngữ hoặc Tân ngữ"],
          ["That", "Người hoặc Vật", "Dùng trong mệnh đề xác định (không đứng sau dấu phẩy/giới từ)"],
          ["Whose", "Sở hữu (Người hoặc Vật)", "Whose + Noun (không có mạo từ đứng trước N)"],
        ],
      },
      examples: [
        {
          en: "Passengers requiring special assistance should notify the flight attendant.",
          vi: "Hành khách yêu cầu hỗ trợ đặc biệt nên thông báo cho tiếp viên hàng không.",
          analysis: "Rút gọn từ: Passengers WHO REQUIRE special assistance -> Passengers requiring (Chủ động).",
        },
        {
          en: "The proposal submitted by Mr. Kim was approved unanimously.",
          vi: "Bản đề xuất được nộp bởi ông Kim đã được nhất trí thông qua.",
          analysis: "Rút gọn từ: The proposal WHICH WAS SUBMITTED by Mr. Kim -> The proposal submitted (Bị động).",
        },
      ],
      exceptions: [
        "'That' không bao giờ đứng sau dấu phẩy (,) hoặc giới từ (in, on, at, with).",
        "'Whose' có thể dùng cho cả người và đồ vật/công ty: 'A company whose products are world-famous.'",
      ],
      commonErrors: [
        {
          incorrect: "The employee that we talked to him is very knowledgeable.",
          correct: "The employee that we talked to is very knowledgeable.",
          note: "Đã có đại từ quan hệ 'that' thì phải bỏ đại từ 'him' trong mệnh đề phụ.",
        },
      ],
      toeicTips: [
        "Nếu câu đã có Động từ chính (Main verb), động từ thứ hai đứng sau danh từ thường ở dạng rút gọn: V-ing (nếu có tân ngữ) hoặc V3/ed (nếu có giới từ/không có tân ngữ).",
      ],
    },
    {
      id: 7,
      title: "Câu điều kiện & Đảo ngữ câu điều kiện (Conditionals & Inversion)",
      category: "clauses",
      categoryLabel: "Mệnh đề (Clauses)",
      stage: 4,
      summary: "3 loại câu điều kiện (Loại 1, 2, 3) và cấu trúc đảo ngữ với Should, Were, Had trong đề thi TOEIC.",
      formula: "Đảo loại 1: Should + S + V-inf | Đảo loại 2: Were + S + to V | Đảo loại 3: Had + S + V3/ed",
      explanation: "Đảo ngữ câu điều kiện thường xuất hiện trong email và văn bản trang trọng để tạo tính lịch sự, trang nhã trong môi trường kinh doanh.",
      quickTable: {
        headers: ["Loại điều kiện", "Mệnh đề If thông thường", "Dạng đảo ngữ TOEIC"],
        rows: [
          ["Loại 1 (Có thể xảy ra)", "If + S + V(hiện tại), S + will + V-inf", "Should + S + V-inf, S + will + V-inf"],
          ["Loại 2 (Trái hiện tại)", "If + S + V2/were, S + would + V-inf", "Were + S + (to V), S + would + V-inf"],
          ["Loại 3 (Trái quá khứ)", "If + S + had + V3, S + would have + V3", "Had + S + V3, S + would have + V3"],
        ],
      },
      examples: [
        {
          en: "Should you have any questions regarding the invoice, please feel free to contact us.",
          vi: "Nếu quý khách có bất kỳ câu hỏi nào về hóa đơn, xin vui lòng liên hệ với chúng tôi.",
          analysis: "Đảo ngữ điều kiện loại 1: Should you have = If you have.",
        },
        {
          en: "Had we known about the schedule conflict earlier, we would have rearranged the meeting.",
          vi: "Nếu chúng tôi biết về sự trùng lặp lịch trình sớm hơn, chúng tôi đã sắp xếp lại cuộc họp.",
          analysis: "Đảo ngữ điều kiện loại 3: Had we known = If we had known.",
        },
      ],
      exceptions: [
        "Trong mệnh đề If điều kiện loại 2, động từ Tobe luôn dùng 'were' cho tất cả các ngôi trong văn phong chuẩn.",
      ],
      commonErrors: [
        {
          incorrect: "Should you will need assistance, call the front desk.",
          correct: "Should you need assistance, call the front desk.",
          note: "Sau 'Should + S' là động từ nguyên mẫu không chia 'need', không dùng 'will'.",
        },
      ],
      toeicTips: [
        "Nếu đầu câu có chỗ trống đứng trước Chủ ngữ + Động từ nguyên thể (e.g. [____] you have any questions) -> 100% chọn 'Should'.",
      ],
    },
    {
      id: 8,
      title: "Danh động từ & Động từ nguyên mẫu (Gerunds & Infinitives)",
      category: "structures",
      categoryLabel: "Cấu trúc đặc biệt",
      stage: 4,
      summary: "Danh sách động từ đi kèm V-ing và To-V hay gặp nhất trong TOEIC.",
      formula: "Verb + V-ing | Verb + To V | Verb + Object + To V",
      explanation: "Rất nhiều câu hỏi Part 5 kiểm tra xem sau động từ chính là 'to V' hay 'V-ing'. Ghi nhớ các động từ đặc trưng là phương pháp đạt điểm tối đa.",
      quickTable: {
        headers: ["Nhóm", "Động từ tiêu biểu", "Cấu trúc"],
        rows: [
          ["Đi với V-ing", "enjoy, suggest, consider, avoid, postpone, delay, recommend, finish", "S + Verb + V-ing"],
          ["Đi với To V", "decide, hope, plan, agree, promise, refuse, afford, intend, hesitate", "S + Verb + To V"],
          ["Verb + O + To V", "allow, encourage, enable, remind, require, persuade, expect, advise", "S + Verb + O + To V"],
          ["Cụm giới từ + V-ing", "look forward to, be committed to, be dedicated to, in addition to", "S + Phrase + V-ing"],
        ],
      },
      examples: [
        {
          en: "The company is considering expanding its operations into Southeast Asia.",
          vi: "Công ty đang xem xét mở rộng hoạt động sang Đông Nam Á.",
          analysis: "'Consider' bắt buộc đi với V-ing -> expanding.",
        },
        {
          en: "We look forward to receiving your application by the end of this week.",
          vi: "Chúng tôi rất mong nhận được hồ sơ ứng tuyển của bạn vào cuối tuần này.",
          analysis: "Cụm 'look forward to' đi với danh động từ V-ing -> receiving.",
        },
      ],
      exceptions: [
        "'To' trong các cụm như 'look forward to', 'object to', 'be accustomed to' là giới từ, nên đi với V-ing chứ không phải V nguyên thể.",
      ],
      commonErrors: [
        {
          incorrect: "I look forward to hear from you soon.",
          correct: "I look forward to hearing from you soon.",
          note: "'Look forward to' đi với V-ing.",
        },
      ],
      toeicTips: [
        "Sau giới từ (in, on, at, about, for, without, by, of) luôn là Danh từ hoặc Danh động từ V-ing.",
      ],
    },
  ];

  async getReferenceRules(userId?: number, search?: string, category?: string) {
    let list = this.GRAMMAR_REFERENCE_DATA;

    if (category && category !== "all") {
      list = list.filter((r) => r.category === category);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q) ||
          r.formula.toLowerCase().includes(q) ||
          r.categoryLabel.toLowerCase().includes(q),
      );
    }

    return list.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      categoryLabel: r.categoryLabel,
      stage: r.stage,
      summary: r.summary,
      formula: r.formula,
      examplesCount: r.examples.length,
      exceptionsCount: r.exceptions.length,
    }));
  }

  async getReferenceRuleDetail(id: number) {
    const rule = this.GRAMMAR_REFERENCE_DATA.find((r) => r.id === id);
    if (!rule) {
      throw new NotFoundException("Không tìm thấy quy tắc ngữ pháp.");
    }
    return rule;
  }
}