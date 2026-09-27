import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { passwordCredentials, users } from "@/lib/db/schema";
import {
  normalizeEmail,
  setSessionCookie,
  signSessionToken,
  verifyPassword,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

const GENERIC_ERROR = "Email or password is incorrect. Please try again.";

export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = (await request.json()) as { email?: unknown; password?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const emailRaw = body.email;
  const password = body.password;

  if (typeof emailRaw !== "string" || typeof password !== "string" || !password) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  const email = normalizeEmail(emailRaw);

  try {
    const db = getDb();
    const rows = await db
      .select({
        id: users.id,
        tokenVersion: users.tokenVersion,
        passwordHash: passwordCredentials.passwordHash,
      })
      .from(users)
      .innerJoin(passwordCredentials, eq(passwordCredentials.userId, users.id))
      .where(eq(users.email, email))
      .limit(1);

    const account = rows[0];

    // Never differentiate "no such account" from "wrong password" — same
    // generic message and status either way.
    if (!account) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    const passwordMatches = await verifyPassword(password, account.passwordHash);
    if (!passwordMatches) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    const token = await signSessionToken({
      sub: account.id,
      tokenVersion: account.tokenVersion,
    });
    await setSessionCookie(token);

    return NextResponse.json({ id: account.id, email });
  } catch (error) {
    console.error("POST /api/auth/login failed", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
