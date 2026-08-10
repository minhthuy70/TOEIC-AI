import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ListeningService {
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

    // Xac dinh ngay chan / ngay le theo Date local cua he thong
    const today = new Date();
    // Start of day
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const isOddDay = today.getDate() % 2 !== 0;

    // Ngay le: Part 1, 2
    // Ngay chan: Part 3, 4
    const partsForToday = isOddDay ? [1, 2] : [3, 4];

    // Count how many lessons completed today
    const completedToday = await this.prisma.user_listening_progress.count({
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

  async getDailyGroups(userId: number) {
    const status = await this.getDailyStatus(userId);

    // If completed goal, don't return new groups
    if (status.completedToday >= status.dailyGoal) {
      return { success: true, groups: [] };
    }

    const groups: any[] = [];

    // For each required part today, fetch 1 incomplete group
    for (const part of status.partsForToday) {
      // Find the lesson for this stage and part
      const lesson = await this.prisma.listening_lessons.findFirst({
        where: {
          stage: status.stage,
          part,
        },
      });

      if (!lesson) continue;

      // Skip if lesson already completed by the user
      const completedLesson = await this.prisma.user_listening_progress.findFirst({
        where: {
          user_id: userId,
          lesson_id: lesson.id,
          completed: true,
        },
      });

      if (completedLesson) continue;

      // Return the first group for that lesson as today's study group
      const firstGroup = await this.prisma.listening_lesson_groups.findFirst({
        where: {
          lesson_id: lesson.id,
        },
        orderBy: {
          display_order: 'asc',
        },
        include: {
          listening_lesson_questions: {
            orderBy: {
              display_order: 'asc',
            },
            include: {
              listening_lesson_options: {
                orderBy: {
                  option_label: 'asc',
                },
              },
            },
          },
        },
      });

      if (firstGroup) {
        groups.push({
          ...firstGroup,
          part,
        });
      }
    }

    // Limit to exactly 2 groups max, although loop already does 2 max (1 per part)
    return {
      success: true,
      groups: groups.slice(0, 2),
    };
  }

  async getReviewGroups(userId: number) {
    const completedGroupProgress = await this.prisma.user_listening_group_progress.findMany({
      where: {
        user_id: userId,
        completed: true,
      },
      orderBy: {
        learned_at: 'desc',
      },
      include: {
        group: {
          include: {
            listening_lessons: true,
            listening_lesson_questions: {
              orderBy: {
                display_order: 'asc',
              },
              include: {
                listening_lesson_options: {
                  orderBy: {
                    option_label: 'asc',
                  },
                },
              },
            },
          },
        },
      },
    });

    const reviewByPart: Record<number, any> = {};

    for (const progress of completedGroupProgress) {
      const group = progress.group;
      const part = group?.listening_lessons?.part;
      if (!group || !part || reviewByPart[part]) continue;
      reviewByPart[part] = {
        ...group,
        part,
      };
    }

    if (Object.keys(reviewByPart).length === 0) {
      const completedLessons = await this.prisma.user_listening_progress.findMany({
        where: {
          user_id: userId,
          completed: true,
        },
        orderBy: {
          last_studied: 'desc',
        },
        include: {
          listening_lessons: {
            include: {
              listening_lesson_groups: {
                orderBy: {
                  display_order: 'asc',
                },
                include: {
                  listening_lesson_questions: {
                    orderBy: {
                      display_order: 'asc',
                    },
                    include: {
                      listening_lesson_options: {
                        orderBy: {
                          option_label: 'asc',
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

      for (const progress of completedLessons) {
        const lesson = progress.listening_lessons;
        if (!lesson) continue;
        const part = lesson.part;
        if (!reviewByPart[part]) {
          const group = lesson.listening_lesson_groups?.[0];
          if (!group) continue;
          reviewByPart[part] = {
            ...group,
            part,
          };
        }
      }
    }

    return {
      success: true,
      groups: [1, 2, 3, 4]
        .map((part) => reviewByPart[part])
        .filter(Boolean),
    };
  }

  async getCompletedLessons(userId: number) {
    const completedLessons = await this.prisma.user_listening_progress.findMany({
      where: {
        user_id: userId,
        completed: true,
      },
      orderBy: {
        last_studied: 'desc',
      },
      include: {
        listening_lessons: {
          include: {
            listening_lesson_groups: {
              include: {
                listening_lesson_questions: true,
              },
            },
          },
        },
      },
    });

    const lessons = completedLessons
      .map((progress) => {
        const lesson = progress.listening_lessons;
        if (!lesson) return null;

        const totalQuestions = lesson.listening_lesson_groups.reduce(
          (sum, group) => sum + (group.listening_lesson_questions?.length ?? 0),
          0,
        );

        return {
          id: lesson.id,
          title: lesson.title,
          part: lesson.part,
          totalGroups: lesson.listening_lesson_groups.length,
          totalQuestions,
          lastStudied: progress.last_studied,
        };
      })
      .filter(Boolean);

    return {
      success: true,
      lessons,
    };
  }

  async getLessonReview(userId: number, lessonId: number) {
    const lesson = await this.prisma.listening_lessons.findUnique({
      where: { id: lessonId },
      include: {
        listening_lesson_groups: {
          orderBy: {
            display_order: 'asc',
          },
          include: {
            listening_lesson_questions: {
              orderBy: {
                display_order: 'asc',
              },
              include: {
                listening_lesson_options: {
                  orderBy: {
                    option_label: 'asc',
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

  async getAllLessonReview(userId: number) {
    const completedLessons = await this.prisma.user_listening_progress.findMany({
      where: {
        user_id: userId,
        completed: true,
      },
      orderBy: {
        last_studied: 'desc',
      },
      include: {
        listening_lessons: {
          include: {
            listening_lesson_groups: {
              orderBy: {
                display_order: 'asc',
              },
              include: {
                listening_lesson_questions: {
                  orderBy: {
                    display_order: 'asc',
                  },
                  include: {
                    listening_lesson_options: {
                      orderBy: {
                        option_label: 'asc',
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

    const lessons = completedLessons
      .map((progress) => progress.listening_lessons)
      .filter(Boolean);

    return {
      success: true,
      lessons,
    };
  }

  async getGroupById(groupId: number) {
    const group = await this.prisma.listening_lesson_groups.findUnique({
      where: { id: groupId },
      include: {
        listening_lesson_questions: {
          orderBy: {
            display_order: 'asc',
          },
          include: {
            listening_lesson_options: {
              orderBy: {
                option_label: 'asc',
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      group,
    };
  }

  async submitGroup(userId: number, groupId: number, score: number) {
    const today = new Date();

    const group = await this.prisma.listening_lesson_groups.findUnique({
      where: { id: groupId },
    });

    const lessonId = group?.lesson_id;

    if (lessonId) {
      const existingLessonProgress = await this.prisma.user_listening_progress.findUnique({
        where: {
          user_id_lesson_id: {
            user_id: userId,
            lesson_id: lessonId,
          },
        },
      });

      await this.prisma.user_listening_progress.upsert({
        where: {
          user_id_lesson_id: {
            user_id: userId,
            lesson_id: lessonId,
          },
        },
        update: {
          completed: true,
          best_score: Math.max(score, existingLessonProgress?.best_score || 0),
          last_studied: today,
        },
        create: {
          user_id: userId,
          lesson_id: lessonId,
          completed: true,
          best_score: score,
          last_studied: today,
        },
      });
    }

    const existingProgress = await this.prisma.user_listening_group_progress.findUnique({
      where: {
        user_id_group_id: {
          user_id: userId,
          group_id: groupId,
        },
      },
    });

    if (existingProgress) {
      await this.prisma.user_listening_group_progress.update({
        where: { id: existingProgress.id },
        data: {
          completed: true,
          score: Math.max(score, existingProgress.score || 0),
          learned_at: today,
        },
      });
    } else {
      await this.prisma.user_listening_group_progress.create({
        data: {
          user_id: userId,
          group_id: groupId,
          completed: true,
          score,
          learned_at: today,
        },
      });
    }

    return {
      success: true,
      message: 'Group submitted successfully',
    };
  }
}
