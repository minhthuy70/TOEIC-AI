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

// Temporarily disable auth guard for testing
// TODO: Re-enable @UseGuards(JwtAuthGuard) after fixing authentication
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
    req.user?.userId || 1, // Default to user ID 1 for testing
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
    req.user?.userId || 1, // Default to user ID 1 for testing
  );
}

  // =====================================================
  // Topic List
  // =====================================================

  @Get('topics')
  topics(@Request() req) {
    return this.vocabularyService.getTopics(req.user?.userId || 1); // Default to user ID 1 for testing
  }

  // =====================================================
  // Today's Learning
  // =====================================================

  @Get("today")
today(
  @Request() req,
) {
  return this.vocabularyService.today(
    req.user?.userId || 1, // Default to user ID 1 for testing
  );
}


  // =====================================================
  // Lessons List
  // =====================================================

  @Get("lessons")
  getLessons(
    @Request() req,
  ) {
    return this.vocabularyService.getLessons(req.user?.userId || 1); // Default to user ID 1 for testing
  }

  // =====================================================
  // Lesson Detail
  // =====================================================

  @Get("lessons/:lesson")
  getLessonWords(
    @Request() req,
    @Param("lesson", ParseIntPipe) lesson: number,
  ) {
    return this.vocabularyService.getLessonWords(req.user?.userId || 1, lesson); // Default to user ID 1 for testing
  }

  // =====================================================
  // Review Levels List
  // =====================================================

  @Get("review-levels")
  getReviewLevels(
    @Request() req,
  ) {
    return this.vocabularyService.getReviewLevels(req.user?.userId || 1); // Default to user ID 1 for testing
  }

  // =====================================================
  // Review Level Words
  // =====================================================

  @Get("review-words/:level")
  getReviewWords(
    @Request() req,
    @Param("level", ParseIntPipe) level: number,
  ) {
    return this.vocabularyService.getReviewWords(req.user?.userId || 1, level); // Default to user ID 1 for testing
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
    @Query('sort') sort?: 'asc' | 'desc',
  ) {
    return this.vocabularyService.getWordsFiltered(req.user?.userId || 1, { // Default to user ID 1 for testing
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      stage: stage ? Number(stage) : undefined,
      topic,
      search,
      sort,
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
  dto.userId = req.user?.userId || 1; // Default to user ID 1 for testing

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
  dto.userId = req.user?.userId || 1; // Default to user ID 1 for testing

  return this.vocabularyService.review(dto);
}
}