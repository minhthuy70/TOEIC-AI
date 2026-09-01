"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Plus,
  Search,
  Sliders,
  Calendar,
  BarChart3,
  Edit2,
  Trash2,
  Check,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  HelpCircle,
  Shuffle,
  Eye,
  Globe,
  Lock,
  Archive,
  TrendingUp,
  Award,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface ManagedTest {
  id: number;
  title: string;
  description: string;
  duration: number;
  total_questions: number;
  stage: number;
  test_type: string;
  status: "draft" | "published" | "scheduled" | "archived";
  is_active: boolean;
  attempts_count: number;
  average_score: number;
  highest_score: number;
  config: {
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showExplanationImmediately: boolean;
    maxAttempts: number;
    passingScore: number;
  };
  schedule: {
    isScheduled: boolean;
    startDate: string | null;
    endDate: string | null;
    isRecurringWeekly: boolean;
  };
  createdAt: string;
}

interface TestFormData {
  title: string;
  description: string;
  duration: number;
  total_questions: number;
  stage: number;
  test_type: string;
  status: "draft" | "published" | "scheduled" | "archived";
  is_active: boolean;
}

const EMPTY_FORM: TestFormData = {
  title: "",
  description: "",
  duration: 120,
  total_questions: 200,
  stage: 3,
  test_type: "Full Test",
  status: "published",
  is_active: true,
};

