export class LearningResponseDto {
    currentStage: number;

    currentScore: number;

    targetScore: number;

    learnedToday: number;

    newWordsLeft: number;

    reviewWords: number;

    canUnlockNextStage: boolean;

    topics: string[];
}