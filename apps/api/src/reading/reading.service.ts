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
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const isOddDay = today.getDate() % 2 !== 0;

  // Ngày lẻ: Part 5 + Part 6
  // Ngày chẵn: Part 7
  const partsForToday = isOddDay ? [5, 6] : [7];

  const completedToday =
    await this.prisma.user_reading_progress.count({
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
    dailyGoal: partsForToday.length,
  };
}

  async getDailyLessons(userId: number) {
  const status = await this.getDailyStatus(userId);

  // Mỗi ngày chỉ học 1 group
  if (status.completedToday >= status.dailyGoal) {
    return {
      success: true,
      lessons: [],
    };
  }

  // Ngày lẻ: Part 5
  // Ngày chẵn: Part 7
  //
  // Nếu bạn muốn ngày lẻ là Part 6 thì chỉ cần đổi [5] thành [6].
  const part = status.isOddDay ? 5 : 7;

  // Lấy các group mà user đã hoàn thành
  const completedGroups =
    await this.prisma.user_reading_progress.findMany({
      where: {
        user_id: userId,
        completed: true,
      },
      select: {
        group_id: true,
      },
    });

  const completedGroupIds = completedGroups.map(
    (item) => item.group_id,
  );

  // Lấy GROUP đầu tiên thuộc đúng Part mà user chưa học
  const group =
    await this.prisma.reading_lesson_groups.findFirst({
      where: {
        part,
        ...(completedGroupIds.length > 0
          ? {
              id: {
                notIn: completedGroupIds,
              },
            }
          : {}),
      },
      orderBy: [
        {
          group_number: "asc",
        },
        {
          display_order: "asc",
        },
        {
          id: "asc",
        },
      ],
      include: {
        reading_lessons: true,

        reading_questions: {
          orderBy: {
            display_order: "asc",
          },
          include: {
            reading_options: {
              orderBy: {
                option_key: "asc",
              },
            },
          },
        },
      },
    });

  if (!group) {
    return {
      success: true,
      lessons: [],
    };
  }

  return {
    success: true,

    // Giữ format lessons để frontend hiện tại không phải
    // sửa quá nhiều.
    lessons: [
      {
        id: group.reading_lessons.id,
        title: group.reading_lessons.title,
        part: group.part,

        // Thông tin group để frontend sử dụng
        groupId: group.id,
        groupNumber: group.group_number,

        reading_lesson_groups: [group],
      },
    ],
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
  lesson: {
    include: {
      reading_lesson_groups: {
        include: {
          reading_questions: {
            orderBy: {
              display_order: "asc",
            },
            include: {
              reading_options: {
                orderBy: {
                  option_key: "asc",
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
      const lesson = progress.lesson;
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
  lesson: {
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
      .filter((p) => p.lesson)
      .map((p) => ({
        id: p.lesson.id,
        title: p.lesson.title,
        part: p.lesson.part,
        totalGroups: p.lesson.reading_lesson_groups?.length ?? 0,
        totalQuestions: p.lesson.reading_lesson_groups?.reduce(
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

  async getLessonById(lessonId: number, groupId?: number) {
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

  async submitLesson(
  userId: number,
  lessonId: number,
  groupId: number,
  score: number,
) {
  const today = new Date();

  const existingProgress =
    await this.prisma.user_reading_progress.findUnique({
      where: {
        user_id_group_id: {
          user_id: userId,
          group_id: groupId,
        },
      },
    });

  if (existingProgress) {
    await this.prisma.user_reading_progress.update({
      where: {
        id: existingProgress.id,
      },
      data: {
        completed: true,
        best_score: Math.max(
          score,
          existingProgress.best_score || 0,
        ),
        last_studied: today,
        updated_at: today,
      },
    });
  } else {
    await this.prisma.user_reading_progress.create({
      data: {
        user_id: userId,
        lesson_id: lessonId,
        group_id: groupId,
        completed: true,
        best_score: score,
        last_studied: today,
        created_at: today,
        updated_at: today,
      },
    });
  }

  return {
    success: true,
    message: "Reading group submitted successfully",
  };
}
}
