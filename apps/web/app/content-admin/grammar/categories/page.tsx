"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

type GrammarCategory = {
  id: number;
  name: string;
  description: string | null;
  displayOrder: number;
  stage: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    lessons: number;
  };
};

type CategoryForm = {
  name: string;
  description: string;
  displayOrder: number;
  stage: number;
};

type CategoryResponse = {
  items: GrammarCategory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const API_URL = "http://localhost:3001";

const EMPTY_FORM: CategoryForm = {
  name: "",
  description: "",
  displayOrder: 0,
  stage: 1,
};

export default function GrammarCategoriesPage() {
  const [items, setItems] = useState<GrammarCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] =
    useState<"create" | "edit">("create");

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<CategoryForm>(EMPTY_FORM);

  const [saving, setSaving] = useState(false);

  const limit = 10;

  async function loadCategories(
    currentPage = page,
    currentSearch = search,
    currentStage = stage,
  ) {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      params.set("page", String(currentPage));
      params.set("limit", String(limit));

      if (currentSearch.trim()) {
        params.set("search", currentSearch.trim());
      }

      if (currentStage) {
        params.set("stage", currentStage);
      }

      const token =
        localStorage.getItem("accessToken");

      const res = await fetch(
        `${API_URL}/admin/grammar/categories?${params.toString()}`,
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
            "Không thể tải danh mục ngữ pháp",
        );
      }

      const result: CategoryResponse = data;

      setItems(result.items);
      setTotal(result.total);
      setPage(result.page);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Không thể tải danh mục ngữ pháp",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories(1);
  }, []);

  function updateForm(
    field: keyof CategoryForm,
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

  function openEditForm(item: GrammarCategory) {
    setFormMode("edit");
    setEditingId(item.id);

    setForm({
      name: item.name,
      description: item.description || "",
      displayOrder: item.displayOrder,
      stage: item.stage,
    });

    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      alert("Vui lòng nhập tên danh mục");
      return;
    }

    if (
      !Number.isInteger(form.stage) ||
      form.stage < 1 ||
      form.stage > 5
    ) {
      alert("Stage phải từ 1 đến 5");
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
          ? `${API_URL}/admin/grammar/categories`
          : `${API_URL}/admin/grammar/categories/${editingId}`;

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
            "Không thể lưu danh mục",
        );
      }

      alert(
        formMode === "create"
          ? "Thêm danh mục thành công"
          : "Cập nhật danh mục thành công",
      );

      setShowForm(false);
      setEditingId(null);
      setForm({ ...EMPTY_FORM });

      await loadCategories(page);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Không thể lưu danh mục",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(
    item: GrammarCategory,
  ) {
    if (item._count.lessons > 0) {
      alert(
        `Không thể xóa danh mục này vì đang có ${item._count.lessons} bài học.`,
      );
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa danh mục "${item.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const token =
        localStorage.getItem("accessToken");

      const res = await fetch(
        `${API_URL}/admin/grammar/categories/${item.id}`,
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
            "Không thể xóa danh mục",
        );
      }

      alert("Xóa danh mục thành công");

      const nextPage =
        items.length === 1 && page > 1
          ? page - 1
          : page;

      await loadCategories(nextPage);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Không thể xóa danh mục",
      );
    }
  }

  function handleSearch() {
    setPage(1);

    loadCategories(
      1,
      search,
      stage,
    );
  }

  function handleReset() {
    setSearch("");
    setStage("");
    setPage(1);

    setTimeout(() => {
      loadCategories(1, "", "");
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

    loadCategories(
      newPage,
      search,
      stage,
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-8">

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>
            <h1 className="text-3xl font-bold">
              Danh mục ngữ pháp
            </h1>

            <p className="text-zinc-400 mt-2">
              Quản lý các chủ đề ngữ pháp TOEIC
            </p>
          </div>

          <button
            onClick={openCreateForm}
            className="bg-red-600 hover:bg-red-700 px-5 py-3 rounded-xl font-semibold transition"
          >
            + Thêm danh mục
          </button>

        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-zinc-400 text-sm">
            Tổng danh mục
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
            Bài học
          </p>

          <p className="text-3xl font-bold mt-2">
            {items.reduce(
              (sum, item) =>
                sum + item._count.lessons,
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
              placeholder="Tên danh mục hoặc mô tả..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Chặng
            </label>

            <select
              value={stage}
              onChange={(e) => {
                const value = e.target.value;

                setStage(value);
                setPage(1);

                loadCategories(
                  1,
                  search,
                  value,
                );
              }}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
            >
              <option value="">
                Tất cả chặng
              </option>

              <option value="1">
                Chặng 1 — 0-300
              </option>

              <option value="2">
                Chặng 2 — 300-500
              </option>

              <option value="3">
                Chặng 3 — 500-650
              </option>

              <option value="4">
                Chặng 4 — 650-800
              </option>

              <option value="5">
                Chặng 5 — 800-990
              </option>
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
                  Danh mục
                </th>

                <th className="px-5 py-4">
                  Chặng
                </th>

                <th className="px-5 py-4">
                  Thứ tự
                </th>

                <th className="px-5 py-4">
                  Bài học
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
                    colSpan={6}
                    className="px-5 py-12 text-center text-zinc-400"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-zinc-400"
                  >
                    Không tìm thấy danh mục
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
                        {item.name}
                      </div>

                      {item.description && (
                        <div className="text-sm text-zinc-500 mt-1 max-w-lg truncate">
                          {item.description}
                        </div>
                      )}

                    </td>

                    <td className="px-5 py-4">

                      <span className="inline-flex px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-sm font-medium">
                        Stage {item.stage}
                      </span>

                    </td>

                    <td className="px-5 py-4 text-zinc-400">
                      {item.displayOrder}
                    </td>

                    <td className="px-5 py-4">

                      <span className="text-zinc-300">
                        {item._count.lessons}
                      </span>

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
                            deleteCategory(item)
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
              Trang {page} / {totalPages} · {total} danh mục
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">

          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">

            <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-bold">
                  {formMode === "create"
                    ? "Thêm danh mục ngữ pháp"
                    : `Sửa danh mục #${editingId}`}
                </h2>

                <p className="text-sm text-zinc-500 mt-1">
                  {formMode === "create"
                    ? "Tạo danh mục ngữ pháp mới"
                    : "Cập nhật thông tin danh mục"}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowForm(false)
                }
                className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>

            </div>

            <div className="p-6 space-y-5">

              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Tên danh mục{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <input
                  value={form.name}
                  onChange={(e) =>
                    updateForm(
                      "name",
                      e.target.value,
                    )
                  }
                  placeholder="Ví dụ: Thì hiện tại đơn"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Mô tả
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    updateForm(
                      "description",
                      e.target.value,
                    )
                  }
                  rows={4}
                  placeholder="Mô tả nội dung danh mục..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Chặng
                  </label>

                  <select
                    value={form.stage}
                    onChange={(e) =>
                      updateForm(
                        "stage",
                        Number(
                          e.target.value,
                        ),
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
                        Math.max(0, Number(e.target.value)),
                      )
                    }
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
                  />
                </div>

              </div>

            </div>

            <div className="border-t border-zinc-800 px-6 py-4 flex justify-end gap-3">

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
                    ? "Thêm danh mục"
                    : "Lưu thay đổi"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}