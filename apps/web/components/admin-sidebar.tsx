"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  BookA,
  BookOpen,
  FolderTree,
  Headphones,
  FileText,
  ClipboardList,
  Target,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Database,
} from "lucide-react";

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

export default function AdminSidebar({
  user,
}: {
  user: User;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const isSuperAdmin = user.role === "SUPER_ADMIN";

  const [grammarOpen, setGrammarOpen] = useState(
    pathname.startsWith("/content-admin/grammar")
  );

  return (
    <aside className="w-64 h-screen bg-zinc-900 border-r border-zinc-800 fixed left-0 top-0 flex flex-col">
      {/* LOGO */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-bold text-xl text-white">
            B
          </div>

          <div>
            <h1 className="font-bold text-lg text-white">
              BELLA
            </h1>

            <p className="text-xs text-zinc-500">
              ADMIN
            </p>
          </div>
        </div>
      </div>

      {/* MENU */}
      <nav className="admin-sidebar-scroll p-4 space-y-2 flex-1 overflow-y-auto pb-4">
        <AdminLink
          href="/admin"
          active={pathname === "/admin"}
          icon={<LayoutDashboard className="w-4 h-4 shrink-0" />}
        >
          Dashboard
        </AdminLink>

        {isSuperAdmin && (
          <AdminLink
            href="/admin/users"
            active={pathname.startsWith("/admin/users")}
            icon={<Users className="w-4 h-4 shrink-0" />}
          >
            Người dùng
          </AdminLink>
        )}

        <div className="pt-5 pb-2 px-3">
          <p className="text-xs font-semibold text-zinc-500 uppercase">
            Nội dung
          </p>
        </div>

        <AdminLink
          href="/content-admin/vocabulary"
          active={pathname.startsWith(
            "/content-admin/vocabulary"
          )}
          icon={<BookA className="w-4 h-4 shrink-0" />}
        >
          Từ vựng
        </AdminLink>

        {/* NGỮ PHÁP */}
        <div>
          <button
            type="button"
            onClick={() => setGrammarOpen((prev) => !prev)}
            className={`w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl transition ${
              pathname.startsWith("/content-admin/grammar")
                ? "bg-red-600 text-white"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 shrink-0" />

              <span className="font-medium">
                Ngữ pháp
              </span>
            </div>
            {grammarOpen ? (
              <ChevronDown className="w-4 h-4 shrink-0 opacity-60" />
            ) : (
              <ChevronRight className="w-4 h-4 shrink-0 opacity-60" />
            )}
          </button>

          {grammarOpen && (
            <div className="ml-5 mt-1 space-y-1 border-l border-zinc-800 pl-3">
              <Link
                href="/content-admin/grammar/categories"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                  pathname.startsWith(
                    "/content-admin/grammar/categories"
                  )
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-500 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <FolderTree className="w-3.5 h-3.5 shrink-0" />
                <span>Danh mục</span>
              </Link>

              <Link
                href="/content-admin/grammar/lessons"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                  pathname.startsWith(
                    "/content-admin/grammar/lessons"
                  )
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-500 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span>Bài học</span>
              </Link>
            </div>
          )}
        </div>

        <AdminLink
          href="/content-admin/listening"
          active={pathname.startsWith("/content-admin/listening")}
          icon={<Headphones className="w-4 h-4 shrink-0" />}
        >
          Listening
        </AdminLink>

        <AdminLink
          href="/content-admin/reading"
          active={pathname.startsWith("/content-admin/reading")}
          icon={<FileText className="w-4 h-4 shrink-0" />}
        >
          Reading
        </AdminLink>

        <AdminLink
          href="/admin/question-bank"
          active={pathname.startsWith("/admin/question-bank")}
          icon={<Database className="w-4 h-4 shrink-0" />}
        >
          Ngân hàng câu hỏi
        </AdminLink>

        <AdminLink
          href="/admin/tests"
          active={pathname.startsWith("/admin/tests")}
          icon={<ClipboardList className="w-4 h-4 shrink-0" />}
        >
          Đề thi
        </AdminLink>

        {isSuperAdmin && (
          <>
            <div className="pt-5 pb-2 px-3">
              <p className="text-xs font-semibold text-zinc-500 uppercase">
                Hệ thống
              </p>
            </div>

            <AdminLink
              href="/admin/stage-requests"
              active={pathname.startsWith(
                "/admin/stage-requests"
              )}
              icon={<Target className="w-4 h-4 shrink-0" />}
            >
              Yêu cầu chặng
            </AdminLink>

            <AdminLink
              href="/admin/settings"
              active={pathname.startsWith(
                "/admin/settings"
              )}
              icon={<Settings className="w-4 h-4 shrink-0" />}
            >
              Cài đặt
            </AdminLink>
          </>
        )}
      </nav>

      {/* USER */}
      <div className="p-4 border-t border-zinc-800">
        <div className="bg-zinc-800 rounded-xl p-3">
          <p className="font-semibold text-sm truncate text-white">
            {user.fullName}
          </p>

          <p className="text-xs text-zinc-500 truncate">
            {user.email}
          </p>

          <div className="mt-2">
            <span
              className={`text-xs px-2 py-1 rounded-md ${
                isSuperAdmin
                  ? "bg-red-600/20 text-red-400"
                  : "bg-blue-600/20 text-blue-400"
              }`}
            >
              {user.role}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");

            router.push("/login");
          }}
          className="w-full mt-3 py-2 flex items-center justify-center gap-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
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
  icon: React.ReactNode;
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
      {icon}
      <span className="font-medium">
        {children}
      </span>
    </Link>
  );
}