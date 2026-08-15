import { apiFetch } from "@/lib/api";

// ============================================================
// OPTION
// ============================================================

export type PracticeOption = {
  id: number;
  option_label: string | null;
  option_text: string | null;
};

// ============================================================
// QUESTION
// ============================================================

export type PracticeQuestion = {
  id: number;
  question_number: number | null;
  question_text: string | null;
  explanation: string | null;
  options: PracticeOption[];
};

// ============================================================
// GROUP
// ============================================================

export type PracticeGroup = {
  id: number;
  title: string | null;
  passage: string | null;
  image_url: string | null;
  audio_url: string | null;
  group_type: string | null;
  audio_start_time: number | null;
  audio_end_time: number | null;
  knowledge: string | null;

  questions: PracticeQuestion[];
};

// ============================================================
// START RESPONSE
// ============================================================

export type PracticeStartResponse = {
  sessionId: number;

  testId: number;

  testTitle: string | null;

  part: number;

  questionCount: number;

  groups: PracticeGroup[];
};

// ============================================================
// SUBMIT
// ============================================================

export type PracticeAnswer = {
  questionId: number;
  optionId: number;
};

export type SubmitPracticeRequest = {
  sessionId: number;
  answers: PracticeAnswer[];
};

export type SubmitPracticeResponse = {
  sessionId: number;
  part: number;
  total: number;
  correct: number;
  wrong: number;
  score: number;

  answers: Array<{
    questionId: number;
    optionId: number | null;
    optionLabel: string | null;
    isCorrect: boolean;
  }>;
};

// ============================================================
// HISTORY
// ============================================================

export type PracticeHistoryItem = {
  id: number;
  part: number;
  question_count: number;
  correct_count: number;
  score: number;
  started_at: string;
  completed_at: string | null;
  created_at: string;
};

// ============================================================
// START
// ============================================================

export async function startPractice(
  part: number,
): Promise<PracticeStartResponse> {
  return apiFetch(
    `/practice/start/${part}`,
    {
      method: "GET",
    },
  );
}

// ============================================================
// SUBMIT
// ============================================================

export async function submitPractice(
  data: SubmitPracticeRequest,
): Promise<SubmitPracticeResponse> {
  return apiFetch(
    "/practice/submit",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(data),
    },
  );
}

// ============================================================
// HISTORY
// ============================================================

export async function getPracticeHistory(): Promise<
  PracticeHistoryItem[]
> {
  return apiFetch(
    "/practice/history",
    {
      method: "GET",
    },
  );
}

// ============================================================
// HISTORY DETAIL
// ============================================================

export async function getPracticeHistoryDetail(
  id: number,
) {
  return apiFetch(
    `/practice/history/${id}`,
    {
      method: "GET",
    },
  );
}