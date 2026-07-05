"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export function AdminSidebarLogout() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await Promise.allSettled([
      supabase.auth.signOut(),
      fetch("/api/v1/auth/signout", { method: "POST", credentials: "same-origin" }),
    ]);
    router.replace("/admin/login");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="w-full rounded-[10px] px-3 py-2 text-left text-sm font-medium text-ink-secondary transition-colors hover:bg-bg-surface hover:text-ink"
    >
      Sign out
    </button>
  );
}
