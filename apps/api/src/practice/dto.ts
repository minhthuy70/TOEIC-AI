export class StartPracticeDto {
  part: number;
  questionCount?: number;
  random?: boolean;
}

export class SubmitPracticeDto {
  sessionId: number;
  answers: Record<number, string>; // questionId -> answer (A/B/C/D)
}

export class GetPracticeQuestionsDto {
  part: number;
  questionCount?: number;
  random?: boolean;
}