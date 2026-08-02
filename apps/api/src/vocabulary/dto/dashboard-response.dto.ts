export class DashboardResponseDto {
  success: boolean;

  stage: number;

  currentScore: number | null;

  targetScore: number | null;

  totalWords: number;

  totalLearned: number;

  totalStageWords: number;

  learnedToday: number;

  dailyGoal: number;

  remainToday: number;

  learning: number;

  review: number;

  mastered: number;

  progress: number;
}