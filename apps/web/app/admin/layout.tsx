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