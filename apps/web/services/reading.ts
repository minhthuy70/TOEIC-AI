import { apiFetch } from "@/lib/api";

export interface ReadingDailyStatus {
  success: boolean;
  stage: number;
  isOddDay: boolean;
  partsForToday: number[];
  completedToday: number;
  dailyGoal: number;
}

export interface ReadingOption {
  id: number;
  option_key: string;
  option_text: string;
  is_correct?: boolean;
}

export interface ReadingQuestion {
  id: number;
  question_number: number;
  question_text: string;
  explanation?: string | null;
  knowledge?: string | null;
  reading_options: ReadingOption[];
}

export interface ReadingLessonGroup {
  id: number;
  passage?: string | null;
  image_url?: string | null;
  title?: string | null;
  knowledge?: string | null;
  display_order?: number;
  reading_questions: ReadingQuestion[];
}

export interface ReadingLesson {
  id: number;
  title: string;
  part: number;
  display_order?: number;

  groupId?: number;
  groupNumber?: number;

  reading_lesson_groups: ReadingLessonGroup[];
}

export interface ReadingDailyLessonsResponse {
  success: boolean;
  lessons: ReadingLesson[];
}

export interface ReadingReviewLessonsResponse {
  success: boolean;
  lessons: ReadingLesson[];
}

export interface ReadingLessonSummary {
  id: number;
  title: string;
  part: number;
  totalGroups: number;
  totalQuestions: number;
  lastStudied: string | null;
  best_score: number | null;
}

export interface ReadingCompletedLessonsResponse {
  success: boolean;
  lessons: ReadingLessonSummary[];
}

export const getReadingDailyStatus =
  async (): Promise<ReadingDailyStatus> => {
    return apiFetch<ReadingDailyStatus>(
      "/reading/daily-status",
    );
  };

export const getReadingDailyLessons =
  async (): Promise<ReadingDailyLessonsResponse> => {
    return apiFetch<ReadingDailyLessonsResponse>(
      "/reading/daily-lessons",
    );
  };

export const getReadingReviewLessons =
  async (): Promise<ReadingReviewLessonsResponse> => {
    return apiFetch<ReadingReviewLessonsResponse>(
      "/reading/review-lessons",
    );
  };

export const getReadingCompletedLessons =
  async (): Promise<ReadingCompletedLessonsResponse> => {
    return apiFetch<ReadingCompletedLessonsResponse>(
      "/reading/completed-lessons",
    );
  };

export const getReadingLessonById =
  async (
    id: number,
    groupId?: number,
  ): Promise<{
    success: boolean;
    lesson: ReadingLesson | null;
  }> => {
    const query = groupId
      ? `?groupId=${groupId}`
      : "";

    return apiFetch<{
      success: boolean;
      lesson: ReadingLesson | null;
    }>(
      `/reading/lesson/${id}${query}`,
    );
  };

export const submitReadingLesson = async (
  lessonId: number,
  groupId: number,
  score: number,
): Promise<{ success: boolean }> => {
  return apiFetch<{
    success: boolean;
  }>("/reading/submit-lesson", {
    method: "POST",
    body: JSON.stringify({
      lessonId,
      groupId,
      score,
    }),
  });
};