import Link from "next/link";
import Image from "next/image";
import { MapPin, Users, ArrowRight } from "lucide-react";
import { Space } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { cloudinaryImageUrl } from "@/lib/images";
import { useLocale } from "@/components/LocaleProvider";
import { localizeSpace, translateCategory, translateUnit } from "@/lib/i18n";

export function SpaceCard({ space }: { space: Space }) {
  const { locale, t } = useLocale();
  const content = localizeSpace(space, locale);
  return (
    <article className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_35px_-24px_rgba(15,23,42,0.4)] transition hover:-translate-y-1 hover:shadow-[0_18px_42px_-28px_rgba(15,23,42,0.55)]">
      <div className="relative h-64 overflow-hidden"><Image src={cloudinaryImageUrl(space.imageUrl, 720, 420)} alt={content.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-x-0 top-0 flex items-center justify-between p-4"><span className="rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-slate-800 backdrop-blur-sm">{translateCategory(locale, space.category)}</span><span className="rounded-full bg-amber-400/90 px-3 py-1 text-xs font-semibold text-slate-900">{space.featured ? t("space.featured") : t("space.available")}</span></div></div>
      <div className="space-y-4 p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="text-xl font-semibold text-slate-900">{content.name}</h3><div className="mt-2 flex items-center gap-2 text-sm text-slate-500"><MapPin size={14} />{space.city}</div></div><div className="text-right"><div className="text-lg font-semibold text-slate-900">{formatPrice(space.price, space.currency, locale)}</div><div className="text-xs uppercase tracking-[0.18em] text-slate-500">/{translateUnit(locale, space.priceUnit)}</div></div></div><p className="line-clamp-3 text-sm leading-6 text-slate-600">{content.description}</p><div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-600"><div className="flex items-center gap-2"><Users size={16} />{space.capacityMin} - {space.capacityMax} {t("space.people")}</div><Link href={`/spaces/${space.id}`} className="inline-flex items-center gap-2 font-semibold text-slate-900">{t("space.details")}<ArrowRight size={16} /></Link></div></div>
    </article>
  );
}