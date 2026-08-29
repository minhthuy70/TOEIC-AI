"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  Repeat,
  Bell,
  BellOff,
  BookOpen,
} from "lucide-react";

interface StudySchedule {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  title: string;
  sessionType: string;
  isRecurring: boolean;
  reminder: boolean;
}

interface ScheduleResponse {
  success: boolean;
  schedules: StudySchedule[];
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<StudySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [editingItem, setEditingItem] = useState<StudySchedule | null>(null);

  // Form state
  const [title, setTitle] = useState("Phiên học TOEIC");
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // Monday
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [sessionType, setSessionType] = useState("vocabulary");
  const [isRecurring, setIsRecurring] = useState(true);
  const [reminder, setReminder] = useState(false);

  // Copy form state
  const [copyFromDay, setCopyFromDay] = useState<number>(1);
  const [copyToDays, setCopyToDays] = useState<number[]>([]);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<ScheduleResponse>("/dashboard/schedule");
      if (res.success) {
        setSchedules(res.schedules);
      } else {
        setError("Không thể tải lịch trình học tập");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Đã xảy ra lỗi khi tải lịch học");
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

  const handleOpenAddModal = (day?: number) => {
    setEditingItem(null);
    setTitle("Phiên học TOEIC");
    setDayOfWeek(day !== undefined ? day : 1);
    setStartTime("08:00");
    setEndTime("09:00");
    setSessionType("vocabulary");
    setIsRecurring(true);
    setReminder(false);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (item: StudySchedule) => {
    setEditingItem(item);
    setTitle(item.title);
    setDayOfWeek(item.dayOfWeek);
    setStartTime(item.startTime);
    setEndTime(item.endTime);
    setSessionType(item.sessionType);
    setIsRecurring(item.isRecurring);
    setReminder(item.reminder);
    setShowAddModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (startTime >= endTime) {
      showToast("Lỗi: Giờ bắt đầu phải trước giờ kết thúc!");
      return;
    }

    const payload = {
      dayOfWeek,
      startTime,
      endTime,
      title,
      sessionType,
      isRecurring,
      reminder,
    };

    try {
      if (editingItem) {
        // Edit mode
        const res = await apiFetch<{ success: boolean; message: string }>(
          `/dashboard/schedule/${editingItem.id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );
        if (res.success) {
          showToast(res.message);
          setShowAddModal(false);
          fetchSchedules();
        }
      } else {
        // Add mode
        const res = await apiFetch<{ success: boolean; message: string }>(
          "/dashboard/schedule",
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );
        if (res.success) {
          showToast(res.message);
          setShowAddModal(false);
          fetchSchedules();
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Không thể lưu lịch học. Vui lòng kiểm tra lại!");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phiên học này khỏi lịch trình không?")) {
      return;
    }

    try {
      const res = await apiFetch<{ success: boolean; message: string }>(
        `/dashboard/schedule/${id}`,
        {
          method: "DELETE",
        }
      );
      if (res.success) {
        showToast(res.message);
        fetchSchedules();
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Xóa phiên học thất bại");
    }
  };

  const handleCopySchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (copyToDays.length === 0) {
      showToast("Vui lòng chọn ít nhất một ngày để sao chép đến!");
      return;
    }

    try {
      const res = await apiFetch<{ success: boolean; message: string }>(
        "/dashboard/schedule/copy",
        {
          method: "POST",
          body: JSON.stringify({
            fromDay: copyFromDay,
            toDays: copyToDays,
          }),
        }
      );
      if (res.success) {
        showToast(res.message);
        setShowCopyModal(false);
        setCopyToDays([]);
        fetchSchedules();
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Sao chép lịch trình thất bại");
    }
  };

  const toggleCopyToDay = (day: number) => {
    if (copyToDays.includes(day)) {
      setCopyToDays(copyToDays.filter((d) => d !== day));
    } else {
      setCopyToDays([...copyToDays, day]);
    }
  };

  const handleExportIcs = () => {
    if (schedules.length === 0) {
      showToast("Lịch trình trống, không có gì để xuất!");
      return;
    }

    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//TOEIC-AI//Study Schedule//VN\nCALSCALE:GREGORIAN\n";
    const dayMap: { [key: number]: string } = { 1: "MO", 2: "TU", 3: "WE", 4: "TH", 5: "FR", 6: "SA", 0: "SU" };
    const typeMap: { [key: string]: string } = {
      vocabulary: "Từ vựng",
      listening: "Luyện nghe",
      reading: "Luyện đọc",
      grammar: "Ngữ pháp",
      test: "Thi thử",
    };

    schedules.forEach((s) => {
      const typeLabel = typeMap[s.sessionType] || s.sessionType;
      icsContent += "BEGIN:VEVENT\n";
      icsContent += `SUMMARY:${s.title} [${typeLabel}]\n`;
      icsContent += `DESCRIPTION:Phiên học TOEIC định kỳ - Loại: ${typeLabel}\n`;
      if (s.isRecurring) {
        icsContent += `RRULE:FREQ=WEEKLY;BYDAY=${dayMap[s.dayOfWeek]}\n`;
      }

      // Compute base reference date (nearest day of week starting from today)
      const today = new Date();
      const currentDay = today.getDay();
      let diff = s.dayOfWeek - currentDay;
      const eventDate = new Date();
      eventDate.setDate(today.getDate() + diff);

      const formatDate = (date: Date, timeStr: string) => {
        const [h, m] = timeStr.split(":");
        const d = new Date(date);
        d.setHours(parseInt(h), parseInt(m), 0, 0);
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
      };

      icsContent += `DTSTART:${formatDate(eventDate, s.startTime)}\n`;
      icsContent += `DTEND:${formatDate(eventDate, s.endTime)}\n`;
      icsContent += "END:VEVENT\n";
    });

    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "toeic_study_schedule.ics";
    link.click();
    showToast("Đã tải lịch biểu (.ics). Hãy import vào Google Calendar nhé!");
  };

  const handlePrint = () => {
    window.print();
  };

  const days = [
    { value: 1, label: "Thứ Hai" },
    { value: 2, label: "Thứ Ba" },
    { value: 3, label: "Thứ Tư" },
    { value: 4, label: "Thứ Năm" },
    { value: 5, label: "Thứ Sáu" },
    { value: 6, label: "Thứ Bảy" },
    { value: 0, label: "Chủ Nhật" },
  ];

  const sessionTypes = [
    { value: "vocabulary", label: "Từ vựng", color: "emerald", labelViet: "Từ vựng" },
    { value: "listening", label: "Luyện nghe", color: "blue", labelViet: "Luyện nghe" },
    { value: "reading", label: "Luyện đọc", color: "indigo", labelViet: "Luyện đọc" },
    { value: "grammar", label: "Ngữ pháp", color: "orange", labelViet: "Ngữ pháp" },
    { value: "test", label: "Thi thử", color: "purple", labelViet: "Thi thử" },
  ];

  const getTypeStyleClasses = (type: string) => {
    switch (type) {
      case "vocabulary":
        return "bg-emerald-600/10 text-emerald-400 border-emerald-500/20";
      case "listening":
        return "bg-blue-600/10 text-blue-400 border-blue-500/20";
      case "reading":
        return "bg-indigo-600/10 text-indigo-400 border-indigo-500/20";
      case "grammar":
        return "bg-orange-600/10 text-orange-400 border-orange-500/20";
      case "test":
        return "bg-purple-600/10 text-purple-400 border-purple-500/20";
      default:
        return "bg-zinc-800 text-zinc-300 border-zinc-700/60";
    }
  };

  // Helper to calculate minutes difference
  const calculateDuration = (start: string, end: string): number => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
  };

  // Helper to get total study minutes for a day
  const getDayTotalMinutes = (dayVal: number): number => {
    return schedules
      .filter((s) => s.dayOfWeek === dayVal)
      .reduce((sum, s) => sum + calculateDuration(s.startTime, s.endTime), 0);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-red-600/30 border-t-red-500 rounded-full animate-spin"></div>
        <p className="text-zinc-400 text-sm">Đang tải lịch trình học tập...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-8 text-center max-w-md mx-auto my-10">
        <p className="text-red-400 font-semibold mb-4">Lỗi tải dữ liệu</p>
        <p className="text-zinc-400 text-sm mb-6">{error}</p>
        <button
          onClick={fetchSchedules}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 print-container">
      {/* CSS style overrides to style printing neatly */}
      <style jsx global>{`
        @media print {
          aside,
          header,
          .no-print,
          button,
          .toast-alert {
            display: none !important;
          }
          main,
          .print-container {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
          }
          .print-card-box {
            border: 1px solid #ccc !important;
            background: white !important;
            color: black !important;
          }
          .print-text-dark {
            color: black !important;
          }
          .print-text-muted {
            color: #555 !important;
          }
        }
      `}</style>

      {/* Header controls (No Print) */}
      <div className="flex justify-between items-center flex-wrap gap-4 no-print border-b border-zinc-800/40 pb-5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-red-500" />
            <span>Lịch trình học tập hàng tuần</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Thiết lập khung giờ học tập tối ưu để đạt điểm số TOEIC 900+
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#0d0d14] border border-zinc-800/60 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white transition-all"
            title="In lịch học ra giấy"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In lịch học</span>
          </button>
          <button
            onClick={handleExportIcs}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#0d0d14] border border-zinc-800/60 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white transition-all"
            title="Xuất lịch học dạng .ics"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Calendar (.ics)</span>
          </button>
          <button
            onClick={() => setShowCopyModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#0d0d14] border border-zinc-800/60 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white transition-all"
            title="Sao chép lịch biểu sang ngày khác"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Sao chép ngày</span>
          </button>
          <button
            onClick={() => handleOpenAddModal()}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-900/10"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm phiên học</span>
          </button>
        </div>
      </div>

      {/* Grid columns: Monday to Sunday */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {days.map((day) => {
          const daySchedules = schedules.filter((s) => s.dayOfWeek === day.value);
          const totalMinutes = getDayTotalMinutes(day.value);
          const totalHours = (totalMinutes / 60).toFixed(1);

          return (
            <div
              key={day.value}
              className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-4 flex flex-col justify-between space-y-4 print-card-box min-h-[350px]"
            >
              {/* Day Header */}
              <div className="border-b border-zinc-850 pb-2.5 flex justify-between items-baseline">
                <h4 className="text-xs font-bold text-white print-text-dark">{day.label}</h4>
                <span className="text-[10px] font-semibold text-zinc-500 print-text-muted">
                  {totalMinutes > 0 ? `${totalHours}h` : "—"}
                </span>
              </div>

              {/* Sessions container */}
              <div className="flex-1 space-y-3 overflow-y-auto">
                {daySchedules.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-10 opacity-40 border border-dashed border-zinc-800/50 rounded-xl no-print">
                    <BookOpen className="w-5 h-5 text-zinc-600 mb-1" />
                    <span className="text-[9px] text-zinc-500">Lịch trống</span>
                  </div>
                ) : (
                  daySchedules.map((item) => {
                    const sessionInfo = sessionTypes.find((t) => t.value === item.sessionType);
                    return (
                      <div
                        key={item.id}
                        className={`
                          p-3 rounded-xl border flex flex-col justify-between gap-1.5 transition relative group print-card-box
                          ${getTypeStyleClasses(item.sessionType)}
                        `}
                      >
                        {/* Edit/Delete Actions (No Print, Hover state) */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1 rounded bg-zinc-850 hover:bg-zinc-700 text-zinc-400 hover:text-white"
                            title="Sửa"
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 rounded bg-zinc-850 hover:bg-red-950 text-zinc-400 hover:text-red-400"
                            title="Xóa"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        {/* Title & Category */}
                        <div>
                          <span className="text-[8px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-white/5 block w-max">
                            {sessionInfo?.labelViet || item.sessionType}
                          </span>
                          <h5 className="text-xs font-bold text-white mt-1.5 leading-snug truncate pr-6 print-text-dark">
                            {item.title}
                          </h5>
                        </div>

                        {/* Time Slots */}
                        <div className="flex items-center justify-between text-[9px] text-zinc-400 font-medium pt-1.5 border-t border-white/5 print-text-muted">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {item.startTime} - {item.endTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {item.isRecurring && (
                              <span title="Định kỳ hàng tuần">
                                <Repeat className="w-2.5 h-2.5" />
                              </span>
                            )}
                            {item.reminder ? (
                              <span title="Đang bật nhắc nhở">
                                <Bell className="w-2.5 h-2.5 text-amber-400" />
                              </span>
                            ) : (
                              <span title="Tắt nhắc nhở" className="no-print">
                                <BellOff className="w-2.5 h-2.5 text-zinc-600" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Day Quick Add (No Print) */}
              <button
                onClick={() => handleOpenAddModal(day.value)}
                className="w-full py-1.5 rounded-lg border border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-900/10 hover:bg-zinc-900/30 text-zinc-500 hover:text-zinc-300 text-[10px] font-bold flex items-center justify-center gap-1 no-print transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm phiên</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* --- ADD/EDIT MODAL (No Print) --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm no-print">
          <div className="bg-[#0d0d14] border border-zinc-800/80 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-500" />
              <span>{editingItem ? "Chỉnh sửa phiên học" : "Thêm phiên học mới"}</span>
            </h3>

            <form onSubmit={handleSave} className="space-y-4 pt-2">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase">Tiêu đề học tập</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Ôn tập từ vựng, Luyện nghe Part 3..."
                  className="w-full bg-zinc-900/40 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Grid 2 Column */}
              <div className="grid grid-cols-2 gap-4">
                {/* Session Type */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">Loại bài học</label>
                  <select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value)}
                    className="w-full bg-zinc-900/40 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500"
                  >
                    {sessionTypes.map((t) => (
                      <option key={t.value} value={t.value} className="bg-[#0d0d14]">
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Day of Week */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">Thứ trong tuần</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
                    className="w-full bg-zinc-900/40 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500"
                  >
                    {days.map((d) => (
                      <option key={d.value} value={d.value} className="bg-[#0d0d14]">
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Start/End Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">Giờ bắt đầu</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-zinc-900/40 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">Giờ kết thúc</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-zinc-900/40 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Switches options */}
              <div className="flex items-center gap-6 pt-2 select-none">
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="rounded border-zinc-800 text-red-600 focus:ring-0 w-4 h-4 bg-zinc-900"
                  />
                  <span>Lặp lại hàng tuần</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reminder}
                    onChange={(e) => setReminder(e.target.checked)}
                    className="rounded border-zinc-800 text-red-600 focus:ring-0 w-4 h-4 bg-zinc-900"
                  />
                  <span>Bật nhắc nhở học</span>
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
                  {editingItem ? "Lưu thay đổi" : "Thêm phiên học"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- COPY SCHEDULE MODAL (No Print) --- */}
      {showCopyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm no-print">
          <div className="bg-[#0d0d14] border border-zinc-800/80 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setShowCopyModal(false);
                setCopyToDays([]);
              }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Copy className="w-4 h-4 text-red-500" />
              <span>Sao chép lịch học</span>
            </h3>

            <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
              Nhân bản toàn bộ lịch trình học tập của một ngày sang các ngày được lựa chọn trong tuần. Lưu ý: Lịch cũ ở ngày đến sẽ bị ghi đè hoàn toàn.
            </p>

            <form onSubmit={handleCopySchedule} className="space-y-4 pt-2">
              {/* Copy From */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase">Sao chép từ ngày</label>
                <select
                  value={copyFromDay}
                  onChange={(e) => setCopyFromDay(parseInt(e.target.value))}
                  className="w-full bg-zinc-900/40 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500"
                >
                  {days.map((d) => (
                    <option key={d.value} value={d.value} className="bg-[#0d0d14]">
                      Lịch {d.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Copy To (Multi Select) */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Sao chép đến ngày</label>
                <div className="grid grid-cols-3 gap-2">
                  {days
                    .filter((d) => d.value !== copyFromDay)
                    .map((d) => {
                      const isSelected = copyToDays.includes(d.value);
                      return (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => toggleCopyToDay(d.value)}
                          className={`
                            p-2 rounded-xl border text-[11px] font-bold text-center transition-all select-none
                            ${
                              isSelected
                                ? "bg-red-600/15 text-red-400 border-red-500/30"
                                : "bg-zinc-900/30 text-zinc-400 border-zinc-800 hover:bg-zinc-800/40 hover:text-zinc-200"
                            }
                          `}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-850">
                <button
                  type="button"
                  onClick={() => {
                    setShowCopyModal(false);
                    setCopyToDays([]);
                  }}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Sao chép ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Alert Banner */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0d0d14] border border-zinc-800/80 rounded-xl px-4 py-3 shadow-2xl shadow-black/80 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5 duration-300 toast-alert">
          <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-zinc-200">{toast}</span>
        </div>
      )}
    </div>
  );
}
