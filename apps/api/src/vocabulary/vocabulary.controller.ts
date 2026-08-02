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
  // Topic List
  // =====================================================

  @Get('topics')
  topics() {
    return this.vocabularyService.getTopics();
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
}