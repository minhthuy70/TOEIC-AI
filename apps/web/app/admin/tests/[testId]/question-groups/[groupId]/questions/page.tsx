"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionGroups,
  getTest,
  type Question,
  type QuestionForm,
  type QuestionGroup,
  type Test,
} from "@/services/admin";
import { X, Check, Circle } from "lucide-react";

const EMPTY_OPTION = {
  option_label: "A",
  option_text: "",
  is_correct: false,
  display_order: 0,
};

const EMPTY_FORM: QuestionForm = {
  question_number: 1,
  question_text: "",
  correct_answer: "",
  explanation: "",
  display_order: 0,
  options: [{ ...EMPTY_OPTION }],
};

export default function QuestionsPage() {
  const router = useRouter();
  const params = useParams();
  const testId = Number(params.testId);
  const groupId = Number(params.groupId);

  const [test, setTest] = useState<Test | null>(null);
  const [questionGroup, setQuestionGroup] = useState<QuestionGroup | null>(null);
  const [items, setItems] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<QuestionForm>(EMPTY_FORM);
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

  async function loadQuestionGroup() {
    try {
      const groupsData = await getQuestionGroups(testId, { limit: 100 });
      const group = groupsData.items.find((g) => g.id === groupId);
      
      if (!group) {
        alert("Không tìm thấy nhóm câu hỏi");
        router.push(`/admin/tests/${testId}/question-groups`);
        return;
      }

      setQuestionGroup(group);
    } catch (error) {
      console.error(error);
      alert("Không thể tải thông tin nhóm câu hỏi");
      router.push(`/admin/tests/${testId}/question-groups`);
    }
  }

  async function loadQuestions(currentPage = page) {
    try {
      setLoading(true);

      const data = await getQuestions(groupId, {
        page: currentPage,
        limit,
      });

      setItems(data.items);
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error(error);
      alert("Không thể tải danh sách câu hỏi");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveQuestion() {
    if (!form.question_text?.trim()) {
      alert("Vui lòng nhập nội dung câu hỏi");
      return;
    }

    if (!form.options || form.options.length === 0) {
      alert("Vui lòng thêm ít nhất một đáp án");
      return;
    }

    const hasCorrectAnswer = form.options.some((opt) => opt.is_correct);
    if (!hasCorrectAnswer) {
      alert("Vui lòng chọn ít nhất một đáp án đúng");
      return;
    }

    try {
      setSaving(true);

      // Ensure correct_answer is synced with the selected option
      const correctOption = form.options.find((opt) => opt.is_correct);
      const formData = {
        ...form,
        correct_answer: correctOption?.option_label || form.correct_answer,
      };

      if (formMode === "create") {
        await createQuestion(groupId, formData);
        alert("Thêm câu hỏi thành công");
      } else {
        await updateQuestion(editingId!, formData);
        alert("Cập nhật câu hỏi thành công");
      }

      setShowForm(false);
      setForm({ ...EMPTY_FORM, options: [{ ...EMPTY_OPTION }] });
      setEditingId(null);

      await loadQuestions(page);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Không thể lưu câu hỏi");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!testId || isNaN(testId) || !groupId || isNaN(groupId)) {
      router.push("/admin/tests");
      return;
    }

    loadTest();
    loadQuestionGroup();
    loadQuestions(1);
  }, [testId, groupId]);

  function goToPage(newPage: number) {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    loadQuestions(newPage);
  }

  function editQuestion(item: Question) {
    setFormMode("edit");
    setEditingId(item.id);

    // Find the correct answer from options
    const correctOption = item.options?.find((opt) => opt.is_correct);
    const correctAnswer = correctOption?.option_label || item.correct_answer || "";

    setForm({
      question_number: item.question_number || undefined,
      question_text: item.question_text || "",
      correct_answer: correctAnswer,
      explanation: item.explanation || "",
      display_order: item.display_order || undefined,
      options: item.options?.map((opt) => ({
        option_label: opt.option_label || "",
        option_text: opt.option_text || "",
        is_correct: opt.is_correct || false,
        display_order: opt.display_order || 0,
      })) || [EMPTY_OPTION],
    });

    setShowForm(true);
  }

  async function deleteQuestionItem(id: number) {
    const item = items.find((item) => item.id === id);

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa câu hỏi số ${item?.question_number || `#${id}`} ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteQuestion(id);
      alert("Xóa câu hỏi thành công");
      await loadQuestions(page);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Không thể xóa câu hỏi");
    }
  }

  function updateForm(field: keyof QuestionForm, value: string | number | undefined | Array<any>) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function updateOption(index: number, field: keyof typeof EMPTY_OPTION, value: string | boolean | number) {
    const newOptions = [...(form.options || [])];
    newOptions[index] = {
      ...newOptions[index],
      [field]: value,
    };
    updateForm("options", newOptions);
  }

  function addOption() {
    const currentLength = form.options?.length || 0;
    const labels = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const nextLabel = labels[currentLength] || String.fromCharCode(65 + currentLength); // A=65, B=66, etc.
    
    const newOptions = [...(form.options || []), { 
      ...EMPTY_OPTION, 
      option_label: nextLabel,
      display_order: currentLength 
    }];
    updateForm("options", newOptions);
  }

  function removeOption(index: number) {
    const newOptions = form.options?.filter((_, i) => i !== index) || [];
    updateForm("options", newOptions);
  }

  function openCreateForm() {
    setFormMode("create");
    setEditingId(null);
    setForm({ ...EMPTY_FORM, options: [{ ...EMPTY_OPTION }] });
    setShowForm(true);
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

  if (loading && !test && !questionGroup) {
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
                Đề thi
              </button>

              <span className="text-zinc-600">/</span>

              <button
                onClick={() => router.push(`/admin/tests/${testId}/question-groups`)}
                className="text-zinc-400 hover:text-white transition"
              >
                Nhóm câu hỏi
              </button>

              <span className="text-zinc-600">/</span>

              <h1 className="text-3xl font-bold">
                Quản lý câu hỏi
              </h1>
            </div>

            <p className="text-zinc-400 mt-2">
              Đề thi: {test?.title || `#${testId}`} → Nhóm: {questionGroup?.title || `#${groupId}`} ({getPartLabel(questionGroup?.part || null)})
            </p>
          </div>

          <button
            onClick={openCreateForm}
            className="bg-red-600 hover:bg-red-700 px-5 py-3 rounded-xl font-semibold transition"
          >
            + Thêm câu hỏi
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-zinc-400 text-sm">
            Tổng câu hỏi
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
            Đang tải danh sách câu hỏi...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-zinc-400">
            Không tìm thấy câu hỏi nào.
            <button
              onClick={openCreateForm}
              className="ml-3 text-red-400 hover:text-red-300 underline"
            >
              Thêm câu hỏi mới
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
                    Số câu
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                    Nội dung câu hỏi
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                    Đáp án đúng
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                    Số options
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

                    {/* Question Number */}
                    <td className="px-6 py-5 font-medium text-white">
                      {item.question_number || "—"}
                    </td>

                    {/* Question Text */}
                    <td className="px-6 py-5 text-zinc-300 max-w-md truncate">
                      {item.question_text || "—"}
                    </td>

                    {/* Correct Answer */}
                    <td className="px-6 py-5">
                      {item.correct_answer ? (
                        <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-sm font-semibold">
                          {item.correct_answer}
                        </span>
                      ) : (
                        <span className="text-zinc-500">—</span>
                      )}
                    </td>

                    {/* Options count */}
                    <td className="px-6 py-5 text-zinc-300">
                      {item.options?.length || 0}
                    </td>

                    {/* Display order */}
                    <td className="px-6 py-5 text-zinc-300">
                      {item.display_order ?? "—"}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5">
                      <div className="flex gap-2">
                        <button
                          onClick={() => editQuestion(item)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-600/30 hover:bg-blue-600/20 transition text-sm"
                        >
                          Sửa
                        </button>

                        <button
                          onClick={() => deleteQuestionItem(item.id)}
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
                    ? "Thêm câu hỏi"
                    : `Sửa câu hỏi #${editingId}`}
                </h2>

                <p className="text-sm text-zinc-500 mt-1">
                  {formMode === "create"
                    ? "Thêm một câu hỏi mới vào nhóm câu hỏi"
                    : "Cập nhật thông tin câu hỏi"}
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
              {/* Question Number + Display Order */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Số câu hỏi
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={form.question_number || 1}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      updateForm("question_number", Math.max(1, value));
                    }}
                    placeholder="1"
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

              {/* Question Text */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Nội dung câu hỏi <span className="text-red-500">*</span>
                </label>

                <textarea
                  value={form.question_text}
                  onChange={(e) => updateForm("question_text", e.target.value)}
                  rows={3}
                  placeholder="Nhập nội dung câu hỏi..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 resize-none"
                />
              </div>

              {/* Correct Answer */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Đáp án đúng (A, B, C, D)
                </label>

                <input
                  value={form.correct_answer}
                  onChange={(e) => updateForm("correct_answer", e.target.value.toUpperCase())}
                  placeholder="A"
                  maxLength={1}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 uppercase"
                />
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Giải thích
                </label>

                <textarea
                  value={form.explanation}
                  onChange={(e) => updateForm("explanation", e.target.value)}
                  rows={3}
                  placeholder="Giải thích tại sao đây là đáp án đúng..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 resize-none"
                />
              </div>

              {/* Options */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm text-zinc-400">
                    Đáp án chọn <span className="text-red-500">*</span>
                  </label>

                  <button
                    type="button"
                    onClick={addOption}
                    className="px-3 py-1.5 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-600/30 hover:bg-blue-600/20 transition text-sm"
                  >
                    + Thêm đáp án
                  </button>
                </div>

                <div className="space-y-3">
                  {form.options?.map((option, index) => (
                    <div key={index} className="bg-zinc-800 border border-zinc-700 rounded-xl p-4">
                      <div className="flex items-start gap-4">
                        {/* Option Label & Correct Selection */}
                        <div className="flex flex-col gap-2">
                          <div>
                            <label className="block text-xs text-zinc-500 mb-1">Label</label>
                            <input
                              value={option.option_label}
                              onChange={(e) => {
                                updateOption(index, "option_label", e.target.value.toUpperCase());
                                // Auto-update correct_answer when this option is selected
                                if (option.is_correct) {
                                  updateForm("correct_answer", e.target.value.toUpperCase());
                                }
                              }}
                              placeholder="A"
                              maxLength={1}
                              className="w-16 bg-zinc-900 border border-zinc-600 rounded-lg px-3 py-2 outline-none focus:border-red-500 uppercase text-center"
                            />
                          </div>

                          {/* Styled selection button like listening section */}
                          <button
                            type="button"
                            onClick={() => {
                              // Toggle this option as correct
                              const newOptions = form.options?.map((opt, i) => ({
                                ...opt,
                                is_correct: i === index,
                              })) || [];
                              
                              updateForm("options", newOptions);
                              
                              // Update correct_answer field
                              updateForm("correct_answer", option.option_label || "");
                            }}
                            className={`w-16 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${
                              option.is_correct
                                ? "bg-red-600/20 border-red-500 text-red-400"
                                : "bg-zinc-900 border-zinc-600 text-zinc-400 hover:border-zinc-500"
                            }`}
                          >
                            {option.is_correct ? <Check className="w-4 h-4" /> : <Circle className="w-3.5 h-3.5" />}
                          </button>
                          
                          <span className="text-xs text-zinc-500 text-center">
                            {option.is_correct ? "Đúng" : "Chọn"}
                          </span>
                        </div>

                        {/* Option Text */}
                        <div className="flex-1">
                          <label className="block text-xs text-zinc-500 mb-1">Nội dung</label>
                          <textarea
                            value={option.option_text}
                            onChange={(e) => updateOption(index, "option_text", e.target.value)}
                            rows={2}
                            placeholder="Nội dung đáp án..."
                            className="w-full bg-zinc-900 border border-zinc-600 rounded-lg px-3 py-2 outline-none focus:border-red-500 resize-none"
                          />
                        </div>

                        {/* Display Order & Remove */}
                        <div className="flex flex-col gap-2">
                          <div>
                            <label className="block text-xs text-zinc-500 mb-1">Thứ tự</label>
                            <input
                              type="number"
                              min="0"
                              value={option.display_order}
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                updateOption(index, "display_order", Math.max(0, value));
                              }}
                              placeholder="0"
                              className="w-16 bg-zinc-900 border border-zinc-600 rounded-lg px-3 py-2 outline-none focus:border-red-500 text-center"
                            />
                          </div>

                          {form.options && form.options.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeOption(index)}
                              className="px-2 py-1 rounded-lg bg-red-600/10 text-red-400 border border-red-600/30 hover:bg-red-600/20 transition text-xs"
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                onClick={handleSaveQuestion}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 transition disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : formMode === "create" ? "Thêm câu hỏi" : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}