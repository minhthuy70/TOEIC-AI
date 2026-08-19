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
    <div className="space-y-1">
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
        // Heading cấp 2: ## 1. Khái niệm
        // ==================================================
        if (line.startsWith("## ")) {
          return (
            <div key={index} className="pt-6 pb-2">
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-red-500" />
                {line.replace(/^##\s+/, "")}
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
          line.toLowerCase() === "ví dụ"
        ) {
          return (
            <div
              key={index}
              className="mt-5 mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-200"
            >
              <span className="text-lg">💡</span>
              <span>Ví dụ</span>
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
              className="my-3 bg-zinc-950/80 border border-zinc-700/60 rounded-xl px-5 py-4"
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

  const [lesson, setLesson] =
    useState<GrammarLessonDetail | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [completing, setCompleting] = useState(false);

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

        console.log(
          "Loading grammar lesson:",
          lessonId
        );

        const data =
          await getGrammarLesson(lessonId);

        console.log(
          "Grammar lesson response:",
          data
        );

        setLesson(data);
      } catch (err) {
        console.error(
          "Load grammar lesson error:",
          err
        );

        setError(
          "Không thể tải nội dung bài học."
        );
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

      await completeGrammarLesson(lessonId, 0);

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

          <div className="h-24 bg-zinc-800 rounded-xl animate-pulse" />

          <div className="h-4 w-full bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-zinc-800 rounded animate-pulse" />

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
              <p className="text-sm font-semibold text-red-400">
                Có lỗi xảy ra
              </p>

              <p className="text-sm text-zinc-400 mt-1">
                {error || "Không tìm thấy bài học."}
              </p>
            </div>

          </div>

        </div>

      </div>
    );
  }

  // ====================================================
  // Main
  // ====================================================

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-10">

      {/* ==================================================
          Back
      ================================================== */}

      <Link
        href={`/dashboard/courses/grammar/${categoryId}`}
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
      >
        ← Quay lại danh sách bài học
      </Link>

      {/* ==================================================
          Lesson Header
      ================================================== */}

      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-900/70 border border-zinc-800/60 rounded-2xl p-6 sm:p-7">

        {/* Background decoration */}

        <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-red-600/5 blur-2xl pointer-events-none" />

        <div className="relative">

          <div className="flex items-start gap-4">

            {/* Icon */}

            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-red-600/15 border border-red-600/20 flex items-center justify-center text-xl sm:text-2xl shrink-0">
              📝
            </div>

            {/* Title */}

            <div className="flex-1 min-w-0">

              <div className="flex items-center gap-2 flex-wrap">

                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {lesson.title}
                </h1>

                {lesson.progress.completed && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-green-600/15 text-green-400 border border-green-600/20">
                    ✓ Đã hoàn thành
                  </span>
                )}

              </div>

              <p className="text-xs text-zinc-500 mt-2">
                Bài học ngữ pháp TOEIC
              </p>

            </div>

          </div>

          {/* Progress */}

          <div className="mt-6 pt-5 border-t border-zinc-800/60">

            <div className="flex items-center justify-between mb-2">

              <span className="text-[11px] text-zinc-500">
                Trạng thái bài học
              </span>

              <span
                className={
                  lesson.progress.completed
                    ? "text-[11px] text-green-400 font-medium"
                    : "text-[11px] text-zinc-500"
                }
              >
                {lesson.progress.completed
                  ? "Đã hoàn thành"
                  : "Chưa hoàn thành"}
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

      {/* ==================================================
          Content
      ================================================== */}

      <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl overflow-hidden">

        {/* Content Header */}

        <div className="px-5 sm:px-7 py-5 border-b border-zinc-800/60">

          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-xl bg-red-600/10 border border-red-600/15 flex items-center justify-center">
              📚
            </div>

            <div>

              <h2 className="text-base sm:text-lg font-semibold text-white">
                Nội dung bài học
              </h2>

              <p className="text-[11px] text-zinc-500 mt-0.5">
                Học lý thuyết và ghi nhớ kiến thức trọng tâm
              </p>

            </div>

          </div>

        </div>

        {/* Content Body */}

        <div className="px-5 sm:px-7 py-6 sm:py-8">

          {lesson.content ? (
            <GrammarContent
              content={lesson.content}
            />
          ) : (
            <div className="py-12 text-center">

              <div className="text-4xl mb-3">
                📭
              </div>

              <p className="text-sm text-zinc-500">
                Chưa có nội dung bài học.
              </p>

            </div>
          )}

        </div>

      </div>

      {/* ==================================================
          Score / Progress
      ================================================== */}

      <div className="grid sm:grid-cols-2 gap-3">

        {/* Score */}

        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-600/15 flex items-center justify-center">
              🎯
            </div>

            <div>

              <p className="text-[11px] text-zinc-500">
                Điểm bài học
              </p>

              <p className="text-lg font-bold text-white mt-0.5">
                {lesson.progress.score > 0
                  ? `${lesson.progress.score} điểm`
                  : "Chưa có điểm"}
              </p>

            </div>

          </div>

        </div>

        {/* Last studied */}

        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-600/15 flex items-center justify-center">
              🕐
            </div>

            <div>

              <p className="text-[11px] text-zinc-500">
                Lần học gần nhất
              </p>

              <p className="text-sm font-semibold text-white mt-1">

                {lesson.progress.lastStudied
                  ? new Date(
                      lesson.progress.lastStudied
                    ).toLocaleString("vi-VN")
                  : "Chưa học"}

              </p>

            </div>

          </div>

        </div>

      </div>

      {/* ==================================================
          Actions
      ================================================== */}

      <div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-1">

        <Link
          href={`/dashboard/courses/grammar/${categoryId}`}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40 text-sm text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-800/50 transition-all"
        >
          ← Danh sách bài
        </Link>

        {!lesson.progress.completed && (
          <button
            type="button"
            onClick={handleComplete}
            disabled={completing}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {completing ? "Đang xử lý..." : "✓ Đánh dấu hoàn thành"}
          </button>
        )}

      </div>

    </div>
  );
}