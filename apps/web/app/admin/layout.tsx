"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import Link from "next/link";
import AdminSidebar from "@/components/admin-sidebar";
import { useAutoLogout } from "../../hooks/useAutoLogout";

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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] =
    useState<User | null>(null);

  // Auto logout after inactivity
  const { showWarning, timeRemaining, handleStayLoggedIn, handleLogoutNow } = useAutoLogout();

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedUser =
        JSON.parse(storedUser);

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

  const isSuperAdmin =
    user.role === "SUPER_ADMIN";

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
    </div>
  );
}

function AdminLink({
  href,
  active,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition ${
        active
          ? "bg-red-600 text-white"
          : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
      }`}
    >
      <span>{icon}</span>

      <span className="font-medium">
        {children}
      </span>
    </Link>
  );
}