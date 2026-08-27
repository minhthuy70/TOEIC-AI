import { apiFetch } from "@/lib/api";
import { ListeningDashboardResponse } from "@/types/listening";

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
// Lesson summary
// ===========================================

export interface ListeningLessonSummary {
  id: number;
  title: string;
  part: number;

  totalGroups: number;
  totalQuestions: number;

  lastStudied: string | null;
}

// ===========================================
// Lesson review
// ===========================================

export interface ListeningLessonReview {
  id: number;
  title: string;
  part: number;

  listening_lesson_groups: ListeningGroup[];
}

export interface ListeningLessonReviewResponse {
  success: boolean;
  lesson: ListeningLessonReview | null;
}

// ===========================================
// All lessons review
// ===========================================

export interface ListeningAllLessonsReview {
  id: number;
  title: string;
  part: number;

  listening_lesson_groups: ListeningGroup[];
}

export interface ListeningAllLessonsReviewResponse {
  success: boolean;
  lessons: ListeningAllLessonsReview[];
}

// ===========================================
// Group response
// ===========================================

export interface ListeningGroupResponse {
  success: boolean;
  group: ListeningGroup | null;
}

// ===========================================
// Completed lessons response
// ===========================================

export interface ListeningCompletedLessonsResponse {
  success: boolean;
  lessons: ListeningLessonSummary[];
}

// ===========================================
// API Calls
// ===========================================

/**
 * Lấy trạng thái Listening hôm nay
 */
export async function getListeningDailyStatus() {
  return apiFetch<ListeningDailyStatus>(
    "/listening/daily-status",
  );
}

/**
 * Lấy các group Listening dành cho hôm nay
 */
export async function getListeningDailyGroups() {
  return apiFetch<ListeningDailyGroups>(
    "/listening/daily-groups",
  );
}

/**
 * Lấy các group mà user đã học
 *
 * Đây là API chính dùng cho trang Ôn tập.
 */
export async function getListeningReviewGroups() {
  return apiFetch<ListeningReviewGroups>(
    "/listening/review-groups",
  );
}

/**
 * Lấy một group Listening theo ID
 */
export async function getListeningGroupById(
  groupId: number,
) {
  return apiFetch<ListeningGroupResponse>(
    `/listening/group/${groupId}`,
  );
}

/**
 * Lấy danh sách các lesson đã hoàn thành
 */
export async function getListeningCompletedLessons() {
  return apiFetch<ListeningCompletedLessonsResponse>(
    "/listening/completed-lessons",
  );
}

/**
 * Lấy review của một lesson
 */
export async function getListeningLessonReview(
  lessonId: number,
) {
  return apiFetch<ListeningLessonReviewResponse>(
    `/listening/review/lesson/${lessonId}`,
  );
}

/**
 * Lấy review của toàn bộ lesson
 */
export async function getListeningAllLessonReview() {
  return apiFetch<ListeningAllLessonsReviewResponse>(
    "/listening/review/all",
  );
}

/**
 * Submit kết quả một group Listening
 */
export async function submitListeningGroup(
  groupId: number,
  score: number,
) {
  return apiFetch<ListeningSubmitResult>(
    "/listening/submit-group",
    {
      method: "POST",
      body: JSON.stringify({
        groupId,
        score,
      }),
    },
  );
}

// ===========================================
// Dashboard
// ===========================================

export async function getListeningDashboard() {
  return apiFetch<ListeningDashboardResponse>("/listening/dashboard");
}