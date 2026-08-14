import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PracticeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy câu hỏi cho luyện tập theo Part
   * - Giữ nguyên quan hệ question_group cho Part 3, 4, 7
   * - Có thể random theo request
   */
  async getPracticeQuestions(userId: number, part: number, questionCount?: number, random: boolean = false) {
    if (part < 1 || part > 7) {
      throw new BadRequestException('Part phải từ 1 đến 7');
    }

    const validQuestionCount = questionCount ? Math.min(Math.max(questionCount, 1), 50) : 10;

    // Lấy question groups theo part
    const questionGroups = await this.prisma.question_groups.findMany({
      where: {
        part,
        test_id: { not: null }, // Chỉ lấy từ full test
      },
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
    });

    if (questionGroups.length === 0) {
      throw new NotFoundException(`Không tìm thấy câu hỏi Part ${part}`);
    }

    // Tính toán số lượng question groups cần lấy
    let selectedGroups = questionGroups;

    if (random) {
      // Random groups nhưng giữ nguyên câu hỏi trong mỗi group
      selectedGroups = this.shuffleArray([...questionGroups]);
    }

    // Lấy câu hỏi từ các groups đã chọn
    let allQuestions: any[] = [];
    for (const group of selectedGroups) {
      allQuestions = allQuestions.concat(group.questions);
    }

    // Nếu cần random câu hỏi (chỉ áp dụng cho Part 1, 2, 5, 6)
    if (random && [1, 2, 5, 6].includes(part)) {
      allQuestions = this.shuffleArray(allQuestions);
    }

    // Giới hạn số lượng câu hỏi
    const selectedQuestions = allQuestions.slice(0, validQuestionCount);

    // Tạo practice session
    const session = await this.prisma.practice_sessions.create({
      data: {
        user_id: userId,
        part,
        question_count: selectedQuestions.length,
        correct_count: 0,
        score: 0,
        started_at: new Date(),
        question_ids: selectedQuestions.map(q => q.id),
        answers: {},
      },
    });

    return {
      sessionId: session.id,
      part,
      questionCount: selectedQuestions.length,
      questions: selectedQuestions.map(q => ({
        id: q.id,
        question_number: q.question_number,
        question_text: q.question_text,
        group_id: q.group_id,
        options: q.options.map(opt => ({
          id: opt.id,
          option_label: opt.option_label,
          option_text: opt.option_text,
        })),
        // Không trả về correct_answer cho người dùng
      })),
    };
  }

  /**
   * Nộp bài luyện tập
   */
  async submitPractice(userId: number, sessionId: number, answers: Record<number, string>) {
    const session = await this.prisma.practice_sessions.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Không tìm thấy session luyện tập');
    }

    if (session.user_id !== userId) {
      throw new BadRequestException('Bạn không có quyền nộp bài này');
    }

    if (session.completed_at) {
      throw new BadRequestException('Bài này đã được nộp rồi');
    }

    // Lấy đáp án đúng
    const questions = await this.prisma.questions.findMany({
      where: {
        id: { in: session.question_ids },
      },
      select: {
        id: true,
        correct_answer: true,
      },
    });

    // Tính điểm
    let correctCount = 0;
    const questionAnswers: Record<number, { userAnswer: string; correctAnswer: string; isCorrect: boolean }> = {};

    for (const question of questions) {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer?.toUpperCase() === question.correct_answer?.toUpperCase();
      
      if (isCorrect) {
        correctCount++;
      }

      questionAnswers[question.id] = {
        userAnswer: userAnswer || '',
        correctAnswer: question.correct_answer || '',
        isCorrect,
      };
    }

    const score = Math.round((correctCount / session.question_count) * 100);

    // Cập nhật session
    const updatedSession = await this.prisma.practice_sessions.update({
      where: { id: sessionId },
      data: {
        correct_count: correctCount,
        score,
        completed_at: new Date(),
        answers: questionAnswers,
      },
    });

    return {
      sessionId: updatedSession.id,
      part: updatedSession.part,
      questionCount: updatedSession.question_count,
      correctCount,
      score,
      completedAt: updatedSession.completed_at,
      answers: questionAnswers,
    };
  }

  /**
   * Lấy lịch sử luyện tập
   */
  async getPracticeHistory(userId: number, part?: number) {
    const where: any = { user_id: userId };
    if (part) {
      where.part = part;
    }

    const sessions = await this.prisma.practice_sessions.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: 50,
    });

    return sessions.map(session => ({
      id: session.id,
      part: session.part,
      questionCount: session.question_count,
      correctCount: session.correct_count,
      score: session.score,
      startedAt: session.started_at,
      completedAt: session.completed_at,
    }));
  }

  /**
   * Lấy chi tiết một session luyện tập
   */
  async getPracticeSession(userId: number, sessionId: number) {
    const session = await this.prisma.practice_sessions.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Không tìm thấy session luyện tập');
    }

    if (session.user_id !== userId) {
      throw new BadRequestException('Bạn không có quyền xem session này');
    }

    // Lấy chi tiết câu hỏi và đáp án
    const questions = await this.prisma.questions.findMany({
      where: {
        id: { in: session.question_ids },
      },
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
    });

    return {
      session: {
        id: session.id,
        part: session.part,
        questionCount: session.question_count,
        correctCount: session.correct_count,
        score: session.score,
        startedAt: session.started_at,
        completedAt: session.completed_at,
      },
      questions: questions.map(q => ({
        id: q.id,
        question_number: q.question_number,
        question_text: q.question_text,
        group: q.question_groups,
        options: q.options.map(opt => ({
          id: opt.id,
          option_label: opt.option_label,
          option_text: opt.option_text,
        })),
        explanation: q.explanation,
        // Thêm thông tin đáp án từ session.answers
        userAnswer: (session.answers as any)?.[q.id]?.userAnswer,
        correctAnswer: (session.answers as any)?.[q.id]?.correctAnswer,
        isCorrect: (session.answers as any)?.[q.id]?.isCorrect,
      })),
    };
  }

  /**
   * Shuffle array (Fisher-Yates)
   */
  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}