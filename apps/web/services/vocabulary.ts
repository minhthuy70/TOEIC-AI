import { apiFetch } from "@/lib/api";

import type {
  DashboardResponse,
  LearnResponse,
  ReviewResponse,
  SrsResponse,
  TodayLearningResponse,
  Topic,
  VocabularyListResponse,
  VocabularyWord,
  LessonsResponse,
  LessonWordsResponse,
  ReviewLevelsResponse,
  ReviewWordsResponse,
  VocabularyStatisticsResponse,
} from "@/types/vocabulary";

// ======================================================
// Dashboard
// ======================================================

export async function getDashboard() {
  return apiFetch<DashboardResponse>(
    "/vocabulary/dashboard",
  );
}

// ======================================================
// SRS
// ======================================================

export async function getSrs() {
  return apiFetch<SrsResponse>(
    "/vocabulary/srs",
  );
}

// ======================================================
// Today's Learning
// ======================================================

export async function getToday() {
  return apiFetch<TodayLearningResponse>(
    "/vocabulary/today",
  );
}

// ======================================================
// Topics
// ======================================================

export async function getTopics() {
  return apiFetch<Topic[]>(
    "/vocabulary/topics",
  );
}

// ======================================================
// Vocabulary List
// ======================================================

export async function getWords(
  page = 1,
  limit = 20,
  topic?: string,
) {
  let url =
    `/vocabulary?page=${page}&limit=${limit}`;

  if (topic) {
    url += `&topic=${encodeURIComponent(topic)}`;
  }

  return apiFetch<VocabularyListResponse>(
    url,
  );
}

// ======================================================
// Vocabulary Detail
// ======================================================

export async function getWord(
  id: number,
) {
  return apiFetch<VocabularyWord>(
    `/vocabulary/${id}`,
  );
}

// ======================================================
// Learn Word
// ======================================================

export async function learnWord(
  vocabularyId: number,
) {
  return apiFetch<LearnResponse>(
    "/vocabulary/learn",
    {
      method: "POST",

      body: JSON.stringify({
        vocabularyId,
      }),
    },
  );
}

// ======================================================
// Review Word
// ======================================================

export async function reviewWord(
  vocabularyId: number,
) {
  return apiFetch<ReviewResponse>(
    "/vocabulary/review",
    {
      method: "POST",

      body: JSON.stringify({
        vocabularyId,
      }),
    },
  );
}

// ======================================================
// Lessons
// ======================================================

export async function getLessons() {
  return apiFetch<LessonsResponse>("/vocabulary/lessons");
}

export async function getLessonWords(lessonNumber: number) {
  return apiFetch<LessonWordsResponse>(`/vocabulary/lessons/${lessonNumber}`);
}

// ======================================================
// Review Levels
// ======================================================

export async function getReviewLevels() {
  return apiFetch<ReviewLevelsResponse>("/vocabulary/review-levels");
}

export async function getReviewWords(level: number) {
  return apiFetch<ReviewWordsResponse>(`/vocabulary/review-words/${level}`);
}

// ======================================================
// Filtered/Searched Vocabulary List
// ======================================================

export async function getWordsFiltered(query: {
  page?: number;
  limit?: number;
  stage?: number;
  topic?: string;
  search?: string;
  sort?: "alphabet_asc" | "alphabet_desc" | "learned_asc" | "learned_desc" | "review_asc" | "review_desc";
  status?: string;
  srsLevel?: number;
}) {
  let url = "/vocabulary/filtered?";
  const params = [];
  if (query.page) params.push(`page=${query.page}`);
  if (query.limit) params.push(`limit=${query.limit}`);
  if (query.stage) params.push(`stage=${query.stage}`);
  if (query.topic) params.push(`topic=${encodeURIComponent(query.topic)}`);
  if (query.search) params.push(`search=${encodeURIComponent(query.search)}`);
  if (query.sort) params.push(`sort=${query.sort}`);
  if (query.status) params.push(`status=${query.status}`);
  if (query.srsLevel) params.push(`srsLevel=${query.srsLevel}`);

  url += params.join("&");
  return apiFetch<VocabularyListResponse>(url);
}

// ======================================================
// Update Notes
// ======================================================

export async function updateVocabularyNotes(
  vocabularyId: number,
  notes: string | null,
  customExample: string | null
) {
  return apiFetch<{ success: boolean; message: string }>(
    "/vocabulary/notes",
    {
      method: "POST",
      body: JSON.stringify({ vocabularyId, notes, customExample }),
    }
  );
}

// ======================================================
// Bulk Operations
// ======================================================

export async function bulkResetVocabularyProgress(
  vocabularyIds: number[],
  action: "reset" | "delete"
) {
  return apiFetch<{ success: boolean; message: string }>(
    "/vocabulary/bulk-reset",
    {
      method: "POST",
      body: JSON.stringify({ vocabularyIds, action }),
    }
  );
}

// ======================================================
// Statistics
// ======================================================

export async function getVocabularyStatistics() {
  return apiFetch<VocabularyStatisticsResponse>("/vocabulary/statistics");
}