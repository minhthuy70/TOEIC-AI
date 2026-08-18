import { apiFetch } from "@/lib/api";

interface AdminStats {
  users: number;
  vocabulary: number;
  grammarLessons: number;
  tests: number;
}

export async function getAdminStats() {
  return apiFetch<AdminStats>("/admin/stats");
}

// ======================================================
// TESTS MANAGEMENT
// ======================================================

interface Option {
  id: number;
  option_label: string | null;
  option_text: string | null;
  is_correct: boolean | null;
  display_order: number | null;
}

export interface Question {
  id: number;
  group_id: number | null;
  question_number: number | null;
  question_text: string | null;
  correct_answer: string | null;
  explanation: string | null;
  display_order: number | null;
  options: Option[];
}

export interface QuestionGroup {
  id: number;
  test_id: number | null;
  part: number | null;
  title: string | null;
  passage: string | null;
  image_url: string | null;
  audio_url: string | null;
  display_order: number | null;
  group_type: string | null;
  audio_start_time: number | null;
  audio_end_time: number | null;
  knowledge: string | null;
  questions: Question[];
  _count?: { questions?: number };
}

interface GrammarLesson {
  id: number;
  title: string;
}

export interface Test {
  id: number;
  title: string | null;
  description: string | null;
  duration: number | null;
  total_questions: number | null;
  is_active: boolean | null;
  created_at: string;
  question_groups: QuestionGroup[];
  grammar_lessons: GrammarLesson[];
  _count: {
    question_groups: number;
    grammar_lessons: number;
  };
}

interface TestsResponse {
  items: Test[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TestForm {
  title: string;
  description: string;
  duration: number;
  total_questions: number;
  is_active: boolean;
}

export async function getTests(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  let url = "/admin/tests";
  const queryParams = [];
  
  if (params?.page) queryParams.push(`page=${params.page}`);
  if (params?.limit) queryParams.push(`limit=${params.limit}`);
  if (params?.search) queryParams.push(`search=${encodeURIComponent(params.search)}`);
  
  if (queryParams.length > 0) {
    url += `?${queryParams.join("&")}`;
  }
  
  return apiFetch<TestsResponse>(url);
}

export async function getTest(id: number) {
  return apiFetch<Test>(`/admin/tests/${id}`);
}

export async function createTest(data: TestForm) {
  return apiFetch("/admin/tests", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTest(id: number, data: TestForm) {
  return apiFetch(`/admin/tests/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteTest(id: number) {
  return apiFetch(`/admin/tests/${id}`, {
    method: "DELETE",
  });
}

// ======================================================
// QUESTION GROUPS MANAGEMENT
// ======================================================

export interface QuestionGroupForm {
  part?: number;
  title?: string;
  passage?: string;
  image_url?: string;
  audio_url?: string;
  display_order?: number;
  group_type?: string;
  audio_start_time?: number | null;
  audio_end_time?: number | null;
  knowledge?: string;
}

interface QuestionGroupsResponse {
  items: QuestionGroup[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getQuestionGroups(testId: number, params?: {
  page?: number;
  limit?: number;
}) {
  let url = `/admin/tests/${testId}/question-groups`;
  const queryParams = [];
  
  if (params?.page) queryParams.push(`page=${params.page}`);
  if (params?.limit) queryParams.push(`limit=${params.limit}`);
  
  if (queryParams.length > 0) {
    url += `?${queryParams.join("&")}`;
  }
  
  return apiFetch<QuestionGroupsResponse>(url);
}

export async function createQuestionGroup(testId: number, data: QuestionGroupForm) {
  return apiFetch(`/admin/tests/${testId}/question-groups`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateQuestionGroup(groupId: number, data: QuestionGroupForm) {
  return apiFetch(`/admin/question-groups/${groupId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteQuestionGroup(groupId: number) {
  return apiFetch(`/admin/question-groups/${groupId}`, {
    method: "DELETE",
  });
}

// ======================================================
// QUESTIONS MANAGEMENT
// ======================================================

export interface QuestionForm {
  question_number?: number;
  question_text?: string;
  correct_answer?: string;
  explanation?: string;
  display_order?: number;
  options?: Array<{
    option_label?: string;
    option_text?: string;
    is_correct?: boolean;
    display_order?: number;
  }>;
}

interface QuestionsResponse {
  items: Question[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getQuestions(groupId: number, params?: {
  page?: number;
  limit?: number;
}) {
  let url = `/admin/question-groups/${groupId}/questions`;
  const queryParams = [];
  
  if (params?.page) queryParams.push(`page=${params.page}`);
  if (params?.limit) queryParams.push(`limit=${params.limit}`);
  
  if (queryParams.length > 0) {
    url += `?${queryParams.join("&")}`;
  }
  
  return apiFetch<QuestionsResponse>(url);
}

export async function createQuestion(groupId: number, data: QuestionForm) {
  return apiFetch(`/admin/question-groups/${groupId}/questions`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateQuestion(questionId: number, data: QuestionForm) {
  return apiFetch(`/admin/questions/${questionId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteQuestion(questionId: number) {
  return apiFetch(`/admin/questions/${questionId}`, {
    method: "DELETE",
  });
}
