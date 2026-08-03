"use client";

import { learnWord, reviewWord } from "@/services/vocabulary";
import { TodayLearningResponse, VocabularyWord } from "@/types/vocabulary";
import { useState } from "react";

interface Props {
  data: TodayLearningResponse | null;
  onReload?: () => void;
}

export default function TodayLearning({
  data,
  onReload,
}: Props) {
  if (!data) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center text-gray-400">
        Đang tải...
      </div>
    );
  }

  if (data.words.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">

        <h2 className="text-xl font-bold text-white">
          🎉 Hoàn thành hôm nay
        </h2>

        <p className="mt-2 text-gray-400">
          Bạn đã hoàn thành toàn bộ mục tiêu hôm nay.
        </p>

      </div>
    );
  }

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between">

        <h2 className="text-xl font-bold text-white">
          Học hôm nay
        </h2>

        <span className="rounded-full bg-blue-600 px-3 py-1 text-sm text-white">
          {data.mode}
        </span>

      </div>

      {data.words.map((word) => (
        <WordCard
          key={word.id}
          word={word}
          mode={data.mode}
          onReload={onReload}
        />
      ))}

    </div>
  );
}

interface CardProps {
  word: VocabularyWord;
  mode: string;
  onReload?: () => void;
}

function WordCard({
  word,
  mode,
  onReload,
}: CardProps) {
  const [loading, setLoading] =
    useState(false);

  async function handleLearn() {
    try {
      setLoading(true);

      if (mode === "NEW") {
        await learnWord(word.id);
      } else {
        await reviewWord(word.id);
      }

      onReload?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">

      <div className="flex items-start justify-between">

        <div>

          <h2 className="text-2xl font-bold text-white">
            {word.english}
          </h2>

          <p className="mt-1 text-gray-400">
            {word.pronounce}
          </p>

        </div>

        <span className="rounded bg-green-600 px-2 py-1 text-xs text-white">
          {word.type}
        </span>

      </div>

      <div className="mt-4">

        <p className="text-lg font-semibold text-blue-400">
          {word.vietnamese}
        </p>

      </div>

      {word.explain && (
        <div className="mt-4">

          <p className="text-gray-300">
            {word.explain}
          </p>

        </div>
      )}

      {word.example && (
        <div className="mt-5 rounded-lg bg-zinc-800 p-4">

          <p className="italic text-white">
            {word.example}
          </p>

          <p className="mt-2 text-gray-400">
            {word.exampleVietnamese}
          </p>

        </div>
      )}

      <div className="mt-5 flex items-center gap-3">

        {word.audioUrl && (
          <audio controls className="h-10">
            <source
              src={word.audioUrl}
              type="audio/mpeg"
            />
          </audio>
        )}

        <button
          disabled={loading}
          onClick={handleLearn}
          className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white transition hover:bg-green-500 disabled:opacity-60"
        >
          {loading
            ? "Đang lưu..."
            : mode === "NEW"
            ? "Đánh dấu đã học"
            : "Đã ôn xong"}
        </button>

      </div>

    </div>
  );
}