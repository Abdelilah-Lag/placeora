"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart3, Building2, CalendarClock, FolderOpen } from "lucide-react";

import { AdminSidebar } from "@/components/AdminSidebar";
import { useLocale } from "@/components/LocaleProvider";
import { Reservation, Space } from "@/lib/types";

export default function AdminDashboardPage() {
  const { t } = useLocale();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const [spacesResponse, reservationsResponse] = await Promise.all([fetch("/api/admin/spaces"), fetch("/api/admin/reservations")]);
        if (!spacesResponse.ok || !reservationsResponse.ok) throw new Error(t("admin.saveError"));
        const [spacesResult, reservationsResult] = await Promise.all([spacesResponse.json(), reservationsResponse.json()]);
        if (active) {
          setSpaces(spacesResult.data || []);
          setReservations(reservationsResult.data || []);
        }
      } catch {
        if (active) setError(t("admin.saveError"));
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadData();
    return () => { active = false; };
  }, [t]);

  const totalActive = spaces.filter((space) => space.status === "ACTIVE").length;
  const pending = reservations.filter((reservation) => reservation.status === "PENDING").length;
  const confirmed = reservations.filter((reservation) => reservation.status === "CONFIRMED").length;
  const recent = [...reservations].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
  const metrics = [
    [t("admin.spacesCount"), spaces.length, Building2, "text-slate-500"],
    [t("admin.active"), totalActive, FolderOpen, "text-emerald-600"],
    [t("admin.pending"), pending, CalendarClock, "text-amber-600"],
    [t("admin.confirmed"), confirmed, BarChart3, "text-blue-600"],
  ] as const;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8"><div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row"><AdminSidebar /><main className="min-w-0 flex-1 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{t("admin.dashboard")}</p><h1 className="mt-2 text-3xl font-bold text-slate-900">{t("admin.management")}</h1></div><Link href="/admin/spaces" className="btn-primary">{t("admin.manageSpaces")}</Link></div>
      {error ? <p role="alert" className="mt-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{error}</p> : null}
      {loading ? <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-600">{t("admin.loading")}</div> : <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value, Icon, color]) => <div key={label} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">{label}</span><Icon size={18} className={color} /></div><div className="mt-4 text-3xl font-bold text-slate-900">{value}</div></div>)}</div>}
      <div className="mt-10"><h2 className="text-xl font-bold text-slate-900">{t("admin.recent")}</h2><div className="mt-4 space-y-3">{recent.map((reservation) => <div key={reservation.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><div><div className="font-medium text-slate-900">{reservation.customerName}</div><div className="text-sm text-slate-500">{reservation.spaceName} · {reservation.date}</div></div><span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700">{t(`status.${reservation.status.toLowerCase()}`)}</span></div>)}</div></div>
    </main></div></div>
  );
}