export default function TestsAdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"list" | "config" | "scheduling" | "analytics">("list");
  const [items, setItems] = useState<ManagedTest[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Selected Test for Modal / Sub-features
  const [selectedTest, setSelectedTest] = useState<ManagedTest | null>(null);

  // Form Modal (Add / Edit)
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<TestFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Config Modal
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configForm, setConfigForm] = useState({
    shuffleQuestions: true,
    shuffleOptions: true,
    showExplanationImmediately: false,
    maxAttempts: 3,
    passingScore: 700,
  });

  // Schedule Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    isScheduled: true,
    startDate: "2026-09-05T08:00",
    endDate: "2026-09-07T22:00",
    isRecurringWeekly: true,
  });

  // Analytics Data
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    loadTests();
  }, [page, statusFilter, typeFilter]);

  // 1. Load Tests List
  const loadTests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter) params.set("status", statusFilter);
      if (typeFilter) params.set("test_type", typeFilter);

      const res = await apiFetch<{ items: ManagedTest[]; total: number; page: number; limit: number; totalPages: number }>(
        `/admin/tests/manage?${params.toString()}`
      );

      setItems(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);

      if (!selectedTest && res.items && res.items.length > 0) {
        setSelectedTest(res.items[0]);
      }
    } catch (e: any) {
      console.error(e);
      showToast(e.message || "Không thể tải danh sách đề thi", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadTests();
  };

  // 1 & 2. Save Test (Create or Edit)
  const handleSaveTest = async () => {
    if (!form.title.trim()) {
      showToast("Vui lòng nhập tiêu đề đề thi", "error");
      return;
    }

    try {
      setSaving(true);
      const endpoint = formMode === "create" ? "/admin/tests/manage" : `/admin/tests/manage/${editingId}`;
      const method = formMode === "create" ? "POST" : "PATCH";

      const res = await apiFetch<{ success: boolean; message: string }>(endpoint, {
        method,
        body: JSON.stringify(form),
      });

      if (res.success) {
        showToast(res.message || (formMode === "create" ? "Đã thêm đề thi mới!" : "Đã cập nhật đề thi!"));
        setShowForm(false);
        setForm(EMPTY_FORM);
        setEditingId(null);
        loadTests();
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi khi lưu đề thi", "error");
    } finally {
      setSaving(false);
    }
  };

  const openCreateModal = () => {
    setForm(EMPTY_FORM);
    setFormMode("create");
    setEditingId(null);
    setShowForm(true);
  };

  const openEditModal = (item: ManagedTest) => {
    setForm({
      title: item.title,
      description: item.description,
      duration: item.duration,
      total_questions: item.total_questions,
      stage: item.stage || 3,
      test_type: item.test_type || "Full Test",
      status: item.status,
      is_active: item.is_active,
    });
    setEditingId(item.id);
    setFormMode("edit");
    setShowForm(true);
  };

  // 3. Delete Test
  const handleDeleteTest = async (id: number, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa đề thi "${title}"?`)) return;

    try {
      const res = await apiFetch<{ success: boolean; message: string }>(`/admin/tests/manage/${id}`, {
        method: "DELETE",
      });
      if (res.success) {
        showToast("Đã xóa đề thi thành công");
        loadTests();
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi khi xóa đề thi", "error");
    }
  };

  // 4. Test Configuration Update
  const openConfigModal = (test: ManagedTest) => {
    setSelectedTest(test);
    setConfigForm({
      shuffleQuestions: test.config?.shuffleQuestions ?? true,
      shuffleOptions: test.config?.shuffleOptions ?? true,
      showExplanationImmediately: test.config?.showExplanationImmediately ?? false,
      maxAttempts: test.config?.maxAttempts ?? 3,
      passingScore: test.config?.passingScore ?? 700,
    });
    setShowConfigModal(true);
  };

  const handleSaveConfig = async () => {
    if (!selectedTest) return;
    try {
      const res = await apiFetch<{ success: boolean; message: string }>(`/admin/tests/manage/${selectedTest.id}/config`, {
        method: "PUT",
        body: JSON.stringify(configForm),
      });
      if (res.success) {
        showToast("Cập nhật cấu hình làm bài thành công!", "success");
        setShowConfigModal(false);
        loadTests();
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi cập nhật cấu hình", "error");
    }
  };

  // 5. Test Publication Status Update
  const handleUpdatePublication = async (testId: number, status: "draft" | "published" | "scheduled" | "archived") => {
    try {
      const res = await apiFetch<{ success: boolean; message: string }>(`/admin/tests/manage/${testId}/publish`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      if (res.success) {
        showToast(res.message || "Đã cập nhật trạng thái xuất bản!", "success");
        loadTests();
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi cập nhật trạng thái", "error");
    }
  };

  // 6. Test Scheduling Update
  const openScheduleModal = (test: ManagedTest) => {
    setSelectedTest(test);
    setScheduleForm({
      isScheduled: test.schedule?.isScheduled ?? true,
      startDate: test.schedule?.startDate ? test.schedule.startDate.slice(0, 16) : "2026-09-05T08:00",
      endDate: test.schedule?.endDate ? test.schedule.endDate.slice(0, 16) : "2026-09-07T22:00",
      isRecurringWeekly: test.schedule?.isRecurringWeekly ?? true,
    });
    setShowScheduleModal(true);
  };

  const handleSaveSchedule = async () => {
    if (!selectedTest) return;
    try {
      const res = await apiFetch<{ success: boolean; message: string }>(`/admin/tests/manage/${selectedTest.id}/schedule`, {
        method: "PUT",
        body: JSON.stringify(scheduleForm),
      });
      if (res.success) {
        showToast(res.message || "Đã lên lịch mở bài thi trực tuyến!", "success");
        setShowScheduleModal(false);
        loadTests();
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi lên lịch thi", "error");
    }
  };

  // 7. Test Analytics
  const loadAnalytics = async (testId: number) => {
    try {
      setLoadingAnalytics(true);
      const res = await apiFetch<{ success: boolean; analytics: any }>(`/admin/tests/manage/${testId}/analytics`);
      if (res.success) {
        setAnalyticsData(res.analytics);
        setActiveTab("analytics");
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi khi tải báo cáo phân tích", "error");
    } finally {
      setLoadingAnalytics(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl ${
              toastType === "success"
                ? "bg-zinc-900 border-green-500/30 text-green-400"
                : "bg-zinc-900 border-red-500/30 text-red-400"
            }`}
          >
            {toastType === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            )}
            <span className="text-sm font-medium text-white">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-red-400" />
            <span>Quản Lý Kiểm Tra & Đề Thi (Test Management 16.3)</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Quản trị toàn diện đề thi TOEIC: Tạo mới, cấu hình xáo trộn, xuất bản, lên lịch kỳ thi trực tuyến và phân tích phổ điểm.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Đề Thi Mới</span>
        </button>
      </div>

      {/* Master Tabs */}
      <div className="flex border-b border-zinc-800">
        {[
          { id: "list", label: `Danh Sách Đề Thi (${total})`, icon: ClipboardList },
          { id: "analytics", label: "Phân Tích & Phổ Điểm", icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
                isSelected
                  ? "border-red-500 text-red-400"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: TESTS LIST & CRUD (1. Create, 2. Edit, 3. Delete, 4. Config, 5. Publication, 6. Scheduling) */}
      {activeTab === "list" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col md:flex-row gap-3">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm theo tiêu đề hoặc mô tả đề thi..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-red-500/50"
              />
            </form>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-red-500/50"
              >
                <option value="">Tất cả Trạng Thái</option>
                <option value="published">Đã Xuất Bản (Published)</option>
                <option value="scheduled">Đã Lên Lịch (Scheduled)</option>
                <option value="draft">Bản Nháp (Draft)</option>
                <option value="archived">Lưu Trữ (Archived)</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-red-500/50"
              >
                <option value="">Tất cả Loại Đề</option>
                <option value="Full Test">Full Test (200 câu)</option>
                <option value="Mini Test">Mini Test (50 câu)</option>
                <option value="Contest">Kỳ Thi Trực Tuyến</option>
                <option value="Placement">Đề Khảo Sát Đầu Vào</option>
              </select>
            </div>
          </div>

          {/* Table Render */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Tiêu Đề Đề Thi</th>
                    <th className="p-3.5">Thời Lượng & Số Câu</th>
                    <th className="p-3.5">Loại Đề</th>
                    <th className="p-3.5">5. Trạng Thái Xuất Bản</th>
                    <th className="p-3.5">Lượt Thi & Điểm TB</th>
                    <th className="p-3.5 text-right">Thao Tác Quản Trị</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-500">
                        Đang tải danh sách đề thi...
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-500">
                        Không tìm thấy đề thi nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    items.map((test) => (
                      <tr key={test.id} className="hover:bg-zinc-900/60 transition-colors">
                        <td className="p-3.5 font-bold text-white max-w-xs">
                          <div>
                            <span className="text-white hover:text-red-400 cursor-pointer" onClick={() => router.push(`/admin/tests/${test.id}/question-groups`)}>
                              {test.title}
                            </span>
                            <p className="text-[11px] text-zinc-500 font-normal truncate">{test.description}</p>
                          </div>
                        </td>

                        <td className="p-3.5 text-zinc-300 font-semibold">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-zinc-500" />
                            <span>{test.duration} phút ({test.total_questions} câu)</span>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-semibold text-[10px]">
                            {test.test_type}
                          </span>
                        </td>

                        <td className="p-3.5">
                          {test.status === "published" && (
                            <span className="px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center gap-1 w-fit">
                              <Globe className="w-3 h-3" />
                              <span>Đã Xuất Bản</span>
                            </span>
                          )}
                          {test.status === "scheduled" && (
                            <span className="px-2.5 py-1 rounded bg-blue-950/40 border border-blue-500/20 text-blue-400 font-bold text-[10px] flex items-center gap-1 w-fit">
                              <Calendar className="w-3 h-3" />
                              <span>Đã Lên Lịch</span>
                            </span>
                          )}
                          {test.status === "draft" && (
                            <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-400 font-bold text-[10px] flex items-center gap-1 w-fit">
                              <Lock className="w-3 h-3" />
                              <span>Bản Nháp</span>
                            </span>
                          )}
                          {test.status === "archived" && (
                            <span className="px-2.5 py-1 rounded bg-red-950/40 text-red-400 font-bold text-[10px] flex items-center gap-1 w-fit">
                              <Archive className="w-3 h-3" />
                              <span>Lưu Trữ</span>
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-zinc-400">
                          <span className="font-bold text-white">{test.attempts_count}</span> lượt thi
                          <span className="text-zinc-500 ml-1">(ĐTB: {test.average_score})</span>
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* 4. Config */}
                            <button
                              onClick={() => openConfigModal(test)}
                              title="Cấu hình làm bài"
                              className="p-1.5 hover:text-white hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                            </button>

                            {/* 6. Scheduling */}
                            <button
                              onClick={() => openScheduleModal(test)}
                              title="Lên lịch thi trực tuyến"
                              className="p-1.5 hover:text-blue-400 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                            </button>

                            {/* 7. Analytics */}
                            <button
                              onClick={() => loadAnalytics(test.id)}
                              title="Phân tích phổ điểm"
                              className="p-1.5 hover:text-amber-400 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"
                            >
                              <BarChart3 className="w-3.5 h-3.5" />
                            </button>

                            {/* 2. Edit */}
                            <button
                              onClick={() => openEditModal(test)}
                              title="Chỉnh sửa đề thi"
                              className="p-1.5 hover:text-white hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* 3. Delete */}
                            <button
                              onClick={() => handleDeleteTest(test.id, test.title)}
                              title="Xóa đề thi"
                              className="p-1.5 hover:text-red-400 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <span>
                Hiển thị trang <strong>{page}</strong> / {totalPages} (Tổng số {total} đề thi)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 disabled:opacity-40 hover:bg-zinc-800 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 disabled:opacity-40 hover:bg-zinc-800 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TEST ANALYTICS (7. Test analytics) */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {analyticsData ? (
            <>
              {/* Header Stats */}
              <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-red-400">Báo Cáo Phân Tích Bài Thi</span>
                    <h2 className="text-xl font-black text-white mt-0.5">{analyticsData.testTitle}</h2>
                  </div>
                  <button
                    onClick={() => setActiveTab("list")}
                    className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold self-start sm:self-auto"
                  >
                    Quay lại danh sách
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs pt-2">
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500">Tổng lượt làm bài</span>
                    <div className="text-2xl font-black text-white mt-1">{analyticsData.totalAttempts}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500">Điểm trung bình</span>
                    <div className="text-2xl font-black text-amber-400 mt-1">{analyticsData.averageScore} / 990</div>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500">Điểm cao nhất</span>
                    <div className="text-2xl font-black text-emerald-400 mt-1">{analyticsData.highestScore}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500">Tỷ lệ đạt chuẩn</span>
                    <div className="text-2xl font-black text-blue-400 mt-1">{analyticsData.passingRate}%</div>
                  </div>
                </div>
              </div>

              {/* Score Distribution & Part Accuracy Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Score Distribution */}
                <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-red-400" />
                    <span>Biểu Đồ Phổ Điểm (Score Distribution)</span>
                  </h3>

                  <div className="space-y-3">
                    {analyticsData.scoreDistribution.map((sd: any) => (
                      <div key={sd.range} className="space-y-1 text-xs">
                        <div className="flex justify-between text-zinc-300">
                          <span className="font-bold">{sd.range} Điểm</span>
                          <span>{sd.count} thí sinh ({sd.percentage}%)</span>
                        </div>
                        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-red-600 to-amber-500 h-full rounded-full" style={{ width: `${sd.percentage * 2.5}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Part Accuracy Breakdown */}
                <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Tỷ Lệ Trả Lời Đúng Theo Từng Part 1–7</span>
                  </h3>

                  <div className="space-y-3">
                    {analyticsData.partAccuracy.map((pa: any) => (
                      <div key={pa.part} className="space-y-1 text-xs">
                        <div className="flex justify-between text-zinc-300">
                          <span className="font-bold">{pa.name}</span>
                          <span className="font-extrabold text-emerald-400">{pa.accuracy}% Đúng</span>
                        </div>
                        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pa.accuracy}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Performers Table */}
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Top 3 Thí Sinh Điểm Cao Nhất</span>
                </h3>

                <div className="divide-y divide-zinc-800 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden text-xs">
                  {analyticsData.topPerformers.map((user: any) => (
                    <div key={user.rank} className="p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-amber-500 text-zinc-950 font-black flex items-center justify-center text-xs">
                          {user.rank}
                        </span>
                        <div>
                          <span className="font-bold text-white">{user.name}</span>
                          <p className="text-[10px] text-zinc-500">Thời gian làm bài: {user.time} • Ngày thi: {user.date}</p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-red-400">{user.score} TOEIC</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
              Chọn một đề thi từ danh sách và nhấn biểu tượng biểu đồ để xem báo cáo phân tích chi tiết.
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT TEST MODAL (1. Create, 2. Edit) */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-red-400" />
                <span>{formMode === "create" ? "Tạo Đề Thi Mới" : "Chỉnh Sửa Đề Thi"}</span>
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300">Tiêu đề đề thi *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ví dụ: ETS TOEIC 2026 Full Test 01"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-red-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300">Mô tả đề thi</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Mô tả cấu trúc bài thi, độ khó và mục tiêu điểm số..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-red-500/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-300">Thời lượng (Phút)</label>
                  <input
                    type="number"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-300">Tổng số câu hỏi</label>
                  <input
                    type="number"
                    value={form.total_questions}
                    onChange={(e) => setForm({ ...form, total_questions: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-300">Loại bài thi</label>
                  <select
                    value={form.test_type}
                    onChange={(e) => setForm({ ...form, test_type: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value="Full Test">Full Test (200 câu)</option>
                    <option value="Mini Test">Mini Test (50 câu)</option>
                    <option value="Contest">Kỳ Thi Trực Tuyến</option>
                    <option value="Placement">Đề Khảo Sát Đầu Vào</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-300">Chặng áp dụng</label>
                  <select
                    value={form.stage}
                    onChange={(e) => setForm({ ...form, stage: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value={1}>Chặng 1 (0–300)</option>
                    <option value={2}>Chặng 2 (300–500)</option>
                    <option value={3}>Chặng 3 (500–650)</option>
                    <option value={4}>Chặng 4 (650–800)</option>
                    <option value={5}>Chặng 5 (800–990)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveTest}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{saving ? "Đang lưu..." : "Lưu Đề Thi"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. TEST CONFIGURATION MODAL */}
      {showConfigModal && selectedTest && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-red-400" />
                <span>4. Cấu Hình Kiểm Tra (Test Configuration)</span>
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div>
                  <span className="font-bold text-white block">Xáo trộn câu hỏi (Shuffle Questions)</span>
                  <span className="text-[11px] text-zinc-400">Trộn ngẫu nhiên thứ tự câu hỏi trong đề thi</span>
                </div>
                <input
                  type="checkbox"
                  checked={configForm.shuffleQuestions}
                  onChange={(e) => setConfigForm({ ...configForm, shuffleQuestions: e.target.checked })}
                  className="w-4 h-4 accent-red-600"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div>
                  <span className="font-bold text-white block">Xáo trộn đáp án (Shuffle Options A/B/C/D)</span>
                  <span className="text-[11px] text-zinc-400">Trộn thứ tự 4 đáp án đối với Part 5, 6, 7</span>
                </div>
                <input
                  type="checkbox"
                  checked={configForm.shuffleOptions}
                  onChange={(e) => setConfigForm({ ...configForm, shuffleOptions: e.target.checked })}
                  className="w-4 h-4 accent-red-600"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div>
                  <span className="font-bold text-white block">Xem giải thích ngay</span>
                  <span className="text-[11px] text-zinc-400">Hiển thị đáp án ngay khi chọn (áp dụng Mini Test)</span>
                </div>
                <input
                  type="checkbox"
                  checked={configForm.showExplanationImmediately}
                  onChange={(e) => setConfigForm({ ...configForm, showExplanationImmediately: e.target.checked })}
                  className="w-4 h-4 accent-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Giới hạn số lần thi</label>
                  <input
                    type="number"
                    value={configForm.maxAttempts}
                    onChange={(e) => setConfigForm({ ...configForm, maxAttempts: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Điểm sàn đạt mục tiêu</label>
                  <input
                    type="number"
                    value={configForm.passingScore}
                    onChange={(e) => setConfigForm({ ...configForm, passingScore: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
              >
                Lưu Cấu Hình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. TEST SCHEDULING MODAL */}
      {showScheduleModal && selectedTest && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span>6. Lên Lịch Kỳ Thi Trực Tuyến (Test Scheduling)</span>
              </h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300">Thời gian bắt đầu mở thi</label>
                <input
                  type="datetime-local"
                  value={scheduleForm.startDate}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, startDate: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300">Thời gian kết thúc kỳ thi</label>
                <input
                  type="datetime-local"
                  value={scheduleForm.endDate}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, endDate: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div>
                  <span className="font-bold text-white block">Tự động lặp lại hàng tuần</span>
                  <span className="text-[11px] text-zinc-400">Mở thi vào đúng khung giờ cố định mỗi cuối tuần</span>
                </div>
                <input
                  type="checkbox"
                  checked={scheduleForm.isRecurringWeekly}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, isRecurringWeekly: e.target.checked })}
                  className="w-4 h-4 accent-red-600"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveSchedule}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
              >
                Xác Nhận Lên Lịch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}