"use client";

import { useEffect, useState } from "react";
import { getTests, createTest, updateTest, deleteTest, getTest, type Test, type TestForm } from "@/services/admin";

const EMPTY_FORM: TestForm = {
  title: "",
  description: "",
  duration: 120,
  total_questions: 100,
  is_active: true,
};

export default function TestsAdminPage() {
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
  const [viewingTest, setViewingTest] = useState<Test | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

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

  async function viewTestDetails(id: number) {
    try {
      const testDetails = await getTest(id);
      setViewingTest(testDetails);
      setExpandedGroups(new Set()); // Reset expanded groups
      setShowViewModal(true);
    } catch (error) {
      console.error(error);
      alert("Không thể tải chi tiết đề thi");
    }
  }

  function toggleGroup(groupId: number) {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("vi-VN");
  }

  function getPartLabel(part: number | null) {
    if (!part) return "—";
    const partLabels: Record<number, string> = {
      1: "Part 1 - Photographs",
      2: "Part 2 - Question-Response",
      3: "Part 3 - Conversations",
      4: "Part 4 - Talks",
      5: "Part 5 - Incomplete Sentences",
      6: "Part 6 - Text Completion",
      7: "Part 7 - Reading Comprehension",
    };
    return partLabels[part] || `Part ${part}`;
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
                          Xem
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
                    value={form.duration}
                    onChange={(e) => updateForm("duration", Number(e.target.value))}
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
                    value={form.total_questions}
                    onChange={(e) => updateForm("total_questions", Number(e.target.value))}
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

      {/* View Details Modal */}
      {showViewModal && viewingTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Chi tiết đề thi: {viewingTest.title || `#${viewingTest.id}`}
                </h2>

                <p className="text-sm text-zinc-500 mt-1">
                  {viewingTest.description || "Không có mô tả"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Test Info */}
            <div className="p-6 border-b border-zinc-800">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-800 rounded-xl p-4">
                  <p className="text-xs text-zinc-500">Thời lượng</p>
                  <p className="text-lg font-bold mt-1">{viewingTest.duration ? `${viewingTest.duration} phút` : "—"}</p>
                </div>

                <div className="bg-zinc-800 rounded-xl p-4">
                  <p className="text-xs text-zinc-500">Tổng câu hỏi</p>
                  <p className="text-lg font-bold mt-1">{viewingTest.total_questions || "—"}</p>
                </div>

                <div className="bg-zinc-800 rounded-xl p-4">
                  <p className="text-xs text-zinc-500">Số nhóm câu hỏi</p>
                  <p className="text-lg font-bold mt-1">{viewingTest.question_groups?.length || 0}</p>
                </div>

                <div className="bg-zinc-800 rounded-xl p-4">
                  <p className="text-xs text-zinc-500">Trạng thái</p>
                  <p className="text-lg font-bold mt-1">
                    {viewingTest.is_active ? (
                      <span className="text-green-400">Hoạt động</span>
                    ) : (
                      <span className="text-zinc-400">Không hoạt động</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Question Groups */}
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Nhóm câu hỏi ({viewingTest.question_groups?.length || 0})</h3>

              {viewingTest.question_groups && viewingTest.question_groups.length > 0 ? (
                <div className="space-y-4">
                  {viewingTest.question_groups.map((group) => (
                    <div key={group.id} className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden">
                      {/* Group Header */}
                      <div
                        className="p-4 cursor-pointer hover:bg-zinc-700/50 transition"
                        onClick={() => toggleGroup(group.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-zinc-400">
                              {expandedGroups.has(group.id) ? "▼" : "▶"}
                            </span>

                            <div>
                              <span className="font-semibold text-white">
                                {getPartLabel(group.part)}
                              </span>

                              {group.title && (
                                <span className="text-zinc-400 ml-2">- {group.title}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-zinc-400">
                            <span>{group.questions?.length || 0} câu hỏi</span>

                            {group.group_type && (
                              <span className="px-2 py-1 bg-zinc-700 rounded text-xs">
                                {group.group_type}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Group Metadata */}
                        {expandedGroups.has(group.id) && (
                          <div className="mt-3 pt-3 border-t border-zinc-700 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            {group.display_order !== null && (
                              <div>
                                <span className="text-zinc-500">Thứ tự:</span>
                                <span className="text-zinc-300 ml-1">{group.display_order}</span>
                              </div>
                            )}

                            {group.audio_start_time !== null && (
                              <div>
                                <span className="text-zinc-500">Bắt đầu audio:</span>
                                <span className="text-zinc-300 ml-1">{group.audio_start_time}s</span>
                              </div>
                            )}

                            {group.audio_end_time !== null && (
                              <div>
                                <span className="text-zinc-500">Kết thúc audio:</span>
                                <span className="text-zinc-300 ml-1">{group.audio_end_time}s</span>
                              </div>
                            )}

                            {group.knowledge && (
                              <div>
                                <span className="text-zinc-500">Kiến thức:</span>
                                <span className="text-zinc-300 ml-1">{group.knowledge}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Expanded Content */}
                      {expandedGroups.has(group.id) && (
                        <div className="border-t border-zinc-700 p-4">
                          {/* Passage/Content */}
                          {group.passage && (
                            <div className="mb-4 p-3 bg-zinc-900 rounded-lg">
                              <p className="text-xs text-zinc-500 mb-2">Đoạn văn/bài đọc:</p>
                              <p className="text-sm text-zinc-300 whitespace-pre-wrap">{group.passage}</p>
                            </div>
                          )}

                          {/* Media */}
                          {(group.image_url || group.audio_url) && (
                            <div className="mb-4 flex gap-3">
                              {group.image_url && (
                                <div className="flex-1">
                                  <p className="text-xs text-zinc-500 mb-2">Hình ảnh:</p>
                                  <img
                                    src={group.image_url}
                                    alt="Group image"
                                    className="w-full max-h-48 object-cover rounded-lg"
                                  />
                                </div>
                              )}

                              {group.audio_url && (
                                <div className="flex-1">
                                  <p className="text-xs text-zinc-500 mb-2">Audio:</p>
                                  <audio
                                    src={group.audio_url}
                                    controls
                                    className="w-full"
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Questions */}
                          {group.questions && group.questions.length > 0 && (
                            <div className="space-y-3">
                              <p className="text-sm font-semibold text-zinc-400">
                                Câu hỏi ({group.questions.length})
                              </p>

                              {group.questions.map((question) => (
                                <div
                                  key={question.id}
                                  className="bg-zinc-900 border border-zinc-700 rounded-lg p-4"
                                >
                                  {/* Question Header */}
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-start gap-2">
                                      <span className="text-red-400 font-semibold">
                                        Câu {question.question_number || "?"}
                                      </span>

                                      <span className="text-sm text-zinc-300 flex-1">
                                        {question.question_text || "Không có nội dung câu hỏi"}
                                      </span>
                                    </div>

                                    {question.correct_answer && (
                                      <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs">
                                        Đáp án: {question.correct_answer}
                                      </span>
                                    )}
                                  </div>

                                  {/* Options */}
                                  {question.options && question.options.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                      <p className="text-xs text-zinc-500">Đáp án chọn:</p>

                                      {question.options
                                        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                                        .map((option) => (
                                          <div
                                            key={option.id}
                                            className={`flex items-center gap-2 p-2 rounded border ${
                                              option.is_correct
                                                ? "bg-green-600/10 border-green-600/30"
                                                : "bg-zinc-800 border-zinc-700"
                                            }`}
                                          >
                                            <span className="font-semibold text-zinc-400 w-6">
                                              {option.option_label || "?"}
                                            </span>

                                            <span className="text-sm text-zinc-300 flex-1">
                                              {option.option_text || "—"}
                                            </span>

                                            {option.is_correct && (
                                              <span className="text-green-400 text-xs">✓ Đúng</span>
                                            )}
                                          </div>
                                        ))}
                                    </div>
                                  )}

                                  {/* Explanation */}
                                  {question.explanation && (
                                    <div className="mt-3 p-2 bg-blue-600/10 border border-blue-600/30 rounded">
                                      <p className="text-xs text-blue-400 mb-1">Giải thích:</p>
                                      <p className="text-sm text-zinc-300">{question.explanation}</p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* No Questions */}
                          {(!group.questions || group.questions.length === 0) && (
                            <div className="text-center py-8 text-zinc-500">
                              Chưa có câu hỏi trong nhóm này
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-zinc-500">
                  Chưa có nhóm câu hỏi nào cho đề thi này
                </div>
              )}

              {/* Grammar Lessons */}
              {viewingTest.grammar_lessons && viewingTest.grammar_lessons.length > 0 && (
                <div className="mt-6 pt-6 border-t border-zinc-800">
                  <h3 className="text-lg font-bold mb-4">Bài học ngữ pháp liên quan ({viewingTest.grammar_lessons.length})</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {viewingTest.grammar_lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 flex items-center gap-3"
                      >
                        <span className="text-zinc-400">📖</span>
                        <span className="text-sm text-zinc-300">{lesson.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-800 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}