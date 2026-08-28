"use client";

import { useEffect, useMemo, useState } from "react";
import { VocabularyWordWithProgress } from "@/types/vocabulary";
import { reviewWord } from "@/services/vocabulary";
import {
  Brain,
  Layers,
  ListOrdered,
  Volume2,
  Lightbulb,
  Check,
  CheckCircle2,
  Trophy,
  ChevronLeft,
  ChevronRight,
  PartyPopper,
  ArrowLeft,
} from "lucide-react";

interface Props {
  level: number;
  label: string;
  words: VocabularyWordWithProgress[];
  onClose: () => void;
  onReload: () => void;
}

export default function ReviewSession({
  level,
  label,
  words,
  onClose,
  onReload,
}: Props) {
  const [viewMode, setViewMode] = useState<"flashcard" | "list">("flashcard");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});

  // Local state for words progress in this review session
  const [localWords, setLocalWords] = useState<VocabularyWordWithProgress[]>(words);
  const [masteredSessionCount, setMasteredSessionCount] = useState(0);

  const reviewWords = useMemo(
    () => localWords.filter((w) => w.isReview),
    [localWords]
  );

  const currentWord = reviewWords[currentIndex];
  useEffect(() => {
    if (currentIndex >= reviewWords.length) {
      setCurrentIndex(0);
    }
  }, [reviewWords.length, currentIndex]);

  const handleReviewWord = async (wordId: number) => {
    const word = localWords.find((w) => w.id === wordId);

    if (!word || word.status === "MASTERED" || !word.isReview) {
      return;
    }

    try {
      setLoadingMap((prev) => ({
        ...prev,
        [wordId]: true,
      }));

      const res = await reviewWord(wordId);

      if (res.success) {
        if (res.status === "MASTERED") {
          setMasteredSessionCount((prev) => prev + 1);
        }

        const updatedWords: VocabularyWordWithProgress[] =
          localWords.map((w) =>
            w.id === wordId
              ? {
                  ...w,
                  isReview: false,
                  reviewLevel: res.reviewLevel,
                  status: res.status as VocabularyWordWithProgress["status"],
                }
              : w
          );

        setLocalWords(updatedWords);
        setIsFlipped(false);
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error(err);
      alert("Không thể lưu tiến trình ôn tập");
    } finally {
      setLoadingMap((prev) => ({
        ...prev,
        [wordId]: false,
      }));
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < reviewWords.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const playAudio = (url: string | null) => {
    if (!url) return;
    const audio = new Audio(url);
    audio.play().catch((err) => console.error("Audio error", err));
  };

  const reviewedCount = localWords.filter((w) => !w.isReview).length;
  const isSessionCompleted = reviewWords.length === 0;
  const progressPercent = Math.round((reviewedCount / localWords.length) * 100) || 0;

  return (
    <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/60 pb-4">
        <div className="w-full sm:w-auto">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-amber-500" />
            <span>Ôn tập: Hộp {label} (Cấp độ {level})</span>
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex-1 w-full sm:w-48 h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
              <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="text-xs text-zinc-400 min-w-max">
              <span className="text-amber-400 font-semibold">{reviewedCount}/{localWords.length}</span> từ đã ôn ({progressPercent}%)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* View Mode Toggle */}
          <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setViewMode("flashcard")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === "flashcard"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Flashcard</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === "list"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Danh sách</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại</span>
          </button>
        </div>
      </div>

      {/* FLASHCARD MODE */}
      {viewMode === "flashcard" && currentWord && (
        <div className="flex flex-col items-center justify-center space-y-6 py-4">
          {/* Perspective Container */}
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full max-w-[480px] h-[280px] cursor-pointer"
            style={{ perspective: "1000px" }}
          >
            {/* Card Inner */}
            <div 
              className="relative w-full h-full text-center transition-transform duration-500 rounded-3xl"
              style={{
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* Front side */}
              <div 
                className="absolute inset-0 w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/80 rounded-3xl p-6 flex flex-col justify-between items-center shadow-lg backface-hidden"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] bg-amber-600/10 border border-amber-500/20 text-amber-400 font-semibold px-2 py-0.5 rounded-full">
                    Mặt trước (Ôn tập)
                  </span>
                  <div className="flex gap-2">
                    {currentWord.type && (
                      <span className="text-[10px] bg-blue-600/20 text-blue-400 font-semibold px-2 py-0.5 rounded">
                        {currentWord.type}
                      </span>
                    )}
                    <span className="text-[10px] bg-zinc-800 text-zinc-400 font-semibold px-2 py-0.5 rounded">
                      Hộp {level}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-3">
                  <h3 className="text-3xl font-extrabold text-white tracking-wide">
                    {currentWord.english}
                  </h3>
                  {currentWord.pronounce && (
                    <p className="text-zinc-400 text-sm font-medium font-sans">
                      {currentWord.pronounce}
                    </p>
                  )}
                  {currentWord.audioUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playAudio(currentWord.audioUrl);
                      }}
                      className="w-10 h-10 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-amber-400 flex items-center justify-center transition border border-zinc-700/30"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <span className="text-xs text-zinc-500 font-medium flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Bấm vào thẻ để xem nghĩa</span>
                </span>
              </div>

              {/* Back side */}
              <div 
                className="absolute inset-0 w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/80 rounded-3xl p-6 flex flex-col justify-between items-center shadow-lg backface-hidden"
                style={{ 
                  backfaceVisibility: "hidden", 
                  transform: "rotateY(180deg)" 
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] bg-green-600/10 border border-green-500/20 text-green-400 font-semibold px-2 py-0.5 rounded-full">
                    Nghĩa & Giải thích
                  </span>
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 font-semibold px-2.5 py-0.5 rounded-full">
                    {currentWord.topic}
                  </span>
                </div>

                <div className="w-full flex flex-col items-center space-y-2.5 px-4 overflow-y-auto max-h-[160px]">
                  <h4 className="text-2xl font-bold text-green-400">
                    {currentWord.vietnamese}
                  </h4>
                  {currentWord.explain && (
                    <p className="text-xs text-zinc-300 text-center leading-relaxed font-sans">
                      {currentWord.explain}
                    </p>
                  )}
                  {currentWord.example && (
                    <div className="w-full bg-zinc-900/60 border border-zinc-850 p-2.5 rounded-xl text-left">
                      <p className="text-[11px] text-zinc-100 font-medium italic">
                        {currentWord.example}
                      </p>
                      {currentWord.exampleVietnamese && (
                        <p className="text-[10px] text-zinc-500 mt-1">
                          {currentWord.exampleVietnamese}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {currentWord.nextReview && (
                     <div className="text-[10px] text-zinc-500 mt-2">Ngày ôn tiếp theo: {new Date(currentWord.nextReview).toLocaleDateString("vi-VN")}</div>
                  )}
                </div>

                <span className="text-xs text-zinc-500 font-medium flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Bấm vào thẻ để quay lại</span>
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex flex-col gap-3 w-full max-w-[480px]">
            {!isFlipped ? (
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={handleNext}
                  className="flex-1 px-4 py-3 border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition disabled:opacity-40"
                >
                  Bỏ qua ôn
                </button>
                <button
                  onClick={() => setIsFlipped(true)}
                  className="flex-2 px-6 py-3 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-1.5 shadow bg-amber-600 hover:bg-amber-500 active:scale-[0.98] w-full"
                >
                  Hiển thị đáp án
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 w-full">
                <button
                  onClick={() => handleReviewWord(currentWord.id)}
                  disabled={loadingMap[currentWord.id]}
                  className="px-2 py-3 rounded-xl border border-red-500/20 bg-red-600/10 hover:bg-red-600/20 text-red-400 text-xs font-bold transition"
                >
                  Khó (Lặp lại)
                </button>
                <button
                  onClick={() => handleReviewWord(currentWord.id)}
                  disabled={loadingMap[currentWord.id]}
                  className="px-2 py-3 rounded-xl border border-amber-500/20 bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 text-xs font-bold transition"
                >
                  Tốt
                </button>
                <button
                  onClick={() => handleReviewWord(currentWord.id)}
                  disabled={loadingMap[currentWord.id]}
                  className="px-2 py-3 rounded-xl border border-green-500/20 bg-green-600/10 hover:bg-green-600/20 text-green-400 text-xs font-bold transition"
                >
                  Dễ
                </button>
              </div>
            )}
            
            <div className="flex items-center gap-3 w-full mt-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="flex-1 px-4 py-2 border border-zinc-850 bg-zinc-900 text-zinc-300 hover:text-white rounded-xl text-[10px] font-bold transition disabled:opacity-40 flex items-center justify-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Trước</span>
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === reviewWords.length - 1}
                className="flex-1 px-4 py-2 border border-zinc-850 bg-zinc-900 text-zinc-300 hover:text-white rounded-xl text-[10px] font-bold transition disabled:opacity-40 flex items-center justify-center gap-1"
              >
                <span>Sau</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          <span className="text-xs text-zinc-500 font-medium">
            Từ {currentIndex + 1} / {reviewWords.length}
          </span>
        </div>
      )}

      {/* DETAIL LIST MODE */}
      {viewMode === "list" && (
        <div className="grid sm:grid-cols-2 gap-4">
          {reviewWords.map((word, idx) => (
            <div
              key={word.id}
              className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 shadow flex flex-col justify-between space-y-4 hover:border-zinc-700/60 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-zinc-500 text-xs font-semibold">#{idx + 1}</span> {word.english}
                  </h3>
                  {word.pronounce && (
                    <p className="text-zinc-400 text-xs mt-0.5">{word.pronounce}</p>
                  )}
                </div>

                <div className="flex gap-1.5">
                  {word.type && (
                    <span className="text-[10px] bg-blue-600/10 border border-blue-500/15 text-blue-400 px-2 py-0.5 rounded">
                      {word.type}
                    </span>
                  )}
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                    Chặng {word.stage}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-green-400">{word.vietnamese}</p>
                {word.explain && (
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{word.explain}</p>
                )}
                {word.example && (
                  <div className="mt-2.5 bg-zinc-950/40 border border-zinc-850 p-2.5 rounded-xl text-left">
                    <p className="text-[11px] text-zinc-200 italic">{word.example}</p>
                    {word.exampleVietnamese && (
                      <p className="text-[10px] text-zinc-500 mt-1">{word.exampleVietnamese}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-zinc-800/40 pt-3">
                {word.audioUrl ? (
                  <button
                    onClick={() => playAudio(word.audioUrl)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Phát âm</span>
                  </button>
                ) : (
                  <span />
                )}

                <button
                  onClick={() => handleReviewWord(word.id)}
                  disabled={loadingMap[word.id] || !word.isReview}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold text-white transition flex items-center gap-1.5 ${
                    !word.isReview
                      ? "bg-zinc-800 text-green-400 border border-green-500/20"
                      : "bg-amber-600 hover:bg-amber-500 active:scale-[0.98]"
                  }`}
                >
                  {!word.isReview ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã ôn</span>
                    </>
                  ) : loadingMap[word.id] ? (
                    <>Đang lưu...</>
                  ) : (
                    <>Ôn</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completion Modal/Notice */}
      {isSessionCompleted && (
        <div className="bg-green-950/20 border border-green-500/30 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-400 shrink-0">
              <PartyPopper className="w-6 h-6" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">Chúc mừng! Bạn đã ôn tập xong hộp này.</p>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-green-400/80 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tổng số từ đã ôn: <strong>{reviewedCount}</strong></span>
                </p>
                <p className="text-sm text-amber-400/80 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4" />
                  <span>Số từ đạt mức thành thạo: <strong>{masteredSessionCount}</strong></span>
                </p>
                <p className="text-xs text-zinc-400 mt-2">Các từ chưa thuộc sẽ quay lại vào đợt ôn tiếp theo.</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-xl transition w-full sm:w-auto text-center"
          >
            Quay lại hộp ôn tập
          </button>
        </div>
      )}
    </div>
  );
}
