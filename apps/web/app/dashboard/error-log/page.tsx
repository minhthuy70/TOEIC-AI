"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  getErrorLogs,
  updateErrorLogStatus,
  updateErrorLogNote,
  deleteErrorLog,
  type ErrorLogItem,
  type ErrorLogSummaryStats,
} from "@/services/error-tracking";

const ERROR_TYPE_CONFIG: Record<
  string,
  { label: string; badgeColor: string; icon: string; desc: string }
> = {
  grammar: {
    label: "Ngữ pháp",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    icon: "📝",
    desc: "Sai cấu trúc, thì, mệnh đề hoặc chia động từ",
  },
  vocabulary: {
    label: "Từ vựng",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    icon: "📖",
    desc: "Chưa nắm rõ nghĩa từ, từ đồng nghĩa hoặc collocations",
  },
  careless: {
    label: "Bất cẩn",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    icon: "⚡",
    desc: "Đọc thiếu sót đề bài, nhìn nhầm từ khóa hoặc bẫy đề",
  },
  timing: {
    label: "Thiếu thời gian",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    icon: "⏱️",
    desc: "Hết thời gian làm bài, chọn vội hoặc không kịp phân tích",
  },
};

export default function ErrorLogPage() {
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Filters & Sorting State
  const [errorTypeFilter, setErrorTypeFilter] = useState<"all" | "grammar" | "vocabulary" | "careless" | "timing">("all");
  const [partFilter, setPartFilter] = useState<number | "all">("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<"all" | "7d" | "30d" | "90d">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "resolved">("all");
  const [sortBy, setSortBy] = useState<"frequency" | "date">("frequency");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals State
  const [detailItem, setDetailItem] = useState<ErrorLogItem | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<ErrorLogItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<string>("");
  const [editingType, setEditingType] = useState<string>("grammar");
  const [isSavingNote, setIsSavingNote] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      // Update local state
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

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8 animate-fade-in">
        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-red-600/15 border border-red-500/30 text-red-400 flex items-center justify-center text-2xl shrink-0">
              📓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Sổ Tay Lỗi (Error Log)
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600/20 text-red-400 border border-red-500/30">
                  Hệ thống 8.1
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-zinc-400">
                Ghi nhận, phân loại và khắc phục triệt để các câu làm sai để bứt phá 900+ TOEIC
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/mock-test"
              className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition flex items-center gap-2"
            >
              <span>📝</span>
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
        {/* 1. SUMMARY STATISTICS (4 CARDS) */}
        {/* ================================================== */}
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

        {/* ================================================== */}
        {/* 2. FILTER & TOOLBAR */}
        {/* ================================================== */}
        <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi, từ khóa, ghi chú cá nhân, giải thích..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/50 transition"
            />
          </div>

          {/* Filters row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
            {/* Error Type */}
            <div>
              <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1.5">Loại lỗi</label>
              <select
                value={errorTypeFilter}
                onChange={(e) => setErrorTypeFilter(e.target.value as any)}
                aria-label="Lọc theo loại lỗi"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-red-500/50"
              >
                <option value="all">Tất cả loại lỗi</option>
                <option value="grammar">📝 Ngữ pháp ({stats.grammarCount})</option>
                <option value="vocabulary">📖 Từ vựng ({stats.vocabularyCount})</option>
                <option value="careless">⚡ Bất cẩn ({stats.carelessCount})</option>
                <option value="timing">⏱️ Thiếu thời gian ({stats.timingCount})</option>
              </select>
            </div>

            {/* Part (1-7) */}
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

            {/* Date Range */}
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

            {/* Status */}
            <div>
              <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1.5">Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                aria-label="Lọc theo trạng thái câu hỏi"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-red-500/50"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">⏳ Đang theo dõi</option>
                <option value="resolved">✅ Đã giải quyết</option>
              </select>
            </div>

            {/* Sort By */}
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
                <option value="frequency-desc">🔁 Sai nhiều nhất</option>
                <option value="frequency-asc">🔁 Sai ít nhất</option>
                <option value="date-desc">📅 Ngày mới nhất</option>
                <option value="date-asc">📅 Ngày cũ nhất</option>
              </select>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* 3. ERROR LIST VIEW */}
        {/* ================================================== */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-zinc-900/60 border border-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-white/5 bg-[#121214] p-12 text-center space-y-3">
            <div className="text-5xl">🎉</div>
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
                    {/* Left details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Part badge */}
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/5 text-zinc-300 border border-white/10">
                          Part {item.part}
                        </span>

                        {/* Error Type tag */}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${typeCfg.badgeColor} flex items-center gap-1`}>
                          <span>{typeCfg.icon}</span>
                          <span>{typeCfg.label}</span>
                        </span>

                        {/* Frequency counter */}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          item.frequency > 1
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                            : "bg-zinc-800 text-zinc-400 border-zinc-700"
                        }`}>
                          🔁 Sai {item.frequency} lần
                        </span>

                        {/* Status badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isResolved
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        }`}>
                          {isResolved ? "✅ Đã giải quyết" : "⏳ Đang theo dõi"}
                        </span>
                      </div>

                      {/* Question Snippet */}
                      <p className="text-sm font-semibold text-white line-clamp-2 leading-relaxed">
                        {item.questionText || item.passage || "Câu hỏi luyện thi TOEIC"}
                      </p>

                      {/* User's Answer vs Correct Answer Summary */}
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

                      {/* Personal Note preview if exists */}
                      {item.userNote && (
                        <div className="text-[11px] text-zinc-300 bg-white/[0.02] px-3 py-1.5 rounded-xl border border-white/5 inline-flex items-center gap-1.5">
                          <span>📌</span>
                          <span className="italic line-clamp-1">{item.userNote}</span>
                        </div>
                      )}
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Toggle resolved button */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                          isResolved
                            ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700"
                            : "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/40"
                        }`}
                      >
                        {isResolved ? "Mở lại ⏳" : "Đã giải quyết ✓"}
                      </button>

                      {/* Detail View Button */}
                      <button
                        type="button"
                        onClick={() => openDetail(item)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition shadow"
                      >
                        🔍 Chi tiết & Lời giải
                      </button>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmItem(item)}
                        title="Xóa câu hỏi này khỏi Sổ tay lỗi"
                        className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition text-xs"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================================================== */}
        {/* 4. ERROR DETAIL MODAL */}
        {/* ================================================== */}
        {detailItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-600/20 text-red-400 border border-red-500/30">
                    Part {detailItem.part}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${ERROR_TYPE_CONFIG[detailItem.errorType]?.badgeColor}`}>
                    {ERROR_TYPE_CONFIG[detailItem.errorType]?.icon} {ERROR_TYPE_CONFIG[detailItem.errorType]?.label}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                    🔁 Sai {detailItem.frequency} lần
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setDetailItem(null)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition text-sm"
                >
                  ✕
                </button>
              </div>

              {/* 10. ORIGINAL QUESTION DISPLAY */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Câu Hỏi Gốc (Original Question)</h4>

                {/* Passage */}
                {detailItem.passage && (
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line">
                    {detailItem.passage}
                  </div>
                )}

                {/* Image */}
                {detailItem.imageUrl && (
                  <div className="rounded-2xl overflow-hidden border border-zinc-800 max-w-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={detailItem.imageUrl} alt="Question media" className="w-full h-auto object-cover" />
                  </div>
                )}

                {/* Audio Player */}
                {detailItem.audioUrl && (
                  <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                    <audio controls className="w-full h-8">
                      <source src={detailItem.audioUrl} type="audio/mpeg" />
                      Trình duyệt không hỗ trợ phát audio.
                    </audio>
                  </div>
                )}

                {/* Question Text */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-sm font-bold text-white leading-relaxed">
                    {detailItem.questionText || "Hãy chọn đáp án đúng nhất để điền vào chỗ trống:"}
                  </p>
                </div>
              </div>

              {/* 11 & 12. USER'S ANSWER & CORRECT ANSWER DISPLAY */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Lựa Chọn Đáp Án</h4>

                {/* Options List */}
                {detailItem.options && Array.isArray(detailItem.options) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {detailItem.options.map((opt: any, idx: number) => {
                      const optLabel = opt.label || String.fromCharCode(65 + idx);
                      const optText = opt.text || opt.content || opt;
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
                          {isCorrect && <span className="text-[10px] text-emerald-400">✓ Đáp án đúng</span>}
                          {isUserChoice && !isCorrect && <span className="text-[10px] text-rose-400">✗ Bạn đã chọn</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 13. EXPLANATION DISPLAY */}
              {detailItem.explanation && (
                <div className="space-y-2 p-4 rounded-2xl bg-purple-950/20 border border-purple-800/30">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 uppercase">
                    <span>💡</span> <span>Giải Thích Chi Tiết (Explanation)</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                    {detailItem.explanation}
                  </p>
                </div>
              )}

              {/* 14, 15, 16, 17. ERROR TYPE TAG & PERSONAL NOTE FIELD */}
              <div className="space-y-3 pt-3 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Phân Loại & Ghi Chú Cá Nhân
                  </h4>
                </div>

                {/* Error Type Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-zinc-400">Gắn thẻ nguyên nhân sai:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(ERROR_TYPE_CONFIG).map(([key, cfg]) => {
                      const isSel = editingType === key;
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
                          <span>{cfg.icon}</span>
                          <span>{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Personal Note Textarea */}
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
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition disabled:opacity-50"
                  >
                    {isSavingNote ? "Đang lưu..." : "💾 Lưu ghi chú"}
                  </button>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <div className="text-[11px] text-zinc-500">
                  Ngày xảy ra: {new Date(detailItem.lastOccurredAt).toLocaleDateString("vi-VN")}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(detailItem)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                      detailItem.status === "resolved"
                        ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500"
                    }`}
                  >
                    {detailItem.status === "resolved" ? "Chuyển lại Đang theo dõi" : "Đánh dấu Đã giải quyết ✓"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── DELETE CONFIRMATION MODAL ── */}
        {deleteConfirmItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl text-center">
              <div className="text-4xl">🗑️</div>
              <h3 className="text-lg font-bold text-white">Xóa câu hỏi khỏi Sổ tay lỗi?</h3>
              <p className="text-xs text-zinc-400">
                Bạn có chắc chắn muốn xóa bản ghi câu hỏi này khỏi Sổ tay lỗi?
              </p>
              <div className="flex items-center gap-3 pt-2">
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
            <span>✓</span>
            <span>{toastMessage}</span>
          </div>
        )}
      </main>
    </div>
  );
}
