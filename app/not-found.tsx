"use client";

import Link from "next/link";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLocale } from "@/components/LocaleProvider";

export default function NotFound() {
  const { t } = useLocale();
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mb-4 flex justify-end"><LanguageSwitcher /></div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">404</p>
        <h1 className="mt-4 text-4xl font-bold text-slate-900">{t("notFound.title")}</h1>
        <p className="mt-4 text-slate-600">{t("notFound.text")}</p>
        <Link href="/" className="btn-primary mt-8">{t("notFound.home")}</Link>
      </div>
    </main>
  );
}
