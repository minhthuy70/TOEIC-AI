"use client";

import { useEffect, useState } from "react";

import { getWords } from "@/services/vocabulary";
import {
  VocabularyListResponse,
} from "@/types/vocabulary";

import VocabularyCard from "./VocabularyCard";

interface Props {
  topic?: string;
}

export default function VocabularyGrid({
  topic,
}: Props) {

  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);

  const [data, setData] =
    useState<VocabularyListResponse | null>(null);

  const [keyword, setKeyword] =
    useState("");

  async function loadWords() {

    try {

      setLoading(true);

      const res =
        await getWords(page, 12, topic);

      setData(res);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    loadWords();

  }, [page, topic]);

  const filtered =
    data?.items.filter((x) => {

      const key =
        keyword.toLowerCase();

      return (
        x.english
          .toLowerCase()
          .includes(key) ||

        x.vietnamese
          .toLowerCase()
          .includes(key)
      );

    }) ?? [];

  if (loading) {

    return (

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center text-gray-400">

        Đang tải từ vựng...

      </div>

    );

  }

  return (

    <div className="space-y-6">

      {/* Search */}

      <input
        type="text"
        placeholder="Tìm từ vựng..."
        value={keyword}
        onChange={(e) =>
          setKeyword(e.target.value)
        }
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-white outline-none focus:border-blue-500"
      />

      {/* Total */}

      <div className="flex items-center justify-between">

        <p className="text-gray-400">

          Tổng

          <span className="ml-2 font-bold text-white">

            {data?.total ?? 0}

          </span>

          từ

        </p>

        <p className="text-gray-400">

          Trang

          <span className="ml-2 font-bold text-white">

            {data?.page}

          </span>

          /

          <span className="ml-2 font-bold text-white">

            {data?.totalPages}

          </span>

        </p>

      </div>

      {/* Grid */}

      <div className="grid gap-5 lg:grid-cols-2">

        {filtered.map((word) => (

          <VocabularyCard
            key={word.id}
            word={word}
            onReload={loadWords}
          />

        ))}

      </div>

      {/* Empty */}

      {filtered.length === 0 && (

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">

          <h2 className="text-xl font-bold text-white">

            Không có dữ liệu

          </h2>

          <p className="mt-2 text-gray-400">

            Không tìm thấy từ phù hợp.

          </p>

        </div>

      )}

      {/* Pagination */}

      <div className="flex items-center justify-center gap-3">

        <button
          disabled={page === 1}
          onClick={() =>
            setPage(page - 1)
          }
          className="rounded-lg bg-zinc-800 px-4 py-2 text-white disabled:opacity-40"
        >
          ← Trước
        </button>

        <span className="text-white">

          {page}

        </span>

        <button
          disabled={
            page >=
            (data?.totalPages ?? 1)
          }
          onClick={() =>
            setPage(page + 1)
          }
          className="rounded-lg bg-zinc-800 px-4 py-2 text-white disabled:opacity-40"
        >
          Sau →
        </button>

      </div>

    </div>

  );

}