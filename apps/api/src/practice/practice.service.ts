import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { PointsService } from "../points/points.service";
import { LevelsService } from "../levels/levels.service";

import { SubmitPracticeDto } from "./dto/submit-practice.dto";

@Injectable()
export class PracticeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pointsService: PointsService,
    private readonly levelsService: LevelsService,
  ) {}

  // ============================================================
  // CẤU HÌNH SỐ CÂU CHO TỪNG PART
  // ============================================================

  private readonly PRACTICE_CONFIG = {
    1: {
      type: "question",
      count: 6,
    },

    2: {
      type: "question",
      count: 15,
    },

    3: {
      type: "group",
      count: 3,
    },

    4: {
      type: "group",
      count: 3,
    },

    5: {
      type: "question",
      count: 20,
    },

    6: {
      type: "group",
      count: 2,
    },

    7: {
      type: "group",
      count: 3,
    },
  } as const;

  // ============================================================
  // RANDOM ARRAY
  // ============================================================

  private shuffle<T>(array: T[]): T[] {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(
        Math.random() * (i + 1),
      );

      [result[i], result[j]] = [
        result[j],
        result[i],
      ];
    }

    return result;
  }

  // ============================================================
  // LẤY TEST NGẪU NHIÊN
  // ============================================================

  private async getRandomTest() {
    const tests = await this.prisma.tests.findMany({
      where: {
        is_active: true,
      },

      select: {
        id: true,
        title: true,
      },

      orderBy: {
        id: "asc",
      },
    });

    if (tests.length === 0) {
      throw new NotFoundException(
        "Không tìm thấy test đang hoạt động.",
      );
    }

    const randomIndex = Math.floor(
      Math.random() * tests.length,
    );

    return tests[randomIndex];
  }

  // ============================================================
  // BẮT ĐẦU LUYỆN
  // ============================================================

  async startPractice(
    userId: number,
    part: number,
    requestedCount?: number,
    grammarTopic?: string,
    vocabTopic?: string,
  ) {
    // ----------------------------------------------------------
    // Kiểm tra part
    // ----------------------------------------------------------

    if (
      !Number.isInteger(part) ||
      part < 1 ||
      part > 7
    ) {
      throw new BadRequestException(
        "Part phải nằm trong khoảng từ 1 đến 7.",
      );
    }

    const config =
      this.PRACTICE_CONFIG[
        part as keyof typeof this.PRACTICE_CONFIG
      ];
      
    const finalCount = requestedCount || config.count;

    // ----------------------------------------------------------
    // Nếu không có requestedCount, chọn random 1 test để luyện
    // Nếu có requestedCount, lấy trên toàn bộ các test
    // ----------------------------------------------------------

    const whereClause: any = { part };
    let test;
    if (!requestedCount && !grammarTopic && !vocabTopic) {
      test = await this.getRandomTest();
      whereClause.test_id = test.id;
    }

    if (grammarTopic) {
      whereClause.knowledge = { contains: grammarTopic, mode: 'insensitive' };
    }
    if (vocabTopic) {
      whereClause.knowledge = { contains: vocabTopic, mode: 'insensitive' };
    }

    // ----------------------------------------------------------
    // Lấy toàn bộ group của part
    // ----------------------------------------------------------

    const groups =
      await this.prisma.question_groups.findMany({
        where: whereClause,

        include: {
          questions: {
            include: {
              options: {
                select: {
                  id: true,
                  option_label: true,
                  option_text: true,
                  display_order: true,
                },

                orderBy: {
                  display_order: "asc",
                },
              },
            },

            orderBy: [
              {
                question_number: "asc",
              },
              {
                display_order: "asc",
              },
            ],
          },
        },

        orderBy: [
          {
            display_order: "asc",
          },
          {
            id: "asc",
          },
        ],
      });

    if (groups.length === 0) {
      throw new NotFoundException(
        test ? `Test "${test.title}" không có dữ liệu Part ${part}.` : `Không có dữ liệu Part ${part}.`,
      );
    }

    // ----------------------------------------------------------
    // Chỉ giữ những group có câu hỏi
    // ----------------------------------------------------------

    const validGroups = groups.filter(
      (group) => group.questions.length > 0,
    );

    if (validGroups.length === 0) {
      throw new NotFoundException(
        `Part ${part} không có câu hỏi.`,
      );
    }

    // ----------------------------------------------------------
    // Chọn group hoặc question
    // ----------------------------------------------------------

    let selectedGroups =
      validGroups;

    if (config.type === "group") {
      selectedGroups = this.shuffle(
        validGroups,
      ).slice(0, finalCount);
    }

    // ----------------------------------------------------------
    // PART 1, 2, 5
    //
    // Random từng câu nhưng vẫn giữ group gốc.
    // ----------------------------------------------------------

    if (config.type === "question") {
      const allQuestions =
        validGroups.flatMap(
          (group) =>
            group.questions.map(
              (question) => ({
                group,
                question,
              }),
            ),
        );

      const selectedQuestions =
        this.shuffle(
          allQuestions,
        ).slice(0, finalCount);

      // Gom lại theo group gốc
      const groupMap = new Map<
        number,
        {
          group: (typeof validGroups)[number];
          questions: (typeof validGroups)[number]["questions"];
        }
      >();

      for (const item of selectedQuestions) {
        const groupId =
          item.group.id;

        if (!groupMap.has(groupId)) {
          groupMap.set(groupId, {
            group: item.group,
            questions: [],
          });
        }

        groupMap
          .get(groupId)!
          .questions.push(
            item.question,
          );
      }

      selectedGroups = Array.from(
        groupMap.values(),
      ).map((item) => ({
        ...item.group,
        questions: item.questions,
      }));
    }

    // ----------------------------------------------------------
    // Lấy question IDs
    // ----------------------------------------------------------

    const questionIds =
      selectedGroups.flatMap(
        (group) =>
          group.questions.map(
            (question) =>
              question.id,
          ),
      );

    if (questionIds.length === 0) {
      throw new NotFoundException(
        "Không tìm thấy câu hỏi để luyện.",
      );
    }

    // ----------------------------------------------------------
    // Tạo session
    // ----------------------------------------------------------

    const session =
      await this.prisma.practice_sessions.create({
        data: {
          user_id: userId,

          part,

          question_count:
            questionIds.length,

          correct_count: 0,

          score: 0,

          started_at: new Date(),

          question_ids:
            questionIds,

          answers: [],
        },
      });

    // ----------------------------------------------------------
    // Không trả correct_answer xuống frontend
    // ----------------------------------------------------------

    const safeGroups =
      selectedGroups.map(
        (group) => ({
          id: group.id,

          title: group.title,

          passage: group.passage,

          image_url:
            group.image_url,

          audio_url:
            group.audio_url,

          group_type:
            group.group_type,

          audio_start_time:
            group.audio_start_time,

          audio_end_time:
            group.audio_end_time,

          knowledge:
            group.knowledge,

          questions:
            group.questions.map(
              (question) => ({
                id: question.id,

                question_number:
                  question.question_number,

                question_text:
                  question.question_text,

                explanation:
                  question.explanation,

                options:
                  question.options.map(
                    (option) => ({
                      id: option.id,

                      option_label:
                        option.option_label,

                      option_text:
                        option.option_text,
                    }),
                  ),
              }),
            ),
        }),
      );

    // ----------------------------------------------------------
    // Response
    // ----------------------------------------------------------

    return {
      sessionId: session.id,

      testId: test.id,

      testTitle: test.title,

      part,

      questionCount:
        questionIds.length,

      groups: safeGroups,
    };
  }

  // ============================================================
  // NỘP BÀI
  // ============================================================

  async submitPractice(
    userId: number,
    dto: SubmitPracticeDto,
  ) {
    // ----------------------------------------------------------
    // Kiểm tra session
    // ----------------------------------------------------------

    const session =
      await this.prisma.practice_sessions.findFirst({
        where: {
          id: dto.sessionId,

          user_id: userId,
        },
      });

    if (!session) {
      throw new NotFoundException(
        "Không tìm thấy lượt luyện tập.",
      );
    }

    // ----------------------------------------------------------
    // Không cho nộp lại
    // ----------------------------------------------------------

    if (session.completed_at) {
      throw new BadRequestException(
        "Lượt luyện tập này đã được nộp.",
      );
    }

    // ----------------------------------------------------------
    // Lấy question IDs của session
    // ----------------------------------------------------------

    const questionIds =
      session.question_ids;

    if (
      !Array.isArray(questionIds) ||
      questionIds.length === 0
    ) {
      throw new BadRequestException(
        "Session không có câu hỏi.",
      );
    }

    // ----------------------------------------------------------
    // Lấy câu hỏi
    // ----------------------------------------------------------

    const questions =
      await this.prisma.questions.findMany({
        where: {
          id: {
            in: questionIds,
          },
        },

        include: {
          options: {
            select: {
              id: true,
              option_label: true,
              option_text: true,
            },
          },
        },
      });

    // ----------------------------------------------------------
    // Kiểm tra đủ câu
    // ----------------------------------------------------------

    if (
      questions.length !==
      questionIds.length
    ) {
      throw new BadRequestException(
        "Một số câu hỏi không còn tồn tại.",
      );
    }

    // ----------------------------------------------------------
    // Chấm bài
    // ----------------------------------------------------------

    let correctCount = 0;

    const resultAnswers =
      questionIds.map(
        (questionId) => {
          const question =
            questions.find(
              (item) =>
                item.id ===
                questionId,
            );

          const submitted =
            dto.answers.find(
              (answer) =>
                answer.questionId ===
                questionId,
            );

          const selectedOption =
            submitted
              ? question?.options.find(
                  (option) =>
                    option.id ===
                    submitted.optionId,
                )
              : undefined;

          const correctAnswer =
            (
              question?.correct_answer ??
              ""
            )
              .trim()
              .toUpperCase();

          const selectedAnswer =
            (
              selectedOption
                ?.option_label ?? ""
            )
              .trim()
              .toUpperCase();

          const isCorrect =
            Boolean(
              selectedAnswer &&
                correctAnswer &&
                selectedAnswer ===
                  correctAnswer,
            );

          if (isCorrect) {
            correctCount++;
          }

          return {
            questionId,

            optionId:
              submitted
                ?.optionId ?? null,

            optionLabel:
              selectedOption
                ?.option_label ??
              null,

            isCorrect,
          };
        },
      );

    // ----------------------------------------------------------
    // Tính %
    // ----------------------------------------------------------

    const totalCount =
      questionIds.length;

    const score = Math.round(
      (correctCount /
        totalCount) *
        100,
    );

    // ----------------------------------------------------------
    // Update session
    // ----------------------------------------------------------

    const updatedSession =
      await this.prisma.practice_sessions.update({
        where: {
          id: session.id,
        },

        data: {
          correct_count:
            correctCount,

          score,

          completed_at:
            new Date(),

          answers:
            resultAnswers,
        },
      });

    // ----------------------------------------------------------
    // Award points
    // ----------------------------------------------------------

    // Award points for each correct answer
    for (let i = 0; i < correctCount; i++) {
      await this.pointsService.awardPoints(
        userId,
        'practice_correct',
        'practice',
        session.id
      );
    }

    // Award points for completing practice session
    await this.pointsService.awardPoints(
      userId,
      'practice_complete',
      'practice',
      session.id
    );

    // Award XP for completing practice session
    await this.levelsService.awardXp(
      userId,
      'practice_complete',
      'practice',
      session.id
    );

    // ----------------------------------------------------------
    // Trả kết quả
    // ----------------------------------------------------------

    return {
      sessionId:
        updatedSession.id,

      part:
        updatedSession.part,

      total:
        totalCount,

      correct:
        correctCount,

      wrong:
        totalCount -
        correctCount,

      score,

      answers:
        resultAnswers,
    };
  }

  // ============================================================
  // LỊCH SỬ
  // ============================================================

  async getHistory(
    userId: number,
  ) {
    const sessions =
      await this.prisma.practice_sessions.findMany({
        where: {
          user_id: userId,
        },

        orderBy: {
          created_at: "desc",
        },

        take: 50,

        select: {
          id: true,

          part: true,

          question_count: true,

          correct_count: true,

          score: true,

          started_at: true,

          completed_at: true,

          created_at: true,
        },
      });

    return sessions;
  }

  // ============================================================
  // CHI TIẾT LỊCH SỬ
  // ============================================================

  async getHistoryDetail(
    userId: number,
    sessionId: number,
  ) {
    const session =
      await this.prisma.practice_sessions.findFirst({
        where: {
          id: sessionId,

          user_id: userId,
        },
      });

    if (!session) {
      throw new NotFoundException(
        "Không tìm thấy lịch sử luyện tập.",
      );
    }

    return session;
  }
}