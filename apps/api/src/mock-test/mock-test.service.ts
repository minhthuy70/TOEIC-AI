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

      startedAt:
        attempt.started_at,

      submittedAt:
        attempt.submitted_at,

      partStats,

      questions,
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
}