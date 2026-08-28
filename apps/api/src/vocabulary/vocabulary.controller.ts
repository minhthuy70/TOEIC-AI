import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";

import { VocabularyService } from './vocabulary.service';
import { LearnDto } from './dto/learn.dto';
import { ReviewDto } from './dto/review.dto';

@UseGuards(JwtAuthGuard)
@Controller("vocabulary")
export class VocabularyController {
  constructor(
    private readonly vocabularyService: VocabularyService,
  ) {}

  // =====================================================
  // Health Check
  // =====================================================

  @Get('health')
  health() {
    return this.vocabularyService.healthCheck();
  }

  // =====================================================
  // Dashboard
  // =====================================================

 @Get("dashboard")
dashboard(
  @Request() req,
) {
  return this.vocabularyService.getDashboard(
    req.user.userId,
  );
}

  // =====================================================
  // SRS Dashboard
  // =====================================================

  @Get("srs")
srs(
  @Request() req,
) {
  return this.vocabularyService.getSrsStatus(
    req.user.userId,
  );
}

  // =====================================================
  // Statistics
  // =====================================================

  @Get("statistics")
  statistics(
    @Request() req,
  ) {
    return this.vocabularyService.getStatistics(
      req.user.userId,
    );
  }

  // =====================================================
  // Topic List
  // =====================================================

  @Get('topics')
  topics(@Request() req) {
    return this.vocabularyService.getTopics(req.user.userId);
  }

  // =====================================================
  // Today's Learning
  // =====================================================

  @Get("today")
today(
  @Request() req,
) {
  return this.vocabularyService.today(
    req.user.userId,
  );
}


  // =====================================================
  // Lessons List
  // =====================================================

  @Get("lessons")
  getLessons(
    @Request() req,
  ) {
    return this.vocabularyService.getLessons(req.user.userId);
  }

  // =====================================================
  // Lesson Detail
  // =====================================================

  @Get("lessons/:lesson")
  getLessonWords(
    @Request() req,
    @Param("lesson", ParseIntPipe) lesson: number,
  ) {
    return this.vocabularyService.getLessonWords(req.user.userId, lesson);
  }

  // =====================================================
  // Review Levels List
  // =====================================================

  @Get("review-levels")
  getReviewLevels(
    @Request() req,
  ) {
    return this.vocabularyService.getReviewLevels(req.user.userId);
  }

  // =====================================================
  // Review Level Words
  // =====================================================

  @Get("review-words/:level")
  getReviewWords(
    @Request() req,
    @Param("level", ParseIntPipe) level: number,
  ) {
    return this.vocabularyService.getReviewWords(req.user.userId, level);
  }

  // =====================================================
  // Filtered Vocabulary List
  // =====================================================

  @Get("filtered")
  getFiltered(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('stage') stage?: string,
    @Query('topic') topic?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: 'alphabet_asc' | 'alphabet_desc' | 'learned_asc' | 'learned_desc' | 'review_asc' | 'review_desc',
    @Query('status') status?: string,
    @Query('srsLevel') srsLevel?: string,
  ) {
    return this.vocabularyService.getWordsFiltered(req.user.userId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      stage: stage ? Number(stage) : undefined,
      topic,
      search,
      sort,
      status,
      srsLevel: srsLevel ? Number(srsLevel) : undefined,
    });
  }

  // =====================================================
  // Vocabulary List
  // =====================================================

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('topic') topic?: string,
  ) {
    return this.vocabularyService.getWords(
      Number(page ?? 1),
      Number(limit ?? 20),
      topic,
    );
  }

  // =====================================================
  // Vocabulary Detail
  // =====================================================

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.vocabularyService.getWord(id);
  }

  // =====================================================
  // Learn Word
  // =====================================================
@Post("learn")
learn(
  @Request() req,
  @Body() dto: LearnDto,
) {
  dto.userId = req.user.userId;

  return this.vocabularyService.learn(dto);
}

  // =====================================================
  // Review Word
  // =====================================================

@Post("review")
review(
  @Request() req,
  @Body() dto: ReviewDto,
) {
  dto.userId = req.user.userId;

  return this.vocabularyService.review(dto);
}

  // =====================================================
  // Update Notes
  // =====================================================
  @Post("notes")
  updateNotes(
    @Request() req,
    @Body() body: { vocabularyId: number; notes: string | null; customExample: string | null },
  ) {
    return this.vocabularyService.updateNotes(
      req.user.userId,
      body.vocabularyId,
      body.notes,
      body.customExample
    );
  }

  // =====================================================
  // Bulk Operations
  // =====================================================
  @Post("bulk-reset")
  bulkReset(
    @Request() req,
    @Body() body: { vocabularyIds: number[]; action: 'reset' | 'delete' },
  ) {
    return this.vocabularyService.bulkResetProgress(
      req.user.userId,
      body.vocabularyIds,
      body.action
    );
  }
}