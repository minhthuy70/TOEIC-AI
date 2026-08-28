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

  // ============================================================
  // 8.2 ERROR ANALYSIS (PHÂN TÍCH LỖI CHUYÊN SÂU)
  // ============================================================

  async getErrorAnalysis(userId: number) {
    const rawItems: any[] = await this.prisma.$queryRawUnsafe(`
      SELECT * FROM error_logs
      WHERE user_id = ${userId}
      ORDER BY frequency DESC, last_occurred_at DESC
    `);

    const total = rawItems.length;

    if (total === 0) {
      return {
        totalErrors: 0,
        resolutionRateStats: {
          total: 0,
          active: 0,
          resolved: 0,
          resolutionRate: 0,
        },
        typeDistribution: [
          { type: "grammar", label: "Ngữ pháp", count: 0, percentage: 0, color: "#a855f7" },
          { type: "vocabulary", label: "Từ vựng", count: 0, percentage: 0, color: "#3b82f6" },
          { type: "careless", label: "Bất cẩn", count: 0, percentage: 0, color: "#f59e0b" },
          { type: "timing", label: "Thiếu thời gian", count: 0, percentage: 0, color: "#ef4444" },
        ],
        frequencyDistribution: [
          { range: "Sai 1 lần", count: 0, percentage: 0 },
          { range: "Sai 2-3 lần", count: 0, percentage: 0 },
          { range: "Sai 4+ lần (Báo động)", count: 0, percentage: 0 },
        ],
        trendOverTime: [],
        top10Errors: [],
        weaknessByPart: [1, 2, 3, 4, 5, 6, 7].map((part) => ({
          part,
          name: `Part ${part}`,
          errorCount: 0,
          percentage: 0,
          tip: "Chưa có câu sai được ghi nhận.",
        })),
        weaknessByTopic: [],
        recurringAlerts: [],
        patternDetection: [
          {
            title: "Chưa đủ dữ liệu phân tích mẫu lỗi",
            severity: "info",
            description: "Hãy lưu các câu làm sai trong quá trình luyện đề và thi thử để hệ thống AI phân tích điểm yếu và thói quen làm sai của bạn.",
            recommendation: "Làm thêm ít nhất 1 bài Mini Test hoặc Full Test.",
          },
        ],
      };
    }

    // 1. Resolution rate stats
    const resolvedCount = rawItems.filter((i) => i.status === "resolved").length;
    const activeCount = total - resolvedCount;
    const resolutionRate = Math.round((resolvedCount / total) * 100);

    // 2. Type distribution
    const grammarCount = rawItems.filter((i) => i.error_type === "grammar").length;
    const vocabCount = rawItems.filter((i) => i.error_type === "vocabulary").length;
    const carelessCount = rawItems.filter((i) => i.error_type === "careless").length;
    const timingCount = rawItems.filter((i) => i.error_type === "timing").length;

    const typeDistribution = [
      { type: "grammar", label: "Ngữ pháp", count: grammarCount, percentage: Math.round((grammarCount / total) * 100), color: "#a855f7" },
      { type: "vocabulary", label: "Từ vựng", count: vocabCount, percentage: Math.round((vocabCount / total) * 100), color: "#3b82f6" },
      { type: "careless", label: "Bất cẩn", count: carelessCount, percentage: Math.round((carelessCount / total) * 100), color: "#f59e0b" },
      { type: "timing", label: "Thiếu thời gian", count: timingCount, percentage: Math.round((timingCount / total) * 100), color: "#ef4444" },
    ];

    // 3. Frequency distribution
    const onceCount = rawItems.filter((i) => i.frequency === 1).length;
    const recurringCount = rawItems.filter((i) => i.frequency >= 2 && i.frequency <= 3).length;
    const criticalCount = rawItems.filter((i) => i.frequency >= 4).length;

    const frequencyDistribution = [
      { range: "Sai 1 lần", count: onceCount, percentage: Math.round((onceCount / total) * 100) },
      { range: "Sai 2-3 lần", count: recurringCount, percentage: Math.round((recurringCount / total) * 100) },
      { range: "Sai 4+ lần (Báo động)", count: criticalCount, percentage: Math.round((criticalCount / total) * 100) },
    ];

    // 4. Trend over time (grouped by week/month from created_at)
    const trendMap: Record<string, { date: string; loggedCount: number; resolvedCount: number }> = {};
    for (const item of rawItems) {
      const d = new Date(item.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (!trendMap[key]) {
        trendMap[key] = { date: key, loggedCount: 0, resolvedCount: 0 };
      }
      trendMap[key].loggedCount += 1;
      if (item.status === "resolved") {
        trendMap[key].resolvedCount += 1;
      }
    }
    const trendOverTime = Object.values(trendMap).slice(-7);

    // 5. Top 10 errors
    const top10Errors = rawItems.slice(0, 10).map((item) => ({
      id: item.id,
      part: item.part,
      errorType: item.error_type,
      questionText: item.question_text || item.passage || "Câu hỏi luyện thi TOEIC",
      userAnswer: item.user_answer,
      correctAnswer: item.correct_answer,
      frequency: item.frequency,
      status: item.status,
      lastOccurredAt: item.last_occurred_at,
      userNote: item.user_note,
    }));

    // 6. Weakness by Part (Part 1 - 7)
    const partNames: Record<number, string> = {
      1: "Part 1: Photographs",
      2: "Part 2: Question-Response",
      3: "Part 3: Conversations",
      4: "Part 4: Short Talks",
      5: "Part 5: Incomplete Sentences",
      6: "Part 6: Text Completion",
      7: "Part 7: Reading Comprehension",
    };

    const partTips: Record<number, string> = {
      1: "Tập trung quan sát hành động nhân vật và các giới từ chỉ vị trí đồ vật.",
      2: "Cảnh giác bẫy từ đồng âm (same-sound words) và câu trả lời gián tiếp.",
      3: "Đọc trước 3 câu hỏi trước khi audio phát để xác định từ khóa trọng tâm.",
      4: "Luyện nghe bắt thông tin số liệu, địa điểm, chức danh và mục đích bài nói.",
      5: "Ôn tập chắc từ loại (Noun/Verb/Adj/Adv) và các thì động từ phổ biến.",
      6: "Chú ý liên từ nối câu (However, Therefore, In addition) và sự mạch lạc của đoạn văn.",
      7: "Rèn luyện kỹ năng Skimming (đọc lướt) & Scanning (tìm dữ liệu chi tiết) trong đoạn văn kép/ba.",
    };

    const weaknessByPart = [1, 2, 3, 4, 5, 6, 7].map((partNum) => {
      const partErrors = rawItems.filter((i) => i.part === partNum).length;
      return {
        part: partNum,
        name: partNames[partNum],
        errorCount: partErrors,
        percentage: total > 0 ? Math.round((partErrors / total) * 100) : 0,
        tip: partTips[partNum],
      };
    }).sort((a, b) => b.errorCount - a.errorCount);

    // 7. Weakness by Topic
    const weaknessByTopic = [
      {
        topic: "Thì động từ & Sự hòa hợp S-V",
        category: "grammar",
        errorCount: Math.round(grammarCount * 0.4),
        recommendation: "Ôn lại các thì hoàn thành, câu điều kiện và hòa hợp chủ ngữ - động từ phức hợp.",
      },
      {
        topic: "Mệnh đề quan hệ & Rút gọn",
        category: "grammar",
        errorCount: Math.round(grammarCount * 0.35),
        recommendation: "Luyện kỹ năng nhận diện V-ing / V-ed khi rút gọn mệnh đề quan hệ và mệnh đề trạng ngữ.",
      },
      {
        topic: "Từ loại & Collocations công sở",
        category: "vocabulary",
        errorCount: Math.round(vocabCount * 0.5),
        recommendation: "Học từ vựng theo cụm (e.g., schedule a meeting, submit an application) thay vì học từ đơn lẻ.",
      },
      {
        topic: "Bẫy từ đồng âm & Trả lời gián tiếp (Part 2)",
        category: "careless",
        errorCount: Math.round(carelessCount * 0.45),
        recommendation: "Không chọn đáp án lặp lại từ trong câu hỏi; tập trung nghe từ để hỏi (Who/Where/When/Why).",
      },
      {
        topic: "Đọc hiểu đoạn văn kép/ba (Part 7)",
        category: "timing",
        errorCount: Math.round(timingCount * 0.6),
        recommendation: "Phân bổ tối đa 60 giây cho mỗi câu hỏi Part 7; áp dụng kỹ thuật loại trừ đáp án nhiễu.",
      },
    ].filter((t) => t.errorCount > 0);

    // 8. Recurring Error Alerts (active items with frequency >= 2)
    const recurringAlerts = rawItems
      .filter((i) => i.frequency >= 2 && i.status === "active")
      .slice(0, 5)
      .map((i) => ({
        id: i.id,
        part: i.part,
        errorType: i.error_type,
        questionText: i.question_text || i.passage || "Câu hỏi sai lặp lại",
        frequency: i.frequency,
        lastOccurredAt: i.last_occurred_at,
        alertMessage: `⚠️ Bạn đã làm sai câu này ${i.frequency} lần! Cần xem lại lời giải chi tiết và ghi chú mẹo nhớ.`,
      }));

    // 9. AI Pattern Detection
    const dominantType = typeDistribution.slice().sort((a, b) => b.count - a.count)[0];
    const dominantPart = weaknessByPart[0];

    const patternDetection = [
      {
        title: `Mẫu sai chủ yếu: Lỗi ${dominantType.label} (${dominantType.percentage}% tổng số lỗi)`,
        severity: dominantType.percentage >= 40 ? "warning" : "info",
        description: `Hệ thống ghi nhận phần lớn câu sai của bạn bắt nguồn từ nhóm nguyên nhân "${dominantType.label}".`,
        recommendation: dominantType.type === "grammar"
          ? "Hãy dành thêm 15 phút mỗi ngày làm bài tập Ngữ pháp chuyên sâu tại mục Ngữ pháp 6.3."
          : dominantType.type === "vocabulary"
          ? "Ôn tập Flashcard SRS 7 cấp độ tại mục Từ vựng để củng cố từ mới."
          : dominantType.type === "timing"
          ? "Rèn luyện áp lực thời gian với Mini Test 50 câu (45 phút) để tăng tốc độ làm bài."
          : "Đọc kỹ toàn bộ câu và các đáp án trước khi bấm chọn để tránh bẫy đề thi.",
      },
      {
        title: `Điểm yếu trọng tâm: ${dominantPart.name} (${dominantPart.errorCount} lỗi)`,
        severity: dominantPart.errorCount >= 3 ? "warning" : "info",
        description: `Tỷ lệ mắc lỗi cao nhất tập trung tại ${dominantPart.name}.`,
        recommendation: dominantPart.tip,
      },
    ];

    if (criticalCount > 0) {
      patternDetection.push({
        title: `Cảnh báo: Có ${criticalCount} câu sai lặp lại trên 4 lần`,
        severity: "critical",
        description: "Các câu hỏi này thuộc nhóm kiến thức bạn đang bị hiểu sai bản chất hoặc nhầm lẫn kiến thức.",
        recommendation: "Mở Sổ tay lỗi, viết ghi chú cá nhân chi tiết và làm lại ngay các câu này.",
      });
    }

    return {
      totalErrors: total,
      resolutionRateStats: {
        total,
        active: activeCount,
        resolved: resolvedCount,
        resolutionRate,
      },
      typeDistribution,
      frequencyDistribution,
      trendOverTime,
      top10Errors,
      weaknessByPart,
      weaknessByTopic,
      recurringAlerts,
      patternDetection,
    };
  }
}

