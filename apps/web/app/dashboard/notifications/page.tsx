"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Clock,
  BookOpen,
  Flame,
  Trophy,
  Target,
  Sparkles,
  TrendingUp,
  Settings,
  Trash2,
  Check,
  X,
  RefreshCw,
  Filter,
  ChevronDown,
  BellRing,
  Calendar,
  Zap,
  Mail,
  Eye,
  Send,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Newspaper,
  Tag,
  Award,
  BarChart3,
  FileText,
} from "lucide-react";

interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string | null;
  priority: string;
  category: string;
  actionUrl: string | null;
  actionLabel: string | null;
  metadata: string | null;
  isRead: boolean;
  readAt: string | null;
  expiresAt: string | null;
  scheduledFor: string | null;
  sentAt: string | null;
  createdAt: string;
}

interface NotificationPreferences {
  id: number;
  userId: number;
  reviewDueReminders: boolean;
  studyTimeReminders: boolean;
  testReminders: boolean;
  streakWarnings: boolean;
  goalProgressUpdates: boolean;
  achievementUnlocked: boolean;
  newContentAvailable: boolean;
  dailyProgressReport: boolean;
  weeklyProgressReport: boolean;
  monthlyProgressReport: boolean;
  testResults: boolean;
  streakMilestones: boolean;
  goalAchieved: boolean;
  newsletterSubscription: boolean;
  promotionalContent: boolean;
  weeklySummary: boolean;
  monthlySummary: boolean;
  challengeUpdates: boolean;
  leaderboardChanges: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
}

interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    total: number;
    unreadCount: number;
    hasMore: boolean;
  };
}

