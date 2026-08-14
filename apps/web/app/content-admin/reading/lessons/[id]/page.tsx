"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_URL = "http://localhost:3001";

type ReadingOption = {
  id: number;
  question_id: number;
  option_key: string;
  option_text: string;
  is_correct: boolean | null;
  display_order: number | null;
};

type ReadingQuestion = {
  id: number;
  group_id: number;
  question_number: number;
  question_text: string;
  explanation: string | null;
  knowledge: string | null;
  display_order: number | null;
  reading_options: ReadingOption[];
};

type ReadingGroup = {
  id: number;
  lesson_id: number;
  title: string | null;
  passage: string | null;
  knowledge: string | null;
  display_order: number | null;
  reading_questions: ReadingQuestion[];
};

type ReadingLesson = {
  id: number;
  title: string;
  part: number;
  displayOrder: number | null;
  description: string | null;
  stage: number | null;
  createdAt: string;
  updatedAt: string;
};

type FormOption = {
  id?: number;
  optionKey: string;
  optionText: string;
  isCorrect: boolean;
};

type FormQuestion = {
  id?: number;
  questionNumber: number;
  questionText: string;
  explanation: string;
  knowledge: string;
  options: FormOption[];
};

type GroupForm = {
  title: string;
  passage: string;
  knowledge: string;
  displayOrder: string;
  questions: FormQuestion[];
};

const createEmptyOption = (
  key: string,
): FormOption => ({
  optionKey: key,
  optionText: "",
  isCorrect: false,
});

const createEmptyQuestion = (
  questionNumber: number,
): FormQuestion => ({
  questionNumber,
  questionText: "",
  explanation: "",
  knowledge: "",
  options: [
    createEmptyOption("A"),
    createEmptyOption("B"),
    createEmptyOption("C"),
    createEmptyOption("D"),
  ],
});

const createEmptyForm = (): GroupForm => ({
  title: "",
  passage: "",
  knowledge: "",
  displayOrder: "0",
  questions: [createEmptyQuestion(1)],
});

