"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
  FileText,
  AlertCircle,
  MoveUp,
  MoveDown,
  ListTodo,
  CheckSquare,
  Square,
  Bell,
  Sparkles,
  Globe,
} from "lucide-react";

interface DailyTask {
  id: number;
  title: string;
  duration: number;
  completed: boolean;
  displayOrder: number;
  reminder: boolean;
  notes: string | null;
  taskDate: string;
}

interface WeeklySchedule {
  id: number;
  startTime: string;
  endTime: string;
  title: string;
  sessionType: string;
}

interface CombinedTimelineResponse {
  success: boolean;
  weeklySchedules: WeeklySchedule[];
  customTasks: DailyTask[];
}

export default function PlannerPage() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [weeklySchedules, setWeeklySchedules] = useState<WeeklySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);

  // Form state
  const [title, setTitle] = useState("Luyện đề TOEIC");
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState("");
  const [reminder, setReminder] = useState(false);

  // Initialize selectedDate with local YYYY-MM-DD
  useEffect(() => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - offset * 60 * 1000);
    const todayStr = localDate.toISOString().split("T")[0];
    setSelectedDate(todayStr);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchDailyData();
    }
  }, [selectedDate]);

  const fetchDailyData = async () => {
    try {
      setLoading(true);
      setError("");

      // 1. Fetch tasks
      const tasksRes = await apiFetch<{ success: boolean; tasks: DailyTask[] }>(
        `/dashboard/planner/tasks?date=${selectedDate}`
      );
      if (tasksRes.success) {
        setTasks(tasksRes.tasks);
      }

      // 2. Fetch timeline
      const timelineRes = await apiFetch<CombinedTimelineResponse>(
        `/dashboard/planner/timeline?date=${selectedDate}`
      );
      if (timelineRes.success) {
        setWeeklySchedules(timelineRes.weeklySchedules);
      }
    } catch (err: any) {
      console.error(err);
      setError("Đã xảy ra lỗi khi tải dữ liệu kế hoạch ngày");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast("");
    }, 3000);
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60 * 1000);
    setSelectedDate(local.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60 * 1000);
    setSelectedDate(local.toISOString().split("T")[0]);
  };

  const handleOpenAddModal = () => {
    setEditingTask(null);
    setTitle("Luyện đề TOEIC");
    setDuration(30);
    setNotes("");
    setReminder(false);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (task: DailyTask) => {
    setEditingTask(task);
    setTitle(task.title);
    setDuration(task.duration);
    setNotes(task.notes || "");
    setReminder(task.reminder);
    setShowAddModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title,
      duration,
      notes,
      reminder,
      taskDate: selectedDate,
    };

    try {
      if (editingTask) {
        // Edit task
        const res = await apiFetch<{ success: boolean; message: string }>(
          `/dashboard/planner/tasks/${editingTask.id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );
        if (res.success) {
          showToast(res.message);
          setShowAddModal(false);
          fetchDailyData();
        }
      } else {
        // Add task
        const res = await apiFetch<{ success: boolean; message: string }>(
          "/dashboard/planner/tasks",
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );
        if (res.success) {
          showToast(res.message);
          setShowAddModal(false);
          fetchDailyData();
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast("Không thể lưu nhiệm vụ. Vui lòng thử lại!");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa nhiệm vụ này khỏi kế hoạch ngày?")) {
      return;
    }

    try {
      const res = await apiFetch<{ success: boolean; message: string }>(
        `/dashboard/planner/tasks/${id}`,
        {
          method: "DELETE",
        }
      );
      if (res.success) {
        showToast(res.message);
        fetchDailyData();
      }
    } catch (err: any) {
      console.error(err);
      showToast("Xóa nhiệm vụ thất bại");
    }
  };

  const handleToggleCompleted = async (task: DailyTask) => {
    try {
      const res = await apiFetch<{ success: boolean; message: string }>(
        `/dashboard/planner/tasks/${task.id}`,
        {
          method: "PUT",
          body: JSON.stringify({ completed: !task.completed }),
        }
      );
      if (res.success) {
        showToast(task.completed ? "Đã khôi phục trạng thái nhiệm vụ" : "Đã hoàn thành nhiệm vụ! 🎉");
        fetchDailyData();
      }
    } catch (err: any) {
      console.error(err);
      showToast("Cập nhật trạng thái nhiệm vụ thất bại");
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const reordered = [...tasks];
    const temp = reordered[index];
    reordered[index] = reordered[index - 1];
    reordered[index - 1] = temp;
    await submitNewOrder(reordered);
  };

  const handleMoveDown = async (index: number) => {
    if (index === tasks.length - 1) return;
    const reordered = [...tasks];
    const temp = reordered[index];
    reordered[index] = reordered[index + 1];
    reordered[index + 1] = temp;
    await submitNewOrder(reordered);
  };

  const submitNewOrder = async (orderedList: DailyTask[]) => {
    // Optimistic UI update
    setTasks(orderedList);
    try {
      const res = await apiFetch<{ success: boolean; message: string }>(
        "/dashboard/planner/tasks/reorder",
        {
          method: "POST",
          body: JSON.stringify({
            taskIds: orderedList.map((t) => t.id),
          }),
        }
      );
      if (res.success) {
        showToast(res.message);
      }
    } catch (err: any) {
      console.error(err);
      showToast("Sắp xếp lại nhiệm vụ thất bại");
      fetchDailyData();
    }
  };

  // Date formatting helpers
  const getDayNameString = (dateStr: string): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = date.getDay();
    const dayNames = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    return dayNames[day];
  };

  const formatDateLabel = (dateStr: string): string => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  // Calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const sessionTypesMap: { [key: string]: { label: string; bg: string; text: string } } = {
    vocabulary: { label: "Từ vựng", bg: "bg-emerald-600/10", text: "text-emerald-400" },
    listening: { label: "Luyện nghe", bg: "bg-blue-600/10", text: "text-blue-400" },
    reading: { label: "Luyện đọc", bg: "bg-indigo-600/10", text: "text-indigo-400" },
    grammar: { label: "Ngữ pháp", bg: "bg-orange-600/10", text: "text-orange-400" },
    test: { label: "Thi thử", bg: "bg-purple-600/10", text: "text-purple-400" },
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Sub-tab Navigation */}
      <div className="flex rounded-2xl border border-zinc-800/80 bg-[#121218] p-1 max-w-md">
        <Link
          href="/dashboard/schedule"
          className="flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Lịch biểu tuần</span>
        </Link>
        <Link
          href="/dashboard/planner"
          className="flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold bg-red-600 text-white shadow-md transition"
        >
          <ListTodo className="w-3.5 h-3.5" />
          <span>Kế hoạch ngày</span>
        </Link>
        <Link
          href="/dashboard/calendar"
          className="flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Đồng bộ Lịch</span>
        </Link>
      </div>
      {/* Top Header Selector */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-zinc-800/40 pb-5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-red-500" />
            <span>Kế hoạch ngày & Nhiệm vụ</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Lên danh sách nhiệm vụ tự chọn học tập hàng ngày để hoàn thành mục tiêu điểm số
          </p>
        </div>

        {/* Date Navigator widget */}
        <div className="flex items-center gap-2 bg-[#0d0d14] border border-zinc-800/60 rounded-xl p-1 shadow-inner">
          <button
            onClick={handlePrevDay}
            className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="px-3 py-1 text-center min-w-[160px] select-none">
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
              {getDayNameString(selectedDate)}
            </div>
            <div className="text-xs font-bold text-zinc-200 mt-0.5">
              {formatDateLabel(selectedDate)}
            </div>
          </div>
          <button
            onClick={handleNextDay}
            className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Progress & Custom Tasks List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Card */}
          <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-baseline">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Tiến độ ngày</h4>
              <span className="text-xs font-bold text-zinc-400">{progressPercent}%</span>
            </div>
            <div className="bg-zinc-900/60 rounded-full h-2.5 w-full overflow-hidden border border-zinc-800/40">
              <div
                className="bg-red-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-zinc-500 font-medium">
              {totalTasks > 0
                ? `Đã hoàn thành ${completedTasks} trên ${totalTasks} nhiệm vụ tự chọn trong hôm nay.`
                : "Hôm nay chưa có nhiệm vụ tự chọn nào. Hãy thêm ở dưới nhé!"}
            </p>
          </div>

          {/* Tasks List */}
          <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 space-y-5">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ListTodo className="w-4 h-4 text-zinc-500" />
                <span>Nhiệm vụ tự chọn hôm nay ({totalTasks})</span>
              </h4>
              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-900/10"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm nhiệm vụ</span>
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-red-600/30 border-t-red-500 rounded-full animate-spin"></div>
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-zinc-800/50 rounded-2xl bg-zinc-900/5 space-y-3">
                <div className="w-10 h-10 rounded-full bg-zinc-900/60 flex items-center justify-center text-zinc-500">
                  <ListTodo className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-300">Không có nhiệm vụ tự chọn</p>
                  <p className="text-[10px] text-zinc-500 mt-1 max-w-[240px] mx-auto leading-relaxed">
                    Hãy lên kế hoạch chi tiết cho các đầu việc tự học hôm nay của bạn để duy trì chuỗi học.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task, idx) => (
                  <div
                    key={task.id}
                    className={`
                      p-4 rounded-xl border flex items-center justify-between gap-4 transition-all duration-300
                      ${
                        task.completed
                          ? "bg-zinc-900/10 border-zinc-800/40 opacity-60"
                          : "bg-zinc-900/20 border-zinc-800/80 hover:border-zinc-700/60"
                      }
                    `}
                  >
                    {/* Left Checkbox & Text */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => handleToggleCompleted(task)}
                        className={`mt-0.5 shrink-0 transition-colors ${
                          task.completed ? "text-green-500" : "text-zinc-600 hover:text-zinc-400"
                        }`}
                      >
                        {task.completed ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <h5
                          className={`text-xs font-bold text-zinc-200 truncate ${
                            task.completed ? "line-through text-zinc-500" : ""
                          }`}
                        >
                          {task.title}
                        </h5>
                        <p className="text-[10px] text-zinc-500 mt-0.5 font-medium flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-zinc-600" />
                          <span>Thời lượng: {task.duration} phút</span>
                          {task.reminder && <Bell className="w-3 h-3 text-amber-500 shrink-0 ml-1" />}
                        </p>
                        {task.notes && (
                          <p className="text-[10px] text-zinc-500 bg-[#0d0d14] px-2 py-1 rounded border border-zinc-850 mt-2 leading-relaxed max-w-lg">
                            {task.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Controls (Reorder, Edit, Delete) */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleMoveUp(idx)}
                          disabled={idx === 0}
                          className="p-1 hover:bg-zinc-800 rounded disabled:opacity-20 text-zinc-500 hover:text-zinc-200 transition-colors"
                        >
                          <MoveUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(idx)}
                          disabled={idx === tasks.length - 1}
                          className="p-1 hover:bg-zinc-800 rounded disabled:opacity-20 text-zinc-500 hover:text-zinc-200 transition-colors"
                        >
                          <MoveDown className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="h-6 w-[1px] bg-zinc-800/80 mx-1"></div>

                      <button
                        onClick={() => handleOpenEditModal(task)}
                        className="p-2 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 rounded-xl text-zinc-400 hover:text-white transition-all"
                        title="Sửa nhiệm vụ"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-2 bg-zinc-900/60 hover:bg-red-950 border border-zinc-800/80 rounded-xl text-zinc-400 hover:text-red-400 transition-all"
                        title="Xóa nhiệm vụ"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Combined Timeline View */}
        <div className="space-y-6">
          <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 space-y-6">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-red-500" />
                <span>Trục thời gian hôm nay</span>
              </h4>
              <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
                Tổ hợp lịch học tuần cố định và các nhiệm vụ tự chọn của hôm nay
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-5 h-5 border-2 border-red-600/30 border-t-red-500 rounded-full animate-spin"></div>
              </div>
            ) : weeklySchedules.length === 0 && tasks.length === 0 ? (
              <div className="py-10 text-center opacity-40">
                <p className="text-xs text-zinc-400 font-semibold">Timeline trống</p>
              </div>
            ) : (
              <div className="relative border-l border-zinc-800/80 ml-3 pl-6 space-y-6">
                {/* 1. Render weekly schedule items first (sorted by time) */}
                {weeklySchedules.map((item) => {
                  const tag = sessionTypesMap[item.sessionType] || { label: "Học tập", bg: "bg-zinc-800", text: "text-zinc-400" };
                  return (
                    <div key={`sched-${item.id}`} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-[30px] top-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-red-600/25 ring-4 ring-[#0d0d14]">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      </span>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-bold text-zinc-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            <span>
                              {item.startTime} - {item.endTime}
                            </span>
                          </span>
                          <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${tag.bg} ${tag.text}`}>
                            {tag.label}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-white leading-snug">{item.title}</h5>
                        <p className="text-[9px] text-zinc-500 font-medium">Phiên cố định hàng tuần</p>
                      </div>
                    </div>
                  );
                })}

                {/* 2. Render daily planner tasks next */}
                {tasks.map((task) => (
                  <div key={`task-${task.id}`} className="relative">
                    {/* Timeline dot */}
                    <span className="absolute -left-[30px] top-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-zinc-800/40 ring-4 ring-[#0d0d14]">
                      <span className={`h-1.5 w-1.5 rounded-full ${task.completed ? "bg-green-500" : "bg-zinc-500"}`} />
                    </span>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-bold text-zinc-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          <span>{task.duration} phút</span>
                        </span>
                        <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800/60 text-zinc-400 border border-zinc-700/20">
                          Nhiệm vụ
                        </span>
                        {task.completed && (
                          <span className="text-[8px] font-bold text-green-400 bg-green-950/20 border border-green-800/30 px-1 py-0.2 rounded">
                            Xong
                          </span>
                        )}
                      </div>
                      <h5 className={`text-xs font-bold text-zinc-300 leading-snug ${task.completed ? "line-through text-zinc-500" : ""}`}>
                        {task.title}
                      </h5>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- ADD/EDIT TASK MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0d0d14] border border-zinc-800/80 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-red-500" />
              <span>{editingTask ? "Sửa nhiệm vụ học tập" : "Thêm nhiệm vụ mới"}</span>
            </h3>

            <form onSubmit={handleSave} className="space-y-4 pt-2">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase">Nhiệm vụ tự chọn</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Ôn tập 50 từ vựng Part 1, Luyện đề ETS 2023..."
                  className="w-full bg-zinc-900/40 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Duration */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase">Thời lượng dự kiến (phút)</label>
                <input
                  type="number"
                  required
                  min={5}
                  max={300}
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full bg-zinc-900/40 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase">Ghi chú chi tiết</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Nhập ghi chú hoặc tài liệu ôn tập..."
                  rows={3}
                  className="w-full bg-zinc-900/40 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              {/* Reminder option */}
              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={reminder}
                    onChange={(e) => setReminder(e.target.checked)}
                    className="rounded border-zinc-800 text-red-600 focus:ring-0 w-4 h-4 bg-zinc-900"
                  />
                  <span>Nhắc nhở qua thông báo</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-850">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  {editingTask ? "Lưu thay đổi" : "Thêm nhiệm vụ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Alert Banner */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0d0d14] border border-zinc-800/80 rounded-xl px-4 py-3 shadow-2xl shadow-black/80 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-zinc-200">{toast}</span>
        </div>
      )}
    </div>
  );
}
