"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  getErrorLogs,
  getErrorAnalysis,
  generateErrorDrill,
  submitErrorDrill,
  scheduleRepeatDrill,
  updateErrorLogStatus,
  updateErrorLogNote,
  deleteErrorLog,
  type ErrorLogItem,
  type ErrorLogSummaryStats,
  type ErrorAnalysisResponse,
  type ErrorDrillQuestion,
  type ErrorDrillSubmitResponse,
} from "@/services/error-tracking";
import { playTestSoundEffect } from "@/lib/test-settings";
import {
  BookMarked,
  Settings,
  FileText,
  BarChart3,
  Zap,
  Search,
  Trash2,
  Clock,
  Check,
  X,
  RotateCcw,
  Flame,
  Target,
  PartyPopper,
  Lightbulb,
  Bot,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Trophy,
  Pin,
  Save,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Dice5,
  Loader2,
} from "lucide-react";

const ERROR_TYPE_CONFIG: Record<
  string,
  { label: string; badgeColor: string; icon: any; desc: string }
> = {
  grammar: {
    label: "Ngữ pháp",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    icon: FileText,
    desc: "Sai cấu trúc, thì, mệnh đề hoặc chia động từ",
  },
  vocabulary: {
    label: "Từ vựng",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    icon: BookOpen,
    desc: "Chưa nắm rõ nghĩa từ, từ đồng nghĩa hoặc collocations",
  },
  careless: {
    label: "Bất cẩn",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    icon: Zap,
    desc: "Đọc thiếu sót đề bài, nhìn nhầm từ khóa hoặc bẫy đề",
  },
  timing: {
    label: "Thiếu thời gian",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    icon: Clock,
    desc: "Hết thời gian làm bài, chọn vội hoặc không kịp phân tích",
  },
};

