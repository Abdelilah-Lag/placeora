"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarCheck2, Menu, Search } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLocale } from "@/components/LocaleProvider";

export function Navbar() {
  const { t } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = [
    { href: "/", label: t("nav.home") },
    { href: "/events", label: t("nav.events") },
    { href: "/events", label: t("nav.spaces") },
    { href: "/#how-it-works", label: t("nav.how") },
    { href: "/#contact", label: t("nav.contact") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-slate-900"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm"><CalendarCheck2 size={20} /></div><div><div className="text-lg font-semibold tracking-wide">Placeora</div><div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Spaces</div></div></Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-700 md:flex">{navItems.map((item) => (<Link key={item.href + item.label} href={item.href} className="transition hover:text-slate-950">{item.label}</Link>))}</nav>
        <div className="hidden items-center gap-3 md:flex"><LanguageSwitcher /><Link href="/events" className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"><Search size={16} />{t("nav.search")}</Link><Link href="/reservation" className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700">{t("nav.book")}</Link></div>
        <button onClick={() => setMenuOpen((open) => !open)} className="inline-flex rounded-full border border-slate-200 p-2 md:hidden" aria-label={menuOpen ? t("nav.closeMenu") : t("nav.openMenu")} aria-expanded={menuOpen}><Menu size={18} /></button>
      </div>
      {menuOpen ? <div className="space-y-3 border-t border-slate-200 px-4 py-4 md:hidden"><nav className="flex flex-col gap-3">{navItems.map((item) => (<Link key={item.href + item.label} href={item.href} onClick={() => setMenuOpen(false)} className="text-sm font-medium text-slate-700">{item.label}</Link>))}</nav><div className="flex items-center justify-between"><LanguageSwitcher /><Link href="/reservation" onClick={() => setMenuOpen(false)} className="btn-primary">{t("nav.book")}</Link></div></div> : null}
    </header>
  );
}