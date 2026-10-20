import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { NextResponse } from "next/server";

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
export const SESSION_COOKIE = "placeora_session";
export const SESSION_SECRET = process.env.SESSION_SECRET || "";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
}

export async function createSessionToken(email: string) {
  if (!SESSION_SECRET) throw new Error("SESSION_SECRET is not configured.");
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(SESSION_SECRET));
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSessionFromToken(token?: string) {
  if (!token || !SESSION_SECRET) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(SESSION_SECRET));
    return payload.email ? { email: String(payload.email) } : null;
  } catch {
    return null;
  }
}

export async function getAdminFromRequest(request: Request) {
  const token = request.headers.get("cookie")
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1);
  let decodedToken: string | undefined;
  try {
    decodedToken = token ? decodeURIComponent(token) : undefined;
  } catch {
    return null;
  }
  const session = await getSessionFromToken(decodedToken);
  return session?.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? session : null;
}
