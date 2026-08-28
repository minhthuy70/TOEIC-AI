import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReadingService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // =========================================================
  // USER STAGE
  // =========================================================

  private async getUserStage(
    userId: number,
  ): Promise<number> {
    const profile =
      await this.prisma.userProfile.findUnique({
        where: {
          userId,
        },
        select: {
          currentScore: true,
        },
      });

    if (
      !profile ||
      profile.currentScore === null ||
      profile.currentScore === undefined
    ) {
      return 1;
    }

    const score = profile.currentScore;

    if (score <= 300) return 1;
    if (score <= 500) return 2;
    if (score <= 650) return 3;
    if (score <= 800) return 4;

    return 5;
  }

  // =========================================================
  // DATE HELPERS
  // =========================================================

  private getStartOfToday(): Date {
    const now = new Date();

    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
  }

  // =========================================================
  // DAILY PARTS
  // =========================================================
  //
  // Ngày lẻ:
  //   Part 5 + Part 6
  //
  // Ngày chẵn:
  //   Part 6 + Part 7
  //
  // Mỗi ngày luôn có tối đa 2 Part.
  // =========================================================

  private getTodayParts(): {
    isOddDay: boolean;
    partsForToday: number[];
  } {
    const today = new Date();

    const isOddDay =
      today.getDate() % 2 !== 0;

    const partsForToday = isOddDay
      ? [5, 6]
      : [6, 7];

    return {
      isOddDay,
      partsForToday,
    };
  }

  // =========================================================
  // DAILY STATUS
  // =========================================================

  async getDailyStatus(
    userId: number,
  ) {
    const stage =
      await this.getUserStage(userId);

    const {
      isOddDay,
      partsForToday,
    } = this.getTodayParts();

    const startOfDay =
      this.getStartOfToday();

    /**
     * Đếm GROUP đã hoàn thành hôm nay.
     *
     * Quan trọng:
     * progress là GROUP-level.
     */
    const completedToday =
      await this.prisma.user_reading_progress.count({
        where: {
          user_id: userId,
          completed: true,
          last_studied: {
            gte: startOfDay,
          },
          group_id: {
            gt: 0,
          },
        },
      });

    /**
     * Một ngày có tối đa 2 group:
     *
     * Part A -> 1 group
     * Part B -> 1 group
     */
    const dailyGoal = 2;

    return {
      success: true,

      stage,

      isOddDay,

      partsForToday,

      completedToday: Math.min(
        completedToday,
        dailyGoal,
      ),

      dailyGoal,

      remainingToday: Math.max(
        dailyGoal - completedToday,
        0,
      ),

      completed:
        completedToday >= dailyGoal,
    };
  }

  // =========================================================
  // DAILY LESSONS
  // =========================================================
  //
  // Mỗi ngày:
  //
  //   Part 5 -> 1 GROUP
  //   Part 6 -> 1 GROUP
  //
  // hoặc:
  //
  //   Part 6 -> 1 GROUP
  //   Part 7 -> 1 GROUP
  //
  // Không bao giờ lấy toàn bộ GROUP.
  // =========================================================

  async getDailyLessons(
    userId: number,
  ) {
    const status =
      await this.getDailyStatus(
        userId,
      );

    /**
     * Nếu hôm nay đã đủ 2 GROUP
     * thì không trả thêm bài.
     */
    if (
      status.completedToday >=
      status.dailyGoal
    ) {
      return {
        success: true,
        lessons: [],
        completed: true,
        dailyGoal:
          status.dailyGoal,
        completedToday:
          status.completedToday,
      };
    }

    /**
     * Lấy tất cả group user đã hoàn thành.
     *
     * Đây là GROUP-level progress.
     */
    const completedProgress =
      await this.prisma.user_reading_progress.findMany({
        where: {
          user_id: userId,
          completed: true,
        },
        select: {
          group_id: true,
        },
      });

    const completedGroupIds =
      new Set(
        completedProgress.map(
          (item) => item.group_id,
        ),
      );

    const lessons: any[] = [];

    /**
     * Duyệt ĐÚNG 2 PART.
     *
     * Mỗi PART chỉ lấy 1 GROUP.
     */
    for (
      const part of status.partsForToday
    ) {
      /**
       * Nếu đã đủ dailyGoal thì dừng.
       */
      if (
        lessons.length >=
        status.dailyGoal
      ) {
        break;
      }

      /**
       * Tìm GROUP đầu tiên thuộc Part
       * mà user chưa hoàn thành.
       *
       * Không giới hạn số câu.
       */
      const group =
        await this.prisma.reading_lesson_groups.findFirst({
          where: {
            part,

            ...(completedGroupIds.size > 0
              ? {
                  id: {
                    notIn: Array.from(
                      completedGroupIds,
                    ),
                  },
                }
              : {}),
          },

          orderBy: [
            {
              group_number: 'asc',
            },
            {
              display_order: 'asc',
            },
            {
              id: 'asc',
            },
          ],

          include: {
            reading_lessons: true,

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
        });

      /**
       * Part này không còn GROUP chưa học.
       *
       * Bỏ qua Part này, nhưng vẫn tìm Part còn lại.
       */
      if (!group) {
        continue;
      }

      /**
       * Đánh dấu để tránh trường hợp
       * query tiếp theo lấy lại cùng group.
       */
      completedGroupIds.add(
        group.id,
      );

      const lesson =
        group.reading_lessons;

      /**
       * QUAN TRỌNG:
       *
       * group = 1 GROUP
       *
       * reading_questions = toàn bộ câu
       * thuộc GROUP đó.
       *
       * Không slice.
       * Không giới hạn 4.
       * Không giới hạn 10.
       */
      lessons.push({
        id: lesson.id,

        title: lesson.title,

        part: group.part,

        lessonId: lesson.id,

        groupId: group.id,

        groupNumber:
          group.group_number,

        groupTitle:
          group.title,

        passage:
          group.passage,

        imageUrl:
          null,

        knowledge:
          group.knowledge,

        questionCount:
          group.reading_questions.length,

        reading_lesson_groups: [
          group,
        ],
      });
    }

    return {
      success: true,

      lessons,

      completed:
        lessons.length === 0,

      dailyGoal:
        status.dailyGoal,

      completedToday:
        status.completedToday,

      remainingToday:
        Math.max(
          status.dailyGoal -
            status.completedToday,
          0,
        ),
    };
  }

  // =========================================================
  // REVIEW LESSONS
  // =========================================================
  //
  // CHỈ lấy GROUP đã học.
  //
  // Không được:
  //
  // lesson -> include tất cả groups
  //
  // mà phải:
  //
  // progress completed
  //      ↓
  // group_id
  //      ↓
  // lấy đúng group
  // =========================================================

  async getReviewLessons(
    userId: number,
  ) {
    /**
     * Lấy progress GROUP đã completed.
     */
    const completedProgress =
      await this.prisma.user_reading_progress.findMany({
        where: {
          user_id: userId,
          completed: true,
          group_id: {
            gt: 0,
          },
        },

        orderBy: {
          last_studied: 'desc',
        },

        select: {
          group_id: true,
          lesson_id: true,
          best_score: true,
          last_studied: true,
        },
      });

    if (
      completedProgress.length === 0
    ) {
      return {
        success: true,
        lessons: [],
      };
    }

    const groupIds = Array.from(
      new Set(
        completedProgress.map(
          (item) => item.group_id,
        ),
      ),
    );

    /**
     * CHỈ query những GROUP đã completed.
     */
    const groups =
      await this.prisma.reading_lesson_groups.findMany({
        where: {
          id: {
            in: groupIds,
          },
        },

        orderBy: [
          {
            part: 'asc',
          },
          {
            group_number: 'asc',
          },
          {
            display_order: 'asc',
          },
          {
            id: 'asc',
          },
        ],

        include: {
          reading_lessons: true,

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
      });

    const progressMap =
      new Map(
        completedProgress.map(
          (progress) => [
            progress.group_id,
            progress,
          ],
        ),
      );

    /**
     * Gom GROUP theo lesson.
     */
    const lessonMap =
      new Map<number, any>();

    for (const group of groups) {
      const lesson =
        group.reading_lessons;

      if (!lesson) {
        continue;
      }

      if (
        !lessonMap.has(
          lesson.id,
        )
      ) {
        lessonMap.set(
          lesson.id,
          {
            id: lesson.id,

            title: lesson.title,

            part: lesson.part,

            display_order:
              lesson.display_order,

            reading_lesson_groups:
              [],
          },
        );
      }

      const progress =
        progressMap.get(
          group.id,
        );

      lessonMap
        .get(lesson.id)
        .reading_lesson_groups
        .push({
          ...group,

          progress: progress
            ? {
                bestScore:
                  progress.best_score,

                lastStudied:
                  progress.last_studied,
              }
            : null,
        });
    }

    return {
      success: true,

      lessons:
        Array.from(
          lessonMap.values(),
        ),
    };
  }

  // =========================================================
  // COMPLETED LESSONS
  // =========================================================
  //
  // Trả về LESSON duy nhất.
  //
  // Nhưng các group bên trong chỉ là
  // group đã completed.
  // =========================================================

  async getCompletedLessons(
    userId: number,
  ) {
    const completedProgress =
      await this.prisma.user_reading_progress.findMany({
        where: {
          user_id: userId,
          completed: true,
          group_id: {
            gt: 0,
          },
        },

        orderBy: {
          last_studied: 'desc',
        },

        select: {
          lesson_id: true,
          group_id: true,
          best_score: true,
          last_studied: true,
        },
      });

    if (
      completedProgress.length === 0
    ) {
      return {
        success: true,
        lessons: [],
      };
    }

    const lessonIds =
      Array.from(
        new Set(
          completedProgress.map(
            (item) => item.lesson_id,
          ),
        ),
      );

    const lessons =
      await this.prisma.reading_lessons.findMany({
        where: {
          id: {
            in: lessonIds,
          },
        },

        orderBy: [
          {
            part: 'asc',
          },
          {
            display_order: 'asc',
          },
          {
            id: 'asc',
          },
        ],
      });

    const progressByLesson =
      new Map<
        number,
        typeof completedProgress
      >();

    for (
      const progress of completedProgress
    ) {
      const current =
        progressByLesson.get(
          progress.lesson_id,
        ) ?? [];

      current.push(progress);

      progressByLesson.set(
        progress.lesson_id,
        current,
      );
    }

    const result =
      lessons.map((lesson) => {
        const progress =
          progressByLesson.get(
            lesson.id,
          ) ?? [];

        const scores =
          progress
            .map(
              (item) =>
                item.best_score ?? 0,
            );

        const latestProgress =
          progress[0];

        return {
          id: lesson.id,

          title: lesson.title,

          part: lesson.part,

          displayOrder:
            lesson.display_order,

          totalGroups:
            progress.length,

          /**
           * Tổng câu sẽ được tính ở frontend
           * từ các GROUP thực tế.
           */
          totalQuestions: 0,

          lastStudied:
            latestProgress?.last_studied ??
            null,

          best_score:
            scores.length > 0
              ? Math.max(...scores)
              : 0,
        };
      });

    return {
      success: true,

      lessons: result,
    };
  }

  // =========================================================
  // GET LESSON BY ID
  // =========================================================
  //
  // Nếu groupId được truyền:
  //   chỉ trả đúng GROUP đó.
  //
  // Nếu không truyền:
  //   trả toàn bộ groups của lesson.
  //
  // Frontend learn luôn truyền groupId.
  // =========================================================

  async getLessonById(
    lessonId: number,
    groupId?: number,
  ) {
    if (
      !Number.isInteger(lessonId) ||
      lessonId <= 0
    ) {
      throw new BadRequestException(
        'Lesson ID không hợp lệ.',
      );
    }

    if (
      groupId !== undefined &&
      (!Number.isInteger(groupId) ||
        groupId <= 0)
    ) {
      throw new BadRequestException(
        'Group ID không hợp lệ.',
      );
    }

    const lesson =
      await this.prisma.reading_lessons.findUnique({
        where: {
          id: lessonId,
        },

        include: {
          reading_lesson_groups: {
            where:
              groupId !== undefined
                ? {
                    id: groupId,
                  }
                : undefined,

            orderBy: [
              {
                group_number: 'asc',
              },
              {
                display_order: 'asc',
              },
              {
                id: 'asc',
              },
            ],

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

    if (!lesson) {
      throw new NotFoundException(
        `Không tìm thấy Reading lesson với id = ${lessonId}`,
      );
    }

    /**
     * Nếu yêu cầu groupId mà group không tồn tại
     * hoặc không thuộc lesson -> lỗi rõ ràng.
     */
    if (
      groupId !== undefined &&
      lesson.reading_lesson_groups
        .length === 0
    ) {
      throw new NotFoundException(
        `Reading group ${groupId} không thuộc lesson ${lessonId}.`,
      );
    }

    return {
      success: true,

      lesson,
    };
  }

  // =========================================================
  // SUBMIT LESSON / GROUP
  // =========================================================
  //
  // Progress được lưu theo:
  //
  // user_id + group_id
  //
  // Không lưu "lesson completed" độc lập.
  // =========================================================

  async submitLesson(
    userId: number,
    lessonId: number,
    groupId: number,
    score: number,
  ) {
    // -------------------------------------------------------
    // VALIDATE
    // -------------------------------------------------------

    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      throw new BadRequestException(
        'User ID không hợp lệ.',
      );
    }

    if (
      !Number.isInteger(lessonId) ||
      lessonId <= 0
    ) {
      throw new BadRequestException(
        'Lesson ID không hợp lệ.',
      );
    }

    if (
      !Number.isInteger(groupId) ||
      groupId <= 0
    ) {
      throw new BadRequestException(
        'Group ID không hợp lệ.',
      );
    }

    if (
      !Number.isFinite(score) ||
      score < 0 ||
      score > 100
    ) {
      throw new BadRequestException(
        'Score phải nằm trong khoảng 0 đến 100.',
      );
    }

    // -------------------------------------------------------
    // CHECK GROUP
    // -------------------------------------------------------

    const group =
      await this.prisma.reading_lesson_groups.findUnique({
        where: {
          id: groupId,
        },

        select: {
          id: true,
          lesson_id: true,
          part: true,
        },
      });

    if (!group) {
      throw new NotFoundException(
        `Không tìm thấy Reading group với id = ${groupId}.`,
      );
    }

    // -------------------------------------------------------
    // CHECK GROUP -> LESSON
    // -------------------------------------------------------

    if (
      group.lesson_id !==
      lessonId
    ) {
      throw new BadRequestException(
        `Reading group ${groupId} không thuộc lesson ${lessonId}.`,
      );
    }

    const today =
      new Date();

    // -------------------------------------------------------
    // UPSERT PROGRESS - LOGIC THỦ CÔNG
    // -------------------------------------------------------
    //
    // Database có 2 unique constraints:
    // - (user_id, lesson_id)
    // - (user_id, group_id)
    //
    // Không thể dùng upsert trực tiếp vì có thể conflict.
    // Dùng logic thủ công: ưu tiên update theo group_id,
    // nếu không có thì tạo mới.
    // -------------------------------------------------------

    // 1. Thử tìm theo (user_id, group_id) trước
    const existingByGroup =
      await this.prisma.user_reading_progress.findUnique({
        where: {
          user_id_group_id: {
            user_id: userId,
            group_id: groupId,
          },
        },
      });

    if (existingByGroup) {
      // Update record đã tồn tại theo group
      await this.prisma.user_reading_progress.update({
        where: {
          id: existingByGroup.id,
        },

        data: {
          completed: true,

          best_score: Math.max(
            Number(existingByGroup.best_score ?? 0),
            score,
          ),

          last_studied: today,

          updated_at: today,

          lesson_id: lessonId,
        },
      });
    } else {
      // 2. Nếu không có theo group, kiểm tra theo lesson_id
      const existingByLesson =
        await this.prisma.user_reading_progress.findUnique({
          where: {
            user_id_lesson_id: {
              user_id: userId,
              lesson_id: lessonId,
            },
          },
        });

      if (existingByLesson) {
        // Update record theo lesson_id, thay đổi group_id
        await this.prisma.user_reading_progress.update({
          where: {
            id: existingByLesson.id,
          },

          data: {
            completed: true,

            best_score: Math.max(
              Number(existingByLesson.best_score ?? 0),
              score,
            ),

            last_studied: today,

            updated_at: today,

            group_id: groupId,
          },
        });
      } else {
        // 3. Nếu không có cả hai, tạo mới
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
    }

    // -------------------------------------------------------
    // RESPONSE
    // -------------------------------------------------------

    return {
      success: true,

      message:
        'Reading group submitted successfully.',

      userId,

      lessonId:
        group.lesson_id,

      groupId:
        group.id,

      part:
        group.part,

      score,
    };
  }

  // ==========================================================
  // DASHBOARD
  // ==========================================================
  async getReadingDashboard(userId: number) {
    // 1. Overall Score from mock tests
    const mockTests = await this.prisma.mock_test_attempts.findMany({
      where: { user_id: userId, reading_score: { not: null } },
      orderBy: { started_at: 'desc' },
      take: 1,
    });
    const overallScore = mockTests.length > 0 ? mockTests[0].reading_score || 0 : 0;

    // 2. Practice sessions for Reading Parts (5, 6, 7)
    const practiceSessions = await this.prisma.practice_sessions.findMany({
      where: {
        user_id: userId,
        part: { in: [5, 6, 7] },
      },
      orderBy: { created_at: 'asc' },
    });

    let totalQuestions = 0;
    let totalCorrect = 0;
    let totalTimeSecs = 0;
    let timeTrackedQuestions = 0;

    const partStats: Record<number, { correct: number; total: number; scoreSum: number; count: number }> = {
      5: { correct: 0, total: 0, scoreSum: 0, count: 0 },
      6: { correct: 0, total: 0, scoreSum: 0, count: 0 },
      7: { correct: 0, total: 0, scoreSum: 0, count: 0 },
    };

    const uniqueDates = new Set<string>();

    for (const session of practiceSessions) {
      const part = session.part;
      totalQuestions += session.question_count;
      totalCorrect += session.correct_count;

      if (partStats[part]) {
        partStats[part].correct += session.correct_count;
        partStats[part].total += session.question_count;
        partStats[part].scoreSum += session.score;
        partStats[part].count += 1;
      }

      if (session.completed_at && session.started_at) {
        const diffSecs = (session.completed_at.getTime() - session.started_at.getTime()) / 1000;
        if (diffSecs > 0) {
          totalTimeSecs += diffSecs;
          timeTrackedQuestions += session.question_count;
        }
      }

      // Format YYYY-MM-DD for streak calculation
      uniqueDates.add(session.created_at.toISOString().split('T')[0]);
    }

    // Include mock test dates for streak
    const allMocks = await this.prisma.mock_test_attempts.findMany({
      where: { user_id: userId },
      select: { created_at: true },
    });
    for (const m of allMocks) {
      uniqueDates.add(m.created_at.toISOString().split('T')[0]);
    }

    // 3. Accuracy Rate
    const accuracyRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    // 4. Average Time per Question
    const avgTimePerQuestion = timeTrackedQuestions > 0 ? Math.round(totalTimeSecs / timeTrackedQuestions) : 0;

    // 5. Streak calculation
    const datesArr = Array.from(uniqueDates).sort((a, b) => b.localeCompare(a)); // Descending
    let streak = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (datesArr.includes(todayStr) || datesArr.includes(yesterdayStr)) {
      let currentDate = new Date(datesArr[0]);
      for (const d of datesArr) {
        const dt = new Date(d);
        const diffDays = Math.round((currentDate.getTime() - dt.getTime()) / 86400000);
        if (diffDays <= 1) {
          streak++;
          currentDate = dt;
        } else {
          break;
        }
      }
    }

    // 6. Score by Part and Weak Parts
    const scoreByPart = [5, 6, 7].map(part => {
      const stats = partStats[part];
      const acc = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      const avgScore = stats.count > 0 ? Math.round(stats.scoreSum / stats.count) : 0;
      return {
        part,
        score: avgScore,
        accuracy: acc,
        totalQuestions: stats.total,
      };
    });

    // Identify weak parts (only consider parts with at least 1 question)
    const activeParts = scoreByPart.filter(p => p.totalQuestions > 0);
    const weakParts = activeParts.length > 0
      ? activeParts.sort((a, b) => a.accuracy - b.accuracy).slice(0, 1).map(p => p.part)
      : [];

    return {
      success: true,
      overallScore,
      scoreByPart,
      accuracyRate,
      averageTimePerQuestion: avgTimePerQuestion,
      streak,
      totalQuestionsCompleted: totalQuestions,
      weakParts,
    };
  }
}