"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTests, createTest, updateTest, deleteTest, type Test, type TestForm } from "@/services/admin";

const EMPTY_FORM: TestForm = {
  title: "",
  description: "",
  duration: 120,
  total_questions: 100,
  is_active: true,
};

export default function TestsAdminPage() {
  const router = useRouter();
  const [items, setItems] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<TestForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const limit = 10;

  async function loadTests(currentPage = page, currentSearch = search) {
    try {
      setLoading(true);

      const data = await getTests({
        page: currentPage,
        limit,
        search: currentSearch,
      });

      setItems(data.items);
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error(error);
      alert("Không thể tải danh sách đề thi");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveTest() {
    if (!form.title.trim()) {
      alert("Vui lòng nhập tiêu đề đề thi");
      return;
    }

    try {
      setSaving(true);

      if (formMode === "create") {
        await createTest(form);
        alert("Thêm đề thi thành công");
      } else {
        await updateTest(editingId!, form);
        alert("Cập nhật đề thi thành công");
      }

      setShowForm(false);
      setForm({ ...EMPTY_FORM });
      setEditingId(null);

      await loadTests(page);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Không thể lưu đề thi");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadTests(1);
  }, []);

  function handleSearch() {
    setPage(1);
    loadTests(1, search);
  }

  function handleReset() {
    setSearch("");
    setPage(1);
    setTimeout(() => {
      loadTests(1);
    }, 0);
  }

  function goToPage(newPage: number) {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    loadTests(newPage);
  }

  function editTest(item: Test) {
    setFormMode("edit");
    setEditingId(item.id);

    setForm({
      title: item.title || "",
      description: item.description || "",
      duration: item.duration || 120,
      total_questions: item.total_questions || 100,
      is_active: item.is_active !== false,
    });

    setShowForm(true);
  }

  async function deleteTestItem(id: number) {
    const item = items.find((item) => item.id === id);

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa đề thi "${item?.title || `#${id}`} "?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteTest(id);
      alert("Xóa đề thi thành công");
      await loadTests(page);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Không thể xóa đề thi");
    }
  }

  function updateForm(field: keyof TestForm, value: string | number | boolean) {
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

  function viewTestDetails(id: number) {
    router.push(`/admin/tests/${id}/question-groups`);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("vi-VN");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Quản lý đề thi
            </h1>

            <p className="text-zinc-400 mt-2">
              Quản lý toàn bộ đề thi TOEIC trong hệ thống
            </p>
          </div>

          <button
            onClick={openCreateForm}
            className="bg-red-600 hover:bg-red-700 px-5 py-3 rounded-xl font-semibold transition"
          >
            + Thêm đề thi
          </button>
        </div>
      </div>

      

      {/* Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
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
              placeholder="Nhập tiêu đề đề thi..."
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
        {loading ? (
          <div className="p-12 text-center text-zinc-400">
            Đang tải danh sách đề thi...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-zinc-400">
            Không tìm thấy đề thi nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 text-left">
                  <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                    ID
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                    Tiêu đề
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                    Mô tả
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                    Thời lượng
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                    Số câu hỏi
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                    Trạng thái
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                    Ngày tạo
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/40 transition"
                  >
                    {/* ID */}
                    <td className="px-6 py-5 text-zinc-400">
                      #{item.id}
                    </td>

                    {/* Title */}
                    <td className="px-6 py-5 font-medium text-white">
                      {item.title || "—"}
                    </td>

                    {/* Description */}
                    <td className="px-6 py-5 text-zinc-300 max-w-xs truncate">
                      {item.description || "—"}
                    </td>

                    {/* Duration */}
                    <td className="px-6 py-5 text-zinc-300">
                      {item.duration ? `${item.duration} phút` : "—"}
                    </td>

                    {/* Total questions */}
                    <td className="px-6 py-5 text-zinc-300">
                      {item.total_questions || "—"}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                          item.is_active
                            ? "bg-green-500/10 text-green-400 border-green-500/30"
                            : "bg-zinc-800 text-zinc-300 border-zinc-700"
                        }`}
                      >
                        {item.is_active ? "Hoạt động" : "Không hoạt động"}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="px-6 py-5 text-zinc-400">
                      {formatDate(item.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5">
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewTestDetails(item.id)}
                          className="px-3 py-1.5 rounded-lg bg-green-600/10 text-green-400 border border-green-600/30 hover:bg-green-600/20 transition text-sm"
                        >
                          Quản lý
                        </button>

                        <button
                          onClick={() => editTest(item)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-600/30 hover:bg-blue-600/20 transition text-sm"
                        >
                          Sửa
                        </button>

                        <button
                          onClick={() => deleteTestItem(item.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-600/10 text-red-400 border border-red-600/30 hover:bg-red-600/20 transition text-sm"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Trước
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => goToPage(pageNum)}
              className={`px-4 py-2 rounded-lg transition ${
                page === pageNum
                  ? "bg-red-600 text-white"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Sau
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {formMode === "create"
                    ? "Thêm đề thi"
                    : `Sửa đề thi #${editingId}`}
                </h2>

                <p className="text-sm text-zinc-500 mt-1">
                  {formMode === "create"
                    ? "Thêm một đề thi mới vào hệ thống"
                    : "Cập nhật thông tin đề thi"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>

                <input
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                  placeholder="Ví dụ: TOEIC Full Test 1"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Mô tả
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  rows={3}
                  placeholder="Mô tả chi tiết về đề thi..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 resize-none"
                />
              </div>

              {/* Duration + Total Questions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Thời lượng (phút)
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={form.duration}
                    onChange={(e) => updateForm("duration", Math.max(1, Number(e.target.value)))}
                    placeholder="120"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Số câu hỏi
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={form.total_questions}
                    onChange={(e) => updateForm("total_questions", Math.max(1, Number(e.target.value)))}
                    placeholder="100"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) => updateForm("is_active", e.target.checked)}
                  className="w-5 h-5 rounded bg-zinc-800 border-zinc-700 text-red-600 focus:ring-red-500"
                />

                <label htmlFor="is_active" className="text-sm text-zinc-400">
                  Đề thi đang hoạt động
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-800 px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition disabled:opacity-50"
              >
                Hủy
              </button>

              <button
                onClick={handleSaveTest}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 transition disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : formMode === "create" ? "Thêm đề thi" : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}