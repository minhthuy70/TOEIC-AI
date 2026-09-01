import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Put,
  Body,
  Query,
  Param,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";

@Controller("admin/tests/manage")
@UseGuards(JwtAuthGuard)
export class AdminTestsController {
  constructor(private readonly prisma: PrismaService) {}

  private mockTests = [
    {
      id: 1,
      title: "ETS TOEIC 2026 Full Test 01",
      description: "Đề thi thử chuẩn format ETS format mới nhất năm 2026 có đầy đủ 200 câu Listening & Reading",
      duration: 120,
      total_questions: 200,
      stage: 4,
      test_type: "Full Test",
      status: "published", // draft | published | scheduled | archived
      is_active: true,
      attempts_count: 1420,
      average_score: 685,
      highest_score: 980,
      config: {
        shuffleQuestions: true,
        shuffleOptions: true,
        showExplanationImmediately: false,
        maxAttempts: 3,
        passingScore: 750,
      },
      schedule: {
        isScheduled: false,
        startDate: "2026-09-01T00:00:00.000Z",
        endDate: "2026-09-30T23:59:59.000Z",
        isRecurringWeekly: true,
      },
      createdAt: "2026-08-15T10:00:00.000Z",
    },
    {
      id: 2,
      title: "Mini Test 50 Câu Chinh Phục 650+",
      description: "Bài kiểm tra rút gọn 50 câu chọn lọc kỹ càng giúp đánh giá nhanh trình độ trong 25 phút",
      duration: 25,
      total_questions: 50,
      stage: 3,
      test_type: "Mini Test",
      status: "published",
      is_active: true,
      attempts_count: 2890,
      average_score: 540,
      highest_score: 890,
      config: {
        shuffleQuestions: false,
        shuffleOptions: true,
        showExplanationImmediately: true,
        maxAttempts: 99,
        passingScore: 600,
      },
      schedule: {
        isScheduled: false,
        startDate: null,
        endDate: null,
        isRecurringWeekly: false,
      },
      createdAt: "2026-08-20T14:00:00.000Z",
    },
    {
      id: 3,
      title: "Kỳ Thi Thử Trực Tuyến Weekly Mock Contest #12",
      description: "Kỳ thi thử định kỳ hàng tuần có bảng xếp hạng trao giải cho Top thí sinh điểm cao nhất",
      duration: 120,
      total_questions: 200,
      stage: 5,
      test_type: "Contest",
      status: "scheduled",
      is_active: true,
      attempts_count: 450,
      average_score: 720,
      highest_score: 990,
      config: {
        shuffleQuestions: true,
        shuffleOptions: true,
        showExplanationImmediately: false,
        maxAttempts: 1,
        passingScore: 800,
      },
      schedule: {
        isScheduled: true,
        startDate: "2026-09-05T08:00:00.000Z",
        endDate: "2026-09-07T22:00:00.000Z",
        isRecurringWeekly: true,
      },
      createdAt: "2026-08-28T09:00:00.000Z",
    },
    {
      id: 4,
      title: "Đề Khảo Sát Đầu Vào Placement Test (Stage 1-5)",
      description: "Bài kiểm tra phân loại chặng học thích ứng AI dành cho học viên mới đăng ký",
      duration: 45,
      total_questions: 40,
      stage: 1,
      test_type: "Placement",
      status: "published",
      is_active: true,
      attempts_count: 5400,
      average_score: 480,
      highest_score: 950,
      config: {
        shuffleQuestions: true,
        shuffleOptions: true,
        showExplanationImmediately: false,
        maxAttempts: 2,
        passingScore: 400,
      },
      schedule: {
        isScheduled: false,
        startDate: null,
        endDate: null,
        isRecurringWeekly: false,
      },
      createdAt: "2026-08-01T08:00:00.000Z",
    },
    {
      id: 5,
      title: "ETS 2026 Full Test 02 (Bản Soạn Thảo)",
      description: "Bộ đề đang trong giai đoạn biên tập và kiểm duyệt câu hỏi Part 3 & 7",
      duration: 120,
      total_questions: 200,
      stage: 4,
      test_type: "Full Test",
      status: "draft",
      is_active: false,
      attempts_count: 0,
      average_score: 0,
      highest_score: 0,
      config: {
        shuffleQuestions: true,
        shuffleOptions: true,
        showExplanationImmediately: false,
        maxAttempts: 1,
        passingScore: 750,
      },
      schedule: {
        isScheduled: false,
        startDate: null,
        endDate: null,
        isRecurringWeekly: false,
      },
      createdAt: "2026-08-31T16:00:00.000Z",
    },
  ];

