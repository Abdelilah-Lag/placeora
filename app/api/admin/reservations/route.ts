import { NextResponse } from "next/server";

import { getAdminFromRequest } from "@/lib/auth";
import { initialReservations } from "@/lib/data";
import { reservationStatusUpdateSchema } from "@/lib/validation";

export async function GET(request: Request) {
  if (!(await getAdminFromRequest(request))) {
    return NextResponse.json({ success: false, error: "Authentification requise." }, { status: 401 });
  }
  return NextResponse.json({
    success: true,
    message: "Réservations récupérées.",
    data: initialReservations,
  });
}

export async function PATCH(request: Request) {
  if (!(await getAdminFromRequest(request))) {
    return NextResponse.json({ success: false, error: "Authentification requise." }, { status: 401 });
  }
  try {
    const body = await request.json();
    const payload = reservationStatusUpdateSchema.parse(body);

    const reservation = initialReservations.find((item) => item.id === payload.id);
    if (!reservation) {
      return NextResponse.json({ success: false, error: "Réservation introuvable." }, { status: 404 });
    }

    reservation.status = payload.status;
    reservation.updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      message: "Statut mis à jour.",
      data: reservation,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Impossible de modifier la réservation.",
      },
      { status: 400 },
    );
  }
}
