import { apiFetch } from "@/lib/api";

// ============================================================
// TEST
// ============================================================

export type MockTest = {
  id: number;
  title: string | null;
  duration: number | null;
  total_questions: number | null;
  description: string | null;
  is_active: boolean | null;
};

// ============================================================
// OPTION
// ============================================================

export type MockTestOption = {
  id: number;
  label: string | null;
  text: string | null;
};

// ============================================================
// QUESTION
// ============================================================

export type MockTestQuestion = {
  id: number;

  questionNumber: number | null;

  questionText: string | null;

  part: number;

  groupId: number;

  groupTitle: string | null;

  passage: string | null;

  imageUrl: string | null;

  audioUrl: string | null;

  groupType: string | null;

  audioStartTime: number | null;

  audioEndTime: number | null;

  options: MockTestOption[];
};

// ============================================================
// START RESPONSE
// ============================================================

export type MockTestStartResponse = {
  attemptId: number;

  testId: number;

  testTitle: string;

  duration: number;

  totalQuestions: number;

  startedAt: string;

  questions: MockTestQuestion[];
};

// ============================================================
// ANSWER
// ============================================================

export type MockTestAnswer = {
  questionId: number;
  optionId: number;
};

// ============================================================
// SUBMIT RESPONSE
// ============================================================

export type MockTestSubmitResponse = {
  attemptId: number;

  testId: number;

  listeningScore: number;

  readingScore: number;

  totalScore: number;

  listeningCorrect: number;

  readingCorrect: number;

  totalCorrect: number;

  listeningTotal: number;

  readingTotal: number;

  totalQuestions: number;

  submittedAt: string;
};

// ============================================================
// HISTORY
// ============================================================

export type MockTestHistoryItem = {
  id: number;

  testId: number;

  testTitle: string;

  totalQuestions: number;

  totalScore: number | null;

  listeningScore: number | null;

  readingScore: number | null;

  listeningCorrect: number | null;

  readingCorrect: number | null;

  totalCorrect: number | null;

  startedAt: string;

  submittedAt: string | null;

  createdAt: string;
};

// ============================================================
// ATTEMPT DETAIL
// ============================================================

export type MockTestAttemptResponse = {
  id: number;

  testId: number;

  testTitle: string;

  duration: number;

  totalQuestions: number;

  listeningScore: number | null;

  readingScore: number | null;

  totalScore: number | null;

  listeningCorrect: number | null;

  readingCorrect: number | null;

  totalCorrect: number | null;

  startedAt: string;

  submittedAt: string | null;

  answers: MockTestAnswer[];

  questions: MockTestQuestion[];
};

// ============================================================
// RESULT OPTION
// ============================================================

export type MockTestResultOption =
  MockTestOption & {
    isSelected: boolean;
    isCorrect: boolean;
  };

// ============================================================
// RESULT QUESTION
// ============================================================

export type MockTestResultQuestion = {
  id: number;

  questionNumber: number | null;

  questionText: string | null;

  part: number;

  groupId: number;

  groupTitle: string | null;

  passage: string | null;

  imageUrl: string | null;

  audioUrl: string | null;

  groupType: string | null;

  audioStartTime: number | null;

  audioEndTime: number | null;

  selectedOptionId: number | null;

  correctOptionId: number | null;

  correctAnswer: string | null;

  isCorrect: boolean;

  isAnswered: boolean;

  options: MockTestResultOption[];
  transcript?: string | null;
  evidence?: string | null;
};

// ============================================================
// PART STAT
// ============================================================

export type MockTestPartStat = {
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
};

// ============================================================
// RESULT RESPONSE
// ============================================================

export type MockTestResultResponse = {
  attemptId: number;

  testId: number;

  testTitle: string;

  duration: number;

  totalQuestions: number;

  listeningTotal: number;

  readingTotal: number;

  listeningCorrect: number;

  readingCorrect: number;

  totalCorrect: number;

  totalAnswered: number;

  totalWrong: number;

  unanswered: number;

  listeningScore: number;

  readingScore: number;

  totalScore: number;

  percentileRanking?: number;

  performanceComparison?: {
    systemAverage: number;
    userDelta: number;
    targetScore: number;
    targetDelta: number;
  };

  startedAt: string;

  submittedAt: string;

  partStats: Record<
    number,
    MockTestPartStat
  >;

  questions: MockTestResultQuestion[];
};

// ============================================================
// GET TESTS
// ============================================================

export async function getMockTests(): Promise<
  MockTest[]
> {
  return apiFetch<MockTest[]>(
    "/mock-test/tests",
  );
}

// ============================================================
// START
// ============================================================

export async function startMockTest(
  testId: number,
): Promise<MockTestStartResponse> {
  return apiFetch<MockTestStartResponse>(
    "/mock-test/start",
    {
      method: "POST",
      body: JSON.stringify({
        testId,
      }),
    },
  );
}

