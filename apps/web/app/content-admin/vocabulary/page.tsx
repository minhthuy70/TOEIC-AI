"use client";

import { useEffect, useState } from "react";
import {
  BookA,
  Plus,
  Search,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Tag,
  FolderTree,
  Activity,
  Edit2,
  Trash2,
  Check,
  X,
  RefreshCw,
  Eye,
  FileText,
  Volume2,
  Sparkles,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

type Vocabulary = {
  id: number;
  english: string;
  type: string | null;
  vietnamese: string | null;
  pronounce: string | null;
  explain: string | null;
  example: string | null;
  exampleVietnamese: string | null;
  imageUrl: string | null;
  audioUrl: string | null;
  topic: string | null;
  stage: number;
  createdAt?: string;
};

type VocabularyForm = {
  english: string;
  type: string;
  vietnamese: string;
  pronounce: string;
  explain: string;
  example: string;
  exampleVietnamese: string;
  imageUrl: string;
  audioUrl: string;
  topic: string;
  stage: number;
};

const EMPTY_FORM: VocabularyForm = {
  english: "",
  type: "n.",
  vietnamese: "",
  pronounce: "",
  explain: "",
  example: "",
  exampleVietnamese: "",
  imageUrl: "",
  audioUrl: "",
  topic: "Office & Workplace",
  stage: 1,
};

export default function VocabularyAdminPage() {
  const [activeTab, setActiveTab] = useState<"list" | "import-export" | "approval" | "categories" | "quality">("list");
  const [items, setItems] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [topic, setTopic] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Form Modal (Add / Edit)
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<VocabularyForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Bulk Import & Export State
  const [importJsonText, setImportJsonText] = useState("");
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);

  // Approval Queue State
  const [approvalList, setApprovalList] = useState<any[]>([]);
  const [loadingApproval, setLoadingApproval] = useState(false);

  // Categories & Tags State
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);

  // Quality Check State
  const [qualityData, setQualityData] = useState<{
    stats: { totalWords: number; missingPronounce: number; missingExample: number; missingAudio: number; healthScore: number };
    flaggedItems: any[];
  } | null>(null);
  const [loadingQuality, setLoadingQuality] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    loadVocabulary();
  }, [page, stage, topic]);

  useEffect(() => {
    if (activeTab === "approval") loadApprovalQueue();
    if (activeTab === "categories") loadCategoriesAndTags();
    if (activeTab === "quality") loadQualityCheck();
  }, [activeTab]);

  // 1. Load Vocabulary List
  const loadVocabulary = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (search.trim()) params.set("search", search.trim());
      if (stage) params.set("stage", stage);
      if (topic) params.set("topic", topic);

      const res = await apiFetch<{ items: Vocabulary[]; total: number; page: number; limit: number; totalPages: number }>(
        `/admin/vocabulary?${params.toString()}`
      );

      setItems(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (e: any) {
      console.error(e);
      showToast(e.message || "Không thể tải danh sách từ vựng", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadVocabulary();
  };

  // 1 & 2. Save Vocabulary (Add or Edit)
  const handleSaveVocabulary = async () => {
    if (!form.english.trim()) {
      showToast("Vui lòng nhập từ tiếng Anh", "error");
      return;
    }
    if (!form.vietnamese.trim()) {
      showToast("Vui lòng nhập nghĩa tiếng Việt", "error");
      return;
    }

    try {
      setSaving(true);
      const endpoint = formMode === "create" ? "/admin/vocabulary" : `/admin/vocabulary/${editingId}`;
      const method = formMode === "create" ? "POST" : "PATCH";

      const res = await apiFetch<{ success: boolean; message: string }>(endpoint, {
        method,
        body: JSON.stringify(form),
      });

      if (res.success) {
        showToast(res.message || (formMode === "create" ? "Đã thêm từ vựng mới!" : "Đã cập nhật từ vựng!"));
        setShowForm(false);
        setForm(EMPTY_FORM);
        setEditingId(null);
        loadVocabulary();
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi khi lưu từ vựng", "error");
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

  const openEditModal = (item: Vocabulary) => {
    setForm({
      english: item.english,
      type: item.type || "n.",
      vietnamese: item.vietnamese || "",
      pronounce: item.pronounce || "",
      explain: item.explain || "",
      example: item.example || "",
      exampleVietnamese: item.exampleVietnamese || "",
      imageUrl: item.imageUrl || "",
      audioUrl: item.audioUrl || "",
      topic: item.topic || "Office & Workplace",
      stage: item.stage || 1,
    });
    setEditingId(item.id);
    setFormMode("edit");
    setShowForm(true);
  };

  // 3. Delete Vocabulary
  const handleDeleteVocabulary = async (id: number, word: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa từ vựng "${word}"?`)) return;

    try {
      const res = await apiFetch<{ success: boolean; message: string }>(`/admin/vocabulary/${id}`, {
        method: "DELETE",
      });
      if (res.success) {
        showToast(`Đã xóa từ vựng "${word}" thành công`);
        loadVocabulary();
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi khi xóa từ vựng", "error");
    }
  };

  // 4. Bulk Import
  const handleParseJsonImport = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed)) {
        showToast("Dữ liệu phải là một mảng JSON các từ vựng", "error");
        return;
      }
      setImportPreview(parsed);
      showToast(`Đã đọc ${parsed.length} từ vựng từ JSON!`, "success");
    } catch (e: any) {
      showToast("Định dạng JSON không hợp lệ: " + e.message, "error");
    }
  };

  const handleExecuteImport = async () => {
    if (importPreview.length === 0) return;
    try {
      setImporting(true);
      const res = await apiFetch<{ success: boolean; message: string; importedCount: number; errorCount: number }>(
        "/admin/vocabulary/bulk-import",
        {
          method: "POST",
          body: JSON.stringify({ items: importPreview }),
        }
      );
      if (res.success) {
        showToast(res.message || `Đã nhập thành công ${res.importedCount} từ vựng!`, "success");
        setImportJsonText("");
        setImportPreview([]);
        loadVocabulary();
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi khi nhập dữ liệu", "error");
    } finally {
      setImporting(false);
    }
  };

  // 5. Bulk Export
  const handleExportCsv = async () => {
    try {
      const res = await apiFetch<{ success: boolean; items: Vocabulary[] }>("/admin/vocabulary/bulk-export");
      if (res.success && res.items) {
        const headers = ["ID,English,Type,Vietnamese,Pronounce,Topic,Stage,Example,ExampleVI"];
        const rows = res.items.map((i) =>
          `"${i.id}","${i.english}","${i.type || ""}","${(i.vietnamese || "").replace(/"/g, '""')}","${i.pronounce || ""}","${i.topic || ""}","${i.stage}","${(i.example || "").replace(/"/g, '""')}","${(i.exampleVietnamese || "").replace(/"/g, '""')}"`
        );
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `TOEIC_Vocabulary_Export_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Đã xuất ${res.items.length} từ vựng ra file CSV!`, "success");
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi khi xuất dữ liệu", "error");
    }
  };

  // 6. Approval Queue
  const loadApprovalQueue = async () => {
    try {
      setLoadingApproval(true);
      const res = await apiFetch<{ success: boolean; pendingItems: any[] }>("/admin/vocabulary/approval-queue");
      if (res.success) {
        setApprovalList(res.pendingItems || []);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoadingApproval(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const res = await apiFetch<{ success: boolean; message: string }>(`/admin/vocabulary/approval-queue/${id}/approve`, {
        method: "POST",
      });
      if (res.success) {
        showToast(res.message || "Đã phê duyệt từ vựng!", "success");
        setApprovalList((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi khi duyệt", "error");
    }
  };

  const handleReject = async (id: number) => {
    try {
      const res = await apiFetch<{ success: boolean; message: string }>(`/admin/vocabulary/approval-queue/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: "Chưa đúng chuẩn định dạng TOEIC" }),
      });
      if (res.success) {
        showToast(res.message || "Đã từ chối từ vựng");
        setApprovalList((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi khi từ chối", "error");
    }
  };

  // 7 & 8. Categories & Tags
  const loadCategoriesAndTags = async () => {
    try {
      const [catRes, tagRes] = await Promise.all([
        apiFetch<{ success: boolean; categories: any[] }>("/admin/vocabulary/categories"),
        apiFetch<{ success: boolean; tags: any[] }>("/admin/vocabulary/tags"),
      ]);
      if (catRes.success) setCategories(catRes.categories || []);
      if (tagRes.success) setTags(tagRes.tags || []);
    } catch (e) {
      console.error(e);
    }
  };

  // 9. Quality Check
  const loadQualityCheck = async () => {
    try {
      setLoadingQuality(true);
      const res = await apiFetch<{ success: boolean; stats: any; flaggedItems: any[] }>("/admin/vocabulary/quality-check");
      if (res.success) {
        setQualityData({ stats: res.stats, flaggedItems: res.flaggedItems || [] });
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoadingQuality(false);
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
            <BookA className="w-6 h-6 text-red-400" />
            <span>Quản Lý Từ Vựng Quản Trị Viên (16.1)</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Quản trị kho từ vựng toàn diện: Thêm, sửa, xóa, nhập/xuất hàng loạt, hàng đợi duyệt, phân loại và kiểm tra chất lượng.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Từ Vựng Mới</span>
          </button>
        </div>
      </div>

      {/* Master Tabs */}
      <div className="flex border-b border-zinc-800">
        {[
          { id: "list", label: `Kho Từ Vựng (${total})`, icon: BookA },
          { id: "import-export", label: "Nhập & Xuất Hàng Loạt", icon: Upload },
          { id: "approval", label: `Hàng Đợi Duyệt (${approvalList.length})`, icon: ShieldCheck },
          { id: "categories", label: "Phân Loại & Thẻ Tag", icon: FolderTree },
          { id: "quality", label: "Kiểm Tra Chất Lượng", icon: Activity },
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

      {/* TAB 1: VOCABULARY LIST (1. Add, 2. Edit, 3. Delete) */}
      {activeTab === "list" && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col md:flex-row gap-3">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm theo từ tiếng Anh hoặc nghĩa tiếng Việt..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-red-500/50"
              />
            </form>

            <div className="flex gap-2">
              <select
                value={stage}
                onChange={(e) => {
                  setStage(e.target.value);
                  setPage(1);
                }}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-red-500/50"
              >
                <option value="">Tất cả Chặng</option>
                <option value="1">Chặng 1 (0–300)</option>
                <option value="2">Chặng 2 (300–500)</option>
                <option value="3">Chặng 3 (500–650)</option>
                <option value="4">Chặng 4 (650–800)</option>
                <option value="5">Chặng 5 (800–990)</option>
              </select>

              <select
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  setPage(1);
                }}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-red-500/50"
              >
                <option value="">Tất cả Chủ Đề</option>
                <option value="Office & Workplace">Office & Workplace</option>
                <option value="Business Strategy">Business Strategy</option>
                <option value="Finance & Banking">Finance & Banking</option>
                <option value="Travel & Hospitality">Travel & Hospitality</option>
              </select>
            </div>
          </div>

          {/* Table Render */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Từ Tiếng Anh</th>
                    <th className="p-3.5">Loại từ & Phiên âm</th>
                    <th className="p-3.5">Nghĩa Tiếng Việt</th>
                    <th className="p-3.5">Chủ đề (Topic)</th>
                    <th className="p-3.5">Chặng</th>
                    <th className="p-3.5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-500">
                        Đang tải danh sách từ vựng...
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-500">
                        Không tìm thấy từ vựng nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-900/60 transition-colors">
                        <td className="p-3.5 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span>{item.english}</span>
                            {item.audioUrl && <Volume2 className="w-3.5 h-3.5 text-red-400" />}
                          </div>
                        </td>
                        <td className="p-3.5 text-zinc-400">
                          <span className="italic text-zinc-500 mr-1.5">{item.type}</span>
                          <span>{item.pronounce || "—"}</span>
                        </td>
                        <td className="p-3.5 text-zinc-200 font-medium max-w-xs truncate">{item.vietnamese}</td>
                        <td className="p-3.5 text-zinc-400">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-[11px]">{item.topic || "General"}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-red-950/40 border border-red-500/20 text-red-400 font-bold text-[10px]">
                            Chặng {item.stage}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(item)}
                              title="Chỉnh sửa"
                              className="p-1.5 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteVocabulary(item.id, item.english)}
                              title="Xóa"
                              className="p-1.5 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
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

            {/* Pagination Controls */}
            <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <span>
                Hiển thị trang <strong>{page}</strong> / {totalPages} (Tổng số {total} từ)
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

      {/* TAB 2: BULK IMPORT & EXPORT (4. Bulk Import, 5. Bulk Export) */}
      {activeTab === "import-export" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 4. Bulk Import */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-red-400" />
              <span>4. Nhập Từ Vựng Hàng Loạt (Bulk Import JSON / CSV)</span>
            </h3>

            <p className="text-xs text-zinc-400">
              Dán mảng JSON chứa danh sách từ vựng cần nạp vào hệ thống để kiểm tra và nạp tự động:
            </p>

            <textarea
              rows={6}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder={`[\n  {\n    "english": "negotiate",\n    "type": "v.",\n    "vietnamese": "đàm phán, thương lượng",\n    "pronounce": "/nəˈɡoʊ.ʃi.eɪt/",\n    "topic": "Business Strategy",\n    "stage": 3\n  }\n]`}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-red-500/50 resize-none"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleParseJsonImport}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold"
              >
                Kiểm Tra Dữ Liệu
              </button>

              {importPreview.length > 0 && (
                <button
                  type="button"
                  disabled={importing}
                  onClick={handleExecuteImport}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{importing ? "Đang nhập..." : `Nhập ${importPreview.length} Từ`}</span>
                </button>
              )}
            </div>

            {importPreview.length > 0 && (
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                <span className="font-bold text-white">Xem trước {importPreview.length} từ vựng sẵn sàng nạp:</span>
                <div className="max-h-32 overflow-y-auto space-y-1 divide-y divide-zinc-900">
                  {importPreview.slice(0, 5).map((row, idx) => (
                    <div key={idx} className="pt-1 flex justify-between text-zinc-400">
                      <span className="font-bold text-white">{row.english} ({row.type})</span>
                      <span>{row.vietnamese}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 5. Bulk Export */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" />
                <span>5. Xuất Dữ Liệu Từ Vựng (Bulk Export)</span>
              </h3>

              <p className="text-xs text-zinc-400">
                Xuất toàn bộ kho dữ liệu từ vựng hiện tại kèm phiên âm, câu ví dụ và chặng học ra định dạng file CSV chuẩn UTF-8 để sao lưu hoặc chỉnh sửa ngoại tuyến.
              </p>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Tổng số từ vựng:</span>
                  <span className="font-bold text-white">{total} từ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Định dạng xuất:</span>
                  <span className="font-bold text-emerald-400">CSV (.csv) UTF-8</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleExportCsv}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>Tải Xuống File CSV Toàn Bộ Từ Vựng</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: APPROVAL QUEUE (6. Vocabulary approval queue) */}
      {activeTab === "approval" && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-400" />
              <span>6. Hàng Đợi Phê Duyệt Từ Vựng ({approvalList.length})</span>
            </h3>

            {loadingApproval ? (
              <div className="p-8 text-center text-xs text-zinc-500">Đang tải hàng đợi...</div>
            ) : approvalList.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                Không có từ vựng nào đang chờ duyệt. Tất cả dữ liệu đã được đồng bộ.
              </div>
            ) : (
              <div className="space-y-3">
                {approvalList.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{p.english}</span>
                        <span className="italic text-zinc-400 text-xs">({p.type})</span>
                        <span className="text-xs text-zinc-500">{p.pronounce}</span>
                        <span className="px-2 py-0.5 rounded bg-blue-950/40 text-blue-400 text-[10px] font-bold">
                          Điểm chuẩn: {p.qualityScore}%
                        </span>
                      </div>
                      <p className="text-xs text-zinc-200 font-semibold">{p.vietnamese}</p>
                      <p className="text-[11px] text-zinc-400 italic">"{p.example}"</p>
                      <span className="text-[10px] text-zinc-500 block">Nguồn: {p.source} • Chặng {p.stage}</span>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto">
                      <button
                        onClick={() => handleApprove(p.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Duyệt</span>
                      </button>
                      <button
                        onClick={() => handleReject(p.id)}
                        className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Từ chối</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORIZATION & TAGS (7. Categorization, 8. Tagging) */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 7. Categorization */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-red-400" />
              <span>7. Phân Loại Chủ Đề Bài Học (Categories & Topics)</span>
            </h3>

            <div className="divide-y divide-zinc-800 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden text-xs">
              {categories.map((c) => (
                <div key={c.id} className="p-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white">{c.name}</h4>
                    <p className="text-[11px] text-zinc-500">Áp dụng cho Chặng {c.stage}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold">
                    {c.wordCount} từ
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 8. Tagging */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-400" />
              <span>8. Hệ Thống Thẻ Gắn Đề Thi (Vocabulary Tagging)</span>
            </h3>

            <div className="divide-y divide-zinc-800 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden text-xs">
              {tags.map((t) => (
                <div key={t.id} className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="font-bold text-white">{t.name}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-red-950/40 border border-red-500/20 text-red-400 font-bold text-[10px]">
                    {t.wordCount} từ đã gắn thẻ
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: QUALITY CHECK (9. Vocabulary quality check) */}
      {activeTab === "quality" && (
        <div className="space-y-5">
          {qualityData && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500">Chỉ số sức khỏe</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">{qualityData.stats.healthScore}%</div>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500">Thiếu phiên âm IPA</span>
                <div className="text-2xl font-black text-amber-400 mt-1">{qualityData.stats.missingPronounce}</div>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500">Thiếu câu ví dụ</span>
                <div className="text-2xl font-black text-red-400 mt-1">{qualityData.stats.missingExample}</div>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500">Thiếu phát âm Audio</span>
                <div className="text-2xl font-black text-blue-400 mt-1">{qualityData.stats.missingAudio}</div>
              </div>
            </div>
          )}

          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-400" />
              <span>9. Danh Sách Từ Vựng Cần Bổ Sung Thông Tin</span>
            </h3>

            {qualityData?.flaggedItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                Tuyệt vời! Toàn bộ từ vựng đều đạt chuẩn chất lượng đầy đủ.
              </div>
            ) : (
              <div className="divide-y divide-zinc-800 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden text-xs">
                {qualityData?.flaggedItems.map((item) => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">{item.english}</span>
                      <span className="text-zinc-400 ml-2">({item.vietnamese})</span>
                      <div className="flex gap-1.5 mt-1">
                        {item.issues.map((iss: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-red-950/40 text-red-400 text-[10px] font-semibold">
                            ⚠️ {iss}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => openEditModal(item as any)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-semibold text-xs"
                    >
                      Bổ sung ngay
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookA className="w-5 h-5 text-red-400" />
                <span>{formMode === "create" ? "Thêm Từ Vựng Mới" : "Chỉnh Sửa Từ Vựng"}</span>
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300">Từ tiếng Anh (English) *</label>
                <input
                  type="text"
                  required
                  value={form.english}
                  onChange={(e) => setForm({ ...form, english: e.target.value })}
                  placeholder="Ví dụ: collaborate"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-red-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300">Nghĩa tiếng Việt *</label>
                <input
                  type="text"
                  required
                  value={form.vietnamese}
                  onChange={(e) => setForm({ ...form, vietnamese: e.target.value })}
                  placeholder="Ví dụ: hợp tác, cộng tác"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-red-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300">Loại từ (Part of Speech)</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-red-500/50"
                >
                  <option value="n.">Danh từ (n.)</option>
                  <option value="v.">Động từ (v.)</option>
                  <option value="adj.">Tính từ (adj.)</option>
                  <option value="adv.">Trạng từ (adv.)</option>
                  <option value="prep.">Giới từ (prep.)</option>
                  <option value="conj.">Liên từ (conj.)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300">Phiên âm IPA</label>
                <input
                  type="text"
                  value={form.pronounce}
                  onChange={(e) => setForm({ ...form, pronounce: e.target.value })}
                  placeholder="/kəˈlæb.ə.reɪt/"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-red-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300">Chủ đề (Topic)</label>
                <input
                  type="text"
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  placeholder="Office & Workplace"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-red-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300">Chặng mục tiêu (Stage)</label>
                <select
                  value={form.stage}
                  onChange={(e) => setForm({ ...form, stage: Number(e.target.value) })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-red-500/50"
                >
                  <option value={1}>Chặng 1 (0–300)</option>
                  <option value={2}>Chặng 2 (300–500)</option>
                  <option value={3}>Chặng 3 (500–650)</option>
                  <option value={4}>Chặng 4 (650–800)</option>
                  <option value={5}>Chặng 5 (800–990)</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-semibold text-zinc-300">Câu ví dụ tiếng Anh (Example)</label>
                <input
                  type="text"
                  value={form.example}
                  onChange={(e) => setForm({ ...form, example: e.target.value })}
                  placeholder="We need to collaborate with the team on this project."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-red-500/50"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-semibold text-zinc-300">Dịch nghĩa câu ví dụ (Example Translation)</label>
                <input
                  type="text"
                  value={form.exampleVietnamese}
                  onChange={(e) => setForm({ ...form, exampleVietnamese: e.target.value })}
                  placeholder="Chúng ta cần hợp tác với đội ngũ trong dự án này."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-red-500/50"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-semibold text-zinc-300">Đường dẫn âm thanh (Audio URL)</label>
                <input
                  type="text"
                  value={form.audioUrl}
                  onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
                  placeholder="https://.../collaborate.mp3"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-red-500/50"
                />
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
                onClick={handleSaveVocabulary}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{saving ? "Đang lưu..." : "Lưu Từ Vựng"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}