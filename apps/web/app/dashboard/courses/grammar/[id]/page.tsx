"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getGrammarCategory } from "@/services/grammar";
import type { GrammarCategoryDetail } from "@/types/grammar";

export default function GrammarCategoryPage() {
  const params = useParams();
  const categoryId = Number(params.id);

  const [category, setCategory] = useState<GrammarCategoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "uncompleted" | "favorite">("all");
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("grammar_favorites");
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleFavorite = (e: React.MouseEvent, lessonId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => {
      const next = { ...prev, [lessonId]: !prev[lessonId] };
      try {
        localStorage.setItem("grammar_favorites", JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      return next;
    });
  };

  // ======================================================
  // Load category
  // ======================================================

  useEffect(() => {
    if (!categoryId || Number.isNaN(categoryId)) {
      setError("ID chủ đề không hợp lệ.");
      setLoading(false);
      return;
    }

    const loadCategory = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getGrammarCategory(categoryId);
        setCategory(data);
      } catch (err) {
        console.error("Load grammar category error:", err);
        setError("Không thể tải dữ liệu chủ đề ngữ pháp.");
      } finally {
        setLoading(false);
      }
    };

    loadCategory();
  }, [categoryId]);

  // Filter lessons
  const filteredLessons = useMemo(() => {
    if (!category) return [];
    let list = category.lessons;

    if (filterStatus === "completed") {
      list = list.filter((l) => l.completed);
    } else if (filterStatus === "uncompleted") {
      list = list.filter((l) => !l.completed);
    } else if (filterStatus === "favorite") {
      list = list.filter((l) => favorites[l.id]);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          (l.content && l.content.toLowerCase().includes(q))
      );
    }

    return list;
  }, [category, filterStatus, searchQuery, favorites]);

  // Difficulty badge
  const getDifficulty = (stage: number) => {
    if (stage >= 5) return { label: "Nâng cao", color: "bg-purple-600/15 text-purple-400 border-purple-600/20" };
    if (stage >= 3) return { label: "Trung cấp", color: "bg-amber-600/15 text-amber-400 border-amber-600/20" };
    return { label: "Cơ bản", color: "bg-emerald-600/15 text-emerald-400 border-emerald-600/20" };
  };

  // ======================================================
  // Loading
  // ======================================================

  if (loading) {
    return (
      <div className="space-y-5 max-w-5xl mx-auto">
        <div className="h-5 w-28 bg-zinc-900 rounded animate-pulse" />
        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-64 bg-zinc-800 rounded animate-pulse" />
              <div className="h-3 w-80 bg-zinc-800 rounded animate-pulse" />
            </div>
          </div>
          <div className="mt-5">
            <div className="h-2 bg-zinc-800 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-20 bg-zinc-900/60 border border-zinc-800/50 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // ======================================================
  // Error
  // ======================================================

  if (error) {
    return (
      <div className="space-y-5 max-w-5xl mx-auto">
        <Link
          href="/dashboard/courses"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors"
        >
          ← Quay lại Học tập
        </Link>
        <div className="bg-red-950/30 border border-red-800/40 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-600/20 flex items-center justify-center">
              ⚠️
            </div>
            <div>
              <p className="text-sm font-medium text-red-400">Có lỗi xảy ra</p>
              <p className="text-xs text-zinc-500 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="space-y-5 max-w-5xl mx-auto">
        <Link
          href="/dashboard/courses"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors"
        >
          ← Quay lại Học tập
        </Link>
        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-8 text-center">
          <div className="text-3xl mb-3">📚</div>
          <p className="text-sm text-zinc-400">Không tìm thấy chủ đề ngữ pháp.</p>
        </div>
      </div>
    );
  }

  const diffInfo = getDifficulty(category.stage);
  const favCount = category.lessons.filter((l) => favorites[l.id]).length;

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-10">
      {/* ── BACK ── */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/courses"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors"
        >
          ← Quay lại Học tập
        </Link>
        <Link
          href="/dashboard/grammar"
          className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
        >
          Bảng điều khiển ngữ pháp →
        </Link>
      </div>

      {/* ── CATEGORY HEADER ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-900/80 border border-zinc-800/60 rounded-2xl p-5">
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/5 rounded-full -translate-y-20 translate-x-20 pointer-events-none" />

        <div className="relative">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-red-600/15 border border-red-600/20 flex items-center justify-center text-xl shrink-0">
              📝
            </div>

            {/* Information */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-white">{category.name}</h1>
                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full border bg-blue-600/15 text-blue-400 border-blue-600/20">
                  Chặng {category.stage}
                </span>
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${diffInfo.color}`}>
                  Độ khó: {diffInfo.label}
                </span>
              </div>

              {category.description && (
                <p className="text-sm text-zinc-500 mt-1">{category.description}</p>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500">Tiến độ học</span>
              <span className="text-xs text-zinc-400">
                {category.completedLessons}/{category.totalLessons} bài{" · "}{category.progress}%
              </span>
            </div>

            <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-600 to-red-400 h-2 rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(Math.max(category.progress, 0), 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="bg-zinc-800/40 border border-zinc-800/60 rounded-xl p-3">
              <p className="text-[10px] text-zinc-600">Tổng bài</p>
              <p className="text-lg font-bold text-white mt-1">{category.totalLessons}</p>
            </div>

            <div className="bg-zinc-800/40 border border-zinc-800/60 rounded-xl p-3">
              <p className="text-[10px] text-zinc-600">Đã hoàn thành</p>
              <p className="text-lg font-bold text-green-400 mt-1">{category.completedLessons}</p>
            </div>

            <div className="bg-zinc-800/40 border border-zinc-800/60 rounded-xl p-3">
              <p className="text-[10px] text-zinc-600">Còn lại</p>
              <p className="text-lg font-bold text-red-400 mt-1">
                {Math.max(category.totalLessons - category.completedLessons, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── SEARCH & FILTER TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <p className="text-sm text-zinc-300 font-medium">📚 Danh sách bài học</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">Chọn bài học để bắt đầu học ngữ pháp</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Tìm bài học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-zinc-900/90 border border-zinc-800 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-all w-40 sm:w-56"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            filterStatus === "all"
              ? "bg-red-600 text-white shadow"
              : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
          }`}
        >
          Tất cả ({category.totalLessons})
        </button>
        <button
          onClick={() => setFilterStatus("completed")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            filterStatus === "completed"
              ? "bg-green-600 text-white shadow"
              : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
          }`}
        >
          Đã hoàn thành ({category.completedLessons})
        </button>
        <button
          onClick={() => setFilterStatus("uncompleted")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            filterStatus === "uncompleted"
              ? "bg-amber-600 text-white shadow"
              : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
          }`}
        >
          Chưa học ({Math.max(category.totalLessons - category.completedLessons, 0)})
        </button>
        <button
          onClick={() => setFilterStatus("favorite")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            filterStatus === "favorite"
              ? "bg-pink-600 text-white shadow"
              : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
          }`}
        >
          ⭐ Yêu thích ({favCount})
        </button>
      </div>

      {/* Empty */}
      {filteredLessons.length === 0 && (
        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-8 text-center">
          <div className="text-3xl mb-3">📖</div>
          <p className="text-sm text-zinc-400">Không tìm thấy bài học phù hợp.</p>
        </div>
      )}

      {/* ── LESSONS LIST ── */}
      <div className="space-y-3">
        {filteredLessons.map((lesson, index) => {
          const lessonNumber = index + 1;
          const isFav = !!favorites[lesson.id];

          return (
            <Link
              key={lesson.id}
              href={`/dashboard/courses/grammar/${category.id}/lessons/${lesson.id}`}
              className="block bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-700/70 hover:bg-zinc-900 rounded-2xl p-4 transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                {/* Lesson Number / Completed */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                    lesson.completed
                      ? "bg-green-600/15 text-green-400 border border-green-600/20"
                      : "bg-red-600/15 text-red-400 border border-red-600/20 group-hover:bg-red-600/20"
                  }`}
                >
                  {lesson.completed ? "✓" : lessonNumber}
                </div>

                {/* Lesson Information */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm text-white font-medium truncate group-hover:text-red-400 transition-colors">
                      {lesson.title}
                    </p>

                    {lesson.completed && (
                      <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-green-600/10 text-green-400 border border-green-600/20">
                        Đã hoàn thành
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] text-zinc-600">Bài {lessonNumber}</span>

                    {lesson.score > 0 && (
                      <span className="text-[10px] text-zinc-500">
                        Điểm: <span className="text-zinc-300 font-bold">{lesson.score}</span>
                      </span>
                    )}

                    {!lesson.completed && (
                      <span className="text-[10px] text-zinc-600">Chưa học</span>
                    )}
                  </div>
                </div>

                {/* Favorite & Last Studied */}
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    title={isFav ? "Bỏ yêu thích" : "Lưu vào yêu thích"}
                    onClick={(e) => toggleFavorite(e, lesson.id)}
                    className={`p-2 rounded-xl text-sm transition-all ${
                      isFav
                        ? "text-pink-400 hover:text-pink-300 bg-pink-500/10"
                        : "text-zinc-600 hover:text-pink-400 hover:bg-zinc-800"
                    }`}
                  >
                    {isFav ? "❤️" : "🤍"}
                  </button>

                  <div className="hidden sm:block text-right">
                    {lesson.lastStudied ? (
                      <p className="text-[10px] text-zinc-500">
                        Đã học: {new Date(lesson.lastStudied).toLocaleDateString("vi-VN")}
                      </p>
                    ) : (
                      <p className="text-[10px] text-zinc-700">Chưa học</p>
                    )}
                  </div>

                  <div className="text-zinc-700 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all">
                    →
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}