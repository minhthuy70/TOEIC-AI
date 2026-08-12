"use client";

import { useEffect, useState } from "react";

type Vocabulary = {
  id: number;
  english: string;
  type: string | null;
  vietnamese: string | null;
  pronounce: string | null;
  explain: string | null;
  example: string | null;
  exampleVietnamese: string | null;
  imageUrl: string | null;
  audioUrl: string | null;
  topic: string | null;
  stage: number;
  createdAt: string;
};

type VocabularyResponse = {
  items: Vocabulary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const API_URL = "http://localhost:3001";

export default function VocabularyAdminPage() {
  const [items, setItems] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [topic, setTopic] = useState("");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const limit = 10;

  async function loadVocabulary(
  currentPage = page,
  currentSearch = search,
  currentStage = stage,
  currentTopic = topic,
) {
  try {
    setLoading(true);

    const params = new URLSearchParams();

    params.set("page", String(currentPage));
    params.set("limit", String(limit));

    if (currentSearch.trim()) {
      params.set(
        "search",
        currentSearch.trim(),
      );
    }

    if (currentStage) {
      params.set(
        "stage",
        currentStage,
      );
    }

    if (currentTopic.trim()) {
      params.set(
        "topic",
        currentTopic.trim(),
      );
    }

    const token =
      localStorage.getItem(
        "accessToken",
      );

    const res = await fetch(
      `${API_URL}/admin/vocabulary?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      throw new Error(
        "Không thể tải danh sách từ vựng",
      );
    }

    const data: VocabularyResponse =
      await res.json();

    setItems(data.items);
    setTotal(data.total);
    setPage(data.page);
    setTotalPages(data.totalPages);
  } catch (error) {
    console.error(error);

    alert(
      "Không thể tải dữ liệu từ vựng",
    );
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    loadVocabulary(1);
  }, []);

  function handleSearch() {
  setPage(1);

  loadVocabulary(
    1,
    search,
    stage,
    topic,
  );
}

  function handleReset() {
    setSearch("");
    setStage("");
    setTopic("");
    setPage(1);

    setTimeout(() => {
      loadVocabulary(1);
    }, 0);
  }

  function goToPage(newPage: number) {
    if (newPage < 1 || newPage > totalPages) return;

    setPage(newPage);
    loadVocabulary(newPage);
  }

  function editVocabulary(id: number) {
    alert(`Chức năng sửa từ vựng #${id} sẽ làm tiếp`);
  }

  function deleteVocabulary(id: number) {
    alert(`Chức năng xóa từ vựng #${id} sẽ làm tiếp`);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Quản lý từ vựng
            </h1>

            <p className="text-zinc-400 mt-2">
              Quản lý toàn bộ dữ liệu từ vựng TOEIC
            </p>
          </div>

          <button
            onClick={() =>
              alert("Chức năng thêm từ vựng sẽ làm tiếp")
            }
            className="bg-red-600 hover:bg-red-700 px-5 py-3 rounded-xl font-semibold transition"
          >
            + Thêm từ vựng
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-zinc-400 text-sm">
            Tổng từ vựng
          </p>

          <p className="text-3xl font-bold mt-2">
            {total}
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-zinc-400 text-sm">
            Trang hiện tại
          </p>

          <p className="text-3xl font-bold mt-2">
            {page}
            <span className="text-lg text-zinc-500">
              {" "}
              / {totalPages}
            </span>
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-zinc-400 text-sm">
            Hiển thị
          </p>

          <p className="text-3xl font-bold mt-2">
            {items.length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm text-zinc-400 mb-2">
              Tìm kiếm
            </label>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="Nhập từ tiếng Anh..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
            />
          </div>

          {/* Stage */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Chặng
            </label>

            <select
              value={stage}
              onChange={(e) => {
  const newStage = e.target.value;

  setStage(newStage);
  setPage(1);

  loadVocabulary(
    1,
    search,
    newStage,
    topic,
  );
}}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
            >
              <option value="">Tất cả chặng</option>
              <option value="1">Chặng 1</option>
              <option value="2">Chặng 2</option>
              <option value="3">Chặng 3</option>
              <option value="4">Chặng 4</option>
              <option value="5">Chặng 5</option>
            </select>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Topic
            </label>

            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="Ví dụ: Health"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSearch}
            className="bg-red-600 hover:bg-red-700 px-5 py-2.5 rounded-xl font-semibold"
          >
            Tìm kiếm
          </button>

          <button
            onClick={handleReset}
            className="bg-zinc-800 hover:bg-zinc-700 px-5 py-2.5 rounded-xl"
          >
            Đặt lại
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/70">
              <tr className="text-left text-sm text-zinc-400">
                <th className="px-5 py-4">ID</th>
                <th className="px-5 py-4">Từ vựng</th>
                <th className="px-5 py-4">Loại</th>
                <th className="px-5 py-4">Nghĩa</th>
                <th className="px-5 py-4">Topic</th>
                <th className="px-5 py-4">Stage</th>
                <th className="px-5 py-4 text-right">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-zinc-400"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-zinc-400"
                  >
                    Không tìm thấy từ vựng
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-zinc-800 hover:bg-zinc-800/40 transition"
                  >
                    <td className="px-5 py-4 text-zinc-500">
                      #{item.id}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold">
                        {item.english}
                      </div>

                      {item.pronounce && (
                        <div className="text-xs text-zinc-500 mt-1">
                          {item.pronounce}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 text-zinc-400">
                      {item.type || "--"}
                    </td>

                    <td className="px-5 py-4 max-w-xs">
                      <div className="truncate">
                        {item.vietnamese || "--"}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm text-zinc-300">
                        {item.topic || "--"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-sm font-medium">
                        Stage {item.stage}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            editVocabulary(item.id)
                          }
                          className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm"
                        >
                          Sửa
                        </button>

                        <button
                          onClick={() =>
                            deleteVocabulary(item.id)
                          }
                          className="px-3 py-2 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 text-sm"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 0 && (
          <div className="border-t border-zinc-800 px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-zinc-500">
              Trang {page} / {totalPages} · {total} từ
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => goToPage(page - 1)}
                className="px-3 py-2 rounded-lg bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-700"
              >
                ←
              </button>

              {Array.from(
                { length: Math.min(totalPages, 7) },
                (_, index) => index + 1
              ).map((number) => (
                <button
                  key={number}
                  onClick={() => goToPage(number)}
                  className={`w-9 h-9 rounded-lg ${
                    page === number
                      ? "bg-red-600 text-white"
                      : "bg-zinc-800 hover:bg-zinc-700"
                  }`}
                >
                  {number}
                </button>
              ))}

              <button
                disabled={page === totalPages}
                onClick={() => goToPage(page + 1)}
                className="px-3 py-2 rounded-lg bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-700"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}