import { EventsContent } from "@/components/EventsContent";

const allowedCategories = new Set(["Professionnel", "Conférence", "Anniversaire", "Mariage", "Soirée", "Famille"]);

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  return <EventsContent initialCategory={category && allowedCategories.has(category) ? category : "all"} />;
}
