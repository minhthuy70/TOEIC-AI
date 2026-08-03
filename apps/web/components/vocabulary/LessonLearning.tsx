"use client";

import { useEffect, useState } from "react";
import { VocabularyWordWithProgress } from "@/types/vocabulary";
import { learnWord } from "@/services/vocabulary";

interface Props {
  lessonNumber: number;
  words: VocabularyWordWithProgress[];
  onClose: () => void;
  onReload: () => void;
}

export default function LessonLearning({
  lessonNumber,
  words,
  onClose,
  onReload,
}: Props) {
  const [viewMode, setViewMode] = useState<"flashcard" | "list">("flashcard");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});

  // Local state for words progress to reflect changes instantly without full API reload until close
  const [localWords, setLocalWords] = useState<VocabularyWordWithProgress[]>(words);

  const activeWords = localWords.filter((w) => w.status === "NEW");
  const currentWord = activeWords[currentIndex];
useEffect(() => {
  if (currentIndex >= activeWords.length) {
    setCurrentIndex(
      Math.max(activeWords.length - 1, 0)
    );
  }
}, [activeWords.length]);
  const handleLearnToggle = async (
  wordId: number,
  currentStatus: string
) => {
  if (currentStatus !== "NEW") return;

  try {
    setLoadingMap((prev) => ({
      ...prev,
      [wordId]: true,
    }));

    const res = await learnWord(wordId);

    if (!res.success) return;

    // cập nhật local trước
    const updatedWords: VocabularyWordWithProgress[] =
  localWords.map((w) =>
    w.id === wordId
      ? {
          ...w,
          status: "LEARNING" as const,
          reviewLevel: 1,
          isReview: false,
        }
      : w
    );

    setLocalWords(updatedWords);

    // danh sách NEW sau khi đã học xong từ hiện tại
    const remainingWords = updatedWords.filter(
      (w) => w.status === "NEW"
    );

    setIsFlipped(false);

    if (remainingWords.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= remainingWords.length) {
      setCurrentIndex(remainingWords.length - 1);
    }

    // KHÔNG reload ở đây
    // onReload();

  } catch (err) {
    console.error(err);
  } finally {
    setLoadingMap((prev) => ({
      ...prev,
      [wordId]: false,
    }));
  }
};

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < activeWords.length - 1) {
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

  const learnedCount = localWords.filter((w) => w.status !== "NEW").length;
  const isLessonCompleted = learnedCount === localWords.length;

  return (
    <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/60 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📖</span> Đang học: Bài {lessonNumber}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Tiến độ bài học: <span className="text-green-400 font-semibold">{learnedCount}/{localWords.length} từ đã học</span>
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* View Mode Toggle */}
          <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setViewMode("flashcard")}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === "flashcard"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              🎴 Flashcard
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === "list"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              📋 Danh sách
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white text-xs font-semibold rounded-xl transition"
          >
            Đóng
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
                  <span className="text-[10px] bg-red-600/10 border border-red-500/20 text-red-400 font-semibold px-2 py-0.5 rounded-full">
                    Mặt trước
                  </span>
                  <div className="flex gap-2">
                    {currentWord.type && (
                      <span className="text-[10px] bg-blue-600/20 text-blue-400 font-semibold px-2 py-0.5 rounded">
                        {currentWord.type}
                      </span>
                    )}
                    <span className="text-[10px] bg-zinc-800 text-zinc-400 font-semibold px-2 py-0.5 rounded">
                      Chặng {currentWord.stage}
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
                      className="w-10 h-10 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-red-400 flex items-center justify-center transition border border-zinc-700/30"
                    >
                      🔊
                    </button>
                  )}
                </div>

                <span className="text-xs text-zinc-500 font-medium">💡 Bấm vào thẻ để xem nghĩa</span>
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
                </div>

                <span className="text-xs text-zinc-500 font-medium">💡 Bấm vào thẻ để quay lại</span>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-4 w-full max-w-[480px]">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex-1 px-4 py-2.5 border border-zinc-850 bg-zinc-900 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition disabled:opacity-40"
            >
              ← Trước
            </button>

            <button
              onClick={() => handleLearnToggle(currentWord.id, currentWord.status)}
              disabled={loadingMap[currentWord.id] || currentWord.status !== "NEW"}
              className={`flex-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-1.5 shadow ${
                currentWord.status !== "NEW"
                  ? "bg-zinc-800 text-green-400 cursor-default border border-green-500/20"
                  : "bg-green-600 hover:bg-green-500 hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {currentWord.status !== "NEW" ? (
                <>✓ Đã học (SRS)</>
              ) : loadingMap[currentWord.id] ? (
                <>Đang lưu...</>
              ) : (
                <>📖 Đánh dấu ĐÃ HỌC</>
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === activeWords.length - 1 || activeWords.length === 0}
              className="flex-1 px-4 py-2.5 border border-zinc-850 bg-zinc-900 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition disabled:opacity-40"
            >
              Sau →
            </button>
          </div>

          {/* Progress Indicator */}
          <span className="text-xs text-zinc-500 font-medium">
            Còn lại {activeWords.length} từ chưa học trong bài
          </span>
        </div>
      )}

      {/* DETAIL LIST MODE */}
      {viewMode === "list" && (
        <div className="grid sm:grid-cols-2 gap-4">
          {activeWords.map((word, idx) => (
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
                    className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
                  >
                    🔊 Phát âm
                  </button>
                ) : (
                  <span />
                )}

                <button
                  onClick={() => handleLearnToggle(word.id, word.status)}
                  disabled={loadingMap[word.id] || word.status !== "NEW"}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold text-white transition flex items-center gap-1 ${
                    word.status !== "NEW"
                      ? "bg-zinc-800 text-green-400 border border-green-500/20"
                      : "bg-green-600 hover:bg-green-500 active:scale-[0.98]"
                  }`}
                >
                  {word.status !== "NEW" ? (
                    <>✓ Đã học</>
                  ) : loadingMap[word.id] ? (
                    <>Đang lưu...</>
                  ) : (
                    <>Học</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completion Modal/Notice */}
      {isLessonCompleted && (
        <div className="bg-green-950/20 border border-green-500/30 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="text-sm font-bold text-white">Chúc mừng! Bạn đã hoàn thành Bài {lessonNumber}</p>
              <p className="text-xs text-green-400/80 mt-0.5">Tất cả 20 từ đã được lưu vào lộ trình ôn tập SRS.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl transition"
          >
            Tiếp tục lộ trình
          </button>
        </div>
      )}
    </div>
  );
}
