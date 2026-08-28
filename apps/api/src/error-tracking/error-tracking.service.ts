import { Injectable, OnModuleInit, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export class AddErrorLogDto {
  questionId?: number;
  questionText?: string;
  passage?: string;
  imageUrl?: string;
  audioUrl?: string;
  part!: number;
  userAnswer?: string;
  correctAnswer!: string;
  options?: any;
  explanation?: string;
  errorType?: "grammar" | "vocabulary" | "careless" | "timing";
  userNote?: string;
  sourceType?: string;
  sourceId?: number;
}

export class ErrorLogFilterQuery {
  errorType?: string;
  part?: number;
  dateRange?: string; // "7d" | "30d" | "90d" | "all"
  status?: string; // "active" | "resolved" | "all"
  search?: string;
  sortBy?: string; // "frequency" | "date"
  sortOrder?: "asc" | "desc";
}

@Injectable()
export class ErrorTrackingService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    // Ensure error_logs table exists
    try {
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS error_logs (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          question_id INTEGER,
          question_text TEXT,
          passage TEXT,
          image_url VARCHAR(500),
          audio_url VARCHAR(500),
          part SMALLINT NOT NULL DEFAULT 1,
          user_answer VARCHAR(50),
          correct_answer VARCHAR(50) NOT NULL,
          options JSONB,
          explanation TEXT,
          error_type VARCHAR(50) NOT NULL DEFAULT 'grammar',
          status VARCHAR(20) NOT NULL DEFAULT 'active',
          user_note TEXT,
          frequency INTEGER NOT NULL DEFAULT 1,
          last_occurred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          source_type VARCHAR(50) DEFAULT 'mock_test',
          source_id INTEGER
        );
        CREATE INDEX IF NOT EXISTS idx_error_logs_user ON error_logs(user_id);
        CREATE INDEX IF NOT EXISTS idx_error_logs_status ON error_logs(status);
        CREATE INDEX IF NOT EXISTS idx_error_logs_type ON error_logs(error_type);
        CREATE INDEX IF NOT EXISTS idx_error_logs_part ON error_logs(part);
      `);
    } catch (err) {
      console.error("Error creating error_logs table:", err);
    }
  }

  async getErrorLogs(userId: number, filters: ErrorLogFilterQuery = {}) {
    let whereConditions = [`user_id = ${userId}`];

    if (filters.errorType && filters.errorType !== "all") {
      whereConditions.push(`error_type = '${filters.errorType.replace(/'/g, "''")}'`);
    }

    if (filters.part && filters.part > 0) {
      whereConditions.push(`part = ${Number(filters.part)}`);
    }

    if (filters.status && filters.status !== "all") {
      whereConditions.push(`status = '${filters.status.replace(/'/g, "''")}'`);
    }

    if (filters.dateRange && filters.dateRange !== "all") {
      let days = 30;
      if (filters.dateRange === "7d") days = 7;
      if (filters.dateRange === "30d") days = 30;
      if (filters.dateRange === "90d") days = 90;
      whereConditions.push(`last_occurred_at >= NOW() - INTERVAL '${days} days'`);
    }

    if (filters.search && filters.search.trim()) {
      const escaped = filters.search.trim().replace(/'/g, "''");
      whereConditions.push(`(
        question_text ILIKE '%${escaped}%' OR 
        explanation ILIKE '%${escaped}%' OR 
        user_note ILIKE '%${escaped}%' OR 
        passage ILIKE '%${escaped}%'
      )`);
    }

    const whereClause = whereConditions.join(" AND ");

    // Sorting
    let orderBy = "last_occurred_at DESC";
    const sortOrder = filters.sortOrder === "asc" ? "ASC" : "DESC";

    if (filters.sortBy === "frequency") {
      orderBy = `frequency ${sortOrder}, last_occurred_at DESC`;
    } else if (filters.sortBy === "date") {
      orderBy = `last_occurred_at ${sortOrder}`;
    }

    // Fetch items
    const rawItems: any[] = await this.prisma.$queryRawUnsafe(`
      SELECT * FROM error_logs
      WHERE ${whereClause}
      ORDER BY ${orderBy}
    `);

    // Fetch stats for the user
    const statsQuery: any[] = await this.prisma.$queryRawUnsafe(`
      SELECT 
        COUNT(*)::int AS total,
        COUNT(CASE WHEN status = 'active' THEN 1 END)::int AS active,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END)::int AS resolved,
        COUNT(CASE WHEN error_type = 'grammar' THEN 1 END)::int AS grammar,
        COUNT(CASE WHEN error_type = 'vocabulary' THEN 1 END)::int AS vocabulary,
        COUNT(CASE WHEN error_type = 'careless' THEN 1 END)::int AS careless,
        COUNT(CASE WHEN error_type = 'timing' THEN 1 END)::int AS timing
      FROM error_logs
      WHERE user_id = ${userId}
    `);

    const stats = statsQuery[0] || {
      total: 0,
      active: 0,
      resolved: 0,
      grammar: 0,
      vocabulary: 0,
      careless: 0,
      timing: 0,
    };

    const total = Number(stats.total) || 0;
    const resolved = Number(stats.resolved) || 0;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    return {
      items: rawItems.map((item) => ({
        id: item.id,
        userId: item.user_id,
        questionId: item.question_id,
        questionText: item.question_text,
        passage: item.passage,
        imageUrl: item.image_url,
        audioUrl: item.audio_url,
        part: item.part,
        userAnswer: item.user_answer,
        correctAnswer: item.correct_answer,
        options: item.options,
        explanation: item.explanation,
        errorType: item.error_type,
        status: item.status,
        userNote: item.user_note,
        frequency: item.frequency,
        lastOccurredAt: item.last_occurred_at,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        sourceType: item.source_type,
        sourceId: item.source_id,
      })),
      stats: {
        total,
        active: Number(stats.active) || 0,
        resolved,
        resolutionRate,
        grammarCount: Number(stats.grammar) || 0,
        vocabularyCount: Number(stats.vocabulary) || 0,
        carelessCount: Number(stats.careless) || 0,
        timingCount: Number(stats.timing) || 0,
      },
    };
  }

  async getErrorLogDetail(userId: number, id: number) {
    const records: any[] = await this.prisma.$queryRawUnsafe(`
      SELECT * FROM error_logs
      WHERE id = ${id} AND user_id = ${userId}
      LIMIT 1
    `);

    if (records.length === 0) {
      throw new NotFoundException("Không tìm thấy bản ghi lỗi trong sổ tay của bạn.");
    }

    const item = records[0];
    return {
      id: item.id,
      userId: item.user_id,
      questionId: item.question_id,
      questionText: item.question_text,
      passage: item.passage,
      imageUrl: item.image_url,
      audioUrl: item.audio_url,
      part: item.part,
      userAnswer: item.user_answer,
      correctAnswer: item.correct_answer,
      options: item.options,
      explanation: item.explanation,
      errorType: item.error_type,
      status: item.status,
      userNote: item.user_note,
      frequency: item.frequency,
      lastOccurredAt: item.last_occurred_at,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      sourceType: item.source_type,
      sourceId: item.source_id,
    };
  }

  async addErrorLog(userId: number, dto: AddErrorLogDto) {
    if (!dto.correctAnswer) {
      throw new BadRequestException("Đáp án đúng là bắt buộc.");
    }

    const part = dto.part || 1;
    const errorType = dto.errorType || (part <= 4 ? "careless" : part <= 6 ? "grammar" : "vocabulary");
    const optionsJson = dto.options ? JSON.stringify(dto.options).replace(/'/g, "''") : "null";
    const questionText = dto.questionText ? `'${dto.questionText.replace(/'/g, "''")}'` : "NULL";
    const passage = dto.passage ? `'${dto.passage.replace(/'/g, "''")}'` : "NULL";
    const imageUrl = dto.imageUrl ? `'${dto.imageUrl.replace(/'/g, "''")}'` : "NULL";
    const audioUrl = dto.audioUrl ? `'${dto.audioUrl.replace(/'/g, "''")}'` : "NULL";
    const userAnswer = dto.userAnswer ? `'${dto.userAnswer.replace(/'/g, "''")}'` : "NULL";
    const correctAnswer = `'${dto.correctAnswer.replace(/'/g, "''")}'`;
    const explanation = dto.explanation ? `'${dto.explanation.replace(/'/g, "''")}'` : "NULL";
    const userNote = dto.userNote ? `'${dto.userNote.replace(/'/g, "''")}'` : "NULL";
    const sourceType = dto.sourceType ? `'${dto.sourceType.replace(/'/g, "''")}'` : "'mock_test'";
    const sourceId = dto.sourceId ? Number(dto.sourceId) : "NULL";
    const questionId = dto.questionId ? Number(dto.questionId) : "NULL";

    // Check if duplicate question already exists for user
    let existing: any[] = [];
    if (dto.questionId) {
      existing = await this.prisma.$queryRawUnsafe(`
        SELECT id, frequency FROM error_logs
        WHERE user_id = ${userId} AND question_id = ${dto.questionId}
        LIMIT 1
      `);
    } else if (dto.questionText) {
      existing = await this.prisma.$queryRawUnsafe(`
        SELECT id, frequency FROM error_logs
        WHERE user_id = ${userId} AND question_text = ${questionText}
        LIMIT 1
      `);
    }

    if (existing.length > 0) {
      const record = existing[0];
      await this.prisma.$executeRawUnsafe(`
        UPDATE error_logs
        SET 
          frequency = frequency + 1,
          last_occurred_at = CURRENT_TIMESTAMP,
          user_answer = ${userAnswer},
          status = 'active',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${record.id}
      `);

      return {
        success: true,
        message: "Đã cập nhật tần suất câu sai trong Sổ tay lỗi.",
        id: record.id,
        isExisting: true,
      };
    }

    // Insert new error record
    const result: any[] = await this.prisma.$queryRawUnsafe(`
      INSERT INTO error_logs (
        user_id, question_id, question_text, passage, image_url, audio_url,
        part, user_answer, correct_answer, options, explanation,
        error_type, status, user_note, frequency, last_occurred_at,
        source_type, source_id
      ) VALUES (
        ${userId}, ${questionId}, ${questionText}, ${passage}, ${imageUrl}, ${audioUrl},
        ${part}, ${userAnswer}, ${correctAnswer}, ${optionsJson === "null" ? "NULL" : `'${optionsJson}'::jsonb`}, ${explanation},
        '${errorType}', 'active', ${userNote}, 1, CURRENT_TIMESTAMP,
        ${sourceType}, ${sourceId}
      )
      RETURNING id;
    `);

    return {
      success: true,
      message: "Đã lưu câu hỏi vào Sổ tay lỗi thành công.",
      id: result[0]?.id,
      isExisting: false,
    };
  }

  async updateStatus(userId: number, id: number, status: "active" | "resolved") {
    const existing: any[] = await this.prisma.$queryRawUnsafe(`
      SELECT id FROM error_logs WHERE id = ${id} AND user_id = ${userId}
    `);

    if (existing.length === 0) {
      throw new NotFoundException("Không tìm thấy bản ghi lỗi.");
    }

    await this.prisma.$executeRawUnsafe(`
      UPDATE error_logs
      SET status = '${status.replace(/'/g, "''")}', updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND user_id = ${userId}
    `);

    return {
      success: true,
      message: `Đã chuyển trạng thái câu hỏi thành "${status === "resolved" ? "Đã giải quyết" : "Đang theo dõi"}".`,
    };
  }

  async updateNote(userId: number, id: number, userNote: string, errorType?: string) {
    const existing: any[] = await this.prisma.$queryRawUnsafe(`
      SELECT id FROM error_logs WHERE id = ${id} AND user_id = ${userId}
    `);

    if (existing.length === 0) {
      throw new NotFoundException("Không tìm thấy bản ghi lỗi.");
    }

    const noteEscaped = userNote ? `'${userNote.replace(/'/g, "''")}'` : "NULL";
    const typeClause = errorType ? `, error_type = '${errorType.replace(/'/g, "''")}'` : "";

    await this.prisma.$executeRawUnsafe(`
      UPDATE error_logs
      SET user_note = ${noteEscaped}${typeClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND user_id = ${userId}
    `);

    return {
      success: true,
      message: "Đã cập nhật ghi chú cá nhân thành công.",
    };
  }

  async deleteErrorLog(userId: number, id: number) {
    const existing: any[] = await this.prisma.$queryRawUnsafe(`
      SELECT id FROM error_logs WHERE id = ${id} AND user_id = ${userId}
    `);

    if (existing.length === 0) {
      throw new NotFoundException("Không tìm thấy bản ghi lỗi.");
    }

    await this.prisma.$executeRawUnsafe(`
      DELETE FROM error_logs WHERE id = ${id} AND user_id = ${userId}
    `);

    return {
      success: true,
      message: "Đã xóa câu hỏi khỏi Sổ tay lỗi.",
    };
  }
}
