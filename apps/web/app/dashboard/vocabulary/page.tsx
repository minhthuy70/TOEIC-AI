"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  getLessons,
  getLessonWords,
  getWordsFiltered,
  getTopics,
  bulkResetVocabularyProgress,
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
import { loadVocabSettings } from "@/lib/vocab-settings";
import {
  BookA,
  Settings,
  BarChart3,
  Brain,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Trash2,
  BookOpen,
} from "lucide-react";

export default function VocabularyPage() {
  const [loading, setLoading] = useState(true);
  const [currentStage, setCurrentStage] = useState(1);

  // Load user vocabulary settings from localStorage
  const vocabSettings = typeof window !== "undefined" ? loadVocabSettings() : undefined;

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
    sort?: "alphabet_asc" | "alphabet_desc" | "learned_asc" | "learned_desc" | "review_asc" | "review_desc";
    status?: string;
    srsLevel?: number;
    page: number;
  }>({
    page: 1,
    sort: "alphabet_asc",
  });

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

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
        status: activeFilters.status,
        srsLevel: activeFilters.srsLevel,
      });

      if (res.success) {
        setFilteredWords(res.items as VocabularyWordWithProgress[]);
        setTotalWords(res.total);
        setTotalPages(res.totalPages);
        setSelectedIds([]); // reset selection on query change
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

  const handleToggleSelect = (wordId: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedIds((prev) => [...prev, wordId]);
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== wordId));
    }
  };

  const handleBulkAction = async (action: 'reset' | 'delete') => {
    if (!confirm(`Bạn có chắc chắn muốn ${action === 'reset' ? 'đặt lại' : 'xóa'} tiến độ của ${selectedIds.length} từ này?`)) return;
    
    try {
      setBulkLoading(true);
      await bulkResetVocabularyProgress(selectedIds, action);
      setSelectedIds([]);
      fetchFilteredWords();
      loadLessonsAndTopics(); // To update topic counts
    } catch (err) {
      console.error(err);
      alert("Lỗi thao tác hàng loạt");
    } finally {
      setBulkLoading(false);
    }
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
    <div className="space-y-6 animate-fade-in w-full">
      {/* Top Section / Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <BookA className="w-7 h-7 text-red-500" />
            <span>Luyện từ vựng theo bài</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Học từ mới mỗi ngày và lọc tra cứu nhanh kho từ vựng.
          </p>
        </div>

        {/* Links */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/vocabulary/settings"
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs rounded-xl transition"
          >
            <Settings className="w-4 h-4" />
            <span>Cài đặt</span>
          </Link>
          <Link
            href="/dashboard/vocabulary/statistics"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-700/10 hover:shadow-purple-700/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Thống kê từ vựng</span>
          </Link>
          <Link
            href="/dashboard/review"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-450 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/10 hover:shadow-amber-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Brain className="w-4 h-4" />
            <span>Trang Ôn Tập (SRS)</span>
          </Link>
        </div>
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
            autoPlay={vocabSettings?.autoPlay ?? true}
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
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-zinc-500 text-sm">
            Đang tìm kiếm và lọc từ vựng...
          </div>
        ) : filteredWords.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center flex flex-col items-center">
            <BookOpen className="w-10 h-10 text-zinc-600 mb-3" />
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
                  selectable={true}
                  selected={selectedIds.includes(word.id)}
                  onSelect={(checked) => handleToggleSelect(word.id, checked)}
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
                  className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white disabled:opacity-40 disabled:hover:text-zinc-300 transition flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Trước</span>
                </button>

                <span className="text-xs font-bold text-white">{activeFilters.page}</span>

                <button
                  disabled={activeFilters.page >= totalPages}
                  onClick={() =>
                    setActiveFilters((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white disabled:opacity-40 disabled:hover:text-zinc-300 transition flex items-center gap-1"
                >
                  <span>Sau</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900 border border-amber-500/50 shadow-2xl shadow-amber-900/20 px-6 py-4 rounded-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-5">
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm">Đã chọn {selectedIds.length} từ</span>
            <button 
              onClick={() => setSelectedIds([])} 
              className="text-[10px] text-zinc-400 hover:text-white text-left mt-0.5"
            >
              Bỏ chọn tất cả
            </button>
          </div>
          <div className="flex items-center gap-3 border-l border-zinc-800 pl-6">
            <button
              onClick={() => handleBulkAction('reset')}
              disabled={bulkLoading}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Làm mới tiến độ</span>
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              disabled={bulkLoading}
              className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-500 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa tiến độ</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}