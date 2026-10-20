import { ReservationPageContent } from "@/components/ReservationPageContent";

export default async function ReservationPage({
  searchParams,
}: {
  searchParams: Promise<{ spaceId?: string }>;
}) {
  const { spaceId = "" } = await searchParams;
  return <ReservationPageContent initialSpaceId={spaceId} />;
}
