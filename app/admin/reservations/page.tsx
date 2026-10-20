"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminTable } from "@/components/AdminTable";
import { useLocale } from "@/components/LocaleProvider";
import { Reservation } from "@/lib/types";

export default function AdminReservationsPage() {
  const { t } = useLocale();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const refreshReservations = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/reservations");
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(t("admin.saveError"));
      setReservations(result.data || []);
      setError("");
    } catch {
      setError(t("admin.saveError"));
    }
  }, [t]);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/reservations")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(t("admin.saveError"));
        return result;
      })
      .then((result) => {
        if (active) {
          setReservations(result.data || []);
          setError("");
        }
      })
      .catch(() => {
        if (active) setError(t("admin.saveError"));
      });
    return () => { active = false; };
  }, [t]);

  async function updateStatus(id: string, status: Reservation["status"]) {
    setError("");
    try {
      const response = await fetch("/api/admin/reservations", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(t("admin.saveError"));
      await refreshReservations();
    } catch {
      setError(t("admin.saveError"));
    }
  }

  const filtered = useMemo(() => reservations.filter((reservation) => {
    const matchesText = !query || `${reservation.customerName} ${reservation.email} ${reservation.spaceName}`.toLowerCase().includes(query.toLowerCase());
    return matchesText && (statusFilter === "all" || reservation.status === statusFilter);
  }), [reservations, query, statusFilter]);

  const rows = filtered.map((reservation) => [
    reservation.id,
    reservation.date,
    reservation.customerName,
    reservation.phone,
    reservation.email,
    reservation.spaceName,
    reservation.eventType,
    `${reservation.startTime} - ${reservation.endTime}`,
    reservation.guests,
    <span key={`status-${reservation.id}`} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{t(`status.${reservation.status.toLowerCase()}`)}</span>,
    <div key={`actions-${reservation.id}`} className="flex flex-wrap gap-2"><button onClick={() => void updateStatus(reservation.id, "CONFIRMED")} className="rounded-full bg-emerald-600 px-2 py-1 text-xs font-medium text-white">{t("admin.confirm")}</button><button onClick={() => void updateStatus(reservation.id, "REJECTED")} className="rounded-full bg-rose-600 px-2 py-1 text-xs font-medium text-white">{t("admin.reject")}</button><button onClick={() => void updateStatus(reservation.id, "CANCELLED")} className="rounded-full bg-slate-700 px-2 py-1 text-xs font-medium text-white">{t("admin.cancelBooking")}</button></div>,
  ]);

  const headers = ["tableId", "tableDate", "tableCustomer", "tablePhone", "tableEmail", "tableSpace", "tableType", "tableTime", "tableGuests", "tableStatus", "tableActions"].map((key) => t(`admin.${key}`));

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8"><div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row"><AdminSidebar /><main className="min-w-0 flex-1 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{t("admin.reservations")}</p><h1 className="mt-2 text-3xl font-bold text-slate-900">{t("admin.reservationsTitle")}</h1></div><button onClick={() => void refreshReservations()} className="btn-secondary">{t("admin.refresh")}</button></div>
      {error ? <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p> : null}
      <div className="mt-6 grid gap-4 md:grid-cols-2"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("admin.searchReservation")} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none" /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none"><option value="all">{t("admin.filterStatus")}</option>{(["PENDING", "CONFIRMED", "REJECTED", "CANCELLED"] as const).map((status) => <option key={status} value={status}>{t(`status.${status.toLowerCase()}`)}</option>)}</select></div>
      {filtered.length ? <div className="mt-6"><AdminTable headers={headers} rows={rows} /></div> : <p className="mt-6 rounded-2xl bg-slate-50 p-8 text-center text-slate-500">{t("admin.noReservations")}</p>}
    </main></div></div>
  );
}