interface EmailPreviewData {
  subject: string;
  html: string;
  text: string;
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<"inapp" | "email">("inapp");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Email Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<EmailPreviewData | null>(null);
  const [previewType, setPreviewType] = useState<string>("");
  const [sendingTestType, setSendingTestType] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const pageSize = 20;

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
  }, [page, categoryFilter, unreadOnly]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: (page * pageSize).toString(),
        ...(unreadOnly && { unreadOnly: "true" }),
      });

      const res = await apiFetch<NotificationsResponse>(`/notifications?${params}`);
      if (res.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Đã xảy ra lỗi khi tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const res = await apiFetch<{ success: boolean; data: NotificationPreferences }>("/notifications/preferences");
      if (res.success) {
        setPreferences(res.data);
      }
    } catch (err) {
      console.error("Error fetching preferences:", err);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await apiFetch(`/notifications/read/${notificationId}`, {
        method: "POST",
      });
      fetchNotifications();
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiFetch("/notifications/read-all", {
        method: "POST",
      });
      fetchNotifications();
      showToast("Đã đánh dấu tất cả thông báo là đã đọc");
    } catch (err) {
      console.error("Error marking all as read:", err);
      showToast("Không thể đánh dấu đã đọc tất cả", "error");
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      await apiFetch(`/notifications/${notificationId}`, {
        method: "DELETE",
      });
      fetchNotifications();
      showToast("Đã xóa thông báo");
    } catch (err) {
      console.error("Error deleting notification:", err);
      showToast("Không thể xóa thông báo", "error");
    }
  };

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      const res = await apiFetch<{ success: boolean; data: NotificationPreferences }>("/notifications/preferences", {
        method: "POST",
        body: JSON.stringify(newPreferences),
      });
      if (res.success && res.data) {
        setPreferences(res.data);
        showToast("Đã cập nhật cài đặt thông báo");
      }
    } catch (err) {
      console.error("Error updating preferences:", err);
      showToast("Lỗi khi cập nhật cài đặt", "error");
    }
  };

  // Preview Email
  const handlePreviewEmail = async (type: string) => {
    try {
      setPreviewType(type);
      setPreviewLoading(true);
      setPreviewModalOpen(true);
      const res = await apiFetch<EmailPreviewData>(`/notifications/email-preview/${type}`);
      setPreviewData(res);
    } catch (err: any) {
      console.error("Error fetching email preview:", err);
      showToast("Không thể tải bản xem trước email", "error");
    } finally {
      setPreviewLoading(false);
    }
  };

  // Send Test Email
  const handleSendTestEmail = async (type: string) => {
    try {
      setSendingTestType(type);
      const res = await apiFetch<{ success: boolean; message: string; skipped?: boolean }>(
        "/notifications/email-test",
        {
          method: "POST",
          body: JSON.stringify({ type }),
        }
      );
      if (res.success) {
        showToast(res.message || "Đã gửi email thử nghiệm thành công!");
      } else {
        showToast("Không thể gửi email thử nghiệm", "error");
      }
    } catch (err: any) {
      console.error("Error sending test email:", err);
      showToast(err.message || "Lỗi khi gửi email thử nghiệm", "error");
    } finally {
      setSendingTestType(null);
    }
  };

  const emailNotificationFeatures = [
    {
      key: "dailyProgressReport",
      type: "daily_progress_report",
      title: "Báo cáo tiến độ hàng ngày",
      description: "Tổng hợp từ vựng mới đã học, điểm số thưởng, thời gian học và lời khuyên AI mỗi ngày.",
      icon: <Clock className="w-5 h-5 text-blue-400" />,
      badge: "Hàng ngày",
    },
    {
      key: "weeklyProgressReport",
      type: "weekly_progress_report",
      title: "Báo cáo tiến độ hàng tuần",
      description: "Tổng kết 7 ngày học: số lượng từ ghi nhớ, bài test hoàn thành, duy trì chuỗi và kế hoạch tuần tới.",
      icon: <Calendar className="w-5 h-5 text-indigo-400" />,
      badge: "Hàng tuần",
    },
    {
      key: "monthlyProgressReport",
      type: "monthly_progress_report",
      title: "Báo cáo tiến độ hàng tháng",
      description: "Đánh giá toàn diện sự tiến bộ band điểm TOEIC, tổng kết từ vựng và thành tích nổi bật trong tháng.",
      icon: <BarChart3 className="w-5 h-5 text-purple-400" />,
      badge: "Hàng tháng",
    },
    {
      key: "testResults",
      type: "test_results",
      title: "Kết quả kiểm tra",
      description: "Bảng điểm chi tiết bài Full / Mini Mock Test, phân tích điểm mạnh/yếu phần Nghe và Đọc từ AI.",
      icon: <FileText className="w-5 h-5 text-amber-400" />,
      badge: "Kiểm tra",
    },
    {
      key: "achievementUnlocked",
      type: "achievement_unlocked",
      title: "Thành tích mở khóa",
      description: "Thông báo khi bạn chinh phục danh hiệu mới, huy hiệu vinh danh và nhận điểm thưởng vào hồ sơ.",
      icon: <Trophy className="w-5 h-5 text-yellow-400" />,
      badge: "Thành tích",
    },
    {
      key: "streakMilestones",
      type: "streak_milestones",
      title: "Cột mốc chuỗi",
      description: "Chúc mừng khi vượt qua các mốc chuỗi học tập 3, 7, 14, 30, 60 ngày liên tiếp cùng điểm thưởng.",
      icon: <Flame className="w-5 h-5 text-orange-400" />,
      badge: "Chuỗi học",
    },
    {
      key: "goalAchieved",
      type: "goal_achieved",
      title: "Mục tiêu đạt được",
      description: "Vinh danh khi hoàn thành mục tiêu điểm số hoặc lộ trình học tập, gợi ý mục tiêu kế tiếp.",
      icon: <Target className="w-5 h-5 text-green-400" />,
      badge: "Mục tiêu",
    },
    {
      key: "newsletterSubscription",
      type: "newsletter_subscription",
      title: "Đăng ký bản tin",
      description: "Bản tin học thuật TOEIC AI: Chiến lược giải đề Part 5-7, mẹo tránh bẫy và từ vựng xu hướng mới.",
      icon: <Newspaper className="w-5 h-5 text-cyan-400" />,
      badge: "Bản tin",
    },
    {
      key: "promotionalContent",
      type: "promotional_content",
      title: "Nội dung quảng cáo",
      description: "Nhận thông tin ưu đãi gói Pro 900+, mã giảm giá đặc biệt và sự kiện luyện thi độc quyền.",
      icon: <Tag className="w-5 h-5 text-red-400" />,
      badge: "Ưu đãi",
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "review_due":
        return <BookOpen className="w-4 h-4" />;
      case "study_time":
        return <Clock className="w-4 h-4" />;
      case "streak_warning":
      case "streak_milestones":
        return <Flame className="w-4 h-4" />;
      case "goal_progress":
      case "goal_achieved":
        return <Target className="w-4 h-4" />;
      case "achievement_unlocked":
        return <Trophy className="w-4 h-4" />;
      case "challenge_update":
        return <Sparkles className="w-4 h-4" />;
      case "leaderboard_change":
        return <TrendingUp className="w-4 h-4" />;
      case "weekly_summary":
      case "weekly_progress_report":
      case "monthly_summary":
      case "monthly_progress_report":
      case "daily_progress_report":
        return <Calendar className="w-4 h-4" />;
      case "newsletter_subscription":
        return <Newspaper className="w-4 h-4" />;
      case "promotional_content":
        return <Tag className="w-4 h-4" />;
      case "test_results":
        return <FileText className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-600/10 border-red-500/20 text-red-400";
      case "high":
        return "bg-orange-600/10 border-orange-500/20 text-orange-400";
      case "normal":
        return "bg-blue-600/10 border-blue-500/20 text-blue-400";
      case "low":
        return "bg-zinc-600/10 border-zinc-500/20 text-zinc-400";
      default:
        return "bg-zinc-600/10 border-zinc-500/20 text-zinc-400";
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      study: "Học tập",
      achievement: "Thành tích",
      social: "Xã hội",
      system: "Hệ thống",
      challenge: "Thử thách",
    };
    return labels[category] || category;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      review_due: "Ôn tập đến hạn",
      study_time: "Thời gian học",
      test_reminder: "Nhắc nhở kiểm tra",
      test_results: "Kết quả kiểm tra",
      streak_warning: "Cảnh báo chuỗi",
      streak_milestones: "Cột mốc chuỗi",
      goal_progress: "Tiến độ mục tiêu",
      goal_achieved: "Mục tiêu đạt được",
      achievement_unlocked: "Mở khóa thành tích",
      new_content: "Nội dung mới",
      daily_progress_report: "Báo cáo ngày",
      weekly_summary: "Tóm tắt tuần",
      weekly_progress_report: "Báo cáo tuần",
      monthly_summary: "Tóm tắt tháng",
      monthly_progress_report: "Báo cáo tháng",
      newsletter_subscription: "Bản tin",
      promotional_content: "Quảng cáo",
      challenge_update: "Cập nhật thử thách",
      leaderboard_change: "Thay đổi xếp hạng",
    };
    return labels[type] || type;
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl ${
              toastType === "success"
                ? "bg-zinc-900 border-green-500/30 text-green-400"
                : "bg-zinc-900 border-red-500/30 text-red-400"
            }`}
          >
            {toastType === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            )}
            <span className="text-sm font-medium text-white">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-red-400" />
            <span>Thông Báo</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Quản lý thông báo trong ứng dụng và thông báo email</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Cài đặt thông báo"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={fetchNotifications}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Làm mới"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab("inapp")}
          className={`px-5 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "inapp"
              ? "border-red-500 text-red-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Thông báo trong ứng dụng</span>
          {notifications.filter((n) => !n.isRead).length > 0 && (
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-600/20 text-red-400 border border-red-500/30">
              {notifications.filter((n) => !n.isRead).length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("email")}
          className={`px-5 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "email"
              ? "border-red-500 text-red-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Thông báo Email</span>
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-zinc-800 text-zinc-300">
            9 loại
          </span>
        </button>
      </div>

      {/* TAB 1: IN-APP NOTIFICATIONS */}
      {activeTab === "inapp" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUnreadOnly(!unreadOnly)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  unreadOnly
                    ? "bg-red-600 text-white"
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <BellRing className="w-4 h-4" />
                  <span>Chưa đọc</span>
                </div>
              </button>
            </div>

            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-red-500/50"
              >
                <option value="all">Tất cả danh mục</option>
                <option value="study">Học tập</option>
                <option value="achievement">Thành tích</option>
                <option value="social">Xã hội</option>
                <option value="system">Hệ thống</option>
                <option value="challenge">Thử thách</option>
              </select>
              <Filter className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-sm font-semibold transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Đọc tất cả</span>
                </div>
              </button>
            )}
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-10 h-10 border-4 border-red-600/30 border-t-red-500 rounded-full animate-spin"></div>
              <p className="text-zinc-400 text-sm">Đang tải thông báo...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 text-sm mb-4">{error}</p>
              <button
                onClick={fetchNotifications}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Thử lại
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 text-sm">Không có thông báo nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                    notification.isRead
                      ? "bg-zinc-900/40 border-zinc-800/40"
                      : "bg-red-950/20 border-red-900/30"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getPriorityColor(
                      notification.priority
                    )}`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium text-white">{notification.title}</h3>
                          {!notification.isRead && (
                            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                          )}
                        </div>
                        {notification.message && (
                          <p className="text-sm text-zinc-400 mb-2">{notification.message}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <span>{getTypeLabel(notification.type)}</span>
                          <span>•</span>
                          <span>{getCategoryLabel(notification.category)}</span>
                          <span>•</span>
                          <span>{getRelativeTime(notification.createdAt)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Action Button */}
                    {notification.actionUrl && notification.actionLabel && (
                      <button
                        onClick={() => {
                          if (!notification.isRead) {
                            markAsRead(notification.id);
                          }
                          window.location.href = notification.actionUrl!;
                        }}
                        className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        {notification.actionLabel}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Load More */}
              {notifications.length >= pageSize && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    Xem thêm
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EMAIL NOTIFICATIONS (12.2) */}
      {activeTab === "email" && preferences && (
        <div className="space-y-6">
          {/* Master Email Switch Banner */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center shrink-0 text-red-400">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white">Nhận thông báo qua Email</h2>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                      preferences.emailEnabled
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : "bg-zinc-800 text-zinc-400 border-zinc-700"
                    }`}
                  >
                    {preferences.emailEnabled ? "Đang bật" : "Đã tạm tắt"}
                  </span>
                </div>
                <p className="text-sm text-zinc-400 mt-1">
                  Bật công tắc chính để nhận các báo cáo học tập định kỳ, kết quả thi và thông báo quan trọng vào hòm thư.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-zinc-400">Bật/tắt tất cả email:</span>
              <button
                onClick={() => updatePreferences({ emailEnabled: !preferences.emailEnabled })}
                className={`w-14 h-7 rounded-full transition-colors relative ${
                  preferences.emailEnabled ? "bg-red-600" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-1 ${
                    preferences.emailEnabled ? "translate-x-8" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 9 Email Notification Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emailNotificationFeatures.map((item) => {
              const isEnabled = Boolean(preferences[item.key as keyof NotificationPreferences]);
              const isSendingThis = sendingTestType === item.type;

              return (
                <div
                  key={item.key}
                  className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/60 flex flex-col justify-between gap-4 hover:border-zinc-700/80 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center shrink-0">
                          {item.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-white">{item.title}</h3>
                          </div>
                          <span className="inline-block mt-0.5 text-[11px] font-medium text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                            {item.badge}
                          </span>
                        </div>
                      </div>

                      {/* Toggle Switch */}
                      <button
                        onClick={() => updatePreferences({ [item.key]: !isEnabled })}
                        className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                          isEnabled ? "bg-red-600" : "bg-zinc-700"
                        }`}
                        title={isEnabled ? "Bật" : "Tắt"}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                            isEnabled ? "translate-x-7" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>
                  </div>

                  {/* Action Buttons: Preview & Send Test */}
                  <div className="flex items-center gap-2 pt-3 border-t border-zinc-800/50">
                    <button
                      onClick={() => handlePreviewEmail(item.type)}
                      className="flex-1 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-zinc-700/50"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem mẫu</span>
                    </button>
                    <button
                      onClick={() => handleSendTestEmail(item.type)}
                      disabled={isSendingThis}
                      className="flex-1 py-2 px-3 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-red-500/30 disabled:opacity-50"
                    >
                      {isSendingThis ? (
                        <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>{isSendingThis ? "Đang gửi..." : "Gửi thử"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Email Preview Modal */}
      {previewModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-[#0d0d14]">
              <div className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-red-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Xem trước mẫu email</h3>
                  {previewData && (
                    <p className="text-xs text-zinc-400 mt-0.5">Tiêu đề: {previewData.subject}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Rendered HTML Email Preview */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#09090b]">
              {previewLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-8 h-8 border-3 border-red-600/30 border-t-red-500 rounded-full animate-spin" />
                  <p className="text-xs text-zinc-400">Đang khởi tạo mẫu email...</p>
                </div>
              ) : previewData ? (
                <div
                  className="rounded-xl overflow-hidden shadow-md"
                  dangerouslySetInnerHTML={{ __html: previewData.html }}
                />
              ) : (
                <p className="text-center py-12 text-zinc-500 text-sm">Không có dữ liệu xem trước</p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t border-zinc-800 bg-[#0d0d14]">
              <span className="text-xs text-zinc-500">Mẫu render theo đúng chuẩn gửi SMTP thực tế</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPreviewModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold transition-colors"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    handleSendTestEmail(previewType);
                  }}
                  disabled={Boolean(sendingTestType)}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Gửi thử email này</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* General Settings Modal */}
      {showSettings && preferences && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0d14] border border-zinc-800/60 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-red-400" />
                <span>Cài đặt thông báo</span>
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Study Notifications */}
              <div>
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span>Thông báo học tập</span>
                </h4>
                <div className="space-y-2">
                  {[
                    { key: "reviewDueReminders", label: "Nhắc nhở ôn tập đến hạn" },
                    { key: "studyTimeReminders", label: "Nhắc nhở thời gian học" },
                    { key: "testReminders", label: "Nhắc nhở kiểm tra" },
                    { key: "streakWarnings", label: "Cảnh báo chuỗi ngày" },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/40"
                    >
                      <span className="text-sm text-zinc-300">{item.label}</span>
                      <button
                        onClick={() =>
                          updatePreferences({
                            [item.key]: !preferences[item.key as keyof NotificationPreferences],
                          })
                        }
                        className={`w-12 h-6 rounded-full transition-colors ${
                          preferences[item.key as keyof NotificationPreferences]
                            ? "bg-red-600"
                            : "bg-zinc-700"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            preferences[item.key as keyof NotificationPreferences]
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievement Notifications */}
              <div>
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Thông báo thành tích & Báo cáo</span>
                </h4>
                <div className="space-y-2">
                  {[
                    { key: "achievementUnlocked", label: "Mở khóa thành tích" },
                    { key: "goalProgressUpdates", label: "Cập nhật tiến độ mục tiêu" },
                    { key: "dailyProgressReport", label: "Báo cáo tiến độ hàng ngày" },
                    { key: "weeklyProgressReport", label: "Báo cáo tiến độ hàng tuần" },
                    { key: "monthlyProgressReport", label: "Báo cáo tiến độ hàng tháng" },
                    { key: "testResults", label: "Kết quả kiểm tra" },
                    { key: "streakMilestones", label: "Cột mốc chuỗi" },
                    { key: "goalAchieved", label: "Mục tiêu đạt được" },
                    { key: "newsletterSubscription", label: "Đăng ký bản tin" },
                    { key: "promotionalContent", label: "Nội dung quảng cáo" },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/40"
                    >
                      <span className="text-sm text-zinc-300">{item.label}</span>
                      <button
                        onClick={() =>
                          updatePreferences({
                            [item.key]: !preferences[item.key as keyof NotificationPreferences],
                          })
                        }
                        className={`w-12 h-6 rounded-full transition-colors ${
                          preferences[item.key as keyof NotificationPreferences]
                            ? "bg-red-600"
                            : "bg-zinc-700"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            preferences[item.key as keyof NotificationPreferences]
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Notifications */}
              <div>
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Thông báo xã hội</span>
                </h4>
                <div className="space-y-2">
                  {[
                    { key: "challengeUpdates", label: "Cập nhật thử thách" },
                    { key: "leaderboardChanges", label: "Thay đổi bảng xếp hạng" },
                    { key: "newContentAvailable", label: "Nội dung mới" },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/40"
                    >
                      <span className="text-sm text-zinc-300">{item.label}</span>
                      <button
                        onClick={() =>
                          updatePreferences({
                            [item.key]: !preferences[item.key as keyof NotificationPreferences],
                          })
                        }
                        className={`w-12 h-6 rounded-full transition-colors ${
                          preferences[item.key as keyof NotificationPreferences]
                            ? "bg-red-600"
                            : "bg-zinc-700"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            preferences[item.key as keyof NotificationPreferences]
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Notifications */}
              <div>
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-400" />
                  <span>Tóm tắt</span>
                </h4>
                <div className="space-y-2">
                  {[
                    { key: "weeklySummary", label: "Tóm tắt hàng tuần" },
                    { key: "monthlySummary", label: "Tóm tắt hàng tháng" },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/40"
                    >
                      <span className="text-sm text-zinc-300">{item.label}</span>
                      <button
                        onClick={() =>
                          updatePreferences({
                            [item.key]: !preferences[item.key as keyof NotificationPreferences],
                          })
                        }
                        className={`w-12 h-6 rounded-full transition-colors ${
                          preferences[item.key as keyof NotificationPreferences]
                            ? "bg-red-600"
                            : "bg-zinc-700"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            preferences[item.key as keyof NotificationPreferences]
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Method */}
              <div>
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Phương thức nhận</span>
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/40">
                    <span className="text-sm text-zinc-300">Thông báo đẩy (Push)</span>
                    <button
                      onClick={() => updatePreferences({ pushEnabled: !preferences.pushEnabled })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        preferences.pushEnabled ? "bg-red-600" : "bg-zinc-700"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          preferences.pushEnabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/40">
                    <span className="text-sm text-zinc-300">Email</span>
                    <button
                      onClick={() => updatePreferences({ emailEnabled: !preferences.emailEnabled })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        preferences.emailEnabled ? "bg-red-600" : "bg-zinc-700"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          preferences.emailEnabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}