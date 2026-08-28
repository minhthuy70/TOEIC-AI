"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getGrammarReferenceRules, getGrammarReferenceDetail } from "@/services/grammar";
import type { GrammarReferenceRuleSummary, GrammarReferenceDetail } from "@/types/grammar";
import {
  BookOpen,
  Printer,
  Star,
  Layers,
  Lightbulb,
  AlertTriangle,
  X,
  Check,
  Pin,
  Target,
  ArrowLeft,
  Search,
} from "lucide-react";

export default function GrammarReferencePage() {
  const [rules, setRules] = useState<GrammarReferenceRuleSummary[]>([]);
  const [selectedRuleId, setSelectedRuleId] = useState<number | null>(null);
  const [detail, setDetail] = useState<GrammarReferenceDetail | null>(null);

  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);

  // Bookmarks in LocalStorage
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<number, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Load bookmarks on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("grammar_handbook_bookmarks");
      if (stored) {
        setBookmarkedIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Toggle bookmark
  const toggleBookmark = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem("grammar_handbook_bookmarks", JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      showToast(next[id] ? "Đã lưu quy tắc vào danh sách yêu thích!" : "Đã bỏ lưu quy tắc.");
      return next;
    });
  };

  // Load Rules list
  useEffect(() => {
    async function loadRules() {
      try {
        setLoadingList(true);
        const data = await getGrammarReferenceRules({
          category: selectedCategory === "all" ? undefined : selectedCategory,
          search: searchQuery.trim() ? searchQuery.trim() : undefined,
        });
        setRules(data);
        if (data.length > 0 && !selectedRuleId) {
          setSelectedRuleId(data[0].id);
        }
      } catch (err) {
        console.error("Error loading grammar rules list:", err);
      } finally {
        setLoadingList(false);
      }
    }
    loadRules();
  }, [selectedCategory, searchQuery]);

  // Load Detail when selectedRuleId changes
  useEffect(() => {
    if (!selectedRuleId) {
      setDetail(null);
      return;
    }
    async function loadDetail() {
      try {
        setLoadingDetail(true);
        const data = await getGrammarReferenceDetail(selectedRuleId!);
        setDetail(data);
      } catch (err) {
        console.error("Error loading rule detail:", err);
      } finally {
        setLoadingDetail(false);
      }
    }
    loadDetail();
  }, [selectedRuleId]);

  // Filter rules by search & bookmark
  const displayedRules = useMemo(() => {
    let list = rules;
    if (showOnlyBookmarks) {
      list = list.filter((r) => !!bookmarkedIds[r.id]);
    }
    return list;
  }, [rules, showOnlyBookmarks, bookmarkedIds]);

  // Print trigger
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Category filter tabs
  const categories = [
    { id: "all", label: "Tất cả quy tắc" },
    { id: "tenses", label: "Thì động từ" },
    { id: "parts_of_speech", label: "Từ loại (N/V/Adj/Adv)" },
    { id: "clauses", label: "Mệnh đề quan hệ & Mệnh đề trạng" },
    { id: "voice_mood", label: "Bị động & Giả định" },
    { id: "connectors", label: "Liên từ & Giới từ" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 print:p-0 print:m-0 print:max-w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 transition-all">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header - Hidden on Print */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-red-500" />
              <span>Sổ Tay Tra Cứu Ngữ Pháp TOEIC</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-600/20 text-purple-400 border border-purple-500/30">
              Reference Handbook
            </span>
          </div>
          <p className="text-zinc-400 text-sm mt-1">
            Tổng hợp công thức, bảng tổng hợp nhanh, bẫy đề thi và mẹo giải quyết câu hỏi Part 5 & 6
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs rounded-xl transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In sổ tay (Print / PDF)</span>
          </button>
          <Link
            href="/dashboard/grammar"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Search & Category Filter Bar - Hidden on Print */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-3 print:hidden">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm công thức, quy tắc (vd: Hiện tại hoàn thành, Mệnh đề quan hệ, Trạng từ)..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Bookmark filter switch */}
          <button
            type="button"
            onClick={() => setShowOnlyBookmarks(!showOnlyBookmarks)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              showOnlyBookmarks
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${showOnlyBookmarks ? "fill-amber-400 text-amber-400" : ""}`} />
            <span>{showOnlyBookmarks ? "Đang lọc: Mục đã lưu" : "Mục đã lưu"}</span>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                  : "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Handbook Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
        {/* Left Column: Rules Navigation Menu - Hidden on print when printing a single rule */}
        <div className="lg:col-span-4 space-y-2.5 max-h-[calc(100vh-250px)] overflow-y-auto pr-1 print:hidden">
          <div className="flex items-center justify-between px-1 text-xs font-bold text-zinc-400">
            <span>Danh mục quy tắc ({displayedRules.length})</span>
          </div>

          {loadingList ? (
            <div className="space-y-2.5 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-zinc-900/60 border border-zinc-800 rounded-2xl" />
              ))}
            </div>
          ) : displayedRules.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800 rounded-2xl">
              <BookOpen className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-xs text-zinc-500">Không tìm thấy quy tắc ngữ pháp phù hợp.</p>
            </div>
          ) : (
            displayedRules.map((rule) => {
              const isSelected = selectedRuleId === rule.id;
              const isBookmarked = !!bookmarkedIds[rule.id];

              return (
                <div
                  key={rule.id}
                  onClick={() => setSelectedRuleId(rule.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 group relative ${
                    isSelected
                      ? "bg-red-600/15 border-red-500 text-white shadow-lg shadow-red-600/10"
                      : "bg-zinc-900/70 border-zinc-800/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-850"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 pr-6">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          {rule.categoryLabel}
                        </span>
                        <span className="text-[9px] font-bold text-zinc-500">
                          Chặng {rule.stage}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-white group-hover:text-red-400 transition-colors line-clamp-1">
                        {rule.title}
                      </h3>
                    </div>

                    {/* Bookmark icon */}
                    <button
                      type="button"
                      onClick={(e) => toggleBookmark(rule.id, e)}
                      className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-amber-400 transition p-1"
                      title={isBookmarked ? "Bỏ lưu" : "Lưu vào yêu thích"}
                    >
                      <Star className={`w-3.5 h-3.5 ${isBookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
                    </button>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {rule.summary}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-800/50">
                    <span>{rule.examplesCount} ví dụ mẫu</span>
                    {rule.exceptionsCount > 0 && (
                      <span className="text-amber-400/80 font-semibold">{rule.exceptionsCount} ngoại lệ</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Handbook Entry Content */}
        <div className="lg:col-span-8 print:w-full">
          {loadingDetail ? (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 space-y-6 animate-pulse">
              <div className="h-8 bg-zinc-800 rounded-xl w-2/3" />
              <div className="h-20 bg-zinc-800/60 rounded-xl" />
              <div className="h-40 bg-zinc-800/60 rounded-xl" />
            </div>
          ) : !detail ? (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-12 text-center">
              <BookOpen className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">Chọn một quy tắc ngữ pháp để tra cứu</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Xem toàn bộ công thức tóm tắt, bảng tra cứu, ngoại lệ và mẹo thi TOEIC tương ứng
              </p>
            </div>
          ) : (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-7 print:bg-transparent print:border-none print:p-0">
              {/* Header Title & Tags */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-5 print:border-gray-300">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600/20 text-red-400 border border-red-500/30 print:border-gray-400 print:text-black">
                      {detail.categoryLabel}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300 print:border-gray-400 print:text-black">
                      Chặng {detail.stage}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white print:text-black">
                    {detail.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 print:hidden">
                  <button
                    type="button"
                    onClick={() => toggleBookmark(detail.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                      bookmarkedIds[detail.id]
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white"
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${bookmarkedIds[detail.id] ? "fill-amber-400 text-amber-400" : ""}`} />
                    <span>{bookmarkedIds[detail.id] ? "Đã lưu" : "Lưu quy tắc"}</span>
                  </button>
                </div>
              </div>

              {/* ── FORMULA HIGHLIGHT BOX ── */}
              <div className="bg-gradient-to-r from-red-950/40 to-purple-950/30 border border-red-800/40 rounded-2xl p-5 space-y-2 print:border-gray-400 print:bg-gray-100">
                <div className="flex items-center gap-2 text-xs font-bold text-red-400 print:text-black uppercase tracking-wider">
                  <Layers className="w-4 h-4" />
                  <span>1. Công thức & Cấu trúc ngữ pháp trọng tâm</span>
                </div>
                <div className="p-3.5 bg-black/50 print:bg-white border border-red-900/30 print:border-gray-300 rounded-xl">
                  <p className="font-mono text-sm sm:text-base font-bold text-amber-300 print:text-black leading-relaxed">
                    {detail.formula}
                  </p>
                </div>
                <p className="text-xs text-zinc-300 print:text-gray-700 leading-relaxed pt-1">
                  {detail.explanation}
                </p>
              </div>

              {/* ── QUICK REFERENCE TABLE ── */}
              {detail.quickTable && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white print:text-black flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-purple-500 rounded-full print:hidden" />
                    <span>2. Bảng tham khảo nhanh (Quick Cheat Sheet)</span>
                  </h3>

                  <div className="overflow-x-auto rounded-2xl border border-zinc-800 print:border-gray-300">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-950/90 text-zinc-300 border-b border-zinc-800 print:bg-gray-200 print:text-black print:border-gray-300">
                          {detail.quickTable.headers.map((h: string, i: number) => (
                            <th key={i} className="py-3 px-4 font-bold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 print:divide-gray-300">
                        {detail.quickTable.rows.map((row: string[], rIdx: number) => (
                          <tr
                            key={rIdx}
                            className="hover:bg-zinc-800/40 transition print:hover:bg-transparent"
                          >
                            {row.map((cell: string, cIdx: number) => (
                              <td
                                key={cIdx}
                                className={`py-3 px-4 ${
                                  cIdx === 0
                                    ? "font-bold text-white print:text-black"
                                    : "text-zinc-300 print:text-gray-800"
                                }`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── EXAMPLES WITH EXPLANATIONS ── */}
              {detail.examples && detail.examples.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white print:text-black flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-emerald-500 rounded-full print:hidden" />
                    <span>3. Ví dụ minh họa thực tế trong đề thi TOEIC</span>
                  </h3>

                  <div className="space-y-2.5">
                    {detail.examples.map((ex: any, exIdx: number) => (
                      <div
                        key={exIdx}
                        className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4 space-y-1.5 print:border-gray-300 print:bg-gray-50"
                      >
                        <p className="text-xs sm:text-sm font-semibold text-white print:text-black">
                          • {ex.en}
                        </p>
                        <p className="text-xs text-zinc-400 print:text-gray-600 italic pl-3">
                          → {ex.vi}
                        </p>
                        {ex.analysis && (
                          <p className="flex items-center gap-1 text-[11px] text-emerald-400 print:text-emerald-800 pl-3 pt-1">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span><strong>Phân tích:</strong> {ex.analysis}</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── EXCEPTIONS CALLOUT ── */}
              {detail.exceptions && detail.exceptions.length > 0 && (
                <div className="bg-amber-950/30 border border-amber-800/40 rounded-2xl p-5 space-y-2 print:border-amber-500 print:bg-amber-50">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 print:text-amber-800 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Ngoại lệ cần chú ý (Exceptions)</span>
                  </div>
                  <ul className="space-y-1.5 pl-5 list-disc text-xs text-amber-200/90 print:text-amber-950">
                    {detail.exceptions.map((exc: string, excIdx: number) => (
                      <li key={excIdx} className="leading-relaxed">
                        {exc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ── COMMON ERRORS (SAI vs ĐÚNG) ── */}
              {detail.commonErrors && detail.commonErrors.length > 0 && (
                <div className="bg-rose-950/30 border border-rose-800/40 rounded-2xl p-5 space-y-3 print:border-rose-500 print:bg-rose-50">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-400 print:text-rose-800 uppercase tracking-wider">
                    <X className="w-4 h-4" />
                    <span>Lỗi thường gặp trong đề thi (Common Errors)</span>
                  </div>

                  <div className="space-y-2.5">
                    {detail.commonErrors.map((err: any, errIdx: number) => (
                      <div
                        key={errIdx}
                        className="bg-zinc-950/60 border border-rose-900/30 rounded-xl p-3.5 space-y-1 text-xs print:bg-white print:border-gray-300"
                      >
                        <p className="text-rose-300 print:text-rose-700 font-mono flex items-center gap-1">
                          <X className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span>Sai: {err.incorrect}</span>
                        </p>
                        <p className="text-emerald-300 print:text-emerald-700 font-mono font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Đúng: {err.correct}</span>
                        </p>
                        <p className="text-[11px] text-zinc-400 print:text-gray-600 pt-1 flex items-center gap-1">
                          <Pin className="w-3 h-3 text-zinc-500 shrink-0" />
                          <em>{err.note}</em>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── TOEIC TIPS ── */}
              {detail.toeicTips && detail.toeicTips.length > 0 && (
                <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-5 space-y-2 print:border-gray-300">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-400 print:text-purple-800 uppercase tracking-wider">
                    <Target className="w-4 h-4" />
                    <span>Mẹo xử lý nhanh Part 5 & 6 TOEIC</span>
                  </div>
                  <ul className="space-y-1 pl-5 list-disc text-xs text-zinc-300 print:text-black">
                    {detail.toeicTips.map((tip: string, tipIdx: number) => (
                      <li key={tipIdx} className="leading-relaxed">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
