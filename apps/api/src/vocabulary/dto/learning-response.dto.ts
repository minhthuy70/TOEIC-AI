export class LearningResponseDto {
  success: boolean;

  mode: 'NEW' | 'REVIEW' | 'DONE_TODAY' | 'PRACTICE';

  words: any[];
}