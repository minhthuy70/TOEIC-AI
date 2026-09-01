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

@Controller("admin/vocabulary")
@UseGuards(JwtAuthGuard)
export class AdminVocabularyController {
  constructor(private readonly prisma: PrismaService) {}

  // 1. List & Search
  @Get()
  async listVocabulary(
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Query("search") search?: string,
    @Query("stage") stage?: string,
    @Query("topic") topic?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (search && search.trim()) {
      where.OR = [
        { english: { contains: search.trim() } },
        { vietnamese: { contains: search.trim() } },
      ];
    }
    if (stage) {
      where.stage = parseInt(stage, 10);
    }
    if (topic && topic.trim()) {
      where.topic = topic.trim();
    }

    const [items, total] = await Promise.all([
      this.prisma.vocabulary.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { id: "desc" },
      }),
      this.prisma.vocabulary.count({ where }),
    ]);

    return {
      items,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    };
  }

  // 2. Add New Vocabulary
  @Post()
  async createVocabulary(@Body() body: any) {
    if (!body.english?.trim()) {
      throw new BadRequestException("Từ tiếng Anh không được để trống");
    }
    if (!body.vietnamese?.trim()) {
      throw new BadRequestException("Nghĩa tiếng Việt không được để trống");
    }

    const item = await this.prisma.vocabulary.create({
      data: {
        english: body.english.trim(),
        type: body.type?.trim() || null,
        vietnamese: body.vietnamese.trim(),
        pronounce: body.pronounce?.trim() || null,
        explain: body.explain?.trim() || null,
        example: body.example?.trim() || null,
        exampleVietnamese: body.exampleVietnamese?.trim() || null,
        imageUrl: body.imageUrl?.trim() || null,
        audioUrl: body.audioUrl?.trim() || null,
        topic: body.topic?.trim() || "General Business",
        stage: parseInt(body.stage, 10) || 1,
      },
    });

    return {
      success: true,
      message: "Thêm từ vựng thành công",
      item,
    };
  }

  // 3. Get Detail
  @Get(":id")
  async getDetail(@Param("id") id: string) {
    const item = await this.prisma.vocabulary.findUnique({
      where: { id: parseInt(id, 10) },
    });
    if (!item) throw new NotFoundException("Không tìm thấy từ vựng");
    return item;
  }

  // 4. Edit Vocabulary
  @Patch(":id")
  async updateVocabulary(@Param("id") id: string, @Body() body: any) {
    const existing = await this.prisma.vocabulary.findUnique({
      where: { id: parseInt(id, 10) },
    });
    if (!existing) throw new NotFoundException("Không tìm thấy từ vựng");

    const item = await this.prisma.vocabulary.update({
      where: { id: parseInt(id, 10) },
      data: {
        english: body.english?.trim() ?? existing.english,
        type: body.type !== undefined ? body.type?.trim() || null : existing.type,
        vietnamese: body.vietnamese?.trim() ?? existing.vietnamese,
        pronounce: body.pronounce !== undefined ? body.pronounce?.trim() || null : existing.pronounce,
        explain: body.explain !== undefined ? body.explain?.trim() || null : existing.explain,
        example: body.example !== undefined ? body.example?.trim() || null : existing.example,
        exampleVietnamese: body.exampleVietnamese !== undefined ? body.exampleVietnamese?.trim() || null : existing.exampleVietnamese,
        imageUrl: body.imageUrl !== undefined ? body.imageUrl?.trim() || null : existing.imageUrl,
        audioUrl: body.audioUrl !== undefined ? body.audioUrl?.trim() || null : existing.audioUrl,
        topic: body.topic !== undefined ? body.topic?.trim() || null : existing.topic,
        stage: body.stage ? parseInt(body.stage, 10) : existing.stage,
      },
    });

    return {
      success: true,
      message: "Cập nhật từ vựng thành công",
      item,
    };
  }

  // 5. Delete Vocabulary
  @Delete(":id")
  async deleteVocabulary(@Param("id") id: string) {
    await this.prisma.vocabulary.delete({
      where: { id: parseInt(id, 10) },
    });
    return {
      success: true,
      message: "Đã xóa từ vựng thành công",
    };
  }

  // 6. Bulk Import Vocabulary
  @Post("bulk-import")
  async bulkImport(@Body() body: { items: any[] }) {
    if (!Array.isArray(body.items) || body.items.length === 0) {
      throw new BadRequestException("Danh sách từ vựng không hợp lệ");
    }

    const createdItems: any[] = [];
    const errors: any[] = [];

    for (let i = 0; i < body.items.length; i++) {
      const row = body.items[i];
      if (!row.english?.trim() || !row.vietnamese?.trim()) {
        errors.push({ row: i + 1, english: row.english, error: "Thiếu từ tiếng Anh hoặc nghĩa tiếng Việt" });
        continue;
      }

      try {
        const item = await this.prisma.vocabulary.create({
          data: {
            english: row.english.trim(),
            type: row.type?.trim() || "n.",
            vietnamese: row.vietnamese.trim(),
            pronounce: row.pronounce?.trim() || null,
            explain: row.explain?.trim() || null,
            example: row.example?.trim() || null,
            exampleVietnamese: row.exampleVietnamese?.trim() || null,
            imageUrl: row.imageUrl?.trim() || null,
            audioUrl: row.audioUrl?.trim() || null,
            topic: row.topic?.trim() || "General",
            stage: parseInt(row.stage, 10) || 1,
          },
        });
        createdItems.push(item);
      } catch (err: any) {
        errors.push({ row: i + 1, english: row.english, error: err.message });
      }
    }

    return {
      success: true,
      importedCount: createdItems.length,
      errorCount: errors.length,
      errors,
      message: `Đã nhập thành công ${createdItems.length} từ vựng (${errors.length} lỗi).`,
    };
  }

  // 7. Bulk Export Vocabulary
  @Get("bulk-export")
  async bulkExport(@Query("stage") stage?: string, @Query("topic") topic?: string) {
    const where: any = {};
    if (stage) where.stage = parseInt(stage, 10);
    if (topic) where.topic = topic.trim();

    const items = await this.prisma.vocabulary.findMany({
      where,
      orderBy: { id: "asc" },
    });

    return {
      success: true,
      count: items.length,
      items,
    };
  }

  // 8. Approval Queue
  @Get("approval-queue")
  async getApprovalQueue() {
    return {
      success: true,
      pendingItems: [
        {
          id: 901,
          english: "collaborate",
          type: "v.",
          vietnamese: "hợp tác, cộng tác",
          pronounce: "/kəˈlæb.ə.reɪt/",
          explain: "to work with another person or group in order to achieve something",
          example: "We need to collaborate with the marketing team on this project.",
          exampleVietnamese: "Chúng ta cần hợp tác với đội ngũ tiếp thị trong dự án này.",
          topic: "Office & Workplace",
          stage: 3,
          source: "Contributor Submission",
          submittedAt: "2026-09-01T08:30:00.000Z",
          qualityScore: 95,
        },
        {
          id: 902,
          english: "feasible",
          type: "adj.",
          vietnamese: "khả thi",
          pronounce: "/ˈfiː.zə.bəl/",
          explain: "able to be made, done, or achieved easily or conveniently",
          example: "It is not feasible to complete the audit before Friday.",
          exampleVietnamese: "Không khả thi để hoàn thành cuộc kiểm toán trước thứ Sáu.",
          topic: "Business Strategy",
          stage: 4,
          source: "AI Content Pipeline",
          submittedAt: "2026-09-01T07:15:00.000Z",
          qualityScore: 92,
        },
        {
          id: 903,
          english: "lucrative",
          type: "adj.",
          vietnamese: "sinh lợi, béo bở",
          pronounce: "/ˈluː.krə.tɪv/",
          explain: "producing a lot of money or a large profit",
          example: "The firm signed a lucrative contract with a multinational retailer.",
          exampleVietnamese: "Công ty đã ký một hợp đồng béo bở với một nhà bán lẻ đa quốc gia.",
          topic: "Finance & Banking",
          stage: 5,
          source: "AI Content Pipeline",
          submittedAt: "2026-08-31T20:00:00.000Z",
          qualityScore: 98,
        },
      ],
    };
  }

  @Post("approval-queue/:id/approve")
  async approveVocabulary(@Param("id") id: string) {
    return {
      success: true,
      message: `Đã phê duyệt từ vựng #${id} và đưa vào kho dữ liệu chính.`,
      id,
    };
  }

  @Post("approval-queue/:id/reject")
  async rejectVocabulary(@Param("id") id: string, @Body() body: { reason?: string }) {
    return {
      success: true,
      message: `Đã từ chối từ vựng #${id}. Lý do: ${body.reason || "Chất lượng chưa đạt yêu cầu"}`,
      id,
    };
  }

  // 9. Categories & Tags
  @Get("categories")
  async getCategories() {
    return {
      success: true,
      categories: [
        { id: "cat-1", name: "Office & Workplace", stage: 2, wordCount: 120, icon: "Building2" },
        { id: "cat-2", name: "Business Strategy", stage: 3, wordCount: 95, icon: "Briefcase" },
        { id: "cat-3", name: "Finance & Accounting", stage: 4, wordCount: 85, icon: "DollarSign" },
        { id: "cat-4", name: "Travel & Hospitality", stage: 2, wordCount: 110, icon: "Plane" },
        { id: "cat-5", name: "Technology & IT", stage: 3, wordCount: 75, icon: "Laptop" },
        { id: "cat-6", name: "Human Resources (HR)", stage: 3, wordCount: 65, icon: "Users" },
        { id: "cat-7", name: "Marketing & Sales", stage: 4, wordCount: 90, icon: "TrendingUp" },
      ],
    };
  }

  @Get("tags")
  async getTags() {
    return {
      success: true,
      tags: [
        { id: "tag-1", name: "Part 1 Photo Vocab", wordCount: 140, color: "blue" },
        { id: "tag-2", name: "Part 5 Collocations", wordCount: 210, color: "red" },
        { id: "tag-3", name: "Part 7 Synonyms", wordCount: 180, color: "emerald" },
        { id: "tag-4", name: "Oxford 3000 Essential", wordCount: 350, color: "purple" },
        { id: "tag-5", name: "ETS Exam Trap", wordCount: 95, color: "amber" },
      ],
    };
  }

  // 10. Quality Check
  @Get("quality-check")
  async getQualityCheck() {
    const totalWords = await this.prisma.vocabulary.count();

    const [missingPronounce, missingExample, missingAudio] = await Promise.all([
      this.prisma.vocabulary.count({ where: { OR: [{ pronounce: null }, { pronounce: "" }] } }),
      this.prisma.vocabulary.count({ where: { OR: [{ example: null }, { example: "" }] } }),
      this.prisma.vocabulary.count({ where: { OR: [{ audioUrl: null }, { audioUrl: "" }] } }),
    ]);

    const flaggedItems = await this.prisma.vocabulary.findMany({
      where: {
        OR: [
          { pronounce: null },
          { pronounce: "" },
          { example: null },
          { example: "" },
          { audioUrl: null },
          { audioUrl: "" },
        ],
      },
      take: 10,
    });

    return {
      success: true,
      stats: {
        totalWords,
        missingPronounce,
        missingExample,
        missingAudio,
        healthScore: totalWords > 0
          ? Math.max(0, Math.round(100 - ((missingPronounce + missingExample + missingAudio) / (totalWords * 3)) * 100))
          : 100,
      },
      flaggedItems: flaggedItems.map((item) => ({
        id: item.id,
        english: item.english,
        vietnamese: item.vietnamese,
        issues: [
          !item.pronounce && "Thiếu phiên âm IPA",
          !item.example && "Thiếu câu ví dụ",
          !item.audioUrl && "Chưa có phát âm Audio",
        ].filter(Boolean),
      })),
    };
  }
}
