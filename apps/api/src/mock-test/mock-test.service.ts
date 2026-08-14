import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MockTestService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách full test có sẵn
   */
  async getAvailableTests() {
    const tests = await this.prisma.tests.findMany({
      where: {
        is_active: true,
        total_questions: 200, // Chỉ lấy full test
      },
      orderBy: {
        created_at: 'desc',
      },
      select: {
        id: true,
        title: true,
        description: true,
        duration: true,
        total_questions: true,
        created_at: true,
        _count: {
          select: {
            question_groups: true,
          },
        },
      },
    });

    return tests.map(test => ({
      id: test.id,
      title: test.title,
      description: test.description,
      duration: test.duration,
      totalQuestions: test.total_questions,
      createdAt: test.created_at,
      questionGroupsCount: test._count.question_groups,
    }));
  }

  /**
   * Bắt đầu full test - lấy nguyên đề
   */
  async startFullTest(userId: number, testId: number) {
    const test = await this.prisma.tests.findUnique({
      where: { id: testId },
      include: {
        question_groups: {
          include: {
            questions: {
              include: {
                options: {
                  orderBy: { display_order: 'asc' },
                },
              },
              orderBy: { display_order: 'asc' },
            },
          },
          orderBy: { display_order: 'asc' },
        },
      },
    });

    if (!test) {
      throw new NotFoundException('Không tìm thấy đề thi');
    }

    if (!test.is_active) {
      throw new BadRequestException('Đề thi này chưa được kích hoạt');
    }

    // Kiểm tra xem user đã làm đề này chưa
    const existingAttempt = await this.prisma.mock_test_attempts.findFirst({
      where: {
        user_id: userId,
        test_id: testId,
        submitted_at: null, // Chỉ kiểm tra những đề đang làm
      },
    });

    if (existingAttempt) {
      // Trả về attempt đang làm
      return {
        attemptId: existingAttempt.id,
        testId: test.id,
        title: test.title,
        duration: test.duration,
        totalQuestions: test.total_questions,
        startedAt: existingAttempt.started_at,
        status: 'in_progress',
      };
    }

    // Tạo attempt mới
    const attempt = await this.prisma.mock_test_attempts.create({
      data: {
        user_id: userId,
        test_id: testId,
        started_at: new Date(),
        answers: {},
      },
    });

    // Tổ chức câu hỏi theo thứ tự Part
    const organizedQuestions = this.organizeQuestionsByPart(test.question_groups);

    return {
      attemptId: attempt.id,
      testId: test.id,
      title: test.title,
      description: test.description,
      duration: test.duration,
      totalQuestions: test.total_questions,
      startedAt: attempt.started_at,
      status: 'started',
      questions: organizedQuestions,
    };
  }

  /**
   * Nộp bài full test
   */
  async submitFullTest(userId: number, attemptId: number, answers: Record<number, string>) {
    const attempt = await this.prisma.mock_test_attempts.findUnique({
      where: { id: attemptId },
      include: {
        test: {
          include: {
            question_groups: {
              include: {
                questions: {
                  select: {
                    id: true,
                    correct_answer: true,
                    group_id: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Không tìm thấy lần thi');
    }

    if (attempt.user_id !== userId) {
      throw new BadRequestException('Bạn không có quyền nộp bài này');
    }

    if (attempt.submitted_at) {
      throw new BadRequestException('Bài này đã được nộp rồi');
    }

    // Tính điểm
    let listeningCorrect = 0;
    let readingCorrect = 0;
    let totalCorrect = 0;

    const questionAnswers: Record<number, { userAnswer: string; correctAnswer: string; isCorrect: boolean }> = {};

    for (const group of attempt.test.question_groups) {
      const isListening = group.part && group.part >= 1 && group.part <= 4;
      
      for (const question of group.questions) {
        const userAnswer = answers[question.id];
        const isCorrect = userAnswer?.toUpperCase() === question.correct_answer?.toUpperCase();
        
        if (isCorrect) {
          totalCorrect++;
          if (isListening) {
            listeningCorrect++;
          } else {
            readingCorrect++;
          }
        }

        questionAnswers[question.id] = {
          userAnswer: userAnswer || '',
          correctAnswer: question.correct_answer || '',
          isCorrect,
        };
      }
    }

    // Tính điểm TOEIC (Listening: 495, Reading: 495, Total: 990)
    const listeningScore = Math.round((listeningCorrect / 100) * 495);
    const readingScore = Math.round((readingCorrect / 100) * 495);
    const totalScore = listeningScore + readingScore;

    // Cập nhật attempt
    const updatedAttempt = await this.prisma.mock_test_attempts.update({
      where: { id: attemptId },
      data: {
        listening_score: listeningScore,
        reading_score: readingScore,
        total_score: totalScore,
        listening_correct: listeningCorrect,
        reading_correct: readingCorrect,
        total_correct: totalCorrect,
        submitted_at: new Date(),
        answers: questionAnswers,
      },
    });

    return {
      attemptId: updatedAttempt.id,
      testId: updatedAttempt.test_id,
      listeningScore: updatedAttempt.listening_score,
      readingScore: updatedAttempt.reading_score,
      totalScore: updatedAttempt.total_score,
      listeningCorrect: updatedAttempt.listening_correct,
      readingCorrect: updatedAttempt.reading_correct,
      totalCorrect: updatedAttempt.total_correct,
      submittedAt: updatedAttempt.submitted_at,
      answers: questionAnswers,
    };
  }

  /**
   * Lấy lịch sử thi thử
   */
  async getTestHistory(userId: number) {
    const attempts = await this.prisma.mock_test_attempts.findMany({
      where: { user_id: userId },
      include: {
        test: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: 50,
    });

    return attempts.map(attempt => ({
      id: attempt.id,
      testId: attempt.test_id,
      testTitle: attempt.test.title,
      totalScore: attempt.total_score,
      listeningScore: attempt.listening_score,
      readingScore: attempt.reading_score,
      totalCorrect: attempt.total_correct,
      listeningCorrect: attempt.listening_correct,
      readingCorrect: attempt.reading_correct,
      startedAt: attempt.started_at,
      submittedAt: attempt.submitted_at,
      isCompleted: attempt.submitted_at !== null,
    }));
  }

  /**
   * Lấy chi tiết một lần thi
   */
  async getTestAttempt(userId: number, attemptId: number) {
    const attempt = await this.prisma.mock_test_attempts.findUnique({
      where: { id: attemptId },
      include: {
        test: {
          include: {
            question_groups: {
              include: {
                questions: {
                  include: {
                    options: {
                      orderBy: { display_order: 'asc' },
                    },
                    question_groups: {
                      select: {
                        id: true,
                        part: true,
                        title: true,
                        passage: true,
                        audio_url: true,
                        image_url: true,
                      },
                    },
                  },
                  orderBy: { display_order: 'asc' },
                },
              },
              orderBy: { display_order: 'asc' },
            },
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Không tìm thấy lần thi');
    }

    if (attempt.user_id !== userId) {
      throw new BadRequestException('Bạn không có quyền xem lần thi này');
    }

    const organizedQuestions = this.organizeQuestionsByPart(attempt.test.question_groups);

    return {
      attempt: {
        id: attempt.id,
        testId: attempt.test_id,
        testTitle: attempt.test.title,
        totalScore: attempt.total_score,
        listeningScore: attempt.listening_score,
        readingScore: attempt.reading_score,
        totalCorrect: attempt.total_correct,
        listeningCorrect: attempt.listening_correct,
        readingCorrect: attempt.reading_correct,
        startedAt: attempt.started_at,
        submittedAt: attempt.submitted_at,
        isCompleted: attempt.submitted_at !== null,
      },
      questions: organizedQuestions.map(q => ({
        ...q,
        userAnswer: (attempt.answers as any)?.[q.id]?.userAnswer,
        correctAnswer: (attempt.answers as any)?.[q.id]?.correctAnswer,
        isCorrect: (attempt.answers as any)?.[q.id]?.isCorrect,
      })),
    };
  }

  /**
   * Tổ chức câu hỏi theo Part
   */
  private organizeQuestionsByPart(questionGroups: any[]) {
    const parts: Record<number, any[]> = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
    };

    for (const group of questionGroups) {
      if (group.part && parts[group.part]) {
        for (const question of group.questions) {
          parts[group.part].push({
            id: question.id,
            question_number: question.question_number,
            question_text: question.question_text,
            group_id: question.group_id,
            group: {
              id: group.id,
              part: group.part,
              title: group.title,
              passage: group.passage,
              audio_url: group.audio_url,
              image_url: group.image_url,
            },
            options: question.options.map((opt: any) => ({
              id: opt.id,
              option_label: opt.option_label,
              option_text: opt.option_text,
            })),
            explanation: question.explanation,
          });
        }
      }
    }

    // Flatten all questions maintaining part order
    const allQuestions: any[] = [];
    for (let part = 1; part <= 7; part++) {
      allQuestions.push(...parts[part]);
    }

    return allQuestions;
  }
}