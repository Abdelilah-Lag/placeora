import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { LocaleProvider } from "@/components/LocaleProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Placeora",
  description: "Plateforme de réservation d'espaces événementiels premium.",
  openGraph: {
    title: "Placeora",
    description: "Trouvez l'espace idéal pour votre événement.",
    type: "website",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("placeora_locale")?.value;
  const validLocale = locale === "en" || locale === "ar" ? locale : "fr";

  return (
    <html lang={validLocale} dir={validLocale === "ar" ? "rtl" : "ltr"} data-scroll-behavior="smooth">
      <body className={`${inter.className} bg-stone-50 text-slate-900 antialiased`}>
        <LocaleProvider initialLocale={validLocale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
