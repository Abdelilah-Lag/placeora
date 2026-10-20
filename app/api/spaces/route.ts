import { NextResponse } from "next/server";

import { getActiveSpaces } from "@/lib/spaces-store";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Espaces récupérés avec succès.",
    data: await getActiveSpaces(),
  });
}
