import { notFound } from "next/navigation";
import { cookies } from "next/headers";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { SpaceDetailsContent } from "@/components/SpaceDetailsContent";
import { getSpaceById } from "@/lib/spaces-store";
import { localizeSpace } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

type PageProps = { params: Promise<{ id: string }> };

async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get("placeora_locale")?.value;
  return value === "en" || value === "ar" ? value : "fr";
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const space = await getSpaceById(id);
  if (!space || space.status !== "ACTIVE") return { title: "Placeora" };
  const content = localizeSpace(space, await getLocale());
  return { title: `${content.name} | Placeora`, description: `${content.description} - ${space.city}` };
}

export default async function SpaceDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const space = await getSpaceById(id);
  if (!space || space.status !== "ACTIVE") notFound();
  return <><Navbar /><SpaceDetailsContent space={space} /><Footer /></>;
}
