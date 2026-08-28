import { apiFetch } from "@/lib/api";

import type {
  GrammarCategory,
  GrammarCategoryDetail,
  GrammarLessonDetail,
  GrammarDashboardData,
  GrammarExerciseTopic,
  GrammarExerciseSession,
  GrammarExerciseSubmitResult,
  StartGrammarExerciseDto,
  SubmitGrammarExerciseDto,
  GrammarReferenceRuleSummary,
  GrammarReferenceDetail,
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
// Grammar Exercises
// ===========================================

export async function getGrammarExercises() {
  return apiFetch<GrammarExerciseTopic[]>(
    "/grammar/exercises",
  );
}

export async function startGrammarExercise(dto: StartGrammarExerciseDto) {
  return apiFetch<GrammarExerciseSession>(
    "/grammar/exercises/start",
    {
      method: "POST",
      body: JSON.stringify(dto),
    },
  );
}

export async function submitGrammarExercise(dto: SubmitGrammarExerciseDto) {
  return apiFetch<GrammarExerciseSubmitResult>(
    "/grammar/exercises/submit",
    {
      method: "POST",
      body: JSON.stringify(dto),
    },
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

// ===========================================
// Grammar Reference
// ===========================================

export async function getGrammarReferenceRules(params?: { search?: string; category?: string }) {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.category) query.append("category", params.category);
  const qs = query.toString();

  return apiFetch<GrammarReferenceRuleSummary[]>(
    `/grammar/reference${qs ? `?${qs}` : ""}`,
  );
}

export async function getGrammarReferenceDetail(id: number) {
  return apiFetch<GrammarReferenceDetail>(
    `/grammar/reference/${id}`,
  );
}

// ===========================================
// Grammar Settings
// ===========================================

export async function getGrammarSettings() {
  return apiFetch<any>("/grammar/settings");
}

export async function updateGrammarSettings(settings: any) {
  return apiFetch<any>("/grammar/settings", {
    method: "POST",
    body: JSON.stringify(settings),
  });
}