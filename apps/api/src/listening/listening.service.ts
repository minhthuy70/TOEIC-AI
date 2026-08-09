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

    // Count how many groups completed today
    const completedToday = await this.prisma.user_listening_group_progress.count({
      where: {
        user_id: userId,
        learned_at: {
          gte: startOfDay,
        },
        completed: true,
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

      // Find an incomplete group for this lesson
      const uncompletedGroup = await this.prisma.listening_lesson_groups.findFirst({
        where: {
          lesson_id: lesson.id,
          user_listening_group_progress: {
            none: {
              user_id: userId,
              completed: true,
            },
          },
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

      if (uncompletedGroup) {
        groups.push({
          ...uncompletedGroup,
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

  async submitGroup(userId: number, groupId: number, score: number) {
    const today = new Date();

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
