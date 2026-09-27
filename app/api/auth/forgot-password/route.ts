import { randomBytes, createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { passwordResetTokens, users } from "@/lib/db/schema";
import { normalizeEmail } from "@/lib/auth";

export const dynamic = "force-dynamic";

const GENERIC_MESSAGE =
  "If an account exists for this email address, a password reset link has been sent.";
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export async function POST(request: Request) {
  let body: { email?: unknown };
  try {
    body = (await request.json()) as { email?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const emailRaw = body.email;
  if (typeof emailRaw !== "string" || !emailRaw) {
    // Still return the generic message shape — no reason to leak
    // validation-vs-not-found distinctions on this endpoint.
    return NextResponse.json({ message: GENERIC_MESSAGE });
  }

  const email = normalizeEmail(emailRaw);

  try {
    const db = getDb();
    const rows = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const user = rows[0];

    if (user) {
      const rawToken = randomBytes(32).toString("hex");
      const tokenHash = sha256Hex(rawToken);
      const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

      await db.insert(passwordResetTokens).values({
        userId: user.id,
        tokenHash,
        expiresAt,
      });

      const origin = new URL(request.url).origin;
      const resetLink = `${origin}/reset-password?token=${rawToken}`;
      // TODO: send via email once Resend is configured
      console.log(`Password reset link for ${email}: ${resetLink}`);
    }

    // Same response regardless of whether the account exists — never leak
    // account existence through this endpoint.
    return NextResponse.json({ message: GENERIC_MESSAGE });
  } catch (error) {
    console.error("POST /api/auth/forgot-password failed", error);
    // Still return the generic success shape to avoid leaking internal
    // state through error responses on this endpoint.
    return NextResponse.json({ message: GENERIC_MESSAGE });
  }
}
