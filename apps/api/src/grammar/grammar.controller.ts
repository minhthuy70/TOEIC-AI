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
import { StartExerciseDto, SubmitExerciseDto } from "./dto/exercise.dto";

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
  // GET /grammar/exercises
  // =====================================================

  @Get("exercises")
  getExercises(@Request() req) {
    return this.grammarService.getExercisesList(
      req.user.userId,
    );
  }

  // =====================================================
  // POST /grammar/exercises/start
  // =====================================================

  @Post("exercises/start")
  startExercise(
    @Request() req,
    @Body() dto: StartExerciseDto,
  ) {
    return this.grammarService.startExercise(
      req.user.userId,
      dto,
    );
  }

  // =====================================================
  // POST /grammar/exercises/submit
  // =====================================================

  @Post("exercises/submit")
  submitExercise(
    @Request() req,
    @Body() dto: SubmitExerciseDto,
  ) {
    return this.grammarService.submitExercise(
      req.user.userId,
      dto,
    );
  }

  // =====================================================
  // GET /grammar/reference
  // =====================================================

  @Get("reference")
  getReferenceRules(
    @Request() req,
  ) {
    const search = req.query?.search;
    const category = req.query?.category;
    return this.grammarService.getReferenceRules(
      req.user.userId,
      search,
      category,
    );
  }

  // =====================================================
  // GET /grammar/reference/:id
  // =====================================================

  @Get("reference/:id")
  getReferenceRuleDetail(
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.grammarService.getReferenceRuleDetail(id);
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