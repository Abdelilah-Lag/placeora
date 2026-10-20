import { HomeContent } from "@/components/HomeContent";
import { getActiveSpaces } from "@/lib/spaces-store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return <HomeContent spaces={await getActiveSpaces()} />;
}
