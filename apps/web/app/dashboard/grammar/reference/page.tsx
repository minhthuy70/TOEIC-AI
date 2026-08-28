"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  getGrammarReferenceRules,
  getGrammarReferenceDetail,
} from "@/services/grammar";
import type {
  GrammarReferenceRuleSummary,
  GrammarReferenceDetail,
} from "@/types/grammar";

export default function GrammarReferencePage() {
  const [rules, setRules] = useState<GrammarReferenceRuleSummary[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRuleId, setSelectedRuleId] = useState<number | null>(null);

  // Detail rule state
  const [detail, setDetail] = useState<GrammarReferenceDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Bookmarking
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<number, boolean>>({});
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load bookmarks from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("grammar_bookmarked_rules");
      if (stored) {
        setBookmarkedIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const toggleBookmark = (ruleId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = { ...prev, [ruleId]: !prev[ruleId] };
      try {
        localStorage.setItem("grammar_bookmarked_rules", JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      showToast(next[ruleId] ? "Đã lưu quy tắc vào danh sách yêu thích!" : "Đã gỡ quy tắc khỏi danh sách yêu thích.");
      return next;
    });
  };

  // Load rules list
  useEffect(() => {
    async function loadRules() {
      try {
        setLoadingList(true);
        const data = await getGrammarReferenceRules({
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          search: searchQuery.trim() || undefined,
        });
        setRules(data);
        if (data.length > 0 && !selectedRuleId) {
          setSelectedRuleId(data[0].id);
        }
      } catch (err) {
        console.error("Load grammar reference rules error:", err);
      } finally {
        setLoadingList(false);
      }
    }
    loadRules();
  }, [selectedCategory, searchQuery]);

  // Load rule detail when selectedRuleId changes
  useEffect(() => {
    if (!selectedRuleId) {
      setDetail(null);
      return;
    }
    async function loadDetail() {
      try {
        setLoadingDetail(true);
        const res = await getGrammarReferenceDetail(selectedRuleId!);
        setDetail(res);
      } catch (err) {
        console.error("Load grammar rule detail error:", err);
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

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 print:p-0 print:m-0 print:max-w-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 transition-all print:hidden">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── HEADER (Hidden on Print) ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">
              📖 Sổ Tay Tra Cứu Ngữ Pháp TOEIC
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600/20 text-red-400 border border-red-500/30">
              Grammar Handbook
            </span>
          </div>
          <p className="text-zinc-400 text-sm mt-1">
            Tra cứu nhanh các quy tắc ngữ pháp trọng điểm, bảng tóm tắt, ngoại lệ và lỗi thường gặp
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {detail && (
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-bold text-xs rounded-xl transition shadow"
            >
              <span>🖨️</span>
              <span>In quy tắc / PDF</span>
            </button>
          )}
          <Link
            href="/dashboard/grammar"
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs rounded-xl transition"
          >
            ← Bảng điều khiển
          </Link>
        </div>
      </div>

      {/* ── SEARCH & CATEGORY FILTER BAR (Hidden on Print) ── */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 print:hidden">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Tìm quy tắc (Ví dụ: thì hiện tại, bị động, mệnh đề, although)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2 text-xs text-zinc-500 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "Tất cả" },
            { id: "tenses", label: "Các thì" },
            { id: "parts_of_speech", label: "Từ loại & Giới từ" },
            { id: "clauses", label: "Mệnh đề & Đảo ngữ" },
            { id: "structures", label: "Cấu trúc đặc biệt" },
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setSelectedCategory(c.id);
                setShowOnlyBookmarks(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                selectedCategory === c.id && !showOnlyBookmarks
                  ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                  : "bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-750"
              }`}
            >
              {c.label}
            </button>
          ))}

          {/* Bookmarks Filter */}
          <button
            type="button"
            onClick={() => setShowOnlyBookmarks(!showOnlyBookmarks)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1 ${
              showOnlyBookmarks
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                : "bg-zinc-800/80 text-zinc-400 hover:text-amber-300"
            }`}
          >
            <span>⭐</span>
            <span>Đã lưu</span>
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT: 2 COLUMNS (SIDEBAR LIST + DETAIL VIEW) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Rules Index List (Hidden on Print) */}
        <div className="lg:col-span-4 space-y-3 print:hidden">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Chỉ mục quy tắc ({displayedRules.length})
            </h2>
            <span className="text-[11px] text-zinc-500">Nhấp để xem chi tiết</span>
          </div>

          {loadingList ? (
            <div className="space-y-2 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-zinc-900/60 border border-zinc-800 rounded-2xl" />
              ))}
            </div>
          ) : displayedRules.length === 0 ? (
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6 text-center text-zinc-500 text-xs">
              Không tìm thấy quy tắc phù hợp với từ khóa.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[75vh] overflow-y-auto pr-1">
              {displayedRules.map((rule) => {
                const isSelected = selectedRuleId === rule.id;
                const isBookmarked = !!bookmarkedIds[rule.id];

                return (
                  <div
                    key={rule.id}
                    onClick={() => setSelectedRuleId(rule.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-2 group ${
                      isSelected
                        ? "bg-zinc-900 border-red-500/70 shadow-lg shadow-red-950/20"
                        : "bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/90"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                        {rule.categoryLabel}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => toggleBookmark(rule.id, e)}
                        className={`text-sm transition hover:scale-110 ${
                          isBookmarked ? "text-amber-400" : "text-zinc-600 hover:text-zinc-400"
                        }`}
                        title={isBookmarked ? "Bỏ lưu" : "Lưu quy tắc"}
                      >
                        {isBookmarked ? "⭐" : "☆"}
                      </button>
                    </div>

                    <h3
                      className={`text-xs font-bold transition-colors line-clamp-2 ${
                        isSelected ? "text-white" : "text-zinc-200 group-hover:text-red-400"
                      }`}
                    >
                      {rule.title}
                    </h3>

                    <p className="text-[11px] text-zinc-500 line-clamp-1">
                      {rule.summary}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Rule Detail View (Print Target) */}
        <div className="lg:col-span-8 print:col-span-12">
          {loadingDetail ? (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 space-y-6 animate-pulse">
              <div className="h-6 w-3/4 bg-zinc-800 rounded" />
              <div className="h-20 bg-zinc-800 rounded-2xl" />
              <div className="h-40 bg-zinc-800 rounded-2xl" />
            </div>
          ) : !detail ? (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-12 text-center text-zinc-500">
              <p className="text-3xl mb-2">👈</p>
              <p className="text-sm font-semibold">Chọn một quy tắc từ danh sách bên trái để tra cứu chi tiết</p>
            </div>
          ) : (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-7 print:bg-white print:text-black print:border-none print:p-0 print:space-y-4">
              {/* Top Detail Header */}
              <div className="space-y-2 border-b border-zinc-800 pb-5 print:border-gray-300">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-600/15 text-red-400 border border-red-600/20 print:border-black print:text-black">
                      {detail.categoryLabel}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600/15 text-blue-400 border border-blue-600/20 print:border-black print:text-black">
                      Chặng {detail.stage}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 print:hidden">
                    <button
                      type="button"
                      onClick={() => toggleBookmark(detail.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
                        bookmarkedIds[detail.id]
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <span>{bookmarkedIds[detail.id] ? "⭐" : "☆"}</span>
                      <span>{bookmarkedIds[detail.id] ? "Đã lưu" : "Lưu quy tắc"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="px-3 py-1 rounded-xl text-xs font-bold bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition"
                    >
                      🖨️ In
                    </button>
                  </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-white print:text-black pt-1">
                  {detail.title}
                </h1>
                <p className="text-xs text-zinc-400 print:text-gray-600 leading-relaxed">
                  {detail.summary}
                </p>
              </div>

              {/* Formula Highlight */}
              {detail.formula && (
                <div className="bg-zinc-950/80 border border-zinc-700/60 rounded-2xl p-4 print:bg-gray-100 print:border-gray-300">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-400 print:text-black uppercase tracking-wider mb-1.5">
                    <span>📐</span>
                    <span>Cấu trúc trọng tâm</span>
                  </div>
                  <p className="font-mono text-sm sm:text-base font-semibold text-zinc-200 print:text-black leading-relaxed">
                    {detail.formula}
                  </p>
                </div>
              )}

              {/* ── RULE EXPLANATION ── */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white print:text-black flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-red-500 rounded-full print:hidden" />
                  <span>1. Giải thích bản chất & Cách dùng</span>
                </h3>
                <p className="text-xs sm:text-[13px] text-zinc-300 print:text-gray-800 leading-relaxed pl-3.5">
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
                          {detail.quickTable.headers.map((h, i) => (
                            <th key={i} className="py-3 px-4 font-bold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 print:divide-gray-300">
                        {detail.quickTable.rows.map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            className="hover:bg-zinc-800/40 transition print:hover:bg-transparent"
                          >
                            {row.map((cell, cIdx) => (
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
                    {detail.examples.map((ex, exIdx) => (
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
                          <p className="text-[11px] text-emerald-400 print:text-emerald-800 pl-3 pt-1">
                            💡 <strong>Phân tích:</strong> {ex.analysis}
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
                    <span>⚠️</span>
                    <span>Ngoại lệ cần chú ý (Exceptions)</span>
                  </div>
                  <ul className="space-y-1.5 pl-5 list-disc text-xs text-amber-200/90 print:text-amber-950">
                    {detail.exceptions.map((exc, excIdx) => (
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
                    <span>❌</span>
                    <span>Lỗi thường gặp trong đề thi (Common Errors)</span>
                  </div>

                  <div className="space-y-2.5">
                    {detail.commonErrors.map((err, errIdx) => (
                      <div
                        key={errIdx}
                        className="bg-zinc-950/60 border border-rose-900/30 rounded-xl p-3.5 space-y-1 text-xs print:bg-white print:border-gray-300"
                      >
                        <p className="text-rose-300 print:text-rose-700 font-mono">
                          ❌ Sai: {err.incorrect}
                        </p>
                        <p className="text-emerald-300 print:text-emerald-700 font-mono font-semibold">
                          ✓ Đúng: {err.correct}
                        </p>
                        <p className="text-[11px] text-zinc-400 print:text-gray-600 pt-1">
                          📌 <em>{err.note}</em>
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
                    <span>🎯</span>
                    <span>Mẹo xử lý nhanh Part 5 & 6 TOEIC</span>
                  </div>
                  <ul className="space-y-1 pl-5 list-disc text-xs text-zinc-300 print:text-black">
                    {detail.toeicTips.map((tip, tipIdx) => (
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