  // 1. List & Search
  @Get()
  async listTests(
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Query("search") search?: string,
    @Query("status") status?: string,
    @Query("test_type") testType?: string,
  ) {
    let filtered = [...this.mockTests];

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      );
    }

    if (status) {
      filtered = filtered.filter((item) => item.status.toLowerCase() === status.toLowerCase());
    }

    if (testType) {
      filtered = filtered.filter((item) => item.test_type.toLowerCase() === testType.toLowerCase());
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

  // 2. Create Test
  @Post()
  async createTest(@Body() body: any) {
    if (!body.title?.trim()) {
      throw new BadRequestException("Tiêu đề đề thi không được để trống");
    }

    const newTest = {
      id: Date.now(),
      title: body.title.trim(),
      description: body.description?.trim() || "Đề thi TOEIC chất lượng cao",
      duration: parseInt(body.duration, 10) || 120,
      total_questions: parseInt(body.total_questions, 10) || 200,
      stage: parseInt(body.stage, 10) || 3,
      test_type: body.test_type?.trim() || "Full Test",
      status: body.status || "draft",
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
      attempts_count: 0,
      average_score: 0,
      highest_score: 0,
      config: body.config || {
        shuffleQuestions: true,
        shuffleOptions: true,
        showExplanationImmediately: false,
        maxAttempts: 3,
        passingScore: 700,
      },
      schedule: body.schedule || {
        isScheduled: false,
        startDate: null,
        endDate: null,
        isRecurringWeekly: false,
      },
      createdAt: new Date().toISOString(),
    };

    this.mockTests.unshift(newTest);

    return {
      success: true,
      message: "Tạo đề thi mới thành công",
      item: newTest,
    };
  }

  // 3. Edit Test
  @Patch(":id")
  async updateTest(@Param("id") id: string, @Body() body: any) {
    const idx = this.mockTests.findIndex((t) => t.id === parseInt(id, 10));
    if (idx === -1) throw new NotFoundException("Không tìm thấy đề thi");

    this.mockTests[idx] = {
      ...this.mockTests[idx],
      ...body,
      duration: body.duration ? parseInt(body.duration, 10) : this.mockTests[idx].duration,
      total_questions: body.total_questions ? parseInt(body.total_questions, 10) : this.mockTests[idx].total_questions,
    };

    return {
      success: true,
      message: "Cập nhật đề thi thành công",
      item: this.mockTests[idx],
    };
  }

  // 4. Delete Test
  @Delete(":id")
  async deleteTest(@Param("id") id: string) {
    const idx = this.mockTests.findIndex((t) => t.id === parseInt(id, 10));
    if (idx === -1) throw new NotFoundException("Không tìm thấy đề thi");

    this.mockTests.splice(idx, 1);

    return {
      success: true,
      message: "Đã xóa đề thi thành công",
    };
  }

  // 5. Test Configuration Update
  @Put(":id/config")
  async updateConfig(@Param("id") id: string, @Body() body: any) {
    const test = this.mockTests.find((t) => t.id === parseInt(id, 10));
    if (!test) throw new NotFoundException("Không tìm thấy đề thi");

    test.config = {
      ...test.config,
      ...body,
    };

    return {
      success: true,
      message: "Cập nhật cấu hình làm bài thành công",
      config: test.config,
    };
  }

  // 6. Test Publication Status
  @Put(":id/publish")
  async updatePublication(@Param("id") id: string, @Body() body: { status: string }) {
    const test = this.mockTests.find((t) => t.id === parseInt(id, 10));
    if (!test) throw new NotFoundException("Không tìm thấy đề thi");

    test.status = body.status;
    test.is_active = body.status === "published" || body.status === "scheduled";

    return {
      success: true,
      message: `Đã chuyển trạng thái đề thi sang: ${body.status.toUpperCase()}`,
      status: test.status,
    };
  }

  // 7. Test Scheduling
  @Put(":id/schedule")
  async updateSchedule(@Param("id") id: string, @Body() body: any) {
    const test = this.mockTests.find((t) => t.id === parseInt(id, 10));
    if (!test) throw new NotFoundException("Không tìm thấy đề thi");

    test.schedule = {
      ...test.schedule,
      ...body,
    };

    if (test.schedule.isScheduled) {
      test.status = "scheduled";
    }

    return {
      success: true,
      message: "Đã lên lịch mở kỳ thi trực tuyến thành công",
      schedule: test.schedule,
    };
  }

  // 8. Test Analytics
  @Get(":id/analytics")
  async getTestAnalytics(@Param("id") id: string) {
    const test = this.mockTests.find((t) => t.id === parseInt(id, 10)) || this.mockTests[0];

    return {
      success: true,
      analytics: {
        testId: test.id,
        testTitle: test.title,
        totalAttempts: test.attempts_count || 1420,
        averageScore: test.average_score || 685,
        highestScore: test.highest_score || 980,
        passingRate: 74,
        averageCompletionTimeMinutes: 108,
        scoreDistribution: [
          { range: "0–400", count: 120, percentage: 8 },
          { range: "405–600", count: 380, percentage: 27 },
          { range: "605–750", count: 520, percentage: 37 },
          { range: "755–850", count: 280, percentage: 20 },
          { range: "855–990", count: 120, percentage: 8 },
        ],
        partAccuracy: [
          { part: 1, name: "Part 1 (Photos)", accuracy: 88 },
          { part: 2, name: "Part 2 (Question-Response)", accuracy: 76 },
          { part: 3, name: "Part 3 (Conversations)", accuracy: 68 },
          { part: 4, name: "Part 4 (Short Talks)", accuracy: 65 },
          { part: 5, name: "Part 5 (Incomplete Sentences)", accuracy: 72 },
          { part: 6, name: "Part 6 (Text Completion)", accuracy: 64 },
          { part: 7, name: "Part 7 (Reading Comprehension)", accuracy: 58 },
        ],
        topPerformers: [
          { rank: 1, name: "Nguyễn Văn Hùng", score: 980, time: "98 phút", date: "2026-08-30" },
          { rank: 2, name: "Trần Mai Phương", score: 960, time: "105 phút", date: "2026-08-29" },
          { rank: 3, name: "Lê Minh Tuấn", score: 945, time: "112 phút", date: "2026-08-28" },
        ],
      },
    };
  }
}
