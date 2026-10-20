"use client";

import Link from "next/link";
import { CalendarCheck2, Globe, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { appSettings } from "@/lib/data";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLocale } from "@/components/LocaleProvider";

const publicSettings = {
  siteName: appSettings.siteName,
  city: appSettings.city,
};

export function Footer() {
  const { t } = useLocale();
  return (
    <footer id="contact" className="bg-slate-950 text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div>
          <h3 className="text-2xl font-semibold text-white">{publicSettings.siteName}</h3>
          <p className="mt-4 max-w-md text-sm text-slate-300">{t("footer.description")}</p>
          <div className="mt-6 space-y-3 text-sm text-slate-300">
            <div className="flex items-center gap-3"><MapPin size={16} />{publicSettings.city}, {t("footer.country")}</div>
            <a href={`mailto:${appSettings.contactEmail}`} className="flex items-center gap-3 hover:text-white"><Mail size={16} />{appSettings.contactEmail}</a>
            <a href={`tel:${appSettings.contactPhone.replace(/\s/g, "")}`} className="flex items-center gap-3 hover:text-white"><Phone size={16} />{t("footer.phone")}: {appSettings.contactPhone}</a>
            <a href={`https://wa.me/${appSettings.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-white"><MessageCircle size={16} />WhatsApp: {appSettings.whatsapp}</a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">{t("footer.navigation")}</h4>
          <ul className="mt-5 space-y-3 text-sm text-slate-300">
            <li><Link href="/">{t("nav.home")}</Link></li>
            <li><Link href="/events">{t("nav.events")}</Link></li>
            <li><Link href="/reservation">{t("nav.book")}</Link></li>
            <li><Link href="/admin/login">{t("admin.dashboard")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">{t("footer.social")}</h4>
          <div className="mt-5 flex gap-3 text-slate-300">
            <a href="https://instagram.com" className="rounded-full border border-slate-700 p-2 hover:border-slate-500" aria-label="Instagram"><Globe size={16} /></a>
            <a href="https://linkedin.com" className="rounded-full border border-slate-700 p-2 hover:border-slate-500" aria-label="LinkedIn"><CalendarCheck2 size={16} /></a>
            <a href="https://facebook.com" className="rounded-full border border-slate-700 p-2 hover:border-slate-500" aria-label="Facebook"><Mail size={16} /></a>
          </div>
          <div className="mt-8 text-xs text-slate-400">
            <Link href="/privacy" className="mr-4">{t("footer.privacy")}</Link>
            <Link href="/terms">{t("footer.terms")}</Link>
          </div>
          <div className="mt-5"><LanguageSwitcher /></div>
        </div>
      </div>
      <div className="border-t border-slate-800 px-4 py-4 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Placeora. {t("footer.rights")}
      </div>
    </footer>
  );
}
