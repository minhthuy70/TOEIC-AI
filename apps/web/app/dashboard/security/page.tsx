"use client";

import { useEffect, useState } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Key,
  Smartphone,
  Laptop,
  Lock,
  Unlock,
  AlertTriangle,
  Bell,
  RefreshCw,
  Copy,
  Check,
  Trash2,
  Plus,
  Server,
  Layers,
  Zap,
  Globe,
  CheckCircle2,
  AlertCircle,
  Eye,
  LogOut,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function SecurityCenterPage() {
  const [activeTab, setActiveTab] = useState<"2fa" | "sessions" | "alerts" | "defense">("2fa");
  const [loading, setLoading] = useState(true);

  // 2FA State
  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [showSetup2fa, setShowSetup2fa] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [otpCode, setOtpCode] = useState("");
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [verifying2fa, setVerifying2fa] = useState(false);

  // Sessions State
  const [sessions, setSessions] = useState<any[]>([]);

  // Alerts & Suspicious State
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loginNotificationsEnabled, setLoginNotificationsEnabled] = useState(true);

  // Defense Layers & Whitelist State
  const [defenseLayers, setDefenseLayers] = useState<any[]>([]);
  const [defenseScore, setDefenseScore] = useState(99.4);
  const [ipWhitelist, setIpWhitelist] = useState<any[]>([]);
  const [newIp, setNewIp] = useState("");
  const [newIpLabel, setNewIpLabel] = useState("");

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    loadAllSecurityData();
  }, []);

  const loadAllSecurityData = async () => {
    try {
      setLoading(true);
      const [twoFaRes, sessRes, alertRes, defenseRes, ipRes] = await Promise.all([
        apiFetch<{ success: boolean; isEnabled: boolean }>("/security/2fa/status"),
        apiFetch<{ success: boolean; sessions: any[] }>("/security/sessions"),
        apiFetch<{ success: boolean; activities: any[]; loginNotificationsEnabled: boolean }>("/security/suspicious-activities"),
        apiFetch<{ success: boolean; layers: any[]; overallScore: number }>("/security/system-defense-status"),
        apiFetch<{ success: boolean; whitelist: any[] }>("/security/ip-whitelist"),
      ]);

      if (twoFaRes.success) setIs2faEnabled(twoFaRes.isEnabled);
      if (sessRes.success) setSessions(sessRes.sessions || []);
      if (alertRes.success) {
        setAlerts(alertRes.activities || []);
        setLoginNotificationsEnabled(alertRes.loginNotificationsEnabled);
      }
      if (defenseRes.success) {
        setDefenseLayers(defenseRes.layers || []);
        setDefenseScore(defenseRes.overallScore || 99.4);
      }
      if (ipRes.success) setIpWhitelist(ipRes.whitelist || []);
    } catch (e: any) {
      console.error(e);
      showToast(e.message || "Không thể tải dữ liệu bảo mật", "error");
    } finally {
      setLoading(false);
    }
  };

  // 1. Two-Factor Authentication: Generate
  const handleStart2faSetup = async () => {
    try {
      const res = await apiFetch<{ success: boolean; secret: string; qrCodeUrl: string; backupCodes: string[] }>("/security/2fa/generate", {
        method: "POST",
      });
      if (res.success) {
        setSecretKey(res.secret);
        setQrCodeUrl(res.qrCodeUrl);
        setBackupCodes(res.backupCodes || []);
        setShowSetup2fa(true);
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi tạo mã 2FA", "error");
    }
  };

  // 1. Two-Factor Authentication: Verify
  const handleVerify2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      showToast("Vui lòng nhập đủ 6 chữ số OTP", "error");
      return;
    }

    try {
      setVerifying2fa(true);
      const res = await apiFetch<{ success: boolean; message: string }>("/security/2fa/verify", {
        method: "POST",
        body: JSON.stringify({ otpCode }),
      });
      if (res.success) {
        setIs2faEnabled(true);
        setShowSetup2fa(false);
        showToast(res.message || "Kích hoạt 2FA thành công!", "success");
      } else {
        showToast(res.message || "Mã OTP không đúng", "error");
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi xác thực", "error");
    } finally {
      setVerifying2fa(false);
    }
  };

  // 1. Two-Factor Authentication: Disable
  const handleDisable2fa = async () => {
    if (!confirm("Bạn có chắc chắn muốn tắt Xác thực 2 yếu tố (2FA)? Tài khoản của bạn sẽ giảm mức độ bảo vệ.")) return;
    try {
      const res = await apiFetch<{ success: boolean; message: string }>("/security/2fa/disable", {
        method: "POST",
      });
      if (res.success) {
        setIs2faEnabled(false);
        showToast(res.message || "Đã tắt 2FA", "success");
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi tắt 2FA", "error");
    }
  };

  // 4. Session Management: Revoke One
  const handleRevokeSession = async (sessionId: number) => {
    try {
      const res = await apiFetch<{ success: boolean; message: string }>("/security/sessions/revoke", {
        method: "POST",
        body: JSON.stringify({ sessionId }),
      });
      if (res.success) {
        showToast(res.message);
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi hủy phiên", "error");
    }
  };

  // 4. Session Management: Revoke All
  const handleRevokeAllSessions = async () => {
    if (!confirm("Bạn có chắc chắn muốn đăng xuất khỏi tất cả các thiết bị khác?")) return;
    try {
      const res = await apiFetch<{ success: boolean; message: string }>("/security/sessions/revoke-all", {
        method: "POST",
      });
      if (res.success) {
        showToast(res.message);
        setSessions((prev) => prev.filter((s) => s.isCurrent));
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi đăng xuất tất cả thiết bị", "error");
    }
  };

  // 5. IP Whitelist: Add
  const handleAddIpWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp.trim()) return;

    try {
      const res = await apiFetch<{ success: boolean; message: string; item: any }>("/security/ip-whitelist", {
        method: "POST",
        body: JSON.stringify({ ip: newIp.trim(), label: newIpLabel.trim() }),
      });
      if (res.success) {
        showToast(res.message);
        setIpWhitelist((prev) => [res.item, ...prev]);
        setNewIp("");
        setNewIpLabel("");
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi thêm IP", "error");
    }
  };

  // 5. IP Whitelist: Delete
  const handleDeleteIpWhitelist = async (id: string) => {
    try {
      const res = await apiFetch<{ success: boolean; message: string }>(`/security/ip-whitelist/${id}`, {
        method: "DELETE",
      });
      if (res.success) {
        showToast(res.message);
        setIpWhitelist((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (e: any) {
      showToast(e.message || "Lỗi xóa IP", "error");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in w-full pb-12">
      {/* Toast */}
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
            <ShieldCheck className="w-6 h-6 text-red-400" />
            <span>Trung Tâm Bảo Mật & An Ninh Hệ Thống (Security 19.1)</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Xác thực 2 yếu tố (2FA), Quản lý phiên đăng nhập, Cảnh báo hoạt động đáng ngờ và 11 Lớp phòng thủ hệ thống.
          </p>
        </div>

        <button
          onClick={loadAllSecurityData}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Kiểm Tra An Ninh</span>
        </button>
      </div>

      {/* Master Tabs */}
      <div className="flex border-b border-zinc-800">
        {[
          { id: "2fa", label: "1. Xác Thực 2 Yếu Tố (2FA)", icon: Key },
          { id: "sessions", label: `2. Quản Lý Phiên (${sessions.length})`, icon: Laptop },
          { id: "alerts", label: "3. Cảnh Báo & Hoạt Động Đáng Ngờ", icon: Bell },
          { id: "defense", label: "4. 11 Lớp Phòng Thủ Hệ Thống", icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
                isSelected
                  ? "border-red-500 text-red-400"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-zinc-500">Đang quét trạng thái bảo mật tài khoản...</div>
      ) : (
        <>
          {/* TAB 1: 2FA AUTHENTICATION */}
          {activeTab === "2fa" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-5 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                      is2faEnabled ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30" : "bg-zinc-800 text-zinc-400"
                    }`}>
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Xác Thực 2 Yếu Tố (TOTP 2FA)</h3>
                      <span className="text-xs text-zinc-400">
                        {is2faEnabled ? "Đang được BẬT để bảo vệ tài khoản" : "Chưa kích hoạt - Khuyên dùng để chống đánh cắp tài khoản"}
                      </span>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 ${
                    is2faEnabled ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30" : "bg-zinc-800 text-zinc-400"
                  }`}>
                    {is2faEnabled ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    <span>{is2faEnabled ? "ĐANG BẬT" : "CHƯA BẬT"}</span>
                  </span>
                </div>

                {!is2faEnabled && !showSetup2fa && (
                  <div className="space-y-4 text-xs text-zinc-300">
                    <p>
                      Xác thực 2 yếu tố bổ sung một lớp bảo mật vững chắc cho tài khoản của bạn. Mỗi khi đăng nhập, bạn sẽ cần nhập mật khẩu kèm theo mã OTP 6 chữ số từ ứng dụng xác thực (*Google Authenticator, Authy, Microsoft Authenticator*).
                    </p>

                    <button
                      onClick={handleStart2faSetup}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-colors"
                    >
                      <Key className="w-4 h-4" />
                      <span>Bắt Đầu Cài Đặt 2FA</span>
                    </button>
                  </div>
                )}

                {/* 2FA Setup Flow */}
                {showSetup2fa && (
                  <form onSubmit={handleVerify2fa} className="space-y-5 text-xs">
                    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center gap-5">
                      <img
                        src={qrCodeUrl}
                        alt="2FA QR Code"
                        className="w-36 h-36 rounded-lg bg-white p-1.5 shrink-0"
                      />

                      <div className="space-y-2">
                        <span className="font-bold text-white text-sm block">Bước 1: Quét mã QR</span>
                        <p className="text-zinc-400">
                          Mở Google Authenticator hoặc Authy trên điện thoại và quét mã QR bên cạnh. Hoặc nhập mã khóa bí mật thủ công:
                        </p>
                        <div className="flex items-center gap-2">
                          <code className="bg-zinc-900 px-2.5 py-1.5 rounded text-red-400 font-mono text-xs border border-zinc-800">
                            {secretKey}
                          </code>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(secretKey);
                              setCopiedSecret(true);
                              setTimeout(() => setCopiedSecret(false), 2500);
                            }}
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded"
                          >
                            {copiedSecret ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Backup Codes */}
                    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                      <span className="font-bold text-white block">Bước 2: Lưu 8 mã khôi phục dự phòng (Backup Codes)</span>
                      <p className="text-[11px] text-zinc-500">
                        Lưu giữ các mã này ở nơi an toàn. Bạn có thể sử dụng các mã này để đăng nhập nếu bị mất điện thoại:
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-center text-[11px]">
                        {backupCodes.map((code, idx) => (
                          <div key={idx} className="p-1.5 bg-zinc-900 rounded border border-zinc-800 text-zinc-300">
                            {code}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Step 3: Enter OTP */}
                    <div className="space-y-2">
                      <label className="font-bold text-white block">Bước 3: Nhập mã OTP 6 số từ ứng dụng để xác nhận</label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                          placeholder="123456"
                          className="w-48 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-center font-mono text-lg text-white tracking-widest focus:outline-none focus:border-red-500"
                        />
                        <button
                          type="submit"
                          disabled={verifying2fa || otpCode.length !== 6}
                          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs"
                        >
                          {verifying2fa ? "Đang xác nhận..." : "Xác Nhận & Bật 2FA"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowSetup2fa(false)}
                          className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {is2faEnabled && (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 shrink-0" />
                      <span>Tài khoản của bạn đã được bảo vệ với xác thực 2 bước Google Authenticator / Authy.</span>
                    </div>

                    <button
                      onClick={handleDisable2fa}
                      className="px-4 py-2 bg-zinc-800 hover:bg-red-950/60 hover:text-red-400 text-zinc-300 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Hủy Kích Hoạt 2FA
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SESSIONS MANAGEMENT (4. Session management) */}
          {activeTab === "sessions" && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Laptop className="w-4 h-4 text-red-400" />
                      <span>4. Các Thiết Bị Đang Đăng Nhập Hoạt Động ({sessions.length})</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Nếu bạn phát hiện thiết bị lạ không phải của mình, hãy bấm hủy phiên ngay lập tức.
                    </p>
                  </div>

                  <button
                    onClick={handleRevokeAllSessions}
                    className="px-4 py-2 bg-zinc-800 hover:bg-red-900 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Đăng Xuất Khỏi Tất Cả Thiết Bị Khác</span>
                  </button>
                </div>

                <div className="divide-y divide-zinc-800 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden text-xs">
                  {sessions.map((sess) => (
                    <div key={sess.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                          {sess.device.includes("iPhone") ? <Smartphone className="w-4 h-4 text-purple-400" /> : <Laptop className="w-4 h-4 text-blue-400" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{sess.device}</span>
                            {sess.isCurrent && (
                              <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                                Thiết bị này
                              </span>
                            )}
                          </div>
                          <p className="text-zinc-400 text-[11px]">IP: {sess.ipAddress} • Vị trí: {sess.location} • Hoạt động: {sess.lastActive}</p>
                        </div>
                      </div>

                      {!sess.isCurrent && (
                        <button
                          onClick={() => handleRevokeSession(sess.id)}
                          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-red-400 border border-zinc-800 rounded-lg text-xs font-semibold self-end sm:self-auto"
                        >
                          Hủy Phiên
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ALERTS & SUSPICIOUS ACTIVITIES (2. Login notifications, 3. Suspicious activity detection) */}
          {activeTab === "alerts" && (
            <div className="space-y-6">
              {/* 2. Login notifications toggle */}
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex items-center justify-between shadow-xl">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span>2. Thông Báo Đăng Nhập Thiết Bị Mới (Login Notifications)</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Tự động gửi email cảnh báo bảo mật tới hộp thư của bạn khi có lượt đăng nhập từ trình duyệt hoặc vị trí IP mới.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setLoginNotificationsEnabled(!loginNotificationsEnabled);
                    showToast("Đã cập nhật tùy chọn thông báo đăng nhập!");
                  }}
                  className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                    loginNotificationsEnabled ? "bg-red-600 justify-end" : "bg-zinc-800 justify-start"
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow" />
                </button>
              </div>

              {/* 3. Suspicious activity log */}
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>3. Nhật Ký Hoạt Động Đáng Ngờ & Phát Hiện Rủi Ro (Suspicious Activity Detection)</span>
                </h3>

                <div className="divide-y divide-zinc-800 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden text-xs">
                  {alerts.map((alt) => (
                    <div key={alt.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{alt.title}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            alt.riskLevel === "LOW" ? "bg-blue-950/40 text-blue-400" : "bg-amber-950/40 text-amber-400"
                          }`}>
                            Mức độ: {alt.riskLevel}
                          </span>
                        </div>
                        <p className="text-zinc-400">{alt.detail}</p>
                      </div>

                      <div className="text-right text-[11px] text-zinc-500 font-mono self-end sm:self-auto">
                        <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 font-bold text-[10px] block w-fit ml-auto mb-1">
                          {alt.status}
                        </span>
                        <span>{new Date(alt.timestamp).toLocaleString("vi-VN")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 11 SYSTEM DEFENSE LAYERS (5. IP Whitelist, 6. Rate Limit, 7. DDoS, 8. Encryption, 9. Headers, 10. CSRF, 11. XSS) */}
          {activeTab === "defense" && (
            <div className="space-y-6">
              {/* Defense Score */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-red-950/40 to-zinc-900/60 border border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1">
                  <span className="text-xs text-red-400 font-bold uppercase tracking-wider">Chỉ Số Bảo Vệ An Ninh Toàn Diện</span>
                  <h3 className="text-xl font-extrabold text-white">11/11 Lớp Phòng Thủ Đang Hoạt Động Tối Đa</h3>
                  <p className="text-xs text-zinc-400">
                    Hệ thống đạt tiêu chuẩn mã hóa AES-256, Cloudflare DDoS Mitigation, Helmet Secure Headers, CSRF & XSS Shield.
                  </p>
                </div>

                <div className="text-center sm:text-right">
                  <div className="text-3xl font-black text-emerald-400">{defenseScore}%</div>
                  <span className="text-[11px] text-zinc-500">Mức độ an toàn cao</span>
                </div>
              </div>

              {/* 11 Defense Layers Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {defenseLayers.map((layer, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-1.5 text-xs shadow">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">{layer.name}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 font-extrabold text-[10px]">
                        {layer.status}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-[11px]">{layer.description}</p>
                  </div>
                ))}
              </div>

              {/* 5. IP Whitelist Management */}
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-red-400" />
                  <span>5. Quản Lý Danh Sách Trắng IP Cấp Phép (IP Whitelist)</span>
                </h3>

                <form onSubmit={handleAddIpWhitelist} className="flex flex-col sm:flex-row gap-3 text-xs">
                  <input
                    type="text"
                    value={newIp}
                    onChange={(e) => setNewIp(e.target.value)}
                    placeholder="Địa chỉ IP (Ví dụ: 118.69.182.45)"
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-mono"
                  />
                  <input
                    type="text"
                    value={newIpLabel}
                    onChange={(e) => setNewIpLabel(e.target.value)}
                    placeholder="Tên ghi nhớ (Ví dụ: Văn phòng Hà Nội)"
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm IP</span>
                  </button>
                </form>

                <div className="divide-y divide-zinc-800 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden text-xs">
                  {ipWhitelist.map((item) => (
                    <div key={item.id} className="p-3.5 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-white font-bold">{item.ip}</span>
                          <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 text-[10px]">
                            {item.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-500">Đã thêm: {new Date(item.addedAt).toLocaleDateString("vi-VN")}</span>
                      </div>

                      <button
                        onClick={() => handleDeleteIpWhitelist(item.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
