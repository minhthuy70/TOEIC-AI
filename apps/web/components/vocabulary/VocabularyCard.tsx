"use client";

import { useState } from "react";
import {
  learnWord,
  reviewWord,
} from "@/services/vocabulary";
import { VocabularyWord } from "@/types/vocabulary";

interface Props {
  word: VocabularyWord;
  onReload?: () => void;
}

export default function VocabularyCard({
  word,
  onReload,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleLearn() {
    try {
      setLoading(true);

      if (word.isReview) {
        await reviewWord(word.id);
      } else {
        await learnWord(word.id);
      }

      onReload?.();
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow">

      {/* Header */}
      <div className="flex items-start justify-between">

        <div>

          <h2 className="text-2xl font-bold text-white">
            {word.english}
          </h2>

          {word.pronounce && (
            <p className="mt-1 text-gray-400">
              {word.pronounce}
            </p>
          )}

        </div>

        <div className="flex gap-2">

          {word.type && (
            <span className="rounded bg-blue-600 px-2 py-1 text-xs text-white">
              {word.type}
            </span>
          )}

          <span className="rounded bg-green-600 px-2 py-1 text-xs text-white">
            Stage {word.stage}
          </span>

        </div>

      </div>

      {/* Nghĩa */}

      <div className="mt-4">

        <p className="text-lg font-semibold text-green-400">
          {word.vietnamese}
        </p>

      </div>

      {/* Giải thích */}

      {word.explain && (
        <div className="mt-4">

          <p className="text-gray-300">
            {word.explain}
          </p>

        </div>
      )}

      {/* Ví dụ */}

      {word.example && (
        <div className="mt-5 rounded-lg bg-zinc-800 p-4">

          <p className="italic text-white">
            {word.example}
          </p>

          {word.exampleVietnamese && (
            <p className="mt-2 text-gray-400">
              {word.exampleVietnamese}
            </p>
          )}

        </div>
      )}

      {/* Topic */}

      <div className="mt-4">

        <span className="rounded-full bg-zinc-700 px-3 py-1 text-sm text-gray-200">
          {word.topic}
        </span>

      </div>

      {/* Audio */}

      {word.audioUrl && (
        <div className="mt-5">

          <audio controls className="w-full">
            <source
              src={word.audioUrl}
              type="audio/mpeg"
            />
          </audio>

        </div>
      )}

      {/* Action */}

      <div className="mt-6 flex justify-end">

        <button
          onClick={handleLearn}
          disabled={loading}
          className={`rounded-lg px-5 py-2 font-semibold text-white transition ${
            word.isReview
              ? "bg-orange-600 hover:bg-orange-500"
              : "bg-green-600 hover:bg-green-500"
          } disabled:opacity-60`}
        >
          {loading
            ? "Đang xử lý..."
            : word.isReview
            ? "Ôn xong"
            : "Đánh dấu đã học"}
        </button>

      </div>

    </div>
  );
}