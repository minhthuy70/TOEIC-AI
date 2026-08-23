"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin-sidebar";
import { useAutoLogout } from "../../hooks/useAutoLogout";
import { useSessionWarning } from "../../hooks/useSessionWarning";

type UserRole =
  | "USER"
  | "CONTENT_ADMIN"
  | "SUPER_ADMIN";

type User = {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
};

export default function ContentAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  // Auto logout after inactivity
  const { showWarning, timeRemaining, handleStayLoggedIn, handleLogoutNow } = useAutoLogout();

  // Session expiration warning
  const { sessionWarning, dismissWarning } = useSessionWarning();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      if (
        parsedUser.role !== "SUPER_ADMIN" &&
        parsedUser.role !== "CONTENT_ADMIN"
      ) {
        router.replace("/dashboard");
        return;
      }

      setUser(parsedUser);
    } catch {
      localStorage.removeItem("user");
      router.replace("/login");
    }
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      <AdminSidebar user={user} />

      <main className="ml-64 flex-1 min-h-screen">
        {children}
      </main>

      {/* Auto Logout Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-600/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Sắp đăng xuất tự động</h3>
                <p className="text-sm text-zinc-400">Do không hoạt động trong 30 phút</p>
              </div>
            </div>
            
            <div className="bg-black/30 border border-zinc-800/40 rounded-xl p-4 mb-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-400 mb-1">
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </p>
                <p className="text-xs text-zinc-500">phút:giây còn lại</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleLogoutNow}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-sm font-medium transition-colors"
              >
                Đăng xuất ngay
              </button>
              <button
                onClick={handleStayLoggedIn}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-3 rounded-xl text-sm font-medium transition-colors"
              >
                Tiếp tục sử dụng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Expiration Warning */}
      {sessionWarning?.show && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
          <div className="bg-orange-600/95 border border-orange-500/30 rounded-xl p-4 shadow-xl shadow-orange-600/20 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-orange-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-white mb-1">Phiên đăng nhập sắp hết hạn</h4>
                <p className="text-xs text-orange-100">
                  Phiên đăng nhập của bạn sẽ hết hạn sau {sessionWarning.minutesLeft} phút. Hãy lưu công việc của bạn.
                </p>
              </div>
              <button
                onClick={dismissWarning}
                className="text-orange-200 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}