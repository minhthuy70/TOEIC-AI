"use client";

import { useEffect, useState } from "react";

type Category = {
  id: number;
  name: string;
  stage: number;
};

type GrammarLesson = {
  id: number;
  categoryId: number;
  title: string;
  content: string | null;
  displayOrder: number;
  testId: number | null;
  createdAt: string;
  updatedAt: string;

  category: {
    id: number;
    name: string;
    stage: number;
  };

  tests: {
    id: number;
    title: string;
  } | null;

  _count: {
    progresses: number;
  };
};

type LessonResponse = {
  items: GrammarLesson[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type CategoryResponse = {
  items: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type LessonForm = {
  categoryId: number;
  title: string;
  content: string;
  displayOrder: number;
  testId: number | null;
};

const API_URL = "http://localhost:3001";

const EMPTY_FORM: LessonForm = {
  categoryId: 0,
  title: "",
  content: "",
  displayOrder: 0,
  testId: null,
};

export default function GrammarLessonsPage() {
  const [items, setItems] = useState<GrammarLesson[]>(
    [],
  );

  const [categories, setCategories] = useState<Category[]>(
    [],
  );

  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] =
    useState("");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [showForm, setShowForm] = useState(false);

  const [formMode, setFormMode] =
    useState<"create" | "edit">("create");

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<LessonForm>(EMPTY_FORM);

  const [saving, setSaving] = useState(false);

  const limit = 10;

  async function loadCategories() {
    try {
      setLoadingCategories(true);

      const token =
        localStorage.getItem("accessToken");

      const res = await fetch(
        `${API_URL}/admin/grammar/categories?page=1&limit=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data: CategoryResponse =
        await res.json();

      if (!res.ok) {
        throw new Error(
          "Không thể tải danh mục ngữ pháp",
        );
      }

      setCategories(data.items);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Không thể tải danh mục",
      );
    } finally {
      setLoadingCategories(false);
    }
  }

  async function loadLessons(
    currentPage = page,
    currentSearch = search,
    currentCategoryId = categoryId,
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

      if (currentCategoryId) {
        params.set(
          "categoryId",
          currentCategoryId,
        );
      }

      const token =
        localStorage.getItem("accessToken");

      const res = await fetch(
        `${API_URL}/admin/grammar/lessons?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message ||
            "Không thể tải bài học",
        );
      }

      const result: LessonResponse = data;

      setItems(result.items);
      setTotal(result.total);
      setPage(result.page);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Không thể tải bài học",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
    loadLessons(1);
  }, []);

  function updateForm(
    field: keyof LessonForm,
    value: string | number | null,
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function openCreateForm() {
    setFormMode("create");
    setEditingId(null);

    setForm({
      ...EMPTY_FORM,
      categoryId:
        categories.length > 0
          ? categories[0].id
          : 0,
    });

    setShowForm(true);
  }

  async function openEditForm(
    item: GrammarLesson,
  ) {
    try {
      const token =
        localStorage.getItem("accessToken");

      const res = await fetch(
        `${API_URL}/admin/grammar/lessons/${item.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message ||
            "Không thể tải bài học",
        );
      }

      setFormMode("edit");
      setEditingId(item.id);

      setForm({
        categoryId: data.categoryId,
        title: data.title || "",
        content: data.content || "",
        displayOrder:
          data.displayOrder ?? 0,
        testId: data.testId ?? null,
      });

      setShowForm(true);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Không thể tải bài học",
      );
    }
  }

  async function handleSave() {
    if (!form.categoryId) {
      alert("Vui lòng chọn danh mục");
      return;
    }

    if (!form.title.trim()) {
      alert("Vui lòng nhập tiêu đề bài học");
      return;
    }

    if (
      !Number.isInteger(form.displayOrder) ||
      form.displayOrder < 0
    ) {
      alert("Display order không hợp lệ");
      return;
    }

    try {
      setSaving(true);

      const token =
        localStorage.getItem("accessToken");

      const url =
        formMode === "create"
          ? `${API_URL}/admin/grammar/lessons`
          : `${API_URL}/admin/grammar/lessons/${editingId}`;

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
        body: JSON.stringify({
          categoryId: form.categoryId,
          title: form.title,
          content: form.content,
          displayOrder: form.displayOrder,
          testId: form.testId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message ||
            "Không thể lưu bài học",
        );
      }

      alert(
        formMode === "create"
          ? "Thêm bài học thành công"
          : "Cập nhật bài học thành công",
      );

      setShowForm(false);
      setEditingId(null);
      setForm({ ...EMPTY_FORM });

      await loadLessons(page);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Không thể lưu bài học",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteLesson(
    item: GrammarLesson,
  ) {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa bài học "${item.title}"?\n\nTiến độ học của người dùng đối với bài học này cũng sẽ bị xóa.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const token =
        localStorage.getItem("accessToken");

      const res = await fetch(
        `${API_URL}/admin/grammar/lessons/${item.id}`,
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
            "Không thể xóa bài học",
        );
      }

      alert("Xóa bài học thành công");

      const nextPage =
        items.length === 1 && page > 1
          ? page - 1
          : page;

      await loadLessons(nextPage);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Không thể xóa bài học",
      );
    }
  }

  function handleSearch() {
    setPage(1);

    loadLessons(
      1,
      search,
      categoryId,
    );
  }

  function handleReset() {
    setSearch("");
    setCategoryId("");
    setPage(1);

    setTimeout(() => {
      loadLessons(1, "", "");
    }, 0);
  }

  function goToPage(newPage: number) {
    if (
      newPage < 1 ||
      newPage > totalPages
    ) {
      return;
    }

    setPage(newPage);

    loadLessons(
      newPage,
      search,
      categoryId,
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-8">

      {/* Header */}
      <div className="mb-8">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>
            <h1 className="text-3xl font-bold">
              Bài học ngữ pháp
            </h1>

            <p className="text-zinc-400 mt-2">
              Quản lý nội dung bài học ngữ pháp TOEIC
            </p>
          </div>

          <button
            onClick={openCreateForm}
            disabled={loadingCategories}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 px-5 py-3 rounded-xl font-semibold transition"
          >
            + Thêm bài học
          </button>

        </div>

      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-zinc-400 text-sm">
            Tổng bài học
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
            Tiến độ học
          </p>

          <p className="text-3xl font-bold mt-2">
            {items.reduce(
              (sum, item) =>
                sum +
                item._count.progresses,
              0,
            )}
          </p>
        </div>

      </div>

      {/* Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="md:col-span-2">

            <label className="block text-sm text-zinc-400 mb-2">
              Tìm kiếm
            </label>

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="Tên bài học hoặc nội dung..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
            />

          </div>

          <div>

            <label className="block text-sm text-zinc-400 mb-2">
              Danh mục
            </label>

            <select
              value={categoryId}
              onChange={(e) => {
                const value =
                  e.target.value;

                setCategoryId(value);
                setPage(1);

                loadLessons(
                  1,
                  search,
                  value,
                );
              }}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
            >

              <option value="">
                Tất cả danh mục
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    Stage {category.stage} —{" "}
                    {category.name}
                  </option>
                ),
              )}

            </select>

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

                <th className="px-5 py-4">
                  ID
                </th>

                <th className="px-5 py-4">
                  Bài học
                </th>

                <th className="px-5 py-4">
                  Danh mục
                </th>

                <th className="px-5 py-4">
                  Thứ tự
                </th>

                <th className="px-5 py-4">
                  Test
                </th>

                <th className="px-5 py-4">
                  Người học
                </th>

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
                    Không tìm thấy bài học
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
                        {item.title}
                      </div>

                      {item.content && (
                        <div className="text-sm text-zinc-500 mt-1 max-w-md truncate">
                          {item.content}
                        </div>
                      )}

                    </td>

                    <td className="px-5 py-4">

                      <div className="text-sm">
                        {item.category.name}
                      </div>

                      <div className="text-xs text-red-400 mt-1">
                        Stage {item.category.stage}
                      </div>

                    </td>

                    <td className="px-5 py-4 text-zinc-400">
                      {item.displayOrder}
                    </td>

                    <td className="px-5 py-4">

                      {item.tests ? (
                        <span className="inline-flex px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm">
                          #{item.tests.id}
                        </span>
                      ) : (
                        <span className="text-zinc-600">
                          Chưa có
                        </span>
                      )}

                    </td>

                    <td className="px-5 py-4 text-zinc-400">
                      {item._count.progresses}
                    </td>

                    <td className="px-5 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() =>
                            openEditForm(item)
                          }
                          className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm"
                        >
                          Sửa
                        </button>

                        <button
                          onClick={() =>
                            deleteLesson(item)
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
              Trang {page} / {totalPages} ·{" "}
              {total} bài học
            </p>

            <div className="flex items-center gap-2">

              <button
                disabled={page === 1}
                onClick={() =>
                  goToPage(page - 1)
                }
                className="px-3 py-2 rounded-lg bg-zinc-800 disabled:opacity-40 hover:bg-zinc-700"
              >
                ←
              </button>

              {Array.from(
                {
                  length: Math.min(
                    totalPages,
                    7,
                  ),
                },
                (_, index) => index + 1,
              ).map((number) => (
                <button
                  key={number}
                  onClick={() =>
                    goToPage(number)
                  }
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
                disabled={
                  page === totalPages
                }
                onClick={() =>
                  goToPage(page + 1)
                }
                className="px-3 py-2 rounded-lg bg-zinc-800 disabled:opacity-40 hover:bg-zinc-700"
              >
                →
              </button>

            </div>

          </div>
        )}

      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">

          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">

            <div className="sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold">
                  {formMode === "create"
                    ? "Thêm bài học ngữ pháp"
                    : `Sửa bài học #${editingId}`}
                </h2>

                <p className="text-sm text-zinc-500 mt-1">
                  {formMode === "create"
                    ? "Tạo bài học mới"
                    : "Cập nhật nội dung bài học"}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowForm(false)
                }
                className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
              >
                ✕
              </button>

            </div>

            <div className="p-6 space-y-5">

              {/* Category */}
              <div>

                <label className="block text-sm text-zinc-400 mb-2">
                  Danh mục{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <select
                  value={form.categoryId}
                  onChange={(e) =>
                    updateForm(
                      "categoryId",
                      Number(
                        e.target.value,
                      ),
                    )
                  }
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
                >

                  <option value={0}>
                    Chọn danh mục
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        Stage {category.stage} —{" "}
                        {category.name}
                      </option>
                    ),
                  )}

                </select>

              </div>

              {/* Title */}
              <div>

                <label className="block text-sm text-zinc-400 mb-2">
                  Tiêu đề{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <input
                  value={form.title}
                  onChange={(e) =>
                    updateForm(
                      "title",
                      e.target.value,
                    )
                  }
                  placeholder="Ví dụ: Thì hiện tại đơn"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
                />

              </div>

              {/* Content */}
              <div>

                <label className="block text-sm text-zinc-400 mb-2">
                  Nội dung bài học
                </label>

                <textarea
                  value={form.content}
                  onChange={(e) =>
                    updateForm(
                      "content",
                      e.target.value,
                    )
                  }
                  rows={12}
                  placeholder="Nhập nội dung bài học..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 resize-y"
                />

              </div>

              {/* Order + Test */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>

                  <label className="block text-sm text-zinc-400 mb-2">
                    Display order
                  </label>

                  <input
                    type="number"
                    min={0}
                    value={form.displayOrder}
                    onChange={(e) =>
                      updateForm(
                        "displayOrder",
                        Number(
                          e.target.value,
                        ),
                      )
                    }
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
                  />

                </div>

                <div>

                  <label className="block text-sm text-zinc-400 mb-2">
                    Test ID
                  </label>

                  <input
                    type="number"
                    min={1}
                    value={
                      form.testId ?? ""
                    }
                    onChange={(e) => {
                      const value =
                        e.target.value;

                      updateForm(
                        "testId",
                        value === ""
                          ? null
                          : Number(value),
                      );
                    }}
                    placeholder="Để trống nếu chưa có test"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
                  />

                </div>

              </div>

            </div>

            <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-800 px-6 py-4 flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setShowForm(false)
                }
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 font-semibold"
              >
                {saving
                  ? "Đang lưu..."
                  : formMode === "create"
                    ? "Thêm bài học"
                    : "Lưu thay đổi"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}