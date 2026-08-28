"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getQuestionGroups,
  createQuestionGroup,
  updateQuestionGroup,
  deleteQuestionGroup,
  getTest,
  type QuestionGroup,
  type QuestionGroupForm,
  type Test,
} from "@/services/admin";
import { X } from "lucide-react";

const EMPTY_FORM: QuestionGroupForm = {
  part: 1,
  title: "",
  passage: "",
  image_url: "",
  audio_url: "",
  display_order: 0,
  group_type: "",
  audio_start_time: null,
  audio_end_time: null,
  knowledge: "",
};

export default function QuestionGroupsPage() {
  const router = useRouter();
  const params = useParams();
  const testId = Number(params.testId);

  const [test, setTest] = useState<Test | null>(null);
  const [items, setItems] = useState<QuestionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<QuestionGroupForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const limit = 10;

  async function loadTest() {
    try {
      const testData = await getTest(testId);
      setTest(testData);
    } catch (error) {
      console.error(error);
      alert("Không thể tải thông tin đề thi");
      router.push("/admin/tests");
    }
  }

  async function loadQuestionGroups(currentPage = page) {
    try {
      setLoading(true);

      const data = await getQuestionGroups(testId, {
        page: currentPage,
        limit,
      });

      setItems(data.items);
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error(error);
      alert("Không thể tải danh sách nhóm câu hỏi");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveQuestionGroup() {
    if (!form.title?.trim()) {
      alert("Vui lòng nhập tiêu đề nhóm câu hỏi");
      return;
    }

    try {
      setSaving(true);

      if (formMode === "create") {
        await createQuestionGroup(testId, form);
        alert("Thêm nhóm câu hỏi thành công");
      } else {
        await updateQuestionGroup(editingId!, form);
        alert("Cập nhật nhóm câu hỏi thành công");
      }

      setShowForm(false);
      setForm({ ...EMPTY_FORM });
      setEditingId(null);

      await loadQuestionGroups(page);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Không thể lưu nhóm câu hỏi");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!testId || isNaN(testId)) {
      router.push("/admin/tests");
      return;
    }

    loadTest();
    loadQuestionGroups(1);
  }, [testId]);

  function goToPage(newPage: number) {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    loadQuestionGroups(newPage);
  }

  function editQuestionGroup(item: QuestionGroup) {
    setFormMode("edit");
    setEditingId(item.id);

    setForm({
      part: item.part || undefined,
      title: item.title || "",
      passage: item.passage || "",
      image_url: item.image_url || "",
      audio_url: item.audio_url || "",
      display_order: item.display_order || undefined,
      group_type: item.group_type || "",
      audio_start_time: item.audio_start_time || undefined,
      audio_end_time: item.audio_end_time || undefined,
      knowledge: item.knowledge || "",
    });

    setShowForm(true);
  }

  async function deleteQuestionGroupItem(id: number) {
    const item = items.find((item) => item.id === id);

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa nhóm câu hỏi "${item?.title || `#${id}`} "?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteQuestionGroup(id);
      alert("Xóa nhóm câu hỏi thành công");
      await loadQuestionGroups(page);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Không thể xóa nhóm câu hỏi");
    }
  }

  function updateForm(field: keyof QuestionGroupForm, value: string | number | undefined) {
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

  function goToQuestions(groupId: number) {
    router.push(`/admin/tests/${testId}/question-groups/${groupId}/questions`);
  }

  function getPartLabel(part: number | null) {
    if (!part) return "—";
    const partLabels: Record<number, string> = {
      1: "Part 1",
      2: "Part 2",
      3: "Part 3",
      4: "Part 4",
      5: "Part 5",
      6: "Part 6",
      7: "Part 7",
    };
    return partLabels[part] || `Part ${part}`;
  }

  if (loading && !test) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-8 flex items-center justify-center">
        <div className="text-zinc-400">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => router.push("/admin/tests")}
                className="text-zinc-400 hover:text-white transition"
              >
                ← Quay lại
              </button>

              <span className="text-zinc-600">/</span>

              <h1 className="text-3xl font-bold">
                Quản lý nhóm câu hỏi
              </h1>
            </div>

            <p className="text-zinc-400 mt-2">
              Đề thi: {test?.title || `#${testId}`}
            </p>
          </div>

          <button
            onClick={openCreateForm}
            className="bg-red-600 hover:bg-red-700 px-5 py-3 rounded-xl font-semibold transition"
          >
            + Thêm nhóm câu hỏi
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-zinc-400 text-sm">
            Tổng nhóm câu hỏi
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

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-zinc-400">
            Đang tải danh sách nhóm câu hỏi...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-zinc-400">
            Không tìm thấy nhóm câu hỏi nào.
            <button
              onClick={openCreateForm}
              className="ml-3 text-red-400 hover:text-red-300 underline"
            >
              Thêm nhóm câu hỏi mới
            </button>
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
                    Part
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                    Tiêu đề
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                    Loại
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                    Số câu hỏi
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                    Thứ tự
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

                    {/* Part */}
                    <td className="px-6 py-5 text-zinc-300">
                      {getPartLabel(item.part)}
                    </td>

                    {/* Title */}
                    <td className="px-6 py-5 font-medium text-white max-w-xs truncate">
                      {item.title || "—"}
                    </td>

                    {/* Type */}
                    <td className="px-6 py-5 text-zinc-300">
                      {item.group_type || "—"}
                    </td>

                    {/* Questions count */}
                    <td className="px-6 py-5 text-zinc-300">
                      {item._count?.questions || 0}
                    </td>

                    {/* Display order */}
                    <td className="px-6 py-5 text-zinc-300">
                      {item.display_order ?? "—"}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5">
                      <div className="flex gap-2">
                        <button
                          onClick={() => goToQuestions(item.id)}
                          className="px-3 py-1.5 rounded-lg bg-green-600/10 text-green-400 border border-green-600/30 hover:bg-green-600/20 transition text-sm"
                        >
                          Câu hỏi
                        </button>

                        <button
                          onClick={() => editQuestionGroup(item)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-600/30 hover:bg-blue-600/20 transition text-sm"
                        >
                          Sửa
                        </button>

                        <button
                          onClick={() => deleteQuestionGroupItem(item.id)}
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
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {formMode === "create"
                    ? "Thêm nhóm câu hỏi"
                    : `Sửa nhóm câu hỏi #${editingId}`}
                </h2>

                <p className="text-sm text-zinc-500 mt-1">
                  {formMode === "create"
                    ? "Thêm một nhóm câu hỏi mới vào đề thi"
                    : "Cập nhật thông tin nhóm câu hỏi"}
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
              {/* Part + Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Part
                  </label>

                  <select
                    value={form.part || ""}
                    onChange={(e) => updateForm("part", Number(e.target.value))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
                  >
                    <option value="">Chọn Part</option>
                    <option value={1}>Part 1 - Photographs</option>
                    <option value={2}>Part 2 - Question-Response</option>
                    <option value={3}>Part 3 - Conversations</option>
                    <option value={4}>Part 4 - Talks</option>
                    <option value={5}>Part 5 - Incomplete Sentences</option>
                    <option value={6}>Part 6 - Text Completion</option>
                    <option value={7}>Part 7 - Reading Comprehension</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Tiêu đề <span className="text-red-500">*</span>
                  </label>

                  <input
                    value={form.title}
                    onChange={(e) => updateForm("title", e.target.value)}
                    placeholder="Ví dụ: Office Conversations"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Group Type + Display Order */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Loại nhóm
                  </label>

                  <input
                    value={form.group_type}
                    onChange={(e) => updateForm("group_type", e.target.value)}
                    placeholder="Ví dụ: conversation, single_passage"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Thứ tự hiển thị
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.display_order || 0}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      updateForm("display_order", Math.max(0, value));
                    }}
                    placeholder="0"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Passage */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Đoạn văn / Bài đọc
                </label>

                <textarea
                  value={form.passage}
                  onChange={(e) => updateForm("passage", e.target.value)}
                  rows={5}
                  placeholder="Nội dung đoạn văn hoặc bài đọc..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 resize-none"
                />
              </div>

              {/* Image URL + Audio URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    URL hình ảnh
                  </label>

                  <input
                    value={form.image_url}
                    onChange={(e) => updateForm("image_url", e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    URL audio
                  </label>

                  <input
                    value={form.audio_url}
                    onChange={(e) => updateForm("audio_url", e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Audio Times */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Thời gian bắt đầu audio (giây)
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.audio_start_time || ""}
                    onChange={(e) => updateForm("audio_start_time", e.target.value ? Math.max(0, Number(e.target.value)) : undefined)}
                    placeholder="0"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Thời gian kết thúc audio (giây)
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.audio_end_time || ""}
                    onChange={(e) => updateForm("audio_end_time", e.target.value ? Math.max(0, Number(e.target.value)) : undefined)}
                    placeholder="0"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Knowledge */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Kiến thức / Chủ đề
                </label>

                <input
                  value={form.knowledge}
                  onChange={(e) => updateForm("knowledge", e.target.value)}
                  placeholder="Ví dụ: Business meetings, Travel arrangements"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
                />
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
                onClick={handleSaveQuestionGroup}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 transition disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : formMode === "create" ? "Thêm nhóm câu hỏi" : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}