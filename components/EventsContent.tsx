"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SpaceCard } from "@/components/SpaceCard";
import { EmptyState } from "@/components/EmptyState";
import { useLocale } from "@/components/LocaleProvider";
import { localizeSpace } from "@/lib/i18n";
import { Space } from "@/lib/types";

const categories = ["all", "Professionnel", "Conférence", "Anniversaire", "Mariage", "Soirée", "Famille"];

export function EventsContent({ initialCategory = "all" }: { initialCategory?: string }) {
  const { locale, t } = useLocale();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [city, setCity] = useState("all");
  const [minCapacity, setMinCapacity] = useState("0");
  const [maxBudget, setMaxBudget] = useState("2000");
  const [sort, setSort] = useState("price_asc");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadSpaces() {
      try {
        const response = await fetch("/api/spaces");
        if (!response.ok) throw new Error("Spaces request failed.");
        const result = await response.json();
        if (active) setSpaces(result.data || []);
      } catch {
        if (active) setLoadError(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadSpaces();
    return () => { active = false; };
  }, []);

  const filteredSpaces = useMemo(() => {
    const next = [...spaces].filter((space) => {
      const content = localizeSpace(space, locale);
      const matchesQuery = !query || `${content.name} ${content.description}`.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "all" || space.category === category;
      const matchesCity = city === "all" || space.city === city;
      const matchesCapacity = Number(minCapacity || 0) <= (space.capacityMax ?? 0);
      const matchesBudget = !maxBudget || Number(maxBudget) >= space.price;
      return matchesQuery && matchesCategory && matchesCity && matchesCapacity && matchesBudget;
    });
    next.sort((a, b) => {
      if (sort === "price_desc") return b.price - a.price;
      if (sort === "name_asc") return localizeSpace(a, locale).name.localeCompare(localizeSpace(b, locale).name);
      return a.price - b.price;
    });
    return next;
  }, [spaces, query, category, city, minCapacity, maxBudget, sort, locale]);

  const cities = ["all", ...new Set(spaces.map((space) => space.city))];

  return (
    <>
      <Navbar />
      <main className="pb-20">
        <section className="border-b border-slate-200 bg-white"><div className="container-shell py-12"><div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{t("events.eyebrow")}</p><h1 className="mt-3 text-4xl font-bold text-slate-900">{t("events.title")}</h1></div><Link href="/reservation" className="btn-primary">{t("nav.book")}</Link></div></div></section>
        <section className="container-shell py-10"><div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-6"><div className="grid gap-4 md:grid-cols-6">
          <label className="md:col-span-2"><span className="mb-2 block text-sm font-medium text-slate-700">{t("events.search")}</span><div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5"><Search size={16} className="text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("events.query")} className="w-full bg-transparent text-sm outline-none" /></div></label>
          <label><span className="mb-2 block text-sm font-medium text-slate-700">{t("events.category")}</span><select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none">{categories.map((item) => <option key={item} value={item}>{item === "all" ? t("events.all") : t(`category.${({ Professionnel: "professional", Conférence: "conference", Anniversaire: "birthday", Mariage: "wedding", Soirée: "evening", Famille: "family" } as Record<string, string>)[item] || "other"}`)}</option>)}</select></label>
          <label><span className="mb-2 block text-sm font-medium text-slate-700">{t("events.city")}</span><select value={city} onChange={(event) => setCity(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none">{cities.map((item) => <option key={item} value={item}>{item === "all" ? t("events.all") : item}</option>)}</select></label>
          <label><span className="mb-2 block text-sm font-medium text-slate-700">{t("events.capacity")}</span><input value={minCapacity} onChange={(event) => setMinCapacity(event.target.value)} type="number" min={0} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none" /></label>
          <label><span className="mb-2 block text-sm font-medium text-slate-700">{t("events.budget")}</span><input value={maxBudget} onChange={(event) => setMaxBudget(event.target.value)} type="number" min={0} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none" /></label>
        </div><div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-2 text-sm text-slate-600"><SlidersHorizontal size={16} />{filteredSpaces.length} {t("events.count")}</div><div className="flex items-center gap-3"><span className="text-sm text-slate-600">{t("events.sort")}</span><select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none"><option value="price_asc">{t("events.priceAsc")}</option><option value="price_desc">{t("events.priceDesc")}</option><option value="name_asc">{t("events.name")}</option></select></div></div></div></section>
        <section className="container-shell py-6">{loading ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">{t("admin.loading")}</div> : loadError ? <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">{t("reservation.error")}</p> : filteredSpaces.length ? <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">{filteredSpaces.map((space) => <SpaceCard key={space.id} space={space} />)}</div> : <EmptyState title={t("events.none")} description={t("events.noneText")} />}</section>
      </main>
      <Footer />
    </>
  );
}
