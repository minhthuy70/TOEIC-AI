import { apiFetch } from "@/lib/api";

import type {
  GrammarCategory,
  GrammarCategoryDetail,
  GrammarLessonDetail,
} from "@/types/grammar";

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