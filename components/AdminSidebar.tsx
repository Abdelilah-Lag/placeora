"use client";

import Link from "next/link";
import { BarChart3, Building2, CalendarClock, LogOut } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLocale } from "@/components/LocaleProvider";

export function AdminSidebar() {
  const { t } = useLocale();
  const items = [
    { href: "/admin", label: t("admin.dashboard"), icon: BarChart3 },
    { href: "/admin/spaces", label: t("admin.spaces"), icon: Building2 },
    { href: "/admin/reservations", label: t("admin.reservations"), icon: CalendarClock },
  ];
  return (
    <aside className="flex w-full max-w-[280px] flex-col rounded-[32px] border border-slate-200 bg-slate-950 p-5 text-slate-200 shadow-sm">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-amber-300">P</div>
        <div>
          <div className="text-lg font-semibold text-white">Placeora</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Admin</div>
        </div>
      </div>

      <nav className="space-y-2">
        {items.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-200 transition hover:bg-white/5">
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-8">
        <div className="mb-4"><LanguageSwitcher /></div>
        <form action="/api/admin/logout" method="post">
          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-700 px-3 py-3 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-900">
            <LogOut size={16} />
            {t("admin.logout")}
          </button>
        </form>
      </div>
    </aside>
  );
}
