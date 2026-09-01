"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getReviewLevels, getReviewWords } from "@/services/vocabulary";
import { ReviewLevel, VocabularyWordWithProgress } from "@/types/vocabulary";
import ReviewLevelGrid from "@/components/vocabulary/ReviewLevelGrid";
import ReviewSession from "@/components/vocabulary/ReviewSession";
import { ArrowLeft, Brain, Loader2 } from "lucide-react";

export default function ReviewPage() {
  const [loading, setLoading] = useState(true);
  const [levels, setLevels] = useState<ReviewLevel[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<ReviewLevel | null>(null);
  const [levelWords, setLevelWords] = useState<VocabularyWordWithProgress[]>([]);
  const [loadingWords, setLoadingWords] = useState(false);

  const fetchLevels = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getReviewLevels();
      if (res.success) {
        setLevels(res.levels);
      }
    } catch (err) {
      console.error("Error loading review levels", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

  const handleSelectLevel = async (levelNumber: number) => {
    const levelObj = levels.find((l) => l.level === levelNumber) || null;
    if (!levelObj || levelObj.count === 0) return;

    try {
      setLoadingWords(true);
      setSelectedLevel(levelObj);
      const res = await getReviewWords(levelNumber);
      if (res.success) {
        setLevelWords(res.words);
      }
    } catch (err) {
      console.error("Error loading level words", err);
      alert("Không thể tải từ vựng ôn tập");
      setSelectedLevel(null);
    } finally {
      setLoadingWords(false);
    }
  };

  const handleCloseSession = () => {
    setSelectedLevel(null);
    setLevelWords([]);
    fetchLevels(); // Reload levels count
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 px-8 py-6 text-zinc-300">
          <Loader2 className="w-5 h-5 animate-spin text-red-500" />
          <span>Đang tải dữ liệu ôn tập...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in w-full">
      {/* Back to courses */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/courses"
          className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Học tập</span>
        </Link>
        <span className="text-[10px] uppercase font-semibold tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
          Hệ thống Spaced Repetition (SRS)
        </span>
      </div>

      {/* Main content */}
      {!selectedLevel ? (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <Brain className="w-7 h-7 text-amber-400" />
              <span>Ôn tập từ vựng</span>
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Hệ thống chia làm 7 hộp thời gian. Hãy ôn tập các từ có trong hộp để củng cố trí nhớ dài hạn.
            </p>
          </div>

          <ReviewLevelGrid levels={levels} onSelectLevel={handleSelectLevel} />
        </div>
      ) : loadingWords ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin text-red-500" />
            <span>Đang tải từ vựng ôn tập...</span>
          </div>
        </div>
      ) : (
        <ReviewSession
          level={selectedLevel.level}
          label={selectedLevel.label}
          words={levelWords}
          onClose={handleCloseSession}
          onReload={fetchLevels}
        />
      )}
    </div>
  );
}