export default function ErrorLogPage() {
  const [activeTab, setActiveTab] = useState<"list" | "analysis" | "drills">("list");
  const [items, setItems] = useState<ErrorLogItem[]>([]);
  const [stats, setStats] = useState<ErrorLogSummaryStats>({
    total: 0,
    active: 0,
    resolved: 0,
    resolutionRate: 0,
    grammarCount: 0,
    vocabularyCount: 0,
    carelessCount: 0,
    timingCount: 0,
  });
  const [analysisData, setAnalysisData] = useState<ErrorAnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Filters & Sorting State (8.1)
  const [errorTypeFilter, setErrorTypeFilter] = useState<"all" | "grammar" | "vocabulary" | "careless" | "timing">("all");
  const [partFilter, setPartFilter] = useState<number | "all">("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<"all" | "7d" | "30d" | "90d">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "resolved">("all");
  const [sortBy, setSortBy] = useState<"frequency" | "date">("frequency");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals State (8.1)
  const [detailItem, setDetailItem] = useState<ErrorLogItem | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<ErrorLogItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<string>("");
  const [editingType, setEditingType] = useState<string>("grammar");
  const [isSavingNote, setIsSavingNote] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ── ERROR DRILLS STATE (8.3) ──
  const [drillStep, setDrillStep] = useState<"config" | "running" | "summary">("config");
  const [drillMode, setDrillMode] = useState<"top10" | "type" | "all">("top10");
  const [drillErrorType, setDrillErrorType] = useState<string>("all");
  const [drillQuestionCount, setDrillQuestionCount] = useState<number>(10);
  const [drillPart, setDrillPart] = useState<number | "all">("all");
  const [isGeneratingDrill, setIsGeneratingDrill] = useState<boolean>(false);
  const [drillQuestions, setDrillQuestions] = useState<ErrorDrillQuestion[]>([]);
  const [drillCurrentIdx, setDrillCurrentIdx] = useState<number>(0);
  const [drillSelectedOption, setDrillSelectedOption] = useState<string | null>(null);
  const [drillAnsweredResults, setDrillAnsweredResults] = useState<
    Array<{ errorLogId: number; isCorrect: boolean; selectedOption: string }>
  >([]);
  const [drillChecked, setDrillChecked] = useState<boolean>(false);
  const [drillSeconds, setDrillSeconds] = useState<number>(0);
  const [drillSummary, setDrillSummary] = useState<ErrorDrillSubmitResponse | null>(null);
  const [isSubmittingDrill, setIsSubmittingDrill] = useState<boolean>(false);
  const [isScheduling, setIsScheduling] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getErrorLogs({
        errorType: errorTypeFilter,
        part: partFilter,
        dateRange: dateRangeFilter,
        status: statusFilter,
        sortBy,
        sortOrder,
        search: searchQuery,
      });

      setItems(res.items);
      setStats(res.stats);
    } catch (err: any) {
      console.error("Load error log error:", err);
      setError(err?.message || "Không thể tải dữ liệu Sổ tay lỗi.");
    } finally {
      setLoading(false);
    }
  }, [errorTypeFilter, partFilter, dateRangeFilter, statusFilter, sortBy, sortOrder, searchQuery]);

  const loadAnalysis = useCallback(async () => {
    try {
      setLoadingAnalysis(true);
      const res = await getErrorAnalysis();
      setAnalysisData(res);
    } catch (err: any) {
      console.error("Load error analysis error:", err);
    } finally {
      setLoadingAnalysis(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (activeTab === "analysis") {
      loadAnalysis();
    }
  }, [activeTab, loadAnalysis]);

  // Drill Timer Effect
  useEffect(() => {
    if (drillStep === "running") {
      timerRef.current = setInterval(() => {
        setDrillSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [drillStep]);

  // Open Detail Modal
  const openDetail = (item: ErrorLogItem) => {
    setDetailItem(item);
    setEditingNote(item.userNote || "");
    setEditingType(item.errorType || "grammar");
  };

  // Toggle Status: Resolved / Active
  const handleToggleStatus = async (item: ErrorLogItem) => {
    const newStatus = item.status === "active" ? "resolved" : "active";
    try {
      await updateErrorLogStatus(item.id, newStatus);
      showToast(`Đã chuyển trạng thái thành "${newStatus === "resolved" ? "Đã giải quyết" : "Đang theo dõi"}".`);
      setItems((prev) =>
        prev.map((x) => (x.id === item.id ? { ...x, status: newStatus } : x))
      );
      if (detailItem && detailItem.id === item.id) {
        setDetailItem({ ...detailItem, status: newStatus });
      }
      setStats((prev) => ({
        ...prev,
        active: newStatus === "resolved" ? prev.active - 1 : prev.active + 1,
        resolved: newStatus === "resolved" ? prev.resolved + 1 : prev.resolved - 1,
        resolutionRate: prev.total > 0 ? Math.round(((newStatus === "resolved" ? prev.resolved + 1 : prev.resolved - 1) / prev.total) * 100) : 0,
      }));
    } catch (err: any) {
      alert(err?.message || "Lỗi khi cập nhật trạng thái!");
    }
  };

  // Save Note & Error Type
  const handleSaveNote = async () => {
    if (!detailItem) return;
    try {
      setIsSavingNote(true);
      await updateErrorLogNote(detailItem.id, editingNote, editingType);
      showToast("Đã lưu ghi chú cá nhân và phân loại lỗi thành công!");
      const updated = {
        ...detailItem,
        userNote: editingNote,
        errorType: editingType as any,
      };
      setDetailItem(updated);
      setItems((prev) => prev.map((x) => (x.id === detailItem.id ? updated : x)));
    } catch (err: any) {
      alert(err?.message || "Lỗi khi lưu ghi chú!");
    } finally {
      setIsSavingNote(false);
    }
  };

  // Delete Error Log
  const handleDelete = async () => {
    if (!deleteConfirmItem) return;
    try {
      setIsDeleting(true);
      await deleteErrorLog(deleteConfirmItem.id);
      showToast("Đã xóa câu hỏi khỏi Sổ tay lỗi.");
      setItems((prev) => prev.filter((x) => x.id !== deleteConfirmItem.id));
      if (detailItem && detailItem.id === deleteConfirmItem.id) {
        setDetailItem(null);
      }
      setDeleteConfirmItem(null);
      setStats((prev) => {
        const newTotal = prev.total - 1;
        const newResolved = deleteConfirmItem.status === "resolved" ? prev.resolved - 1 : prev.resolved;
        const newActive = deleteConfirmItem.status === "active" ? prev.active - 1 : prev.active;
        return {
          ...prev,
          total: Math.max(0, newTotal),
          active: Math.max(0, newActive),
          resolved: Math.max(0, newResolved),
          resolutionRate: newTotal > 0 ? Math.round((newResolved / newTotal) * 100) : 0,
        };
      });
    } catch (err: any) {
      alert(err?.message || "Lỗi khi xóa bản ghi!");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── 8.3 DRILL CONTROLS ──
  const handleStartDrill = async () => {
    try {
      setIsGeneratingDrill(true);
      const res = await generateErrorDrill({
        mode: drillMode,
        errorType: drillMode === "type" ? drillErrorType : undefined,
        limit: drillQuestionCount,
        part: drillPart !== "all" ? drillPart : undefined,
      });

      if (!res.questions || res.questions.length === 0) {
        alert("Không tìm thấy câu hỏi sai phù hợp để tạo bài tập. Hãy chọn chế độ khác hoặc thêm câu sai vào sổ tay!");
        return;
      }

      setDrillQuestions(res.questions);
      setDrillCurrentIdx(0);
      setDrillSelectedOption(null);
      setDrillChecked(false);
      setDrillAnsweredResults([]);
      setDrillSeconds(0);
      setDrillSummary(null);
      setDrillStep("running");
      playTestSoundEffect("click");
    } catch (err: any) {
      alert(err?.message || "Không thể khởi tạo bài tập lỗi.");
    } finally {
      setIsGeneratingDrill(false);
    }
  };

  const handleSelectDrillOption = (optionLabel: string) => {
    if (drillChecked) return;
    setDrillSelectedOption(optionLabel);
    setDrillChecked(true);

    const currentQ = drillQuestions[drillCurrentIdx];
    const isCorrect = optionLabel.toUpperCase() === currentQ.correctAnswer.toUpperCase();

    if (isCorrect) {
      playTestSoundEffect("complete");
    } else {
      playTestSoundEffect("warning");
    }

    setDrillAnsweredResults((prev) => [
      ...prev,
      { errorLogId: currentQ.errorLogId, isCorrect, selectedOption: optionLabel },
    ]);
  };

  const handleNextDrillQuestion = async () => {
    if (drillCurrentIdx < drillQuestions.length - 1) {
      setDrillCurrentIdx((idx) => idx + 1);
      setDrillSelectedOption(null);
      setDrillChecked(false);
      playTestSoundEffect("click");
    } else {
      // Submit Drill
      try {
        setIsSubmittingDrill(true);
        const res = await submitErrorDrill({
          results: drillAnsweredResults,
          durationSeconds: drillSeconds,
        });
        setDrillSummary(res);
        setDrillStep("summary");
        playTestSoundEffect("complete");
        loadData();
      } catch (err: any) {
        alert(err?.message || "Lỗi khi nộp bài tập Drill!");
      } finally {
        setIsSubmittingDrill(false);
      }
    }
  };

  const handleScheduleRepeat = async (days: number) => {
    try {
      setIsScheduling(true);
      await scheduleRepeatDrill({ repeatInDays: days });
      showToast(`Đã lên lịch nhắc nhở ôn tập sau ${days} ngày!`);
    } catch (err: any) {
      alert(err?.message || "Lỗi khi lên lịch ôn tập!");
    } finally {
      setIsScheduling(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 animate-fade-in w-full pb-10">
        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-red-600/15 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
              <BookMarked className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Sổ Tay Lỗi (Error Tracking System)
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600/20 text-red-400 border border-red-500/30">
                  Hệ thống 8
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-zinc-400">
                Ghi nhận, phân tích AI và luyện tập chuyên sâu các câu làm sai để bứt phá 900+ TOEIC
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/error-log/settings"
              className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <Settings className="w-4 h-4" />
              <span>Cài đặt</span>
            </Link>

            <Link
              href="/dashboard/mock-test"
              className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Làm bài thi thử</span>
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* ================================================== */}
        {/* TAB SWITCHER (8.1, 8.2, 8.3) */}
        {/* ================================================== */}
        <div className="grid grid-cols-3 rounded-2xl border border-white/5 bg-[#121214] p-1">
          <button
            type="button"
            onClick={() => setActiveTab("list")}
            className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium transition ${
              activeTab === "list"
                ? "bg-red-600 text-white shadow-lg font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <BookMarked className="w-4 h-4" />
            <span>Sổ tay ({stats.total})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("analysis")}
            className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium transition ${
              activeTab === "analysis"
                ? "bg-red-600 text-white shadow-lg font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Phân tích lỗi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("drills")}
            className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium transition ${
              activeTab === "drills"
                ? "bg-red-600 text-white shadow-lg font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Luyện tập Drill</span>
          </button>
        </div>

        {/* ================================================== */}
        {/* TAB 1: ERROR LIST VIEW (8.1) */}
        {/* ================================================== */}
        {activeTab === "list" && (
          <div className="space-y-6 animate-fade-in">
            {/* Summary statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-white/5 bg-[#121214] p-5 text-center">
                <div className="text-3xl font-black text-white">{stats.total}</div>
                <p className="mt-1 text-xs text-zinc-500">Tổng số câu sai đã ghi</p>
              </div>

              <div className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-5 text-center">
                <div className="text-3xl font-black text-amber-400">{stats.active}</div>
                <p className="mt-1 text-xs text-amber-300/70">Đang cần khắc phục</p>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-5 text-center">
                <div className="text-3xl font-black text-emerald-400">{stats.resolved}</div>
                <p className="mt-1 text-xs text-emerald-300/70">Đã giải quyết thành thạo</p>
              </div>

              <div className="rounded-2xl border border-purple-500/20 bg-purple-950/10 p-5 text-center">
                <div className="text-3xl font-black text-purple-400">{stats.resolutionRate}%</div>
                <p className="mt-1 text-xs text-purple-300/70">Tỷ lệ khắc phục lỗi</p>
              </div>
            </div>

            {/* Filter toolbar */}
            <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Tìm kiếm câu hỏi, từ khóa, ghi chú cá nhân, giải thích..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/50 transition"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1.5">Loại lỗi</label>
                  <select
                    value={errorTypeFilter}
                    onChange={(e) => setErrorTypeFilter(e.target.value as any)}
                    aria-label="Lọc theo loại lỗi"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-red-500/50"
                  >
                    <option value="all">Tất cả loại lỗi</option>
                    <option value="grammar">Ngữ pháp ({stats.grammarCount})</option>
                    <option value="vocabulary">Từ vựng ({stats.vocabularyCount})</option>
                    <option value="careless">Bất cẩn ({stats.carelessCount})</option>
                    <option value="timing">Thiếu thời gian ({stats.timingCount})</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1.5">Phần thi (Part)</label>
                  <select
                    value={partFilter}
                    onChange={(e) => setPartFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
                    aria-label="Lọc theo phần thi TOEIC"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-red-500/50"
                  >
                    <option value="all">Tất cả Part (1–7)</option>
                    <option value="1">Part 1: Photographs</option>
                    <option value="2">Part 2: Question-Response</option>
                    <option value="3">Part 3: Conversations</option>
                    <option value="4">Part 4: Short Talks</option>
                    <option value="5">Part 5: Incomplete Sentences</option>
                    <option value="6">Part 6: Text Completion</option>
                    <option value="7">Part 7: Reading Comprehension</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1.5">Khoảng ngày</label>
                  <select
                    value={dateRangeFilter}
                    onChange={(e) => setDateRangeFilter(e.target.value as any)}
                    aria-label="Lọc theo khoảng ngày"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-red-500/50"
                  >
                    <option value="all">Tất cả thời gian</option>
                    <option value="7d">7 ngày qua</option>
                    <option value="30d">30 ngày qua</option>
                    <option value="90d">90 ngày qua</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1.5">Trạng thái</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    aria-label="Lọc theo trạng thái câu hỏi"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-red-500/50"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang theo dõi</option>
                    <option value="resolved">Đã giải quyết</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1.5">Sắp xếp</label>
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split("-") as [any, any];
                      setSortBy(field);
                      setSortOrder(order);
                    }}
                    aria-label="Sắp xếp danh sách lỗi"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-red-500/50"
                  >
                    <option value="frequency-desc">Sai nhiều nhất</option>
                    <option value="frequency-asc">Sai ít nhất</option>
                    <option value="date-desc">Ngày mới nhất</option>
                    <option value="date-asc">Ngày cũ nhất</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Error List */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 rounded-2xl bg-zinc-900/60 border border-zinc-800 animate-pulse" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-3xl border border-white/5 bg-[#121214] p-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                  <Check className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-white">Không có câu sai nào khớp bộ lọc</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Bạn chưa lưu câu sai nào hoặc các câu sai đã được lọc hết. Hãy tiếp tục làm đề thi thử để củng cố kiến thức!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setErrorTypeFilter("all");
                    setPartFilter("all");
                    setDateRangeFilter("all");
                    setStatusFilter("all");
                    setSearchQuery("");
                  }}
                  className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {items.map((item) => {
                  const typeCfg = ERROR_TYPE_CONFIG[item.errorType] || ERROR_TYPE_CONFIG.grammar;
                  const TypeIcon = typeCfg.icon;
                  const isResolved = item.status === "resolved";

                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl border p-5 transition ${
                        isResolved
                          ? "border-emerald-500/20 bg-emerald-950/5 hover:border-emerald-500/30"
                          : "border-white/5 bg-[#121214] hover:border-white/10"
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/5 text-zinc-300 border border-white/10">
                              Part {item.part}
                            </span>

                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${typeCfg.badgeColor} flex items-center gap-1`}>
                              <TypeIcon className="w-3 h-3" />
                              <span>{typeCfg.label}</span>
                            </span>

                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border flex items-center gap-1 ${
                              item.frequency > 1
                                ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                                : "bg-zinc-800 text-zinc-400 border-zinc-700"
                            }`}>
                              <RotateCcw className="w-2.5 h-2.5" />
                              <span>Sai {item.frequency} lần</span>
                            </span>

                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                              isResolved
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            }`}>
                              {isResolved ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Đã giải quyết</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3" />
                                  <span>Đang theo dõi</span>
                                </>
                              )}
                            </span>
                          </div>

                          <p className="text-sm font-semibold text-white line-clamp-2 leading-relaxed">
                            {item.questionText || item.passage || "Câu hỏi luyện thi TOEIC"}
                          </p>

                          <div className="flex items-center gap-4 text-xs flex-wrap">
                            {item.userAnswer && (
                              <div className="flex items-center gap-1 text-rose-400 font-medium">
                                <span>Đáp án bạn chọn:</span>
                                <span className="font-bold px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                                  {item.userAnswer}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-emerald-400 font-medium">
                              <span>Đáp án đúng:</span>
                              <span className="font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                                {item.correctAnswer}
                              </span>
                            </div>
                            <span className="text-[11px] text-zinc-500">
                              Lần cuối sai: {new Date(item.lastOccurredAt).toLocaleDateString("vi-VN")}
                            </span>
                          </div>

                          {item.userNote && (
                            <div className="text-[11px] text-zinc-300 bg-white/[0.02] px-3 py-1.5 rounded-xl border border-white/5 inline-flex items-center gap-1.5">
                              <Pin className="w-3 h-3 text-amber-400" />
                              <span className="italic line-clamp-1">{item.userNote}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(item)}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                              isResolved
                                ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700"
                                : "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/40"
                            }`}
                          >
                            {!isResolved && <Check className="w-3.5 h-3.5" />}
                            <span>{isResolved ? "Mở lại" : "Đã giải quyết"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openDetail(item)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition shadow"
                          >
                            <Search className="w-3.5 h-3.5" />
                            <span>Chi tiết & Lời giải</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmItem(item)}
                            title="Xóa câu hỏi này khỏi Sổ tay lỗi"
                            className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition text-xs"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================================================== */}
        {/* TAB 2: ERROR ANALYSIS (8.2) */}
        {/* ================================================== */}
        {activeTab === "analysis" && (
          <div className="space-y-6 animate-fade-in">
            {loadingAnalysis ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-40 rounded-3xl bg-zinc-900/60 border border-zinc-800 animate-pulse" />
                ))}
              </div>
            ) : !analysisData || analysisData.totalErrors === 0 ? (
              <div className="rounded-3xl border border-white/5 bg-[#121214] p-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-2">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-white">Chưa có dữ liệu phân tích lỗi</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Hãy lưu ít nhất 1 câu làm sai vào Sổ tay lỗi để hệ thống AI phân tích biểu đồ phân phối, điểm yếu và mẫu lỗi của bạn.
                </p>
                <Link
                  href="/dashboard/mock-test"
                  className="inline-flex items-center gap-1.5 mt-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition"
                >
                  <span>Làm đề thi thử ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <>
                {/* 1. Resolution Rate KPI */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-zinc-900 to-zinc-950 p-6 flex flex-col justify-between">
                    <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Target className="w-3.5 h-3.5" />
                      <span>Tỷ Lệ Giải Quyết Lỗi</span>
                    </span>
                    <div className="my-2">
                      <div className="text-4xl font-black text-white">{analysisData.resolutionRateStats.resolutionRate}%</div>
                      <p className="text-xs text-emerald-300/80 mt-1">
                        Đã khắc phục <strong>{analysisData.resolutionRateStats.resolved}</strong> / {analysisData.resolutionRateStats.total} câu sai
                      </p>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-900 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${analysisData.resolutionRateStats.resolutionRate}%` }} />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 flex flex-col justify-between">
                    <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Câu Sai Cần Xử Lý</span>
                    </span>
                    <div className="my-2">
                      <div className="text-4xl font-black text-amber-400">{analysisData.resolutionRateStats.active}</div>
                      <p className="text-xs text-zinc-400 mt-1">Câu hỏi cần ôn tập lại và làm bài tập củng cố</p>
                    </div>
                    <span className="text-[10px] text-amber-400 bg-amber-950/30 px-2.5 py-1 rounded-xl border border-amber-800/30 w-fit">
                      Ưu tiên hàng đầu
                    </span>
                  </div>

                  <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 flex flex-col justify-between">
                    <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-purple-400" />
                      <span>Đánh Giá Tiến Bộ</span>
                    </span>
                    <div className="my-2">
                      <div className="text-2xl font-bold text-purple-300">
                        {analysisData.resolutionRateStats.resolutionRate >= 70 ? "Xuất sắc" : analysisData.resolutionRateStats.resolutionRate >= 40 ? "Đang tiến bộ" : "Cần tập trung"}
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">Mục tiêu giải quyết trên 80% câu sai trước ngày thi</p>
                    </div>
                    <span className="text-[10px] text-zinc-400">Target 900+ TOEIC Mastery</span>
                  </div>
                </div>

                {/* 2. Recurring Error Alerts */}
                {analysisData.recurringAlerts.length > 0 && (
                  <div className="rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-950/20 via-zinc-900 to-zinc-950 p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-6 h-6 text-rose-400" />
                      <div>
                        <h3 className="text-sm font-bold text-rose-400">Cảnh Báo Lỗi Lặp Lại (Recurring Error Alerts)</h3>
                        <p className="text-xs text-zinc-400">Phát hiện các câu hỏi bạn đã làm sai từ 2 lần trở lên chưa được giải quyết</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {analysisData.recurringAlerts.map((alert) => (
                        <div key={alert.id} className="p-4 rounded-2xl bg-zinc-950 border border-rose-800/40 space-y-2 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-zinc-400">Part {alert.part} • {alert.errorType}</span>
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600/30 text-rose-300 border border-rose-500/50">
                                <RotateCcw className="w-2.5 h-2.5" />
                                <span>Sai {alert.frequency} lần!</span>
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-white mt-1.5 line-clamp-2">{alert.questionText}</p>
                          </div>
                          <p className="text-[11px] text-rose-300/90 leading-relaxed bg-rose-950/30 p-2 rounded-xl border border-rose-900/40">
                            {alert.alertMessage}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. AI Pattern Detection */}
                <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-950/20 to-zinc-950 p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Bot className="w-6 h-6 text-purple-400" />
                    <div>
                      <h3 className="text-base font-bold text-purple-300">Phát Hiện Mẫu Lỗi AI (Error Pattern Detection)</h3>
                      <p className="text-xs text-zinc-400">AI tự động phân tích và nhận diện thói quen làm sai có hệ thống của bạn</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analysisData.patternDetection.map((p, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border space-y-2 flex flex-col justify-between ${
                          p.severity === "critical"
                            ? "bg-rose-950/20 border-rose-500/40"
                            : p.severity === "warning"
                            ? "bg-amber-950/20 border-amber-500/40"
                            : "bg-purple-950/20 border-purple-500/30"
                        }`}
                      >
                        <div>
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                            p.severity === "critical"
                              ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                              : p.severity === "warning"
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                              : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                          }`}>
                            {p.severity === "critical" ? "Báo động" : p.severity === "warning" ? "Cảnh báo" : "Gợi ý AI"}
                          </span>
                          <h4 className="text-xs font-bold text-white mt-2 leading-relaxed">{p.title}</h4>
                          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{p.description}</p>
                        </div>
                        <div className="pt-2 border-t border-white/5 text-[11px] text-zinc-300 flex items-start gap-1">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span><strong className="text-white">Khuyến nghị:</strong> {p.recommendation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Type & Frequency Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-indigo-400" />
                        <span>Biểu Đồ Phân Phối Loại Lỗi (Error Type Distribution)</span>
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">Tỷ lệ các nhóm nguyên nhân gây ra câu sai</p>
                    </div>

                    <div className="space-y-3 pt-2">
                      {analysisData.typeDistribution.map((t) => {
                        const Cfg = ERROR_TYPE_CONFIG[t.type];
                        const Icon = Cfg?.icon || FileText;
                        return (
                          <div key={t.type} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                                <Icon className="w-3.5 h-3.5" />
                                <span>{t.label}</span>
                              </span>
                              <span className="font-bold text-white">{t.count} câu ({t.percentage}%)</span>
                            </div>
                            <div className="h-2.5 rounded-full bg-zinc-900 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${t.percentage}%`, backgroundColor: t.color }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <RotateCcw className="w-4 h-4 text-indigo-400" />
                        <span>Biểu Đồ Tần Suất Lỗi (Error Frequency Chart)</span>
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">Phân bổ mức độ lặp lại của các câu sai</p>
                    </div>

                    <div className="space-y-3 pt-2">
                      {analysisData.frequencyDistribution.map((f, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-300 font-semibold">{f.range}</span>
                            <span className="font-bold text-white">{f.count} câu ({f.percentage}%)</span>
                          </div>
                          <div className="h-2.5 rounded-full bg-zinc-900 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                idx === 0 ? "bg-blue-500" : idx === 1 ? "bg-amber-500" : "bg-rose-500"
                              }`}
                              style={{ width: `${f.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. Trend Over Time */}
                {analysisData.trendOverTime.length > 0 && (
                  <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span>Xu Hướng Lỗi Theo Thời Gian (Error Trend Over Time)</span>
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">Số lượng câu sai ghi nhận và số câu đã giải quyết theo ngày</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-2">
                      {analysisData.trendOverTime.map((item, idx) => (
                        <div key={idx} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-1">
                          <span className="text-[10px] text-zinc-500 block">{item.date}</span>
                          <div className="text-sm font-bold text-rose-400">+{item.loggedCount} lỗi</div>
                          <div className="text-xs text-emerald-400 flex items-center justify-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>{item.resolvedCount} xong</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Top 10 Errors List */}
                <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-400" />
                      <span>Danh Sách 10 Lỗi Hàng Đầu (Top 10 Errors List)</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Các câu hỏi bị làm sai nhiều lần nhất cần đặc biệt chú ý</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {analysisData.top10Errors.map((err, idx) => (
                      <div
                        key={err.id}
                        className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-700 transition"
                      >
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white/5 text-zinc-300">Part {err.part}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">{err.errorType}</span>
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                <RotateCcw className="w-2.5 h-2.5" />
                                <span>Sai {err.frequency} lần</span>
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${err.status === "resolved" ? "text-emerald-400" : "text-amber-400"}`}>
                                {err.status === "resolved" ? <><Check className="w-3 h-3" /> Đã xong</> : "Đang theo dõi"}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-white mt-1.5 line-clamp-1">{err.questionText}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <span className="text-xs text-emerald-400 font-bold">Đáp án: {err.correctAnswer}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab("list");
                              setSearchQuery(err.questionText.slice(0, 20));
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition"
                          >
                            <span>Xem trong sổ tay</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7. Weakness by Part & Topic */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Target className="w-4 h-4 text-red-500" />
                        <span>Xác Định Điểm Yếu Theo Phần (Weakness by Part)</span>
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">Phân bổ câu sai từ Part 1 đến Part 7</p>
                    </div>

                    <div className="space-y-3 pt-2">
                      {analysisData.weaknessByPart.map((p) => (
                        <div key={p.part} className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white">{p.name}</span>
                            <span className="text-rose-400 font-bold">{p.errorCount} lỗi ({p.percentage}%)</span>
                          </div>
                          <div className="h-2 rounded-full bg-zinc-900 overflow-hidden">
                            <div className="h-full rounded-full bg-rose-500" style={{ width: `${p.percentage}%` }} />
                          </div>
                          <p className="text-[11px] text-zinc-400 leading-relaxed">{p.tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-400" />
                        <span>Xác Định Điểm Yếu Theo Chủ Đề (Weakness by Topic)</span>
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">Các chủ điểm kiến thức cần củng cố</p>
                    </div>

                    <div className="space-y-3 pt-2">
                      {analysisData.weaknessByTopic.map((t, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{t.topic}</span>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                              {t.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-300 leading-relaxed">{t.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ================================================== */}
        {/* TAB 3: ERROR DRILLS (8.3) */}
        {/* ================================================== */}
        {activeTab === "drills" && (
          <div className="space-y-6 animate-fade-in">
            {/* STEP 1: DRILL CONFIGURATION */}
            {drillStep === "config" && (
              <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 sm:p-8 space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-bold text-white">Cấu Hình Bài Tập Lỗi (Error Drill Setup)</h3>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Tạo phiên luyện tập phản hồi tức thì với các câu hỏi bạn từng làm sai để khắc phục điểm yếu
                  </p>
                </div>

                {/* Mode Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    1. Chế Độ Luyện Tập (Drill Mode)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setDrillMode("top10")}
                      className={`p-4 rounded-2xl border text-left transition ${
                        drillMode === "top10"
                          ? "bg-red-600/10 border-red-500 text-white shadow-lg"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      <Flame className="w-5 h-5 text-amber-400" />
                      <div className="text-xs font-bold text-white mt-2">Top 10 Câu Sai Nhiều Nhất</div>
                      <p className="text-[11px] text-zinc-400 mt-1">Ưu tiên các câu bị sai lặp lại nhiều lần nhất</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDrillMode("type")}
                      className={`p-4 rounded-2xl border text-left transition ${
                        drillMode === "type"
                          ? "bg-red-600/10 border-red-500 text-white shadow-lg"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      <Target className="w-5 h-5 text-purple-400" />
                      <div className="text-xs font-bold text-white mt-2">Theo Loại Lỗi Cụ Thể</div>
                      <p className="text-[11px] text-zinc-400 mt-1">Luyện riêng Ngữ pháp, Từ vựng hoặc Bất cẩn</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDrillMode("all")}
                      className={`p-4 rounded-2xl border text-left transition ${
                        drillMode === "all"
                          ? "bg-red-600/10 border-red-500 text-white shadow-lg"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      <Dice5 className="w-5 h-5 text-blue-400" />
                      <div className="text-xs font-bold text-white mt-2">Toàn Bộ Sổ Tay Lỗi</div>
                      <p className="text-[11px] text-zinc-400 mt-1">Luyện ngẫu nhiên từ toàn bộ câu sai đang theo dõi</p>
                    </button>
                  </div>
                </div>

                {/* Sub-selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-zinc-800">
                  {/* Specific Error Type if mode == type */}
                  {drillMode === "type" && (
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                        Chọn loại lỗi
                      </label>
                      <select
                        value={drillErrorType}
                        onChange={(e) => setDrillErrorType(e.target.value)}
                        aria-label="Chọn loại lỗi luyện tập"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500/50"
                      >
                        <option value="grammar">Ngữ pháp (Grammar)</option>
                        <option value="vocabulary">Từ vựng (Vocabulary)</option>
                        <option value="careless">Bất cẩn (Careless)</option>
                        <option value="timing">Thiếu thời gian (Timing)</option>
                      </select>
                    </div>
                  )}

                  {/* Part Selector */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                      Phần thi (Part)
                    </label>
                    <select
                      value={drillPart}
                      onChange={(e) => setDrillPart(e.target.value === "all" ? "all" : Number(e.target.value))}
                      aria-label="Chọn phần thi TOEIC"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500/50"
                    >
                      <option value="all">Tất cả Part (1–7)</option>
                      <option value="1">Part 1: Photographs</option>
                      <option value="2">Part 2: Question-Response</option>
                      <option value="3">Part 3: Conversations</option>
                      <option value="4">Part 4: Short Talks</option>
                      <option value="5">Part 5: Incomplete Sentences</option>
                      <option value="6">Part 6: Text Completion</option>
                      <option value="7">Part 7: Reading Comprehension</option>
                    </select>
                  </div>

                  {/* Question Count */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                      Số câu hỏi (Question Count)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[5, 10, 15, 20].map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setDrillQuestionCount(cnt)}
                          className={`py-2.5 rounded-xl border text-xs font-bold transition ${
                            drillQuestionCount === cnt
                              ? "bg-red-600 text-white border-red-500 shadow"
                              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                          }`}
                        >
                          {cnt} câu
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Features Note */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 space-y-1.5">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Quy chế tự động giải quyết (Auto-Resolve Threshold):</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    • Trả lời đúng câu hỏi trong bài tập Drill sẽ <strong>tự động chuyển trạng thái câu thành &quot;Đã giải quyết&quot;</strong>.
                    <br />
                    • Phản hồi đúng/sai và giải thích chi tiết được hiển thị tức thì theo thời gian thực (Real-time feedback).
                  </p>
                </div>

                {/* Start Drill Button */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleStartDrill}
                    disabled={isGeneratingDrill}
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm shadow-xl transition disabled:opacity-50"
                  >
                    {isGeneratingDrill ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang tạo bài tập...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Bắt đầu luyện tập (Start Drill)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: ACTIVE DRILL PLAYER */}
            {drillStep === "running" && drillQuestions.length > 0 && (
              <div className="space-y-6">
                {/* Drill Top Bar: Timer, Progress, Exit */}
                <div className="rounded-2xl border border-white/5 bg-[#121214] p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-bold">
                      Câu {drillCurrentIdx + 1} / {drillQuestions.length}
                    </span>
                    <span className="text-xs text-zinc-400 hidden sm:inline">
                      Part {drillQuestions[drillCurrentIdx].part} • {ERROR_TYPE_CONFIG[drillQuestions[drillCurrentIdx].errorType]?.label}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex-1 max-w-xs mx-auto hidden md:block">
                    <div className="h-2 rounded-full bg-zinc-900 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-red-500 transition-all duration-300"
                        style={{ width: `${((drillCurrentIdx + 1) / drillQuestions.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Drill Timer */}
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 bg-amber-950/30 px-3 py-1.5 rounded-xl border border-amber-800/30">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatTime(drillSeconds)}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDrillStep("config")}
                      className="flex items-center gap-1 text-xs text-zinc-500 hover:text-white px-2 py-1 rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Thoát</span>
                    </button>
                  </div>
                </div>

                {/* Question Card */}
                {(() => {
                  const q = drillQuestions[drillCurrentIdx];
                  const currentAnswered = drillAnsweredResults.find((r) => r.errorLogId === q.errorLogId);
                  const isCurrentCorrect = currentAnswered?.isCorrect;

                  return (
                    <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 sm:p-8 space-y-6">
                      {/* Media */}
                      {q.passage && (
                        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line font-serif">
                          {q.passage}
                        </div>
                      )}

                      {q.imageUrl && (
                        <div className="rounded-2xl overflow-hidden border border-zinc-800 max-w-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={q.imageUrl} alt="Question media" className="w-full h-auto object-cover" />
                        </div>
                      )}

                      {q.audioUrl && (
                        <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                          <audio controls className="w-full h-8">
                            <source src={q.audioUrl} type="audio/mpeg" />
                            Trình duyệt không hỗ trợ phát audio.
                          </audio>
                        </div>
                      )}

                      {/* Question text */}
                      <p className="text-base font-bold text-white leading-relaxed">
                        {q.questionText}
                      </p>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {q.options.map((opt: any, idx: number) => {
                          const optLabel = opt.label || String.fromCharCode(65 + idx);
                          const optText = typeof opt === "string" ? opt : opt.text || opt.content || "";
                          const isSelected = drillSelectedOption === optLabel;
                          const isCorrectOption = optLabel.toUpperCase() === q.correctAnswer.toUpperCase();

                          let buttonStyle = "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700";
                          if (drillChecked) {
                            if (isCorrectOption) {
                              buttonStyle = "bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold shadow-lg";
                            } else if (isSelected && !isCorrectOption) {
                              buttonStyle = "bg-rose-950/40 border-rose-500 text-rose-300 font-bold shadow-lg";
                            } else {
                              buttonStyle = "bg-zinc-950 border-zinc-900 text-zinc-600 opacity-60";
                            }
                          }

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectDrillOption(optLabel)}
                              disabled={drillChecked}
                              className={`p-4 rounded-2xl border text-left text-xs transition flex items-center justify-between ${buttonStyle}`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-mono font-bold shrink-0">
                                  {optLabel}
                                </span>
                                <span>{optText}</span>
                              </div>

                              {drillChecked && isCorrectOption && (
                                <span className="text-emerald-400 font-bold shrink-0 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Đúng</span>
                              )}
                              {drillChecked && isSelected && !isCorrectOption && (
                                <span className="text-rose-400 font-bold shrink-0 flex items-center gap-1"><X className="w-3.5 h-3.5" /> Sai</span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* REAL-TIME FEEDBACK CARD (7. Real-time feedback) */}
                      {drillChecked && (
                        <div className={`p-5 rounded-2xl border space-y-3 animate-fade-in ${
                          isCurrentCorrect
                            ? "bg-emerald-950/20 border-emerald-500/40"
                            : "bg-rose-950/20 border-rose-500/40"
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {isCurrentCorrect ? <PartyPopper className="w-4 h-4 text-emerald-400" /> : <Lightbulb className="w-4 h-4 text-rose-400" />}
                              <span className={`text-xs font-black uppercase ${isCurrentCorrect ? "text-emerald-400" : "text-rose-400"}`}>
                                {isCurrentCorrect ? "Chính xác! Tự động đánh dấu Đã giải quyết" : "Chưa chính xác! Cùng xem giải thích bên dưới"}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-emerald-400">Đáp án đúng: {q.correctAnswer}</span>
                          </div>

                          {q.explanation && (
                            <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line bg-black/20 p-3.5 rounded-xl border border-white/5">
                              {q.explanation}
                            </p>
                          )}

                          {q.userNote && (
                            <p className="text-[11px] text-amber-300 italic bg-amber-950/20 p-2 rounded-lg border border-amber-800/20 flex items-center gap-1.5">
                              <Pin className="w-3.5 h-3.5" />
                              <span>Ghi chú cá nhân của bạn: {q.userNote}</span>
                            </p>
                          )}

                          <div className="flex justify-end pt-2">
                            <button
                              type="button"
                              onClick={handleNextDrillQuestion}
                              disabled={isSubmittingDrill}
                              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition"
                            >
                              <span>
                                {drillCurrentIdx === drillQuestions.length - 1
                                  ? isSubmittingDrill ? "Đang hoàn tất..." : "Xem kết quả Drill"
                                  : "Câu tiếp theo"}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* STEP 3: DRILL SUMMARY & RESULTS */}
            {drillStep === "summary" && drillSummary && (
              <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 sm:p-8 space-y-6 animate-fade-in">
                <div className="text-center space-y-2 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-1">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-white">Hoàn Thành Phiên Luyện Tập Drill!</h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">{drillSummary.message}</p>
                </div>

                {/* Score Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
                    <div className="text-3xl font-black text-purple-400">{drillSummary.successRate}%</div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase mt-1 block">Tỷ lệ chính xác</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-800/30 text-center">
                    <div className="text-3xl font-black text-emerald-400">{drillSummary.correctCount}</div>
                    <span className="text-[10px] text-emerald-300 font-bold uppercase mt-1 block">Câu trả lời đúng</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-800/30 text-center">
                    <div className="text-3xl font-black text-rose-400">{drillSummary.incorrectCount}</div>
                    <span className="text-[10px] text-rose-300 font-bold uppercase mt-1 block">Câu còn sai</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-800/30 text-center">
                    <div className="text-3xl font-black text-amber-400">{drillSummary.autoResolvedCount}</div>
                    <span className="text-[10px] text-amber-300 font-bold uppercase mt-1 block">Đã tự động giải quyết</span>
                  </div>
                </div>

                {/* 12. SCHEDULE REPEAT DRILL (Spaced Repetition) */}
                <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Lên Lịch Ôn Tập Lặp Lại (Schedule Repeat Drill)</h4>
                      <p className="text-[11px] text-zinc-400">Áp dụng phương pháp Spaced Repetition để ghi nhớ sâu kiến thức</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap pt-1">
                    {[1, 3, 7].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => handleScheduleRepeat(days)}
                        disabled={isScheduling}
                        className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Nhắc lại sau {days} ngày</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-800 flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("list")}
                    className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Về Sổ tay câu sai</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDrillStep("config");
                      handleStartDrill();
                    }}
                    className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition"
                  >
                    <span>Luyện tập lượt mới</span>
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================== */}
        {/* MODALS: DETAIL & DELETE */}
        {/* ================================================== */}
        {detailItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-600/20 text-red-400 border border-red-500/30">
                    Part {detailItem.part}
                  </span>
                  {(() => {
                    const cfg = ERROR_TYPE_CONFIG[detailItem.errorType];
                    const Icon = cfg?.icon || FileText;
                    return (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg?.badgeColor} flex items-center gap-1`}>
                        <Icon className="w-3 h-3" />
                        <span>{cfg?.label}</span>
                      </span>
                    );
                  })()}
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                    <RotateCcw className="w-3 h-3" />
                    <span>Sai {detailItem.frequency} lần</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setDetailItem(null)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition text-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Question display */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Câu Hỏi Gốc (Original Question)</h4>

                {detailItem.passage && (
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line font-serif">
                    {detailItem.passage}
                  </div>
                )}

                {detailItem.imageUrl && (
                  <div className="rounded-2xl overflow-hidden border border-zinc-800 max-w-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={detailItem.imageUrl} alt="Question media" className="w-full h-auto object-cover" />
                  </div>
                )}

                {detailItem.audioUrl && (
                  <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                    <audio controls className="w-full h-8">
                      <source src={detailItem.audioUrl} type="audio/mpeg" />
                      Trình duyệt không hỗ trợ phát audio.
                    </audio>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-sm font-bold text-white leading-relaxed">
                    {detailItem.questionText || "Hãy chọn đáp án đúng nhất để điền vào chỗ trống:"}
                  </p>
                </div>
              </div>

              {/* Answers */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Lựa Chọn Đáp Án</h4>

                {detailItem.options && Array.isArray(detailItem.options) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {detailItem.options.map((opt: any, idx: number) => {
                      const optLabel = opt.label || String.fromCharCode(65 + idx);
                      const optText = typeof opt === "string" ? opt : opt.text || opt.content || "";
                      const isCorrect = optLabel.toUpperCase() === detailItem.correctAnswer.toUpperCase() || opt.isCorrect;
                      const isUserChoice = optLabel.toUpperCase() === detailItem.userAnswer?.toUpperCase();

                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                            isCorrect
                              ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-300 font-bold"
                              : isUserChoice
                              ? "bg-rose-950/30 border-rose-500/50 text-rose-300 font-bold"
                              : "bg-zinc-950 border-zinc-800 text-zinc-400"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold">{optLabel}.</span>
                            <span>{optText}</span>
                          </div>
                          {isCorrect && <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Đáp án đúng</span>}
                          {isUserChoice && !isCorrect && <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1"><X className="w-3 h-3" /> Bạn đã chọn</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Explanation */}
              {detailItem.explanation && (
                <div className="space-y-2 p-4 rounded-2xl bg-purple-950/20 border border-purple-800/30">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 uppercase">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>Giải Thích Chi Tiết (Explanation)</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                    {detailItem.explanation}
                  </p>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-3 pt-3 border-t border-zinc-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Phân Loại & Ghi Chú Cá Nhân
                </h4>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-zinc-400">Gắn thẻ nguyên nhân sai:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(ERROR_TYPE_CONFIG).map(([key, cfg]) => {
                      const isSel = editingType === key;
                      const Icon = cfg.icon;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setEditingType(key)}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                            isSel
                              ? `${cfg.badgeColor} shadow-md`
                              : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-zinc-400">Ghi chú cá nhân (mẹo nhớ, từ vựng cần học):</label>
                  <textarea
                    rows={3}
                    placeholder="Ví dụ: Nhớ cấu trúc S + recommend + that + S + (should) V-inf..."
                    value={editingNote}
                    onChange={(e) => setEditingNote(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/50 transition"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleSaveNote}
                    disabled={isSavingNote}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingNote ? "Đang lưu..." : "Lưu ghi chú"}</span>
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <div className="text-[11px] text-zinc-500">
                  Ngày xảy ra: {new Date(detailItem.lastOccurredAt).toLocaleDateString("vi-VN")}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(detailItem)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition ${
                      detailItem.status === "resolved"
                        ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500"
                    }`}
                  >
                    {detailItem.status !== "resolved" && <Check className="w-3.5 h-3.5" />}
                    <span>{detailItem.status === "resolved" ? "Chuyển lại Đang theo dõi" : "Đánh dấu Đã giải quyết"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── DELETE CONFIRMATION MODAL ── */}
        {deleteConfirmItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mb-1">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Xóa câu hỏi khỏi Sổ tay lỗi?</h3>
              <p className="text-xs text-zinc-400">
                Bạn có chắc chắn muốn xóa bản ghi câu hỏi này khỏi Sổ tay lỗi?
              </p>
              <div className="flex items-center gap-3 pt-2 w-full">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmItem(null)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition disabled:opacity-50"
                >
                  {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 transition-all">
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}
    </div>
  );
}