export async function startCustomFullTest(dto: {
  testId?: number;
  mode?: "standard" | "custom";
  parts?: number[];
  listeningDuration?: number;
  readingDuration?: number;
  totalQuestions?: number;
}): Promise<MockTestStartResponse> {
  return apiFetch<MockTestStartResponse>("/mock-test/custom-test/start", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

// ============================================================
// SUBMIT
// ============================================================

export async function submitMockTest(
  payload: {
    attemptId: number;
    answers: MockTestAnswer[];
  },
): Promise<MockTestSubmitResponse> {
  return apiFetch<MockTestSubmitResponse>(
    "/mock-test/submit",
    {
      method: "POST",

      body: JSON.stringify(
        payload,
      ),
    },
  );
}

// ============================================================
// HISTORY
// ============================================================

export async function getMockTestHistory(): Promise<
  MockTestHistoryItem[]
> {
  return apiFetch<MockTestHistoryItem[]>(
    "/mock-test/history",
  );
}

// ============================================================
// DELETE HISTORY ITEM
// DELETE /mock-test/history/:attemptId
// ============================================================

export async function deleteMockTestAttempt(
  attemptId: number,
): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>(
    `/mock-test/history/${attemptId}`,
    {
      method: "DELETE",
    },
  );
}

// ============================================================
// ATTEMPT
// ============================================================

export async function getMockTestAttempt(
  attemptId: number,
): Promise<MockTestAttemptResponse> {
  return apiFetch<MockTestAttemptResponse>(
    `/mock-test/attempt/${attemptId}`,
  );
}

// ============================================================
// RESULT
//
// GET /mock-test/result/:attemptId
// ============================================================

export async function getMockTestResult(
  attemptId: number,
): Promise<MockTestResultResponse> {
  return apiFetch<MockTestResultResponse>(
    `/mock-test/result/${attemptId}`,
  );
}

// ============================================================
// MINI TEST TYPES & API
// ============================================================

export interface MiniTestQuestion {
  id: number;
  groupId: number;
  part: number;
  title: string | null;
  passage: string | null;
  imageUrl: string | null;
  audioUrl: string | null;
  audioStartTime: number | null;
  audioEndTime: number | null;
  questionNumber: number | null;
  questionText: string | null;
  testQuestionNumber: number;
  options: {
    id: number;
    label: string;
    text: string;
  }[];
}

export interface MiniTestStartResponse {
  success: boolean;
  testTitle: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  timeLimitSeconds: number;
  selectedParts: number[];
  questions: MiniTestQuestion[];
}

export interface MiniTestResultItem {
  questionId: number;
  part: number;
  passage: string | null;
  imageUrl: string | null;
  audioUrl: string | null;
  questionText: string | null;
  selectedOptionId: number | null;
  selectedLabel: string;
  selectedText: string;
  correctOptionId: number;
  correctLabel: string;
  correctText: string;
  isCorrect: boolean;
  explanation: string;
  options: {
    id: number;
    label: string;
    text: string;
    isCorrect: boolean;
  }[];
}

export interface MiniTestPartBreakdown {
  part: number;
  name: string;
  correct: number;
  total: number;
  accuracy: number;
  timeSeconds: number;
  avgSecondsPerQuestion: number;
}

export interface MiniTestSubmitResponse {
  success: boolean;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  listeningScore: number;
  readingScore: number;
  totalScore: number;
  durationSeconds: number;
  partBreakdown: MiniTestPartBreakdown[];
  results: MiniTestResultItem[];
  incorrectQuestions: MiniTestResultItem[];
}

export async function startMiniTest(dto: {
  parts?: number[];
  timeLimitMinutes?: number;
  totalQuestions?: number;
  testId?: number;
}): Promise<MiniTestStartResponse> {
  return apiFetch<MiniTestStartResponse>("/mock-test/mini-test/start", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function submitMiniTest(dto: {
  answers: Array<{ questionId: number; optionId: number }>;
  durationSeconds?: number;
  partTimes?: Record<number, number>;
  markedQuestionIds?: number[];
}): Promise<MiniTestSubmitResponse> {
  return apiFetch<MiniTestSubmitResponse>("/mock-test/mini-test/submit", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

// ============================================================
// 7.4 TEST ANALYTICS TYPES & API
// ============================================================

export interface MockTestAnalyticsResponse {
  totalTests: number;
  scoreTrends: Array<{
    attemptIndex: number;
    attemptId: number;
    testTitle: string;
    date: string;
    totalScore: number;
    listeningScore: number;
    readingScore: number;
  }>;
  accuracyTrends: Array<{
    attemptIndex: number;
    attemptId: number;
    date: string;
    overallAccuracy: number;
    listeningAccuracy: number;
    readingAccuracy: number;
  }>;
  timeTrends: Array<{
    attemptIndex: number;
    attemptId: number;
    date: string;
    durationMinutes: number;
    totalScore: number;
  }>;
  partPerformance: Array<{
    part: number;
    name: string;
    total: number;
    correct: number;
    accuracy: number;
  }>;
  strengths: Array<{
    part: number;
    name: string;
    accuracy: number;
    tip: string;
  }>;
  weaknesses: Array<{
    part: number;
    name: string;
    accuracy: number;
    tip: string;
  }>;
  progressOverTime: {
    firstScore: number;
    latestScore: number;
    improvementPoints: number;
    trendDirection: "improving" | "stable" | "declining";
  };
  predictedScore: {
    score: number;
    minScore: number;
    maxScore: number;
    confidence: string;
  };
  goalProgress: {
    targetScore: number;
    currentScore: number;
    gap: number;
    percentage: number;
    listeningTarget: number;
    readingTarget: number;
    listeningCurrent: number;
    readingCurrent: number;
  };
  studyTimeVsScoreCorrelation: Array<{
    attemptId: number;
    cumulativeHours: number;
    score: number;
    date: string;
  }>;
}

export async function getMockTestAnalytics(): Promise<MockTestAnalyticsResponse> {
  return apiFetch<MockTestAnalyticsResponse>("/mock-test/analytics");
}