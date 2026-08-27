"use client";

import { useState } from "react";
import {
  learnWord,
  reviewWord,
  updateVocabularyNotes,
} from "@/services/vocabulary";
import { VocabularyWord, VocabularyWordWithProgress } from "@/types/vocabulary";

type WordProp = VocabularyWord | VocabularyWordWithProgress;

function asProgress(w: WordProp): VocabularyWordWithProgress {
  return w as VocabularyWordWithProgress;
}

interface Props {
  word: WordProp;
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
  const pw = asProgress(word);
  const [loading, setLoading] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesInput, setNotesInput] = useState(pw.notes || "");
  const [exampleInput, setExampleInput] = useState(pw.customExample || "");

  async function handleLearn() {
    try {
      setLoading(true);

      if (pw.isReview) {
        await reviewWord(word.id);
      } else {
        await learnWord(word.id);
      }

      onReload?.();
    } catch (error) {
      console.error(error);
      alert("CÃ³ lá»—i xáº£y ra.");
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
      alert("Lá»—i khi lÆ°u ghi chÃº");
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
            {pw.status && pw.status !== 'NEW' && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                pw.status === 'MASTERED' ? 'bg-amber-500/20 text-amber-400' :
                pw.status === 'REVIEW' ? 'bg-blue-500/20 text-blue-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {pw.status}
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

      {/* NghÄ©a */}

      <div className="mt-4">

        <p className="text-lg font-semibold text-green-400">
          {word.vietnamese}
        </p>

      </div>

      {/* Giáº£i thÃ­ch */}

      {word.explain && (
        <div className="mt-4">

          <p className="text-gray-300">
            {word.explain}
          </p>

        </div>
      )}

      {/* VÃ­ dá»¥ */}

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
      {!isEditingNotes && (pw.notes || pw.customExample) && (
        <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50 space-y-2">
          {pw.notes && (
            <div>
              <p className="text-[10px] text-amber-400 uppercase font-bold">Ghi chÃº cÃ¡ nhÃ¢n</p>
              <p className="text-xs text-zinc-300 mt-1 whitespace-pre-wrap">{pw.notes}</p>
            </div>
          )}
          {pw.customExample && (
            <div>
              <p className="text-[10px] text-amber-400 uppercase font-bold">VÃ­ dá»¥ tÃ¹y chá»‰nh</p>
              <p className="text-xs text-zinc-300 mt-1 italic whitespace-pre-wrap">{pw.customExample}</p>
            </div>
          )}
        </div>
      )}

      {/* Edit Notes Mode */}
      {isEditingNotes && (
        <div className="mt-4 p-3 bg-zinc-800/80 rounded-lg border border-zinc-700 space-y-3">
          <div>
            <label className="text-[10px] text-amber-400 uppercase font-bold block mb-1">Ghi chÃº cÃ¡ nhÃ¢n</label>
            <textarea
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md p-2 text-xs text-white outline-none min-h-[60px]"
              placeholder="Nháº­p ghi chÃº cho tá»« nÃ y..."
            />
          </div>
          <div>
            <label className="text-[10px] text-amber-400 uppercase font-bold block mb-1">VÃ­ dá»¥ tÃ¹y chá»‰nh</label>
            <textarea
              value={exampleInput}
              onChange={(e) => setExampleInput(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md p-2 text-xs text-white outline-none min-h-[60px]"
              placeholder="Nháº­p cÃ¢u vÃ­ dá»¥ tÃ¹y chá»‰nh cá»§a báº¡n..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setIsEditingNotes(false);
                setNotesInput(pw.notes || "");
                setExampleInput(pw.customExample || "");
              }}
              className="text-[11px] text-zinc-400 hover:text-white px-3 py-1.5"
              disabled={loading}
            >
              Há»§y
            </button>
            <button
              onClick={handleSaveNotes}
              disabled={loading}
              className="text-[11px] bg-amber-600 hover:bg-amber-500 text-white font-bold px-3 py-1.5 rounded-md transition"
            >
              {loading ? "Äang lÆ°u..." : "LÆ°u thay Ä‘á»•i"}
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
            âœï¸ Ghi chÃº cÃ¡ nhÃ¢n
          </button>
        ) : <div />}

        <button
          onClick={handleLearn}
          disabled={loading || pw.status === 'MASTERED'}
          className={`rounded-lg px-5 py-2 text-xs font-semibold text-white transition ${
            pw.status === 'MASTERED'
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              : pw.isReview
              ? "bg-orange-600 hover:bg-orange-500"
              : "bg-green-600 hover:bg-green-500"
          } disabled:opacity-60`}
        >
          {loading
            ? "Äang xá»­ lÃ½..."
            : pw.status === 'MASTERED'
            ? "ÄÃ£ thÃ nh tháº¡o"
            : pw.isReview
            ? "Ã”n xong"
            : "ÄÃ¡nh dáº¥u Ä‘Ã£ há»c"}
        </button>

      </div>

    </div>
  );
}
