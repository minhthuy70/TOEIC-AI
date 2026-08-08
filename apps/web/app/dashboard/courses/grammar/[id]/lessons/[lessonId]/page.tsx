"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { getGrammarLesson } from "@/services/grammar";

import type { GrammarLessonDetail } from "@/types/grammar";

export default function GrammarLessonPage() {
  const params = useParams();

  const categoryId = Number(params.id);
  const lessonId = Number(params.lessonId);

  const [lesson, setLesson] =
    useState<GrammarLessonDetail | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        console.log("Loading grammar lesson:", lessonId);

        const data = await getGrammarLesson(lessonId);

        console.log("Grammar lesson response:", data);

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

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="h-6 w-32 bg-zinc-900 rounded animate-pulse" />

        <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6">
          <div className="h-8 w-2/3 bg-zinc-800 rounded animate-pulse" />

          <div className="h-4 w-1/2 bg-zinc-800 rounded mt-4 animate-pulse" />

          <div className="space-y-3 mt-8">
            <div className="h-20 bg-zinc-800 rounded animate-pulse" />
            <div className="h-20 bg-zinc-800 rounded animate-pulse" />
            <div className="h-20 bg-zinc-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="max-w-5xl mx-auto space-y-5">
        <Link
          href={`/dashboard/courses/grammar/${categoryId}`}
          className="text-sm text-zinc-400 hover:text-white"
        >
          ← Quay lại danh sách bài học
        </Link>

        <div className="bg-red-950/30 border border-red-800/40 rounded-2xl p-6">
          <p className="text-red-400 text-sm">
            {error || "Không tìm thấy bài học."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Back */}
      <Link
        href={`/dashboard/courses/grammar/${categoryId}`}
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
      >
        ← Quay lại danh sách bài học
      </Link>

      {/* Header */}
      <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6">

        <div className="flex items-start gap-4">

          <div className="w-12 h-12 rounded-xl bg-red-600/15 border border-red-600/20 flex items-center justify-center text-xl shrink-0">
            📝
          </div>

          <div className="flex-1">

            <div className="flex items-center gap-2 flex-wrap">

              <h1 className="text-2xl font-bold text-white">
                {lesson.title}
              </h1>

              {lesson.progress.completed && (
                <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-green-600/15 text-green-400 border border-green-600/20">
                  ✓ Đã hoàn thành
                </span>
              )}

            </div>

           

          </div>

        </div>

      </div>

      {/* Content */}
      <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6">

        <div className="flex items-center gap-2 mb-5">
          <span className="text-lg">📚</span>

          <h2 className="text-lg font-semibold text-white">
            Nội dung bài học
          </h2>
        </div>

        {lesson.content ? (
          <div className="prose prose-invert max-w-none">
            <div className="text-sm text-zinc-300 leading-7 whitespace-pre-wrap">
              {lesson.content}
            </div>
          </div>
        ) : (
          <div className="text-sm text-zinc-500">
            Chưa có nội dung bài học.
          </div>
        )}

      </div>

     

      {/* Action */}
      <div className="flex justify-between items-center">

        <Link
          href={`/dashboard/courses/grammar/${categoryId}`}
          className="px-4 py-2.5 rounded-xl border border-zinc-800 text-sm text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
        >
          ← Danh sách bài
        </Link>

        {!lesson.progress.completed && (
          <button
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-sm font-semibold text-white transition-all"
          >
            Đánh dấu hoàn thành
          </button>
        )}

      </div>

    </div>
  );
}