"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  User,
  Target,
  Lock,
  Settings,
  ShieldCheck,
  Check,
  X,
  Laptop,
  LogOut,
  AlertTriangle,
  Trash2,
  Key,
  Award,
  Eye,
  EyeOff,
  Mail,
  Shield,
  Download,
  Globe,
  Bell,
  RefreshCw,
  FileJson,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
  Flame,
  Clock,
  Sparkles,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const TABS = [
  { id: "info", label: "Thông tin cá nhân", icon: User },
  { id: "email", label: "Cài đặt Email", icon: Mail },
  { id: "password", label: "Đổi mật khẩu", icon: Lock },
  { id: "privacy", label: "Quyền riêng tư", icon: Shield },
  { id: "connected", label: "Tài khoản kết nối", icon: Globe },
  { id: "export", label: "Xuất dữ liệu", icon: Download },
  { id: "goal", label: "Mục tiêu TOEIC", icon: Target },
  { id: "badges", label: "Huy hiệu", icon: Award },
  { id: "settings", label: "Tùy chọn học tập", icon: Settings },
  { id: "account", label: "Quản lý & Xóa tài khoản", icon: ShieldAlert },
];

const TARGET_OPTIONS = [400, 500, 600, 700, 750, 800, 850, 900, 950, 990];
const STUDY_TIME_OPTIONS = [15, 20, 30, 45, 60, 90, 120];

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{
    id?: number;
    fullName?: string;
    email?: string;
    avatar?: string;
    phone?: string;
    birthday?: string;
    gender?: string;
    address?: string;
    bio?: string;
    createdAt?: string;
    lastLoginAt?: string;
    currentScore?: number;
    targetScore?: number;
    examDate?: string;
    dailyStudyTime?: number;
    dailyVocabularyGoal?: number;
    studyNotification?: boolean;
    srsNotification?: boolean;
    autoPronunciation?: boolean;
    darkMode?: boolean;
  } | null>(null);

  // Profile Fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // TOEIC Goal Fields
  const [currentScore, setCurrentScore] = useState(0);
  const [targetScore, setTargetScore] = useState(600);
  const [examDate, setExamDate] = useState("");
  const [dailyStudyTime, setDailyStudyTime] = useState(30);
  const [dailyVocabularyGoal, setDailyVocabularyGoal] = useState(20);

  // Settings & Preferences
  const [studyNotification, setStudyNotification] = useState(true);
  const [srsNotification, setSrsNotification] = useState(true);
  const [autoPronunciation, setAutoPronunciation] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Password Change Fields
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Email Settings Fields
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  // Privacy Settings Fields
  const [privacySettings, setPrivacySettings] = useState({
    showOnLeaderboard: true,
    profileVisibility: "public",
    showStudyStats: true,
    allowFriendRequests: true,
  });
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);

  // Connected Accounts Fields
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  // Data Export Fields
  const [isExporting, setIsExporting] = useState(false);

  // Account Management Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteReason, setDeleteReason] = useState("Đã đạt mục tiêu TOEIC");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Toast / Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  useEffect(() => {
    loadProfile();
    loadPrivacySettings();
    loadConnectedAccounts();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      const data = await apiFetch<any>("/profile/me");
      if (data) {
        setUser(data);
        setFullName(data.fullName || "");
        setPhone(data.phone || "");
        setBirthday(data.birthday ? data.birthday.substring(0, 10) : "");
        setGender(data.gender || "");
        setAddress(data.address || "");
        setBio(data.bio || "");
        setAvatarPreview(data.avatarUrl || data.avatar || "");
        setCurrentScore(data.currentScore || 0);
        setTargetScore(data.targetScore || 600);
        setExamDate(data.examDate ? data.examDate.substring(0, 10) : "");
        setDailyStudyTime(data.dailyStudyTime || 30);
        setDailyVocabularyGoal(data.dailyVocabularyGoal || 20);
        setStudyNotification(data.studyNotification ?? true);
        setSrsNotification(data.srsNotification ?? true);
        setAutoPronunciation(data.autoPronunciation ?? false);
        setDarkMode(data.darkMode ?? true);
        setNewEmail(data.email || "");
      }
    } catch (err: any) {
      console.error("Error loading profile:", err);
      showToast("Không thể tải thông tin hồ sơ", "error");
    } finally {
      setLoading(false);
    }
  }

  async function loadPrivacySettings() {
    try {
      const res = await apiFetch<{ success: boolean; data: any }>("/profile/privacy");
      if (res.success && res.data) {
        setPrivacySettings(res.data);
      }
    } catch (err) {
      console.error("Error loading privacy settings:", err);
    }
  }

  async function loadConnectedAccounts() {
    try {
      setLoadingAccounts(true);
      const res = await apiFetch<{ success: boolean; accounts: any[] }>("/profile/connected-accounts");
      if (res.success && res.accounts) {
        setConnectedAccounts(res.accounts);
      }
    } catch (err) {
      console.error("Error loading connected accounts:", err);
    } finally {
      setLoadingAccounts(false);
    }
  }

  // 13.1. Profile settings: Save
  async function handleSaveProfile() {
    try {
      const res = await apiFetch<{ message?: string }>("/profile/me", {
        method: "PUT",
        body: JSON.stringify({
          fullName,
          phone,
          birthday: birthday || null,
          gender,
          address,
          bio,
          currentScore,
          targetScore,
          examDate: examDate || null,
          dailyStudyTime,
          dailyVocabularyGoal,
          studyNotification,
          srsNotification,
          autoPronunciation,
          darkMode,
        }),
      });
      showToast(res.message || "Cập nhật hồ sơ thành công!");
      loadProfile();
    } catch (err: any) {
      showToast(err.message || "Lỗi khi cập nhật hồ sơ", "error");
    }
  }

  // Avatar Upload
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setUploadingAvatar(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API}/profile/upload-avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setAvatarPreview(data.avatarUrl);
        showToast("Tải ảnh đại diện thành công!");
        loadProfile();
      } else {
        showToast(data.message || "Không thể tải lên ảnh đại diện", "error");
      }
    } catch (err: any) {
      showToast("Lỗi khi tải lên ảnh đại diện", "error");
    } finally {
      setUploadingAvatar(false);
    }
  }

  // 13.1. Email settings: Update email
  async function handleUpdateEmail() {
    if (!newEmail || !newEmail.includes("@")) {
      showToast("Vui lòng nhập địa chỉ email hợp lệ", "error");
      return;
    }

    try {
      setIsUpdatingEmail(true);
      const res = await apiFetch<{ success: boolean; message: string }>("/profile/email", {
        method: "PUT",
        body: JSON.stringify({
          email: newEmail,
          password: emailPassword || undefined,
        }),
      });

      if (res.success) {
        showToast(res.message || "Đã cập nhật email thành công!");
        setEmailPassword("");
        loadProfile();
      }
    } catch (err: any) {
      showToast(err.message || "Lỗi khi cập nhật email", "error");
    } finally {
      setIsUpdatingEmail(false);
    }
  }

  // 13.1. Password settings: Change password
  async function handleChangePassword() {
    if (!oldPassword) {
      showToast("Vui lòng nhập mật khẩu hiện tại", "error");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      showToast("Mật khẩu mới phải có ít nhất 6 ký tự", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Mật khẩu xác nhận không khớp", "error");
      return;
    }

    try {
      setIsChangingPassword(true);
      const res = await apiFetch<{ message: string }>("/profile/change-password", {
        method: "PUT",
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      showToast(res.message || "Đổi mật khẩu thành công!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      showToast(err.message || "Lỗi khi đổi mật khẩu", "error");
    } finally {
      setIsChangingPassword(false);
    }
  }

  // 13.1. Privacy settings: Update
  async function handleSavePrivacy(updated: Partial<typeof privacySettings>) {
    const next = { ...privacySettings, ...updated };
    setPrivacySettings(next);
    try {
      setIsSavingPrivacy(true);
      const res = await apiFetch<{ success: boolean; message: string }>("/profile/privacy", {
        method: "PUT",
        body: JSON.stringify(next),
      });
      if (res.success) {
        showToast(res.message || "Đã cập nhật quyền riêng tư");
      }
    } catch (err: any) {
      showToast("Lỗi khi lưu cài đặt quyền riêng tư", "error");
    } finally {
      setIsSavingPrivacy(false);
    }
  }

  // 13.1. Data export: Download learning data
  async function handleExportData(format: "json" | "csv" = "json") {
    try {
      setIsExporting(true);
      const data = await apiFetch<any>("/profile/export-data");

      if (format === "json") {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `toeic_ai_learning_data_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // CSV Format Summary
        const summary = data.userData?.summary;
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Chỉ số,Số lượng\n";
        csvContent += `Tổng bài thi thử Mock Test,${summary?.totalMockTests || 0}\n`;
        csvContent += `Tổng bài luyện tập Practice,${summary?.totalPracticeSessions || 0}\n`;
        csvContent += `Tổng thành tích đạt được,${summary?.totalAchievements || 0}\n`;
        csvContent += `Mục tiêu đã tạo,${summary?.totalGoals || 0}\n`;
        csvContent += `Lịch sử tích lũy điểm thưởng,${summary?.totalPointsTransactions || 0}\n`;

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `toeic_ai_progress_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      showToast(`Đã xuất dữ liệu học tập định dạng ${format.toUpperCase()} thành công!`);
    } catch (err: any) {
      showToast("Lỗi khi xuất dữ liệu học tập", "error");
    } finally {
      setIsExporting(false);
    }
  }

  // 13.1. Connected accounts: Unlink
  async function handleUnlinkAccount(provider: string) {
    try {
      const res = await apiFetch<{ success: boolean; message: string }>("/profile/connected-accounts/unlink", {
        method: "POST",
        body: JSON.stringify({ provider }),
      });
      if (res.success) {
        showToast(res.message);
        loadConnectedAccounts();
      }
    } catch (err: any) {
      showToast(err.message || "Lỗi khi hủy liên kết tài khoản", "error");
    }
  }

  // 13.1. Account deletion
  async function handleDeleteAccount() {
    try {
      setIsDeleting(true);
      const res = await apiFetch<{ success: boolean; message: string }>("/profile/delete-account", {
        method: "POST",
        body: JSON.stringify({
          password: deletePassword,
          reason: deleteReason,
        }),
      });

      if (res.success) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        router.push("/login");
      }
    } catch (err: any) {
      showToast(err.message || "Không thể xóa tài khoản. Vui lòng kiểm tra mật khẩu.", "error");
    } finally {
      setIsDeleting(false);
    }
  }

  // Deactivate account
  async function handleDeactivateAccount() {
    try {
      setIsDeactivating(true);
      const res = await apiFetch<{ message: string }>("/profile/deactivate-account", {
        method: "POST",
      });
      showToast(res.message);
      localStorage.removeItem("accessToken");
      router.push("/login");
    } catch (err: any) {
      showToast(err.message || "Lỗi khi vô hiệu hóa tài khoản", "error");
    } finally {
      setIsDeactivating(false);
    }
  }

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: "", color: "" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 33, text: "Yếu", color: "bg-red-500 text-red-400" };
    if (score <= 4) return { score: 66, text: "Trung bình", color: "bg-yellow-500 text-yellow-400" };
    return { score: 100, text: "Rất mạnh", color: "bg-green-500 text-green-400" };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
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
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <User className="w-6 h-6 text-red-400" />
          <span>Hồ Sơ & Cài Đặt Tài Khoản</span>
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Quản lý thông tin cá nhân, bảo mật, quyền riêng tư, xuất dữ liệu và tài khoản liên kết
        </p>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex overflow-x-auto border-b border-zinc-800 gap-1 pb-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-semibold rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-red-600/10 text-red-400 border border-red-500/30"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROFILE SETTINGS (Cài đặt hồ sơ) */}
      {activeTab === "info" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-red-400" />
              <span>Thông tin cá nhân</span>
            </h2>

            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center text-3xl font-bold text-white overflow-hidden shadow-lg border border-zinc-700">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview.startsWith("http") ? avatarPreview : `${API}${avatarPreview}`}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    fullName.charAt(0).toUpperCase() || "U"
                  )}
                </div>
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <h3 className="text-sm font-semibold text-white">Ảnh đại diện tài khoản</h3>
                <p className="text-xs text-zinc-400">
                  Hỗ trợ định dạng JPG, PNG, GIF, WebP (Tối đa 5MB)
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <label className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors inline-block">
                    <span>Tải ảnh mới</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Họ và tên</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Số điện thoại</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                  placeholder="0987654321"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Ngày sinh</label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Giới tính</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Địa chỉ</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                  placeholder="Hà Nội, Việt Nam"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Tiểu sử (Bio)</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50 resize-none"
                  placeholder="Mục tiêu đạt 900+ TOEIC trong 3 tháng tới..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveProfile}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Lưu Thay Đổi Hồ Sơ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EMAIL SETTINGS (Cài đặt email) */}
      {activeTab === "email" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center shrink-0 text-red-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Cài đặt địa chỉ Email</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Email dùng để đăng nhập, nhận báo cáo tiến độ học tập và khôi phục tài khoản.
                </p>
              </div>
            </div>

            {/* Current Email Status */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-zinc-400">Email hiện tại</div>
                <div className="text-sm font-bold text-white mt-0.5">{user?.email || "Chưa có"}</div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đã kích hoạt</span>
              </span>
            </div>

            {/* Change Email Form */}
            <div className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Địa chỉ Email mới</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                  placeholder="new-email@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Mật khẩu hiện tại (Xác nhận bảo mật)
                </label>
                <input
                  type="password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                  placeholder="••••••••"
                />
              </div>

              <button
                onClick={handleUpdateEmail}
                disabled={isUpdatingEmail || newEmail === user?.email}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isUpdatingEmail ? "Đang cập nhật..." : "Cập Nhật Email Mới"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PASSWORD SETTINGS (Cài đặt mật khẩu) */}
      {activeTab === "password" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-6 max-w-xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center shrink-0 text-red-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Đổi mật khẩu tài khoản</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Khuyến nghị sử dụng mật khẩu có ít nhất 8 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Mật khẩu hiện tại</label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 pr-10 text-white text-sm focus:outline-none focus:border-red-500/50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 pr-10 text-white text-sm focus:outline-none focus:border-red-500/50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength indicator */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">Độ mạnh mật khẩu:</span>
                      <span className={`font-semibold ${passwordStrength.color.split(" ")[1]}`}>
                        {passwordStrength.text}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color.split(" ")[0]}`}
                        style={{ width: `${passwordStrength.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                  placeholder="••••••••"
                />
              </div>

              <button
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isChangingPassword ? "Đang xử lý..." : "Cập Nhật Mật Khẩu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PRIVACY SETTINGS (Cài đặt quyền riêng tư) */}
      {activeTab === "privacy" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center shrink-0 text-red-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Quyền riêng tư & Bảo mật dữ liệu</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Tùy chỉnh hiển thị hồ sơ, bảng xếp hạng và khả năng kết nối bạn bè trên hệ thống.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Leaderboard visibility */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Hiển thị trên Bảng xếp hạng</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Cho phép tên và điểm số của bạn xuất hiện trên Leaderboard tuần/tháng để thi đua cùng cộng đồng.
                  </p>
                </div>
                <button
                  onClick={() => handleSavePrivacy({ showOnLeaderboard: !privacySettings.showOnLeaderboard })}
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                    privacySettings.showOnLeaderboard ? "bg-red-600" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      privacySettings.showOnLeaderboard ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Show study stats */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Công khai chuỗi ngày & Huy hiệu</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Cho phép bạn bè xem số ngày Streak và bộ sưu tập huy hiệu thành tích TOEIC của bạn.
                  </p>
                </div>
                <button
                  onClick={() => handleSavePrivacy({ showStudyStats: !privacySettings.showStudyStats })}
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                    privacySettings.showStudyStats ? "bg-red-600" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      privacySettings.showStudyStats ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Friend requests */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Nhận lời mời kết bạn & Thách đấu</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Cho phép các học viên khác gửi lời mời kết bạn và tham gia các thử thách luyện thi nhóm.
                  </p>
                </div>
                <button
                  onClick={() => handleSavePrivacy({ allowFriendRequests: !privacySettings.allowFriendRequests })}
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                    privacySettings.allowFriendRequests ? "bg-red-600" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      privacySettings.allowFriendRequests ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CONNECTED ACCOUNTS (Tài khoản kết nối) */}
      {activeTab === "connected" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center shrink-0 text-red-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Tài khoản liên kết mạng xã hội</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Kết nối tài khoản mạng xã hội để đăng nhập 1-click nhanh chóng và an toàn.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {connectedAccounts.map((acc) => (
                <div
                  key={acc.provider}
                  className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-white text-sm">
                      {acc.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{acc.name}</h3>
                      <p className="text-xs text-zinc-400">
                        {acc.connected ? `Đã liên kết (${acc.email || "Đang hoạt động"})` : "Chưa kết nối"}
                      </p>
                    </div>
                  </div>

                  <div>
                    {acc.connected ? (
                      <button
                        onClick={() => handleUnlinkAccount(acc.provider)}
                        className="px-3.5 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-600/20 text-xs font-semibold transition-colors"
                      >
                        Hủy liên kết
                      </button>
                    ) : (
                      <button
                        onClick={() => showToast(`Tính năng liên kết ${acc.name} đang mở phiên OAuth...`)}
                        className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors border border-zinc-700"
                      >
                        Kết nối ngay
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: DATA EXPORT (Xuất dữ liệu) */}
      {activeTab === "export" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center shrink-0 text-red-400">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Xuất dữ liệu học tập cá nhân (Data Export)</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Tải về toàn bộ lịch sử luyện thi, bảng điểm các bài test, danh sách từ vựng đã ghi nhớ và thành tích của bạn.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* JSON Format Card */}
              <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileJson className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-sm font-bold text-white">Định dạng JSON đầy đủ</h3>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Chứa trọn vẹn cấu trúc dữ liệu thô: chi tiết từng bài thi, câu trả lời, tiến độ từ vựng, chuỗi ngày, giao dịch điểm thưởng.
                  </p>
                </div>
                <button
                  onClick={() => handleExportData("json")}
                  disabled={isExporting}
                  className="w-full py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? "Đang tạo gói dữ liệu..." : "Tải về tệp JSON"}</span>
                </button>
              </div>

              {/* CSV Format Card */}
              <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Bảng tính CSV tổng hợp</h3>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Tệp bảng tính chuẩn mở rộng có thể đọc bằng Microsoft Excel hoặc Google Sheets để phân tích tiến độ.
                  </p>
                </div>
                <button
                  onClick={() => handleExportData("csv")}
                  disabled={isExporting}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? "Đang xuất CSV..." : "Tải về tệp CSV"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: TOEIC GOAL (Mục tiêu TOEIC) */}
      {activeTab === "goal" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-red-400" />
              <span>Mục tiêu học tập & Điểm số TOEIC</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Điểm TOEIC hiện tại</label>
                <input
                  type="number"
                  value={currentScore}
                  onChange={(e) => setCurrentScore(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                  placeholder="450"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Mục tiêu điểm số</label>
                <select
                  value={targetScore}
                  onChange={(e) => setTargetScore(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                >
                  {TARGET_OPTIONS.map((score) => (
                    <option key={score} value={score}>
                      {score}+ Điểm
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Ngày thi dự kiến</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Thời gian học mỗi ngày (Phút)</label>
                <select
                  value={dailyStudyTime}
                  onChange={(e) => setDailyStudyTime(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                >
                  {STUDY_TIME_OPTIONS.map((time) => (
                    <option key={time} value={time}>
                      {time} phút / ngày
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveProfile}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Lưu Mục Tiêu TOEIC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: BADGES (Huy hiệu) */}
      {activeTab === "badges" && (
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-center py-12 space-y-3">
          <Award className="w-12 h-12 text-yellow-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Bộ sưu tập huy hiệu & Cấp độ</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Xem toàn bộ huy hiệu bạn đã mở khóa và khám phá các nhiệm vụ điểm thưởng mới trong trung tâm huy hiệu.
          </p>
          <button
            onClick={() => router.push("/dashboard/badges")}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors inline-block"
          >
            Đến Trang Cấp Độ & Huy Hiệu
          </button>
        </div>
      )}

      {/* TAB 9: SETTINGS & NOTIFICATION PREFERENCES (Tùy chọn học tập) */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-red-400" />
              <span>Tùy chọn học tập & Thông báo</span>
            </h2>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Nhắc nhở học tập hàng ngày</h3>
                  <p className="text-xs text-zinc-400">Gửi thông báo nhắc lịch học để duy trì chuỗi Streak</p>
                </div>
                <button
                  onClick={() => setStudyNotification(!studyNotification)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    studyNotification ? "bg-red-600" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      studyNotification ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Tự động phát âm khi học từ mới</h3>
                  <p className="text-xs text-zinc-400">Phát âm thanh giọng đọc bản xứ mỗi khi chuyển flashcard</p>
                </div>
                <button
                  onClick={() => setAutoPronunciation(!autoPronunciation)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    autoPronunciation ? "bg-red-600" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      autoPronunciation ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Trung tâm thông báo nâng cao</h3>
                  <p className="text-xs text-zinc-400">Cấu hình chi tiết Email, Giờ yên tĩnh và Chế độ không làm phiền (DND)</p>
                </div>
                <button
                  onClick={() => router.push("/dashboard/notifications")}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-white rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5 text-red-400" />
                  <span>Mở Cài Đặt Thông Báo</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveProfile}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Lưu Tùy Chọn Học Tập
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 10: ACCOUNT DELETION & MANAGEMENT (Quản lý & Xóa tài khoản) */}
      {activeTab === "account" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center shrink-0 text-red-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Quản lý trạng thái tài khoản</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Tạm ngưng hoạt động hoặc xóa vĩnh viễn tài khoản và toàn bộ dữ liệu khỏi hệ thống.
                </p>
              </div>
            </div>

            {/* Deactivate Option */}
            <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white">Vô hiệu hóa tài khoản tạm thời</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Tài khoản của bạn sẽ tạm ẩn khỏi bảng xếp hạng. Bạn có thể kích hoạt lại bất kỳ lúc nào bằng cách đăng nhập lại.
                </p>
              </div>
              <button
                onClick={() => setShowDeactivateModal(true)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-semibold shrink-0 transition-colors"
              >
                Vô hiệu hóa
              </button>
            </div>

            {/* Delete Option */}
            <div className="p-5 rounded-xl bg-red-950/20 border border-red-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Xóa tài khoản vĩnh viễn</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                  Hành động này <span className="text-red-400 font-semibold">không thể hoàn tác</span>. Toàn bộ lịch sử làm bài thi, điểm số, từ vựng, chuỗi ngày và thành tích sẽ bị xóa vĩnh viễn.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
              >
                Xóa tài khoản
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0d14] border border-red-900/40 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Xác nhận xóa tài khoản</h3>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Bạn sắp xóa vĩnh viễn tài khoản <strong className="text-white">{user?.email}</strong>. Tất cả tiến trình học tập TOEIC sẽ bị mất và không thể khôi phục.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Lý do bạn muốn xóa?</label>
                <select
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500/50"
                >
                  <option value="Đã đạt mục tiêu TOEIC">Đã đạt mục tiêu điểm số TOEIC</option>
                  <option value="Chuyển sang nền tảng khác">Chuyển sang nền tảng khác</option>
                  <option value="Ít có thời gian sử dụng">Ít có thời gian sử dụng</option>
                  <option value="Vấn đề bảo mật & riêng tư">Vấn đề bảo mật & riêng tư</option>
                  <option value="Lý do khác">Lý do khác</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Nhập mật khẩu để xác nhận
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500/50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Đang xóa..." : "Xác Nhận Xóa Vĩnh Viễn"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Account Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0d14] border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Vô hiệu hóa tài khoản?</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Tài khoản của bạn sẽ bị tạm ngưng và tự động đăng xuất. Bạn có thể kích hoạt lại bất kỳ lúc nào chỉ bằng việc đăng nhập lại bình thường.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDeactivateAccount}
                disabled={isDeactivating}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isDeactivating ? "Đang xử lý..." : "Vô Hiệu Hóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
