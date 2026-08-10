import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReadingService {
  constructor(private prisma: PrismaService) {}

  private async getUserStage(userId: number): Promise<number> {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile || !profile.currentScore) {
      return 1;
    }

    const score = profile.currentScore;
    if (score <= 300) return 1;
    if (score <= 500) return 2;
    if (score <= 650) return 3;
    if (score <= 800) return 4;
    return 5;
  }

  async getDailyStatus(userId: number) {
    const stage = await this.getUserStage(userId);

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isOddDay = today.getDate() % 2 !== 0;

    // Ngay le: Part 5, 6
    // Ngay chan: Part 7
    const partsForToday = isOddDay ? [5, 6] : [7, 7]; // For Part 7, we could return 2 lessons

    const completedToday = await this.prisma.user_reading_progress.count({
      where: {
        user_id: userId,
        completed: true,
        last_studied: {
          gte: startOfDay,
        },
      },
    });

    return {
      success: true,
      stage,
      isOddDay,
      partsForToday,
      completedToday,
      dailyGoal: 2,
    };
  }

  async getDailyLessons(userId: number) {
    const status = await this.getDailyStatus(userId);

    if (status.completedToday >= status.dailyGoal) {
      return { success: true, lessons: [] };
    }

    const lessons: any[] = [];
    const partsToFetch = status.partsForToday;

    // We will keep track of used lesson IDs to prevent duplicates if part 7 appears twice
    const usedLessonIds = new Set<number>();

    for (const part of partsToFetch) {
      // Find the first uncompleted lesson for this stage and part
      const incompleteLessons = await this.prisma.reading_lessons.findMany({
        where: {
          part,
        },
        orderBy: {
          display_order: 'asc',
        },
        include: {
          reading_lesson_groups: {
            include: {
              reading_questions: {
                orderBy: {
                  display_order: 'asc',
                },
                include: {
                  reading_options: {
                    orderBy: {
                      option_key: 'asc',
                    },
                  },
                },
              },
            },
          },
        },
      });

      for (const lesson of incompleteLessons) {
        if (usedLessonIds.has(lesson.id)) continue;

        const completedLesson = await this.prisma.user_reading_progress.findFirst({
          where: {
            user_id: userId,
            lesson_id: lesson.id,
            completed: true,
          },
        });

        if (!completedLesson) {
          lessons.push({
            ...lesson,
            part,
          });
          usedLessonIds.add(lesson.id);
          break; // move to next part in partsToFetch
        }
      }
    }

    return {
      success: true,
      lessons: lessons.slice(0, status.dailyGoal - status.completedToday),
    };
  }

  async getReviewLessons(userId: number) {
    const completedLessonProgress = await this.prisma.user_reading_progress.findMany({
      where: {
        user_id: userId,
        completed: true,
      },
      orderBy: {
        last_studied: 'desc',
      },
      include: {
        reading_lessons: {
          include: {
            reading_lesson_groups: {
              include: {
                reading_questions: {
                  orderBy: {
                    display_order: 'asc',
                  },
                  include: {
                    reading_options: {
                      orderBy: {
                        option_key: 'asc',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const reviewByPart: Record<number, any> = {};

    for (const progress of completedLessonProgress) {
      const lesson = progress.reading_lessons;
      if (!lesson) continue;
      const part = lesson.part;
      if (reviewByPart[part]) continue;
      reviewByPart[part] = {
        ...lesson,
        part,
      };
    }

    return {
      success: true,
      lessons: [5, 6, 7]
        .map((part) => reviewByPart[part])
        .filter(Boolean),
    };
  }

  async getCompletedLessons(userId: number) {
    const completedProgress = await this.prisma.user_reading_progress.findMany({
      where: {
        user_id: userId,
        completed: true,
      },
      orderBy: {
        last_studied: 'desc',
      },
      include: {
        reading_lessons: {
          include: {
            reading_lesson_groups: {
              include: {
                reading_questions: true,
              },
            },
          },
        },
      },
    });

    const lessons = completedProgress
      .filter((p) => p.reading_lessons)
      .map((p) => ({
        id: p.reading_lessons.id,
        title: p.reading_lessons.title,
        part: p.reading_lessons.part,
        totalGroups: p.reading_lessons.reading_lesson_groups?.length ?? 0,
        totalQuestions: p.reading_lessons.reading_lesson_groups?.reduce(
          (sum, g) => sum + (g.reading_questions?.length ?? 0),
          0,
        ) ?? 0,
        lastStudied: p.last_studied,
        best_score: p.best_score,
      }));

    return {
      success: true,
      lessons,
    };
  }

  async getLessonById(lessonId: number) {
    const lesson = await this.prisma.reading_lessons.findUnique({
      where: { id: lessonId },
      include: {
        reading_lesson_groups: {
          include: {
            reading_questions: {
              orderBy: {
                display_order: 'asc',
              },
              include: {
                reading_options: {
                  orderBy: {
                    option_key: 'asc',
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      lesson,
    };
  }

  async submitLesson(userId: number, lessonId: number, score: number) {
    const today = new Date();

    const existingProgress = await this.prisma.user_reading_progress.findUnique({
      where: {
        user_id_lesson_id: {
          user_id: userId,
          lesson_id: lessonId,
        },
      },
    });

    if (existingProgress) {
      await this.prisma.user_reading_progress.update({
        where: { id: existingProgress.id },
        data: {
          completed: true,
          best_score: Math.max(score, existingProgress.best_score || 0),
          last_studied: today,
        },
      });
    } else {
      await this.prisma.user_reading_progress.create({
        data: {
          user_id: userId,
          lesson_id: lessonId,
          completed: true,
          best_score: score,
          last_studied: today,
        },
      });
    }

    return {
      success: true,
      message: 'Lesson submitted successfully',
    };
  }
}
