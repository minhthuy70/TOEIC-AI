import { Controller, Get, Param } from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';

@Controller('vocabulary')
export class VocabularyController {
  constructor(
    private readonly vocabularyService: VocabularyService,
  ) { }

  @Get('health')
  async health() {
    return this.vocabularyService.healthCheck();
  }

  @Get('learning/:userId')
  async learning(
    @Param('userId') userId: string,
  ) {
    return this.vocabularyService.learning(Number(userId));
  }
}