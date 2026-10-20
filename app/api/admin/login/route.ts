import { NextResponse } from "next/server";

import { ADMIN_EMAIL, SESSION_SECRET, createSessionToken, setSessionCookie, verifyPassword } from "@/lib/auth";
import { adminLoginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = adminLoginSchema.parse(body);

    const configuredPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    if (!ADMIN_EMAIL || !configuredPasswordHash || !SESSION_SECRET) {
      return NextResponse.json({
        success: false,
        error: "La connexion administrateur n’est pas configurée.",
      }, { status: 503 });
    }
    const valid = payload.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
      await verifyPassword(payload.password, configuredPasswordHash);

    if (!valid) {
      return NextResponse.json({
        success: false,
        error: "Identifiants invalides.",
      }, { status: 401 });
    }

    const token = await createSessionToken(payload.email);
    const response = NextResponse.json({
      success: true,
      message: "Connexion réussie.",
      data: { email: payload.email },
    });

    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error("Admin login failed.", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      {
        success: false,
        error: "Connexion impossible.",
      },
      { status: 500 },
    );
  }
}
