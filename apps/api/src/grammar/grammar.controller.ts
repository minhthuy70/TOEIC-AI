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

@UseGuards(JwtAuthGuard)
@Controller("grammar")
export class GrammarController {
  constructor(
    private readonly grammarService: GrammarService,
  ) {}

  // =====================================================
  // GET /grammar/dashboard
  // =====================================================

  @Get("dashboard")
  getDashboard(@Request() req) {
    return this.grammarService.getDashboard(
      req.user.userId,
    );
  }

  // =====================================================
  // GET /grammar/categories
  // =====================================================

  @Get("categories")
  getCategories(@Request() req) {
    return this.grammarService.getCategories(
      req.user.userId,
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
      req.user.userId,
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
      req.user.userId,
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
      req.user.userId,
      dto,
    );
  }
}