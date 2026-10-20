"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { translate } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function isLocale(value: string | undefined): value is Locale {
  return value === "fr" || value === "en" || value === "ar";
}

export function LocaleProvider({ children, initialLocale }: { children: React.ReactNode; initialLocale: string }) {
  const [locale, setCurrentLocale] = useState<Locale>(isLocale(initialLocale) ? initialLocale : "fr");

  const setLocale = useCallback((nextLocale: Locale) => {
    setCurrentLocale(nextLocale);
    document.cookie = `placeora_locale=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    document.documentElement.lang = nextLocale;
    document.documentElement.dir = nextLocale === "ar" ? "rtl" : "ltr";
  }, []);

  const value = useMemo(
    () => ({ locale, setLocale, t: (key: string) => translate(locale, key) }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within LocaleProvider.");
  return context;
}
