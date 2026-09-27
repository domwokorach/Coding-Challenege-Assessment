import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";

export const SESSION_COOKIE_NAME = "session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days
const BCRYPT_COST_FACTOR = 12;
const MIN_PASSWORD_LENGTH = 8;

function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Never happens in a properly configured environment — fail loudly
    // server-side only, never leak this detail to a client response.
    throw new Error("JWT_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  sub: string; // user id
  tokenVersion: number;
};

/** Sign a new session JWT for the given user/tokenVersion pair. */
export async function signSessionToken(
  payload: SessionPayload
): Promise<string> {
  return new SignJWT({ tokenVersion: payload.tokenVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getJwtSecretKey());
}

/**
 * Verify a session JWT's signature and expiry. Returns null (never throws)
 * on any failure — expired, tampered, malformed, or wrong secret all look
 * the same to the caller: "not authenticated."
 */
export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey(), {
      algorithms: ["HS256"],
    });
    if (typeof payload.sub !== "string") return null;
    if (typeof payload.tokenVersion !== "number") return null;
    return { sub: payload.sub, tokenVersion: payload.tokenVersion };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Resolves the authenticated user id from the request's session cookie —
 * verifying the JWT signature/expiry AND matching its tokenVersion claim
 * against the live `users.token_version` column, so a reset-password or
 * delete-account event immediately invalidates any older token even though
 * it hasn't technically expired yet.
 *
 * Returns null (never throws) for any failure — missing cookie, invalid or
 * expired JWT, stale tokenVersion, or user no longer existing. Callers
 * decide how to respond (401 JSON for API routes, redirect for pages).
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  try {
    const db = getDb();
    const rows = await db
      .select({ id: users.id, tokenVersion: users.tokenVersion })
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1);
    const user = rows[0];
    if (!user) return null;
    if (user.tokenVersion !== payload.tokenVersion) return null;
    return user.id;
  } catch (error) {
    console.error("getAuthenticatedUserId: database lookup failed", error);
    return null;
  }
}

/** Trim + lowercase an email address for storage/lookup consistency. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function isValidPassword(password: string): boolean {
  return typeof password === "string" && password.length >= MIN_PASSWORD_LENGTH;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST_FACTOR);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
