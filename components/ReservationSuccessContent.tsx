"use client";

import Link from "next/link";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLocale } from "@/components/LocaleProvider";

export function ReservationSuccessContent({ trackingId }: { trackingId: string }) {
  const { t } = useLocale();
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-2xl rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mb-4 flex justify-end"><LanguageSwitcher /></div>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">✓</div>
        <h1 className="mt-6 text-3xl font-bold text-slate-900">{t("success.title")}</h1>
        <p className="mt-4 text-slate-600">{t("success.text")}</p>
        <div className="mt-8 rounded-2xl bg-slate-50 p-4 text-start">
          <div className="text-sm text-slate-500">{t("success.tracking")}</div>
          <div className="mt-2 font-mono text-lg font-semibold text-slate-900">{trackingId}</div>
          <div className="mt-6 text-sm text-slate-600">{t("success.status")}</div>
        </div>
        <Link href="/" className="btn-primary mt-8">{t("success.home")}</Link>
      </div>
    </main>
  );
}
