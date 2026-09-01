import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";

@Controller("admin/question-bank")
@UseGuards(JwtAuthGuard)
export class AdminQuestionsController {
  constructor(private readonly prisma: PrismaService) {}

  // Mock Question Bank Store for Admin Management with Part 1–7
  private mockQuestions = [
    {
      id: 1,
      part: 5,
      questionNumber: 101,
      questionText: "The executive committee decided to _______ the launch of the new product until next quarter.",
      optionA: "postpone",
      optionB: "postponed",
      optionC: "postponing",
      optionD: "postponement",
      correctAnswer: "A",
      explanation: "Sau động từ 'decided to' cần một động từ nguyên thể có 'to' (to V-inf), do đó 'postpone' là đáp án chính xác.",
      category: "Grammar - Infinitives",
      difficulty: "Medium",
      difficultyScore: 550,
      tags: ["Part 5", "Verb Form", "Business Meeting"],
      audioUrl: null,
      imageUrl: null,
      passage: null,
      qualityScore: 98,
      createdAt: "2026-08-31T10:00:00.000Z",
    },
    {
      id: 2,
      part: 5,
      questionNumber: 102,
      questionText: "All employees are required to submit their expense reports _______ Friday afternoon.",
      optionA: "by",
      optionB: "until",
      optionC: "at",
      optionD: "for",
      correctAnswer: "A",
      explanation: "Giới từ 'by' được dùng để chỉ thời hạn cuối cùng mà hành động phải hoàn thành (trước hoặc muộn nhất là vào chiều thứ Sáu).",
      category: "Grammar - Prepositions",
      difficulty: "Easy",
      difficultyScore: 350,
      tags: ["Part 5", "Preposition of Time", "Office Policy"],
      audioUrl: null,
      imageUrl: null,
      passage: null,
      qualityScore: 95,
      createdAt: "2026-08-31T10:05:00.000Z",
    },
    {
      id: 3,
      part: 1,
      questionNumber: 1,
      questionText: "Look at the photograph and choose the statement that best describes what you see.",
      optionA: "A woman is typing on a laptop keyboard.",
      optionB: "A woman is drinking a cup of coffee.",
      optionC: "Documents are being filed in a cabinet.",
      optionD: "The office chairs are being stacked.",
      correctAnswer: "A",
      explanation: "Bức ảnh thể hiện rõ người phụ nữ đang ngồi trước máy tính xách tay và gõ phím.",
      category: "Listening - Photos (People)",
      difficulty: "Easy",
      difficultyScore: 300,
      tags: ["Part 1", "Office Action", "Present Continuous"],
      audioUrl: "https://actions.google.com/sounds/v1/ambiences/office.ogg",
      imageUrl: "/images/mock-part1-01.jpg",
      passage: null,
      qualityScore: 92,
      createdAt: "2026-08-30T14:20:00.000Z",
    },
    {
      id: 4,
      part: 7,
      questionNumber: 147,
      questionText: "What is the main purpose of the memorandum?",
      optionA: "To announce a new company policy on remote work",
      optionB: "To introduce a newly hired department director",
      optionC: "To schedule an annual performance evaluation",
      optionD: "To request feedback on a proposed budget",
      correctAnswer: "A",
      explanation: "Đoạn 1 nêu rõ: 'This memo outlines the updated guidelines regarding flexible working arrangements starting next month.'",
      category: "Reading - Main Idea / Purpose",
      difficulty: "Hard",
      difficultyScore: 780,
      tags: ["Part 7", "Single Passage", "Memo", "HR Policy"],
      audioUrl: null,
      imageUrl: null,
      passage: "MEMORANDUM\nTo: All Regional Staff\nFrom: Human Resources Division\nDate: September 1\nSubject: Guidelines for Remote Work Policy\n\nThis memo outlines the updated guidelines regarding flexible working arrangements starting next month...",
      qualityScore: 96,
      createdAt: "2026-08-30T15:00:00.000Z",
    },
    {
      id: 5,
      part: 2,
      questionNumber: 7,
      questionText: "Where did you leave the keys to the conference room?",
      optionA: "On the receptionist's front desk.",
      optionB: "Yes, we reserved the large room.",
      optionC: "At about three o'clock.",
      optionD: "No, it's not locked.",
      correctAnswer: "A",
      explanation: "Câu hỏi bắt đầu bằng 'Where' (Ở đâu), câu trả lời phù hợp nhất chỉ vị trí là 'On the receptionist's front desk.'",
      category: "Listening - WH-Questions (Where)",
      difficulty: "Easy",
      difficultyScore: 400,
      tags: ["Part 2", "Where Question", "Direct Answer"],
      audioUrl: "https://actions.google.com/sounds/v1/ambiences/doorbell.ogg",
      imageUrl: null,
      passage: null,
      qualityScore: 94,
      createdAt: "2026-08-29T11:00:00.000Z",
    },
  ];

