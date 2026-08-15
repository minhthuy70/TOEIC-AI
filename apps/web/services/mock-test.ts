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