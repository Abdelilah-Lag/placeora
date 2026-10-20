"use client";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ReservationForm } from "@/components/ReservationForm";
import { useLocale } from "@/components/LocaleProvider";

export function ReservationPageContent({ initialSpaceId }: { initialSpaceId: string }) {
  const { t } = useLocale();
  return (
    <>
      <Navbar />
      <main className="container-shell py-12 md:py-16">
        <div className="mb-8 max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{t("reservation.eyebrow")}</p><h1 className="mt-3 text-4xl font-bold text-slate-900">{t("reservation.title")}</h1></div>
        <ReservationForm initialSpaceId={initialSpaceId} />
      </main>
      <Footer />
    </>
  );
}