export default function ReadingLessonGroupsPage() {
  const params = useParams();
  const router = useRouter();

  const lessonId = Number(params.id);

  const [lesson, setLesson] =
    useState<ReadingLesson | null>(null);

  const [groups, setGroups] =
    useState<ReadingGroup[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingGroups, setLoadingGroups] =
    useState(false);

  const [showModal, setShowModal] =
    useState(false);

  const [editingGroup, setEditingGroup] =
    useState<ReadingGroup | null>(null);

  const [form, setForm] =
    useState<GroupForm>(createEmptyForm());

  const [saving, setSaving] = useState(false);

  const getToken = () => {
    return localStorage.getItem("accessToken");
  };

  const loadLesson = async () => {
    try {
      const token = getToken();

      const res = await fetch(
        `${API_URL}/admin/reading/lessons/${lessonId}`,
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
            "Không thể tải bài Reading",
        );
      }

      setLesson(data);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Không thể tải bài Reading",
      );

      router.push(
        "/content-admin/reading",
      );
    }
  };

  const loadGroups = async () => {
    try {
      setLoadingGroups(true);

      const token = getToken();

      const res = await fetch(
        `${API_URL}/admin/reading/lessons/${lessonId}/groups`,
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
            "Không thể tải group Reading",
        );
      }

      const items = Array.isArray(data)
        ? data
        : data.items || [];

      setGroups(items);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Không thể tải group Reading",
      );
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    if (!Number.isInteger(lessonId) || lessonId <= 0) {
      router.push(
        "/content-admin/reading",
      );
      return;
    }

    const load = async () => {
      setLoading(true);

      await Promise.all([
        loadLesson(),
        loadGroups(),
      ]);

      setLoading(false);
    };

    load();
  }, [lessonId]);

  const openCreate = () => {
    setEditingGroup(null);

    setForm(createEmptyForm());

    setShowModal(true);
  };

  const openEdit = async (group: ReadingGroup) => {
    try {
      const questions =
        group.reading_questions || [];

      const formQuestions: FormQuestion[] =
        questions
          .slice()
          .sort(
            (a, b) =>
              a.question_number - b.question_number,
          )
          .map((question) => {
            const options =
              question.reading_options || [];

            const optionMap = new Map(
              options.map((option) => [
                option.option_key.toUpperCase(),
                option,
              ]),
            );

            const labels = ["A", "B", "C", "D"];

            return {
              id: question.id,

              questionNumber:
                question.question_number,

              questionText:
                question.question_text || "",

              explanation:
                question.explanation || "",

              knowledge:
                question.knowledge || "",

              options: labels.map((label) => {
                const option = optionMap.get(label);

                if (!option) {
                  return createEmptyOption(label);
                }

                return {
                  id: option.id,

                  optionKey:
                    option.option_key,

                  optionText:
                    option.option_text || "",

                  isCorrect:
                    option.is_correct === true,
                };
              }),
            };
          });

      if (formQuestions.length === 0) {
        formQuestions.push(createEmptyQuestion(1));
      }

      setEditingGroup(group);

      setForm({
        title: group.title || "",
        passage: group.passage || "",
        knowledge: group.knowledge || "",
        displayOrder: String(
          group.display_order ?? 0,
        ),
        questions: formQuestions,
      });

      setShowModal(true);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Không thể mở group",
      );
    }
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);

    setEditingGroup(null);

    setForm(createEmptyForm());
  };

  const addQuestion = () => {
    if (form.questions.length >= 10) {
      alert(
        "Một group tối đa 10 câu hỏi",
      );
      return;
    }

    const nextNumber =
      form.questions.length + 1;

    setForm((current) => ({
      ...current,

      questions: [
        ...current.questions,

        createEmptyQuestion(nextNumber),
      ],
    }));
  };

  const removeQuestion = (
    questionIndex: number,
  ) => {
    if (form.questions.length <= 1) {
      alert(
        "Group phải có ít nhất 1 câu hỏi",
      );
      return;
    }

    const questions =
      form.questions.filter(
        (_, index) =>
          index !== questionIndex,
      );

    const normalized =
      questions.map(
        (question, index) => ({
          ...question,
          questionNumber: index + 1,
        }),
      );

    setForm((current) => ({
      ...current,
      questions: normalized,
    }));
  };

  const updateQuestion = (
    questionIndex: number,
    field: keyof FormQuestion,
    value: string | number,
  ) => {
    setForm((current) => ({
      ...current,

      questions: current.questions.map(
        (question, index) =>
          index === questionIndex
            ? {
                ...question,
                [field]: value,
              }
            : question,
      ),
    }));
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    field: keyof FormOption,
    value: string | boolean,
  ) => {
    setForm((current) => ({
      ...current,

      questions: current.questions.map(
        (question, qIndex) => {
          if (qIndex !== questionIndex) {
            return question;
          }

          return {
            ...question,

            options:
              question.options.map(
                (option, oIndex) =>
                  oIndex === optionIndex
                    ? {
                        ...option,
                        [field]: value,
                      }
                    : option,
              ),
          };
        },
      ),
    }));
  };

  const selectCorrectOption = (
    questionIndex: number,
    optionIndex: number,
  ) => {
    setForm((current) => ({
      ...current,

      questions: current.questions.map(
        (question, qIndex) => {
          if (qIndex !== questionIndex) {
            return question;
          }

          return {
            ...question,

            options:
              question.options.map(
                (option, oIndex) => ({
                  ...option,
                  isCorrect:
                    oIndex === optionIndex,
                }),
              ),
          };
        },
      ),
    }));
  };

  const validateForm = () => {
    if (!form.questions.length) {
      alert(
        "Group phải có ít nhất 1 câu hỏi",
      );
      return false;
    }

    if (form.questions.length > 10) {
      alert(
        "Một group tối đa 10 câu hỏi",
      );
      return false;
    }

    for (
      let qIndex = 0;
      qIndex < form.questions.length;
      qIndex++
    ) {
      const question =
        form.questions[qIndex];

      if (!question.questionText.trim()) {
        alert(
          `Câu ${qIndex + 1} chưa có nội dung`,
        );
        return false;
      }

      if (question.options.length !== 4) {
        alert(
          `Câu ${qIndex + 1} phải có 4 option`,
        );
        return false;
      }

      for (
        let oIndex = 0;
        oIndex < question.options.length;
        oIndex++
      ) {
        if (
          !question.options[
            oIndex
          ].optionText.trim()
        ) {
          alert(
            `Câu ${qIndex + 1}: Option ${
              question.options[oIndex]
                .optionKey
            } chưa có nội dung`,
          );

          return false;
        }
      }

      const correctCount =
        question.options.filter(
          (option) =>
            option.isCorrect,
        ).length;

      if (correctCount !== 1) {
        alert(
          `Câu ${qIndex + 1} phải có đúng 1 đáp án đúng`,
        );
        return false;
      }
    }

    const displayOrder =
      Number(form.displayOrder);

    if (
      !Number.isInteger(displayOrder) ||
      displayOrder < 0
    ) {
      alert(
        "Display order không hợp lệ",
      );
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const token = getToken();

      const payload = {
        lessonId,

        title:
          form.title.trim() || null,

        passage:
          form.passage.trim() || null,

        knowledge:
          form.knowledge.trim() || null,

        displayOrder:
          Number(form.displayOrder),

        questions:
          form.questions.map(
            (question, questionIndex) => ({
              ...(question.id
                ? {
                    id: question.id,
                  }
                : {}),

              questionNumber:
                questionIndex + 1,

              questionText:
                question.questionText.trim(),

              explanation:
                question.explanation.trim() ||
                null,

              knowledge:
                question.knowledge.trim() ||
                null,

              displayOrder:
                questionIndex,

              options:
                question.options.map(
                  (
                    option,
                    optionIndex,
                  ) => ({
                    ...(option.id
                      ? {
                          id: option.id,
                        }
                      : {}),

                    optionKey:
                      option.optionKey,

                    optionText:
                      option.optionText.trim(),

                    isCorrect:
                      option.isCorrect,

                    displayOrder:
                      optionIndex,
                  }),
                ),
            }),
          ),
      };

      const url = editingGroup
        ? `${API_URL}/admin/reading/groups/${editingGroup.id}`
        : `${API_URL}/admin/reading/lessons/${lessonId}/groups`;

      const method = editingGroup
        ? "PATCH"
        : "POST";

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
          Array.isArray(data?.message)
            ? data.message.join(", ")
            : data?.message ||
                data?.error ||
                "Không thể lưu group",
        );
      }

      alert(
        editingGroup
          ? "Cập nhật group thành công"
          : "Thêm group thành công",
      );

      closeModal();

      await loadGroups();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Không thể lưu group",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    group: ReadingGroup,
  ) => {
    const confirmed =
      window.confirm(
        `Bạn có chắc muốn xóa group "${
          group.title || `Group #${group.id}`
        }"?\n\nToàn bộ câu hỏi và option trong group sẽ bị xóa.`,
      );

    if (!confirmed) return;

    try {
      const token = getToken();

      const res = await fetch(
        `${API_URL}/admin/reading/groups/${group.id}`,
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
            "Không thể xóa group",
        );
      }

      alert(
        data?.message ||
          "Xóa group thành công",
      );

      await loadGroups();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Không thể xóa group",
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p className="text-zinc-400">
          Đang tải bài Reading...
        </p>
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <button
              onClick={() =>
                router.push(
                  "/content-admin/reading",
                )
              }
              className="text-zinc-500 hover:text-white mb-4 transition"
            >
              ← Quay lại Reading
            </button>

            <h1 className="text-3xl font-bold">
              {lesson.title}
            </h1>

            <div className="flex items-center gap-3 mt-3">
              <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-sm">
                Part {lesson.part}
              </span>

              <span className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-sm">
                Stage {lesson.stage}
              </span>

              <span className="text-zinc-500 text-sm">
                {groups.length} group
              </span>
            </div>
          </div>

          <button
            onClick={openCreate}
            className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 font-semibold transition"
          >
            + Thêm Group
          </button>
        </div>

        {loadingGroups ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center text-zinc-400">
            Đang tải group...
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">
              📕
            </div>

            <h2 className="text-xl font-semibold mb-2">
              Chưa có Group
            </h2>

            <p className="text-zinc-500 mb-6">
              Hãy thêm group đầu tiên cho bài
              Reading này.
            </p>

            <button
              onClick={openCreate}
              className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 font-semibold"
            >
              + Thêm Group
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {groups.map((group, groupIndex) => (
                <div
                  key={group.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
                >
                  <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center font-bold">
                          {groupIndex + 1}
                        </span>

                        <div>
                          <h2 className="font-semibold text-lg">
                            {group.title ||
                              `Group ${
                                groupIndex + 1
                              }`}
                          </h2>

                          <p className="text-sm text-zinc-500">
                            {group.reading_questions?.length || 0} câu hỏi
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          openEdit(group)
                        }
                        className="px-4 py-2 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-sm"
                      >
                        Sửa
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(group)
                        }
                        className="px-4 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 text-sm"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    {group.knowledge && (
                      <div className="mb-5 px-4 py-3 rounded-xl bg-zinc-800/60 text-sm text-zinc-400">
                        <span className="font-semibold text-zinc-300">
                          Kiến thức:
                        </span>{" "}
                        {group.knowledge}
                      </div>
                    )}

                    {group.passage && (
                      <div className="mb-5 px-4 py-3 rounded-xl bg-zinc-800/60 text-sm text-zinc-300">
                        <span className="font-semibold text-zinc-400">
                          Passage:
                        </span>{" "}
                        {group.passage}
                      </div>
                    )}

                    <div className="space-y-5">
                     {(group.reading_questions || []).map(
  (question) => (
                          <div
                            key={
                              question.id
                            }
                            className="border border-zinc-800 rounded-xl p-5"
                          >
                            <div className="flex gap-4">
                              <div className="w-8 h-8 shrink-0 rounded-lg bg-zinc-800 flex items-center justify-center text-sm font-bold">
                                {
                                  question.question_number
                                }
                              </div>

                              <div className="flex-1">
                                <p className="font-medium">
                                  {
                                    question.question_text
                                  }
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
  {(question.reading_options || [])
    .slice()
    .sort(
      (a, b) =>
        (a.display_order ?? 0) -
        (b.display_order ?? 0),
    )
    .map((option) => (
      <div
        key={option.id}
        className={`px-4 py-3 rounded-lg border ${
          option.is_correct
            ? "border-green-500/50 bg-green-500/10 text-green-300"
            : "border-zinc-800 bg-zinc-800/50 text-zinc-400"
        }`}
      >
        <span className="font-semibold mr-2">
          {option.option_key}.
        </span>

        {option.option_text}

        {option.is_correct && (
          <span className="ml-2 text-xs text-green-400">
            ✓
          </span>
        )}
      </div>
    ))}
</div>

                                {question.explanation && (
                                  <div className="mt-4 text-sm text-zinc-500">
                                    <span className="text-zinc-400 font-semibold">
                                      Giải thích:
                                    </span>{" "}
                                    {
                                      question.explanation
                                    }
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 overflow-y-auto">
          <div className="min-h-screen flex items-start justify-center p-6">
            <div className="w-full max-w-5xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
              <div className="sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800 px-6 py-5 rounded-t-2xl flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    {editingGroup
                      ? "Sửa Group"
                      : "Thêm Group"}
                  </h2>

                  <p className="text-sm text-zinc-500 mt-1">
                    Quản lý Group, bài đọc và câu hỏi
                  </p>
                </div>

                <button
                  onClick={closeModal}
                  disabled={saving}
                  className="text-zinc-500 hover:text-white text-2xl disabled:opacity-50"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-8">
                <div>
                  <h3 className="font-semibold mb-4">
                    Thông tin Group
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">
                        Tên Group
                      </label>

                      <input
                        value={form.title}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            title:
                              e.target.value,
                          })
                        }
                        placeholder="Ví dụ: Passage 1"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">
                        Thứ tự hiển thị
                      </label>

                      <input
                        type="number"
                        min={0}
                        value={
                          form.displayOrder
                        }
                        onChange={(e) =>
                          setForm({
                            ...form,
                            displayOrder: Math.max(0, Number(e.target.value)),
                          })
                        }
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
                      />
                    </div>

                  </div>

                  <div className="mt-5">
                    <label className="block text-sm text-zinc-400 mb-2">
                      Passage (Bài đọc)
                    </label>

                    <textarea
                      value={form.passage}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          passage:
                            e.target.value,
                        })
                      }
                      rows={6}
                      placeholder="Nhập nội dung bài đọc..."
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 resize-none"
                    />
                  </div>

                  <div className="mt-5">
                    <label className="block text-sm text-zinc-400 mb-2">
                      Kiến thức
                    </label>

                    <textarea
                      value={form.knowledge}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          knowledge:
                            e.target.value,
                        })
                      }
                      rows={3}
                      placeholder="Kiến thức cần chú ý..."
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 resize-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-semibold">
                        Câu hỏi
                      </h3>

                      <p className="text-sm text-zinc-500 mt-1">
                        Tối đa 10 câu / Group
                      </p>
                    </div>

                    <button
                      onClick={addQuestion}
                      disabled={
                        form.questions
                          .length >= 10
                      }
                      className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                    >
                      + Thêm câu
                    </button>
                  </div>

                  <div className="space-y-6">
                    {form.questions.map(
                      (
                        question,
                        questionIndex,
                      ) => (
                        <div
                          key={
                            question.id ??
                            `new-${questionIndex}`
                          }
                          className="border border-zinc-800 rounded-2xl p-5"
                        >
                          <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                              <span className="w-9 h-9 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center font-bold">
                                {questionIndex +
                                  1}
                              </span>

                              <div>
                                <h4 className="font-semibold">
                                  Câu{" "}
                                  {questionIndex +
                                    1}
                                </h4>

                                {question.id && (
                                  <p className="text-xs text-zinc-600">
                                    Question ID:{" "}
                                    {
                                      question.id
                                    }
                                  </p>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() =>
                                removeQuestion(
                                  questionIndex,
                                )
                              }
                              className="text-sm text-red-400 hover:text-red-300"
                            >
                              Xóa câu
                            </button>
                          </div>

                          <div>
                            <label className="block text-sm text-zinc-400 mb-2">
                              Nội dung câu hỏi *
                            </label>

                            <textarea
                              value={
                                question.questionText
                              }
                              onChange={(e) =>
                                updateQuestion(
                                  questionIndex,
                                  "questionText",
                                  e.target.value,
                                )
                              }
                              rows={3}
                              placeholder="Nhập nội dung câu hỏi..."
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 resize-none"
                            />
                          </div>

                          <div className="mt-5">
                            <label className="block text-sm text-zinc-400 mb-3">
                              Đáp án *
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {question.options.map(
                                (
                                  option,
                                  optionIndex,
                                ) => (
                                  <div
                                    key={
                                      option.id ??
                                      `${questionIndex}-${optionIndex}`
                                    }
                                    className={`border rounded-xl p-4 ${
                                      option.isCorrect
                                        ? "border-green-500/50 bg-green-500/5"
                                        : "border-zinc-800 bg-zinc-800/30"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          selectCorrectOption(
                                            questionIndex,
                                            optionIndex,
                                          )
                                        }
                                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${
                                          option.isCorrect
                                            ? "bg-green-600 text-white"
                                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                        }`}
                                        title="Chọn đáp án đúng"
                                      >
                                        {
                                          option.optionKey
                                        }
                                      </button>

                                      <input
                                        value={
                                          option.optionText
                                        }
                                        onChange={(
                                          e,
                                        ) =>
                                          updateOption(
                                            questionIndex,
                                            optionIndex,
                                            "optionText",
                                            e.target
                                              .value,
                                          )
                                        }
                                        placeholder={`Đáp án ${option.optionKey}`}
                                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 outline-none focus:border-red-500"
                                      />
                                    </div>

                                    <div className="flex items-center justify-between mt-3">
                                      <span className="text-xs text-zinc-600">
                                        {option.id
                                          ? `Option ID: ${option.id}`
                                          : "Option mới"}
                                      </span>

                                      {option.isCorrect && (
                                        <span className="text-xs text-green-400 font-medium">
                                          ✓ Đáp án đúng
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>

                          <div className="mt-5">
                            <label className="block text-sm text-zinc-400 mb-2">
                              Giải thích
                            </label>

                            <textarea
                              value={
                                question.explanation
                              }
                              onChange={(e) =>
                                updateQuestion(
                                  questionIndex,
                                  "explanation",
                                  e.target.value,
                                )
                              }
                              rows={3}
                              placeholder="Giải thích đáp án..."
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 resize-none"
                            />
                          </div>

                          <div className="mt-5">
                            <label className="block text-sm text-zinc-400 mb-2">
                              Kiến thức câu hỏi
                            </label>

                            <input
                              value={
                                question.knowledge
                              }
                              onChange={(e) =>
                                updateQuestion(
                                  questionIndex,
                                  "knowledge",
                                  e.target.value,
                                )
                              }
                              placeholder="Ví dụ: Reading comprehension"
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
                            />
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-800 px-6 py-5 rounded-b-2xl flex justify-end gap-3">
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
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 font-semibold"
                >
                  {saving
                    ? "Đang lưu..."
                    : editingGroup
                      ? "Lưu thay đổi"
                      : "Thêm Group"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}