  // 1. List & Search
  @Get()
  async listQuestions(
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Query("search") search?: string,
    @Query("part") part?: string,
    @Query("difficulty") difficulty?: string,
  ) {
    let filtered = [...this.mockQuestions];

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.questionText.toLowerCase().includes(q) ||
          item.explanation.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }

    if (part) {
      filtered = filtered.filter((item) => item.part === parseInt(part, 10));
    }

    if (difficulty) {
      filtered = filtered.filter((item) => item.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(skip, skip + limitNum);

    return {
      items: paginated,
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(filtered.length / limitNum) || 1,
    };
  }

  // 2. Add New Question
  @Post()
  async createQuestion(@Body() body: any) {
    if (!body.questionText?.trim()) {
      throw new BadRequestException("Nội dung câu hỏi không được để trống");
    }
    if (!body.correctAnswer?.trim()) {
      throw new BadRequestException("Đáp án đúng không được để trống");
    }

    const newQuestion = {
      id: Date.now(),
      part: parseInt(body.part, 10) || 5,
      questionNumber: parseInt(body.questionNumber, 10) || 101,
      questionText: body.questionText.trim(),
      optionA: body.optionA?.trim() || "",
      optionB: body.optionB?.trim() || "",
      optionC: body.optionC?.trim() || "",
      optionD: body.optionD?.trim() || "",
      correctAnswer: body.correctAnswer.trim().toUpperCase(),
      explanation: body.explanation?.trim() || "Chưa có lời giải chi tiết.",
      category: body.category?.trim() || "General TOEIC",
      difficulty: body.difficulty?.trim() || "Medium",
      difficultyScore: parseInt(body.difficultyScore, 10) || 600,
      tags: Array.isArray(body.tags) ? body.tags : ["TOEIC"],
      audioUrl: body.audioUrl?.trim() || null,
      imageUrl: body.imageUrl?.trim() || null,
      passage: body.passage?.trim() || null,
      qualityScore: 95,
      createdAt: new Date().toISOString(),
    };

    this.mockQuestions.unshift(newQuestion);

    return {
      success: true,
      message: "Thêm câu hỏi mới vào ngân hàng thành công",
      item: newQuestion,
    };
  }

  // 3. Get Detail
  @Get(":id")
  async getDetail(@Param("id") id: string) {
    const item = this.mockQuestions.find((q) => q.id === parseInt(id, 10));
    if (!item) throw new NotFoundException("Không tìm thấy câu hỏi");
    return item;
  }

  // 4. Edit Question
  @Patch(":id")
  async updateQuestion(@Param("id") id: string, @Body() body: any) {
    const idx = this.mockQuestions.findIndex((q) => q.id === parseInt(id, 10));
    if (idx === -1) throw new NotFoundException("Không tìm thấy câu hỏi");

    this.mockQuestions[idx] = {
      ...this.mockQuestions[idx],
      ...body,
      part: body.part ? parseInt(body.part, 10) : this.mockQuestions[idx].part,
    };

    return {
      success: true,
      message: "Cập nhật câu hỏi thành công",
      item: this.mockQuestions[idx],
    };
  }

  // 5. Delete Question
  @Delete(":id")
  async deleteQuestion(@Param("id") id: string) {
    const idx = this.mockQuestions.findIndex((q) => q.id === parseInt(id, 10));
    if (idx === -1) throw new NotFoundException("Không tìm thấy câu hỏi");

    this.mockQuestions.splice(idx, 1);

    return {
      success: true,
      message: "Đã xóa câu hỏi khỏi ngân hàng thành công",
    };
  }

  // 6. Bulk Import Questions
  @Post("bulk-import")
  async bulkImport(@Body() body: { items: any[] }) {
    if (!Array.isArray(body.items) || body.items.length === 0) {
      throw new BadRequestException("Danh sách câu hỏi không hợp lệ");
    }

    const imported: any[] = [];
    for (const row of body.items) {
      if (row.questionText && row.correctAnswer) {
        const item = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          part: parseInt(row.part, 10) || 5,
          questionNumber: parseInt(row.questionNumber, 10) || 101,
          questionText: row.questionText.trim(),
          optionA: row.optionA?.trim() || "Option A",
          optionB: row.optionB?.trim() || "Option B",
          optionC: row.optionC?.trim() || "Option C",
          optionD: row.optionD?.trim() || "Option D",
          correctAnswer: row.correctAnswer.trim().toUpperCase(),
          explanation: row.explanation?.trim() || "Lời giải chuẩn TOEIC AI.",
          category: row.category?.trim() || "General TOEIC",
          difficulty: row.difficulty?.trim() || "Medium",
          difficultyScore: 550,
          tags: ["Bulk Import"],
          audioUrl: row.audioUrl || null,
          imageUrl: row.imageUrl || null,
          passage: row.passage || null,
          qualityScore: 90,
          createdAt: new Date().toISOString(),
        };
        this.mockQuestions.unshift(item);
        imported.push(item);
      }
    }

    return {
      success: true,
      importedCount: imported.length,
      message: `Đã nhập thành công ${imported.length} câu hỏi vào ngân hàng đề!`,
    };
  }

