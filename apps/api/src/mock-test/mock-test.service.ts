import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MockTestService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ============================================================
  // DANH SÁCH ĐỀ THI
  // GET /mock-test/tests
  // ============================================================

  async getTests() {
    const tests =
      await this.prisma.tests.findMany({
        where: {
          is_active: true,
        },

        orderBy: {
          id: "asc",
        },

        select: {
          id: true,
          title: true,
          duration: true,
          total_questions: true,
          description: true,
          is_active: true,

          _count: {
            select: {
              question_groups: true,
            },
          },
        },
      });

    return tests;
  }

  // ============================================================
  // BẮT ĐẦU THI
  // POST /mock-test/start
  // ============================================================

  async startTest(
    userId: number,
    testId: number,
  ) {
    const test =
      await this.prisma.tests.findUnique({
        where: {
          id: testId,
        },

        include: {
          question_groups: {
            orderBy: [
              {
                part: "asc",
              },
              {
                display_order: "asc",
              },
            ],

            include: {
              questions: {
                orderBy: [
                  {
                    question_number: "asc",
                  },
                  {
                    display_order: "asc",
                  },
                ],

                include: {
                  options: {
                    orderBy: {
                      display_order: "asc",
                    },

                    select: {
                      id: true,
                      option_label: true,
                      option_text: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

    if (!test) {
      throw new NotFoundException(
        "Không tìm thấy đề thi.",
      );
    }

    if (test.is_active === false) {
      throw new BadRequestException(
        "Đề thi hiện không khả dụng.",
      );
    }

    // ==========================================================
    // FLATTEN QUESTIONS
    // ==========================================================

    const questions =
      test.question_groups.flatMap(
        (group) =>
          group.questions.map(
            (question) => ({
              id: question.id,

              questionNumber:
                question.question_number,

              questionText:
                question.question_text,

              part:
                group.part ?? 0,

              groupId:
                group.id,

              groupTitle:
                group.title,

              passage:
                group.passage,

              imageUrl:
                group.image_url,

              audioUrl:
                group.audio_url,

              groupType:
                group.group_type,

              audioStartTime:
                group.audio_start_time,

              audioEndTime:
                group.audio_end_time,

              options:
                question.options.map(
                  (option) => ({
                    id:
                      option.id,

                    label:
                      option.option_label,

                    text:
                      group.part === 1 ||
                      group.part === 2
                        ? null
                        : option.option_text,
                  }),
                ),
            }),
          ),
      );

    if (questions.length === 0) {
      throw new BadRequestException(
        "Đề thi chưa có câu hỏi.",
      );
    }

    // ==========================================================
    // TẠO ATTEMPT
    // ==========================================================

    const attempt =
      await this.prisma.mock_test_attempts.create({
        data: {
          user_id: userId,

          test_id: testId,

          started_at:
            new Date(),

          answers: {},
        },
      });

    return {
      attemptId:
        attempt.id,

      testId:
        test.id,

      testTitle:
        test.title ??
        `TOEIC Test ${test.id}`,

      duration:
        test.duration ??
        120,

      totalQuestions:
        test.total_questions ??
        questions.length,

      startedAt:
        attempt.started_at,

      questions,
    };
  }

  // ============================================================
  // NỘP BÀI
  // POST /mock-test/submit
  // ============================================================

  async submitTest(
    userId: number,
    attemptId: number,
    answers: Array<{
      questionId: number;
      optionId: number;
    }>,
  ) {
    const attempt =
      await this.prisma.mock_test_attempts.findFirst({
        where: {
          id: attemptId,
          user_id: userId,
        },
      });

    if (!attempt) {
      throw new NotFoundException(
        "Không tìm thấy lần thi.",
      );
    }

    if (attempt.submitted_at) {
      throw new BadRequestException(
        "Bài thi này đã được nộp.",
      );
    }

    // ==========================================================
    // LẤY TOÀN BỘ CÂU HỎI
    // ==========================================================

    const groups =
      await this.prisma.question_groups.findMany({
        where: {
          test_id:
            attempt.test_id,
        },

        orderBy: [
          {
            part: "asc",
          },
          {
            display_order: "asc",
          },
        ],

        include: {
          questions: {
            orderBy: [
              {
                question_number:
                  "asc",
              },
              {
                display_order:
                  "asc",
              },
            ],

            include: {
              options: true,
            },
          },
        },
      });

    const allQuestions =
      groups.flatMap(
        (group) =>
          group.questions.map(
            (question) => ({
              ...question,

              part:
                group.part ?? 0,
            }),
          ),
      );

    if (allQuestions.length === 0) {
      throw new BadRequestException(
        "Đề thi không có câu hỏi.",
      );
    }

    // ==========================================================
    // MAP ANSWERS
    // ==========================================================

    const answerMap =
      new Map<number, number>();

    for (const answer of answers) {
      if (
        Number.isInteger(
          answer.questionId,
        ) &&
        Number.isInteger(
          answer.optionId,
        )
      ) {
        answerMap.set(
          answer.questionId,
          answer.optionId,
        );
      }
    }

    // ==========================================================
    // CHẤM BÀI
    // ==========================================================

    let totalCorrect = 0;

    let listeningCorrect = 0;

    let readingCorrect = 0;

    for (const question of allQuestions) {
      const selectedOptionId =
        answerMap.get(
          question.id,
        );

      if (!selectedOptionId) {
        continue;
      }

      const selectedOption =
        question.options.find(
          (option) =>
            option.id ===
            selectedOptionId,
        );

      if (!selectedOption) {
        continue;
      }

      const correctAnswer =
        question.correct_answer
          ?.trim()
          .toUpperCase();

      const selectedAnswer =
        selectedOption.option_label
          ?.trim()
          .toUpperCase();

      if (
        !correctAnswer ||
        !selectedAnswer
      ) {
        continue;
      }

      if (
        selectedAnswer !==
        correctAnswer
      ) {
        continue;
      }

      totalCorrect++;

      if (
        question.part >= 1 &&
        question.part <= 4
      ) {
        listeningCorrect++;
      } else if (
        question.part >= 5 &&
        question.part <= 7
      ) {
        readingCorrect++;
      }
    }

    // ==========================================================
    // TOTAL LISTENING
    // ==========================================================

    const listeningTotal =
      allQuestions.filter(
        (question) =>
          question.part >= 1 &&
          question.part <= 4,
      ).length;

    // ==========================================================
    // TOTAL READING
    // ==========================================================

    const readingTotal =
      allQuestions.filter(
        (question) =>
          question.part >= 5 &&
          question.part <= 7,
      ).length;

    // ==========================================================
    // SCORE
    // ==========================================================

    const listeningScore =
      this.calculateToeicSectionScore(
        listeningCorrect,
        listeningTotal,
      );

    const readingScore =
      this.calculateToeicSectionScore(
        readingCorrect,
        readingTotal,
      );

    const totalScore =
      listeningScore +
      readingScore;

    const submittedAt =
      new Date();

    // ==========================================================
    // LƯU ANSWERS
    // ==========================================================

    const savedAnswers =
      answers.map(
        (answer) => ({
          questionId:
            answer.questionId,

          optionId:
            answer.optionId,
        }),
      );

    // ==========================================================
    // UPDATE ATTEMPT
    // ==========================================================

    const updated =
      await this.prisma.mock_test_attempts.update({
        where: {
          id: attempt.id,
        },

        data: {
          listening_score:
            listeningScore,

          reading_score:
            readingScore,

          total_score:
            totalScore,

          listening_correct:
            listeningCorrect,

          reading_correct:
            readingCorrect,

          total_correct:
            totalCorrect,

          submitted_at:
            submittedAt,

          answers:
            savedAnswers,
        },
      });

    return {
      attemptId:
        updated.id,

      testId:
        updated.test_id,

      listeningScore,

      readingScore,

      totalScore,

      listeningCorrect,

      readingCorrect,

      totalCorrect,

      listeningTotal,

      readingTotal,

      totalQuestions:
        allQuestions.length,

      submittedAt,
    };
  }

  // ============================================================
  // TÍNH ĐIỂM TOEIC
  // ============================================================

  private calculateToeicSectionScore(
    correct: number,
    total: number,
  ) {
    if (total <= 0) {
      return 5;
    }

    const ratio =
      correct / total;

    const score =
      Math.round(
        5 +
          ratio * 490,
      );

    return Math.min(
      495,
      Math.max(
        5,
        score,
      ),
    );
  }

  // ============================================================
  // LỊCH SỬ THI
  // GET /mock-test/history
  // ============================================================

  async getHistory(
    userId: number,
  ) {
    const attempts =
      await this.prisma.mock_test_attempts.findMany({
        where: {
          user_id: userId,
        },

        orderBy: {
          created_at:
            "desc",
        },

        include: {
          test: {
            select: {
              id: true,
              title: true,
              duration: true,
              total_questions:
                true,
            },
          },
        },
      });

    return attempts.map(
      (attempt) => ({
        id:
          attempt.id,

        testId:
          attempt.test_id,

        testTitle:
          attempt.test.title ??
          `TOEIC Test ${attempt.test.id}`,

        totalQuestions:
          attempt.test
            .total_questions ??
          200,

        totalScore:
          attempt.total_score,

        listeningScore:
          attempt.listening_score,

        readingScore:
          attempt.reading_score,

        listeningCorrect:
          attempt.listening_correct,

        readingCorrect:
          attempt.reading_correct,

        totalCorrect:
          attempt.total_correct,

        startedAt:
          attempt.started_at,

        submittedAt:
          attempt.submitted_at,

        createdAt:
          attempt.created_at,
      }),
    );
  }

  // ============================================================
  // CHI TIẾT ATTEMPT
  //
  // API NÀY DÙNG KHI ĐANG THI / XEM LẠI BÀI
  //
  // KHÔNG TRẢ ĐÁP ÁN ĐÚNG
  // ============================================================

  async getAttempt(
    userId: number,
    attemptId: number,
  ) {
    const attempt =
      await this.prisma.mock_test_attempts.findFirst({
        where: {
          id:
            attemptId,

          user_id:
            userId,
        },

        include: {
          test: {
            select: {
              id: true,
              title: true,
              duration: true,
              total_questions:
                true,
            },
          },
        },
      });

    if (!attempt) {
      throw new NotFoundException(
        "Không tìm thấy lần thi.",
      );
    }

    const groups =
      await this.prisma.question_groups.findMany({
        where: {
          test_id:
            attempt.test_id,
        },

        orderBy: [
          {
            part: "asc",
          },

          {
            display_order:
              "asc",
          },
        ],

        include: {
          questions: {
            orderBy: [
              {
                question_number:
                  "asc",
              },

              {
                display_order:
                  "asc",
              },
            ],

            include: {
              options: {
                orderBy: {
                  display_order:
                    "asc",
                },

                select: {
                  id: true,
                  option_label:
                    true,
                  option_text:
                    true,
                },
              },
            },
          },
        },
      });

    const questions =
      groups.flatMap(
        (group) =>
          group.questions.map(
            (question) => ({
              id:
                question.id,

              questionNumber:
                question.question_number,

              questionText:
                question.question_text,

              part:
                group.part ?? 0,

              groupId:
                group.id,

              groupTitle:
                group.title,

              passage:
                group.passage,

              imageUrl:
                group.image_url,

              audioUrl:
                group.audio_url,

              groupType:
                group.group_type,

              audioStartTime:
                group.audio_start_time,

              audioEndTime:
                group.audio_end_time,

              options:
                question.options.map(
                  (option) => ({
                    id:
                      option.id,

                    label:
                      option.option_label,

                    text:
                      group.part === 1 ||
                      group.part === 2
                        ? null
                        : option.option_text,
                  }),
                ),
            }),
          ),
      );

    return {
      id:
        attempt.id,

      testId:
        attempt.test_id,

      testTitle:
        attempt.test.title ??
        `TOEIC Test ${attempt.test.id}`,

      duration:
        attempt.test.duration ??
        120,

      totalQuestions:
        attempt.test
          .total_questions ??
        questions.length,

      listeningScore:
        attempt.listening_score,

      readingScore:
        attempt.reading_score,

      totalScore:
        attempt.total_score,

      listeningCorrect:
        attempt.listening_correct,

      readingCorrect:
        attempt.reading_correct,

      totalCorrect:
        attempt.total_correct,

      startedAt:
        attempt.started_at,

      submittedAt:
        attempt.submitted_at,

      answers:
        Array.isArray(
          attempt.answers,
        )
          ? attempt.answers
          : [],

      questions,
    };
  }

  // ============================================================
  // KẾT QUẢ CHI TIẾT
  //
  // GET /mock-test/result/:attemptId
  //
  // CHỈ CHO PHÉP XEM SAU KHI ĐÃ NỘP
  //
  // TRẢ:
  // - toàn bộ 200 câu
  // - đáp án user chọn
  // - đáp án đúng
  // - đúng / sai
  // - options
  // - passage
  // - image
  // - audio
  // ============================================================

  async getResult(
    userId: number,
    attemptId: number,
  ) {
    // ==========================================================
    // LẤY ATTEMPT
    // ==========================================================

    const attempt =
      await this.prisma.mock_test_attempts.findFirst({
        where: {
          id:
            attemptId,

          user_id:
            userId,
        },

        include: {
          test: {
            select: {
              id: true,

              title: true,

              duration: true,

              total_questions:
                true,
            },
          },
        },
      });

    if (!attempt) {
      throw new NotFoundException(
        "Không tìm thấy lần thi.",
      );
    }

    // ==========================================================
    // CHƯA NỘP
    // ==========================================================

    if (!attempt.submitted_at) {
      throw new BadRequestException(
        "Bài thi chưa được nộp nên chưa có kết quả.",
      );
    }

    // ==========================================================
    // LẤY QUESTIONS + ĐÁP ÁN ĐÚNG
    // ==========================================================

    const groups =
      await this.prisma.question_groups.findMany({
        where: {
          test_id:
            attempt.test_id,
        },

        orderBy: [
          {
            part: "asc",
          },

          {
            display_order:
              "asc",
          },
        ],

        include: {
          questions: {
            orderBy: [
              {
                question_number:
                  "asc",
              },

              {
                display_order:
                  "asc",
              },
            ],

            include: {
              options: {
                orderBy: {
                  display_order:
                    "asc",
                },

                select: {
                  id: true,

                  option_label:
                    true,

                  option_text:
                    true,
                },
              },
            },
          },
        },
      });

    // ==========================================================
    // USER ANSWERS
    // ==========================================================

    const savedAnswers =
      Array.isArray(
        attempt.answers,
      )
        ? (attempt.answers as Array<{
            questionId?: unknown;
            optionId?: unknown;
          }>)
        : [];

    const answerMap =
      new Map<number, number>();

    for (const answer of savedAnswers) {
      const questionId =
        Number(
          answer?.questionId,
        );

      const optionId =
        Number(
          answer?.optionId,
        );

      if (
        Number.isInteger(
          questionId,
        ) &&
        questionId > 0 &&
        Number.isInteger(
          optionId,
        ) &&
        optionId > 0
      ) {
        answerMap.set(
          questionId,
          optionId,
        );
      }
    }

    // ==========================================================
    // FORMAT QUESTIONS
    // ==========================================================

    const questions =
      groups.flatMap(
        (group) =>
          group.questions.map(
            (question) => {
              const selectedOptionId =
                answerMap.get(
                  question.id,
                ) ?? null;

              const correctAnswer =
                question.correct_answer
                  ?.trim()
                  .toUpperCase() ??
                null;

              const correctOption =
                question.options.find(
                  (option) =>
                    option.option_label
                      ?.trim()
                      .toUpperCase() ===
                    correctAnswer,
                );

              const correctOptionId =
                correctOption?.id ??
                null;

              const isCorrect =
                selectedOptionId !==
                  null &&
                correctOptionId !==
                  null &&
                selectedOptionId ===
                  correctOptionId;

              return {
                id:
                  question.id,

                questionNumber:
                  question.question_number,

                questionText:
                  question.question_text,

                part:
                  group.part ?? 0,

                groupId:
                  group.id,

                groupTitle:
                  group.title,

                passage:
                  group.passage,

                imageUrl:
                  group.image_url,

                audioUrl:
                  group.audio_url,

                groupType:
                  group.group_type,

                audioStartTime:
                  group.audio_start_time,

                audioEndTime:
                  group.audio_end_time,

                // ==================================================
                // ĐÁP ÁN USER CHỌN
                // ==================================================

                selectedOptionId,

                // ==================================================
                // ĐÁP ÁN ĐÚNG
                // ==================================================

                correctOptionId,

                correctAnswer,

                // ==================================================
                // KẾT QUẢ
                // ==================================================

                isCorrect,

                explanation: question.explanation,

                isAnswered:
                  selectedOptionId !==
                  null,

                // ==================================================
                // OPTIONS
                // ==================================================

                options:
                  question.options.map(
                    (option) => ({
                      id:
                        option.id,

                      label:
                        option.option_label,

                      text:
                        option.option_text,

                      isSelected:
                        selectedOptionId ===
                        option.id,

                      isCorrect:
                        correctOptionId ===
                        option.id,
                    }),
                  ),
              };
            },
          ),
      );

    // ==========================================================
    // THỐNG KÊ
    // ==========================================================

    const totalQuestions =
      questions.length;

    const totalCorrect =
      questions.filter(
        (question) =>
          question.isCorrect,
      ).length;

    const totalAnswered =
      questions.filter(
        (question) =>
          question.isAnswered,
      ).length;

    const totalWrong =
      questions.filter(
        (question) =>
          question.isAnswered &&
          !question.isCorrect,
      ).length;

    const unanswered =
      questions.filter(
        (question) =>
          !question.isAnswered,
      ).length;

    // ==========================================================
    // THỐNG KÊ THEO PART
    // ==========================================================

    const partStats: Record<
      number,
      {
        total: number;
        correct: number;
        wrong: number;
        unanswered: number;
      }
    > = {};

    for (let part = 1; part <= 7; part++) {
      const partQuestions =
        questions.filter(
          (question) =>
            question.part ===
            part,
        );

      partStats[part] = {
        total:
          partQuestions.length,

        correct:
          partQuestions.filter(
            (question) =>
              question.isCorrect,
          ).length,

        wrong:
          partQuestions.filter(
            (question) =>
              question.isAnswered &&
              !question.isCorrect,
          ).length,

        unanswered:
          partQuestions.filter(
            (question) =>
              !question.isAnswered,
          ).length,
      };
    }

    // ==========================================================
    // PERCENTILE & PERFORMANCE COMPARISON
    // ==========================================================

    const score = attempt.total_score ?? 0;
    let percentileRanking = 50;
    if (score >= 950) percentileRanking = 99;
    else if (score >= 900) percentileRanking = 96;
    else if (score >= 850) percentileRanking = 90;
    else if (score >= 800) percentileRanking = 83;
    else if (score >= 750) percentileRanking = 75;
    else if (score >= 700) percentileRanking = 66;
    else if (score >= 600) percentileRanking = 52;
    else if (score >= 500) percentileRanking = 38;
    else if (score >= 400) percentileRanking = 25;
    else percentileRanking = 15;

    const performanceComparison = {
      systemAverage: 615,
      userDelta: score - 615,
      targetScore: 850,
      targetDelta: score - 850,
    };

    // ==========================================================
    // RESPONSE
    // ==========================================================

    return {
      attemptId:
        attempt.id,

      testId:
        attempt.test_id,

      testTitle:
        attempt.test.title ??
        `TOEIC Test ${attempt.test.id}`,

      duration:
        attempt.test.duration ??
        120,

      totalQuestions,

      listeningTotal:
        questions.filter(
          (question) =>
            question.part >= 1 &&
            question.part <= 4,
        ).length,

      readingTotal:
        questions.filter(
          (question) =>
            question.part >= 5 &&
            question.part <= 7,
        ).length,

      listeningCorrect:
        attempt.listening_correct ??
        0,

      readingCorrect:
        attempt.reading_correct ??
        0,

      totalCorrect:
        attempt.total_correct ??
        totalCorrect,

      totalAnswered,

      totalWrong,

      unanswered,

      listeningScore:
        attempt.listening_score ??
        0,

      readingScore:
        attempt.reading_score ??
        0,

      totalScore:
        attempt.total_score ??
        0,

      percentileRanking,

      performanceComparison,

      startedAt:
        attempt.started_at,

      submittedAt:
        attempt.submitted_at,

      partStats,

      questions: questions.map((q) => ({
        ...q,
        transcript: q.part <= 4 ? (q.passage || "Audio transcript TOEIC Listening") : null,
        evidence: q.part >= 5 ? (q.explanation || "Bằng chứng ngữ cảnh trong bài đọc.") : null,
      })),
    };
  }

  // ============================================================
  // THÔNG TIN TEST
  // GET /mock-test/test/:testId
  // ============================================================

  async getTest(
    testId: number,
  ) {
    const test =
      await this.prisma.tests.findUnique({
        where: {
          id: testId,
        },

        select: {
          id: true,

          title: true,

          duration: true,

          total_questions:
            true,

          description: true,

          is_active: true,
        },
      });

    if (!test) {
      throw new NotFoundException(
        "Không tìm thấy đề thi.",
      );
    }

    return test;
  }

  // ============================================================
  // FULL TEST (STANDARD / CUSTOM 200 CÂU)
  // ============================================================

  async startCustomFullTest(
    userId: number,
    dto: {
      testId?: number;
      mode?: "standard" | "custom";
      parts?: number[];
      listeningDuration?: number;
      readingDuration?: number;
      totalQuestions?: number;
    },
  ) {
    const mode = dto.mode || "standard";
    const selectedParts = dto.parts && dto.parts.length > 0 ? dto.parts : [1, 2, 3, 4, 5, 6, 7];
    const listeningDuration = dto.listeningDuration || 45;
    const readingDuration = dto.readingDuration || 75;

    let targetTestId = dto.testId;
    if (!targetTestId) {
      const activeTest = await this.prisma.tests.findFirst({
        where: { is_active: true },
        select: { id: true },
      });
      targetTestId = activeTest?.id;
    }

    if (!targetTestId) {
      throw new NotFoundException("Không tìm thấy đề thi khả dụng.");
    }

    const test = await this.prisma.tests.findUnique({
      where: { id: targetTestId },
      include: {
        question_groups: {
          where: mode === "custom" ? { part: { in: selectedParts } } : {},
          orderBy: [{ part: "asc" }, { display_order: "asc" }],
          include: {
            questions: {
              orderBy: [{ question_number: "asc" }, { display_order: "asc" }],
              include: {
                options: {
                  orderBy: { display_order: "asc" },
                  select: {
                    id: true,
                    option_label: true,
                    option_text: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!test) {
      throw new NotFoundException("Không tìm thấy đề thi.");
    }

    const questions = test.question_groups.flatMap((group) =>
      group.questions.map((question) => ({
        id: question.id,
        questionNumber: question.question_number,
        questionText: question.question_text,
        part: group.part ?? 0,
        groupId: group.id,
        groupTitle: group.title,
        passage: group.passage,
        imageUrl: group.image_url,
        audioUrl: group.audio_url,
        groupType: group.group_type,
        audioStartTime: group.audio_start_time,
        audioEndTime: group.audio_end_time,
        options: question.options.map((opt) => ({
          id: opt.id,
          label: opt.option_label,
          text: opt.option_text,
        })),
      })),
    );

    const attempt = await this.prisma.mock_test_attempts.create({
      data: {
        user_id: userId,
        test_id: test.id,
        started_at: new Date(),
        answers: {},
      },
    });

    return {
      attemptId: attempt.id,
      testId: test.id,
      testTitle: test.title ?? `TOEIC Full Test ${test.id}`,
      mode,
      duration: listeningDuration + readingDuration,
      listeningDuration,
      readingDuration,
      totalQuestions: questions.length,
      startedAt: attempt.started_at,
      selectedParts,
      questions,
    };
  }

  // ============================================================
  // MINI TEST (50 CÂU)
  // ============================================================

  private shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  async startMiniTest(
    userId: number,
    dto: {
      parts?: number[];
      timeLimitMinutes?: number;
      totalQuestions?: number;
      testId?: number;
    },
  ) {
    const selectedParts = dto.parts && dto.parts.length > 0 ? dto.parts : [1, 2, 3, 4, 5, 6, 7];
    const totalCount = dto.totalQuestions || 50;
    const timeLimitMinutes = dto.timeLimitMinutes || 45;

    let targetTestId = dto.testId;
    if (!targetTestId) {
      const activeTest = await this.prisma.tests.findFirst({
        where: { is_active: true },
        select: { id: true },
      });
      targetTestId = activeTest?.id;
    }

    const whereGroup: any = {
      part: { in: selectedParts },
    };
    if (targetTestId) {
      whereGroup.test_id = targetTestId;
    }

    const groups = await this.prisma.question_groups.findMany({
      where: whereGroup,
      include: {
        questions: {
          include: {
            options: {
              orderBy: { display_order: "asc" },
            },
          },
          orderBy: { question_number: "asc" },
        },
      },
      orderBy: [{ part: "asc" }, { display_order: "asc" }],
    });

    const allQuestions: any[] = [];
    for (const g of groups) {
      for (const q of g.questions) {
        allQuestions.push({
          id: q.id,
          groupId: g.id,
          part: g.part || 5,
          title: g.title,
          passage: g.passage,
          imageUrl: g.image_url,
          audioUrl: g.audio_url,
          audioStartTime: g.audio_start_time,
          audioEndTime: g.audio_end_time,
          questionNumber: q.question_number,
          questionText: q.question_text,
          options: q.options.map((opt) => ({
            id: opt.id,
            label: opt.option_label || "",
            text: opt.option_text || "",
          })),
        });
      }
    }

    let finalQuestions: any[] = [];
    const questionsByPart: Record<number, any[]> = {};
    for (const part of selectedParts) {
      questionsByPart[part] = allQuestions.filter((q) => q.part === part);
    }

    const perPartTarget = Math.max(1, Math.floor(totalCount / selectedParts.length));
    for (const part of selectedParts) {
      const partPool = questionsByPart[part] || [];
      const shuffledPart = this.shuffle(partPool);
      finalQuestions.push(...shuffledPart.slice(0, perPartTarget));
    }

    if (finalQuestions.length < totalCount) {
      const existingIds = new Set(finalQuestions.map((q) => q.id));
      const remaining = allQuestions.filter((q) => !existingIds.has(q.id));
      const shuffledRemaining = this.shuffle(remaining);
      finalQuestions.push(...shuffledRemaining.slice(0, totalCount - finalQuestions.length));
    }

    finalQuestions.sort((a, b) => a.part - b.part || a.id - b.id);
    finalQuestions = finalQuestions.map((q, idx) => ({
      ...q,
      testQuestionNumber: idx + 1,
    }));

    return {
      success: true,
      testTitle: "TOEIC Mini Test (50 câu)",
      totalQuestions: finalQuestions.length,
      timeLimitMinutes,
      timeLimitSeconds: timeLimitMinutes * 60,
      selectedParts,
      questions: finalQuestions,
    };
  }

  async submitMiniTest(
    userId: number,
    dto: {
      answers: Array<{ questionId: number; optionId: number }>;
      durationSeconds?: number;
      partTimes?: Record<number, number>;
      markedQuestionIds?: number[];
    },
  ) {
    const questionIds = dto.answers.map((a) => a.questionId);
    const questions = await this.prisma.questions.findMany({
      where: { id: { in: questionIds } },
      include: {
        options: true,
        question_groups: true,
      },
    });

    const answerMap = new Map(dto.answers.map((a) => [a.questionId, a.optionId]));

    let correctCount = 0;
    let listeningCorrect = 0;
    let listeningTotal = 0;
    let readingCorrect = 0;
    let readingTotal = 0;

    const partStatsMap: Record<number, { correct: number; total: number; timeSeconds: number }> = {};
    for (let p = 1; p <= 7; p++) {
      partStatsMap[p] = { correct: 0, total: 0, timeSeconds: dto.partTimes?.[p] || 0 };
    }

    const results: any[] = [];
    const incorrectQuestions: any[] = [];

    for (const q of questions) {
      const selectedOptionId = answerMap.get(q.id);
      const correctOption = q.options.find((o) => o.is_correct);
      const selectedOption = q.options.find((o) => o.id === selectedOptionId);
      const isCorrect = !!(selectedOption && selectedOption.is_correct);
      const part = q.question_groups?.part || 5;

      if (!partStatsMap[part]) {
        partStatsMap[part] = { correct: 0, total: 0, timeSeconds: 0 };
      }
      partStatsMap[part].total++;
      if (isCorrect) {
        partStatsMap[part].correct++;
        correctCount++;
      }

      if (part <= 4) {
        listeningTotal++;
        if (isCorrect) listeningCorrect++;
      } else {
        readingTotal++;
        if (isCorrect) readingCorrect++;
      }

      const itemResult = {
        questionId: q.id,
        part,
        passage: q.question_groups?.passage || null,
        imageUrl: q.question_groups?.image_url || null,
        audioUrl: q.question_groups?.audio_url || null,
        questionText: q.question_text,
        selectedOptionId: selectedOptionId || null,
        selectedLabel: selectedOption?.option_label || "",
        selectedText: selectedOption?.option_text || "",
        correctOptionId: correctOption?.id || 0,
        correctLabel: correctOption?.option_label || "",
        correctText: correctOption?.option_text || "",
        isCorrect,
        explanation: q.explanation || "Xem lại ngữ cảnh và thông tin liên quan trong bài thi.",
        options: q.options.map((o) => ({
          id: o.id,
          label: o.option_label,
          text: o.option_text,
          isCorrect: !!o.is_correct,
        })),
      };

      results.push(itemResult);
      if (!isCorrect) {
        incorrectQuestions.push(itemResult);
      }
    }

    const listeningScale = listeningTotal > 0 ? Math.round((listeningCorrect / listeningTotal) * 495) : 0;
    const readingScale = readingTotal > 0 ? Math.round((readingCorrect / readingTotal) * 495) : 0;
    const totalScore = Math.min(990, Math.max(10, listeningScale + readingScale));
    const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

    const partBreakdown = Object.entries(partStatsMap)
      .filter(([_, st]) => st.total > 0)
      .map(([partNum, st]) => ({
        part: Number(partNum),
        name: `Part ${partNum}`,
        correct: st.correct,
        total: st.total,
        accuracy: Math.round((st.correct / st.total) * 100),
        timeSeconds: st.timeSeconds,
        avgSecondsPerQuestion: st.total > 0 ? Math.round(st.timeSeconds / st.total) : 0,
      }));

    return {
      success: true,
      totalQuestions: questions.length,
      correctCount,
      incorrectCount: questions.length - correctCount,
      accuracy,
      listeningScore: listeningScale,
      readingScore: readingScale,
      totalScore,
      durationSeconds: dto.durationSeconds || 0,
      partBreakdown,
      results,
      incorrectQuestions,
    };
  }
}