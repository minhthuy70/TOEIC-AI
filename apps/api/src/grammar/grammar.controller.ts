import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";

import { GrammarService } from "./grammar.service";
import { CompleteLessonDto } from "./dto/complete-lesson.dto";

// Temporarily disable auth guard for testing
// TODO: Re-enable @UseGuards(JwtAuthGuard) after fixing authentication
@Controller("grammar")
export class GrammarController {
  constructor(
    private readonly grammarService: GrammarService,
  ) {}

  // =====================================================
  // GET /grammar/categories
  // =====================================================

  @Get("categories")
  getCategories(@Request() req) {
    return this.grammarService.getCategories(
      req.user?.userId || 1, // Default to user ID 1 for testing
    );
  }

  // =====================================================
  // GET /grammar/categories/:id
  // =====================================================

  @Get("categories/:id")
  getCategory(
    @Request() req,
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.grammarService.getCategory(
      id,
      req.user?.userId || 1, // Default to user ID 1 for testing
    );
  }

  // =====================================================
  // GET /grammar/lessons/:id
  // =====================================================

  @Get("lessons/:id")
  getLesson(
    @Request() req,
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.grammarService.getLesson(
      id,
      req.user?.userId || 1, // Default to user ID 1 for testing
    );
  }

  // =====================================================
  // POST /grammar/lessons/:id/complete
  // =====================================================

  @Post("lessons/:id/complete")
  completeLesson(
    @Request() req,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: CompleteLessonDto,
  ) {
    return this.grammarService.completeLesson(
      id,
      req.user?.userId || 1, // Default to user ID 1 for testing
      dto,
    );
  }
}