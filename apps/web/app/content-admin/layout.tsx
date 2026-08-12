"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function ContentAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

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
    </div>
  );
}