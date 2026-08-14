"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ReadingLesson = {
  id: number;
  title: string;
  part: number;
  displayOrder: number | null;
  description: string | null;
  difficulty: number | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    groups: number;
  };
};

type LessonForm = {
  title: string;
  part: string;
  displayOrder: string;
  description: string;
  difficulty: string;
};

const API_URL = "http://localhost:3001";

const emptyForm: LessonForm = {
  title: "",
  part: "5",
  displayOrder: "0",
  description: "",
  difficulty: "1",
};

export default function ReadingAdminPage() {
  const router = useRouter();

  const [lessons, setLessons] = useState<ReadingLesson[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [part, setPart] = useState("");
  const [stage, setStage] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] =
    useState<ReadingLesson | null>(null);

  const [form, setForm] = useState<LessonForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const getToken = () => {
    return localStorage.getItem("accessToken");
  };

  const loadLessons = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", "10");

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (part) {
        params.set("part", part);
      }

      if (stage) {
        params.set("stage", stage);
      }

      const token = getToken();

      const res = await fetch(
        `${API_URL}/admin/reading/lessons?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message || "Không thể tải bài Reading",
        );
      }

      setLessons(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Không thể tải bài Reading",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLessons();
  }, [page, search, part, stage]);

  const openCreate = () => {
    setEditingLesson(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (lesson: ReadingLesson) => {
    setEditingLesson(lesson);

    setForm({
      title: lesson.title,
      part: String(lesson.part),
      displayOrder: String(
        lesson.displayOrder ?? 0,
      ),
      description: lesson.description || "",
      difficulty: String(lesson.difficulty || 1),
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingLesson(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      alert("Tên bài Reading không được để trống");
      return;
    }

    const partNumber = Number(form.part);
    const displayOrderNumber = Number(
      form.displayOrder,
    );
    const difficultyNumber = Number(form.difficulty);

    if (
      !Number.isInteger(partNumber) ||
      partNumber < 5 ||
      partNumber > 7
    ) {
      alert("Part phải từ 5 đến 7");
      return;
    }

    if (
      !Number.isInteger(displayOrderNumber) ||
      displayOrderNumber < 0
    ) {
      alert("Display order không hợp lệ");
      return;
    }

    if (
      !Number.isInteger(difficultyNumber) ||
      difficultyNumber < 1 ||
      difficultyNumber > 5
    ) {
      alert("Stage phải từ 1 đến 5");
      return;
    }

    try {
      setSaving(true);

      const token = getToken();

      const payload = {
        title: form.title.trim(),
        part: partNumber,
        displayOrder: displayOrderNumber,
        description: form.description.trim() || null,
        stage: difficultyNumber,
      };

      const url = editingLesson
        ? `${API_URL}/admin/reading/lessons/${editingLesson.id}`
        : `${API_URL}/admin/reading/lessons`;

      const method = editingLesson ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message ||
            "Không thể lưu bài Reading",
        );
      }

      alert(
        editingLesson
          ? "Cập nhật bài Reading thành công"
          : "Thêm bài Reading thành công",
      );

      closeModal();
      loadLessons();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Không thể lưu bài Reading",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    lesson: ReadingLesson,
  ) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa bài "${lesson.title}"?\n\nCác group và dữ liệu liên quan của bài này cũng có thể bị xóa theo.`,
    );

    if (!confirmed) return;

    try {
      const token = getToken();

      const res = await fetch(
        `${API_URL}/admin/reading/lessons/${lesson.id}`,
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
            "Không thể xóa bài Reading",
        );
      }

      alert(
        data?.message ||
          "Xóa bài Reading thành công",
      );

      loadLessons();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Không thể xóa bài Reading",
      );
    }
  };

  const clearFilters = () => {
    setSearch("");
    setPart("");
    setStage("");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Reading
            </h1>

            <p className="text-zinc-400 mt-1">
              Quản lý bài học Reading
            </p>
          </div>

          <button
            onClick={openCreate}
            className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 font-semibold transition"
          >
            + Thêm bài Reading
          </button>
        </div>

        {/* FILTER */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm kiếm bài Reading..."
              className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
            />

            <select
              value={part}
              onChange={(e) => {
                setPart(e.target.value);
                setPage(1);
              }}
              className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none"
            >
              <option value="">
                Tất cả Part
              </option>

              {Array.from(
                { length: 3 },
                (_, i) => i + 5,
              ).map((value) => (
                <option
                  key={value}
                  value={value}
                >
                  Part {value}
                </option>
              ))}
            </select>

            <select
              value={stage}
              onChange={(e) => {
                setStage(e.target.value);
                setPage(1);
              }}
              className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none"
            >
              <option value="">
                Tất cả Stage
              </option>

              {Array.from(
                { length: 5 },
                (_, i) => i + 1,
              ).map((value) => (
                <option
                  key={value}
                  value={value}
                >
                  Stage {value}
                </option>
              ))}
            </select>

            <button
              onClick={clearFilters}
              className="px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-zinc-400">
              Đang tải...
            </div>
          ) : lessons.length === 0 ? (
            <div className="p-10 text-center text-zinc-400">
              Chưa có bài Reading nào.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-zinc-400 text-sm">
                  <th className="px-5 py-4">
                    ID
                  </th>

                  <th className="px-5 py-4">
                    Tên bài
                  </th>

                  <th className="px-5 py-4">
                    Part
                  </th>

                  <th className="px-5 py-4">
                    Stage
                  </th>

                  <th className="px-5 py-4">
                    Groups
                  </th>

                  <th className="px-5 py-4 text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody>
                {lessons.map((lesson) => (
                  <tr
                    key={lesson.id}
                    className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/40"
                  >
                    <td className="px-5 py-4 text-zinc-400">
                      #{lesson.id}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() =>
                          router.push(
                            `/content-admin/reading/lessons/${lesson.id}`,
                          )
                        }
                        className="text-left font-semibold hover:text-red-400 transition"
                      >
                        {lesson.title}
                      </button>
                    </td>

                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-sm">
                        Part {lesson.part}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-sm">
                        Stage {lesson.difficulty}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-zinc-300">
                      {lesson._count?.reading_lesson_groups ?? 0}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            router.push(
                              `/content-admin/reading/lessons/${lesson.id}`,
                            )
                          }
                          className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm"
                        >
                          Groups
                        </button>

                        <button
                          onClick={() =>
                            openEdit(lesson)
                          }
                          className="px-3 py-2 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-sm"
                        >
                          Sửa
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(lesson)
                          }
                          className="px-3 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 text-sm"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            disabled={page <= 1}
            onClick={() =>
              setPage((value) => value - 1)
            }
            className="px-4 py-2 rounded-lg bg-zinc-800 disabled:opacity-30"
          >
            ← Trước
          </button>

          <span className="text-zinc-400">
            Trang {page} / {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() =>
              setPage((value) => value + 1)
            }
            className="px-4 py-2 rounded-lg bg-zinc-800 disabled:opacity-30"
          >
            Sau →
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">
                  {editingLesson
                    ? "Sửa bài Reading"
                    : "Thêm bài Reading"}
                </h2>

                <p className="text-sm text-zinc-500 mt-1">
                  Thông tin cơ bản của bài học
                </p>
              </div>

              <button
                onClick={closeModal}
                className="text-zinc-500 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-5">
              {/* TITLE */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Tên bài *
                </label>

                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                    })
                  }
                  placeholder="Ví dụ: Part 5 - Incomplete Sentences"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              {/* PART + STAGE */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Part *
                  </label>

                  <select
                    value={form.part}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        part: e.target.value,
                      })
                    }
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none"
                  >
                    {Array.from(
                      { length: 3 },
                      (_, i) => i + 5,
                    ).map((value) => (
                      <option
                        key={value}
                        value={value}
                      >
                        Part {value}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Stage *
                  </label>

                  <select
                    value={form.difficulty}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        difficulty: e.target.value,
                      })
                    }
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none"
                  >
                    {Array.from(
                      { length: 5 },
                      (_, i) => i + 1,
                    ).map((value) => (
                      <option
                        key={value}
                        value={value}
                      >
                        Stage {value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DISPLAY ORDER */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Thứ tự hiển thị
                </label>

                <input
                  type="number"
                  min={0}
                  value={form.displayOrder}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      displayOrder: Math.max(0, Number(e.target.value)),
                    })
                  }
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Mô tả
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  placeholder="Mô tả bài học Reading..."
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={closeModal}
                disabled={saving}
                className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50"
              >
                Hủy
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 font-semibold"
              >
                {saving
                  ? "Đang lưu..."
                  : editingLesson
                    ? "Lưu thay đổi"
                    : "Thêm bài"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
