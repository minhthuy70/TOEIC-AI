import { apiFetch } from "@/lib/api";

export interface ErrorLogItem {
  id: number;
  userId: number;
  questionId: number | null;
  questionText: string | null;
  passage: string | null;
  imageUrl: string | null;
  audioUrl: string | null;
  part: number;
  userAnswer: string | null;
  correctAnswer: string;
  options: Array<{ id?: number | string; label?: string; text?: string; content?: string }> | null;
  explanation: string | null;
  errorType: "grammar" | "vocabulary" | "careless" | "timing";
  status: "active" | "resolved";
  userNote: string | null;
  frequency: number;
  lastOccurredAt: string;
  createdAt: string;
  updatedAt: string;
  sourceType?: string;
  sourceId?: number | null;
}

export interface ErrorLogSummaryStats {
  total: number;
  active: number;
  resolved: number;
  resolutionRate: number;
  grammarCount: number;
  vocabularyCount: number;
  carelessCount: number;
  timingCount: number;
}

export interface ErrorLogResponse {
  items: ErrorLogItem[];
  stats: ErrorLogSummaryStats;
}

export interface ErrorLogFilterParams {
  errorType?: "all" | "grammar" | "vocabulary" | "careless" | "timing";
  part?: number | "all";
  dateRange?: "all" | "7d" | "30d" | "90d";
  status?: "all" | "active" | "resolved";
  search?: string;
  sortBy?: "frequency" | "date";
  sortOrder?: "asc" | "desc";
}

export async function getErrorLogs(params: ErrorLogFilterParams = {}): Promise<ErrorLogResponse> {
  const query = new URLSearchParams();

  if (params.errorType && params.errorType !== "all") {
    query.set("errorType", params.errorType);
  }
  if (params.part && params.part !== "all") {
    query.set("part", String(params.part));
  }
  if (params.dateRange && params.dateRange !== "all") {
    query.set("dateRange", params.dateRange);
  }
  if (params.status && params.status !== "all") {
    query.set("status", params.status);
  }
  if (params.search && params.search.trim()) {
    query.set("search", params.search.trim());
  }
  if (params.sortBy) {
    query.set("sortBy", params.sortBy);
  }
  if (params.sortOrder) {
    query.set("sortOrder", params.sortOrder);
  }

  const qs = query.toString();
  return apiFetch<ErrorLogResponse>(`/error-log${qs ? `?${qs}` : ""}`);
}

export async function getErrorLogDetail(id: number): Promise<ErrorLogItem> {
  return apiFetch<ErrorLogItem>(`/error-log/${id}`);
}

export async function addErrorLog(dto: {
  questionId?: number;
  questionText?: string;
  passage?: string;
  imageUrl?: string;
  audioUrl?: string;
  part: number;
  userAnswer?: string;
  correctAnswer: string;
  options?: any;
  explanation?: string;
  errorType?: "grammar" | "vocabulary" | "careless" | "timing";
  userNote?: string;
  sourceType?: string;
  sourceId?: number;
}): Promise<{ success: boolean; message: string; id: number; isExisting: boolean }> {
  return apiFetch<{ success: boolean; message: string; id: number; isExisting: boolean }>("/error-log", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function updateErrorLogStatus(
  id: number,
  status: "active" | "resolved",
): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>(`/error-log/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function updateErrorLogNote(
  id: number,
  userNote: string,
  errorType?: string,
): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>(`/error-log/${id}/note`, {
    method: "PATCH",
    body: JSON.stringify({ userNote, errorType }),
  });
}

export async function deleteErrorLog(id: number): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>(`/error-log/${id}`, {
    method: "DELETE",
  });
}