  // 7. Categories Management
  @Get("categories")
  async getCategories() {
    return {
      success: true,
      categories: [
        { id: "cat-1", part: 1, name: "Listening - Photos (People / Objects)", questionCount: 120 },
        { id: "cat-2", part: 2, name: "Listening - Question & Response (WH/Yes-No)", questionCount: 250 },
        { id: "cat-3", part: 3, name: "Listening - Short Conversations", questionCount: 390 },
        { id: "cat-4", part: 4, name: "Listening - Short Talks / Announcements", questionCount: 300 },
        { id: "cat-5", part: 5, name: "Reading - Incomplete Sentences (Grammar & Vocab)", questionCount: 850 },
        { id: "cat-6", part: 6, name: "Reading - Text Completion", questionCount: 240 },
        { id: "cat-7", part: 7, name: "Reading - Single & Multiple Passages", questionCount: 650 },
      ],
    };
  }

  // 8. Statistics
  @Get("statistics")
  async getStatistics() {
    const total = this.mockQuestions.length;
    return {
      success: true,
      stats: {
        totalQuestions: 2800,
        partBreakdown: [
          { part: 1, name: "Part 1 (Photos)", count: 180, percentage: 6 },
          { part: 2, name: "Part 2 (Question-Response)", count: 420, percentage: 15 },
          { part: 3, name: "Part 3 (Conversations)", count: 540, percentage: 19 },
          { part: 4, name: "Part 4 (Short Talks)", count: 460, percentage: 16 },
          { part: 5, name: "Part 5 (Incomplete Sentences)", count: 680, percentage: 24 },
          { part: 6, name: "Part 6 (Text Completion)", count: 220, percentage: 8 },
          { part: 7, name: "Part 7 (Reading Comprehension)", count: 300, percentage: 12 },
        ],
        difficultyBreakdown: {
          easy: { count: 850, percentage: 30 },
          medium: { count: 1250, percentage: 45 },
          hard: { count: 520, percentage: 19 },
          expert: { count: 180, percentage: 6 },
        },
        explanationCoverage: 96,
        mediaCoverage: 88,
      },
    };
  }

  // 9. Quality Check
  @Get("quality-check")
  async getQualityCheck() {
    return {
      success: true,
      healthScore: 94,
      issuesCount: 3,
      issues: [
        {
          id: "iss-1",
          questionId: 104,
          issue: "Thiếu lời giải thích ngữ pháp chi tiết",
          part: 5,
          severity: "medium",
        },
        {
          id: "iss-2",
          questionId: 215,
          issue: "Đường dẫn file nghe Audio trả về mã lỗi 404",
          part: 3,
          severity: "high",
        },
        {
          id: "iss-3",
          questionId: 308,
          issue: "Lựa chọn D bị trùng lặp với lựa chọn B",
          part: 5,
          severity: "high",
        },
      ],
    };
  }

  // 10. Duplicate Detection
  @Get("duplicates")
  async getDuplicates() {
    return {
      success: true,
      duplicateGroups: [
        {
          groupId: "dup-1",
          similarity: 95,
          questionTextSample: "The board of directors _______ the annual budget proposal yesterday.",
          questions: [
            { id: 1012, part: 5, testName: "ETS 2026 Test 1", correctAnswer: "B", createdDate: "2026-08-15" },
            { id: 1405, part: 5, testName: "Mini Test 50 #3", correctAnswer: "B", createdDate: "2026-08-28" },
          ],
        },
        {
          groupId: "dup-2",
          similarity: 88,
          questionTextSample: "Please ensure all confidential documents are properly shredded before _______.",
          questions: [
            { id: 1088, part: 5, testName: "Practice Drill Grammar", correctAnswer: "C", createdDate: "2026-08-10" },
            { id: 1890, part: 5, testName: "Full Mock Test 04", correctAnswer: "C", createdDate: "2026-08-29" },
          ],
        },
      ],
    };
  }
}
