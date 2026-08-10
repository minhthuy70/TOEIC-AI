import { apiFetch } from "@/lib/api";

export interface ReadingDailyStatus {
  success: boolean;
  stage: number;
  isOddDay: boolean;
  partsForToday: number[];
  completedToday: number;
  dailyGoal: number;
}

export interface ReadingLesson {
  id: number;
  title: string;
  part: number;
  reading_lesson_groups: {
    id: number;
    passage?: string;
    image_url?: string;
    reading_questions: {
      id: number;
      question_number: number;
      question_text: string;
      reading_options: {
        id: number;
        option_key: string;
        option_text: string;
      }[];
    }[];
  }[];
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

export const getReadingDailyStatus = async (): Promise<ReadingDailyStatus> => {
  return apiFetch<ReadingDailyStatus>('/reading/daily-status');
};

export const getReadingDailyLessons = async (): Promise<ReadingDailyLessonsResponse> => {
  return apiFetch<ReadingDailyLessonsResponse>('/reading/daily-lessons');
};

export const getReadingReviewLessons = async (): Promise<ReadingReviewLessonsResponse> => {
  return apiFetch<ReadingReviewLessonsResponse>('/reading/review-lessons');
};

export const getReadingLessonById = async (id: number): Promise<{ success: boolean; lesson: ReadingLesson }> => {
  return apiFetch<{ success: boolean; lesson: ReadingLesson }>(`/reading/lesson/${id}`);
};

export const submitReadingLesson = async (lessonId: number, score: number): Promise<{ success: boolean }> => {
  return apiFetch<{ success: boolean }>('/reading/submit-lesson', {
    method: "POST",
    body: JSON.stringify({ lessonId, score }),
  });
};
