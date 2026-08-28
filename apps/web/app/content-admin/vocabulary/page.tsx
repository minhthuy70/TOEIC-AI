"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

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

type VocabularyForm = {
  english: string;
  type: string;
  vietnamese: string;
  pronounce: string;
  explain: string;
  example: string;
  exampleVietnamese: string;
  imageUrl: string;
  audioUrl: string;
  topic: string;
  stage: number;
};


type VocabularyResponse = {
  items: Vocabulary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
const EMPTY_FORM: VocabularyForm = {
  english: "",
  type: "",
  vietnamese: "",
  pronounce: "",
  explain: "",
  example: "",
  exampleVietnamese: "",
  imageUrl: "",
  audioUrl: "",
  topic: "",
  stage: 1,
};
const API_URL = "http://localhost:3001";

export default function VocabularyAdminPage() {
  const [items, setItems] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [topic, setTopic] = useState("");
const [showForm, setShowForm] = useState(false);

const [formMode, setFormMode] =
  useState<"create" | "edit">("create");

const [editingId, setEditingId] =
  useState<number | null>(null);

const [form, setForm] =
  useState<VocabularyForm>(EMPTY_FORM);

const [saving, setSaving] = useState(false);
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
async function handleSaveVocabulary() {
  if (!form.english.trim()) {
    alert("Vui lòng nhập từ tiếng Anh");
    return;
  }

  if (!form.vietnamese.trim()) {
    alert("Vui lòng nhập nghĩa tiếng Việt");
    return;
  }

  if (!form.stage) {
    alert("Vui lòng chọn chặng");
    return;
  }

  try {
    setSaving(true);

    const token =
      localStorage.getItem("accessToken");

    const url =
      formMode === "create"
        ? `${API_URL}/admin/vocabulary`
        : `${API_URL}/admin/vocabulary/${editingId}`;

    const method =
      formMode === "create"
        ? "POST"
        : "PATCH";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data?.message ||
          "Không thể lưu từ vựng",
      );
    }

    alert(
      formMode === "create"
        ? "Thêm từ vựng thành công"
        : "Cập nhật từ vựng thành công",
    );

    setShowForm(false);
    setForm({ ...EMPTY_FORM });
    setEditingId(null);

    await loadVocabulary(page);
  } catch (error) {
    console.error(error);

    alert(
      error instanceof Error
        ? error.message
        : "Không thể lưu từ vựng",
    );
  } finally {
    setSaving(false);
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

  function editVocabulary(item: Vocabulary) {
  setFormMode("edit");
  setEditingId(item.id);

  setForm({
    english: item.english || "",
    type: item.type || "",
    vietnamese: item.vietnamese || "",
    pronounce: item.pronounce || "",
    explain: item.explain || "",
    example: item.example || "",
    exampleVietnamese:
      item.exampleVietnamese || "",
    imageUrl: item.imageUrl || "",
    audioUrl: item.audioUrl || "",
    topic: item.topic || "",
    stage: item.stage || 1,
  });

  setShowForm(true);
}

  async function deleteVocabulary(id: number) {
  const item = items.find(
    (item) => item.id === id,
  );

  const confirmed = window.confirm(
    `Bạn có chắc muốn xóa từ vựng "${
      item?.english || `#${id}`
    }"?\n\nDữ liệu tiến độ học của người dùng đối với từ này cũng sẽ bị xóa.`,
  );

  if (!confirmed) {
    return;
  }

  try {
    const token =
      localStorage.getItem("accessToken");

    const res = await fetch(
      `${API_URL}/admin/vocabulary/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data?.message ||
          "Không thể xóa từ vựng",
      );
    }

    alert("Xóa từ vựng thành công");

    await loadVocabulary(page);
  } catch (error) {
    console.error(error);

    alert(
      error instanceof Error
        ? error.message
        : "Không thể xóa từ vựng",
    );
  }
}
  
  function updateForm(
  field: keyof VocabularyForm,
  value: string | number,
) {
  setForm((prev) => ({
    ...prev,
    [field]: value,
  }));
}
function openCreateForm() {
  setFormMode("create");
  setEditingId(null);
  setForm({ ...EMPTY_FORM });
  setShowForm(true);
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
  onClick={openCreateForm}
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
{showForm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            {formMode === "create"
              ? "Thêm từ vựng"
              : `Sửa từ vựng #${editingId}`}
          </h2>

          <p className="text-sm text-zinc-500 mt-1">
            {formMode === "create"
              ? "Thêm một từ vựng mới vào hệ thống"
              : "Cập nhật thông tin từ vựng"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form */}
      <div className="p-6 space-y-5">

        {/* English + Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              English <span className="text-red-500">*</span>
            </label>

            <input
              value={form.english}
              onChange={(e) =>
                updateForm(
                  "english",
                  e.target.value,
                )
              }
              placeholder="Ví dụ: benefit"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Type
            </label>

            <select
              value={form.type}
              onChange={(e) =>
                updateForm(
                  "type",
                  e.target.value,
                )
              }
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
            >
              <option value="">Chọn loại từ</option>
              <option value="Noun">Noun</option>
              <option value="Verb">Verb</option>
              <option value="Adjective">
                Adjective
              </option>
              <option value="Adverb">Adverb</option>
              <option value="Preposition">
                Preposition
              </option>
              <option value="Conjunction">
                Conjunction
              </option>
              <option value="Pronoun">
                Pronoun
              </option>
              <option value="Phrase">Phrase</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Vietnamese */}
        <div>
          <label className="block text-sm text-zinc-400 mb-2">
            Vietnamese
          </label>

          <input
            value={form.vietnamese}
            onChange={(e) =>
              updateForm(
                "vietnamese",
                e.target.value,
              )
            }
            placeholder="Ví dụ: Lợi ích"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
          />
        </div>

        {/* Pronounce */}
        <div>
          <label className="block text-sm text-zinc-400 mb-2">
            Pronounce
          </label>

          <input
            value={form.pronounce}
            onChange={(e) =>
              updateForm(
                "pronounce",
                e.target.value,
              )
            }
            placeholder="Ví dụ: /ˈbenɪfɪt/"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
          />
        </div>

        {/* Explain */}
        <div>
          <label className="block text-sm text-zinc-400 mb-2">
            Explain
          </label>

          <textarea
            value={form.explain}
            onChange={(e) =>
              updateForm(
                "explain",
                e.target.value,
              )
            }
            rows={3}
            placeholder="Giải thích chi tiết..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 resize-none"
          />
        </div>

        {/* Example */}
        <div>
          <label className="block text-sm text-zinc-400 mb-2">
            Example
          </label>

          <textarea
            value={form.example}
            onChange={(e) =>
              updateForm(
                "example",
                e.target.value,
              )
            }
            rows={3}
            placeholder="Ví dụ câu tiếng Anh..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 resize-none"
          />
        </div>

        {/* Example Vietnamese */}
        <div>
          <label className="block text-sm text-zinc-400 mb-2">
            Example Vietnamese
          </label>

          <textarea
            value={form.exampleVietnamese}
            onChange={(e) =>
              updateForm(
                "exampleVietnamese",
                e.target.value,
              )
            }
            rows={3}
            placeholder="Dịch nghĩa câu ví dụ..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 resize-none"
          />
        </div>

        {/* Image + Audio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Image URL
            </label>

            <input
              value={form.imageUrl}
              onChange={(e) =>
                updateForm(
                  "imageUrl",
                  e.target.value,
                )
              }
              placeholder="https://..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Audio URL
            </label>

            <input
              value={form.audioUrl}
              onChange={(e) =>
                updateForm(
                  "audioUrl",
                  e.target.value,
                )
              }
              placeholder="https://..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Topic + Stage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Topic
            </label>

            <input
              value={form.topic}
              onChange={(e) =>
                updateForm(
                  "topic",
                  e.target.value,
                )
              }
              placeholder="Ví dụ: Health"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Stage <span className="text-red-500">*</span>
            </label>

            <select
              value={form.stage}
              onChange={(e) =>
                updateForm(
                  "stage",
                  Number(e.target.value),
                )
              }
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
            >
              <option value={1}>
                Stage 1
              </option>

              <option value={2}>
                Stage 2
              </option>

              <option value={3}>
                Stage 3
              </option>

              <option value={4}>
                Stage 4
              </option>

              <option value={5}>
                Stage 5
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-800 px-6 py-4 flex justify-end gap-3">
        
        <button
          type="button"
          onClick={() => setShowForm(false)}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50"
        >
          Hủy
        </button>

        <button
          type="button"
          onClick={handleSaveVocabulary}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 font-semibold"
        >
          {saving
            ? "Đang lưu..."
            : formMode === "create"
              ? "Thêm từ vựng"
              : "Lưu thay đổi"}
        </button>
      </div>
    </div>
  </div>
)}
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
                            editVocabulary(item)
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