"use client";

import { useEffect, useState } from "react";
import {
  Database,
  Plus,
  Search,
  Upload,
  BarChart3,
  Activity,
  Copy,
  Edit2,
  Trash2,
  Check,
  X,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Image as ImageIcon,
  FileText,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  Filter,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface QuestionItem {
  id: number;
  part: number;
  questionNumber: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  category: string;
  difficulty: string;
  difficultyScore: number;
  tags: string[];
  audioUrl?: string | null;
  imageUrl?: string | null;
  passage?: string | null;
  qualityScore: number;
  createdAt: string;
}

interface QuestionForm {
  part: number;
  questionNumber: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  category: string;
  difficulty: string;
  difficultyScore: number;
  tags: string[];
  audioUrl: string;
  imageUrl: string;
  passage: string;
}

const EMPTY_FORM: QuestionForm = {
  part: 5,
  questionNumber: 101,
  questionText: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "A",
  explanation: "",
  category: "Grammar - Parts of Speech",
  difficulty: "Medium",
  difficultyScore: 550,
  tags: ["Part 5", "Grammar"],
  audioUrl: "",
  imageUrl: "",
  passage: "",
};

export default function QuestionBankAdminPage() {
  const [activeTab, setActiveTab] = useState<"list" | "import" | "categories" | "stats" | "quality">("list");
  const [items, setItems] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [partFilter, setPartFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Form Modal (Add / Edit)
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<QuestionForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Bulk Import
  const [importJsonText, setImportJsonText] = useState("");
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);

  // Categories & Stats
  const [categories, setCategories] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<any>(null);

  // Quality & Duplicates
  const [qualityIssues, setQualityIssues] = useState<any[]>([]);
  const [duplicates, setDuplicates] = useState<any[]>([]);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    loadQuestions();
  }, [page, partFilter, difficultyFilter]);

  useEffect(() => {
    if (activeTab === "categories") loadCategories();
    if (activeTab === "stats") loadStatistics();
    if (activeTab === "quality") loadQualityAndDuplicates();
  }, [activeTab]);

  // 1. Load Question Bank
  const loadQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (search.trim()) params.set("search", search.trim());
      if (partFilter) params.set("part", partFilter);
      if (difficultyFilter) params.set("difficulty", difficultyFilter);

      const res = await apiFetch<{ items: QuestionItem[]; total: number; page: number; limit: number; totalPages: number }>(
        `/admin/question-bank?${params.toString()}`
      );

      setItems(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (e: any) {
      console.error(e);
      showToast(e.message || "Không thể tải danh sách câu hỏi", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadQuestions();
  };

  // 1 & 2. Save Question (Add or Edit)
  const handleSaveQuestion = async () => {
    if (!form.questionText.trim()) {
      showToast("Vui lòng nhập nội dung câu hỏi", "error");
      return;
    }
    if (!form.optionA.trim() || !form.optionB.trim()) {
      showToast("Vui lòng nhập tối thiểu đáp án A và B", "error");
      return;
    }

    try {
      setSaving(true);
      const endpoint = formMode === "create" ? "/admin/question-bank" : `/admin/question-bank/${editingId}`;
      const method = formMode === "create" ? "POST" : "PATCH";

      const res = await apiFetch<{ success: boolean; message: string }>(endpoint, {
        method,
        body: JSON.stringify(form),
      });

      if (res.success) {
        showToast(res.message || (formMode === "create" ? "Đã thêm câu hỏi mới!" : "Đã cập nhật câu hỏi!"));
        setShowForm(false);
        setForm(EMPTY_FORM);
        setEditingId(null);
        loadQuestions();
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi khi lưu câu hỏi", "error");
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

  const openEditModal = (item: QuestionItem) => {
    setForm({
      part: item.part,
      questionNumber: item.questionNumber,
      questionText: item.questionText,
      optionA: item.optionA,
      optionB: item.optionB,
      optionC: item.optionC,
      optionD: item.optionD,
      correctAnswer: item.correctAnswer,
      explanation: item.explanation,
      category: item.category,
      difficulty: item.difficulty,
      difficultyScore: item.difficultyScore,
      tags: item.tags || [],
      audioUrl: item.audioUrl || "",
      imageUrl: item.imageUrl || "",
      passage: item.passage || "",
    });
    setEditingId(item.id);
    setFormMode("edit");
    setShowForm(true);
  };

  // 3. Delete Question
  const handleDeleteQuestion = async (id: number) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa câu hỏi #${id}?`)) return;

    try {
      const res = await apiFetch<{ success: boolean; message: string }>(`/admin/question-bank/${id}`, {
        method: "DELETE",
      });
      if (res.success) {
        showToast("Đã xóa câu hỏi khỏi ngân hàng đề");
        loadQuestions();
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi khi xóa câu hỏi", "error");
    }
  };

  // 4. Bulk Import
  const handleParseJsonImport = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed)) {
        showToast("Dữ liệu phải là một mảng JSON các câu hỏi", "error");
        return;
      }
      setImportPreview(parsed);
      showToast(`Đã đọc ${parsed.length} câu hỏi từ JSON!`, "success");
    } catch (e: any) {
      showToast("Định dạng JSON không hợp lệ: " + e.message, "error");
    }
  };

  const handleExecuteImport = async () => {
    if (importPreview.length === 0) return;
    try {
      setImporting(true);
      const res = await apiFetch<{ success: boolean; message: string; importedCount: number }>(
        "/admin/question-bank/bulk-import",
        {
          method: "POST",
          body: JSON.stringify({ items: importPreview }),
        }
      );
      if (res.success) {
        showToast(res.message || `Đã nhập thành công ${res.importedCount} câu hỏi!`, "success");
        setImportJsonText("");
        setImportPreview([]);
        loadQuestions();
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi khi nhập dữ liệu", "error");
    } finally {
      setImporting(false);
    }
  };

  // 5 & 6. Categories & Difficulty
  const loadCategories = async () => {
    try {
      const res = await apiFetch<{ success: boolean; categories: any[] }>("/admin/question-bank/categories");
      if (res.success) setCategories(res.categories || []);
    } catch (e) {
      console.error(e);
    }
  };

  // 8. Statistics
  const loadStatistics = async () => {
    try {
      const res = await apiFetch<{ success: boolean; stats: any }>("/admin/question-bank/statistics");
      if (res.success) setStatsData(res.stats);
    } catch (e) {
      console.error(e);
    }
  };

  // 7 & 9. Quality & Duplicates
  const loadQualityAndDuplicates = async () => {
    try {
      const [qualRes, dupRes] = await Promise.all([
        apiFetch<{ success: boolean; issues: any[] }>("/admin/question-bank/quality-check"),
        apiFetch<{ success: boolean; duplicateGroups: any[] }>("/admin/question-bank/duplicates"),
      ]);
      if (qualRes.success) setQualityIssues(qualRes.issues || []);
      if (dupRes.success) setDuplicates(dupRes.duplicateGroups || []);
    } catch (e) {
      console.error(e);
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
            <Database className="w-6 h-6 text-red-400" />
            <span>Quản Lý Ngân Hàng Câu Hỏi (Question Bank 16.2)</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Quản trị ngân hàng đề thi TOEIC Part 1–7: Thêm mới, chỉnh sửa, nhập hàng loạt, phân loại, đánh giá độ khó và phát hiện trùng lặp.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Câu Hỏi Mới</span>
        </button>
      </div>

      {/* Master Tabs */}
      <div className="flex border-b border-zinc-800">
        {[
          { id: "list", label: `Ngân Hàng Câu Hỏi (${total})`, icon: Database },
          { id: "import", label: "Nhập Câu Hỏi Hàng Loạt", icon: Upload },
          { id: "categories", label: "Phân Loại & Độ Khó", icon: Layers },
          { id: "stats", label: "Thống Kê Ngân Hàng", icon: BarChart3 },
          { id: "quality", label: "Kiểm Tra Chất Lượng & Trùng Lặp", icon: ShieldCheck },
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

      {/* TAB 1: QUESTION BANK LIST (1. Add, 2. Edit, 3. Delete) */}
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
                placeholder="Tìm kiếm nội dung câu hỏi, lời giải hoặc dạng bài..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-red-500/50"
              />
            </form>

            <div className="flex gap-2">
              <select
                value={partFilter}
                onChange={(e) => {
                  setPartFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-red-500/50"
              >
                <option value="">Tất cả Part (1–7)</option>
                <option value="1">Part 1 (Mô tả ảnh)</option>
                <option value="2">Part 2 (Hỏi đáp)</option>
                <option value="3">Part 3 (Hội thoại ngắn)</option>
                <option value="4">Part 4 (Bài nói ngắn)</option>
                <option value="5">Part 5 (Điền câu)</option>
                <option value="6">Part 6 (Điền đoạn)</option>
                <option value="7">Part 7 (Đọc hiểu)</option>
              </select>

              <select
                value={difficultyFilter}
                onChange={(e) => {
                  setDifficultyFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-red-500/50"
              >
                <option value="">Tất cả Độ Khó</option>
                <option value="Easy">Dễ (300+)</option>
                <option value="Medium">Trung bình (550+)</option>
                <option value="Hard">Khó (750+)</option>
                <option value="Expert">Chuyên gia (900+)</option>
              </select>
            </div>
          </div>

          {/* Table / Cards Render */}
          <div className="space-y-3">
            {loading ? (
              <div className="p-12 text-center text-xs text-zinc-500">Đang tải câu hỏi...</div>
            ) : items.length === 0 ? (
              <div className="p-12 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                Không tìm thấy câu hỏi nào phù hợp với bộ lọc.
              </div>
            ) : (
              items.map((q) => (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-red-600 text-white font-extrabold text-xs">
                        Part {q.part}
                      </span>
                      <span className="font-bold text-xs text-zinc-400">Câu #{q.questionNumber}</span>
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] font-semibold">
                        {q.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          q.difficulty === "Easy"
                            ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
                            : q.difficulty === "Medium"
                            ? "bg-blue-950/40 text-blue-400 border border-blue-500/20"
                            : "bg-amber-950/40 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {q.difficulty} ({q.difficultyScore}+)
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(q)}
                        title="Chỉnh sửa câu hỏi"
                        className="p-1.5 hover:text-white hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        title="Xóa câu hỏi"
                        className="p-1.5 hover:text-red-400 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Passage if exists */}
                  {q.passage && (
                    <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300 whitespace-pre-line font-mono max-h-36 overflow-y-auto">
                      {q.passage}
                    </div>
                  )}

                  {/* Question Text */}
                  <p className="text-sm font-semibold text-white">{q.questionText}</p>

                  {/* 4 Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { key: "A", val: q.optionA },
                      { key: "B", val: q.optionB },
                      { key: "C", val: q.optionC },
                      { key: "D", val: q.optionD },
                    ].map((opt) => (
                      <div
                        key={opt.key}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                          q.correctAnswer === opt.key
                            ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300 font-bold"
                            : "bg-zinc-950/50 border-zinc-800/80 text-zinc-300"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            q.correctAnswer === opt.key
                              ? "bg-emerald-600 text-white"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {opt.key}
                        </span>
                        <span>{opt.val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Explanation */}
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs space-y-1">
                    <span className="font-bold text-red-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Lời giải chi tiết:</span>
                    </span>
                    <p className="text-zinc-300">{q.explanation}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span>
              Hiển thị trang <strong>{page}</strong> / {totalPages} (Tổng số {total} câu hỏi)
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
      )}

      {/* TAB 2: BULK IMPORT (4. Bulk import questions) */}
      {activeTab === "import" && (
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-red-400" />
            <span>4. Nhập Câu Hỏi Hàng Loạt (Bulk Import JSON / CSV)</span>
          </h3>

          <p className="text-xs text-zinc-400">
            Dán mảng JSON chứa các câu hỏi theo định dạng chuẩn Part 1–7 để hệ thống nạp tự động vào ngân hàng:
          </p>

          <textarea
            rows={8}
            value={importJsonText}
            onChange={(e) => setImportJsonText(e.target.value)}
            placeholder={`[\n  {\n    "part": 5,\n    "questionNumber": 101,\n    "questionText": "The director requested that all staff _______ the safety briefing.",\n    "optionA": "attend",\n    "optionB": "attends",\n    "optionC": "attended",\n    "optionD": "attending",\n    "correctAnswer": "A",\n    "explanation": "Cấu trúc giả định thức: requested that + S + (should) + V-inf.",\n    "category": "Subjunctive Mood",\n    "difficulty": "Hard"\n  }\n]`}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-red-500/50 resize-none"
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
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{importing ? "Đang nạp..." : `Nạp ${importPreview.length} Câu Hỏi`}</span>
              </button>
            )}
          </div>

          {importPreview.length > 0 && (
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
              <span className="font-bold text-white">Xem trước {importPreview.length} câu hỏi sẵn sàng nạp:</span>
              <div className="max-h-36 overflow-y-auto space-y-1 divide-y divide-zinc-900">
                {importPreview.slice(0, 5).map((row, idx) => (
                  <div key={idx} className="pt-1.5 flex justify-between text-zinc-300">
                    <span className="font-bold text-white">Part {row.part}: {row.questionText.slice(0, 60)}...</span>
                    <span className="text-emerald-400 font-bold">Đáp án: {row.correctAnswer}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CATEGORIZATION & DIFFICULTY (5. Categorization, 6. Difficulty Rating) */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-red-400" />
              <span>5. Phân Loại Dạng Bài & Dạng Câu Hỏi Theo Part 1–7</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categories.map((c) => (
                <div key={c.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-red-950/40 text-red-400 font-extrabold text-[10px]">
                        Part {c.part}
                      </span>
                      <h4 className="text-xs font-bold text-white">{c.name}</h4>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-zinc-900 text-zinc-300 font-bold text-xs">
                    {c.questionCount} câu
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>6. Thang Điểm & Đánh Giá Độ Khó (Difficulty Rating System)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-emerald-400 font-bold">DỄ (EASY)</span>
                <div className="text-lg font-black text-white mt-1">300 – 450+</div>
                <p className="text-[10px] text-zinc-500 mt-0.5">Nhận biết từ loại cơ bản, thì đơn</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-blue-400 font-bold">TRUNG BÌNH (MEDIUM)</span>
                <div className="text-lg font-black text-white mt-1">500 – 650+</div>
                <p className="text-[10px] text-zinc-500 mt-0.5">Mệnh đề quan hệ, cụm từ cố định</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-amber-400 font-bold">KHÓ (HARD)</span>
                <div className="text-lg font-black text-white mt-1">700 – 850+</div>
                <p className="text-[10px] text-zinc-500 mt-0.5">Đảo ngữ, câu hỏi suy luận Part 7</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-red-400 font-bold">CHUYÊN GIA (EXPERT)</span>
                <div className="text-lg font-black text-white mt-1">900 – 990</div>
                <p className="text-[10px] text-zinc-500 mt-0.5">Bẫy đề thi nâng cao, từ vựng hiếm</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STATISTICS (8. Question statistics) */}
      {activeTab === "stats" && statsData && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-500">Tổng câu hỏi ngân hàng</span>
              <div className="text-2xl font-black text-white mt-1">{statsData.totalQuestions}</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-500">Độ phủ lời giải thích</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">{statsData.explanationCoverage}%</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-500">Độ phủ Audio/Image</span>
              <div className="text-2xl font-black text-blue-400 mt-1">{statsData.mediaCoverage}%</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-500">Chuẩn hóa Format</span>
              <div className="text-2xl font-black text-purple-400 mt-1">100%</div>
            </div>
          </div>

          {/* Part Breakdown Table */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
            <h3 className="text-sm font-bold text-white">Phân Bổ Câu Hỏi Theo Part 1–7</h3>

            <div className="space-y-3">
              {statsData.partBreakdown.map((pb: any) => (
                <div key={pb.part} className="space-y-1 text-xs">
                  <div className="flex justify-between text-zinc-300">
                    <span className="font-bold">{pb.name}</span>
                    <span>{pb.count} câu ({pb.percentage}%)</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: `${pb.percentage * 3}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: QUALITY CHECK & DUPLICATES (7. Quality Check, 9. Duplicate detection) */}
      {activeTab === "quality" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 7. Quality Check */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-400" />
              <span>7. Cảnh Báo Chất Lượng Câu Hỏi ({qualityIssues.length})</span>
            </h3>

            <div className="space-y-2.5">
              {qualityIssues.map((iss) => (
                <div key={iss.id} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-red-950/40 text-red-400 font-bold text-[10px]">
                        Part {iss.part} - Câu #{iss.questionId}
                      </span>
                    </div>
                    <p className="text-zinc-300 mt-1 font-semibold">{iss.issue}</p>
                  </div>

                  <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold">
                    Sửa ngay
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 9. Duplicate Detection */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Copy className="w-4 h-4 text-amber-400" />
              <span>9. Phát Hiện Câu Hỏi Trùng Lặp ({duplicates.length} nhóm)</span>
            </h3>

            <div className="space-y-3">
              {duplicates.map((dup) => (
                <div key={dup.groupId} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Tương đồng: {dup.similarity}%</span>
                    <span className="px-2 py-0.5 rounded bg-amber-950/40 text-amber-400 font-bold text-[10px]">
                      {dup.questions.length} câu trùng
                    </span>
                  </div>
                  <p className="text-zinc-400 italic">"{dup.questionTextSample}"</p>
                  <div className="flex justify-end gap-2 pt-1">
                    <button className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[11px] font-semibold">
                      Giữ lại bản chuẩn
                    </button>
                    <button className="px-3 py-1 bg-red-950/40 hover:bg-red-900/50 text-red-400 rounded-lg text-[11px] font-bold">
                      Gộp trùng lặp
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-3xl w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-red-400" />
                <span>{formMode === "create" ? "Thêm Câu Hỏi Mới" : "Chỉnh Sửa Câu Hỏi"}</span>
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Part (1–7) *</label>
                  <select
                    value={form.part}
                    onChange={(e) => setForm({ ...form, part: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value={1}>Part 1</option>
                    <option value={2}>Part 2</option>
                    <option value={3}>Part 3</option>
                    <option value={4}>Part 4</option>
                    <option value={5}>Part 5</option>
                    <option value={6}>Part 6</option>
                    <option value={7}>Part 7</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Số thứ tự câu</label>
                  <input
                    type="number"
                    value={form.questionNumber}
                    onChange={(e) => setForm({ ...form, questionNumber: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Độ khó</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value="Easy">Dễ (300+)</option>
                    <option value="Medium">Trung bình (550+)</option>
                    <option value="Hard">Khó (750+)</option>
                    <option value="Expert">Chuyên gia (900+)</option>
                  </select>
                </div>
              </div>

              {/* Passage if Part 6 or 7 */}
              {(form.part === 6 || form.part === 7) && (
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Đoạn văn đọc hiểu (Passage)</label>
                  <textarea
                    rows={4}
                    value={form.passage}
                    onChange={(e) => setForm({ ...form, passage: e.target.value })}
                    placeholder="Dán đoạn văn văn bản, email, bài báo vào đây..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-500/50 resize-none font-mono"
                  />
                </div>
              )}

              {/* Question Text */}
              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Nội dung câu hỏi *</label>
                <textarea
                  rows={2}
                  value={form.questionText}
                  onChange={(e) => setForm({ ...form, questionText: e.target.value })}
                  placeholder="Nhập nội dung câu hỏi..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-500/50 resize-none"
                />
              </div>

              {/* 4 Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Lựa chọn (A) *</label>
                  <input
                    type="text"
                    value={form.optionA}
                    onChange={(e) => setForm({ ...form, optionA: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Lựa chọn (B) *</label>
                  <input
                    type="text"
                    value={form.optionB}
                    onChange={(e) => setForm({ ...form, optionB: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Lựa chọn (C)</label>
                  <input
                    type="text"
                    value={form.optionC}
                    onChange={(e) => setForm({ ...form, optionC: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Lựa chọn (D)</label>
                  <input
                    type="text"
                    value={form.optionD}
                    onChange={(e) => setForm({ ...form, optionD: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>

              {/* Correct Answer & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Đáp án chính xác *</label>
                  <select
                    value={form.correctAnswer}
                    onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-red-500/50"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Phân loại dạng bài</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Grammar - Prepositions"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>

              {/* Explanation */}
              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Lời giải thích chi tiết & Bẫy đề thi</label>
                <textarea
                  rows={3}
                  value={form.explanation}
                  onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                  placeholder="Giải thích vì sao chọn đáp án này, phân tích ngữ pháp hoặc từ vựng..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-500/50 resize-none"
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
                onClick={handleSaveQuestion}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{saving ? "Đang lưu..." : "Lưu Câu Hỏi"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
