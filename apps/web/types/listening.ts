export interface ListeningScoreByPart {
  part: number;
  score: number;
  accuracy: number;
  totalQuestions: number;
}

export interface ListeningDashboardResponse {
  success: boolean;
  overallScore: number;
  scoreByPart: ListeningScoreByPart[];
  accuracyRate: number;
  averageTimePerQuestion: number;
  streak: number;
  totalQuestionsCompleted: number;
  weakParts: number[];
}
