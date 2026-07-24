import { Controller, Get, Param } from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';

@Controller('vocabulary')
export class VocabularyController {
  constructor(
    private readonly vocabularyService: VocabularyService,
  ) { }

  @Get('health')
  health() {
    return this.vocabularyService.healthCheck();
  }

  @Get('learning/:userId')
  learning(@Param('userId') userId: string) {
    return this.vocabularyService.learning(Number(userId));
  }

  @Get('today/:userId')
  today(@Param('userId') userId: string) {
    return this.vocabularyService.today(Number(userId));
  }
}