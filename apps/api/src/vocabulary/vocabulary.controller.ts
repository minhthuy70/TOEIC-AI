import { Controller, Get, Param } from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import { Body, Post } from '@nestjs/common';
import { LearnDto } from './dto/learn.dto';
import { ReviewDto } from './dto/review.dto';

@Controller('vocabulary')
export class VocabularyController {
  constructor(
    private readonly vocabularyService: VocabularyService,
  ) { }

  @Get('health')
  health() {
    return this.vocabularyService.healthCheck();
  }

  @Get('today/:userId')
  today(@Param('userId') userId: string) {
    return this.vocabularyService.today(Number(userId));
  }

  @Post('learn')
  learn(
    @Body() dto: LearnDto,
  ) {
    return this.vocabularyService.learn(dto);
  }

  @Post('review')
  review(
    @Body() dto: ReviewDto,
  ) {
    return this.vocabularyService.review(dto);
  }

  @Get('learn/:userId')
  learnWords(
    @Param('userId') userId: string,
  ) {
    return this.vocabularyService.learnWords(Number(userId));
  }

  @Get('srs-status/:userId')
  getSrsStatus(
    @Param('userId') userId: string,
  ) {
    return this.vocabularyService.getSrsStatus(Number(userId));
  }
}
