import { NextResponse } from "next/server";

import { getAdminFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getAdminFromRequest(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  return NextResponse.json({ success: true, data: session });
}
