"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Building2, CalendarDays, CheckCircle2, MapPin, Users } from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";
import { localizeSpace, translateCategory, translateUnit } from "@/lib/i18n";
import { cloudinaryImageUrl } from "@/lib/images";
import type { Space } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export function SpaceDetailsContent({ space }: { space: Space }) {
  const { locale, t } = useLocale();
  const content = localizeSpace(space, locale);
  const gallery = space.galleryImages?.length ? space.galleryImages.map((image) => image.url) : space.galleryUrls;

  return (
    <main className="container-shell py-10 md:py-14">
      <Link href="/events" className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"><ArrowLeft size={16} />{t("space.back")}</Link>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="relative h-[420px] overflow-hidden rounded-[32px] bg-white shadow-sm ring-1 ring-slate-200"><Image src={cloudinaryImageUrl(space.imageUrl, 1200, 800)} alt={content.name} fill sizes="(max-width: 1024px) 100vw, 60vw" priority className="object-cover" /></div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">{gallery.map((url, index) => <div key={`${space.id}-${url}`} className="relative h-40 overflow-hidden rounded-[24px] border border-slate-200 bg-white"><Image src={cloudinaryImageUrl(url, 600, 400)} alt={`${content.name} - ${index + 1}`} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" /></div>)}</div>
        </div>
        <aside className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4"><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-900">{translateCategory(locale, space.category)}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{t(space.status === "ACTIVE" ? "space.statusActive" : space.status === "ARCHIVED" ? "space.statusArchived" : "space.statusInactive")}</span></div>
          <h1 className="mt-5 text-3xl font-bold text-slate-900">{content.name}</h1><div className="mt-4 flex items-center gap-2 text-slate-600"><MapPin size={16} />{space.address}, {space.city}</div>
          <div className="mt-6 rounded-2xl bg-slate-50 p-4"><div className="text-sm text-slate-500">{t("space.price")}</div><div className="mt-1 text-3xl font-bold text-slate-900">{formatPrice(space.price, space.currency, locale)}</div><div className="text-sm text-slate-500">{translateUnit(locale, space.priceUnit)}</div></div>
          <div className="mt-6 space-y-3 text-sm text-slate-600"><div className="flex items-center gap-2"><Users size={16} className="text-slate-500" />{space.capacityMin}–{space.capacityMax} {t("space.people")}</div><div className="flex items-center gap-2"><CalendarDays size={16} className="text-slate-500" />{t("space.availability")}</div><div className="flex items-center gap-2"><Building2 size={16} className="text-slate-500" />{t("space.amenities")} &amp; {t("space.services")}</div></div>
          <Link href={`/reservation?spaceId=${space.id}`} className="btn-primary mt-8 w-full">{t("space.request")}</Link>
        </aside>
      </div>
      <section className="mt-12 grid gap-10 lg:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-2xl font-bold text-slate-900">{t("space.description")}</h2><p className="mt-4 leading-7 text-slate-600">{content.description}</p><div className="mt-8 grid gap-5 sm:grid-cols-2"><div><h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{t("space.amenities")}</h3><ul className="mt-4 space-y-2 text-sm text-slate-600">{content.amenities.map((item, index) => <li key={`${item}-${index}`} className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-600" />{item}</li>)}</ul></div><div><h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{t("space.services")}</h3><ul className="mt-4 space-y-2 text-sm text-slate-600">{content.services.map((item, index) => <li key={`${item}-${index}`} className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-600" />{item}</li>)}</ul></div></div></div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-2xl font-bold text-slate-900">{t("space.info")}</h2><div className="mt-6 space-y-4 text-sm text-slate-600"><p>{t("space.info1")}</p><p>{t("space.info2")}</p><p>{t("space.info3")}</p></div></div>
      </section>
    </main>
  );
}
