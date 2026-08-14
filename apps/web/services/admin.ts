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
