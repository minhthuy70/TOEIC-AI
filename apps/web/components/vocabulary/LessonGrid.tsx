"use client";

import { Lesson } from "@/types/vocabulary";
import { Calendar, CheckCircle2, Lock, BookOpen } from "lucide-react";

interface Props {
  lessons: Lesson[];
  onSelectLesson: (lessonNumber: number) => void;
}

export default function LessonGrid({ lessons, onSelectLesson }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-red-500" />
            <span>Bài học hàng ngày</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Mỗi bài gồm 20 từ. Học xong bài trước để mở khóa bài tiếp theo.
          </p>
        </div>
        <span className="text-xs text-zinc-400 bg-zinc-900/80 border border-zinc-800/80 px-3 py-1.5 rounded-xl">
          {lessons.filter((l) => l.status === "completed").length}/{lessons.length} bài đã học
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {lessons.map((lesson) => {
          const isCompleted = lesson.status === "completed";
          const isLocked = lesson.status === "locked";
          const inProgress = lesson.status === "in_progress";

          // Progress percentage
          const percent = lesson.totalWords > 0 
            ? Math.round((lesson.learnedWords / lesson.totalWords) * 100) 
            : 0;

          return (
            <button
              key={lesson.lessonNumber}
              disabled={isLocked}
              onClick={() => onSelectLesson(lesson.lessonNumber)}
              className={`
                relative text-left rounded-2xl p-4 transition-all duration-300 group flex flex-col justify-between min-h-[120px]
                ${isCompleted 
                  ? "bg-gradient-to-br from-green-950/20 to-zinc-900/40 border border-green-500/20 hover:border-green-500/40 shadow-sm"
                  : inProgress
                  ? "bg-gradient-to-br from-red-950/20 to-zinc-900/40 border border-red-500/30 hover:border-red-500/50 shadow-md shadow-red-950/10 scale-[1.02]"
                  : "bg-zinc-900/20 border border-zinc-800/40 opacity-50 cursor-not-allowed"
                }
                ${!isLocked && "hover:scale-[1.03] active:scale-[0.98]"}
              `}
            >
              {/* Top Row: Lesson Number & Icon */}
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                  Bài {lesson.lessonNumber}
                </span>
                <span className="flex items-center justify-center">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : isLocked ? (
                    <Lock className="w-4 h-4 text-zinc-600" />
                  ) : (
                    <BookOpen className="w-4 h-4 text-red-400" />
                  )}
                </span>
              </div>

              {/* Middle Row: Day Info */}
              <div className="mt-2 flex-1">
                <p className="text-xs text-zinc-500">Ngày {lesson.lessonNumber}</p>
                <p className="text-xs text-white font-medium mt-0.5">
                  {lesson.learnedWords}/{lesson.totalWords} từ
                </p>
              </div>

              {/* Bottom Row: Progress bar */}
              <div className="w-full mt-3">
                <div className="w-full bg-zinc-800/80 rounded-full h-1">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted ? "bg-green-500" : "bg-red-500"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
