"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useLocale } from "@/components/LocaleProvider";
import { localizeSpace, translateCategory } from "@/lib/i18n";
import { Space } from "@/lib/types";

type ReservationFormData = {
  customerName: string;
  email: string;
  phone: string;
  company: string;
  eventType: string;
  spaceId: string;
  spaceName: string;
  date: string;
  startTime: string;
  endTime: string;
  guests: number;
  budget: string;
  message: string;
  servicesRequested: string;
};

export function ReservationForm({ initialSpaceId = "" }: { initialSpaceId?: string }) {
  const router = useRouter();
  const { locale, t } = useLocale();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [formData, setFormData] = useState<ReservationFormData>({
    customerName: "", email: "", phone: "", company: "", eventType: "Professionnel",
    spaceId: initialSpaceId, spaceName: "", date: "", startTime: "09:00", endTime: "12:00",
    guests: 20, budget: "", message: "", servicesRequested: "",
  });
  const [loadingSpaces, setLoadingSpaces] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadSpaces() {
      try {
        const response = await fetch("/api/spaces");
        if (!response.ok) throw new Error("Could not load spaces.");
        const result = await response.json();
        if (active) {
          const loadedSpaces: Space[] = result.data || [];
          setSpaces(loadedSpaces);
          const selected = loadedSpaces.find((item) => item.id === initialSpaceId);
          if (selected) setFormData((current) => ({ ...current, spaceId: selected.id, spaceName: selected.name }));
        }
      } catch {
        if (active) setError(t("reservation.error"));
      } finally {
        if (active) setLoadingSpaces(false);
      }
    }
    void loadSpaces();
    return () => { active = false; };
  }, [initialSpaceId, t]);

  function onChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    if (name === "spaceId") {
      const selected = spaces.find((space) => space.id === value);
      setFormData((current) => ({ ...current, spaceId: value, spaceName: selected?.name || "" }));
      return;
    }
    setFormData((current) => ({ ...current, [name]: name === "guests" ? Number(value) : value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          budget: formData.budget ? Number(formData.budget) : undefined,
          servicesRequested: formData.servicesRequested.split(",").map((value) => value.trim()).filter(Boolean),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(t("reservation.error"));
      const trackingId = result.data?.trackingId;
      if (typeof trackingId !== "string" || !trackingId) throw new Error(t("reservation.error"));
      router.push(`/reservation/success?trackingId=${encodeURIComponent(trackingId)}`);
    } catch {
      setError(t("reservation.error"));
    } finally {
      setLoading(false);
    }
  }

  const categories = ["Professionnel", "Conférence", "Anniversaire", "Mariage", "Soirée", "Famille"];
  const fieldClass = "w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2"><span className="text-sm font-medium text-slate-700">{t("reservation.name")}</span><input name="customerName" value={formData.customerName} onChange={onChange} className={fieldClass} autoComplete="name" required /></label>
        <label className="space-y-2"><span className="text-sm font-medium text-slate-700">{t("reservation.email")}</span><input type="email" name="email" value={formData.email} onChange={onChange} className={fieldClass} autoComplete="email" required /></label>
        <label className="space-y-2"><span className="text-sm font-medium text-slate-700">{t("reservation.phone")}</span><input name="phone" value={formData.phone} onChange={onChange} className={fieldClass} autoComplete="tel" required /></label>
        <label className="space-y-2"><span className="text-sm font-medium text-slate-700">{t("reservation.company")}</span><input name="company" value={formData.company} onChange={onChange} className={fieldClass} /></label>
        <label className="space-y-2"><span className="text-sm font-medium text-slate-700">{t("reservation.type")}</span><select name="eventType" value={formData.eventType} onChange={onChange} className={fieldClass}>{categories.map((category) => <option key={category} value={category}>{translateCategory(locale, category)}</option>)}</select></label>
        <label className="space-y-2"><span className="text-sm font-medium text-slate-700">{t("reservation.space")}</span><select name="spaceId" value={formData.spaceId} onChange={onChange} className={fieldClass} required><option value="">{loadingSpaces ? t("admin.loading") : t("reservation.choose")}</option>{spaces.map((space) => <option key={space.id} value={space.id}>{localizeSpace(space, locale).name}</option>)}</select></label>
        <label className="space-y-2"><span className="text-sm font-medium text-slate-700">{t("reservation.date")}</span><input type="date" name="date" value={formData.date} onChange={onChange} className={fieldClass} required /></label>
        <label className="space-y-2"><span className="text-sm font-medium text-slate-700">{t("reservation.start")}</span><input type="time" name="startTime" value={formData.startTime} onChange={onChange} className={fieldClass} required /></label>
        <label className="space-y-2"><span className="text-sm font-medium text-slate-700">{t("reservation.end")}</span><input type="time" name="endTime" value={formData.endTime} onChange={onChange} className={fieldClass} required /></label>
        <label className="space-y-2"><span className="text-sm font-medium text-slate-700">{t("reservation.guests")}</span><input type="number" name="guests" min={1} value={formData.guests} onChange={onChange} className={fieldClass} required /></label>
        <label className="space-y-2"><span className="text-sm font-medium text-slate-700">{t("reservation.budget")}</span><input type="number" min={0} name="budget" value={formData.budget} onChange={onChange} className={fieldClass} /></label>
        <label className="space-y-2 md:col-span-2"><span className="text-sm font-medium text-slate-700">{t("reservation.services")}</span><input name="servicesRequested" value={formData.servicesRequested} onChange={onChange} placeholder={t("reservation.servicesHint")} className={fieldClass} /></label>
        <label className="space-y-2 md:col-span-2"><span className="text-sm font-medium text-slate-700">{t("reservation.message")}</span><textarea name="message" value={formData.message} onChange={onChange} rows={4} className={fieldClass} /></label>
      </div>
      {error ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      <div className="flex justify-end"><button type="submit" disabled={loading || loadingSpaces} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">{loading ? t("reservation.sending") : t("reservation.send")}</button></div>
    </form>
  );
}
