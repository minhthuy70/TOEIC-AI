"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  getLessons,
  getLessonWords,
  getWordsFiltered,
  getTopics,
} from "@/services/vocabulary";
import {
  Lesson,
  Topic,
  VocabularyWordWithProgress,
} from "@/types/vocabulary";
import LessonGrid from "@/components/vocabulary/LessonGrid";
import LessonLearning from "@/components/vocabulary/LessonLearning";
import VocabularyFilter from "@/components/vocabulary/VocabularyFilter";
import VocabularyCard from "@/components/vocabulary/VocabularyCard";

export default function VocabularyPage() {
  const [loading, setLoading] = useState(true);
  const [currentStage, setCurrentStage] = useState(1);

  // Lessons
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonNumber, setSelectedLessonNumber] = useState<number | null>(null);
  const [lessonWords, setLessonWords] = useState<VocabularyWordWithProgress[]>([]);
  const [loadingLessonWords, setLoadingLessonWords] = useState(false);

  // Filters & Filtered Words List
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredWords, setFilteredWords] = useState<VocabularyWordWithProgress[]>([]);
  const [totalWords, setTotalWords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingFiltered, setLoadingFiltered] = useState(false);

  const [activeFilters, setActiveFilters] = useState<{
    stage?: number;
    topic?: string;
    search?: string;
    sort?: "asc" | "desc";
    page: number;
  }>({
    page: 1,
  });

  // Calculate current stage from user localStorage
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        const score = u.currentScore ?? 0;
        let stage = 1;
        if (score >= 800) stage = 5;
        else if (score >= 650) stage = 4;
        else if (score >= 500) stage = 3;
        else if (score >= 300) stage = 2;
        setCurrentStage(stage);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Fetch Lessons and Topics
  const loadLessonsAndTopics = useCallback(async () => {
    try {
      setLoading(true);
      const [lessonsRes, topicsRes] = await Promise.all([
        getLessons(),
        getTopics(),
      ]);

      if (lessonsRes.success) {
        setLessons(lessonsRes.lessons);
      }
      setTopics(topicsRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLessonsAndTopics();
  }, [loadLessonsAndTopics]);

  // Fetch Filtered Words List
  const fetchFilteredWords = useCallback(async () => {
    try {
      setLoadingFiltered(true);
      const res = await getWordsFiltered({
        page: activeFilters.page,
        limit: 12,
        stage: activeFilters.stage,
        topic: activeFilters.topic,
        search: activeFilters.search,
        sort: activeFilters.sort,
      });

      if (res.success) {
        setFilteredWords(res.items as VocabularyWordWithProgress[]);
        setTotalWords(res.total);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFiltered(false);
    }
  }, [activeFilters]);

  useEffect(() => {
    fetchFilteredWords();
  }, [fetchFilteredWords]);

  // Handle click on lesson card
  const handleSelectLesson = async (lessonNumber: number) => {
    try {
      setLoadingLessonWords(true);
      setSelectedLessonNumber(lessonNumber);
      const res = await getLessonWords(lessonNumber);
      if (res.success) {
        setLessonWords(res.words);
      }
    } catch (err) {
      console.error(err);
      alert("Không thể tải từ vựng của bài học này");
      setSelectedLessonNumber(null);
    } finally {
      setLoadingLessonWords(false);
    }
  };

  const handleCloseLearning = () => {
    setSelectedLessonNumber(null);
    setLessonWords([]);
    loadLessonsAndTopics(); // Reload lessons grid stats
    fetchFilteredWords(); // Reload words list to sync status
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-8 py-6 text-zinc-300">
          Đang tải dữ liệu học từ vựng...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Section / Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">📚 Luyện từ vựng theo bài</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Học từ mới mỗi ngày và lọc tra cứu nhanh kho từ vựng.
          </p>
        </div>

        {/* Link to Review Page */}
        <Link
          href="/dashboard/review"
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-450 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/10 hover:shadow-amber-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          🧠 Đi đến Trang Ôn Tập (SRS)
        </Link>
      </div>

      {/* 1. LESSON LEARNING OR LESSON GRID */}
      {selectedLessonNumber !== null ? (
        loadingLessonWords ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <div className="text-zinc-400 text-sm">Đang mở bài học...</div>
          </div>
        ) : (
          <LessonLearning
            lessonNumber={selectedLessonNumber}
            words={lessonWords}
            onClose={handleCloseLearning}
            onReload={loadLessonsAndTopics}
          />
        )
      ) : (
        <LessonGrid lessons={lessons} onSelectLesson={handleSelectLesson} />
      )}

      {/* Divider */}
      <div className="border-t border-zinc-850 my-6" />

      {/* 2. FILTER & VOCABULARY LIST SECTION */}
      <div className="space-y-6">
        <VocabularyFilter
          currentStage={currentStage}
          topics={topics}
          onFilterChange={(filters) => setActiveFilters(filters)}
        />

        {/* Word Grid */}
        {loadingFiltered ? (
          <div className="rounded-2xl border border-zinc-805 bg-zinc-900/40 p-8 text-center text-zinc-500 text-sm">
            Đang tìm kiếm và lọc từ vựng...
          </div>
        ) : filteredWords.length === 0 ? (
          <div className="rounded-2xl border border-zinc-805 bg-zinc-900/40 p-8 text-center">
            <p className="text-white font-bold text-lg">Không tìm thấy từ vựng</p>
            <p className="text-zinc-500 text-sm mt-1">Vui lòng thay đổi từ khóa hoặc bộ lọc của bạn.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Tìm thấy {totalWords} từ vựng</span>
              <span>Trang {activeFilters.page} / {totalPages}</span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {filteredWords.map((word) => (
                <VocabularyCard
                  key={word.id}
                  word={word}
                  onReload={fetchFilteredWords}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  disabled={activeFilters.page === 1}
                  onClick={() =>
                    setActiveFilters((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white disabled:opacity-40 disabled:hover:text-zinc-300 transition"
                >
                  ← Trước
                </button>

                <span className="text-xs font-bold text-white">{activeFilters.page}</span>

                <button
                  disabled={activeFilters.page >= totalPages}
                  onClick={() =>
                    setActiveFilters((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white disabled:opacity-40 disabled:hover:text-zinc-300 transition"
                >
                  Sau →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}