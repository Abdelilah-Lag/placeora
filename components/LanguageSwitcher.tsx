"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { Locale } from "@/lib/types";

const options: { value: Locale; labelKey: string }[] = [
  { value: "fr", labelKey: "language.fr" },
  { value: "en", labelKey: "language.en" },
  { value: "ar", labelKey: "language.ar" },
];

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <label className="inline-flex items-center gap-2 text-sm text-slate-600">
      <span className="sr-only">{t("language.label")}</span>
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        aria-label={t("language.label")}
        className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{t(option.labelKey)}</option>
        ))}
      </select>
    </label>
  );
}
