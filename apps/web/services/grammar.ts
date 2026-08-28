import { apiFetch } from "@/lib/api";

import type {
  GrammarCategory,
  GrammarCategoryDetail,
  GrammarLessonDetail,
  GrammarDashboardData,
} from "@/types/grammar";

// ===========================================
// Grammar Dashboard
// ===========================================

export async function getGrammarDashboard() {
  return apiFetch<GrammarDashboardData>(
    "/grammar/dashboard",
  );
}

// ===========================================
// Grammar Categories
// ===========================================

export async function getGrammarCategories() {
  return apiFetch<GrammarCategory[]>(
    "/grammar/categories",
  );
}

// ===========================================
// Grammar Category Detail
// ===========================================

export async function getGrammarCategory(
  id: number,
) {
  return apiFetch<GrammarCategoryDetail>(
    `/grammar/categories/${id}`,
  );
}

// ===========================================
// Grammar Lesson Detail
// ===========================================

export async function getGrammarLesson(
  id: number,
) {
  return apiFetch<GrammarLessonDetail>(
    `/grammar/lessons/${id}`,
  );
}

// ===========================================
// Complete Grammar Lesson
// ===========================================

export async function completeGrammarLesson(
  id: number,
  score: number = 0,
) {
  return apiFetch(
    `/grammar/lessons/${id}/complete`,
    {
      method: "POST",
      body: JSON.stringify({ score }),
    },
  );
}