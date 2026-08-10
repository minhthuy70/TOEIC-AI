"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getListeningAllLessonReview,
  getListeningCompletedLessons,
  getListeningLessonReview,
  type ListeningGroup,
  type ListeningLessonSummary,
} from "@/services/listening";

const REVIEW_MODES = [
  { id: "lesson", label: "Ôn theo bài đã học" },
  { id: "all", label: "Ôn tất cả" },
];

const QUESTION_LIMITS = [5, 10, 15, 20];

export default function ListeningReviewPage() {
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"lesson" | "all">("lesson");
  const [lessons, setLessons] = useState<ListeningLessonSummary[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<ListeningLessonSummary | null>(null);
  const [reviewGroups, setReviewGroups] = useState<ListeningGroup[]>([]);
  const [loadingReview, setLoadingReview] = useState(false);
  const [questionLimit, setQuestionLimit] = useState<number>(10);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const res = await getListeningCompletedLessons();
      if (res.success) {
        setLessons(res.lessons);
      }
    } catch (err) {
      console.error("Không thể tải danh sách bài đã học", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLessons();
  }, []);

  const resetSession = () => {
    setAnswers({});
    setSubmitted(false);
    setCorrectCount(0);
  };

  const handleSelectLesson = async (lesson: ListeningLessonSummary) => {
    try {
      setLoadingReview(true);
      setMode("lesson");
      setSelectedLesson(lesson);
      resetSession();

      const res = await getListeningLessonReview(lesson.id);
      if (res.success && res.lesson) {
        setReviewGroups(res.lesson.listening_lesson_groups || []);
        const totalQuestions = res.lesson.listening_lesson_groups.reduce(
          (sum, group) => sum + (group.listening_lesson_questions?.length ?? 0),
          0,
        );
        setQuestionLimit(Math.min(10, totalQuestions) || 1);
      }
    } catch (err) {
      console.error("Không thể tải review bài", err);
    } finally {
      setLoadingReview(false);
    }
  };

  const handleSelectAll = async () => {
    try {
      setLoadingReview(true);
      setMode("all");
      setSelectedLesson(null);
      resetSession();

      const res = await getListeningAllLessonReview();
      if (res.success) {
        const groups: ListeningGroup[] = [];
        res.lessons.forEach((lesson) => {
          lesson.listening_lesson_groups.forEach((group) => groups.push(group));
        });
        setReviewGroups(groups);
        const totalQuestions = groups.reduce(
          (sum, group) => sum + (group.listening_lesson_questions?.length ?? 0),
          0,
        );
        setQuestionLimit(Math.min(15, totalQuestions) || 1);
      }
    } catch (err) {
      console.error("Không thể tải review toàn bộ", err);
    } finally {
      setLoadingReview(false);
    }
  };

  const handleModeChange = async (newMode: "lesson" | "all") => {
    if (newMode === mode) return;
    setMode(newMode);
    resetSession();

    if (newMode === "all") {
      await handleSelectAll();
      return;
    }

    if (lessons.length > 0) {
      await handleSelectLesson(lessons[0]);
    }
  };

  const flattenedQuestions = useMemo(() => {
    return reviewGroups.flatMap((group) =>
      (group.listening_lesson_questions || []).map((question) => ({
        ...question,
        groupTitle: group.title || `Group ${group.display_order}`,
        groupKnowledge: group.knowledge,
      }))
    );
  }, [reviewGroups]);

  const visibleQuestions = useMemo(() => {
    if (!questionLimit || questionLimit <= 0) return flattenedQuestions;
    return flattenedQuestions.slice(0, questionLimit);
  }, [flattenedQuestions, questionLimit]);

  const totalQuestions = visibleQuestions.length;
  const answeredCount = visibleQuestions.filter((q) => answers[q.id]).length;
  const isReadyToSubmit = answeredCount === totalQuestions && totalQuestions > 0;

  const handleAnswerSelect = (questionId: number, optionLabel: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionLabel }));
  };

  const handleSubmit = () => {
    const correct = visibleQuestions.reduce((count, question) => {
      const selected = answers[question.id];
      const correctOption = question.listening_lesson_options.find((opt) => opt.is_correct)?.option_label;
      return count + (selected === correctOption ? 1 : 0);
    }, 0);
    setCorrectCount(correct);
    setSubmitted(true);
  };

  const selectedLessonTitle = mode === "all" ? "Ôn tất cả bài đã học" : selectedLesson?.title || "Chọn bài để ôn";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">🔁 Ôn tập Listening</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Chọn bài đã học hoặc ôn tất cả câu hỏi. Sau khi làm xong, bạn sẽ thấy đúng/sai, đáp án đúng và giải thích.
          </p>
        </div>
        <Link
          href="/dashboard/courses"
          className="text-xs font-semibold text-zinc-400 hover:text-white transition"
        >
          ← Quay lại Học tập
        </Link>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <div className="space-y-4">
          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/70 p-5">
            <h2 className="text-sm font-semibold text-white uppercase tracking-[0.18em] mb-4">Chọn chế độ ôn</h2>
            <div className="space-y-2">
              {REVIEW_MODES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleModeChange(item.id as "lesson" | "all")}
                  className={`w-full text-left rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    mode === item.id
                      ? "bg-red-600 text-white border border-red-600/20"
                      : "bg-zinc-950/70 text-zinc-300 border border-zinc-800/70 hover:border-zinc-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/70 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white uppercase tracking-[0.18em]">Bài đã học</h2>
              <button
                onClick={handleSelectAll}
                className="rounded-full bg-emerald-600/10 px-3 py-1 text-[11px] font-semibold text-emerald-200 hover:bg-emerald-600/15 transition"
              >
                Ôn tất cả
              </button>
            </div>

            {loading ? (
              <div className="text-zinc-500 text-sm">Đang tải...</div>
            ) : lessons.length === 0 ? (
              <div className="text-zinc-500 text-sm">Chưa có bài học đã hoàn thành.</div>
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => handleSelectLesson(lesson)}
                    className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                      selectedLesson?.id === lesson.id && mode === "lesson"
                        ? "border-red-600 bg-red-600/10 text-white"
                        : "border-zinc-800 bg-zinc-950/70 text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{lesson.title}</p>
                        <p className="text-[11px] text-zinc-500 mt-1">
                          Part {lesson.part} · {lesson.totalGroups} group · {lesson.totalQuestions} câu
                        </p>
                      </div>
                      <span className="text-[11px] text-zinc-400">
                        {lesson.lastStudied ? new Date(lesson.lastStudied).toLocaleDateString() : "Chưa ôn"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/70 p-5 min-h-105">
          {loadingReview ? (
            <div className="flex min-h-65 items-center justify-center text-zinc-500">Đang tải dữ liệu ôn...</div>
          ) : reviewGroups.length === 0 ? (
            <div className="flex min-h-65 flex-col items-center justify-center text-zinc-400 space-y-3">
              <p className="text-sm font-semibold">Chưa có nội dung ôn.</p>
              <p className="text-xs text-zinc-500 text-center max-w-sm">
                Chọn một bài đã học hoặc nhấn Ôn tất cả để hiển thị câu hỏi review và tiếp tục.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                <div>
                  <p className="text-white text-lg font-bold">{selectedLessonTitle}</p>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Tổng câu hỏi: {totalQuestions} · Đã trả lời: {answeredCount}/{totalQuestions}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUESTION_LIMITS.map((count) => (
                    <button
                      key={count}
                      onClick={() => setQuestionLimit(count)}
                      className={`rounded-full px-3 py-2 text-[11px] transition ${
                        questionLimit === count
                          ? "bg-red-600 text-white"
                          : "bg-zinc-950/80 text-zinc-300 hover:bg-zinc-900"
                      }`}
                    >
                      {count} câu
                    </button>
                  ))}
                  <button
                    onClick={() => setQuestionLimit(totalQuestions)}
                    className={`rounded-full px-3 py-2 text-[11px] transition ${
                      questionLimit === totalQuestions
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-950/80 text-zinc-300 hover:bg-zinc-900"
                    }`}
                  >
                    Ôn hết
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {visibleQuestions.map((question, index) => {
                  const correctOption = question.listening_lesson_options.find((opt) => opt.is_correct);
                  const selected = answers[question.id];
                  const isCorrect = selected && selected === correctOption?.option_label;

                  return (
                    <div key={question.id} className="rounded-3xl border border-zinc-800/70 bg-zinc-950/60 p-5">
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">Câu {index + 1}: {question.question_text}</p>
                            <p className="text-[11px] text-zinc-500 mt-1">{question.groupTitle}</p>
                          </div>
                          {submitted && (
                            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${isCorrect ? "bg-emerald-600/15 text-emerald-300 border border-emerald-500/20" : "bg-red-600/15 text-red-300 border border-red-500/20"}`}>
                              {isCorrect ? "Đúng" : "Sai"}
                            </span>
                          )}
                        </div>

                        <div className="grid gap-2">
                          {question.listening_lesson_options.map((option) => {
                            const selectedOption = selected === option.option_label;
                            const optionClasses = submitted
                              ? option.is_correct
                                ? "bg-emerald-600/10 border border-emerald-500/20 text-emerald-200"
                                : selectedOption
                                ? "bg-red-600/10 border border-red-500/20 text-red-200"
                                : "bg-zinc-950/80 border border-zinc-800 text-zinc-300"
                              : selectedOption
                              ? "bg-red-600/15 border border-red-600/30 text-white"
                              : "bg-zinc-950/80 border border-zinc-800 text-zinc-300 hover:bg-zinc-900";

                            return (
                              <button
                                key={option.id}
                                onClick={() => handleAnswerSelect(question.id, option.option_label)}
                                disabled={submitted}
                                className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition ${optionClasses}`}
                              >
                                <span className="font-semibold mr-3">{option.option_label}.</span>
                                {option.option_text}
                              </button>
                            );
                          })}
                        </div>

                        {submitted && (
                          <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/80 p-4 text-sm text-zinc-300 space-y-3">
                            <div>
                              <p className="text-sm font-semibold text-white">Đáp án đúng:</p>
                              <p>{correctOption?.option_label}. {correctOption?.option_text}</p>
                            </div>
                            {question.explanation && (
                              <div>
                                <p className="text-sm font-semibold text-white">Giải thích:</p>
                                <p>{question.explanation}</p>
                              </div>
                            )}
                            {question.knowledge && (
                              <div>
                                <p className="text-sm font-semibold text-white">Kiến thức cần nắm:</p>
                                <p>{question.knowledge}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div className="rounded-3xl border border-zinc-800/70 bg-zinc-950/60 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">Hoàn thành ôn tập</p>
                      <p className="text-[12px] text-zinc-400 mt-1">
                        Chọn đáp án cho tất cả câu hỏi rồi nhấn hoàn thành để xem kết quả.
                      </p>
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={!isReadyToSubmit || submitted}
                      className={`rounded-2xl px-6 py-3 text-sm font-semibold transition ${
                        !isReadyToSubmit || submitted
                          ? "bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed"
                          : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                    >
                      Hoàn thành
                    </button>
                  </div>

                  {submitted && (
                    <div className="mt-4 rounded-2xl border border-emerald-600/30 bg-emerald-950/50 p-4 text-white">
                      <p className="font-semibold">Kết quả ôn tập</p>
                      <p className="mt-2 text-sm text-zinc-300">
                        Bạn trả lời đúng <span className="text-emerald-300 font-semibold">{correctCount}</span> / <span className="text-white font-semibold">{totalQuestions}</span> câu.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
