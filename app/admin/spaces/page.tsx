"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import { AdminSidebar } from "@/components/AdminSidebar";
import { SpaceAdminForm } from "@/components/SpaceAdminForm";
import { useLocale } from "@/components/LocaleProvider";
import { localizeSpace, translateAdminError, translateCategory } from "@/lib/i18n";
import { Space, SpaceCategory } from "@/lib/types";

const categories: SpaceCategory[] = ["Professionnel", "Conférence", "Anniversaire", "Mariage", "Soirée", "Famille", "Séminaire", "Formation", "Autre"];

export default function AdminSpacesPage() {
  const { locale, t } = useLocale();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState<Space | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [uploadLimits, setUploadLimits] = useState({ maxImageBytes: 8 * 1024 * 1024, maxGalleryImages: 8 });

  const refreshSpaces = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/spaces");
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(translateAdminError(locale, result.error || ""));
      setSpaces(result.data);
      if (result.limits) setUploadLimits(result.limits);
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("admin.error.save"));
    } finally {
      setLoading(false);
    }
  }, [locale, t]);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/spaces")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(translateAdminError(locale, result.error || ""));
        return result;
      })
      .then((result) => {
        if (active) {
          setSpaces(result.data);
          if (result.limits) setUploadLimits(result.limits);
          setError("");
        }
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof Error ? caught.message : t("admin.error.save"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [locale, t]);

  const filtered = useMemo(() => spaces.filter((space) => {
    const localized = localizeSpace(space, locale);
    const matchesText = !query || `${localized.name} ${space.city}`.toLowerCase().includes(query.toLowerCase());
    return matchesText && (categoryFilter === "all" || space.category === categoryFilter) &&
      (statusFilter === "all" || space.status === statusFilter);
  }), [spaces, query, categoryFilter, statusFilter, locale]);

  async function toggleStatus(space: Space) {
    setError("");
    try {
      const response = await fetch("/api/admin/spaces", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: space.id, status: space.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(translateAdminError(locale, result.error || ""));
      setNotice(t(space.status === "ACTIVE" ? "admin.unpublish" : "admin.publish"));
      await refreshSpaces();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("admin.error.save"));
    }
  }

  async function archiveSpace(space: Space) {
    if (!window.confirm(t("admin.confirmDelete"))) return;
    setError("");
    try {
      const response = await fetch("/api/admin/spaces", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: space.id }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(translateAdminError(locale, result.error || ""));
      setNotice(t("admin.archive"));
      await refreshSpaces();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("admin.error.save"));
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row"><AdminSidebar />
        <main className="min-w-0 flex-1 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{t("admin.spaces")}</p><h1 className="mt-2 text-3xl font-bold text-slate-900">{t("admin.spacesTitle")}</h1></div><button onClick={() => setEditing(null)} className="btn-primary gap-2"><Plus size={17} />{t("admin.addSpace")}</button></div>
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{t("admin.storageNotice")}</p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <label className="relative"><span className="sr-only">{t("admin.searchSpace")}</span><Search size={16} className="absolute start-3 top-3 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("admin.searchSpace")} className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pe-3 ps-10 text-sm outline-none" /></label>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label={t("admin.filterCategory")} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none"><option value="all">{t("admin.filterCategory")}</option>{categories.map((category) => <option key={category} value={category}>{translateCategory(locale, category)}</option>)}</select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label={t("admin.filterStatus")} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none"><option value="all">{t("admin.filterStatus")}</option><option value="ACTIVE">{t("admin.publish")}</option><option value="INACTIVE">{t("admin.unpublish")}</option><option value="ARCHIVED">{t("admin.statusArchived")}</option></select>
          </div>
          {notice ? <p role="status" className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p> : null}
          {error ? <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p> : null}
          {loading ? <p className="mt-8 text-slate-600">{t("admin.loading")}</p> : filtered.length ? <div className="mt-6 space-y-4">{filtered.map((space) => {
            const content = localizeSpace(space, locale);
            return <article key={space.id} className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-4"><Image src={space.imageUrl} alt={content.name} width={96} height={80} className="h-20 w-24 rounded-2xl object-cover" /><div className="min-w-0"><h2 className="truncate text-lg font-semibold text-slate-900">{content.name}</h2><p className="text-sm text-slate-500">{space.city} · {translateCategory(locale, space.category)}</p><p className="mt-1 text-xs text-slate-500">{space.capacityMin}–{space.capacityMax} · {space.price} {space.currency} · {space.status === "ARCHIVED" ? t("admin.statusArchived") : t(space.status === "ACTIVE" ? "admin.publish" : "admin.unpublish")}</p><p className="text-xs text-slate-400">{new Intl.DateTimeFormat(locale).format(new Date(space.updatedAt))}</p></div></div>
              <div className="flex flex-wrap items-center gap-2"><button onClick={() => setEditing(space)} className="btn-secondary !px-3 !py-2">{t("admin.edit")}</button>{space.status === "ACTIVE" ? <Link href={`/spaces/${space.id}`} className="btn-secondary !px-3 !py-2">{t("admin.view")}</Link> : null}<button onClick={() => void toggleStatus(space)} disabled={space.status === "ARCHIVED"} className="btn-secondary !px-3 !py-2 disabled:opacity-50">{space.status === "ACTIVE" ? t("admin.unpublish") : t("admin.publish")}</button><button onClick={() => void archiveSpace(space)} disabled={space.status === "ARCHIVED"} className="rounded-full border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 disabled:opacity-50">{t("admin.delete")}</button></div>
            </article>;
          })}</div> : <p className="mt-8 rounded-2xl bg-slate-50 p-8 text-center text-slate-500">{t("admin.noSpaces")}</p>}
        </main>
      </div>
      {editing !== undefined ? <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/50 p-3 md:p-8"><div className="mx-auto my-4 max-w-4xl"><SpaceAdminForm key={editing?.id || "new"} space={editing || undefined} maxImageBytes={uploadLimits.maxImageBytes} maxGalleryImages={uploadLimits.maxGalleryImages} onCancel={() => setEditing(undefined)} onSaved={(message) => { setNotice(message); setEditing(undefined); void refreshSpaces(); }} /></div></div> : null}
    </div>
  );
}
