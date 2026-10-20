"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarRange, MapPin, Sparkles, Users } from "lucide-react";
import type { ReactNode } from "react";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { EmptyState } from "@/components/EmptyState";
import { SpaceCard } from "@/components/SpaceCard";
import { useLocale } from "@/components/LocaleProvider";
import { translateCategory } from "@/lib/i18n";
import type { Space } from "@/lib/types";

const categoryKeys = [
  ["Professionnel", "category.professionalDesc"],
  ["Conférence", "category.conferenceDesc"],
  ["Anniversaire", "category.birthdayDesc"],
  ["Mariage", "category.weddingDesc"],
  ["Soirée", "category.eveningDesc"],
  ["Famille", "category.familyDesc"],
];

export function HomeContent({ spaces }: { spaces: Space[] }) {
  const { locale, t } = useLocale();
  const featured = spaces.slice(0, 3);
  const steps: [string, string, ReactNode][] = [
    ["home.step1", "home.step1Text", <MapPin key="discover" size={18} />],
    ["home.step2", "home.step2Text", <CalendarRange key="choose" size={18} />],
    ["home.step3", "home.step3Text", <Users key="send" size={18} />],
    ["home.step4", "home.step4Text", <Sparkles key="confirm" size={18} />],
  ];

  return (
    <>
      <Navbar />
      <main>
        <section className="container-shell py-10 md:py-16">
          <div className="grid items-center gap-8 overflow-hidden rounded-[32px] bg-white p-6 shadow-[0_25px_90px_-40px_rgba(15,23,42,0.45)] md:grid-cols-[1.1fr_0.9fr] md:p-10">
            <div>
              <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900">{t("home.badge")}</span>
              <h1 className="mt-5 max-w-xl text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">{t("home.title")}</h1>
              <p className="mt-5 max-w-lg text-lg text-slate-600">{t("home.description")}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/events" className="btn-primary">{t("home.discover")}</Link>
                <Link href="/reservation" className="btn-secondary">{t("home.organize")}</Link>
              </div>
            </div>
            <div className="relative">
              <Image src="/images/placeora-morocco.png" alt={t("home.landmarkAlt")} width={1198} height={768} priority className="h-[480px] w-full rounded-[28px] object-cover" />
            </div>
          </div>
        </section>
        <section className="container-shell py-10 md:py-14">
          <div className="mb-6"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{t("home.quick")}</p><h2 className="mt-2 text-3xl font-bold text-slate-900">{t("home.quickTitle")}</h2></div>
          <div className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3 md:p-6">
            <label><span className="mb-2 block text-sm font-medium text-slate-700">{t("home.eventType")}</span><select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none">{categoryKeys.map(([category]) => <option key={category} value={category}>{translateCategory(locale, category)}</option>)}</select></label>
            <label><span className="mb-2 block text-sm font-medium text-slate-700">{t("home.city")}</span><input placeholder="Rabat" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none" /></label>
            <div className="flex items-end"><Link href="/events" className="btn-primary w-full">{t("home.search")}</Link></div>
          </div>
        </section>
        <section className="container-shell py-8 md:py-12">
          <div className="mb-6"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{t("home.categories")}</p><h2 className="mt-2 text-3xl font-bold text-slate-900">{t("home.categoriesTitle")}</h2></div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{categoryKeys.map(([category, description], index) => <Link key={category} href={`/events?category=${encodeURIComponent(category)}`} className="group rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">{index % 2 === 0 ? <Sparkles size={18} /> : <CalendarRange size={18} />}</div><h3 className="mt-5 text-xl font-semibold text-slate-900">{t(`category.${["professional", "conference", "birthday", "wedding", "evening", "family"][index]}`)}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{t(description)}</p><div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">{t("home.viewSpaces")}<ArrowRight size={16} /></div></Link>)}</div>
        </section>
        <section className="container-shell py-8 md:py-12">
          <div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{t("home.recommended")}</p><h2 className="mt-2 text-3xl font-bold text-slate-900">{t("home.recommendedTitle")}</h2></div><Link href="/events" className="hidden items-center gap-2 text-sm font-semibold text-slate-900 md:inline-flex">{t("home.viewAll")}<ArrowRight size={16} /></Link></div>
          {featured.length ? <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">{featured.map((space) => <SpaceCard key={space.id} space={space} />)}</div> : <EmptyState title={t("home.emptySpaces")} description={t("home.emptySpacesText")} />}
        </section>
        <section id="how-it-works" className="container-shell py-8 md:py-12">
          <div className="mb-8 text-center"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{t("home.how")}</p><h2 className="mt-2 text-3xl font-bold text-slate-900">{t("home.howTitle")}</h2></div>
          <div className="grid gap-6 md:grid-cols-4">{steps.map(([title, description, icon]) => <div key={title} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">{icon}</div><h3 className="mt-5 text-xl font-semibold text-slate-900">{t(title)}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{t(description)}</p></div>)}</div>
        </section>
        <section className="container-shell py-10 md:py-14"><div className="rounded-[32px] bg-slate-900 px-6 py-10 text-center text-white md:px-10"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">{t("home.cta")}</p><h2 className="mt-4 text-3xl font-bold">{t("home.ctaTitle")}</h2><p className="mx-auto mt-4 max-w-2xl text-slate-300">{t("home.ctaText")}</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="#contact" className="btn-primary bg-white text-slate-900 hover:bg-slate-100">{t("home.contact")}</Link><Link href="/reservation" className="btn-secondary border-slate-700 bg-transparent text-white hover:bg-slate-800">{t("nav.book")}</Link></div></div></section>
      </main>
      <Footer />
    </>
  );
}
