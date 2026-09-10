import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { and, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { passwordCredentials, passwordResetTokens, users } from "@/lib/schema";
import { hashPassword, isValidPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

const GENERIC_INVALID_MESSAGE = "This reset link is invalid or has expired.";

function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export async function POST(request: Request) {
  let body: { token?: unknown; password?: unknown };
  try {
    body = (await request.json()) as { token?: unknown; password?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const token = body.token;
  const password = body.password;

  if (typeof token !== "string" || !token) {
    return NextResponse.json({ error: GENERIC_INVALID_MESSAGE }, { status: 400 });
  }

  if (typeof password !== "string" || !isValidPassword(password)) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters long." },
      { status: 400 }
    );
  }

  try {
    const db = getDb();
    const tokenHash = sha256Hex(token);

    const rows = await db
      .select({
        id: passwordResetTokens.id,
        userId: passwordResetTokens.userId,
        expiresAt: passwordResetTokens.expiresAt,
      })
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          isNull(passwordResetTokens.usedAt)
        )
      )
      .limit(1);

    const resetToken = rows[0];

    if (!resetToken || resetToken.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: GENERIC_INVALID_MESSAGE }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const now = new Date();

    await db
      .update(passwordCredentials)
      .set({ passwordHash, updatedAt: now })
      .where(eq(passwordCredentials.userId, resetToken.userId));

    await db
      .update(passwordResetTokens)
      .set({ usedAt: now })
      .where(eq(passwordResetTokens.id, resetToken.id));

    // Invalidate every previously issued JWT for this user — this is the
    // "log out everywhere" step for a stateless JWT design. Incremented
    // atomically in SQL rather than read-then-write to avoid a race.
    await db
      .update(users)
      .set({
        tokenVersion: sql`${users.tokenVersion} + 1`,
        updatedAt: now,
      })
      .where(eq(users.id, resetToken.userId));

    return NextResponse.json({
      message: "Password reset successfully. Please log in.",
    });
  } catch (error) {
    console.error("POST /api/auth/reset-password failed", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

