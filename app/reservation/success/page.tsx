import { ReservationSuccessContent } from "@/components/ReservationSuccessContent";
import { notFound } from "next/navigation";

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ trackingId?: string }>;
}) {
  const { trackingId } = await searchParams;
  if (!trackingId) notFound();
  return <ReservationSuccessContent trackingId={trackingId} />;
}
