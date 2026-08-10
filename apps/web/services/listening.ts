import { apiFetch } from "@/lib/api";

// ===========================================
// Types
// ===========================================

export interface ListeningDailyStatus {
  success: boolean;
  stage: number;
  isOddDay: boolean;
  partsForToday: number[];
  completedToday: number;
  dailyGoal: number;
}

export interface ListeningOption {
  id: number;
  question_id: number;
  option_label: string;
  option_text: string | null;
  is_correct: boolean;
  display_order: number;
}

export interface ListeningQuestion {
  id: number;
  group_id: number;
  question_number: number;
  question_text: string | null;
  explanation: string | null;
  knowledge: string | null;
  display_order: number;
  listening_lesson_options: ListeningOption[];
}

export interface ListeningGroup {
  id: number;
  lesson_id: number;
  title: string | null;
  audio_url: string | null;
  image_url: string | null;
  start_seconds: number | null;
  end_seconds: number | null;
  display_order: number;
  knowledge: string | null;
  part: number;
  listening_lesson_questions: ListeningQuestion[];
}

export interface ListeningDailyGroups {
  success: boolean;
  groups: ListeningGroup[];
}

export interface ListeningReviewGroups {
  success: boolean;
  groups: ListeningGroup[];
}

export interface ListeningSubmitResult {
  success: boolean;
  message: string;
}

// ===========================================
// API Calls
// ===========================================

export async function getListeningDailyStatus() {
  return apiFetch<ListeningDailyStatus>(
    "/listening/daily-status",
  );
}

export interface ListeningGroupResponse {
  success: boolean;
  group: ListeningGroup | null;
}

export async function getListeningDailyGroups() {
  return apiFetch<ListeningDailyGroups>(
    "/listening/daily-groups",
  );
}

export async function getListeningReviewGroups() {
  return apiFetch<ListeningReviewGroups>(
    "/listening/review-groups",
  );
}

export async function getListeningGroupById(groupId: number) {
  return apiFetch<ListeningGroupResponse>(
    `/listening/group/${groupId}`,
  );
}

export interface ListeningLessonSummary {
  id: number;
  title: string;
  part: number;
  totalGroups: number;
  totalQuestions: number;
  lastStudied: string | null;
}

export interface ListeningCompletedLessonsResponse {
  success: boolean;
  lessons: ListeningLessonSummary[];
}

export interface ListeningLessonReviewResponse {
  success: boolean;
  lesson: {
    id: number;
    title: string;
    part: number;
    listening_lesson_groups: Array<{
      id: number;
      lesson_id: number;
      title: string | null;
      audio_url: string | null;
      display_order: number;
      knowledge: string | null;
      listening_lesson_questions: ListeningQuestion[];
    }>;
  } | null;
}

export interface ListeningAllLessonsReviewResponse {
  success: boolean;
  lessons: Array<{
    id: number;
    title: string;
    part: number;
    listening_lesson_groups: Array<{
      id: number;
      lesson_id: number;
      title: string | null;
      audio_url: string | null;
      display_order: number;
      knowledge: string | null;
      listening_lesson_questions: ListeningQuestion[];
    }>;
  }>;
}

export async function getListeningCompletedLessons() {
  return apiFetch<ListeningCompletedLessonsResponse>(
    "/listening/completed-lessons",
  );
}

export async function getListeningLessonReview(lessonId: number) {
  return apiFetch<ListeningLessonReviewResponse>(
    `/listening/review/lesson/${lessonId}`,
  );
}

export async function getListeningAllLessonReview() {
  return apiFetch<ListeningAllLessonsReviewResponse>(
    `/listening/review/all`,
  );
}

export async function submitListeningGroup(
  groupId: number,
  score: number,
) {
  return apiFetch<ListeningSubmitResult>(
    "/listening/submit-group",
    {
      method: "POST",
      body: JSON.stringify({ groupId, score }),
    },
  );
}
