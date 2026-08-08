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