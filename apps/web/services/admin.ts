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

interface Test {
  id: number;
  title: string | null;
  description: string | null;
  duration: number | null;
  total_questions: number | null;
  is_active: boolean | null;
  created_at: string;
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

interface TestForm {
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
