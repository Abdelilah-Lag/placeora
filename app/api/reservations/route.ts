import { NextResponse } from "next/server";

import { initialReservations } from "@/lib/data";
import { getSpaceById } from "@/lib/spaces-store";
import { Reservation } from "@/lib/types";
import { reservationSchema } from "@/lib/validation";

function makeTrackingId() {
  return `PL-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = reservationSchema.parse(body);

    const space = await getSpaceById(payload.spaceId);
    if (!space || space.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: "L’espace sélectionné est introuvable." },
        { status: 400 },
      );
    }

    const reservation: Reservation = {
      id: `res-${Date.now()}`,
      spaceId: payload.spaceId,
      spaceName: space.name,
      customerName: payload.customerName,
      email: payload.email,
      phone: payload.phone,
      company: payload.company,
      eventType: payload.eventType,
      date: payload.date,
      startTime: payload.startTime,
      endTime: payload.endTime,
      guests: payload.guests,
      budget: payload.budget,
      message: payload.message,
      servicesRequested: payload.servicesRequested,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    initialReservations.unshift(reservation);

    return NextResponse.json({
      success: true,
      message: "Votre demande de réservation a bien été enregistrée.",
      data: {
        reservation,
        trackingId: makeTrackingId(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "La demande est invalide.",
      },
      { status: 400 },
    );
  }
}
