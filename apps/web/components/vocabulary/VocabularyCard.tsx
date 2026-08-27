"use client";

import { useState } from "react";
import {
  learnWord,
  reviewWord,
  updateVocabularyNotes,
} from "@/services/vocabulary";
import { VocabularyWordWithProgress } from "@/types/vocabulary";

interface Props {
  word: VocabularyWordWithProgress;
  onReload?: () => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
}

export default function VocabularyCard({
  word,
  onReload,
  selectable,
  selected,
  onSelect,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesInput, setNotesInput] = useState(word.notes || "");
  const [exampleInput, setExampleInput] = useState(word.customExample || "");

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

  async function handleSaveNotes() {
    try {
      setLoading(true);
      await updateVocabularyNotes(word.id, notesInput.trim() || null, exampleInput.trim() || null);
      setIsEditingNotes(false);
      onReload?.();
    } catch (error) {
      console.error(error);
      alert("Lỗi khi lưu ghi chú");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`relative rounded-xl border ${selected ? 'border-amber-500 bg-amber-900/10' : 'border-zinc-800 bg-zinc-900'} p-5 shadow transition-colors`}>
      {/* Checkbox for bulk select */}
      {selectable && (
        <div className="absolute top-4 right-4 z-10">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect?.(e.target.checked)}
            className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-500 cursor-pointer"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">

        <div className={selectable ? "pr-8" : ""}>

          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            {word.english}
            {word.status && word.status !== 'NEW' && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                word.status === 'MASTERED' ? 'bg-amber-500/20 text-amber-400' :
                word.status === 'REVIEW' ? 'bg-blue-500/20 text-blue-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {word.status}
              </span>
            )}
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

      {/* Personal Notes & Custom Example (Read Mode) */}
      {!isEditingNotes && (word.notes || word.customExample) && (
        <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50 space-y-2">
          {word.notes && (
            <div>
              <p className="text-[10px] text-amber-400 uppercase font-bold">Ghi chú cá nhân</p>
              <p className="text-xs text-zinc-300 mt-1 whitespace-pre-wrap">{word.notes}</p>
            </div>
          )}
          {word.customExample && (
            <div>
              <p className="text-[10px] text-amber-400 uppercase font-bold">Ví dụ tùy chỉnh</p>
              <p className="text-xs text-zinc-300 mt-1 italic whitespace-pre-wrap">{word.customExample}</p>
            </div>
          )}
        </div>
      )}

      {/* Edit Notes Mode */}
      {isEditingNotes && (
        <div className="mt-4 p-3 bg-zinc-800/80 rounded-lg border border-zinc-700 space-y-3">
          <div>
            <label className="text-[10px] text-amber-400 uppercase font-bold block mb-1">Ghi chú cá nhân</label>
            <textarea
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md p-2 text-xs text-white outline-none min-h-[60px]"
              placeholder="Nhập ghi chú cho từ này..."
            />
          </div>
          <div>
            <label className="text-[10px] text-amber-400 uppercase font-bold block mb-1">Ví dụ tùy chỉnh</label>
            <textarea
              value={exampleInput}
              onChange={(e) => setExampleInput(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md p-2 text-xs text-white outline-none min-h-[60px]"
              placeholder="Nhập câu ví dụ tùy chỉnh của bạn..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setIsEditingNotes(false);
                setNotesInput(word.notes || "");
                setExampleInput(word.customExample || "");
              }}
              className="text-[11px] text-zinc-400 hover:text-white px-3 py-1.5"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              onClick={handleSaveNotes}
              disabled={loading}
              className="text-[11px] bg-amber-600 hover:bg-amber-500 text-white font-bold px-3 py-1.5 rounded-md transition"
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
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

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/80 pt-4">
        
        {!isEditingNotes ? (
          <button
            onClick={() => setIsEditingNotes(true)}
            className="text-xs text-zinc-400 hover:text-amber-400 font-semibold flex items-center gap-1 transition"
          >
            ✏️ Ghi chú cá nhân
          </button>
        ) : <div />}

        <button
          onClick={handleLearn}
          disabled={loading || word.status === 'MASTERED'}
          className={`rounded-lg px-5 py-2 text-xs font-semibold text-white transition ${
            word.status === 'MASTERED'
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              : word.isReview
              ? "bg-orange-600 hover:bg-orange-500"
              : "bg-green-600 hover:bg-green-500"
          } disabled:opacity-60`}
        >
          {loading
            ? "Đang xử lý..."
            : word.status === 'MASTERED'
            ? "Đã thành thạo"
            : word.isReview
            ? "Ôn xong"
            : "Đánh dấu đã học"}
        </button>

      </div>

    </div>
  );
}