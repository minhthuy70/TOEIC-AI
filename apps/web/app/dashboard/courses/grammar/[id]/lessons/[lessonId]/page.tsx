"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getGrammarLesson, completeGrammarLesson } from "@/services/grammar";
import type { GrammarLessonDetail } from "@/types/grammar";

// ======================================================
// Render nội dung Grammar từ content trong DB
// ======================================================

function GrammarContent({ content }: { content: string }) {
  const lines = content.split(/\r?\n/);

  return (
    <div className="space-y-2">
      {lines.map((rawLine, index) => {
        const line = rawLine.trim();

        // Dòng trống
        if (!line) {
          return <div key={index} className="h-3" />;
        }

        // ==================================================
        // Heading cấp 1: # Chủ ngữ
        // ==================================================
        if (line.startsWith("# ") && !line.startsWith("## ")) {
          return (
            <div
              key={index}
              className="pt-5 pb-2 border-b border-zinc-800/70 mb-3"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {line.replace(/^#\s+/, "")}
              </h2>
            </div>
          );
        }

        // ==================================================
        // Heading cấp 2: ## 1. Khái niệm / ## Lỗi thường gặp / ## Mẹo làm bài
        // ==================================================
        if (line.startsWith("## ")) {
          const text = line.replace(/^##\s+/, "");
          const isMistake = text.toLowerCase().includes("lỗi") || text.toLowerCase().includes("mistake");
          const isTip = text.toLowerCase().includes("mẹo") || text.toLowerCase().includes("tip") || text.toLowerCase().includes("thủ thuật");

          return (
            <div key={index} className="pt-6 pb-2">
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span className={`w-1.5 h-5 rounded-full ${isMistake ? "bg-rose-500" : isTip ? "bg-amber-500" : "bg-red-500"}`} />
                <span>{text}</span>
              </h3>
            </div>
          );
        }

        // ==================================================
        // Heading cấp 3: ### ...
        // ==================================================
        if (line.startsWith("### ")) {
          return (
            <h4
              key={index}
              className="text-base font-semibold text-red-400 pt-4 pb-1"
            >
              {line.replace(/^###\s+/, "")}
            </h4>
          );
        }

        // ==================================================
        // Lỗi thường gặp (Common mistakes box)
        // ==================================================
        if (
          line.toLowerCase().startsWith("lỗi thường gặp") ||
          line.toLowerCase().startsWith("lỗi sai thường gặp") ||
          line.toLowerCase().startsWith("common mistake") ||
          line.startsWith("❌")
        ) {
          return (
            <div
              key={index}
              className="my-3 bg-rose-950/40 border border-rose-800/40 rounded-xl p-4 space-y-1.5"
            >
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                <span>⚠️</span>
                <span>Lỗi thường gặp (Common Mistakes)</span>
              </div>
              <p className="text-sm text-rose-200/90 leading-relaxed pl-6">
                {line.replace(/^❌\s*/, "")}
              </p>
            </div>
          );
        }

        // ==================================================
        // Mẹo và thủ thuật (Tips and tricks box)
        // ==================================================
        if (
          line.toLowerCase().startsWith("mẹo làm bài") ||
          line.toLowerCase().startsWith("mẹo:") ||
          line.toLowerCase().startsWith("thủ thuật") ||
          line.toLowerCase().startsWith("tip:") ||
          line.toLowerCase().startsWith("lưu ý:") ||
          line.startsWith("💡")
        ) {
          return (
            <div
              key={index}
              className="my-3 bg-amber-950/30 border border-amber-800/40 rounded-xl p-4 space-y-1.5"
            >
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <span>💡</span>
                <span>Mẹo & Chiến thuật làm bài TOEIC</span>
              </div>
              <p className="text-sm text-amber-200/90 leading-relaxed pl-6">
                {line.replace(/^💡\s*/, "")}
              </p>
            </div>
          );
        }

        // ==================================================
        // Cấu trúc
        // ==================================================
        if (
          line.toLowerCase() === "cấu trúc:" ||
          line.toLowerCase() === "cấu trúc"
        ) {
          return (
            <div
              key={index}
              className="mt-4 mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-200"
            >
              <span className="text-lg">📐</span>
              <span>Cấu trúc</span>
            </div>
          );
        }

        // ==================================================
        // Ví dụ
        // ==================================================
        if (
          line.toLowerCase() === "ví dụ:" ||
          line.toLowerCase() === "ví dụ" ||
          line.toLowerCase() === "example:"
        ) {
          return (
            <div
              key={index}
              className="mt-5 mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-200"
            >
              <span className="text-lg">💡</span>
              <span>Ví dụ & Phân tích</span>
            </div>
          );
        }

        // ==================================================
        // Dòng bắt đầu bằng S + V / công thức
        // ==================================================
        if (
          line.includes(" + ") &&
          !line.includes("→") &&
          line.length < 100
        ) {
          return (
            <div
              key={index}
              className="my-3 bg-zinc-950/80 border border-zinc-700/60 rounded-xl px-5 py-3.5"
            >
              <p className="font-mono text-base sm:text-lg font-semibold text-red-400">
                {line}
              </p>
            </div>
          );
        }

        // ==================================================
        // Dòng có mũi tên → nghĩa tiếng Việt
        // ==================================================
        if (line.startsWith("→")) {
          return (
            <div
              key={index}
              className="ml-3 my-1.5 pl-4 border-l-2 border-red-600/40"
            >
              <p className="text-sm sm:text-[15px] text-zinc-400 leading-7">
                {line}
              </p>
            </div>
          );
        }

        // ==================================================
        // Dòng bullet -
        // ==================================================
        if (line.startsWith("- ")) {
          return (
            <div
              key={index}
              className="flex gap-3 ml-2 py-1.5"
            >
              <span className="text-red-500 mt-2">•</span>
              <p className="text-sm sm:text-[15px] text-zinc-300 leading-7">
                {line.replace(/^-\s+/, "")}
              </p>
            </div>
          );
        }

        // ==================================================
        // Dòng đánh số: 1. ...
        // ==================================================
        if (/^\d+\.\s+/.test(line)) {
          const match = line.match(/^(\d+)\.\s+(.*)$/);
          if (match) {
            return (
              <div
                key={index}
                className="flex gap-3 ml-1 py-2"
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-red-600/15 border border-red-600/20 text-[11px] font-bold text-red-400 shrink-0">
                  {match[1]}
                </span>
                <p className="text-sm sm:text-[15px] text-zinc-300 leading-7">
                  {match[2]}
                </p>
              </div>
            );
          }
        }

        // ==================================================
        // Câu tiếng Anh ngắn → làm nổi bật
        // ==================================================
        const looksLikeEnglishExample =
          /^[A-Z][A-Za-z0-9 ,.'!?()-]+[.!?]$/.test(line) &&
          !line.includes("Subject") &&
          !line.includes("Cấu trúc");

        if (looksLikeEnglishExample) {
          return (
            <div
              key={index}
              className="my-2 bg-zinc-950/60 border border-zinc-800 rounded-xl px-4 py-3"
            >
              <p className="text-sm sm:text-[15px] text-white font-medium leading-7">
                {line}
              </p>
            </div>
          );
        }

        // ==================================================
        // Text bình thường
        // ==================================================
        return (
          <p
            key={index}
            className="text-sm sm:text-[15px] text-zinc-300 leading-7"
          >
            {line}
          </p>
        );
      })}
    </div>
  );
}

// ======================================================
// Page
// ======================================================

export default function GrammarLessonPage() {
  const params = useParams();

  const categoryId = Number(params.id);
  const lessonId = Number(params.lessonId);

  const [lesson, setLesson] = useState<GrammarLessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  // Favorites & Share Toast
  const [isFavorite, setIsFavorite] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  // Check favorites from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("grammar_favorites");
      if (stored && lessonId) {
        const favs = JSON.parse(stored);
        setIsFavorite(!!favs[lessonId]);
      }
    } catch (e) {
      console.error(e);
    }
  }, [lessonId]);

  const toggleFavorite = () => {
    try {
      const stored = localStorage.getItem("grammar_favorites");
      const favs = stored ? JSON.parse(stored) : {};
      const nextState = !isFavorite;
      favs[lessonId] = nextState;
      localStorage.setItem("grammar_favorites", JSON.stringify(favs));
      setIsFavorite(nextState);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ====================================================
  // Load lesson
  // ====================================================

  useEffect(() => {
    if (!lessonId || Number.isNaN(lessonId)) {
      setError("ID bài học không hợp lệ.");
      setLoading(false);
      return;
    }

    const loadLesson = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getGrammarLesson(lessonId);
        setLesson(data);
      } catch (err) {
        console.error("Load grammar lesson error:", err);
        setError("Không thể tải nội dung bài học.");
      } finally {
        setLoading(false);
      }
    };

    loadLesson();
  }, [lessonId]);

  // ====================================================
  // Handle complete lesson
  // ====================================================

  const handleComplete = async () => {
    if (!lessonId || completing) return;

    try {
      setCompleting(true);
      await completeGrammarLesson(lessonId, 100);

      // Reload lesson data to update progress
      const data = await getGrammarLesson(lessonId);
      setLesson(data);
    } catch (err) {
      console.error("Complete lesson error:", err);
      alert("Không thể đánh dấu hoàn thành bài học.");
    } finally {
      setCompleting(false);
    }
  };

  // ====================================================
  // Loading
  // ====================================================

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="h-5 w-48 bg-zinc-800 rounded animate-pulse" />

        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 animate-pulse" />
            <div className="flex-1 space-y-3">
              <div className="h-7 w-2/3 bg-zinc-800 rounded animate-pulse" />
              <div className="h-4 w-1/3 bg-zinc-800 rounded animate-pulse" />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6 space-y-4">
          <div className="h-6 w-48 bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-full bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-4/6 bg-zinc-800 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // ====================================================
  // Error / Not found
  // ====================================================

  if (error || !lesson) {
    return (
      <div className="max-w-5xl mx-auto space-y-5">
        <Link
          href={`/dashboard/courses/grammar/${categoryId}`}
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          ← Quay lại danh sách bài học
        </Link>

        <div className="bg-red-950/30 border border-red-800/40 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-600/20 flex items-center justify-center">
              ⚠️
            </div>
            <div>
              <p className="text-sm font-semibold text-red-400">Có lỗi xảy ra</p>
              <p className="text-sm text-zinc-400 mt-1">{error || "Không tìm thấy bài học."}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stage = lesson.category.stage;

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-10 relative">
      {/* ── SHARE TOAST ── */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 transition-all">
          <span>✓</span>
          <span>Đã sao chép liên kết bài học vào clipboard!</span>
        </div>
      )}

      {/* ── TOP NAV BAR ── */}
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/courses/grammar/${categoryId}`}
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          ← Quay lại danh sách bài ({lesson.category.name})
        </Link>

        {/* Toolbar: Favorite, Share */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFavorite}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              isFavorite
                ? "bg-pink-600/20 text-pink-300 border-pink-500/40"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            <span>{isFavorite ? "❤️" : "🤍"}</span>
            <span>{isFavorite ? "Đã lưu yêu thích" : "Lưu yêu thích"}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center gap-1.5 transition-all"
          >
            <span>🔗</span>
            <span>Chia sẻ</span>
          </button>
        </div>
      </div>

      {/* ── LESSON HEADER ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-900/70 border border-zinc-800/60 rounded-2xl p-6 sm:p-7">
        <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-red-600/5 blur-2xl pointer-events-none" />

        <div className="relative">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-red-600/15 border border-red-600/20 flex items-center justify-center text-xl sm:text-2xl shrink-0">
              📝
            </div>

            {/* Title & Badges */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                  Chủ đề: {lesson.category.name}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600/15 text-blue-400 border border-blue-600/20">
                  Chặng {stage}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-600/15 text-amber-400 border border-amber-600/20">
                  {lesson.difficulty || "Cơ bản"}
                </span>
                {lesson.progress.completed && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-green-600/15 text-green-400 border border-green-600/20">
                    ✓ Đã hoàn thành
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-white mt-2">
                {lesson.title}
              </h1>

              <p className="text-xs text-zinc-500 mt-1">
                Bài học {lesson.lessonIndex || 1} trên {lesson.totalLessonsInCategory || 1} bài trong chủ đề
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6 pt-5 border-t border-zinc-800/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-zinc-500">Trạng thái bài học</span>
              <span className={lesson.progress.completed ? "text-[11px] text-green-400 font-medium" : "text-[11px] text-zinc-500"}>
                {lesson.progress.completed ? "Đã hoàn thành" : "Chưa hoàn thành"}
              </span>
            </div>

            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  lesson.progress.completed
                    ? "w-full bg-gradient-to-r from-green-600 to-emerald-400"
                    : "w-0"
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT BODY ── */}
      <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl overflow-hidden">
        <div className="px-5 sm:px-7 py-5 border-b border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600/10 border border-red-600/15 flex items-center justify-center">
              📚
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-white">Nội dung bài học</h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">Lý thuyết, ví dụ, lỗi thường gặp và mẹo làm bài</p>
            </div>
          </div>

          {/* Quick Mark Complete Button */}
          {!lesson.progress.completed ? (
            <button
              type="button"
              onClick={handleComplete}
              disabled={completing}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow transition-all disabled:opacity-50"
            >
              {completing ? "Đang lưu..." : "✓ Đánh dấu hoàn thành"}
            </button>
          ) : (
            <span className="text-xs text-green-400 font-semibold px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-xl">
              ✓ Đã học xong
            </span>
          )}
        </div>

        <div className="px-5 sm:px-7 py-6 sm:py-8">
          {lesson.content ? (
            <GrammarContent content={lesson.content} />
          ) : (
            <div className="py-12 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-sm text-zinc-500">Chưa có nội dung bài học.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── LAST STUDIED & COMPLETE ACTION ── */}
      <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-600/15 flex items-center justify-center">
            🕐
          </div>
          <div>
            <p className="text-[11px] text-zinc-500">Lần học gần nhất</p>
            <p className="text-sm font-semibold text-white mt-0.5">
              {lesson.progress.lastStudied
                ? new Date(lesson.progress.lastStudied).toLocaleString("vi-VN")
                : "Chưa học"}
            </p>
          </div>
        </div>

        {!lesson.progress.completed && (
          <button
            type="button"
            onClick={handleComplete}
            disabled={completing}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition-all disabled:opacity-50"
          >
            {completing ? "Đang xử lý..." : "✓ Đánh dấu bài học hoàn thành"}
          </button>
        )}
      </div>

      {/* ── NAVIGATION BETWEEN LESSONS (PREVIOUS / NEXT) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {lesson.previousLesson ? (
          <Link
            href={`/dashboard/courses/grammar/${categoryId}/lessons/${lesson.previousLesson.id}`}
            className="bg-zinc-900/60 border border-zinc-800/70 hover:border-zinc-700 p-4 rounded-2xl flex items-center gap-3 transition-all group"
          >
            <span className="text-zinc-500 group-hover:text-white transition-colors text-lg">←</span>
            <div className="min-w-0">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold">Bài trước</span>
              <p className="text-xs font-bold text-white truncate group-hover:text-red-400 transition-colors">
                {lesson.previousLesson.title}
              </p>
            </div>
          </Link>
        ) : (
          <div className="bg-zinc-900/30 border border-zinc-800/30 p-4 rounded-2xl opacity-40">
            <span className="text-[10px] text-zinc-600 uppercase font-semibold">Bài trước</span>
            <p className="text-xs text-zinc-600">Đây là bài đầu tiên trong chủ đề</p>
          </div>
        )}

        {lesson.nextLesson ? (
          <Link
            href={`/dashboard/courses/grammar/${categoryId}/lessons/${lesson.nextLesson.id}`}
            className="bg-zinc-900/60 border border-zinc-800/70 hover:border-zinc-700 p-4 rounded-2xl flex items-center justify-between gap-3 transition-all group text-right"
          >
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold">Bài tiếp theo</span>
              <p className="text-xs font-bold text-white truncate group-hover:text-red-400 transition-colors">
                {lesson.nextLesson.title}
              </p>
            </div>
            <span className="text-zinc-500 group-hover:text-white transition-colors text-lg">→</span>
          </Link>
        ) : (
          <Link
            href={`/dashboard/courses/grammar/${categoryId}`}
            className="bg-zinc-900/60 border border-zinc-800/70 hover:border-zinc-700 p-4 rounded-2xl flex items-center justify-between gap-3 transition-all group text-right"
          >
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-emerald-400 uppercase font-semibold">Hoàn thành chủ đề</span>
              <p className="text-xs font-bold text-white">Quay lại danh sách bài</p>
            </div>
            <span className="text-zinc-500 group-hover:text-white transition-colors text-lg">✓</span>
          </Link>
        )}
      </div>

      {/* ── RELATED TOPICS LINKS (CHỦ ĐỀ LIÊN QUAN) ── */}
      {lesson.relatedCategories && lesson.relatedCategories.length > 0 && (
        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5 space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>🔗</span>
              <span>Chủ đề ngữ pháp liên quan (Chặng {stage})</span>
            </h3>
            <Link
              href="/dashboard/courses"
              className="text-xs text-red-400 hover:text-red-300 font-semibold"
            >
              Xem tất cả →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lesson.relatedCategories.map((rel) => (
              <Link
                key={rel.id}
                href={`/dashboard/courses/grammar/${rel.id}`}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-3.5 flex flex-col justify-between group transition-all"
              >
                <div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                    Chặng {rel.stage}
                  </span>
                  <p className="text-xs font-bold text-white mt-1.5 group-hover:text-red-400 transition-colors line-clamp-1">
                    {rel.name}
                  </p>
                  {rel.description && (
                    <p className="text-[11px] text-zinc-500 mt-1 line-clamp-1">
                      {rel.description}
                    </p>
                  )}
                </div>
                <span className="text-[11px] text-red-400 font-semibold mt-2">
                  Khám phá chủ đề →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}